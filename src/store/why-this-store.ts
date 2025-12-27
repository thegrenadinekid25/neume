/**
 * Zustand store for "Why This?" panel feature
 */

import { create } from 'zustand';
import type { Chord } from '@/types/chord';
import type { ChordExplanation } from '@/types/ai';

// Re-export types for convenience
export type { ChordExplanation };

/**
 * Song metadata for contextual explanations
 */
export interface SongContext {
  title?: string;
  composer?: string;
  sourceUrl?: string;
}

interface WhyThisState {
  // Panel state
  isOpen: boolean;
  selectedChord: Chord | null;
  previousChord: Chord | null;
  nextChord: Chord | null;

  // Full progression context for macro-level analysis
  fullProgression: Chord[];
  songContext: SongContext | null;

  // Explanation data
  explanation: ChordExplanation | null;
  isLoading: boolean;
  error: string | null;

  // Playback state
  isPlayingIsolated: boolean;
  isPlayingInProgression: boolean;
  isPlayingEvolution: boolean;

  // Actions
  openPanel: (
    chord: Chord,
    prevChord?: Chord,
    nextChord?: Chord,
    fullProgression?: Chord[],
    songContext?: SongContext
  ) => void;
  closePanel: () => void;
  setExplanation: (explanation: ChordExplanation) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPlayingIsolated: (playing: boolean) => void;
  setPlayingInProgression: (playing: boolean) => void;
  setPlayingEvolution: (playing: boolean) => void;
  reset: () => void;
}

export const useWhyThisStore = create<WhyThisState>((set) => ({
  // Initial state
  isOpen: false,
  selectedChord: null,
  previousChord: null,
  nextChord: null,
  fullProgression: [],
  songContext: null,
  explanation: null,
  isLoading: false,
  error: null,
  isPlayingIsolated: false,
  isPlayingInProgression: false,
  isPlayingEvolution: false,

  // Panel actions
  openPanel: (chord, prevChord, nextChord, fullProgression, songContext) =>
    set({
      isOpen: true,
      selectedChord: chord,
      previousChord: prevChord || null,
      nextChord: nextChord || null,
      fullProgression: fullProgression || [],
      songContext: songContext || null,
      isLoading: true,
      error: null,
      explanation: null,
      isPlayingIsolated: false,
      isPlayingInProgression: false,
      isPlayingEvolution: false,
    }),

  closePanel: () =>
    set({
      isOpen: false,
      isPlayingIsolated: false,
      isPlayingInProgression: false,
      isPlayingEvolution: false,
    }),

  // Explanation actions
  setExplanation: (explanation) =>
    set({
      explanation,
      isLoading: false,
      error: null,
    }),

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  setError: (error) =>
    set({
      error,
      isLoading: false,
    }),

  // Playback actions
  setPlayingIsolated: (playing) =>
    set({
      isPlayingIsolated: playing,
      isPlayingInProgression: false,
      isPlayingEvolution: false,
    }),

  setPlayingInProgression: (playing) =>
    set({
      isPlayingInProgression: playing,
      isPlayingIsolated: false,
      isPlayingEvolution: false,
    }),

  setPlayingEvolution: (playing) =>
    set({
      isPlayingEvolution: playing,
      isPlayingIsolated: false,
      isPlayingInProgression: false,
    }),

  // Reset action
  reset: () =>
    set({
      isOpen: false,
      selectedChord: null,
      previousChord: null,
      nextChord: null,
      fullProgression: [],
      songContext: null,
      explanation: null,
      isLoading: false,
      error: null,
      isPlayingIsolated: false,
      isPlayingInProgression: false,
      isPlayingEvolution: false,
    }),
}));
