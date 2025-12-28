import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Chord, MusicalKey, Mode, ScaleDegree, ChordQuality } from '@/types';
import type { PhraseBoundary } from '@/types/progression';
import type { NecklaceSettings, VoicePart } from '@/types/necklace';
import { CANVAS_CONFIG, DEFAULT_CHORD_SIZE } from '@/utils/constants';
import { DEFAULT_NECKLACE_SETTINGS } from '@/types/necklace';
import { useExpertModeStore } from './expert-mode-store';
import { getChordIdentifier } from '@/utils/chord-helpers';

interface CanvasState {
  // Chords
  chords: Chord[];

  // Phrase boundaries for visual grouping
  phrases: PhraseBoundary[];

  // Chord annotations (chordId -> note)
  annotations: Record<string, string>;

  // Selection
  selectedChordIds: string[];

  // Current key/mode
  currentKey: MusicalKey;
  currentMode: Mode;

  // Tempo
  tempo: number;

  // View settings
  zoom: number;
  showConnectionLines: boolean;

  // Playback
  isPlaying: boolean;
  playheadPosition: number;

  // Audio
  masterVolume: number;
  audioReady: boolean;

  // Necklace visualization
  necklaceSettings: NecklaceSettings;

  // Voice lines layer
  showVoiceLines: boolean;

  // Actions - Chords
  addChord: (chord: Partial<Chord> & { scaleDegree: ScaleDegree; position: { x: number; y: number } }) => Chord;
  removeChord: (id: string) => void;
  removeChords: (ids: string[]) => void;
  updateChord: (id: string, updates: Partial<Chord>) => void;
  updateChordPosition: (id: string, x: number, y: number) => void;
  clearChords: () => void;

  // Actions - Selection
  selectChord: (id: string) => void;
  selectChords: (ids: string[]) => void;
  deselectChord: (id: string) => void;
  toggleChordSelection: (id: string) => void;
  selectAll: () => void;
  selectRange: (fromId: string, toId: string) => void;
  clearSelection: () => void;

  // Actions - View
  setZoom: (zoom: number) => void;
  setCurrentKey: (key: MusicalKey) => void;
  setCurrentMode: (mode: Mode) => void;
  setTempo: (tempo: number) => void;
  toggleConnectionLines: () => void;

  // Actions - Load analyzed progression
  loadAnalyzedProgression: (options: {
    chords: Chord[];
    phrases?: PhraseBoundary[];
    key: MusicalKey;
    mode: Mode;
    tempo: number;
  }) => void;

  // Actions - Clear phrases
  clearPhrases: () => void;

  // Actions - Annotations
  setAnnotation: (chordId: string, note: string) => void;
  removeAnnotation: (chordId: string) => void;
  clearAnnotations: () => void;

  // Actions - Playback
  setIsPlaying: (isPlaying: boolean) => void;
  setPlayheadPosition: (position: number) => void;

  // Actions - Audio
  setMasterVolume: (volume: number) => void;
  setAudioReady: (ready: boolean) => void;

  // Actions - Necklace
  setNecklaceVisible: (visible: boolean) => void;
  toggleVoiceNecklace: (voice: VoicePart) => void;
  setVoiceNecklaceColor: (voice: VoicePart, color: string) => void;
  setVoiceNecklaceOpacity: (voice: VoicePart, opacity: number) => void;
  resetNecklaceSettings: () => void;

  // Actions - Voice Lines
  setShowVoiceLines: (show: boolean) => void;
  toggleVoiceLines: () => void;
}

// Helper to determine chord quality from scale degree and mode
function getDefaultQuality(scaleDegree: ScaleDegree, mode: Mode): ChordQuality {
  if (mode === 'major') {
    switch (scaleDegree) {
      case 1: case 4: case 5: return 'major';
      case 2: case 3: case 6: return 'minor';
      case 7: return 'diminished';
      default: return 'major';
    }
  } else {
    switch (scaleDegree) {
      case 1: case 4: return 'minor';
      case 3: case 6: case 7: return 'major';
      case 2: return 'diminished';
      case 5: return 'minor'; // Natural minor; could be major for harmonic minor
      default: return 'minor';
    }
  }
}

// Snap x position to nearest beat
function snapToBeat(x: number, zoom: number): number {
  const beatWidth = CANVAS_CONFIG.GRID_BEAT_WIDTH * zoom;
  return Math.round(x / beatWidth) * beatWidth;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  // Initial state
  chords: [],
  phrases: [],
  annotations: {},
  selectedChordIds: [],
  currentKey: 'C',
  currentMode: 'major',
  tempo: 120,
  zoom: 1.0,
  showConnectionLines: true,
  isPlaying: false,
  playheadPosition: 0,
  masterVolume: 0.7,
  audioReady: false,
  necklaceSettings: DEFAULT_NECKLACE_SETTINGS,
  showVoiceLines: false,

  // Chord actions
  addChord: (chordInput) => {
    const { currentKey, currentMode, zoom } = get();
    const snappedX = snapToBeat(chordInput.position.x, zoom);
    const startBeat = Math.round(snappedX / (CANVAS_CONFIG.GRID_BEAT_WIDTH * zoom));

    const newChord: Chord = {
      id: uuidv4(),
      scaleDegree: chordInput.scaleDegree,
      quality: chordInput.quality || getDefaultQuality(chordInput.scaleDegree, currentMode),
      extensions: chordInput.extensions || {},
      key: currentKey,
      mode: currentMode,
      isChromatic: chordInput.isChromatic || false,
      voices: chordInput.voices || { soprano: 'C4', alto: 'G3', tenor: 'E3', bass: 'C3' },
      startBeat,
      duration: chordInput.duration || 4,
      position: { x: snappedX, y: chordInput.position.y },
      size: chordInput.size || DEFAULT_CHORD_SIZE,
      selected: false,
      playing: false,
      source: chordInput.source || 'user',
      createdAt: new Date().toISOString(),
    };

    set((state) => ({ chords: [...state.chords, newChord] }));

    // Track chord usage for Expert Mode
    const chordId = getChordIdentifier({
      scaleDegree: newChord.scaleDegree,
      quality: newChord.quality,
      extensions: newChord.extensions,
    });
    useExpertModeStore.getState().trackChordUsed(chordId);

    return newChord;
  },

  removeChord: (id) => {
    set((state) => {
      const newAnnotations = { ...state.annotations };
      delete newAnnotations[id];
      return {
        chords: state.chords.filter((c) => c.id !== id),
        selectedChordIds: state.selectedChordIds.filter((cid) => cid !== id),
        annotations: newAnnotations,
      };
    });
  },

  removeChords: (ids) => {
    set((state) => {
      const newAnnotations = { ...state.annotations };
      ids.forEach((id) => delete newAnnotations[id]);
      return {
        chords: state.chords.filter((c) => !ids.includes(c.id)),
        selectedChordIds: state.selectedChordIds.filter((cid) => !ids.includes(cid)),
        annotations: newAnnotations,
      };
    });
  },

  updateChord: (id, updates) => {
    set((state) => ({
      chords: state.chords.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },

  updateChordPosition: (id, x, y) => {
    const { zoom } = get();
    const snappedX = snapToBeat(x, zoom);
    const startBeat = Math.round(snappedX / (CANVAS_CONFIG.GRID_BEAT_WIDTH * zoom));

    set((state) => ({
      chords: state.chords.map((c) =>
        c.id === id ? { ...c, position: { x: snappedX, y }, startBeat } : c
      ),
    }));
  },

  clearChords: () => {
    set({ chords: [], phrases: [], selectedChordIds: [], annotations: {} });
  },

  // Selection actions
  selectChord: (id) => {
    set({ selectedChordIds: [id] });
  },

  selectChords: (ids) => {
    set({ selectedChordIds: ids });
  },

  deselectChord: (id) => {
    set((state) => ({
      selectedChordIds: state.selectedChordIds.filter((cid) => cid !== id),
    }));
  },

  toggleChordSelection: (id) => {
    set((state) => {
      if (state.selectedChordIds.includes(id)) {
        return { selectedChordIds: state.selectedChordIds.filter((cid) => cid !== id) };
      }
      return { selectedChordIds: [...state.selectedChordIds, id] };
    });
  },

  selectAll: () => {
    set((state) => ({
      selectedChordIds: state.chords.map((c) => c.id),
    }));
  },

  selectRange: (fromId, toId) => {
    const { chords } = get();
    const sortedChords = [...chords].sort((a, b) => a.startBeat - b.startBeat);
    const fromIndex = sortedChords.findIndex((c) => c.id === fromId);
    const toIndex = sortedChords.findIndex((c) => c.id === toId);

    if (fromIndex === -1 || toIndex === -1) return;

    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    const rangeIds = sortedChords.slice(start, end + 1).map((c) => c.id);

    set({ selectedChordIds: rangeIds });
  },

  clearSelection: () => {
    set({ selectedChordIds: [] });
  },

  // View actions
  setZoom: (zoom) => {
    set({ zoom: Math.max(CANVAS_CONFIG.MIN_ZOOM, Math.min(CANVAS_CONFIG.MAX_ZOOM, zoom)) });
  },

  setCurrentKey: (key) => {
    set({ currentKey: key });
  },

  setCurrentMode: (mode) => {
    set({ currentMode: mode });
  },

  setTempo: (tempo) => {
    set({ tempo: Math.max(20, Math.min(300, tempo)) });
  },

  toggleConnectionLines: () => {
    set((state) => ({ showConnectionLines: !state.showConnectionLines }));
  },

  loadAnalyzedProgression: ({ chords, phrases, key, mode, tempo }) => {
    set({
      chords,
      phrases: phrases || [],
      currentKey: key,
      currentMode: mode,
      tempo: Math.max(20, Math.min(300, Math.round(tempo))),
      selectedChordIds: [],
    });
  },

  clearPhrases: () => {
    set({ phrases: [] });
  },

  // Annotation actions
  setAnnotation: (chordId, note) => {
    set((state) => ({
      annotations: { ...state.annotations, [chordId]: note },
    }));
  },

  removeAnnotation: (chordId) => {
    set((state) => {
      const newAnnotations = { ...state.annotations };
      delete newAnnotations[chordId];
      return { annotations: newAnnotations };
    });
  },

  clearAnnotations: () => {
    set({ annotations: {} });
  },

  // Playback actions
  setIsPlaying: (isPlaying) => {
    set({ isPlaying });
  },

  setPlayheadPosition: (position) => {
    set({ playheadPosition: position });
  },

  // Audio actions
  setMasterVolume: (volume) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    set({ masterVolume: clampedVolume });
  },

  setAudioReady: (ready) => {
    set({ audioReady: ready });
  },

  // Necklace actions
  setNecklaceVisible: (visible) =>
    set((state) => ({
      necklaceSettings: { ...state.necklaceSettings, visible },
    })),

  toggleVoiceNecklace: (voice) =>
    set((state) => ({
      necklaceSettings: {
        ...state.necklaceSettings,
        voices: {
          ...state.necklaceSettings.voices,
          [voice]: {
            ...state.necklaceSettings.voices[voice],
            enabled: !state.necklaceSettings.voices[voice].enabled,
          },
        },
      },
    })),

  setVoiceNecklaceColor: (voice, color) =>
    set((state) => ({
      necklaceSettings: {
        ...state.necklaceSettings,
        voices: {
          ...state.necklaceSettings.voices,
          [voice]: {
            ...state.necklaceSettings.voices[voice],
            color,
          },
        },
      },
    })),

  setVoiceNecklaceOpacity: (voice, opacity) =>
    set((state) => ({
      necklaceSettings: {
        ...state.necklaceSettings,
        voices: {
          ...state.necklaceSettings.voices,
          [voice]: {
            ...state.necklaceSettings.voices[voice],
            opacity: Math.max(0, Math.min(1, opacity)),
          },
        },
      },
    })),

  resetNecklaceSettings: () =>
    set({ necklaceSettings: DEFAULT_NECKLACE_SETTINGS }),

  // Voice Lines actions
  setShowVoiceLines: (show) =>
    set({ showVoiceLines: show }),

  toggleVoiceLines: () =>
    set((state) => ({ showVoiceLines: !state.showVoiceLines })),
}));
