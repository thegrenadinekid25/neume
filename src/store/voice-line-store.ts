import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Note } from 'tonal';
import type { MelodicNote, VoicePart, VoicePart8, AnyVoicePart, CompositionMode, Accidental, VoiceLines4, VoiceLines8 } from '@/types';
import type { Chord } from '@/types/chord';
import type { VoiceCount } from '@/types/voicing';
import { DEFAULT_MELODIC_NOTE_VISUAL_STATE, DEFAULT_COMPOSITION_MODE } from '@/types/voice-line';
import { VOICE_RANGES, VOICE_RANGES_8, VOICE_ORDER, VOICE_ORDER_8 } from '@/data/voice-ranges';
import { analyzeVoiceLine } from '@/services/non-chord-tone-analyzer';

interface VoiceLineState {
  // 4-voice SATB lines (default)
  voiceLines: VoiceLines4;
  // 8-voice SSAATTBB lines
  voiceLines8: VoiceLines8;
  // Current voice count mode
  voiceCount: VoiceCount;
  compositionMode: CompositionMode;
  selectedNoteIds: string[];
  activeVoicePart: AnyVoicePart | null;
  hoveredNoteId: string | null;
  playingNoteIds: string[];
  isInitialized: boolean;
  // History for undo/redo (4-voice only for now)
  _history: Array<VoiceLines4>;
  _historyIndex: number;
}

function createDefaultVoiceLines(): VoiceLines4 {
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
  return Object.fromEntries(entries) as VoiceLines4;
}

function createDefaultVoiceLines8(): VoiceLines8 {
  const parts: VoicePart8[] = [
    'sopranoI', 'sopranoII',
    'altoI', 'altoII',
    'tenorI', 'tenorII',
    'bassI', 'bassII',
  ];
  const entries = parts.map(part => [part, {
    id: uuidv4(),
    voicePart: part,
    notes: [] as MelodicNote[],
    enabled: true,
    muted: false,
    solo: false,
    color: VOICE_RANGES_8[part].color,
    opacity: 1,
    collapsed: false,
  }] as const);
  return Object.fromEntries(entries) as VoiceLines8;
}

const MAX_HISTORY_SIZE = 50;

// Deep clone voice lines for history (4-voice)
function cloneVoiceLines(voiceLines: VoiceLines4): VoiceLines4 {
  const cloned: VoiceLines4 = {} as VoiceLines4;
  for (const part of Object.keys(voiceLines) as VoicePart[]) {
    cloned[part] = {
      ...voiceLines[part],
      notes: voiceLines[part].notes.map(note => ({ ...note, visualState: { ...note.visualState }, analysis: { ...note.analysis } })),
    };
  }
  return cloned;
}

// Deep clone voice lines for 8-voice (exported for future 8-voice editing)
export function cloneVoiceLines8(voiceLines: VoiceLines8): VoiceLines8 {
  const cloned: VoiceLines8 = {} as VoiceLines8;
  for (const part of Object.keys(voiceLines) as VoicePart8[]) {
    cloned[part] = {
      ...voiceLines[part],
      notes: voiceLines[part].notes.map(note => ({ ...note, visualState: { ...note.visualState }, analysis: { ...note.analysis } })),
    };
  }
  return cloned;
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
  cycleNoteState: (part: VoicePart, noteId: string) => void;
  setActiveVoice: (part: AnyVoicePart | null) => void;
  toggleVoiceEnabled: (part: VoicePart) => void;
  toggleVoiceMuted: (part: VoicePart) => void;
  setVoiceEnabled: (part: VoicePart, enabled: boolean) => void;
  enableSingleVoice: (part: VoicePart) => void;
  setAllVoicesEnabled: (enabled: boolean) => void;
  setCompositionMode: (mode: CompositionMode) => void;
  setPlayingNotes: (noteIds: string[]) => void;
  setNoteHovered: (noteId: string | null) => void;
  // Voice count actions
  setVoiceCount: (count: VoiceCount) => void;
  getActiveVoiceParts: () => AnyVoicePart[];
  // Analysis actions
  analyzeAllNotes: (chords: Chord[]) => void;
  resetNotesToChord: (chord: Chord) => void;
  getNotesAtBeat: (beat: number) => { part: VoicePart; note: MelodicNote }[];
  // History actions
  undo: () => boolean;
  redo: () => boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;
}>(
  (set, get) => ({
    voiceLines: createDefaultVoiceLines(),
    voiceLines8: createDefaultVoiceLines8(),
    voiceCount: 4,
    compositionMode: DEFAULT_COMPOSITION_MODE,
    selectedNoteIds: [],
    activeVoicePart: null,
    hoveredNoteId: null,
    playingNoteIds: [],
    isInitialized: false,
    _history: [],
    _historyIndex: -1,

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
            // voices is a Voices object with soprano, alto, tenor, bass as string pitches
            const pitch = chord.voices?.[part];
            if (pitch && typeof pitch === 'string') {
              const midiNumber = Note.midi(pitch);

              if (midiNumber !== null) {
                const note: MelodicNote = {
                  id: uuidv4(),
                  pitch,
                  midi: midiNumber,
                  startBeat: chord.startBeat,
                  duration,
                  accidental: null,
                  isRest: false,
                  visualState: { ...DEFAULT_MELODIC_NOTE_VISUAL_STATE },
                  text: null,
                  analysis: {
                    isChordTone: false,
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
      // Push current state to history before modification
      const state = get();
      const snapshot = cloneVoiceLines(state.voiceLines);
      const newHistory = state._history.slice(0, state._historyIndex + 1);
      newHistory.push(snapshot);
      if (newHistory.length > MAX_HISTORY_SIZE) newHistory.shift();

      const noteId = uuidv4();
      set({
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
        _history: newHistory,
        _historyIndex: newHistory.length - 1,
      });
      return noteId;
    },

    updateNote: (part: VoicePart, noteId: string, updates: Partial<MelodicNote>) => {
      // Push current state to history before modification
      const state = get();
      const snapshot = cloneVoiceLines(state.voiceLines);
      const newHistory = state._history.slice(0, state._historyIndex + 1);
      newHistory.push(snapshot);
      if (newHistory.length > MAX_HISTORY_SIZE) newHistory.shift();

      set({
        voiceLines: {
          ...state.voiceLines,
          [part]: {
            ...state.voiceLines[part],
            notes: state.voiceLines[part].notes.map((note) =>
              note.id === noteId ? { ...note, ...updates } : note
            ),
          },
        },
        _history: newHistory,
        _historyIndex: newHistory.length - 1,
      });
    },

    deleteNote: (part: VoicePart, noteId: string) => {
      // Push current state to history before modification
      const state = get();
      const snapshot = cloneVoiceLines(state.voiceLines);
      const newHistory = state._history.slice(0, state._historyIndex + 1);
      newHistory.push(snapshot);
      if (newHistory.length > MAX_HISTORY_SIZE) newHistory.shift();

      set({
        voiceLines: {
          ...state.voiceLines,
          [part]: {
            ...state.voiceLines[part],
            notes: state.voiceLines[part].notes.filter((note) => note.id !== noteId),
          },
        },
        selectedNoteIds: state.selectedNoteIds.filter((id) => id !== noteId),
        _history: newHistory,
        _historyIndex: newHistory.length - 1,
      });
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
      // Push current state to history before modification
      const state = get();
      const snapshot = cloneVoiceLines(state.voiceLines);
      const newHistory = state._history.slice(0, state._historyIndex + 1);
      newHistory.push(snapshot);
      if (newHistory.length > MAX_HISTORY_SIZE) newHistory.shift();

      const accidentals: (Accidental | null)[] = [
        null,
        'sharp',
        'flat',
        'doubleSharp',
        'doubleFlat',
      ];

      set({
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
        _history: newHistory,
        _historyIndex: newHistory.length - 1,
      });
    },

    // Cycle through: natural → sharp → flat → rest → natural
    cycleNoteState: (part: VoicePart, noteId: string) => {
      // Push current state to history before modification
      const state = get();
      const snapshot = cloneVoiceLines(state.voiceLines);
      const newHistory = state._history.slice(0, state._historyIndex + 1);
      newHistory.push(snapshot);
      if (newHistory.length > MAX_HISTORY_SIZE) newHistory.shift();

      set({
        voiceLines: {
          ...state.voiceLines,
          [part]: {
            ...state.voiceLines[part],
            notes: state.voiceLines[part].notes.map((note) => {
              if (note.id !== noteId) return note;

              // If it's a rest, go back to natural
              if (note.isRest) {
                return { ...note, isRest: false, accidental: null };
              }

              // Cycle through: natural → sharp → flat → rest
              if (note.accidental === null) {
                return { ...note, accidental: 'sharp' as Accidental };
              } else if (note.accidental === 'sharp') {
                return { ...note, accidental: 'flat' as Accidental };
              } else if (note.accidental === 'flat') {
                return { ...note, isRest: true, accidental: null };
              }

              // Fallback: natural
              return { ...note, accidental: null };
            }),
          },
        },
        _history: newHistory,
        _historyIndex: newHistory.length - 1,
      });
    },

    setActiveVoice: (part: AnyVoicePart | null) => {
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

    setVoiceEnabled: (part: VoicePart, enabled: boolean) => {
      set((state) => ({
        voiceLines: {
          ...state.voiceLines,
          [part]: {
            ...state.voiceLines[part],
            enabled,
          },
        },
      }));
    },

    enableSingleVoice: (part: VoicePart) => {
      set((state) => {
        const parts: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];
        const updatedVoiceLines = { ...state.voiceLines };
        parts.forEach(p => {
          updatedVoiceLines[p] = {
            ...updatedVoiceLines[p],
            enabled: p === part,
          };
        });
        return { voiceLines: updatedVoiceLines };
      });
    },

    setAllVoicesEnabled: (enabled: boolean) => {
      set((state) => {
        const parts: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];
        const updatedVoiceLines = { ...state.voiceLines };
        parts.forEach(p => {
          updatedVoiceLines[p] = {
            ...updatedVoiceLines[p],
            enabled,
          };
        });
        return { voiceLines: updatedVoiceLines };
      });
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

    // Analysis actions
    analyzeAllNotes: (chords: Chord[]) => {
      const state = get();
      const parts: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];
      const updatedVoiceLines = { ...state.voiceLines };

      parts.forEach(part => {
        const voiceLine = state.voiceLines[part];
        if (voiceLine.notes.length > 0) {
          const analyzedNotes = analyzeVoiceLine(voiceLine.notes, chords);
          updatedVoiceLines[part] = {
            ...voiceLine,
            notes: analyzedNotes,
          };
        }
      });

      set({ voiceLines: updatedVoiceLines });
    },

    resetNotesToChord: (chord: Chord) => {
      // Push current state to history before modification
      const state = get();
      const snapshot = cloneVoiceLines(state.voiceLines);
      const newHistory = state._history.slice(0, state._historyIndex + 1);
      newHistory.push(snapshot);
      if (newHistory.length > MAX_HISTORY_SIZE) newHistory.shift();

      const parts: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];
      const updatedVoiceLines = { ...state.voiceLines };

      parts.forEach(part => {
        const voiceLine = state.voiceLines[part];
        const pitch = chord.voices?.[part];

        if (pitch && typeof pitch === 'string') {
          const midiNumber = Note.midi(pitch);
          if (midiNumber !== null) {
            // Find notes that overlap with this chord's beat range
            const chordEndBeat = chord.startBeat + chord.duration;
            const notesInRange = voiceLine.notes.filter(
              n => n.startBeat >= chord.startBeat && n.startBeat < chordEndBeat
            );
            const notesOutsideRange = voiceLine.notes.filter(
              n => n.startBeat < chord.startBeat || n.startBeat >= chordEndBeat
            );

            // Create a single note for the chord duration (or update existing)
            const resetNote: MelodicNote = {
              id: notesInRange.length > 0 ? notesInRange[0].id : uuidv4(),
              pitch,
              midi: midiNumber,
              startBeat: chord.startBeat,
              duration: chord.duration,
              accidental: null,
              isRest: false,
              visualState: { ...DEFAULT_MELODIC_NOTE_VISUAL_STATE },
              text: null,
              analysis: {
                isChordTone: false,
                nonChordToneType: null,
                scaleDegree: null,
                interval: null,
                tendency: null,
              },
            };

            updatedVoiceLines[part] = {
              ...voiceLine,
              notes: [...notesOutsideRange, resetNote].sort((a, b) => a.startBeat - b.startBeat),
            };
          }
        }
      });

      set({
        voiceLines: updatedVoiceLines,
        _history: newHistory,
        _historyIndex: newHistory.length - 1,
      });
    },

    getNotesAtBeat: (beat: number) => {
      const state = get();
      const parts: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];
      const result: { part: VoicePart; note: MelodicNote }[] = [];

      parts.forEach(part => {
        const voiceLine = state.voiceLines[part];
        const note = voiceLine.notes.find(
          n => beat >= n.startBeat && beat < n.startBeat + n.duration
        );
        if (note) {
          result.push({ part, note });
        }
      });

      return result;
    },

    // History actions
    undo: () => {
      const state = get();
      if (state._historyIndex <= 0) return false;

      const newIndex = state._historyIndex - 1;
      const previousState = state._history[newIndex];

      if (previousState) {
        set({
          voiceLines: cloneVoiceLines(previousState),
          _historyIndex: newIndex,
        });
        return true;
      }
      return false;
    },

    redo: () => {
      const state = get();
      if (state._historyIndex >= state._history.length - 1) return false;

      const newIndex = state._historyIndex + 1;
      const nextState = state._history[newIndex];

      if (nextState) {
        set({
          voiceLines: cloneVoiceLines(nextState),
          _historyIndex: newIndex,
        });
        return true;
      }
      return false;
    },

    canUndo: () => {
      const state = get();
      return state._historyIndex > 0;
    },

    canRedo: () => {
      const state = get();
      return state._historyIndex < state._history.length - 1;
    },

    // Voice count actions
    setVoiceCount: (count: VoiceCount) => {
      set({ voiceCount: count });
    },

    getActiveVoiceParts: () => {
      const state = get();
      if (state.voiceCount === 8) {
        return VOICE_ORDER_8;
      }
      return VOICE_ORDER;
    },
  })
);
