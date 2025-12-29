/**
 * Type definitions for Harmonic Critique feature
 * Identifies voice leading issues, unresolved tensions, and harmonic problems
 */

export type CritiqueIssueType =
  | 'parallel_fifths'
  | 'parallel_octaves'
  | 'unresolved_tension'
  | 'voice_crossing'
  | 'large_leap'
  | 'doubled_leading_tone'
  | 'spacing_issue'
  | 'missing_resolution';

export type IssueSeverity = 'error' | 'warning' | 'suggestion';

export interface CritiqueIssue {
  id: string;
  type: CritiqueIssueType;
  severity: IssueSeverity;
  title: string;
  description: string;
  chordIds: string[];  // Affected chord(s)
  voice?: 'soprano' | 'alto' | 'tenor' | 'bass';
  suggestion?: string;
}

export interface CritiqueResponse {
  issues: CritiqueIssue[];
  summary: string;
  score: number;  // 0-100
  timestamp: string;
}
