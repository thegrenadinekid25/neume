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
 * AI suggestion object
 */
export interface AISuggestion {
  id: string;
  userIntent: string;
  selectedChords: string[];
  technique: SuggestionTechnique;
  targetChord: string;
  proposedChange: ProposedChange;
  rationale: string;
  examples: string[];
  difficulty: SuggestionDifficulty;
  relevanceScore: number;
  impactScore: number;
}

/**
 * Chord explanation (for "Why This?" feature)
 */
export interface ChordExplanation {
  contextual: string;
  technical: string;
  historical: string;
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
  confidence: number;
}
