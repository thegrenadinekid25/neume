import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Note } from 'tonal';
import type { VoiceLine, MelodicNote, VoicePart, CompositionMode, Accidental } from '@/types';
import type { Chord } from '@/types/chord';
import { DEFAULT_MELODIC_NOTE_VISUAL_STATE, DEFAULT_COMPOSITION_MODE } from '@/types/voice-line';
import { VOICE_RANGES } from '@/data/voice-ranges';

interface VoiceLineState {
  voiceLines: Record<VoicePart, VoiceLine>;
  compositionMode: CompositionMode;
  selectedNoteIds: string[];
  activeVoicePart: VoicePart | null;
  hoveredNoteId: string | null;
  playingNoteIds: string[];
  isInitialized: boolean;
}

function createDefaultVoiceLines(): Record<VoicePart, VoiceLine> {
  const parts: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];
  const entries = parts.map(part => [part, {
    id: uuidv4(),
    voicePart: part,
    notes: [] as MelodicNote[],
    enabled: true,
    muted: false,
    solo: false,
    color: VOICE_RANGES[part].color,
    opacity: 1,
    collapsed: false,
  }] as const);
  return Object.fromEntries(entries) as Record<VoicePart, VoiceLine>;
}

export const useVoiceLineStore = create<VoiceLineState & {
  // Actions
  initializeFromChords: (chords: Chord[]) => void;
  addNote: (part: VoicePart, noteData: Omit<MelodicNote, 'id'>) => string;
  updateNote: (part: VoicePart, noteId: string, updates: Partial<MelodicNote>) => void;
  deleteNote: (part: VoicePart, noteId: string) => void;
  selectNote: (noteId: string, multiSelect: boolean) => void;
  clearSelection: () => void;
  cycleAccidental: (part: VoicePart, noteId: string) => void;
  setActiveVoice: (part: VoicePart | null) => void;
  toggleVoiceEnabled: (part: VoicePart) => void;
  toggleVoiceMuted: (part: VoicePart) => void;
  setCompositionMode: (mode: CompositionMode) => void;
  setPlayingNotes: (noteIds: string[]) => void;
  setNoteHovered: (noteId: string | null) => void;
}>(
  (set) => ({
    voiceLines: createDefaultVoiceLines(),
    compositionMode: DEFAULT_COMPOSITION_MODE,
    selectedNoteIds: [],
    activeVoicePart: null,
    hoveredNoteId: null,
    playingNoteIds: [],
    isInitialized: false,

    initializeFromChords: (chords: Chord[]) => {
      set(() => {
        const newVoiceLines = createDefaultVoiceLines();
        const sortedChords = [...chords].sort((a, b) => a.startBeat - b.startBeat);

        // Process each chord
        sortedChords.forEach((chord, index) => {
          const nextChord = sortedChords[index + 1];
          const duration = nextChord ? nextChord.startBeat - chord.startBeat : 4;

          // For each voice part, create a note if the chord has voices
          (Object.keys(newVoiceLines) as VoicePart[]).forEach((part) => {
            const voiceNotes = chord.voices?.[part];
            if (voiceNotes && voiceNotes.length > 0) {
              // Use the first pitch from the voice's notes
              const pitch = voiceNotes[0];
              const midiNumber = Note.midi(pitch);

              if (midiNumber !== null) {
                const note: MelodicNote = {
                  id: uuidv4(),
                  pitch,
                  midi: midiNumber,
                  startBeat: chord.startBeat,
                  duration,
                  accidental: null,
                  visualState: { ...DEFAULT_MELODIC_NOTE_VISUAL_STATE },
                  text: null,
                  analysis: {
                    isChordTone: true,
                    nonChordToneType: null,
                    scaleDegree: null,
                    interval: null,
                    tendency: null,
                  },
                };
                newVoiceLines[part].notes.push(note);
              }
            }
          });
        });

        return {
          voiceLines: newVoiceLines,
          isInitialized: true,
        };
      });
    },

    addNote: (part: VoicePart, noteData: Omit<MelodicNote, 'id'>) => {
      const noteId = uuidv4();
      set((state) => ({
        voiceLines: {
          ...state.voiceLines,
          [part]: {
            ...state.voiceLines[part],
            notes: [
              ...state.voiceLines[part].notes,
              { ...noteData, id: noteId },
            ],
          },
        },
      }));
      return noteId;
    },

    updateNote: (part: VoicePart, noteId: string, updates: Partial<MelodicNote>) => {
      set((state) => ({
        voiceLines: {
          ...state.voiceLines,
          [part]: {
            ...state.voiceLines[part],
            notes: state.voiceLines[part].notes.map((note) =>
              note.id === noteId ? { ...note, ...updates } : note
            ),
          },
        },
      }));
    },

    deleteNote: (part: VoicePart, noteId: string) => {
      set((state) => ({
        voiceLines: {
          ...state.voiceLines,
          [part]: {
            ...state.voiceLines[part],
            notes: state.voiceLines[part].notes.filter((note) => note.id !== noteId),
          },
        },
        selectedNoteIds: state.selectedNoteIds.filter((id) => id !== noteId),
      }));
    },

    selectNote: (noteId: string, multiSelect: boolean) => {
      set((state) => {
        if (multiSelect) {
          const isSelected = state.selectedNoteIds.includes(noteId);
          return {
            selectedNoteIds: isSelected
              ? state.selectedNoteIds.filter((id) => id !== noteId)
              : [...state.selectedNoteIds, noteId],
          };
        } else {
          return {
            selectedNoteIds: [noteId],
          };
        }
      });
    },

    clearSelection: () => {
      set({ selectedNoteIds: [] });
    },

    cycleAccidental: (part: VoicePart, noteId: string) => {
      set((state) => {
        const accidentals: (Accidental | null)[] = [
          null,
          'sharp',
          'flat',
          'doubleSharp',
          'doubleFlat',
        ];

        return {
          voiceLines: {
            ...state.voiceLines,
            [part]: {
              ...state.voiceLines[part],
              notes: state.voiceLines[part].notes.map((note) => {
                if (note.id === noteId) {
                  const currentIndex = accidentals.indexOf(note.accidental);
                  const nextIndex = (currentIndex + 1) % accidentals.length;
                  return {
                    ...note,
                    accidental: accidentals[nextIndex],
                  };
                }
                return note;
              }),
            },
          },
        };
      });
    },

    setActiveVoice: (part: VoicePart | null) => {
      set({ activeVoicePart: part });
    },

    toggleVoiceEnabled: (part: VoicePart) => {
      set((state) => ({
        voiceLines: {
          ...state.voiceLines,
          [part]: {
            ...state.voiceLines[part],
            enabled: !state.voiceLines[part].enabled,
          },
        },
      }));
    },

    toggleVoiceMuted: (part: VoicePart) => {
      set((state) => ({
        voiceLines: {
          ...state.voiceLines,
          [part]: {
            ...state.voiceLines[part],
            muted: !state.voiceLines[part].muted,
          },
        },
      }));
    },

    setCompositionMode: (mode: CompositionMode) => {
      set({ compositionMode: mode });
    },

    setPlayingNotes: (noteIds: string[]) => {
      set({ playingNoteIds: noteIds });
    },

    setNoteHovered: (noteId: string | null) => {
      set({ hoveredNoteId: noteId });
    },
  })
);
