import { Note, Interval, Chord as TonalChord, Scale } from 'tonal';
import type { MelodicNote, MelodicNoteAnalysis } from '@/types';
import type { Chord } from '@/types/chord';

interface NoteContext {
  currentChord: Chord;
  prevNote: MelodicNote | null;
  nextNote: MelodicNote | null;
  nextChord: Chord | null;
  prevChord: Chord | null;
}

/**
 * Get pitch classes from a chord
 * Builds a chord name from root and quality, then gets pitches using Tonal
 */
export function getChordPitchClasses(chord: Chord): string[] {
  try {
    // Build chord name from scale degree
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

    // Map quality to Tonal chord symbol
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
      return [];
    }

    // Extract pitch classes (remove octave)
    return tonalChord.notes.map(note => {
      const pc = Note.pitchClass(note);
      return pc;
    });
  } catch (error) {
    console.warn('Error getting chord pitch classes:', error);
    return [];
  }
}

/**
 * Check if a pitch class is in a chord
 */
function isChordTone(pitch: string, chord: Chord): boolean {
  const pitchClass = Note.pitchClass(pitch);
  const chordPitches = getChordPitchClasses(chord);
  return chordPitches.includes(pitchClass);
}

/**
 * Check if interval is stepwise (1 or 2 semitones)
 */
function isStepwise(fromMidi: number, toMidi: number): boolean {
  const interval = Math.abs(toMidi - fromMidi);
  return interval === 1 || interval === 2;
}

/**
 * Find the chord active at a given beat
 */
export function findChordAtBeat(beat: number, sortedChords: Chord[]): Chord | null {
  for (const chord of sortedChords) {
    if (beat >= chord.startBeat && beat < chord.startBeat + chord.duration) {
      return chord;
    }
  }
  return null;
}

/**
 * Check if note is a passing tone
 * - Stepwise between two chord tones
 * - Same direction as overall motion
 */
function isPassingTone(note: MelodicNote, context: NoteContext): boolean {
  if (!context.prevNote || !context.nextNote) {
    return false;
  }

  // Must be stepwise from previous note
  if (!isStepwise(context.prevNote.midi, note.midi)) {
    return false;
  }

  // Must be stepwise to next note
  if (!isStepwise(note.midi, context.nextNote.midi)) {
    return false;
  }

  // Previous note must be a chord tone
  if (!isChordTone(context.prevNote.pitch, context.prevChord || context.currentChord)) {
    return false;
  }

  // Next note must be a chord tone
  if (!isChordTone(context.nextNote.pitch, context.nextChord || context.currentChord)) {
    return false;
  }

  // Check direction is consistent (all up or all down)
  const prevDir = context.prevNote.midi < note.midi ? 1 : -1;
  const nextDir = note.midi < context.nextNote.midi ? 1 : -1;

  return prevDir === nextDir;
}

/**
 * Check if note is a neighbor tone
 * - Steps away and back to same pitch
 * - Original pitch is a chord tone
 */
function isNeighborTone(note: MelodicNote, context: NoteContext): boolean {
  if (!context.prevNote || !context.nextNote) {
    return false;
  }

  // Must be stepwise from previous note
  if (!isStepwise(context.prevNote.midi, note.midi)) {
    return false;
  }

  // Must be stepwise to next note
  if (!isStepwise(note.midi, context.nextNote.midi)) {
    return false;
  }

  // Next note must be same pitch as previous note
  if (context.nextNote.midi !== context.prevNote.midi) {
    return false;
  }

  // Previous note (and next note, same pitch) must be a chord tone
  return isChordTone(context.prevNote.pitch, context.prevChord || context.currentChord);
}

/**
 * Check if note is a suspension
 * - Held over from previous chord
 * - Resolves DOWN by step
 */
function isSuspension(note: MelodicNote, context: NoteContext): boolean {
  if (!context.prevNote || !context.nextNote || !context.prevChord) {
    return false;
  }

  // Must be same pitch as previous note (held)
  if (note.midi !== context.prevNote.midi) {
    return false;
  }

  // Must resolve down by step
  if (note.midi - context.nextNote.midi !== 1 && note.midi - context.nextNote.midi !== 2) {
    return false;
  }

  // Resolution must be downward
  if (note.midi <= context.nextNote.midi) {
    return false;
  }

  // Previous note must be a chord tone in previous chord
  if (!isChordTone(context.prevNote.pitch, context.prevChord)) {
    return false;
  }

  // Resolution must be a chord tone in current chord
  return isChordTone(context.nextNote.pitch, context.currentChord);
}

/**
 * Check if note is a retardation
 * - Like suspension but resolves UP by step
 */
function isRetardation(note: MelodicNote, context: NoteContext): boolean {
  if (!context.prevNote || !context.nextNote || !context.prevChord) {
    return false;
  }

  // Must be same pitch as previous note (held)
  if (note.midi !== context.prevNote.midi) {
    return false;
  }

  // Must resolve up by step
  if (context.nextNote.midi - note.midi !== 1 && context.nextNote.midi - note.midi !== 2) {
    return false;
  }

  // Resolution must be upward
  if (note.midi >= context.nextNote.midi) {
    return false;
  }

  // Previous note must be a chord tone in previous chord
  if (!isChordTone(context.prevNote.pitch, context.prevChord)) {
    return false;
  }

  // Resolution must be a chord tone in current chord
  return isChordTone(context.nextNote.pitch, context.currentChord);
}

/**
 * Check if note is an anticipation
 * - Previews a note from the next chord
 * - Often faster rhythmic value
 */
function isAnticipation(note: MelodicNote, context: NoteContext): boolean {
  if (!context.nextChord) {
    return false;
  }

  // Note must be a chord tone in the NEXT chord
  return isChordTone(note.pitch, context.nextChord);
}

/**
 * Check if note is an appoggiatura
 * - Approached by leap (usually)
 * - Resolved by step to a chord tone
 */
function isAppoggiatura(note: MelodicNote, context: NoteContext): boolean {
  if (!context.prevNote || !context.nextNote) {
    return false;
  }

  // Approached by leap (not stepwise)
  if (isStepwise(context.prevNote.midi, note.midi)) {
    return false;
  }

  // Must resolve by step
  if (!isStepwise(note.midi, context.nextNote.midi)) {
    return false;
  }

  // Resolution must be a chord tone
  return isChordTone(context.nextNote.pitch, context.currentChord);
}

/**
 * Check if note is an escape tone
 * - Steps away from previous note
 * - Leaps to next note (escapes)
 */
function isEscapeTone(note: MelodicNote, context: NoteContext): boolean {
  if (!context.prevNote || !context.nextNote) {
    return false;
  }

  // Must be stepwise from previous note
  if (!isStepwise(context.prevNote.midi, note.midi)) {
    return false;
  }

  // Must leap to next note
  if (isStepwise(note.midi, context.nextNote.midi)) {
    return false;
  }

  // Previous note should be a chord tone
  return isChordTone(context.prevNote.pitch, context.prevChord || context.currentChord);
}

/**
 * Check if note is a pedal tone
 * - Same pitch as previous and next note
 * - Harmony changes around it
 */
function isPedalTone(note: MelodicNote, context: NoteContext): boolean {
  if (!context.prevNote || !context.nextNote) {
    return false;
  }

  // Must be same pitch as both previous and next
  if (note.midi !== context.prevNote.midi || note.midi !== context.nextNote.midi) {
    return false;
  }

  // The note should not be a chord tone in current chord (or it's a chord tone but harmony has changed)
  // Typically a pedal tone is held while chords change
  return true;
}

/**
 * Analyze a single note within its harmonic context
 */
export function analyzeNote(note: MelodicNote, context: NoteContext): MelodicNoteAnalysis {
  // First check if it's a chord tone
  const isChord = isChordTone(note.pitch, context.currentChord);

  if (isChord) {
    // Calculate scale degree
    const scaleDegree = calculateScaleDegree(note.pitch, context.currentChord.key);

    // Calculate interval from previous note
    const interval = context.prevNote
      ? Interval.distance(
          Note.simplify(context.prevNote.pitch),
          Note.simplify(note.pitch)
        )
      : null;

    return {
      isChordTone: true,
      nonChordToneType: null,
      scaleDegree,
      interval,
      tendency: null,
    };
  }

  // Check non-chord-tone types in order of specificity
  // Check structural NCTs first (suspension, retardation, anticipation, pedal)
  // Then decorative NCTs (passing, neighbor, appoggiatura, escape)

  if (isSuspension(note, context)) {
    return {
      isChordTone: false,
      nonChordToneType: 'suspension',
      scaleDegree: calculateScaleDegree(note.pitch, context.currentChord.key),
      interval: context.prevNote
        ? Interval.distance(
            Note.simplify(context.prevNote.pitch),
            Note.simplify(note.pitch)
          )
        : null,
      tendency: 'down',
    };
  }

  if (isRetardation(note, context)) {
    return {
      isChordTone: false,
      nonChordToneType: 'retardation',
      scaleDegree: calculateScaleDegree(note.pitch, context.currentChord.key),
      interval: context.prevNote
        ? Interval.distance(
            Note.simplify(context.prevNote.pitch),
            Note.simplify(note.pitch)
          )
        : null,
      tendency: 'up',
    };
  }

  if (isAnticipation(note, context)) {
    return {
      isChordTone: false,
      nonChordToneType: 'anticipation',
      scaleDegree: calculateScaleDegree(note.pitch, context.currentChord.key),
      interval: context.prevNote
        ? Interval.distance(
            Note.simplify(context.prevNote.pitch),
            Note.simplify(note.pitch)
          )
        : null,
      tendency: null,
    };
  }

  if (isPedalTone(note, context)) {
    return {
      isChordTone: false,
      nonChordToneType: 'pedal',
      scaleDegree: calculateScaleDegree(note.pitch, context.currentChord.key),
      interval: null,
      tendency: 'static',
    };
  }

  if (isPassingTone(note, context)) {
    return {
      isChordTone: false,
      nonChordToneType: 'passing',
      scaleDegree: calculateScaleDegree(note.pitch, context.currentChord.key),
      interval: context.prevNote
        ? Interval.distance(
            Note.simplify(context.prevNote.pitch),
            Note.simplify(note.pitch)
          )
        : null,
      tendency: null,
    };
  }

  if (isNeighborTone(note, context)) {
    return {
      isChordTone: false,
      nonChordToneType: 'neighbor',
      scaleDegree: calculateScaleDegree(note.pitch, context.currentChord.key),
      interval: context.prevNote
        ? Interval.distance(
            Note.simplify(context.prevNote.pitch),
            Note.simplify(note.pitch)
          )
        : null,
      tendency: null,
    };
  }

  if (isAppoggiatura(note, context)) {
    return {
      isChordTone: false,
      nonChordToneType: 'appoggiatura',
      scaleDegree: calculateScaleDegree(note.pitch, context.currentChord.key),
      interval: context.prevNote
        ? Interval.distance(
            Note.simplify(context.prevNote.pitch),
            Note.simplify(note.pitch)
          )
        : null,
      tendency: null,
    };
  }

  if (isEscapeTone(note, context)) {
    return {
      isChordTone: false,
      nonChordToneType: 'escape',
      scaleDegree: calculateScaleDegree(note.pitch, context.currentChord.key),
      interval: context.prevNote
        ? Interval.distance(
            Note.simplify(context.prevNote.pitch),
            Note.simplify(note.pitch)
          )
        : null,
      tendency: null,
    };
  }

  // No match - unclassified non-chord tone
  return {
    isChordTone: false,
    nonChordToneType: null,
    scaleDegree: calculateScaleDegree(note.pitch, context.currentChord.key),
    interval: context.prevNote
      ? Interval.distance(
          Note.simplify(context.prevNote.pitch),
          Note.simplify(note.pitch)
        )
      : null,
    tendency: null,
  };
}

/**
 * Calculate scale degree relative to a key
 */
function calculateScaleDegree(pitch: string, key: string): number | null {
  try {
    const scale = Scale.get(`${key} major`).notes; // Use major for simplicity
    const pitchClass = Note.pitchClass(pitch);
    const index = scale.findIndex(note => Note.pitchClass(note) === pitchClass);
    return index >= 0 ? index + 1 : null;
  } catch (error) {
    console.warn('Error calculating scale degree:', error);
    return null;
  }
}

/**
 * Analyze a complete voice line
 * Returns the notes with updated analysis information
 */
export function analyzeVoiceLine(notes: MelodicNote[], chords: Chord[]): MelodicNote[] {
  if (notes.length === 0 || chords.length === 0) {
    return notes;
  }

  // Sort chords by startBeat for consistent chord lookup
  const sortedChords = [...chords].sort((a, b) => a.startBeat - b.startBeat);

  return notes.map((note, index) => {
    // Find the chord(s) active at this note's beat
    const noteStartBeat = note.startBeat;
    const currentChord = findChordAtBeat(noteStartBeat, sortedChords);

    if (!currentChord) {
      // No chord found - return note with minimal analysis
      return {
        ...note,
        analysis: {
          isChordTone: false,
          nonChordToneType: null,
          scaleDegree: null,
          interval: null,
          tendency: null,
        },
      };
    }

    // Build context for this note
    const prevNote = index > 0 ? notes[index - 1] : null;
    const nextNote = index < notes.length - 1 ? notes[index + 1] : null;

    // Find previous and next chords
    const prevChord = prevNote ? findChordAtBeat(prevNote.startBeat, sortedChords) : null;
    const nextChord = nextNote ? findChordAtBeat(nextNote.startBeat, sortedChords) : null;

    const context: NoteContext = {
      currentChord,
      prevNote,
      nextNote,
      nextChord,
      prevChord,
    };

    // Analyze the note
    const analysis = analyzeNote(note, context);

    return {
      ...note,
      analysis,
    };
  });
}
