/**
 * Voice-Leading Optimizer
 *
 * Implements voice-leading optimization algorithm following common practice rules.
 * Rules applied with scoring:
 * - Minimize voice movement (-2 per semitone)
 * - Penalize parallel 5ths/8ves heavily (-1000)
 * - Penalize doubled leading tone (-500)
 * - Prefer common tone retention (+50)
 * - Prefer contrary motion in outer voices (+100)
 */

import { Note } from 'tonal';
import type { Chord, Voices, MusicalKey, Mode } from '@/types';
import { generateSATBVoicing } from '@/audio/VoiceLeading';

type VoiceType = 'soprano' | 'alto' | 'tenor' | 'bass';

/**
 * Convert note name to MIDI number
 */
function noteToMidi(noteName: string): number {
  const midiNote = Note.midi(noteName);
  if (midiNote === null) {
    throw new Error(`Invalid note: ${noteName}`);
  }
  return midiNote;
}

/**
 * Convert MIDI number to note name
 */
function midiToNote(midi: number): string {
  const note = Note.fromMidi(midi);
  if (!note) {
    throw new Error(`Invalid MIDI number: ${midi}`);
  }
  return note;
}

/**
 * Get pitch class (C, C#, D, etc.) from a note name
 */
function getPitchClass(noteName: string): string {
  return noteName.replace(/\d+$/, '');
}

/**
 * Get the leading tone for a given key
 */
function getLeadingTone(key: MusicalKey): string {
  const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const keyIndex = notes.indexOf(key[0]);
  if (keyIndex === -1) return 'B'; // Default fallback
  const leadingToneIndex = (keyIndex + 6) % 7;
  return notes[leadingToneIndex];
}

/**
 * Check if two MIDI notes form a perfect fifth
 */
function isPerfectFifth(midiA: number, midiB: number): boolean {
  const interval = Math.abs(midiB - midiA);
  return interval % 12 === 7 || interval % 12 === 5;
}

/**
 * Check if two MIDI notes form a perfect octave or unison
 */
function isPerfectOctaveOrUnison(midiA: number, midiB: number): boolean {
  const interval = Math.abs(midiB - midiA);
  return interval % 12 === 0;
}

/**
 * Check for parallel fifths between two voices
 */
function checkParallelFifths(
  prevVoicing: Voices,
  currVoicing: Voices,
  voice1: VoiceType,
  voice2: VoiceType
): boolean {
  try {
    const prevMidi1 = noteToMidi(prevVoicing[voice1]);
    const prevMidi2 = noteToMidi(prevVoicing[voice2]);
    const currMidi1 = noteToMidi(currVoicing[voice1]);
    const currMidi2 = noteToMidi(currVoicing[voice2]);

    const prevIsFifth = isPerfectFifth(prevMidi1, prevMidi2);
    const currIsFifth = isPerfectFifth(currMidi1, currMidi2);

    if (!prevIsFifth || !currIsFifth) return false;

    // Check if motion is parallel
    const voice1Up = currMidi1 > prevMidi1;
    const voice2Up = currMidi2 > prevMidi2;
    return voice1Up === voice2Up;
  } catch {
    return false;
  }
}

/**
 * Check for parallel octaves between two voices
 */
function checkParallelOctaves(
  prevVoicing: Voices,
  currVoicing: Voices,
  voice1: VoiceType,
  voice2: VoiceType
): boolean {
  try {
    const prevMidi1 = noteToMidi(prevVoicing[voice1]);
    const prevMidi2 = noteToMidi(prevVoicing[voice2]);
    const currMidi1 = noteToMidi(currVoicing[voice1]);
    const currMidi2 = noteToMidi(currVoicing[voice2]);

    const prevIsOctave = isPerfectOctaveOrUnison(prevMidi1, prevMidi2);
    const currIsOctave = isPerfectOctaveOrUnison(currMidi1, currMidi2);

    if (!prevIsOctave || !currIsOctave) return false;

    const voice1Up = currMidi1 > prevMidi1;
    const voice2Up = currMidi2 > prevMidi2;
    return voice1Up === voice2Up;
  } catch {
    return false;
  }
}

/**
 * Count common tones retained in the same voice
 */
function countRetainedCommonTones(prevVoicing: Voices, currVoicing: Voices): number {
  let retained = 0;
  const voices: VoiceType[] = ['soprano', 'alto', 'tenor', 'bass'];

  for (const voice of voices) {
    const prevPitch = getPitchClass(prevVoicing[voice]);
    const currPitch = getPitchClass(currVoicing[voice]);
    if (prevPitch === currPitch) {
      retained++;
    }
  }

  return retained;
}

/**
 * Calculate voice leading distance for a voice
 */
function getVoiceDistance(prevVoicing: Voices, currVoicing: Voices, voice: VoiceType): number {
  try {
    const prevMidi = noteToMidi(prevVoicing[voice]);
    const currMidi = noteToMidi(currVoicing[voice]);
    return Math.abs(currMidi - prevMidi);
  } catch {
    return 0;
  }
}

/**
 * Check if motion in outer voices is contrary
 */
function hasContraryMotionOuterVoices(prevVoicing: Voices, currVoicing: Voices): boolean {
  try {
    const sopranoUp = noteToMidi(currVoicing.soprano) > noteToMidi(prevVoicing.soprano);
    const bassUp = noteToMidi(currVoicing.bass) > noteToMidi(prevVoicing.bass);
    return sopranoUp !== bassUp;
  } catch {
    return false;
  }
}

/**
 * Check if a note is the doubled leading tone
 */
function hasDoubledLeadingTone(voicing: Voices, key: MusicalKey): boolean {
  const leadingTone = getLeadingTone(key);
  let count = 0;

  for (const voice of ['soprano', 'alto', 'tenor', 'bass'] as VoiceType[]) {
    if (getPitchClass(voicing[voice]) === leadingTone) {
      count++;
    }
  }

  return count > 1;
}

/**
 * Score a voicing based on voice-leading rules
 */
function scoreVoicing(
  voicing: Voices,
  prevVoicing: Voices | undefined,
  key: MusicalKey
): number {
  let score = 0;

  if (!prevVoicing) {
    return score;
  }

  // Rule 1: Minimize voice movement (-2 per semitone)
  const voices: VoiceType[] = ['soprano', 'alto', 'tenor', 'bass'];
  for (const voice of voices) {
    const distance = getVoiceDistance(prevVoicing, voicing, voice);
    score -= distance * 2;
  }

  // Rule 2: Penalize parallel 5ths/8ves (-1000)
  const voicePairs: Array<[VoiceType, VoiceType]> = [
    ['soprano', 'alto'],
    ['soprano', 'tenor'],
    ['soprano', 'bass'],
    ['alto', 'tenor'],
    ['alto', 'bass'],
    ['tenor', 'bass'],
  ];

  for (const [v1, v2] of voicePairs) {
    if (checkParallelFifths(prevVoicing, voicing, v1, v2)) {
      score -= 1000;
    }
    if (checkParallelOctaves(prevVoicing, voicing, v1, v2)) {
      score -= 1000;
    }
  }

  // Rule 3: Penalize doubled leading tone (-500)
  if (hasDoubledLeadingTone(voicing, key)) {
    score -= 500;
  }

  // Rule 4: Prefer common tone retention (+50)
  const retainedCommonTones = countRetainedCommonTones(prevVoicing, voicing);
  score += retainedCommonTones * 50;

  // Rule 5: Prefer contrary motion in outer voices (+100)
  if (hasContraryMotionOuterVoices(prevVoicing, voicing)) {
    score += 100;
  }

  return score;
}

/**
 * Generate alternative voicings for a chord by transposing voices
 */
function generateVoicingAlternatives(
  baseVoicing: Voices,
  _key: MusicalKey
): Voices[] {
  const alternatives: Voices[] = [baseVoicing];

  // Try transposing individual voices by an octave
  const voices: VoiceType[] = ['soprano', 'alto', 'tenor', 'bass'];

  for (const voice of voices) {
    const note = baseVoicing[voice];
    const midi = noteToMidi(note);

    // Try octave up and down (staying within reasonable limits)
    for (const octaveOffset of [-12, 12]) {
      const newMidi = midi + octaveOffset;

      // Keep within reasonable voice ranges
      const voiceRanges: Record<VoiceType, { low: number; high: number }> = {
        soprano: { low: 60, high: 79 },
        alto: { low: 55, high: 74 },
        tenor: { low: 48, high: 67 },
        bass: { low: 40, high: 60 },
      };

      const range = voiceRanges[voice];
      if (newMidi >= range.low && newMidi <= range.high) {
        const newVoicing = {
          ...baseVoicing,
          [voice]: midiToNote(newMidi),
        };
        alternatives.push(newVoicing);
      }
    }
  }

  return alternatives;
}

/**
 * Optimize a single chord's voicing based on the previous voicing
 */
function optimizeChordVoicing(
  chord: Chord,
  prevVoicing: Voices | undefined,
  key: MusicalKey,
  _mode: Mode
): Voices {
  // Generate base voicing
  let baseVoicing = generateSATBVoicing(chord, prevVoicing);

  // Generate alternatives
  const alternatives = generateVoicingAlternatives(baseVoicing, key);

  // Score all alternatives and pick the best one
  let bestVoicing = baseVoicing;
  let bestScore = prevVoicing ? scoreVoicing(baseVoicing, prevVoicing, key) : 0;

  for (const alternative of alternatives) {
    const score = prevVoicing ? scoreVoicing(alternative, prevVoicing, key) : 0;
    if (score > bestScore) {
      bestScore = score;
      bestVoicing = alternative;
    }
  }

  return bestVoicing;
}

/**
 * Optimize an entire progression's voicing using voice-leading rules
 */
export function optimizeProgressionVoicing(
  chords: Chord[],
  key: MusicalKey,
  mode: Mode
): Chord[] {
  if (chords.length === 0) {
    return chords;
  }

  const optimized: Chord[] = [];
  let prevVoicing: Voices | undefined;

  for (const chord of chords) {
    const optimizedVoicing = optimizeChordVoicing(chord, prevVoicing, key, mode);
    optimized.push({
      ...chord,
      voices: optimizedVoicing,
    });
    prevVoicing = optimizedVoicing;
  }

  return optimized;
}
