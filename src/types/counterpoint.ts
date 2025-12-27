import type { VoicePart } from './voice-line';

/**
 * Types of counterpoint violations that can be detected
 */
export type CounterpointViolationType =
  | 'parallelFifths'
  | 'parallelOctaves'
  | 'hiddenFifths'
  | 'hiddenOctaves'
  | 'voiceCrossing'
  | 'voiceOverlap'
  | 'spacingViolation'
  | 'rangeViolation';

/**
 * Severity levels for counterpoint issues
 */
export type CounterpointSeverity = 'error' | 'warning' | 'info';

/**
 * Range violation subtypes
 */
export type RangeViolationSubtype =
  | 'belowAbsolute'
  | 'aboveAbsolute'
  | 'belowComfortable'
  | 'aboveComfortable';

/**
 * Location in the score where a violation occurs
 */
export interface ViolationLocation {
  beat: number;
  noteIds: string[];
}

/**
 * A single counterpoint violation
 */
export interface CounterpointViolation {
  id: string;
  type: CounterpointViolationType;
  severity: CounterpointSeverity;
  voicePair?: [VoicePart, VoicePart];
  voice?: VoicePart;
  description: string;
  location: ViolationLocation;
  rangeSubtype?: RangeViolationSubtype;
  interval?: number;
  suggestion?: string;
}

/**
 * Configuration options for the counterpoint analyzer
 */
export interface CounterpointAnalyzerConfig {
  checkParallelFifths: boolean;
  checkParallelOctaves: boolean;
  checkHiddenFifths: boolean;
  checkHiddenOctaves: boolean;
  checkVoiceCrossing: boolean;
  checkVoiceOverlap: boolean;
  checkSpacing: boolean;
  checkRange: boolean;
  maxSopranoAltoSpacing: number;
  maxAltoTenorSpacing: number;
  warnOnExtendedRange: boolean;
  strictness: 'strict' | 'normal' | 'relaxed';
}

/**
 * Summary statistics for counterpoint analysis
 */
export interface CounterpointSummary {
  totalViolations: number;
  bySeverity: {
    error: number;
    warning: number;
    info: number;
  };
  byType: Partial<Record<CounterpointViolationType, number>>;
  isValid: boolean;
  score: number;
}

/**
 * Complete result of counterpoint analysis
 */
export interface CounterpointAnalysisResult {
  violations: CounterpointViolation[];
  summary: CounterpointSummary;
  analyzedAt: string;
  config: CounterpointAnalyzerConfig;
}

/**
 * A snapshot of notes at a specific beat
 */
export interface BeatSnapshot {
  beat: number;
  notes: Partial<Record<VoicePart, {
    noteId: string;
    midi: number;
    pitch: string;
  }>>;
}

/**
 * Default analyzer configuration
 */
export const DEFAULT_COUNTERPOINT_CONFIG: CounterpointAnalyzerConfig = {
  checkParallelFifths: true,
  checkParallelOctaves: true,
  checkHiddenFifths: true,
  checkHiddenOctaves: true,
  checkVoiceCrossing: true,
  checkVoiceOverlap: true,
  checkSpacing: true,
  checkRange: true,
  maxSopranoAltoSpacing: 12,
  maxAltoTenorSpacing: 12,
  warnOnExtendedRange: true,
  strictness: 'normal',
};
