import { Note, Interval, Chord as TonalChord, Scale } from 'tonal';
import { Chord, ScaleDegree } from '@types';

/**
 * SATB voice ranges (MIDI numbers for easier calculations)
 */
export const VOICE_RANGES = {
  soprano: { min: Note.midi('C4')!, max: Note.midi('G5')! }, // 60-79
  alto: { min: Note.midi('G3')!, max: Note.midi('D5')! },    // 55-74
  tenor: { min: Note.midi('C3')!, max: Note.midi('G4')! },   // 48-67
  bass: { min: Note.midi('E2')!, max: Note.midi('C4')! },    // 40-60
} as const;

/**
 * Voice type
 */
export type Voice = 'soprano' | 'alto' | 'tenor' | 'bass';

/**
 * SATB voicing result
 */
export interface SATBVoicing {
  soprano: string; // e.g., "C5"
  alto: string;    // e.g., "E4"
  tenor: string;   // e.g., "G3"
  bass: string;    // e.g., "C3"
}

/**
 * Generate SATB voicing for a chord
 */
export function generateSATBVoicing(
  chord: Chord,
  previousVoicing?: SATBVoicing
): SATBVoicing {
  // Get chord notes from Tonal.js
  const chordNotes = getChordNotes(chord);

  if (!previousVoicing) {
    // First chord - use default voicing
    return generateDefaultVoicing(chordNotes, chord);
  }

  // Subsequent chord - use voice leading
  return voiceLeadFromPrevious(chordNotes, previousVoicing, chord);
}

/**
 * Get chord notes using Tonal.js
 */
function getChordNotes(chord: Chord): string[] {
  // Build chord symbol (e.g., "Cmaj7", "Dm", "G7")
  const root = getChordRoot(chord.key, chord.scaleDegree, chord.mode);
  const quality = getChordSymbol(chord);
  const chordSymbol = `${root}${quality}`;

  // Get notes from Tonal.js
  const tonalChord = TonalChord.get(chordSymbol);

  if (!tonalChord.notes || tonalChord.notes.length === 0) {
    console.warn(`Could not parse chord: ${chordSymbol}`);
    // Fallback to major triad
    return [root, Note.transpose(root, '3M'), Note.transpose(root, '5P')];
  }

  return tonalChord.notes;
}

/**
 * Get chord root note from key, scale degree, and mode
 */
function getChordRoot(
  key: string,
  degree: ScaleDegree,
  mode: 'major' | 'minor'
): string {
  // Get scale notes
  const scaleNotes = getScaleNotes(key, mode);

  // Get note at scale degree (1-indexed)
  return scaleNotes[degree - 1];
}

/**
 * Get scale notes for a key and mode
 */
function getScaleNotes(key: string, mode: 'major' | 'minor'): string[] {
  const scaleType = mode === 'major' ? 'major' : 'natural minor';
  const scale = Scale.get(`${key} ${scaleType}`);
  return scale.notes;
}

/**
 * Build chord quality symbol (e.g., "maj7", "m", "dim")
 */
function getChordSymbol(chord: Chord): string {
  let symbol = '';

  // Base quality
  switch (chord.quality) {
    case 'major':
      symbol = '';
      break;
    case 'minor':
      symbol = 'm';
      break;
    case 'diminished':
      symbol = 'dim';
      break;
    case 'augmented':
      symbol = 'aug';
      break;
    case 'dom7':
      symbol = '7';
      break;
    case 'maj7':
      symbol = 'maj7';
      break;
    case 'min7':
      symbol = 'm7';
      break;
    case 'halfdim7':
      symbol = 'm7b5';
      break;
    case 'dim7':
      symbol = 'dim7';
      break;
  }

  // Extensions
  if (chord.extensions.add9) symbol += 'add9';
  if (chord.extensions.sus4) symbol = 'sus4'; // Replaces quality
  if (chord.extensions.sus2) symbol = 'sus2';

  return symbol;
}

/**
 * Generate default voicing (for first chord)
 */
function generateDefaultVoicing(
  chordNotes: string[],
  _chord: Chord
): SATBVoicing {
  const root = chordNotes[0];

  // Bass: Root in comfortable register (C3)
  const bass = Note.transpose(root, '0P'); // Start with root
  const bassMidi = Note.midi(bass)!;
  const bassOctave = bassMidi < VOICE_RANGES.bass.min ?
    Note.transpose(bass, '8P') :
    bassMidi > VOICE_RANGES.bass.max ?
    Note.transpose(bass, '-8P') :
    bass;

  // Build triad or extended chord
  const third = chordNotes[1] || Note.transpose(root, '3M');
  const fifth = chordNotes[2] || Note.transpose(root, '5P');
  const extension = chordNotes[3]; // 7th, 9th, etc.

  // Tenor: 5th (close to bass)
  const tenor = fitToRange(fifth, 'tenor');

  // Alto: 3rd (close harmony)
  const alto = fitToRange(third, 'alto');

  // Soprano: Root or extension
  const sopranoNote = extension || root;
  const soprano = fitToRange(sopranoNote, 'soprano');

  return { soprano, alto, tenor, bass: bassOctave };
}

/**
 * Voice lead from previous voicing
 */
function voiceLeadFromPrevious(
  chordNotes: string[],
  prevVoicing: SATBVoicing,
  _chord: Chord
): SATBVoicing {
  const root = chordNotes[0];

  // Bass always gets root
  const bass = fitToRange(root, 'bass');

  // Find optimal voicing for upper voices
  const upperNotes = chordNotes.slice(1); // 3rd, 5th, 7th, etc.

  // Try to keep common tones
  const soprano = findBestVoice(
    upperNotes,
    prevVoicing.soprano,
    'soprano',
    prevVoicing
  );
  const alto = findBestVoice(
    upperNotes.filter(n => !noteEquals(n, soprano)),
    prevVoicing.alto,
    'alto',
    prevVoicing
  );
  const tenor = findBestVoice(
    upperNotes.filter(n => !noteEquals(n, soprano) && !noteEquals(n, alto)),
    prevVoicing.tenor,
    'tenor',
    prevVoicing
  );

  return { soprano, alto, tenor, bass };
}

/**
 * Find best voice leading option
 */
function findBestVoice(
  availableNotes: string[],
  previousNote: string,
  voice: Voice,
  _prevVoicing: SATBVoicing
): string {
  if (availableNotes.length === 0) {
    // No notes available, return previous (common tone)
    return previousNote;
  }

  // Check for common tone first
  const commonTone = availableNotes.find(note =>
    noteEquals(Note.pitchClass(note), Note.pitchClass(previousNote))
  );

  if (commonTone) {
    return fitToRange(commonTone, voice);
  }

  // Otherwise, find closest note (stepwise motion preferred)
  const prevMidi = Note.midi(previousNote)!;
  const range = VOICE_RANGES[voice];

  let bestNote = availableNotes[0];
  let smallestInterval = 999;

  for (const note of availableNotes) {
    const noteMidi = Note.midi(fitToRange(note, voice))!;
    const interval = Math.abs(noteMidi - prevMidi);

    if (interval < smallestInterval && noteMidi >= range.min && noteMidi <= range.max) {
      smallestInterval = interval;
      bestNote = note;
    }
  }

  return fitToRange(bestNote, voice);
}

/**
 * Fit note to voice range
 */
function fitToRange(note: string, voice: Voice): string {
  const range = VOICE_RANGES[voice];
  let midi = Note.midi(note)!;

  // Transpose to correct octave
  while (midi < range.min) {
    midi += 12;
  }
  while (midi > range.max) {
    midi -= 12;
  }

  return Note.fromMidi(midi) || note;
}

/**
 * Check if two notes are equal (pitch class comparison)
 */
function noteEquals(note1: string, note2: string): boolean {
  return Note.pitchClass(note1) === Note.pitchClass(note2);
}

/**
 * Analyze voice leading quality (for debugging)
 */
export function analyzeVoiceLeading(
  voicing1: SATBVoicing,
  voicing2: SATBVoicing
): {
  parallelFifths: boolean;
  parallelOctaves: boolean;
  totalMotion: number;
  contraryMotion: boolean;
} {
  const voices: Voice[] = ['soprano', 'alto', 'tenor', 'bass'];

  let totalMotion = 0;
  let parallelFifths = false;
  let parallelOctaves = false;

  // Check each voice pair
  for (let i = 0; i < voices.length; i++) {
    for (let j = i + 1; j < voices.length; j++) {
      const v1 = voices[i];
      const v2 = voices[j];

      const interval1 = Interval.distance(voicing1[v2], voicing1[v1]);
      const interval2 = Interval.distance(voicing2[v2], voicing2[v1]);

      // Check parallel 5ths
      if (
        Interval.semitones(interval1) === 7 &&
        Interval.semitones(interval2) === 7
      ) {
        parallelFifths = true;
      }

      // Check parallel 8ves
      if (
        Interval.semitones(interval1)! % 12 === 0 &&
        Interval.semitones(interval2)! % 12 === 0
      ) {
        parallelOctaves = true;
      }
    }
  }

  // Calculate total motion
  voices.forEach(voice => {
    const midi1 = Note.midi(voicing1[voice])!;
    const midi2 = Note.midi(voicing2[voice])!;
    totalMotion += Math.abs(midi2 - midi1);
  });

  // Check contrary motion (bass vs soprano)
  const bassMotion = Note.midi(voicing2.bass)! - Note.midi(voicing1.bass)!;
  const sopranoMotion = Note.midi(voicing2.soprano)! - Note.midi(voicing1.soprano)!;
  const contraryMotion = (bassMotion > 0 && sopranoMotion < 0) ||
                         (bassMotion < 0 && sopranoMotion > 0);

  return { parallelFifths, parallelOctaves, totalMotion, contraryMotion };
}
