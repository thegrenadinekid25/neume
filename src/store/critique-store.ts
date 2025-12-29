/**
 * Zustand store for Harmonic Critique panel state
 * Manages critique issues, panel visibility, and issue highlighting
 */

import { create } from 'zustand';
import type { CritiqueIssue, CritiqueResponse } from '@/types/critique';

interface CritiqueStore {
  // Panel state
  isOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;

  // Critique data
  issues: CritiqueIssue[];
  summary: string;
  score: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCritique: (response: CritiqueResponse) => void;
  clearCritique: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Highlighting
  highlightedIssueId: string | null;
  setHighlightedIssue: (id: string | null) => void;
}

export const useCritiqueStore = create<CritiqueStore>((set) => ({
  isOpen: false,
  openPanel: () => set({ isOpen: true }),
  closePanel: () => set({ isOpen: false }),
  togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),

  issues: [],
  summary: '',
  score: null,
  isLoading: false,
  error: null,

  setCritique: (response) => set({
    issues: response.issues,
    summary: response.summary,
    score: response.score,
    error: null,
  }),
  clearCritique: () => set({
    issues: [],
    summary: '',
    score: null,
    error: null,
  }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),

  highlightedIssueId: null,
  setHighlightedIssue: (id) => set({ highlightedIssueId: id }),
}));
