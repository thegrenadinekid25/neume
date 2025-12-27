import { Note, Chord as TonalChord, Scale } from 'tonal';
import type { Chord, Voices, ScaleDegree, MusicalKey, Mode } from '@/types';

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
function getExtensionIntervals(extensions: any): number[] {
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
    let intervals = [0, 7]; // root and perfect fifth

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
