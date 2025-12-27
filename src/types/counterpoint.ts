import type { VoicePart } from './voice-line';

/**
 * Types of counterpoint violations that can be detected
 */
export type CounterpointViolationType =
  | 'parallelFifths'
  | 'parallelOctaves'
  | 'antiparallelFifths'
  | 'antiparallelOctaves'
  | 'hiddenFifths'
  | 'hiddenOctaves'
  | 'voiceCrossing'
  | 'voiceOverlap'
  | 'spacingViolation'
  | 'rangeViolation'
  | 'unresolvedDissonance';

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
 * Style presets for different compositional approaches
 * - 'renaissance': Strict Palestrina-style rules
 * - 'baroque': Bach chorale style
 * - 'common-practice': Standard 18th-19th century rules
 * - 'modern': Relaxed rules for contemporary music (Whitacre, Lauridsen)
 */
export type CounterpointStyle = 'renaissance' | 'baroque' | 'common-practice' | 'modern';

/**
 * Configuration options for the counterpoint analyzer
 */
export interface CounterpointAnalyzerConfig {
  checkParallelFifths: boolean;
  checkParallelOctaves: boolean;
  checkAntiparallelFifths: boolean;
  checkAntiparallelOctaves: boolean;
  checkHiddenFifths: boolean;
  checkHiddenOctaves: boolean;
  checkVoiceCrossing: boolean;
  checkVoiceOverlap: boolean;
  checkSpacing: boolean;
  checkRange: boolean;
  checkDissonanceResolution: boolean;
  maxSopranoAltoSpacing: number;
  maxAltoTenorSpacing: number;
  warnOnExtendedRange: boolean;
  strictness: 'strict' | 'normal' | 'relaxed';
  style: CounterpointStyle;
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
 * Default analyzer configuration (common-practice style)
 */
export const DEFAULT_COUNTERPOINT_CONFIG: CounterpointAnalyzerConfig = {
  checkParallelFifths: true,
  checkParallelOctaves: true,
  checkAntiparallelFifths: false,
  checkAntiparallelOctaves: false,
  checkHiddenFifths: true,
  checkHiddenOctaves: true,
  checkVoiceCrossing: true,
  checkVoiceOverlap: true,
  checkSpacing: true,
  checkRange: true,
  checkDissonanceResolution: false, // OFF by default for modern music compatibility
  maxSopranoAltoSpacing: 12,
  maxAltoTenorSpacing: 12,
  warnOnExtendedRange: true,
  strictness: 'normal',
  style: 'common-practice',
};

/**
 * Style presets for quick configuration
 */
export const COUNTERPOINT_STYLE_PRESETS: Record<CounterpointStyle, Partial<CounterpointAnalyzerConfig>> = {
  renaissance: {
    checkAntiparallelFifths: true,
    checkAntiparallelOctaves: true,
    checkDissonanceResolution: true,
    strictness: 'strict',
    style: 'renaissance',
  },
  baroque: {
    checkAntiparallelFifths: true,
    checkAntiparallelOctaves: false,
    checkDissonanceResolution: true,
    strictness: 'normal',
    style: 'baroque',
  },
  'common-practice': {
    checkAntiparallelFifths: false,
    checkAntiparallelOctaves: false,
    checkDissonanceResolution: false,
    strictness: 'normal',
    style: 'common-practice',
  },
  modern: {
    checkAntiparallelFifths: false,
    checkAntiparallelOctaves: false,
    checkHiddenFifths: false,
    checkHiddenOctaves: false,
    checkDissonanceResolution: false,
    checkVoiceOverlap: false,
    strictness: 'relaxed',
    style: 'modern',
  },
};
