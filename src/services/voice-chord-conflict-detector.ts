import { Note, Chord as TonalChord } from 'tonal';
import type { MelodicNote, VoicePart } from '@/types';
import type { Chord, ChordQuality } from '@/types/chord';
import type { TimeSignature } from '@/types/progression';
import { getChordPitchClasses } from './non-chord-tone-analyzer';

/**
 * Result of voice-chord conflict detection
 */
export interface VoiceChordConflictResult {
  hasConflict: boolean;
  conflictType?: 'strong-beat-non-chord' | 'tension-tone-mismatch' | 'root-third-implication';
  originalChordName?: string;
  suggestedChordName?: string;
  severity?: 'warning' | 'error';
  description?: string;
}

/**
 * Input parameters for conflict detection
 */
export interface DetectConflictInput {
  note: MelodicNote;
  voicePart: VoicePart;
  currentChord: Chord;
  timeSignature: TimeSignature;
  beatPosition: number;
  prevNote?: MelodicNote;
  nextNote?: MelodicNote;
}

/**
 * Check if a beat is strong in the given time signature
 * Strong beats are beat 0 and beat 2 in 4/4 time
 */
function isStrongBeat(beat: number, timeSignature: TimeSignature): boolean {
  const beatNumber = beat % 4;

  switch (timeSignature) {
    case '4/4':
    case '2/2':
      // Strong beats on 1 and 3 (beat positions 0 and 2)
      return beatNumber === 0 || beatNumber === 2;
    case '3/4':
      // Only beat 1 is strong (beat position 0)
      return beatNumber === 0;
    case '6/8':
      // Strong beats on 1 and 4 (beat positions 0 and 3)
      return beatNumber === 0 || beatNumber === 3;
    default:
      return beatNumber === 0;
  }
}

/**
 * Check if motion between two notes is stepwise (1-2 semitones)
 */
function isStepwiseMotion(fromMidi: number, toMidi: number): boolean {
  const semitones = Math.abs(toMidi - fromMidi);
  return semitones === 1 || semitones === 2;
}

/**
 * Check if a note is a chord tone in the current chord
 */
function isChordTone(note: MelodicNote, chord: Chord): boolean {
  const pitchClass = Note.pitchClass(note.pitch);
  const chordPitches = getChordPitchClasses(chord);
  return chordPitches.includes(pitchClass);
}

/**
 * Check if a note is an extension (9th, 11th, 13th)
 */
function isChordExtension(note: MelodicNote, chord: Chord): boolean {
  const pitchClass = Note.pitchClass(note.pitch);
  const chordPitches = getChordPitchClasses(chord);

  // Get the extension pitches for this chord
  try {
    // Build chord name
    const chordRootMap: Record<number, string> = {
      1: chord.key,
      2: Note.transpose(chord.key, '2M'),
      3: Note.transpose(chord.key, '3M'),
      4: Note.transpose(chord.key, '4P'),
      5: Note.transpose(chord.key, '5P'),
      6: Note.transpose(chord.key, '6M'),
      7: Note.transpose(chord.key, '7M'),
    };

    const root = chordRootMap[chord.scaleDegree] || chord.key;

    const qualityMap: Record<string, string> = {
      major: '',
      minor: 'm',
      diminished: 'dim',
      augmented: 'aug',
      dom7: '7',
      maj7: 'maj7',
      min7: 'm7',
      halfdim7: 'm7b5',
      dim7: 'dim7',
      dom9: '9',
      maj9: 'maj9',
      min9: 'm9',
      dom11: '11',
      min11: 'm11',
      dom13: '13',
      maj13: 'maj13',
      min13: 'm13',
      alt: '7alt',
      dom7b9: '7b9',
      dom7sharp9: '7#9',
      dom7sharp11: '7#11',
    };

    const qualitySuffix = qualityMap[chord.quality] || '';
    const chordName = `${root}${qualitySuffix}`;
    const tonalChord = TonalChord.get(chordName);

    if (!tonalChord || !tonalChord.notes) {
      return false;
    }

    // Check if this pitch class is in the chord but not in the base triad
    const baseNotes = chordPitches; // These are the basic chord tones
    const allNotes = tonalChord.notes.map(n => Note.pitchClass(n));

    return allNotes.includes(pitchClass) && !baseNotes.includes(pitchClass);
  } catch (error) {
    return false;
  }
}

/**
 * Get the suggested chord if a note implies a different harmony
 */
function getSuggestedChord(note: MelodicNote, currentChord: Chord): Chord | null {
  const pitchClass = Note.pitchClass(note.pitch);

  // Check if this note would be the root of a major or minor chord
  const possibleChordQualities: ChordQuality[] = ['major', 'minor', 'dom7', 'maj7', 'min7'];

  for (const quality of possibleChordQualities) {
    try {
      const testChordName = `${pitchClass}${quality === 'major' ? '' : quality === 'minor' ? 'm' : quality}`;
      const tonalChord = TonalChord.get(testChordName);

      if (tonalChord && tonalChord.notes) {
        const notes = tonalChord.notes.map(n => Note.pitchClass(n));
        // If the chord has 3+ common tones with current chord, it's not a good fit
        const currentPitches = getChordPitchClasses(currentChord);
        const commonTones = notes.filter(n => currentPitches.includes(n)).length;

        if (commonTones < 2) {
          // This note suggests a different chord
          return {
            ...currentChord,
            key: pitchClass as any,
            quality,
            scaleDegree: 1,
          };
        }
      }
    } catch (error) {
      // Ignore errors in chord construction
    }
  }

  return null;
}

/**
 * Main conflict detection function
 * Analyzes if a dragged note creates harmonic conflicts
 */
export function detectVoiceChordConflict(
  input: DetectConflictInput
): VoiceChordConflictResult {
  const { note, currentChord, timeSignature, beatPosition, prevNote } = input;

  // Check 1: Is this a strong beat with a non-chord tone?
  const isStrong = isStrongBeat(beatPosition, timeSignature);
  const isChord = isChordTone(note, currentChord);
  const isExtension = isChordExtension(note, currentChord);

  if (isStrong && !isChord && !isExtension) {
    // Strong beat non-chord tone is a conflict
    return {
      hasConflict: true,
      conflictType: 'strong-beat-non-chord',
      severity: 'error',
      description: `Strong beat (beat ${beatPosition}) should be a chord tone or extension, not a passing tone`,
      originalChordName: `${currentChord.key}${currentChord.quality}`,
    };
  }

  // Check 2: Is the note stepwise and does it suggest a different chord?
  if (prevNote && isStepwiseMotion(prevNote.midi, note.midi)) {
    const suggestedChord = getSuggestedChord(note, currentChord);

    if (suggestedChord && !isChord) {
      return {
        hasConflict: true,
        conflictType: 'root-third-implication',
        severity: 'warning',
        description: `Note suggests a different chord harmony. Consider changing to match the note's harmonic center`,
        originalChordName: `${currentChord.key}${currentChord.quality}`,
        suggestedChordName: `${suggestedChord.key}${suggestedChord.quality}`,
      };
    }
  }

  // Check 3: Is this note a tension that doesn't fit the chord quality?
  if (!isChord && !isExtension && isStrong) {
    // Non-chord, non-extension on strong beat = tension error
    return {
      hasConflict: true,
      conflictType: 'tension-tone-mismatch',
      severity: 'warning',
      description: `This note creates harmonic tension on a strong beat. Consider using a chord tone instead`,
      originalChordName: `${currentChord.key}${currentChord.quality}`,
    };
  }

  // No conflict detected
  return {
    hasConflict: false,
  };
}

/**
 * Get human-readable description of a chord
 */
export function getChordDisplayName(chord: Chord): string {
  const rootMap: Record<number, string> = {
    1: chord.key,
    2: Note.transpose(chord.key, '2M'),
    3: Note.transpose(chord.key, '3M'),
    4: Note.transpose(chord.key, '4P'),
    5: Note.transpose(chord.key, '5P'),
    6: Note.transpose(chord.key, '6M'),
    7: Note.transpose(chord.key, '7M'),
  };

  const root = rootMap[chord.scaleDegree] || chord.key;
  const qualityDisplay: Record<string, string> = {
    major: '',
    minor: 'm',
    diminished: 'dim',
    augmented: 'aug',
    dom7: '7',
    maj7: 'maj7',
    min7: 'm7',
    halfdim7: 'm7b5',
    dim7: 'dim7',
    dom9: '9',
    maj9: 'maj9',
    min9: 'm9',
    dom11: '11',
    min11: 'm11',
    dom13: '13',
    maj13: 'maj13',
    min13: 'm13',
    alt: '7alt',
    dom7b9: '7b9',
    dom7sharp9: '7#9',
    dom7sharp11: '7#11',
  };

  const quality = qualityDisplay[chord.quality] || '';
  return `${root}${quality}`;
}
