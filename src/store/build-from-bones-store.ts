/**
 * Zustand store for "Build From Bones" panel feature
 * Manages step-by-step deconstruction of chord progressions
 */

import { create } from 'zustand';
import type { Chord } from '@/types/chord';

/**
 * Layer types in the harmonic deconstruction
 */
export type LayerType = 'skeleton' | 'sevenths' | 'suspensions' | 'extensions' | 'alterations';

/**
 * Represents a single step in the chord progression deconstruction.
 *
 * Each step adds a layer of harmonic complexity:
 * - skeleton: Basic triads (I, IV, V, vi)
 * - sevenths: Add 7th intervals (Imaj7, IVmaj7, V7)
 * - suspensions: Add sus2/sus4 (Vsus4, IVsus2)
 * - extensions: Add 9ths, 11ths, 13ths (Imaj9, IV11)
 * - alterations: Add chromatic alterations (V7b9, IVmaj7#11)
 */
export interface DeconstructionStep {
  stepNumber: number;
  stepName: string;
  description: string;
  chords: Chord[];
  /** The type of harmonic layer this step represents */
  layerType?: LayerType;
  /** Indices of chords that changed from the previous step */
  modifiedIndices?: number[];
  /** Roman numeral representation of the progression (e.g., "I → IV → V → I") */
  romanNumerals?: string;
}

/**
 * Type for different playback modes in the Build From Bones panel
 */
export type PlaybackMode = 'single' | 'sequence' | 'compare' | null;

interface BuildFromBonesState {
  // Panel state
  isPanelOpen: boolean;
  currentStep: number;
  totalSteps: number;
  steps: DeconstructionStep[];

  // Playback state
  isPlaying: boolean;
  playbackMode: PlaybackMode;

  // Loading & error state
  isLoading: boolean;
  error: string | null;

  // Actions - Panel management
  openPanel: (steps: DeconstructionStep[]) => void;
  closePanel: () => void;
  nextStep: () => void;
  prevStep: () => void;
  jumpToStep: (stepNumber: number) => void;

  // Actions - Playback
  setPlaying: (playing: boolean) => void;
  setPlaybackMode: (mode: PlaybackMode) => void;

  // Actions - Loading & error
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Actions - Reset
  reset: () => void;
}

export const useBuildFromBonesStore = create<BuildFromBonesState>((set, get) => ({
  // Initial state
  isPanelOpen: false,
  currentStep: 0,
  totalSteps: 0,
  steps: [],
  isPlaying: false,
  playbackMode: null,
  isLoading: false,
  error: null,

  // Panel management actions
  openPanel: (steps) =>
    set({
      isPanelOpen: true,
      steps,
      totalSteps: steps.length,
      currentStep: 0,
      isLoading: false,
      error: null,
      isPlaying: false,
      playbackMode: null,
    }),

  closePanel: () =>
    set({
      isPanelOpen: false,
      isPlaying: false,
      playbackMode: null,
    }),

  nextStep: () => {
    const { currentStep, totalSteps } = get();
    // Wrap around to step 0 when reaching the end
    const nextStepNumber = (currentStep + 1) % totalSteps;
    set({
      currentStep: nextStepNumber,
      isPlaying: false,
      playbackMode: null,
    });
  },

  prevStep: () => {
    const { currentStep, totalSteps } = get();
    // Wrap around to last step when going before step 0
    const prevStepNumber = (currentStep - 1 + totalSteps) % totalSteps;
    set({
      currentStep: prevStepNumber,
      isPlaying: false,
      playbackMode: null,
    });
  },

  jumpToStep: (stepNumber) => {
    const { totalSteps } = get();
    // Ensure step number is within bounds
    const validStepNumber = Math.max(0, Math.min(stepNumber, totalSteps - 1));
    set({
      currentStep: validStepNumber,
      isPlaying: false,
      playbackMode: null,
    });
  },

  // Playback actions
  setPlaying: (playing) =>
    set({
      isPlaying: playing,
    }),

  setPlaybackMode: (mode) =>
    set({
      playbackMode: mode,
    }),

  // Loading & error actions
  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  setError: (error) =>
    set({
      error,
      isLoading: false,
    }),

  // Reset action
  reset: () =>
    set({
      isPanelOpen: false,
      currentStep: 0,
      totalSteps: 0,
      steps: [],
      isPlaying: false,
      playbackMode: null,
      isLoading: false,
      error: null,
    }),
}));
