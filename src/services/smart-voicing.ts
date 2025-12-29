/**
 * Smart Voicing Service
 *
 * Provides intelligent voice assignment for 4-voice (SATB) and 8-voice (SSAATTBB)
 * arrangements, using shell voicing principles from jazz theory.
 *
 * Shell voicing rules:
 * - 7th chords: root, 3rd, 5th, 7th (5th often omittable)
 * - 9th chords: root, 3rd, 7th, 9th (drop 5th)
 * - 11th chords: root, 7th, 9th, 11th (often drop 3rd due to E-F clash)
 * - 13th chords: root, 3rd, 7th, 13th (drop 5th, 9th, 11th)
 */

import { Note, Chord as TonalChord, Scale } from 'tonal';
import type { Chord, ChordExtensions, MusicalKey, Mode, ScaleDegree } from '@/types';
import type { VoiceCount } from '@/types/necklace';
import { VOICE_RANGES, VOICE_RANGES_8 } from '@/data/voice-ranges';

// ============================================================================
// TYPES
// ============================================================================

export interface Voices4 {
  soprano: string;
  alto: string;
  tenor: string;
  bass: string;
}

export interface Voices8 {
  sopranoI: string;
  sopranoII: string;
  altoI: string;
  altoII: string;
  tenorI: string;
  tenorII: string;
  bassI: string;
  bassII: string;
}

export type SmartVoices = Voices4 | Voices8;

export type VoicingStyle = 'classical' | 'jazz' | 'modern';

export interface SmartVoicingOptions {
  voiceCount: VoiceCount;
  style: VoicingStyle;
  preferShellVoicing: boolean;
}

export const DEFAULT_VOICING_OPTIONS: SmartVoicingOptions = {
  voiceCount: 4,
  style: 'classical',
  preferShellVoicing: true,
};

// ============================================================================
// CHORD TONE CLASSIFICATION
// ============================================================================

interface ChordTone {
  pitchClass: string;
  interval: number;  // Semitones from root
  role: 'root' | 'third' | 'fifth' | 'seventh' | 'ninth' | 'eleventh' | 'thirteenth' | 'other';
  priority: number;  // Higher = more essential
}

/**
 * Classify chord tones by their harmonic role and priority
 */
function classifyChordTones(
  chordNotes: string[],
  root: string,
  hasExtensions: boolean
): ChordTone[] {
  const rootMidi = Note.midi(root + '4') || 60;

  return chordNotes.map(note => {
    const noteMidi = Note.midi(note + '4') || 60;
    const interval = ((noteMidi - rootMidi) % 12 + 12) % 12;

    let role: ChordTone['role'] = 'other';
    let priority = 50;

    // Classify by interval
    switch (interval) {
      case 0:
        role = 'root';
        priority = 100;  // Essential - defines chord
        break;
      case 3:
      case 4:
        role = 'third';
        priority = 95;   // Defines major/minor quality
        break;
      case 6:
      case 7:
        role = 'fifth';
        priority = hasExtensions ? 60 : 80;  // Less essential with extensions
        break;
      case 10:
      case 11:
        role = 'seventh';
        priority = 90;   // Defines 7th character
        break;
      case 1:
      case 2:
        role = 'ninth';
        priority = 75;   // Color tone
        break;
      case 5:
        role = 'eleventh';
        priority = 55;   // Often clashes with 3rd
        break;
      case 8:
      case 9:
        role = 'thirteenth';
        priority = 80;   // Important color tone
        break;
    }

    return {
      pitchClass: note.replace(/\d+$/, ''),
      interval,
      role,
      priority,
    };
  });
}

/**
 * Determine chord type from quality and extensions
 */
type ChordType = 'triad' | '7th' | '9th' | '11th' | '13th';

function getChordType(quality: string, extensions?: ChordExtensions): ChordType {
  if (extensions?.add13) return '13th';
  if (extensions?.add11) return '11th';
  if (extensions?.add9) return '9th';
  if (['dom7', 'maj7', 'min7', 'halfdim7', 'dim7'].includes(quality)) return '7th';
  return 'triad';
}

// ============================================================================
// SHELL VOICING SELECTION
// ============================================================================

/**
 * Select which chord tones to use based on shell voicing principles
 * Returns 4 pitch classes for 4-voice, 8 for 8-voice
 */
function selectShellVoicingTones(
  tones: ChordTone[],
  chordType: ChordType,
  voiceCount: VoiceCount,
  style: VoicingStyle
): string[] {
  const tonesMap = new Map<ChordTone['role'], ChordTone>();
  for (const tone of tones) {
    if (!tonesMap.has(tone.role) || tone.priority > tonesMap.get(tone.role)!.priority) {
      tonesMap.set(tone.role, tone);
    }
  }

  const root = tonesMap.get('root')?.pitchClass;
  const third = tonesMap.get('third')?.pitchClass;
  const fifth = tonesMap.get('fifth')?.pitchClass;
  const seventh = tonesMap.get('seventh')?.pitchClass;
  const ninth = tonesMap.get('ninth')?.pitchClass;
  const eleventh = tonesMap.get('eleventh')?.pitchClass;
  const thirteenth = tonesMap.get('thirteenth')?.pitchClass;

  if (!root) return tones.map(t => t.pitchClass).slice(0, voiceCount);

  let selected: (string | undefined)[] = [];

  if (voiceCount === 4) {
    // 4-voice shell voicing rules
    switch (chordType) {
      case 'triad':
        // Root, 3rd, 5th, double root
        selected = [root, third, fifth, root];
        break;

      case '7th':
        // Root, 3rd, 5th (or omit), 7th
        selected = [root, third, fifth || root, seventh];
        break;

      case '9th':
        // Root, 3rd, 7th, 9th (drop 5th)
        selected = [root, third, seventh, ninth];
        break;

      case '11th':
        // Jazz style often drops 3rd due to E-F clash
        if (style === 'jazz' || style === 'modern') {
          // Root, 7th, 9th/11th, 11th
          selected = [root, seventh, ninth || eleventh, eleventh];
        } else {
          // Classical: keep 3rd, drop 5th and 9th
          selected = [root, third, seventh, eleventh];
        }
        break;

      case '13th':
        // Root, 3rd, 7th, 13th (drop 5th, 9th, 11th)
        selected = [root, third, seventh, thirteenth];
        break;
    }
  } else {
    // 8-voice: can use all tones with doubling
    switch (chordType) {
      case 'triad':
        // Double everything, prioritize root doubling
        selected = [root, root, third, third, fifth, fifth, root, root];
        break;

      case '7th':
        // All 4 tones doubled
        selected = [seventh, root, fifth, third, third, root, root, root];
        break;

      case '9th':
        // 5 tones: root, 3rd, 5th, 7th, 9th + doubling
        selected = [ninth, seventh, fifth, third, third, root, root, root];
        break;

      case '11th':
        // 6 tones distributed
        selected = [eleventh, ninth, seventh, fifth || third, third, root, root, root];
        break;

      case '13th':
        // All 7 tones (omit 11th if needed)
        selected = [thirteenth, ninth, seventh, fifth || third, third, seventh, root, root];
        break;
    }
  }

  // Fill any undefined slots with available tones
  const availableTones = tones.map(t => t.pitchClass);
  return selected.map((s, i) => s || availableTones[i % availableTones.length] || root!);
}

// ============================================================================
// NOTE PLACEMENT
// ============================================================================

/**
 * Convert note name to MIDI number
 */
function noteToMidi(noteName: string): number {
  const midi = Note.midi(noteName);
  if (midi === null) throw new Error(`Invalid note: ${noteName}`);
  return midi;
}

/**
 * Convert MIDI number to note name
 */
function midiToNote(midi: number): string {
  const note = Note.fromMidi(midi);
  if (!note) throw new Error(`Invalid MIDI: ${midi}`);
  return note;
}

/**
 * Fit a pitch class to a voice range, choosing the best octave
 */
function fitToVoiceRange(
  pitchClass: string,
  range: { lowMidi: number; highMidi: number; comfortableLowMidi: number; comfortableHighMidi: number },
  previousMidi?: number
): string {
  const baseMidi = Note.midi(pitchClass + '4') || 60;
  const candidates: number[] = [];

  // Generate all octaves that could fit in range
  for (let octaveShift = -3; octaveShift <= 3; octaveShift++) {
    const midi = baseMidi + (octaveShift * 12);
    if (midi >= range.lowMidi && midi <= range.highMidi) {
      candidates.push(midi);
    }
  }

  if (candidates.length === 0) {
    // Force fit to range edge
    let midi = baseMidi;
    while (midi < range.lowMidi) midi += 12;
    while (midi > range.highMidi) midi -= 12;
    return midiToNote(Math.max(range.lowMidi, Math.min(midi, range.highMidi)));
  }

  // Score candidates
  const scored = candidates.map(midi => {
    let score = 0;

    // Prefer comfortable range
    if (midi >= range.comfortableLowMidi && midi <= range.comfortableHighMidi) {
      score += 20;
    }

    // Prefer small voice leading distance
    if (previousMidi !== undefined) {
      const distance = Math.abs(midi - previousMidi);
      score -= distance * 0.5;
    }

    // Prefer middle of range
    const middle = (range.lowMidi + range.highMidi) / 2;
    score -= Math.abs(midi - middle) * 0.1;

    return { midi, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return midiToNote(scored[0].midi);
}

// ============================================================================
// MAIN VOICING FUNCTION
// ============================================================================

/**
 * Get the root note for a scale degree
 */
function getRootFromScaleDegree(key: MusicalKey, mode: Mode, scaleDegree: ScaleDegree): string {
  const scaleName = mode === 'major' ? 'major' : 'minor';
  const scaleNotes = Scale.get(`${key} ${scaleName}`).notes;

  if (!scaleNotes || scaleNotes.length === 0) {
    return key;
  }

  const noteIndex = scaleDegree - 1;
  if (noteIndex < 0 || noteIndex >= scaleNotes.length) {
    return key;
  }

  return scaleNotes[noteIndex];
}

/**
 * Get chord notes from chord symbol
 */
function getChordNotes(root: string, quality: string, extensions?: ChordExtensions): string[] {
  // Build chord symbol
  let suffix = '';
  switch (quality) {
    case 'minor': suffix = 'm'; break;
    case 'diminished': suffix = 'dim'; break;
    case 'augmented': suffix = 'aug'; break;
    case 'dom7': suffix = '7'; break;
    case 'maj7': suffix = 'maj7'; break;
    case 'min7': suffix = 'm7'; break;
    case 'halfdim7': suffix = 'm7b5'; break;
    case 'dim7': suffix = 'dim7'; break;
  }

  const chordSymbol = `${root}${suffix}`;
  let notes = TonalChord.get(chordSymbol).notes || [];

  // Add extension notes
  if (extensions) {
    const rootMidi = Note.midi(root + '4') || 60;

    if (extensions.add9) {
      const ninth = midiToNote(rootMidi + 14);
      notes.push(ninth.replace(/\d+$/, ''));
    }
    if (extensions.add11) {
      const eleventh = midiToNote(rootMidi + 17);
      notes.push(eleventh.replace(/\d+$/, ''));
    }
    if (extensions.add13) {
      const thirteenth = midiToNote(rootMidi + 21);
      notes.push(thirteenth.replace(/\d+$/, ''));
    }
  }

  // Remove duplicates
  return [...new Set(notes)];
}

/**
 * Generate smart voicing for a chord
 */
export function generateSmartVoicing(
  chord: Chord,
  options: SmartVoicingOptions = DEFAULT_VOICING_OPTIONS,
  previousVoicing?: SmartVoices
): SmartVoices {
  const root = getRootFromScaleDegree(chord.key, chord.mode, chord.scaleDegree);
  const chordNotes = getChordNotes(root, chord.quality, chord.extensions);
  const chordType = getChordType(chord.quality, chord.extensions);
  const hasExtensions = chordType !== 'triad' && chordType !== '7th';

  // Classify chord tones
  const tones = classifyChordTones(chordNotes, root, hasExtensions);

  // Select tones for voicing
  const selectedTones = options.preferShellVoicing
    ? selectShellVoicingTones(tones, chordType, options.voiceCount, options.style)
    : chordNotes.slice(0, options.voiceCount);

  if (options.voiceCount === 4) {
    return generate4VoiceVoicing(selectedTones, previousVoicing as Voices4 | undefined);
  } else {
    return generate8VoiceVoicing(selectedTones, previousVoicing as Voices8 | undefined);
  }
}

/**
 * Generate 4-voice SATB voicing
 */
function generate4VoiceVoicing(
  pitchClasses: string[],
  previousVoicing?: Voices4
): Voices4 {
  // Ensure we have 4 pitch classes
  while (pitchClasses.length < 4) {
    pitchClasses.push(pitchClasses[0]);
  }

  // Assign from bottom up: bass, tenor, alto, soprano
  // Typically: bass=root, tenor=3rd or low, alto=middle, soprano=top
  const [bassPC, tenorPC, altoPC, sopranoPC] = pitchClasses;

  const bass = fitToVoiceRange(
    bassPC,
    VOICE_RANGES.bass,
    previousVoicing ? noteToMidi(previousVoicing.bass) : undefined
  );

  const tenor = fitToVoiceRange(
    tenorPC,
    VOICE_RANGES.tenor,
    previousVoicing ? noteToMidi(previousVoicing.tenor) : undefined
  );

  const alto = fitToVoiceRange(
    altoPC,
    VOICE_RANGES.alto,
    previousVoicing ? noteToMidi(previousVoicing.alto) : undefined
  );

  const soprano = fitToVoiceRange(
    sopranoPC,
    VOICE_RANGES.soprano,
    previousVoicing ? noteToMidi(previousVoicing.soprano) : undefined
  );

  // Ensure proper voice ordering (soprano > alto > tenor > bass)
  const voicing = ensureVoiceOrdering({ soprano, alto, tenor, bass });

  return voicing;
}

/**
 * Generate 8-voice SSAATTBB voicing
 */
function generate8VoiceVoicing(
  pitchClasses: string[],
  previousVoicing?: Voices8
): Voices8 {
  // Ensure we have 8 pitch classes
  while (pitchClasses.length < 8) {
    pitchClasses.push(pitchClasses[pitchClasses.length % pitchClasses.length]);
  }

  // Assign from top to bottom
  const [
    sopIPC, sopIIPC, altoIPC, altoIIPC,
    tenorIPC, tenorIIPC, bassIPC, bassIIPC
  ] = pitchClasses;

  const sopranoI = fitToVoiceRange(
    sopIPC,
    VOICE_RANGES_8.sopranoI,
    previousVoicing ? noteToMidi(previousVoicing.sopranoI) : undefined
  );

  const sopranoII = fitToVoiceRange(
    sopIIPC,
    VOICE_RANGES_8.sopranoII,
    previousVoicing ? noteToMidi(previousVoicing.sopranoII) : undefined
  );

  const altoI = fitToVoiceRange(
    altoIPC,
    VOICE_RANGES_8.altoI,
    previousVoicing ? noteToMidi(previousVoicing.altoI) : undefined
  );

  const altoII = fitToVoiceRange(
    altoIIPC,
    VOICE_RANGES_8.altoII,
    previousVoicing ? noteToMidi(previousVoicing.altoII) : undefined
  );

  const tenorI = fitToVoiceRange(
    tenorIPC,
    VOICE_RANGES_8.tenorI,
    previousVoicing ? noteToMidi(previousVoicing.tenorI) : undefined
  );

  const tenorII = fitToVoiceRange(
    tenorIIPC,
    VOICE_RANGES_8.tenorII,
    previousVoicing ? noteToMidi(previousVoicing.tenorII) : undefined
  );

  const bassI = fitToVoiceRange(
    bassIPC,
    VOICE_RANGES_8.bassI,
    previousVoicing ? noteToMidi(previousVoicing.bassI) : undefined
  );

  const bassII = fitToVoiceRange(
    bassIIPC,
    VOICE_RANGES_8.bassII,
    previousVoicing ? noteToMidi(previousVoicing.bassII) : undefined
  );

  return {
    sopranoI, sopranoII,
    altoI, altoII,
    tenorI, tenorII,
    bassI, bassII,
  };
}

/**
 * Ensure voice ordering constraint (soprano > alto > tenor > bass)
 * Adjusts octaves if needed to prevent crossing
 */
function ensureVoiceOrdering(voicing: Voices4): Voices4 {
  let sopMidi = noteToMidi(voicing.soprano);
  let altoMidi = noteToMidi(voicing.alto);
  let tenorMidi = noteToMidi(voicing.tenor);
  let bassMidi = noteToMidi(voicing.bass);

  // Bass should be lowest
  while (tenorMidi <= bassMidi && tenorMidi < VOICE_RANGES.tenor.highMidi) {
    tenorMidi += 12;
  }
  while (tenorMidi <= bassMidi && bassMidi > VOICE_RANGES.bass.lowMidi) {
    bassMidi -= 12;
  }

  // Tenor should be above bass
  while (altoMidi <= tenorMidi && altoMidi < VOICE_RANGES.alto.highMidi) {
    altoMidi += 12;
  }
  while (altoMidi <= tenorMidi && tenorMidi > VOICE_RANGES.tenor.lowMidi) {
    tenorMidi -= 12;
  }

  // Alto should be above tenor
  while (sopMidi <= altoMidi && sopMidi < VOICE_RANGES.soprano.highMidi) {
    sopMidi += 12;
  }
  while (sopMidi <= altoMidi && altoMidi > VOICE_RANGES.alto.lowMidi) {
    altoMidi -= 12;
  }

  return {
    soprano: midiToNote(sopMidi),
    alto: midiToNote(altoMidi),
    tenor: midiToNote(tenorMidi),
    bass: midiToNote(bassMidi),
  };
}

// ============================================================================
// CONVERSION UTILITIES
// ============================================================================

/**
 * Convert 4-voice voicing to the existing Voices format
 */
export function voices4ToVoices(v4: Voices4): import('@/types').Voices {
  return v4;
}

/**
 * Expand 4-voice voicing to 8-voice by doubling
 */
export function expand4To8Voices(v4: Voices4): Voices8 {
  const sopMidi = noteToMidi(v4.soprano);
  const altoMidi = noteToMidi(v4.alto);
  const tenorMidi = noteToMidi(v4.tenor);
  const bassMidi = noteToMidi(v4.bass);

  return {
    sopranoI: v4.soprano,
    sopranoII: midiToNote(Math.max(sopMidi - 2, VOICE_RANGES_8.sopranoII.lowMidi)),
    altoI: midiToNote(Math.min(altoMidi + 2, VOICE_RANGES_8.altoI.highMidi)),
    altoII: v4.alto,
    tenorI: midiToNote(Math.min(tenorMidi + 2, VOICE_RANGES_8.tenorI.highMidi)),
    tenorII: v4.tenor,
    bassI: v4.bass,
    bassII: midiToNote(Math.max(bassMidi - 12, VOICE_RANGES_8.bassII.lowMidi)),
  };
}

/**
 * Collapse 8-voice voicing to 4-voice by taking Part I voices
 */
export function collapse8To4Voices(v8: Voices8): Voices4 {
  return {
    soprano: v8.sopranoI,
    alto: v8.altoI,
    tenor: v8.tenorI,
    bass: v8.bassI,
  };
}
