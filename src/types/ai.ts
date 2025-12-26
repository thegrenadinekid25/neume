import { Chord } from './chord';

/**
 * Suggestion technique types
 */
export type SuggestionTechnique =
  | 'add9'
  | 'add11'
  | 'add13'
  | 'sus2'
  | 'sus4'
  | 'seventh'
  | 'modalMixture'
  | 'secondaryDominant'
  | 'neapolitan'
  | 'chromaticMediant'
  | 'alteredChord';

/**
 * Difficulty level of a suggestion
 */
export type SuggestionDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Proposed chord change
 */
export interface ProposedChange {
  from: Chord;
  to: Chord;
}

/**
 * AI suggestion object (from spec)
 */
export interface AISuggestion {
  id: string;

  // Original Request
  userIntent: string; // e.g., "more ethereal"
  selectedChords: string[]; // Chord IDs

  // Suggestion Details
  technique: SuggestionTechnique;
  targetChord: string; // Chord ID to modify
  proposedChange: ProposedChange;

  // Explanation
  rationale: string; // "The added 9th creates shimmer..."
  examples: string[]; // ["Lauridsen", "Whitacre"]
  difficulty: SuggestionDifficulty;

  // Ranking
  relevanceScore: number; // 0-100
  impactScore: number; // 0-100 (how much it changes sound)
}

/**
 * Chord explanation (for "Why This?" feature)
 */
export interface ChordExplanation {
  // Context
  contextual: string; // Why this chord here?
  technical: string; // What is it doing?
  historical: string; // Who else uses this?

  // Evolution chain
  evolutionSteps: {
    name: string;
    description: string;
    chord: Chord;
  }[];
}

/**
 * Analysis result from "Analyze" feature
 */
export interface AnalysisResult {
  title: string;
  composer?: string;
  key: string;
  mode: 'major' | 'minor';
  tempo: number;
  chords: Chord[];
  confidence: number; // 0-1
}
