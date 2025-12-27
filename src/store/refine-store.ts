/**
 * Zustand store for Refine This Modal feature
 * Manages state for AI-powered chord refinement suggestions
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Chord } from '@/types/chord';

/**
 * Refinement suggestion from the suggestion engine
 */
export interface Suggestion {
  id: string;
  technique: string; // "add9", "sus4", "modal_mixture", etc.
  targetChordId: string; // ID of chord being refined
  from: Chord;
  to: Chord;
  rationale: string; // Educational explanation
  examples: string[]; // Composers/artists that use this technique
  relevanceScore: number; // 0-1 confidence score
}

interface RefineState {
  // Modal state
  isModalOpen: boolean;

  // Selected chords to refine
  selectedChordIds: string[];

  // User's emotional/stylistic intent
  userIntent: string;

  // AI-generated suggestions
  suggestions: Suggestion[];

  // Loading and error state
  isLoading: boolean;
  error: string | null;

  // For iterative refinement
  previousIntents: string[];
  surpriseCount: number; // Track how many "surprise me" suggestions used

  // Actions
  openModal: (selectedChordIds: string[]) => void;
  closeModal: () => void;
  setUserIntent: (intent: string) => void;
  setSuggestions: (suggestions: Suggestion[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  applySuggestion: (suggestionId: string) => void;
  clearSuggestions: () => void;
  reset: () => void;
}

/**
 * Mock suggestions for testing (backend not ready yet)
 */
function generateMockSuggestions(intent: string, chords: Chord[]): Suggestion[] {
  if (chords.length === 0) return [];

  const targetChord = chords[0];
  const suggestions: Suggestion[] = [];

  // Ethereal suggestions
  if (intent.toLowerCase().includes('ethereal') || intent.toLowerCase().includes('floating')) {
    suggestions.push({
      id: uuidv4(),
      technique: 'add9',
      targetChordId: targetChord.id,
      from: targetChord,
      to: { ...targetChord, extensions: { ...targetChord.extensions, add9: true } },
      rationale: 'The added 9th creates shimmer and ethereal quality, characteristic of Lauridsen, Whitacre, and Pärt\'s sound.',
      examples: ['Lauridsen', 'Whitacre', 'Pärt'],
      relevanceScore: 0.95,
    });

    suggestions.push({
      id: uuidv4(),
      technique: 'sus4',
      targetChordId: targetChord.id,
      from: targetChord,
      to: { ...targetChord, extensions: { ...targetChord.extensions, sus4: true } },
      rationale: 'Suspended 4th creates floating anticipation, common in sacred choral music and contemporary classical.',
      examples: ['Arvo Pärt', 'Eric Whitacre', 'Morten Lauridsen'],
      relevanceScore: 0.92,
    });

    suggestions.push({
      id: uuidv4(),
      technique: 'maj7',
      targetChordId: targetChord.id,
      from: targetChord,
      to: { ...targetChord, quality: 'maj7' },
      rationale: 'Major 7th adds brightness and openness, essential for modern choral music.',
      examples: ['Bill Withers', 'The Beatles', 'Steely Dan'],
      relevanceScore: 0.88,
    });
  }

  // Dark/grounded suggestions
  else if (intent.toLowerCase().includes('dark') || intent.toLowerCase().includes('ground')) {
    suggestions.push({
      id: uuidv4(),
      technique: 'diminished',
      targetChordId: targetChord.id,
      from: targetChord,
      to: { ...targetChord, quality: 'diminished' },
      rationale: 'Diminished quality creates tension and darkness. Use sparingly for dramatic effect.',
      examples: ['Brahms', 'Penderecki', 'Shostakovich'],
      relevanceScore: 0.89,
    });

    suggestions.push({
      id: uuidv4(),
      technique: 'minor_mode',
      targetChordId: targetChord.id,
      from: targetChord,
      to: { ...targetChord, quality: 'minor' },
      rationale: 'Minor chords ground the progression and create introspective mood.',
      examples: ['Nick Drake', 'Bon Iver', 'Radiohead'],
      relevanceScore: 0.91,
    });

    suggestions.push({
      id: uuidv4(),
      technique: 'aug6th',
      targetChordId: targetChord.id,
      from: targetChord,
      to: { ...targetChord, isChromatic: true, chromaticType: 'aug6th' },
      rationale: 'Augmented 6th chord creates dramatic tension and darker color.',
      examples: ['Brahms', 'Wagner', 'Bruckner'],
      relevanceScore: 0.85,
    });
  }

  // Triumphant/bright suggestions
  else if (intent.toLowerCase().includes('triumph') || intent.toLowerCase().includes('bright')) {
    suggestions.push({
      id: uuidv4(),
      technique: 'major_quality',
      targetChordId: targetChord.id,
      from: targetChord,
      to: { ...targetChord, quality: 'major' },
      rationale: 'Major chords create bright, triumphant feeling.',
      examples: ['Handel', 'John Williams', 'Aaron Copland'],
      relevanceScore: 0.93,
    });

    suggestions.push({
      id: uuidv4(),
      technique: 'add13',
      targetChordId: targetChord.id,
      from: targetChord,
      to: { ...targetChord, extensions: { ...targetChord.extensions, add13: true } },
      rationale: 'Added 13th creates warmth and brightness without dissonance.',
      examples: ['Rihanna', 'Amy Winehouse', 'Daniel Caesar'],
      relevanceScore: 0.87,
    });
  }

  // Default suggestions if no intent match
  if (suggestions.length === 0) {
    suggestions.push({
      id: uuidv4(),
      technique: 'add9',
      targetChordId: targetChord.id,
      from: targetChord,
      to: { ...targetChord, extensions: { ...targetChord.extensions, add9: true } },
      rationale: 'Added 9th is one of the most versatile and useful extensions, adding complexity and sophistication.',
      examples: ['Miles Davis', 'Bill Evans', 'Herbie Hancock'],
      relevanceScore: 0.85,
    });

    suggestions.push({
      id: uuidv4(),
      technique: 'sus4',
      targetChordId: targetChord.id,
      from: targetChord,
      to: { ...targetChord, extensions: { ...targetChord.extensions, sus4: true } },
      rationale: 'Suspended chords create anticipation and forward momentum.',
      examples: ['The Beatles', 'Peter Frampton', 'Stevie Nicks'],
      relevanceScore: 0.82,
    });

    suggestions.push({
      id: uuidv4(),
      technique: 'neapolitan',
      targetChordId: targetChord.id,
      from: targetChord,
      to: { ...targetChord, isChromatic: true, chromaticType: 'neapolitan' },
      rationale: 'The Neapolitan chord creates dramatic color and unexpected shift.',
      examples: ['Beethoven', 'Schubert', 'Chopin'],
      relevanceScore: 0.79,
    });
  }

  return suggestions.slice(0, 3); // Return top 3 suggestions
}

export const useRefineStore = create<RefineState>((set, get) => ({
  // Initial state
  isModalOpen: false,
  selectedChordIds: [],
  userIntent: '',
  suggestions: [],
  isLoading: false,
  error: null,
  previousIntents: [],
  surpriseCount: 0,

  // Modal actions
  openModal: (selectedChordIds) => {
    set({
      isModalOpen: true,
      selectedChordIds,
      userIntent: '',
      suggestions: [],
      error: null,
      previousIntents: [],
    });
  },

  closeModal: () => {
    const { isLoading } = get();
    if (!isLoading) {
      set({
        isModalOpen: false,
        suggestions: [],
        userIntent: '',
        error: null,
      });
    }
  },

  // Intent actions
  setUserIntent: (intent) => {
    set({ userIntent: intent, error: null });
  },

  // Suggestions actions
  setSuggestions: (suggestions) => {
    set({ suggestions, isLoading: false });
  },

  // Loading and error
  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error, isLoading: false });
  },

  // Apply a suggestion to the canvas
  applySuggestion: (suggestionId) => {
    const { suggestions } = get();
    const suggestion = suggestions.find((s) => s.id === suggestionId);

    if (!suggestion) return;

    // This will be connected to canvas store in the component
    // For now, just track that it was applied
    console.log(
      `Applied suggestion: ${suggestion.technique} to chord ${suggestion.targetChordId}`
    );

    // Clear suggestions after apply
    set({ suggestions: [], userIntent: '' });
  },

  // Clear suggestions
  clearSuggestions: () => {
    set({ suggestions: [], userIntent: '' });
  },

  // Reset store
  reset: () => {
    set({
      isModalOpen: false,
      selectedChordIds: [],
      userIntent: '',
      suggestions: [],
      isLoading: false,
      error: null,
      previousIntents: [],
      surpriseCount: 0,
    });
  },
}));

/**
 * Helper function to get suggestions (will call API when backend is ready)
 */
export async function getSuggestions(
  intent: string,
  chords: Chord[]
): Promise<Suggestion[]> {
  // For now, return mock suggestions
  // Later: return await fetch(`/api/suggest`, { method: 'POST', body: JSON.stringify({intent, chords}) })
  return generateMockSuggestions(intent, chords);
}
