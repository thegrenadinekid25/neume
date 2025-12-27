/**
 * Types for text setting and syllable management
 */

import type { VoicePart } from './voice-line';

/**
 * A parsed syllable from text input
 */
export interface Syllable {
  text: string;
  syllableIndex: number;
  totalInWord: number;
  isWordStart: boolean;
  isWordEnd: boolean;
  originalWord: string;
}

/**
 * Result from syllable parsing
 */
export interface SyllableParseResult {
  syllables: Syllable[];
  originalText: string;
  warnings: string[];
}

/**
 * A syllable assignment to a note
 */
export interface SyllableAssignment {
  noteId: string;
  text: string;
  isMelisma: boolean;
  syllableIndex: number;
}

/**
 * Text setting mode options
 */
export type TextSettingMode = 'syllabic' | 'melismatic' | 'neumatic';

/**
 * Text setting state for a voice line
 */
export interface VoiceTextSetting {
  voicePart: VoicePart;
  inputText: string;
  syllables: Syllable[];
  assignments: SyllableAssignment[];
  mode: TextSettingMode;
  autoAssign: boolean;
}

/**
 * Melisma marker types
 */
export type MelismaMarker = '_' | '-' | '~';

/**
 * Default text setting configuration
 */
export const DEFAULT_TEXT_SETTING: Omit<VoiceTextSetting, 'voicePart'> = {
  inputText: '',
  syllables: [],
  assignments: [],
  mode: 'syllabic',
  autoAssign: true,
};
