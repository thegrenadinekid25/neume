import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Chord, NarrativeResult, StyleReference, ComposerOptions } from '@/types';
import { generateNarrativeProgression, EXAMPLE_NARRATIVES } from '@/services/narrative-composer';
import { generateSATBVoicing } from '@/audio/VoiceLeading';
import { CANVAS_CONFIG, DEFAULT_CHORD_SIZE } from '@/utils/constants';

interface NarrativeComposerState {
  // Modal state
  isModalOpen: boolean;

  // Form inputs
  narrative: string;
  styleReference: StyleReference;
  barCount: number;
  beatsPerBar: number;

  // Generation state
  isLoading: boolean;
  error: string | null;

  // Results
  result: NarrativeResult | null;
  generatedChords: Chord[];

  // Actions
  openModal: () => void;
  closeModal: () => void;
  setNarrative: (narrative: string) => void;
  setStyleReference: (style: StyleReference) => void;
  setBarCount: (count: number) => void;
  setBeatsPerBar: (beats: number) => void;
  selectExample: (index: number) => void;
  generate: () => Promise<void>;
  reset: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  api_error: 'Unable to connect to AI service. Please check your connection and try again.',
  rate_limit: 'Too many requests. Please wait a moment and try again.',
  invalid_response: 'The AI response was unexpected. Please try again with different wording.',
  validation_error: 'Generated chords were invalid. Please try again.',
  empty_narrative: 'Please describe how you want the progression to feel.',
  generation_failed: 'Could not generate a progression for this narrative. Try being more specific.',
};

function convertResultToChords(result: NarrativeResult): Chord[] {
  const chords: Chord[] = [];
  let currentBeat = 0;
  let previousVoicing: Chord['voices'] | undefined;

  for (const chordData of result.chords) {
    const chord: Chord = {
      id: uuidv4(),
      scaleDegree: chordData.scaleDegree as 1 | 2 | 3 | 4 | 5 | 6 | 7,
      quality: chordData.quality,
      extensions: chordData.extensions || {},
      key: result.key,
      mode: result.mode,
      isChromatic: false,
      voices: { soprano: 'C4', alto: 'G3', tenor: 'E3', bass: 'C3' },
      startBeat: currentBeat,
      duration: chordData.duration,
      position: { x: currentBeat * CANVAS_CONFIG.GRID_BEAT_WIDTH, y: 150 },
      size: DEFAULT_CHORD_SIZE,
      selected: false,
      playing: false,
      source: 'library',
      createdAt: new Date().toISOString(),
    };

    // Generate proper SATB voicing
    chord.voices = generateSATBVoicing(chord, previousVoicing);
    previousVoicing = chord.voices;

    chords.push(chord);
    currentBeat += chordData.duration;
  }

  return chords;
}

export const useNarrativeComposerStore = create<NarrativeComposerState>((set, get) => ({
  // Initial state
  isModalOpen: false,
  narrative: '',
  styleReference: 'general',
  barCount: 8,
  beatsPerBar: 4,
  isLoading: false,
  error: null,
  result: null,
  generatedChords: [],

  // Actions
  openModal: () => set({ isModalOpen: true }),

  closeModal: () => set({
    isModalOpen: false,
    // Keep results so user can re-open
  }),

  setNarrative: (narrative) => set({ narrative, error: null }),

  setStyleReference: (styleReference) => set({ styleReference }),

  setBarCount: (barCount) => set({ barCount }),

  setBeatsPerBar: (beatsPerBar) => set({ beatsPerBar }),

  selectExample: (index) => {
    if (index >= 0 && index < EXAMPLE_NARRATIVES.length) {
      set({ narrative: EXAMPLE_NARRATIVES[index], error: null });
    }
  },

  generate: async () => {
    const { narrative, styleReference, barCount, beatsPerBar } = get();

    if (!narrative.trim()) {
      set({ error: ERROR_MESSAGES.empty_narrative });
      return;
    }

    set({ isLoading: true, error: null, result: null, generatedChords: [] });

    try {
      const options: ComposerOptions = {
        styleReference,
        barCount,
        beatsPerBar,
      };

      const result = await generateNarrativeProgression(narrative, options);
      const chords = convertResultToChords(result);

      set({
        isLoading: false,
        result,
        generatedChords: chords,
      });
    } catch (error) {
      const errorKey = error instanceof Error ? error.message : 'api_error';
      set({
        isLoading: false,
        error: ERROR_MESSAGES[errorKey] || ERROR_MESSAGES.api_error,
      });
    }
  },

  reset: () => set({
    narrative: '',
    styleReference: 'general',
    barCount: 8,
    isLoading: false,
    error: null,
    result: null,
    generatedChords: [],
  }),
}));

// Re-export for convenience
export { EXAMPLE_NARRATIVES };
