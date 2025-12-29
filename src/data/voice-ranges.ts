import { Note } from 'tonal';
import type { VoicePart, VoicePart8, AnyVoicePart } from '@/types/necklace';

/**
 * Defines the vocal range for a specific voice type
 */
export interface VoiceRangeDefinition {
  /** Lowest note in the full range (e.g., 'C4') */
  low: string;
  /** Highest note in the full range (e.g., 'G5') */
  high: string;
  /** MIDI number for the lowest note */
  lowMidi: number;
  /** MIDI number for the highest note */
  highMidi: number;
  /** Lowest note in the comfortable range */
  comfortableLow: string;
  /** Highest note in the comfortable range */
  comfortableHigh: string;
  /** MIDI number for the comfortable low */
  comfortableLowMidi: number;
  /** MIDI number for the comfortable high */
  comfortableHighMidi: number;
  /** Hex color for this voice part */
  color: string;
  /** Human-readable label for this voice part */
  label: string;
}

/**
 * Voice range definitions for SATB (Soprano, Alto, Tenor, Bass)
 * Based on standard classical choral ranges
 */
export const VOICE_RANGES: Record<VoicePart, VoiceRangeDefinition> = {
  soprano: {
    low: 'C4',
    high: 'G5',
    lowMidi: Note.midi('C4') || 60,
    highMidi: Note.midi('G5') || 79,
    comfortableLow: 'E4',
    comfortableHigh: 'E5',
    comfortableLowMidi: Note.midi('E4') || 64,
    comfortableHighMidi: Note.midi('E5') || 76,
    color: '#E8A03E',
    label: 'Soprano',
  },
  alto: {
    low: 'G3',
    high: 'D5',
    lowMidi: Note.midi('G3') || 55,
    highMidi: Note.midi('D5') || 74,
    comfortableLow: 'A3',
    comfortableHigh: 'C5',
    comfortableLowMidi: Note.midi('A3') || 57,
    comfortableHighMidi: Note.midi('C5') || 72,
    color: '#6B8FAD',
    label: 'Alto',
  },
  tenor: {
    low: 'C3',
    high: 'G4',
    lowMidi: Note.midi('C3') || 48,
    highMidi: Note.midi('G4') || 67,
    comfortableLow: 'D3',
    comfortableHigh: 'E4',
    comfortableLowMidi: Note.midi('D3') || 50,
    comfortableHighMidi: Note.midi('E4') || 64,
    color: '#7A9E87',
    label: 'Tenor',
  },
  bass: {
    low: 'E2',
    high: 'C4',
    lowMidi: Note.midi('E2') || 40,
    highMidi: Note.midi('C4') || 60,
    comfortableLow: 'G2',
    comfortableHigh: 'A3',
    comfortableLowMidi: Note.midi('G2') || 43,
    comfortableHighMidi: Note.midi('A3') || 57,
    color: '#8B7355',
    label: 'Bass',
  },
};

/**
 * Voice range definitions for SSAATTBB (double choir)
 * Part I typically has slightly higher tessitura than Part II
 */
export const VOICE_RANGES_8: Record<VoicePart8, VoiceRangeDefinition> = {
  sopranoI: {
    low: 'D4',
    high: 'A5',
    lowMidi: Note.midi('D4') || 62,
    highMidi: Note.midi('A5') || 81,
    comfortableLow: 'F4',
    comfortableHigh: 'F5',
    comfortableLowMidi: Note.midi('F4') || 65,
    comfortableHighMidi: Note.midi('F5') || 77,
    color: '#D4891F',
    label: 'Soprano I',
  },
  sopranoII: {
    low: 'C4',
    high: 'G5',
    lowMidi: Note.midi('C4') || 60,
    highMidi: Note.midi('G5') || 79,
    comfortableLow: 'E4',
    comfortableHigh: 'E5',
    comfortableLowMidi: Note.midi('E4') || 64,
    comfortableHighMidi: Note.midi('E5') || 76,
    color: '#F2B861',
    label: 'Soprano II',
  },
  altoI: {
    low: 'A3',
    high: 'E5',
    lowMidi: Note.midi('A3') || 57,
    highMidi: Note.midi('E5') || 76,
    comfortableLow: 'B3',
    comfortableHigh: 'D5',
    comfortableLowMidi: Note.midi('B3') || 59,
    comfortableHighMidi: Note.midi('D5') || 74,
    color: '#527A94',
    label: 'Alto I',
  },
  altoII: {
    low: 'G3',
    high: 'D5',
    lowMidi: Note.midi('G3') || 55,
    highMidi: Note.midi('D5') || 74,
    comfortableLow: 'A3',
    comfortableHigh: 'C5',
    comfortableLowMidi: Note.midi('A3') || 57,
    comfortableHighMidi: Note.midi('C5') || 72,
    color: '#8BA8BE',
    label: 'Alto II',
  },
  tenorI: {
    low: 'D3',
    high: 'A4',
    lowMidi: Note.midi('D3') || 50,
    highMidi: Note.midi('A4') || 69,
    comfortableLow: 'E3',
    comfortableHigh: 'F4',
    comfortableLowMidi: Note.midi('E3') || 52,
    comfortableHighMidi: Note.midi('F4') || 65,
    color: '#5E8369',
    label: 'Tenor I',
  },
  tenorII: {
    low: 'C3',
    high: 'G4',
    lowMidi: Note.midi('C3') || 48,
    highMidi: Note.midi('G4') || 67,
    comfortableLow: 'D3',
    comfortableHigh: 'E4',
    comfortableLowMidi: Note.midi('D3') || 50,
    comfortableHighMidi: Note.midi('E4') || 64,
    color: '#96B8A5',
    label: 'Tenor II',
  },
  bassI: {
    low: 'G2',
    high: 'D4',
    lowMidi: Note.midi('G2') || 43,
    highMidi: Note.midi('D4') || 62,
    comfortableLow: 'A2',
    comfortableHigh: 'B3',
    comfortableLowMidi: Note.midi('A2') || 45,
    comfortableHighMidi: Note.midi('B3') || 59,
    color: '#6B5940',
    label: 'Bass I',
  },
  bassII: {
    low: 'E2',
    high: 'C4',
    lowMidi: Note.midi('E2') || 40,
    highMidi: Note.midi('C4') || 60,
    comfortableLow: 'G2',
    comfortableHigh: 'A3',
    comfortableLowMidi: Note.midi('G2') || 43,
    comfortableHighMidi: Note.midi('A3') || 57,
    color: '#A8906E',
    label: 'Bass II',
  },
};

/**
 * Standard voice order for SATB layout (top to bottom)
 */
export const VOICE_ORDER: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];

/**
 * Standard voice order for SSAATTBB layout (top to bottom)
 */
export const VOICE_ORDER_8: VoicePart8[] = [
  'sopranoI', 'sopranoII',
  'altoI', 'altoII',
  'tenorI', 'tenorII',
  'bassI', 'bassII',
];

/**
 * Get voice range for any voice part (4 or 8 voice)
 */
export function getVoiceRange(voicePart: AnyVoicePart): VoiceRangeDefinition {
  if (voicePart in VOICE_RANGES) {
    return VOICE_RANGES[voicePart as VoicePart];
  }
  return VOICE_RANGES_8[voicePart as VoicePart8];
}

/**
 * Check if a MIDI note is within the full range for a given voice part
 * @param midi - MIDI note number
 * @param voicePart - The voice part to check against
 * @returns true if the note is within range, false otherwise
 */
export function isInRange(midi: number, voicePart: VoicePart): boolean {
  const range = VOICE_RANGES[voicePart];
  return midi >= range.lowMidi && midi <= range.highMidi;
}

/**
 * Check if a note name is within the full range for a given voice part
 * @param noteName - Note name (e.g., 'C4', 'D#5')
 * @param voicePart - The voice part to check against
 * @returns true if the note is within range, false otherwise
 */
export function isNoteInRange(noteName: string, voicePart: VoicePart): boolean {
  const midi = Note.midi(noteName);
  if (midi === null) {
    return false;
  }
  return isInRange(midi, voicePart);
}

/**
 * Check if a MIDI note is within the comfortable range for a given voice part
 * @param midi - MIDI note number
 * @param voicePart - The voice part to check against
 * @returns true if the note is within comfortable range, false otherwise
 */
export function isInComfortableRange(midi: number, voicePart: VoicePart): boolean {
  const range = VOICE_RANGES[voicePart];
  return midi >= range.comfortableLowMidi && midi <= range.comfortableHighMidi;
}

/**
 * Get the comfortable range for a voice part as MIDI numbers
 * @param voicePart - The voice part to get the range for
 * @returns Object with low and high MIDI numbers
 */
export function getComfortableRange(voicePart: VoicePart): { low: number; high: number } {
  const range = VOICE_RANGES[voicePart];
  return {
    low: range.comfortableLowMidi,
    high: range.comfortableHighMidi,
  };
}

/**
 * Get the full range for a voice part as MIDI numbers
 * @param voicePart - The voice part to get the range for
 * @returns Object with low and high MIDI numbers
 */
export function getFullRange(voicePart: VoicePart): { low: number; high: number } {
  const range = VOICE_RANGES[voicePart];
  return {
    low: range.lowMidi,
    high: range.highMidi,
  };
}

/**
 * Determine the range status of a note for a given voice part
 * @param midi - MIDI note number
 * @param voicePart - The voice part to check against
 * @returns 'comfortable' if in comfortable range, 'extended' if in full range, 'out-of-range' otherwise
 */
export function getRangeStatus(
  midi: number,
  voicePart: VoicePart
): 'comfortable' | 'extended' | 'out-of-range' {
  if (isInComfortableRange(midi, voicePart)) {
    return 'comfortable';
  }
  if (isInRange(midi, voicePart)) {
    return 'extended';
  }
  return 'out-of-range';
}

/**
 * Clamp a MIDI note to the valid range for a voice part
 * @param midi - MIDI note number
 * @param voicePart - The voice part to clamp to
 * @returns The clamped MIDI note number
 */
export function clampToRange(midi: number, voicePart: VoicePart): number {
  const range = VOICE_RANGES[voicePart];
  return Math.max(range.lowMidi, Math.min(midi, range.highMidi));
}

/**
 * Get the color for a voice part
 * @param voicePart - The voice part to get the color for
 * @returns Hex color string
 */
export function getVoiceColor(voicePart: VoicePart): string {
  return VOICE_RANGES[voicePart].color;
}
