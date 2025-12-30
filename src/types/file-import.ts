/**
 * Types for MIDI and MusicXML file import
 */

export type ImportFileFormat = 'midi' | 'musicxml';

export interface ParsedNote {
  pitch: string;         // e.g., "C4", "F#3"
  midi: number;          // MIDI note number 0-127
  startTime: number;     // Seconds from start
  duration: number;      // Duration in seconds
  velocity?: number;     // 0-127 (from MIDI, optional)
}

export interface NoteGroup {
  startTime: number;     // Seconds from start
  notes: ParsedNote[];   // Simultaneous notes at this time
}

export interface ParsedFileMetadata {
  title?: string;
  composer?: string;
  tempo?: number;        // BPM
  timeSignature?: string; // e.g., "4/4"
  keySignature?: { key: string; mode: 'major' | 'minor' };
}

export interface ParsedFileResult {
  format: ImportFileFormat;
  metadata: ParsedFileMetadata;
  noteGroups: NoteGroup[];
  duration: number;      // Total duration in seconds
}
