import { Midi } from '@tonejs/midi';
import {
  ParsedFileResult,
  ParsedNote,
  NoteGroup,
  ParsedFileMetadata,
} from '@/types/file-import';

/**
 * Converts MIDI note number to note name
 * @param midiNumber MIDI note number (0-127)
 * @returns Note name as string (e.g., "C4", "F#3")
 */
function midiNumberToNoteName(midiNumber: number): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNumber / 12) - 1;
  const noteName = notes[midiNumber % 12];
  return `${noteName}${octave}`;
}

/**
 * Converts MIDI time signature array to string format
 * @param timeSig Array like [4, 4]
 * @returns String format like "4/4"
 */
function formatTimeSignature(timeSig: number[]): string {
  if (!timeSig || timeSig.length < 2) {
    return '4/4';
  }
  return `${timeSig[0]}/${timeSig[1]}`;
}

/**
 * Extracts key signature mode from MIDI key signature object
 * @param keySig MIDI key signature object with key and scale properties
 * @returns 'major' or 'minor'
 */
function extractKeyMode(keySig: any): 'major' | 'minor' {
  if (!keySig || !keySig.scale) {
    return 'major';
  }
  return keySig.scale === 'major' ? 'major' : 'minor';
}

/**
 * Groups notes by beat position with tolerance
 * @param notes Array of parsed notes, sorted by startTime
 * @param beatDuration Duration of one beat in seconds
 * @returns Array of note groups
 */
function groupNotesByBeat(notes: ParsedNote[], beatDuration: number): NoteGroup[] {
  if (notes.length === 0) {
    return [];
  }

  const tolerance = beatDuration * 0.1;
  const groups: NoteGroup[] = [];
  let currentGroup: NoteGroup | null = null;

  for (const note of notes) {
    if (
      currentGroup === null ||
      Math.abs(note.startTime - currentGroup.startTime) > tolerance
    ) {
      // Start a new group
      currentGroup = {
        startTime: note.startTime,
        notes: [note],
      };
      groups.push(currentGroup);
    } else {
      // Add to current group
      currentGroup.notes.push(note);
    }
  }

  return groups;
}

/**
 * Parses a MIDI file and extracts notes, metadata, and timing information
 * @param file The MIDI file to parse
 * @returns Promise resolving to ParsedFileResult with all extracted data
 */
export async function parseMidiFile(file: File): Promise<ParsedFileResult> {
  // Read file as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Create Midi instance from ArrayBuffer
  const midi = new Midi(arrayBuffer);

  // Extract tempo (default 120 BPM if not found)
  const tempo = midi.header.tempos?.[0]?.bpm ?? 120;

  // Calculate beat duration for grouping
  const beatDuration = 60 / tempo;

  // Extract all notes from all tracks
  const allNotes: ParsedNote[] = [];

  for (const track of midi.tracks) {
    for (const note of track.notes) {
      const parsedNote: ParsedNote = {
        pitch: midiNumberToNoteName(note.midi),
        midi: note.midi,
        startTime: note.time,
        duration: note.duration,
        velocity: note.velocity,
      };
      allNotes.push(parsedNote);
    }
  }

  // Sort notes by start time
  allNotes.sort((a, b) => a.startTime - b.startTime);

  // Group notes by beat position with tolerance
  const noteGroups = groupNotesByBeat(allNotes, beatDuration);

  // Extract metadata
  const timeSignature = midi.header.timeSignatures?.[0]?.timeSignature;
  const keySig = midi.header.keySignatures?.[0];

  const metadata: ParsedFileMetadata = {
    title: midi.name || file.name.replace(/\.midi?$/i, ''),
    tempo,
    timeSignature: timeSignature ? formatTimeSignature(timeSignature) : undefined,
    keySignature: keySig
      ? {
          key: keySig.key || 'C',
          mode: extractKeyMode(keySig),
        }
      : undefined,
  };

  // Get total duration from midi or calculate from notes
  const duration = midi.duration || (allNotes.length > 0
    ? Math.max(...allNotes.map(n => n.startTime + n.duration))
    : 0);

  return {
    format: 'midi',
    metadata,
    noteGroups,
    duration,
  };
}
