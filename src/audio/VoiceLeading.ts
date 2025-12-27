import { Note, Chord as TonalChord, Scale } from 'tonal';
import type { Chord, Voices, ScaleDegree, MusicalKey, Mode, ChordExtensions } from '@/types';

/**
 * Voice ranges in MIDI numbers for SATB
 */
const VOICE_RANGES = {
  soprano: { low: 60, high: 79 }, // C4 to G5
  alto: { low: 55, high: 74 }, // G3 to D5
  tenor: { low: 48, high: 67 }, // C3 to G4
  bass: { low: 40, high: 60 }, // E2 to C4
};

type VoiceType = 'soprano' | 'alto' | 'tenor' | 'bass';

/**
 * Interface for voice leading validation results
 */
interface VoiceLeadingValidation {
  valid: boolean;
  parallelFifths: Array<{ voice1: VoiceType; voice2: VoiceType }>;
  parallelOctaves: Array<{ voice1: VoiceType; voice2: VoiceType }>;
  voiceCrossings: VoiceType[];
  voiceOverlaps: Array<{ voice1: VoiceType; voice2: VoiceType }>;
  commonTonesRetained: number;
  tendencyToneIssues: string[];
}

/**
 * Represents a pair of voices for checking intervals
 */
export interface VoicePair {
  voice1: VoiceType;
  voice2: VoiceType;
  midi1: number;
  midi2: number;
}

/**
 * Interface for tendency tones (scale degrees that want to resolve)
 */
interface TendencyTone {
  noteName: string;
  voice: VoiceType;
  resolutionNote: string;
  tendency: 'up' | 'down';
}

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
 * Get all notes in a chord
 */
function getChordNotes(chordSymbol: string): string[] {
  const chord = TonalChord.get(chordSymbol);
  if (!chord.notes || chord.notes.length === 0) {
    return [];
  }
  return chord.notes;
}

/**
 * Get extension intervals in semitones from the root
 */
function getExtensionIntervals(extensions: ChordExtensions | undefined): number[] {
  const intervals: number[] = [];

  if (extensions?.add9) intervals.push(14); // 9th = octave + 2
  if (extensions?.add11) intervals.push(17); // 11th = octave + 5
  if (extensions?.add13) intervals.push(21); // 13th = octave + 9
  if (extensions?.sus2) intervals.push(2); // Sus2 replaces 3rd with 2nd
  if (extensions?.sus4) intervals.push(5); // Sus4 replaces 3rd with 4th
  if (extensions?.flat9) intervals.push(13); // b9
  if (extensions?.sharp9) intervals.push(15); // #9
  if (extensions?.sharp11) intervals.push(18); // #11
  if (extensions?.flat13) intervals.push(20); // b13

  return intervals;
}

/**
 * Get the root note for a scale degree in a given key and mode
 */
function getRootFromScaleDegree(key: MusicalKey, mode: Mode, scaleDegree: ScaleDegree): string {
  const scaleName = mode === 'major' ? 'major' : 'minor';
  const scaleNotes = Scale.get(`${key} ${scaleName}`).notes;

  if (!scaleNotes || scaleNotes.length === 0) {
    console.warn(`Could not get scale for ${key} ${scaleName}`);
    return key;
  }

  // Scale degree is 1-indexed, array is 0-indexed
  const noteIndex = scaleDegree - 1;
  if (noteIndex < 0 || noteIndex >= scaleNotes.length) {
    console.warn(`Invalid scale degree ${scaleDegree}`);
    return key;
  }

  return scaleNotes[noteIndex];
}

/**
 * Fit a note to a specific voice range
 * Transposes the note up/down by octaves until it's within the range
 */
function fitToRange(noteName: string, voiceRange: { low: number; high: number }): string {
  let midi = noteToMidi(noteName);

  // Transpose up or down to fit within range
  while (midi < voiceRange.low) {
    midi += 12; // Up one octave
  }
  while (midi > voiceRange.high) {
    midi -= 12; // Down one octave
  }

  return midiToNote(midi);
}

/**
 * Calculate voice leading distance (how far a voice moved)
 */
function getVoiceLeadingDistance(previousMidi: number, currentMidi: number): number {
  return Math.abs(currentMidi - previousMidi);
}

// ============================================================================
// PHASE 2: INTERVAL HELPERS
// ============================================================================

/**
 * Determine the direction of motion between two MIDI notes
 */
function getMotionDirection(
  previousMidi: number,
  currentMidi: number
): 'up' | 'down' | 'static' {
  if (currentMidi > previousMidi) return 'up';
  if (currentMidi < previousMidi) return 'down';
  return 'static';
}

/**
 * Check if two MIDI notes form a perfect fifth (7 semitones)
 */
function isPerfectFifth(midiA: number, midiB: number): boolean {
  const interval = Math.abs(midiB - midiA);
  // Perfect fifth is 7 semitones, or its inversion (5 semitones when inverted)
  return interval % 12 === 7 || interval % 12 === 5;
}

/**
 * Check if two MIDI notes form a perfect octave or unison (0 or 12 semitones apart)
 */
function isPerfectOctaveOrUnison(midiA: number, midiB: number): boolean {
  const interval = Math.abs(midiB - midiA);
  return interval % 12 === 0;
}

// ============================================================================
// PHASE 3: PARALLEL MOTION DETECTION
// ============================================================================

/**
 * Check for parallel fifths between two voices
 */
function hasParallelFifths(
  prevVoicing: Voices,
  currVoicing: Voices,
  voice1: VoiceType = 'soprano',
  voice2: VoiceType = 'bass'
): boolean {
  const prevMidi1 = noteToMidi(prevVoicing[voice1]);
  const prevMidi2 = noteToMidi(prevVoicing[voice2]);
  const currMidi1 = noteToMidi(currVoicing[voice1]);
  const currMidi2 = noteToMidi(currVoicing[voice2]);

  // Check if both intervals are perfect fifths
  const prevIsFifth = isPerfectFifth(prevMidi1, prevMidi2);
  const currIsFifth = isPerfectFifth(currMidi1, currMidi2);

  if (!prevIsFifth || !currIsFifth) return false;

  // Check if motion is parallel (both up or both down)
  const voice1Motion = getMotionDirection(prevMidi1, currMidi1);
  const voice2Motion = getMotionDirection(prevMidi2, currMidi2);

  // Parallel motion = same direction in both voices
  return voice1Motion === voice2Motion && voice1Motion !== 'static';
}

/**
 * Check for parallel octaves between two voices
 */
function hasParallelOctaves(
  prevVoicing: Voices,
  currVoicing: Voices,
  voice1: VoiceType = 'soprano',
  voice2: VoiceType = 'bass'
): boolean {
  const prevMidi1 = noteToMidi(prevVoicing[voice1]);
  const prevMidi2 = noteToMidi(prevVoicing[voice2]);
  const currMidi1 = noteToMidi(currVoicing[voice1]);
  const currMidi2 = noteToMidi(currVoicing[voice2]);

  // Check if both intervals are perfect octaves/unison
  const prevIsOctave = isPerfectOctaveOrUnison(prevMidi1, prevMidi2);
  const currIsOctave = isPerfectOctaveOrUnison(currMidi1, currMidi2);

  if (!prevIsOctave || !currIsOctave) return false;

  // Check if motion is parallel (both up or both down)
  const voice1Motion = getMotionDirection(prevMidi1, currMidi1);
  const voice2Motion = getMotionDirection(prevMidi2, currMidi2);

  // Parallel motion = same direction in both voices
  return voice1Motion === voice2Motion && voice1Motion !== 'static';
}

/**
 * Detect all parallel motion (fifths and octaves) across all voice pairs
 */
function detectParallelMotion(
  prevVoicing: Voices,
  currVoicing: Voices
): VoiceLeadingValidation['parallelFifths'] {
  const violations: Array<{ voice1: VoiceType; voice2: VoiceType }> = [];
  const voiceTypes: VoiceType[] = ['soprano', 'alto', 'tenor', 'bass'];

  for (let i = 0; i < voiceTypes.length; i++) {
    for (let j = i + 1; j < voiceTypes.length; j++) {
      const voice1 = voiceTypes[i];
      const voice2 = voiceTypes[j];

      if (hasParallelFifths(prevVoicing, currVoicing, voice1, voice2)) {
        violations.push({ voice1, voice2 });
      }
      // Note: Parallel octaves are checked separately in hasParallelOctaves
    }
  }

  return violations;
}

// ============================================================================
// PHASE 5: COMMON TONE DETECTION
// ============================================================================

/**
 * Get the pitch class (C, C#, D, etc.) from a note name
 */
function getPitchClass(noteName: string): string {
  // Remove octave number from note name
  return noteName.replace(/\d+$/, '');
}

/**
 * Find common tones (same pitch class) between two sets of notes
 */
function findCommonTones(notesA: string[], notesB: string[]): string[] {
  const pitchClassesA = new Set(notesA.map(getPitchClass));
  const commonTones: string[] = [];

  for (const noteB of notesB) {
    const pitchClassB = getPitchClass(noteB);
    if (pitchClassesA.has(pitchClassB) && !commonTones.includes(pitchClassB)) {
      commonTones.push(pitchClassB);
    }
  }

  return commonTones;
}

/**
 * Count how many common tones are retained in the same voice
 */
function countRetainedCommonTones(
  prevVoicing: Voices,
  currVoicing: Voices,
  commonTones: string[]
): number {
  let retainedCount = 0;
  const voiceTypes: VoiceType[] = ['soprano', 'alto', 'tenor', 'bass'];

  for (const voice of voiceTypes) {
    const prevPitchClass = getPitchClass(prevVoicing[voice]);
    const currPitchClass = getPitchClass(currVoicing[voice]);

    // If the same pitch class is in the same voice, it's retained
    if (prevPitchClass === currPitchClass && commonTones.includes(prevPitchClass)) {
      retainedCount++;
    }
  }

  return retainedCount;
}

// ============================================================================
// PHASE 6: VOICE CROSSING DETECTION
// ============================================================================

/**
 * Detect if any voice crosses above/below its typical range
 */
function detectVoiceCrossing(voicing: Voices): VoiceType[] {
  const crossings: VoiceType[] = [];
  const midiValues = {
    soprano: noteToMidi(voicing.soprano),
    alto: noteToMidi(voicing.alto),
    tenor: noteToMidi(voicing.tenor),
    bass: noteToMidi(voicing.bass),
  };

  // Check voice ranges: soprano > alto > tenor > bass
  if (midiValues.soprano < midiValues.alto) {
    crossings.push('soprano');
  }
  if (midiValues.alto < midiValues.tenor) {
    crossings.push('alto');
  }
  if (midiValues.tenor < midiValues.bass) {
    crossings.push('tenor');
  }

  return crossings;
}

/**
 * Detect if voices overlap (more than an octave between adjacent voices)
 */
function detectVoiceOverlap(
  _prevVoicing: Voices,
  currVoicing: Voices
): Array<{ voice1: VoiceType; voice2: VoiceType }> {
  const overlaps: Array<{ voice1: VoiceType; voice2: VoiceType }> = [];
  const maxSpacing = 12; // More than octave is overlap

  const sopranoMidi = noteToMidi(currVoicing.soprano);
  const altoMidi = noteToMidi(currVoicing.alto);
  const tenorMidi = noteToMidi(currVoicing.tenor);
  const bassMidi = noteToMidi(currVoicing.bass);

  // Check spacing between adjacent voices
  if (sopranoMidi - altoMidi > maxSpacing) {
    overlaps.push({ voice1: 'soprano', voice2: 'alto' });
  }
  if (altoMidi - tenorMidi > maxSpacing) {
    overlaps.push({ voice1: 'alto', voice2: 'tenor' });
  }
  if (tenorMidi - bassMidi > maxSpacing) {
    overlaps.push({ voice1: 'tenor', voice2: 'bass' });
  }

  return overlaps;
}

/**
 * Check if adding a note to a voice would cause voice crossing
 */
export function wouldCauseVoiceCrossing(
  partialVoicing: Partial<Voices>,
  voice: VoiceType,
  note: string
): boolean {
  const midi = noteToMidi(note);
  const voiceOrder: VoiceType[] = ['soprano', 'alto', 'tenor', 'bass'];
  const voiceIndex = voiceOrder.indexOf(voice);

  // Check against higher voices
  for (let i = 0; i < voiceIndex; i++) {
    const higherVoice = voiceOrder[i];
    if (partialVoicing[higherVoice]) {
      const higherMidi = noteToMidi(partialVoicing[higherVoice]);
      if (midi > higherMidi) {
        return true; // Would cross above higher voice
      }
    }
  }

  // Check against lower voices
  for (let i = voiceIndex + 1; i < voiceOrder.length; i++) {
    const lowerVoice = voiceOrder[i];
    if (partialVoicing[lowerVoice]) {
      const lowerMidi = noteToMidi(partialVoicing[lowerVoice]);
      if (midi < lowerMidi) {
        return true; // Would cross below lower voice
      }
    }
  }

  return false;
}

// ============================================================================
// PHASE 7: RESOLUTION RULES
// ============================================================================

/**
 * Identify tendency tones that need resolution
 */
function identifyTendencyTones(
  voicing: Voices,
  chordNotes: string[],
  key: MusicalKey
): TendencyTone[] {
  const tendencies: TendencyTone[] = [];
  const voiceTypes: VoiceType[] = ['soprano', 'alto', 'tenor', 'bass'];
  const leadingTone = getLeadingTone(key);

  for (const voice of voiceTypes) {
    const noteName = voicing[voice];
    const pitchClass = getPitchClass(noteName);

    // Check for leading tone (wants to resolve up to tonic)
    if (pitchClass === leadingTone) {
      const tonicNote = key + '4'; // Default octave
      tendencies.push({
        noteName,
        voice,
        resolutionNote: tonicNote,
        tendency: 'up',
      });
    }

    // Check for seventh (wants to resolve down)
    if (chordNotes.length >= 4) {
      const seventhNote = chordNotes[chordNotes.length - 1];
      if (pitchClass === getPitchClass(seventhNote)) {
        const downNote = Note.transpose(pitchClass, '-m2');
        if (downNote) {
          tendencies.push({
            noteName,
            voice,
            resolutionNote: downNote + '4',
            tendency: 'down',
          });
        }
      }
    }

    // Check for suspension (wants to resolve to consonant tone)
    // sus4 resolves to 3rd (down)
    // sus2 resolves to root (up)
    // This is handled case-by-case in context
  }

  return tendencies;
}

/**
 * Get the leading tone for a key
 */
function getLeadingTone(key: MusicalKey): string {
  // Leading tone is the 7th degree of the major scale
  const scale = Scale.get(`${key} major`);
  if (!scale.notes || scale.notes.length < 7) {
    return 'B'; // Fallback
  }
  return getPitchClass(scale.notes[6]); // 7th degree (0-indexed)
}

/**
 * Check if tendency tones are properly resolved
 */
function checkResolutions(
  _prevVoicing: Voices,
  currVoicing: Voices,
  tendencies: TendencyTone[]
): string[] {
  const issues: string[] = [];

  for (const tendency of tendencies) {
    const currentNote = currVoicing[tendency.voice];

    if (tendency.tendency === 'up') {
      // Should resolve up (or stay)
      const prevMidi = noteToMidi(tendency.noteName);
      const currMidi = noteToMidi(currentNote);

      if (currMidi < prevMidi) {
        issues.push(`${tendency.voice} leading tone resolved down instead of up`);
      }
    } else if (tendency.tendency === 'down') {
      // Should resolve down (or stay)
      const prevMidi = noteToMidi(tendency.noteName);
      const currMidi = noteToMidi(currentNote);

      if (currMidi > prevMidi) {
        issues.push(`${tendency.voice} seventh resolved up instead of down`);
      }
    }
  }

  return issues;
}

// ============================================================================
// PHASE 8: VALIDATION FUNCTION
// ============================================================================

/**
 * Comprehensive voice leading validation
 */
export function validateVoiceLeading(
  prevVoicing: Voices,
  currVoicing: Voices,
  currChordNotes: string[],
  key: MusicalKey,
  _hasSuspension: boolean = false
): VoiceLeadingValidation {
  // Get chord notes for common tone analysis
  const prevChordNotes = Object.values(prevVoicing) as string[];
  const commonTones = findCommonTones(prevChordNotes, currChordNotes);

  // Identify tendency tones
  const tendencies = identifyTendencyTones(currVoicing, currChordNotes, key);

  // Check all validations
  const parallelFifths = detectParallelMotion(prevVoicing, currVoicing);
  const voiceCrossings = detectVoiceCrossing(currVoicing);
  const voiceOverlaps = detectVoiceOverlap(prevVoicing, currVoicing);
  const commonTonesRetained = countRetainedCommonTones(prevVoicing, currVoicing, commonTones);
  const tendencyToneIssues = checkResolutions(prevVoicing, currVoicing, tendencies);

  // Check parallel octaves separately
  const parallelOctaves: Array<{ voice1: VoiceType; voice2: VoiceType }> = [];
  const voiceTypes: VoiceType[] = ['soprano', 'alto', 'tenor', 'bass'];
  for (let i = 0; i < voiceTypes.length; i++) {
    for (let j = i + 1; j < voiceTypes.length; j++) {
      if (hasParallelOctaves(prevVoicing, currVoicing, voiceTypes[i], voiceTypes[j])) {
        parallelOctaves.push({ voice1: voiceTypes[i], voice2: voiceTypes[j] });
      }
    }
  }

  const valid =
    parallelFifths.length === 0 &&
    parallelOctaves.length === 0 &&
    voiceCrossings.length === 0 &&
    voiceOverlaps.length === 0 &&
    tendencyToneIssues.length === 0;

  return {
    valid,
    parallelFifths,
    parallelOctaves,
    voiceCrossings,
    voiceOverlaps,
    commonTonesRetained,
    tendencyToneIssues,
  };
}

/**
 * Find the best note from the chord to assign to a voice
 * considering voice range and distance from previous voicing
 */
function findBestVoiceNote(
  chordNotes: string[],
  voiceRange: { low: number; high: number },
  previousMidi?: number,
  preferredVoices?: number[]
): string {
  if (chordNotes.length === 0) {
    return 'C4'; // Fallback
  }

  // Generate candidates for this voice within the range
  const candidates = chordNotes.flatMap((note) => {
    const rootMidi = noteToMidi(note);
    const candidates: { note: string; midi: number }[] = [];

    // Try the note in multiple octaves
    for (let octave = -2; octave <= 2; octave++) {
      const midi = rootMidi + octave * 12;
      if (midi >= voiceRange.low && midi <= voiceRange.high) {
        candidates.push({ note: midiToNote(midi), midi });
      }
    }

    return candidates;
  });

  if (candidates.length === 0) {
    // Fallback: transpose any available note into range
    return fitToRange(chordNotes[0], voiceRange);
  }

  // Score candidates: prefer closer voice leading, then avoid extreme ranges
  const scored = candidates.map((candidate) => {
    let score = 0;

    // Prefer notes close to previous position
    if (previousMidi !== undefined) {
      const distance = getVoiceLeadingDistance(previousMidi, candidate.midi);
      score -= distance * 0.1; // Lower distance = higher score
    }

    // Prefer middle of range
    const rangeMiddle = (voiceRange.low + voiceRange.high) / 2;
    const distanceFromMiddle = Math.abs(candidate.midi - rangeMiddle);
    score -= distanceFromMiddle * 0.05;

    // Apply preferred voices if given
    if (preferredVoices && preferredVoices.includes(candidate.midi)) {
      score += 5;
    }

    return { ...candidate, score };
  });

  // Return highest scored candidate
  return scored.sort((a, b) => b.score - a.score)[0].note;
}

/**
 * Generate a default SATB voicing for the first chord
 * For 7th chords: Bass gets root, Tenor gets 3rd, Alto gets 5th, Soprano gets 7th
 */
function generateDefaultVoicing(chordNotes: string[]): Voices {
  if (chordNotes.length === 0) {
    return { soprano: 'C5', alto: 'G4', tenor: 'E3', bass: 'C3' };
  }

  const root = chordNotes[0];
  const bass = fitToRange(root, VOICE_RANGES.bass);

  // For 7th chords or extended chords (4+ notes), use specific voice assignments
  if (chordNotes.length >= 4) {
    // Categorize notes by interval from root
    const rootMidi = noteToMidi(root);
    const notesByInterval: Record<string, string> = {
      third: '',
      fifth: '',
      seventh: ''
    };

    for (const note of chordNotes.slice(1)) {
      const noteMidi = noteToMidi(note);
      const interval = (noteMidi - rootMidi + 12) % 12; // Normalize to 0-11

      if ((interval === 4 || interval === 3) && !notesByInterval.third) {
        notesByInterval.third = note; // Major or minor third
      } else if (interval === 7 && !notesByInterval.fifth) {
        notesByInterval.fifth = note; // Perfect fifth
      } else if ((interval === 10 || interval === 11) && !notesByInterval.seventh) {
        notesByInterval.seventh = note; // Minor or major seventh
      }
    }

    // Assign with fallback
    const tenor = notesByInterval.third ? fitToRange(notesByInterval.third, VOICE_RANGES.tenor) : fitToRange(chordNotes[1], VOICE_RANGES.tenor);
    const alto = notesByInterval.fifth ? fitToRange(notesByInterval.fifth, VOICE_RANGES.alto) : fitToRange(chordNotes[2] || chordNotes[1], VOICE_RANGES.alto);
    const soprano = notesByInterval.seventh ? fitToRange(notesByInterval.seventh, VOICE_RANGES.soprano) : fitToRange(chordNotes[chordNotes.length - 1], VOICE_RANGES.soprano);

    return { soprano, alto, tenor, bass };
  }

  // For triads, use original logic
  const upperNotes = chordNotes.slice(1);
  if (upperNotes.length === 0) {
    upperNotes.push(chordNotes[0]); // Duplicate root if needed
  }

  const tenor = fitToRange(upperNotes[0], VOICE_RANGES.tenor);
  const alto = fitToRange(upperNotes[upperNotes.length - 1], VOICE_RANGES.alto);
  const soprano = fitToRange(chordNotes[chordNotes.length - 1], VOICE_RANGES.soprano);

  return { soprano, alto, tenor, bass };
}

/**
 * Generate SATB voicing using voice leading from previous voicing
 * Always puts the root in the bass for clear chord identity
 * For 7th chords (4+ notes), prioritizes root, 3rd, 5th, 7th
 */
function voiceLeadFromPrevious(
  chordNotes: string[],
  previousVoicing: Voices
): Voices {
  if (chordNotes.length === 0) {
    return previousVoicing;
  }

  const previousMidis: Record<VoiceType, number> = {
    soprano: noteToMidi(previousVoicing.soprano),
    alto: noteToMidi(previousVoicing.alto),
    tenor: noteToMidi(previousVoicing.tenor),
    bass: noteToMidi(previousVoicing.bass),
  };

  const voicing: Voices = { soprano: 'C4', alto: 'G3', tenor: 'E3', bass: 'C3' };
  const usedNotes = new Set<string>();

  // Always put the root (first chord note) in the bass for clear chord identity
  const root = chordNotes[0];
  voicing.bass = fitToRange(root, VOICE_RANGES.bass);
  usedNotes.add(root.replace(/\d+$/, ''));

  // For 7th chords or extended chords (4+ notes), use specific voice priorities
  if (chordNotes.length >= 4) {
    // Priority order: 3rd, 7th, 5th, extensions
    // This ensures important chord tones are voiced

    // Estimate which notes are 3rd, 5th, 7th based on interval from root
    const rootMidi = noteToMidi(root);
    const notesByInterval: Record<string, string[]> = {
      third: [],
      fifth: [],
      seventh: [],
      other: []
    };

    for (const note of chordNotes) {
      if (note === root || usedNotes.has(note.replace(/\d+$/, ''))) continue;

      const noteMidi = noteToMidi(note);
      const interval = (noteMidi - rootMidi + 12) % 12; // Normalize to 0-11

      if (interval === 4 || interval === 3) {
        notesByInterval.third.push(note); // Major or minor third
      } else if (interval === 7) {
        notesByInterval.fifth.push(note); // Perfect fifth
      } else if (interval === 10 || interval === 11) {
        notesByInterval.seventh.push(note); // Minor or major seventh
      } else {
        notesByInterval.other.push(note); // Extensions
      }
    }

    // Assign to voices: tenor gets 3rd, alto gets 5th, soprano gets 7th
    const voiceAssignments: Array<{ voice: VoiceType; notes: string[] }> = [
      { voice: 'tenor', notes: notesByInterval.third },
      { voice: 'alto', notes: notesByInterval.fifth },
      { voice: 'soprano', notes: [...notesByInterval.seventh, ...notesByInterval.other] }
    ];

    for (const assignment of voiceAssignments) {
      const availableNotes = assignment.notes.filter((n) => !usedNotes.has(n.replace(/\d+$/, '')));

      // Fallback to any unused notes if preferred notes exhausted
      if (availableNotes.length === 0) {
        for (const note of chordNotes) {
          if (!usedNotes.has(note.replace(/\d+$/, ''))) {
            availableNotes.push(note);
          }
        }
      }

      if (availableNotes.length === 0) {
        availableNotes.push(...chordNotes);
      }

      const previousMidi = previousMidis[assignment.voice];
      const selectedNote = findBestVoiceNote(
        availableNotes,
        VOICE_RANGES[assignment.voice],
        previousMidi
      );

      voicing[assignment.voice] = selectedNote;
      usedNotes.add(selectedNote.replace(/\d+$/, ''));
    }
  } else {
    // For triads, use original logic: assign remaining notes to soprano, alto, tenor
    const upperVoices: VoiceType[] = ['soprano', 'alto', 'tenor'];
    for (const voice of upperVoices) {
      const availableNotes = chordNotes.filter((n) => !usedNotes.has(n.replace(/\d+$/, '')));

      if (availableNotes.length === 0) {
        // All chord notes used, allow any chord note
        availableNotes.push(...chordNotes);
      }

      const previousMidi = previousMidis[voice];
      const selectedNote = findBestVoiceNote(
        availableNotes,
        VOICE_RANGES[voice],
        previousMidi
      );

      voicing[voice] = selectedNote;
      usedNotes.add(selectedNote.replace(/\d+$/, '')); // Mark pitch class as used
    }
  }

  return voicing;
}

/**
 * Generate SATB voicing for a chord
 * If previousVoicing is provided, uses voice leading; otherwise generates default
 */
export function generateSATBVoicing(
  chord: Chord,
  previousVoicing?: Voices
): Voices {
  // Get the actual root note from the scale degree
  const rootPitchClass = getRootFromScaleDegree(chord.key, chord.mode, chord.scaleDegree);

  // Build chord symbol with quality
  // Tonal.js uses: "" for major, "m" for minor, "dim" for diminished
  let qualitySuffix = '';
  switch (chord.quality) {
    case 'minor':
      qualitySuffix = 'm';
      break;
    case 'diminished':
      qualitySuffix = 'dim';
      break;
    case 'augmented':
      qualitySuffix = 'aug';
      break;
    case 'dom7':
      qualitySuffix = '7';
      break;
    case 'maj7':
      qualitySuffix = 'maj7';
      break;
    case 'min7':
      qualitySuffix = 'm7';
      break;
    case 'halfdim7':
      qualitySuffix = 'm7b5';
      break;
    case 'dim7':
      qualitySuffix = 'dim7';
      break;
  }
  const chordSymbol = `${rootPitchClass}${qualitySuffix}`;

  let chordNotes = getChordNotes(chordSymbol);

  // getChordNotes returns pitch classes without octaves (e.g., ['C', 'E', 'G'])
  // We need to add a default octave (4) for MIDI conversion
  if (chordNotes.length > 0) {
    // Add octave 4 to pitch classes for MIDI processing
    chordNotes = chordNotes.map(note => {
      // If note already has octave, keep it; otherwise add octave 4
      return /\d$/.test(note) ? note : `${note}4`;
    });
  } else {
    // Fallback to basic triad if tonal doesn't recognize the symbol
    // Build basic triad/7th manually with default octave 4
    const rootWithOctave = `${rootPitchClass}4`;
    const rootMidi = noteToMidi(rootWithOctave);

    // Build base triad intervals
    const intervals = [0, 7]; // root and perfect fifth

    if (chord.quality === 'major') {
      intervals.splice(1, 0, 4); // Major third at position 1
    } else if (chord.quality === 'diminished' || chord.quality === 'dim7' || chord.quality === 'halfdim7') {
      intervals.splice(1, 0, 3); // Minor third
      if (chord.quality === 'diminished') {
        intervals[2] = 6; // Diminished fifth
      } else {
        intervals[2] = 6; // Diminished fifth for dim/halfdim
      }
    } else {
      // Minor or other qualities
      intervals.splice(1, 0, 3); // Minor third
    }

    // Add 7th for 7th chords
    if (['dom7', 'maj7', 'min7', 'halfdim7', 'dim7'].includes(chord.quality)) {
      const seventhInterval = chord.quality === 'maj7' ? 11 : 10; // maj7 = 11 semitones, min7/dom7 = 10
      intervals.push(seventhInterval);
    }

    chordNotes = intervals.map(interval => midiToNote(rootMidi + interval));
  }

  // Add extension notes
  if (chord.extensions && Object.keys(chord.extensions).length > 0) {
    const rootWithOctave = chordNotes[0].replace(/\d+$/, '') + '4';
    const rootMidi = noteToMidi(rootWithOctave);
    const extensionIntervals = getExtensionIntervals(chord.extensions);

    // Add extension notes (avoiding duplicates)
    const existingPitchClasses = new Set(chordNotes.map(n => n.replace(/\d+$/, '')));

    for (const interval of extensionIntervals) {
      const extensionNote = midiToNote(rootMidi + interval);
      const pitchClass = extensionNote.replace(/\d+$/, '');

      // Don't duplicate existing chord notes
      if (!existingPitchClasses.has(pitchClass)) {
        chordNotes.push(extensionNote);
        existingPitchClasses.add(pitchClass);
      }
    }
  }

  if (!previousVoicing) {
    return generateDefaultVoicing(chordNotes);
  }

  return voiceLeadFromPrevious(chordNotes, previousVoicing);
}
