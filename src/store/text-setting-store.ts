/**
 * Text Setting Store
 *
 * Manages text setting state for all voice lines.
 */

import { create } from 'zustand';
import type { VoicePart } from '@/types/voice-line';
import type {
  Syllable,
  SyllableAssignment,
  TextSettingMode,
  VoiceTextSetting,
} from '@/types/text-setting';
import { DEFAULT_TEXT_SETTING } from '@/types/text-setting';
import { parseSyllables, isMelismaMarker } from '@/services/syllable-parser';

interface TextSettingState {
  voiceSettings: Record<VoicePart, VoiceTextSetting>;
  isTextSettingActive: boolean;
  activeTextSettingVoice: VoicePart | null;
  editingSyllableNoteId: string | null;
}

interface TextSettingActions {
  setTextSettingActive: (active: boolean) => void;
  setActiveTextSettingVoice: (voice: VoicePart | null) => void;
  setInputText: (voice: VoicePart, text: string) => void;
  clearInputText: (voice: VoicePart) => void;
  setTextSettingMode: (voice: VoicePart, mode: TextSettingMode) => void;
  setAutoAssign: (voice: VoicePart, autoAssign: boolean) => void;
  assignSyllablesToNotes: (
    voice: VoicePart,
    noteIds: string[]
  ) => SyllableAssignment[];
  updateSyllableAssignment: (
    voice: VoicePart,
    noteId: string,
    text: string
  ) => void;
  clearAssignments: (voice: VoicePart) => void;
  toggleMelisma: (voice: VoicePart, noteId: string) => void;
  startEditingSyllable: (noteId: string) => void;
  stopEditingSyllable: () => void;
  getSyllablesForVoice: (voice: VoicePart) => Syllable[];
  getAssignmentsForVoice: (voice: VoicePart) => SyllableAssignment[];
  getAssignmentForNote: (
    voice: VoicePart,
    noteId: string
  ) => SyllableAssignment | null;
  clearAllTextSettings: () => void;
}

function createDefaultVoiceSettings(): Record<VoicePart, VoiceTextSetting> {
  const parts: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];
  return Object.fromEntries(
    parts.map((part) => [part, { ...DEFAULT_TEXT_SETTING, voicePart: part }])
  ) as Record<VoicePart, VoiceTextSetting>;
}

export const useTextSettingStore = create<TextSettingState & TextSettingActions>(
  (set, get) => ({
    voiceSettings: createDefaultVoiceSettings(),
    isTextSettingActive: false,
    activeTextSettingVoice: null,
    editingSyllableNoteId: null,

    setTextSettingActive: (active) => {
      set({ isTextSettingActive: active });
    },

    setActiveTextSettingVoice: (voice) => {
      set({ activeTextSettingVoice: voice });
    },

    setInputText: (voice, text) => {
      const parseResult = parseSyllables(text);

      set((state) => ({
        voiceSettings: {
          ...state.voiceSettings,
          [voice]: {
            ...state.voiceSettings[voice],
            inputText: text,
            syllables: parseResult.syllables,
          },
        },
      }));
    },

    clearInputText: (voice) => {
      set((state) => ({
        voiceSettings: {
          ...state.voiceSettings,
          [voice]: {
            ...state.voiceSettings[voice],
            inputText: '',
            syllables: [],
            assignments: [],
          },
        },
      }));
    },

    setTextSettingMode: (voice, mode) => {
      set((state) => ({
        voiceSettings: {
          ...state.voiceSettings,
          [voice]: {
            ...state.voiceSettings[voice],
            mode,
          },
        },
      }));
    },

    setAutoAssign: (voice, autoAssign) => {
      set((state) => ({
        voiceSettings: {
          ...state.voiceSettings,
          [voice]: {
            ...state.voiceSettings[voice],
            autoAssign,
          },
        },
      }));
    },

    assignSyllablesToNotes: (voice, noteIds) => {
      const state = get();
      const settings = state.voiceSettings[voice];
      const { syllables, mode } = settings;

      if (syllables.length === 0 || noteIds.length === 0) {
        return [];
      }

      const assignments: SyllableAssignment[] = [];
      let syllableIdx = 0;

      for (let noteIdx = 0; noteIdx < noteIds.length; noteIdx++) {
        const noteId = noteIds[noteIdx];

        if (syllableIdx < syllables.length) {
          const syllable = syllables[syllableIdx];

          if (isMelismaMarker(syllable.text)) {
            const prevAssignment = assignments[assignments.length - 1];
            assignments.push({
              noteId,
              text: prevAssignment?.text || '',
              isMelisma: true,
              syllableIndex: syllableIdx,
            });
            syllableIdx++;
          } else {
            assignments.push({
              noteId,
              text: syllable.text,
              isMelisma: false,
              syllableIndex: syllableIdx,
            });
            syllableIdx++;
          }
        } else {
          const prevAssignment = assignments[assignments.length - 1];
          if (prevAssignment && mode === 'melismatic') {
            assignments.push({
              noteId,
              text: prevAssignment.text,
              isMelisma: true,
              syllableIndex: prevAssignment.syllableIndex,
            });
          } else {
            assignments.push({
              noteId,
              text: '',
              isMelisma: false,
              syllableIndex: -1,
            });
          }
        }
      }

      set((state) => ({
        voiceSettings: {
          ...state.voiceSettings,
          [voice]: {
            ...state.voiceSettings[voice],
            assignments,
          },
        },
      }));

      return assignments;
    },

    updateSyllableAssignment: (voice, noteId, text) => {
      set((state) => {
        const currentAssignments = state.voiceSettings[voice].assignments;
        const existingIdx = currentAssignments.findIndex(
          (a) => a.noteId === noteId
        );

        let newAssignments: SyllableAssignment[];

        if (existingIdx >= 0) {
          newAssignments = currentAssignments.map((a, idx) =>
            idx === existingIdx ? { ...a, text, isMelisma: false } : a
          );
        } else {
          newAssignments = [
            ...currentAssignments,
            {
              noteId,
              text,
              isMelisma: false,
              syllableIndex: currentAssignments.length,
            },
          ];
        }

        return {
          voiceSettings: {
            ...state.voiceSettings,
            [voice]: {
              ...state.voiceSettings[voice],
              assignments: newAssignments,
            },
          },
        };
      });
    },

    clearAssignments: (voice) => {
      set((state) => ({
        voiceSettings: {
          ...state.voiceSettings,
          [voice]: {
            ...state.voiceSettings[voice],
            assignments: [],
          },
        },
      }));
    },

    toggleMelisma: (voice, noteId) => {
      set((state) => {
        const assignments = state.voiceSettings[voice].assignments;
        const idx = assignments.findIndex((a) => a.noteId === noteId);

        if (idx <= 0) return state;

        const prevAssignment = assignments[idx - 1];
        const currentAssignment = assignments[idx];

        const newAssignments = [...assignments];

        if (currentAssignment.isMelisma) {
          newAssignments[idx] = {
            ...currentAssignment,
            text: '',
            isMelisma: false,
          };
        } else {
          newAssignments[idx] = {
            ...currentAssignment,
            text: prevAssignment.text,
            isMelisma: true,
          };
        }

        return {
          voiceSettings: {
            ...state.voiceSettings,
            [voice]: {
              ...state.voiceSettings[voice],
              assignments: newAssignments,
            },
          },
        };
      });
    },

    startEditingSyllable: (noteId) => {
      set({ editingSyllableNoteId: noteId });
    },

    stopEditingSyllable: () => {
      set({ editingSyllableNoteId: null });
    },

    getSyllablesForVoice: (voice) => {
      return get().voiceSettings[voice].syllables;
    },

    getAssignmentsForVoice: (voice) => {
      return get().voiceSettings[voice].assignments;
    },

    getAssignmentForNote: (voice, noteId) => {
      const assignments = get().voiceSettings[voice].assignments;
      return assignments.find((a) => a.noteId === noteId) || null;
    },

    clearAllTextSettings: () => {
      set({
        voiceSettings: createDefaultVoiceSettings(),
        isTextSettingActive: false,
        activeTextSettingVoice: null,
        editingSyllableNoteId: null,
      });
    },
  })
);
