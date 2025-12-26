import { Chord, MusicalKey, Mode } from './chord';

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
 * Build-up progression data
 */
export interface BuildUp {
  steps: BuildUpStep[];
}

/**
 * Complete progression object (from spec)
 */
export interface Progression {
  id: string;

  // Metadata
  name: string;
  description?: string;

  // Musical Context
  key: MusicalKey;
  mode: Mode;
  timeSignature: TimeSignature;
  tempo: number; // BPM

  // Content
  chords: Chord[];

  // Analysis (if from "Analyze")
  analyzedFrom?: AnalyzedFrom;

  // Build-Up (if "Build From Bones" was saved)
  buildUp?: BuildUp;

  // User Data
  isFavorite: boolean;
  tags: string[];

  // Timestamps
  createdAt: string; // ISO format
  updatedAt: string; // ISO format
}

/**
 * Helper type for creating a new progression
 */
export type ProgressionInput = Partial<Progression> &
  Pick<Progression, 'name' | 'key' | 'mode' | 'tempo'>;
