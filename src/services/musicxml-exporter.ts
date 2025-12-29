/**
 * MusicXML Exporter Service
 *
 * Converts progressions and voice lines to MusicXML 4.0 format
 * for use in notation software like MuseScore, Finale, Sibelius.
 */

import type { SavedProgression, TimeSignature } from '@/types/progression';
import type { Chord } from '@/types/chord';
import type { VoiceLine, VoicePart } from '@/types/voice-line';
import type { SyllableAssignment } from '@/types/text-setting';

// ============================================================================
// Types
// ============================================================================

export interface MusicXMLExportOptions {
  includeVoiceLines: boolean;
  includeLyrics: boolean;
  includeChordSymbols: boolean;
  includeAnnotations: boolean;
  partFormat: 'satb-combined' | 'satb-separate';
  creator?: string;
}

export const DEFAULT_EXPORT_OPTIONS: MusicXMLExportOptions = {
  includeVoiceLines: true,
  includeLyrics: true,
  includeChordSymbols: true,
  includeAnnotations: false,
  partFormat: 'satb-separate',
};

interface ParsedPitch {
  step: string; // C, D, E, F, G, A, B
  octave: number;
  alter?: number; // -1 = flat, 1 = sharp
}

interface MeasureData {
  number: number;
  startBeat: number;
  endBeat: number;
  chords: Chord[];
}

// ============================================================================
// Constants
// ============================================================================

const DIVISIONS_PER_QUARTER = 4; // 16th note resolution

const VOICE_PART_NAMES: Record<VoicePart, string> = {
  soprano: 'Soprano',
  alto: 'Alto',
  tenor: 'Tenor',
  bass: 'Bass',
};

const CLEF_BY_VOICE: Record<VoicePart, { sign: string; line: number; octaveChange?: number }> = {
  soprano: { sign: 'G', line: 2 },
  alto: { sign: 'G', line: 2 },
  tenor: { sign: 'G', line: 2, octaveChange: -1 },
  bass: { sign: 'F', line: 4 },
};

// ============================================================================
// Pitch Parsing
// ============================================================================

/**
 * Parse a pitch string like "C4", "F#3", "Bb5" into components
 */
function parsePitch(pitchStr: string): ParsedPitch | null {
  if (!pitchStr) return null;

  const match = pitchStr.match(/^([A-Ga-g])([#b]*)(\d+)$/);
  if (!match) return null;

  const [, step, accidentals, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);

  let alter = 0;
  for (const acc of accidentals) {
    if (acc === '#') alter += 1;
    if (acc === 'b') alter -= 1;
  }

  return {
    step: step.toUpperCase(),
    octave,
    alter: alter !== 0 ? alter : undefined,
  };
}

/**
 * Convert a scale degree and key to the root note
 * Example: scaleDegree=4, key='C', mode='major' -> { step: 'F', alter: undefined }
 * Example: scaleDegree=5, key='G', mode='major' -> { step: 'D', alter: undefined }
 * Example: scaleDegree=3, key='F', mode='major' -> { step: 'A', alter: -1 } (Bb major scale)
 */
function scaleDegreeToRoot(
  scaleDegree: number,
  key: string,
  mode: 'major' | 'minor'
): { step: string; alter?: number } {
  // Natural notes in order
  const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  // Get the base note name from key (C, D, E, F, G, A, B)
  const keyBase = key.charAt(0).toUpperCase();
  const keyIndex = notes.indexOf(keyBase);

  if (keyIndex === -1) {
    // Fallback to C if key is invalid
    return { step: 'C' };
  }

  // Calculate root note from scale degree
  // Scale degrees are 1-based, so subtract 1
  const rootIndex = (keyIndex + scaleDegree - 1) % 7;
  const step = notes[rootIndex];

  // Determine alteration (accidental) for the root note
  // Get the natural scale from the key
  const majorScales: Record<string, Record<number, number>> = {
    C: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
    G: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 0, 6: 0, 7: 0 },
    D: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 0, 6: 0, 7: 1 },
    A: { 1: 0, 2: 1, 3: 1, 4: 1, 5: 0, 6: 1, 7: 1 },
    E: { 1: 0, 2: 1, 3: 1, 4: 0, 5: 0, 6: 1, 7: 1 },
    B: { 1: 0, 2: 1, 3: 1, 4: 0, 5: 1, 6: 1, 7: 1 },
    F: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: -1 },
    Bb: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: -1, 7: -1 },
    Eb: { 1: 0, 2: 0, 3: -1, 4: 0, 5: 0, 6: -1, 7: -1 },
    Ab: { 1: 0, 2: -1, 3: -1, 4: 0, 5: 0, 6: -1, 7: -1 },
    Db: { 1: -1, 2: -1, 3: -1, 4: 0, 5: 0, 6: -1, 7: -1 },
    Gb: { 1: -1, 2: -1, 3: -1, 4: -1, 5: -1, 6: -1, 7: -1 },
  };

  // For minor mode, lower scale degrees 3, 6, 7
  const minorAdjustments: Record<number, number> = {
    3: -1,
    6: -1,
    7: -1,
  };

  let alter = majorScales[key]?.[scaleDegree] ?? 0;

  if (mode === 'minor' && minorAdjustments[scaleDegree]) {
    alter += minorAdjustments[scaleDegree];
  }

  return {
    step,
    alter: alter !== 0 ? alter : undefined,
  };
}

/**
 * Map chord quality to MusicXML kind element value
 */
function getChordKind(quality: string): string {
  const kindMap: Record<string, string> = {
    major: 'major',
    minor: 'minor',
    diminished: 'diminished',
    augmented: 'augmented',
    dom7: 'dominant',
    maj7: 'major-seventh',
    min7: 'minor-seventh',
    halfdim7: 'half-diminished',
    dim7: 'diminished-seventh',
    dom9: 'dominant-ninth',
    maj9: 'major-ninth',
    min9: 'minor-ninth',
    dom11: 'dominant-11th',
    min11: 'minor-11th',
    dom13: 'dominant-13th',
    maj13: 'major-13th',
    min13: 'minor-13th',
    alt: 'other',
    dom7b9: 'dominant',
    dom7sharp9: 'dominant',
    dom7sharp11: 'dominant',
  };

  return kindMap[quality] || 'major';
}

/**
 * Convert duration in beats to MusicXML duration and type
 */
function getDurationInfo(durationBeats: number): { duration: number; type: string; dots: number } {
  const duration = Math.round(durationBeats * DIVISIONS_PER_QUARTER);

  // Map duration to note type
  let type = 'quarter';
  let dots = 0;

  if (durationBeats >= 4) {
    type = 'whole';
    if (durationBeats === 6) dots = 1;
  } else if (durationBeats >= 2) {
    type = 'half';
    if (durationBeats === 3) dots = 1;
  } else if (durationBeats >= 1) {
    type = 'quarter';
    if (durationBeats === 1.5) dots = 1;
  } else if (durationBeats >= 0.5) {
    type = 'eighth';
    if (durationBeats === 0.75) dots = 1;
  } else if (durationBeats >= 0.25) {
    type = '16th';
    if (durationBeats === 0.375) dots = 1;
  } else {
    type = '32nd';
  }

  return { duration, type, dots };
}

/**
 * Get key signature fifths from key and mode
 */
function getKeyFifths(key: string, _mode: 'major' | 'minor'): number {
  // Note: mode is accepted for API consistency but not used for fifths calculation
  // Minor keys use relative major key signature (e.g., A minor = C major = 0 fifths)
  const majorFifths: Record<string, number> = {
    C: 0, G: 1, D: 2, A: 3, E: 4, B: 5,
    F: -1, Bb: -2, Eb: -3, Ab: -4, Db: -5, Gb: -6,
  };

  const fifths = majorFifths[key] ?? 0;
  return fifths;
}

/**
 * Parse time signature string
 */
function parseTimeSignature(ts: TimeSignature): { beats: number; beatType: number } {
  const [beats, beatType] = ts.split('/').map(Number);
  return { beats, beatType };
}

/**
 * Get beats per measure for a time signature
 */
function getBeatsPerMeasure(ts: TimeSignature): number {
  const { beats, beatType } = parseTimeSignature(ts);
  // Normalize to quarter notes
  return beats * (4 / beatType);
}

// ============================================================================
// XML Building Helpers
// ============================================================================

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function xmlElement(tag: string, content: string, attrs?: Record<string, string | number>): string {
  let attrStr = '';
  if (attrs) {
    attrStr = Object.entries(attrs)
      .map(([k, v]) => ` ${k}="${escapeXml(String(v))}"`)
      .join('');
  }
  return `<${tag}${attrStr}>${content}</${tag}>`;
}

// Note: xmlEmptyElement is available for future use with self-closing tags
// function xmlEmptyElement(tag: string, attrs?: Record<string, string | number>): string {
//   let attrStr = '';
//   if (attrs) {
//     attrStr = Object.entries(attrs)
//       .map(([k, v]) => ` ${k}="${escapeXml(String(v))}"`)
//       .join('');
//   }
//   return `<${tag}${attrStr}/>`;
// }

// ============================================================================
// Note Generation
// ============================================================================

function generateNoteXml(
  pitch: ParsedPitch,
  durationBeats: number,
  isChord: boolean = false,
  lyric?: string
): string {
  const { duration, type, dots } = getDurationInfo(durationBeats);

  let xml = '<note>';

  if (isChord) {
    xml += '<chord/>';
  }

  xml += '<pitch>';
  xml += xmlElement('step', pitch.step);
  if (pitch.alter !== undefined) {
    xml += xmlElement('alter', String(pitch.alter));
  }
  xml += xmlElement('octave', String(pitch.octave));
  xml += '</pitch>';

  xml += xmlElement('duration', String(duration));
  xml += xmlElement('type', type);

  for (let i = 0; i < dots; i++) {
    xml += '<dot/>';
  }

  if (lyric) {
    xml += '<lyric number="1">';
    xml += xmlElement('syllabic', 'single');
    xml += xmlElement('text', escapeXml(lyric));
    xml += '</lyric>';
  }

  xml += '</note>';
  return xml;
}

function generateRestXml(durationBeats: number): string {
  const { duration, type, dots } = getDurationInfo(durationBeats);

  let xml = '<note>';
  xml += '<rest/>';
  xml += xmlElement('duration', String(duration));
  xml += xmlElement('type', type);

  for (let i = 0; i < dots; i++) {
    xml += '<dot/>';
  }

  xml += '</note>';
  return xml;
}

/**
 * Generate <harmony> XML element for a chord symbol
 * This displays the chord name (e.g., "Cmaj7", "Dm", "G7") above the staff
 */
function generateHarmonyXml(chord: Chord, key: string, mode: 'major' | 'minor'): string {
  const root = scaleDegreeToRoot(chord.scaleDegree, key, mode);
  const kind = getChordKind(chord.quality);

  let xml = '<harmony>\n';
  xml += '        <root>\n';
  xml += `          <root-step>${root.step}</root-step>\n`;
  if (root.alter) {
    xml += `          <root-alter>${root.alter}</root-alter>\n`;
  }
  xml += '        </root>\n';
  xml += `        <kind>${kind}</kind>\n`;
  xml += '      </harmony>\n';

  return xml;
}

// ============================================================================
// Measure Organization
// ============================================================================

function organizeMeasures(
  chords: Chord[],
  timeSignature: TimeSignature
): MeasureData[] {
  const beatsPerMeasure = getBeatsPerMeasure(timeSignature);
  const measures: MeasureData[] = [];

  if (chords.length === 0) return measures;

  // Sort chords by start beat
  const sortedChords = [...chords].sort((a, b) => a.startBeat - b.startBeat);

  // Find the last beat
  const lastChord = sortedChords[sortedChords.length - 1];
  const lastBeat = lastChord.startBeat + lastChord.duration;
  const totalMeasures = Math.ceil(lastBeat / beatsPerMeasure);

  for (let m = 0; m < totalMeasures; m++) {
    const startBeat = m * beatsPerMeasure;
    const endBeat = (m + 1) * beatsPerMeasure;

    const chordsInMeasure = sortedChords.filter(
      (c) => c.startBeat >= startBeat && c.startBeat < endBeat
    );

    measures.push({
      number: m + 1,
      startBeat,
      endBeat,
      chords: chordsInMeasure,
    });
  }

  return measures;
}

// ============================================================================
// Part Generation
// ============================================================================

function generatePartXml(
  partId: string,
  voice: VoicePart,
  measures: MeasureData[],
  key: string,
  mode: 'major' | 'minor',
  timeSignature: TimeSignature,
  tempo: number,
  voiceLine?: VoiceLine,
  textAssignments?: SyllableAssignment[],
  includeChordSymbols: boolean = true
): string {
  let xml = `<part id="${partId}">`;

  const clef = CLEF_BY_VOICE[voice];
  const { beats, beatType } = parseTimeSignature(timeSignature);
  // Only show harmony in first voice (soprano)
  const shouldShowHarmony = includeChordSymbols && voice === 'soprano';

  for (const measure of measures) {
    xml += `<measure number="${measure.number}">`;

    // First measure: include attributes and direction
    if (measure.number === 1) {
      xml += '<attributes>';
      xml += xmlElement('divisions', String(DIVISIONS_PER_QUARTER));

      // Key signature
      xml += '<key>';
      xml += xmlElement('fifths', String(getKeyFifths(key, mode)));
      xml += xmlElement('mode', mode);
      xml += '</key>';

      // Time signature
      xml += '<time>';
      xml += xmlElement('beats', String(beats));
      xml += xmlElement('beat-type', String(beatType));
      xml += '</time>';

      // Clef
      xml += '<clef>';
      xml += xmlElement('sign', clef.sign);
      xml += xmlElement('line', String(clef.line));
      if (clef.octaveChange) {
        xml += xmlElement('clef-octave-change', String(clef.octaveChange));
      }
      xml += '</clef>';

      xml += '</attributes>';

      // Tempo marking
      xml += '<direction placement="above">';
      xml += '<direction-type>';
      xml += '<metronome>';
      xml += xmlElement('beat-unit', 'quarter');
      xml += xmlElement('per-minute', String(tempo));
      xml += '</metronome>';
      xml += '</direction-type>';
      xml += '</direction>';
    }

    // Generate notes for this measure
    if (voiceLine && voiceLine.notes.length > 0) {
      // Use voice line notes
      const notesInMeasure = voiceLine.notes.filter(
        (n) => n.startBeat >= measure.startBeat && n.startBeat < measure.endBeat
      );

      let currentBeat = measure.startBeat;

      for (const chord of measure.chords) {
        if (shouldShowHarmony) {
          xml += generateHarmonyXml(chord, key, mode);
        }
      }

      for (const note of notesInMeasure) {
        // Add rest if there's a gap
        if (note.startBeat > currentBeat) {
          const gapDuration = note.startBeat - currentBeat;
          xml += generateRestXml(gapDuration);
        }

        const pitch = parsePitch(note.pitch);
        if (pitch) {
          const lyric = textAssignments?.find((a) => a.noteId === note.id)?.text;
          xml += generateNoteXml(pitch, note.duration, false, lyric);
        }

        currentBeat = note.startBeat + note.duration;
      }

      // Fill remaining measure with rest
      if (currentBeat < measure.endBeat) {
        const remainingDuration = measure.endBeat - currentBeat;
        xml += generateRestXml(remainingDuration);
      }
    } else {
      // Use chord voicings
      let currentBeat = measure.startBeat;

      for (const chord of measure.chords) {
        // Add rest if there's a gap
        if (chord.startBeat > currentBeat) {
          const gapDuration = chord.startBeat - currentBeat;
          xml += generateRestXml(gapDuration);
        }

        // Add harmony element before the first note in soprano
        if (shouldShowHarmony) {
          xml += generateHarmonyXml(chord, key, mode);
        }

        const voicePitch = chord.voices[voice];
        const pitch = parsePitch(voicePitch);

        if (pitch) {
          xml += generateNoteXml(pitch, chord.duration);
        } else {
          xml += generateRestXml(chord.duration);
        }

        currentBeat = chord.startBeat + chord.duration;
      }

      // Fill remaining measure with rest
      if (currentBeat < measure.endBeat) {
        const remainingDuration = measure.endBeat - currentBeat;
        xml += generateRestXml(remainingDuration);
      }
    }

    xml += '</measure>';
  }

  xml += '</part>';
  return xml;
}

// ============================================================================
// Main Export Function
// ============================================================================

/**
 * Export a progression to MusicXML format
 */
export function exportToMusicXML(
  progression: SavedProgression,
  voiceLines?: Record<VoicePart, VoiceLine>,
  textAssignments?: Record<VoicePart, SyllableAssignment[]>,
  options: Partial<MusicXMLExportOptions> = {}
): string {
  const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };

  const measures = organizeMeasures(progression.chords, progression.timeSignature);

  // Build XML document
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n';
  xml += '<score-partwise version="4.0">\n';

  // Work metadata
  xml += '<work>\n';
  xml += xmlElement('work-title', escapeXml(progression.title)) + '\n';
  xml += '</work>\n';

  // Identification
  xml += '<identification>\n';
  if (opts.creator) {
    xml += `<creator type="composer">${escapeXml(opts.creator)}</creator>\n`;
  }
  xml += '<encoding>\n';
  xml += xmlElement('software', 'Neume Choral Composer') + '\n';
  xml += xmlElement('encoding-date', new Date().toISOString().split('T')[0]) + '\n';
  xml += '</encoding>\n';
  xml += '</identification>\n';

  // Part list
  xml += '<part-list>\n';
  const voices: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];

  for (const voice of voices) {
    const partId = `P${voices.indexOf(voice) + 1}`;
    xml += `<score-part id="${partId}">\n`;
    xml += xmlElement('part-name', VOICE_PART_NAMES[voice]) + '\n';
    xml += xmlElement('part-abbreviation', voice.charAt(0).toUpperCase()) + '\n';
    xml += '</score-part>\n';
  }
  xml += '</part-list>\n';

  // Generate each part
  for (const voice of voices) {
    const partId = `P${voices.indexOf(voice) + 1}`;
    const voiceLine = opts.includeVoiceLines && voiceLines ? voiceLines[voice] : undefined;
    const assignments = opts.includeLyrics && textAssignments ? textAssignments[voice] : undefined;

    xml += generatePartXml(
      partId,
      voice,
      measures,
      progression.key,
      progression.mode,
      progression.timeSignature,
      progression.tempo,
      voiceLine,
      assignments,
      opts.includeChordSymbols
    );
    xml += '\n';
  }

  xml += '</score-partwise>';

  return xml;
}

/**
 * Download MusicXML as file
 */
export function downloadMusicXML(
  progression: SavedProgression,
  voiceLines?: Record<VoicePart, VoiceLine>,
  textAssignments?: Record<VoicePart, SyllableAssignment[]>,
  options?: Partial<MusicXMLExportOptions>
): void {
  const xml = exportToMusicXML(progression, voiceLines, textAssignments, options);
  const filename = `${progression.title.replace(/\s+/g, '-')}.musicxml`;

  const blob = new Blob([xml], { type: 'application/vnd.recordare.musicxml+xml' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Validate a progression can be exported
 */
export function validateForExport(
  progression: SavedProgression
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!progression.title) {
    errors.push('Progression must have a title');
  }

  if (!progression.chords || progression.chords.length === 0) {
    errors.push('Progression must have at least one chord');
  }

  for (const chord of progression.chords) {
    if (!chord.voices) {
      errors.push(`Chord at beat ${chord.startBeat} is missing voice assignments`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
