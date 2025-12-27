import { Chord, MusicalKey, Mode } from './chord';

/**
 * Phrase boundary for visual grouping of chord patterns
 */
export interface PhraseBoundary {
  startIndex: number;  // Index of first chord in phrase
  endIndex: number;    // Index of last chord in phrase (inclusive)
  patternName: string; // e.g., "Pattern 1", "Pattern 2"
  startBeat: number;   // Beat position where phrase starts
  endBeat: number;     // Beat position where phrase ends
}

/**
 * Result of quantization including phrase boundaries
 */
export interface QuantizedProgression {
  chords: Chord[];
  phrases: PhraseBoundary[];
}

/**
 * Time signature options
 */
export type TimeSignature = '4/4' | '3/4' | '6/8' | '2/2';

/**
 * Source of analyzed progression
 */
export type AnalysisSource = 'youtube' | 'audio' | 'pdf';

/**
 * Analyzed piece metadata
 */
export interface AnalyzedFrom {
  title: string;
  composer?: string;
  source: AnalysisSource;
  sourceUrl?: string;
}

/**
 * Build-up step (for "Build From Bones" feature)
 */
export interface BuildUpStep {
  stepNumber: number;
  stepName: string;
  description: string;
  chords: Chord[];
}

/**
 * Per-chord annotation from user
 */
export interface ChordAnnotation {
  chordId: string;
  note: string;
  createdAt: string;
}

/**
 * Build-up progression data
 */
export interface BuildUp {
  steps: BuildUpStep[];
}

/**
 * Saved progression for storage in localStorage
 */
export interface SavedProgression {
  id: string;
  title: string;
  key: string;
  mode: 'major' | 'minor';
  tempo: number;
  timeSignature: TimeSignature;
  chords: Chord[];
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;

  // User notes about this progression
  notes?: string;

  // Per-chord annotations
  annotations?: ChordAnnotation[];

  // Optional metadata from analysis
  analyzedFrom?: {
    source: 'youtube' | 'audio';
    title: string;
    composer?: string;
    url?: string;
  };

  buildUpSteps?: BuildUpStep[];
}

/**
 * Complete progression object
 */
export interface Progression {
  id: string;
  name: string;
  description?: string;
  key: MusicalKey;
  mode: Mode;
  timeSignature: TimeSignature;
  tempo: number;
  chords: Chord[];
  analyzedFrom?: AnalyzedFrom;
  buildUp?: BuildUp;
  isFavorite: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Helper type for creating a new progression
 */
export type ProgressionInput = Partial<Progression> &
  Pick<Progression, 'name' | 'key' | 'mode' | 'tempo'>;
