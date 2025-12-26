import { create } from 'zustand';
import { Chord } from '@types';

export interface Suggestion {
  id: string;
  technique: string;
  targetChordId: string;
  from: Chord;
  to: Chord;
  rationale: string;
  examples: string[];
  relevanceScore: number;
}

interface RefineState {
  isModalOpen: boolean;
  selectedChordIds: string[];
  userIntent: string;
  suggestions: Suggestion[];
  isLoading: boolean;
  error: string | null;

  // Actions
  openModal: (chordIds: string[]) => void;
  closeModal: () => void;
  setUserIntent: (intent: string) => void;
  setSuggestions: (suggestions: Suggestion[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSuggestions: () => void;
}

export const useRefineStore = create<RefineState>((set) => ({
  isModalOpen: false,
  selectedChordIds: [],
  userIntent: '',
  suggestions: [],
  isLoading: false,
  error: null,

  openModal: (chordIds) => set({
    isModalOpen: true,
    selectedChordIds: chordIds,
    userIntent: '',
    suggestions: [],
    error: null
  }),

  closeModal: () => set({
    isModalOpen: false,
    selectedChordIds: [],
    userIntent: '',
    suggestions: [],
    error: null
  }),

  setUserIntent: (intent) => set({ userIntent: intent }),

  setSuggestions: (suggestions) => set({ suggestions, isLoading: false }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),

  clearSuggestions: () => set({ suggestions: [], error: null }),
}));
