import JSZip from 'jszip';
import {
  ParsedFileResult,
  ParsedFileMetadata,
  ParsedNote,
  NoteGroup,
} from '@/types/file-import';

/**
 * Helper: Convert circle of fifths number to key name
 * 0=C, 1=G, 2=D, 3=A, 4=E, 5=B, 6=F#, 7=C#
 * -1=F, -2=Bb, -3=Eb, -4=Ab, -5=Db, -6=Gb, -7=Cb
 */
function fifthsToKey(fifths: number): string {
  const keys: Record<number, string> = {
    0: 'C',
    1: 'G',
    2: 'D',
    3: 'A',
    4: 'E',
    5: 'B',
    6: 'F#',
    7: 'C#',
    [-1]: 'F',
    [-2]: 'Bb',
    [-3]: 'Eb',
    [-4]: 'Ab',
    [-5]: 'Db',
    [-6]: 'Gb',
    [-7]: 'Cb',
  };
  return keys[fifths] || 'C';
}

/**
 * Helper: Convert note name (e.g., "C4", "F#3") to MIDI number
 * C4 = 60, each semitone adds/subtracts 1, each octave adds/subtracts 12
 */
function noteNameToMidi(name: string, alter: number = 0): number {
  const noteMap: Record<string, number> = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  };

  // Extract the step (C, D, E, F, G, A, B) and octave
  const match = name.match(/^([A-G])(\d+)$/);
  if (!match) {
    return 60; // Default to middle C if parsing fails
  }

  const step = match[1];
  const octave = parseInt(match[2], 10);

  const stepValue = noteMap[step] || 0;
  const midiNumber = (octave + 1) * 12 + stepValue + alter;

  return Math.max(0, Math.min(127, midiNumber)); // Clamp to valid MIDI range
}

/**
 * Parse a MusicXML file (compressed .mxl or uncompressed .xml)
 */
export async function parseMusicXMLFile(file: File): Promise<ParsedFileResult> {
  let xmlString: string;

  // Check if file is compressed MusicXML (.mxl)
  if (file.name.endsWith('.mxl')) {
    xmlString = await parseMxlFile(file);
  } else {
    // Assume it's uncompressed MusicXML (.xml)
    xmlString = await file.text();
  }

  // Parse the XML
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

  // Check for parsing errors
  if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Failed to parse MusicXML file: Invalid XML');
  }

  // Extract metadata
  const metadata = extractMetadata(xmlDoc, file.name);

  // Extract notes and time information
  const { noteGroups, duration } = extractNoteGroups(xmlDoc, metadata);

  return {
    format: 'musicxml',
    metadata,
    noteGroups,
    duration,
  };
}

/**
 * Handle compressed MusicXML (.mxl) files
 */
async function parseMxlFile(file: File): Promise<string> {
  const zip = new JSZip();
  const contents = await zip.loadAsync(file);

  // Find and read container.xml to locate the rootfile
  const containerFile = contents.file('META-INF/container.xml');
  if (!containerFile) {
    throw new Error('Invalid MXL file: Missing META-INF/container.xml');
  }

  const containerXml = await containerFile.async('string');
  const parser = new DOMParser();
  const containerDoc = parser.parseFromString(containerXml, 'application/xml');

  // Find the rootfile path
  const rootfileElement = containerDoc.querySelector('rootfile');
  if (!rootfileElement) {
    throw new Error('Invalid MXL file: No rootfile found in container.xml');
  }

  const rootfilePath = rootfileElement.getAttribute('full-path');
  if (!rootfilePath) {
    throw new Error('Invalid MXL file: Rootfile has no full-path attribute');
  }

  // Read the actual MusicXML file
  const xmlFile = contents.file(rootfilePath);
  if (!xmlFile) {
    throw new Error(`Invalid MXL file: Rootfile not found at ${rootfilePath}`);
  }

  return await xmlFile.async('string');
}

/**
 * Extract metadata from MusicXML document
 */
function extractMetadata(
  xmlDoc: Document,
  filename: string
): ParsedFileMetadata {
  const metadata: ParsedFileMetadata = {};

  // Extract title
  let title = xmlDoc.querySelector('work-title')?.textContent?.trim();
  if (!title) {
    title = xmlDoc.querySelector('movement-title')?.textContent?.trim();
  }
  if (!title) {
    // Use filename without extension
    title = filename.replace(/\.[^/.]+$/, '');
  }
  metadata.title = title;

  // Extract composer
  const composer = xmlDoc
    .querySelector('creator[type="composer"]')
    ?.textContent?.trim();
  if (composer) {
    metadata.composer = composer;
  }

  // Extract tempo
  const soundElement = xmlDoc.querySelector('sound[tempo]');
  if (soundElement) {
    const tempoAttr = soundElement.getAttribute('tempo');
    metadata.tempo = tempoAttr ? parseInt(tempoAttr, 10) : 120;
  } else {
    metadata.tempo = 120; // Default tempo
  }

  // Extract time signature
  const timeElement = xmlDoc.querySelector('time');
  if (timeElement) {
    const beats = timeElement.querySelector('beats')?.textContent?.trim();
    const beatType = timeElement.querySelector('beat-type')?.textContent?.trim();
    if (beats && beatType) {
      metadata.timeSignature = `${beats}/${beatType}`;
    }
  }

  // Extract key signature
  const keyElement = xmlDoc.querySelector('key');
  if (keyElement) {
    const fifthsElement = keyElement.querySelector('fifths');
    const modeElement = keyElement.querySelector('mode');

    if (fifthsElement) {
      const fifths = parseInt(fifthsElement.textContent || '0', 10);
      const key = fifthsToKey(fifths);
      const mode = (modeElement?.textContent?.trim() || 'major') as
        | 'major'
        | 'minor';
      metadata.keySignature = { key, mode };
    }
  }

  return metadata;
}

/**
 * Extract notes and group them by start time
 */
function extractNoteGroups(
  xmlDoc: Document,
  metadata: ParsedFileMetadata
): { noteGroups: NoteGroup[]; duration: number } {
  const tempo = metadata.tempo || 120;
  const notes: ParsedNote[] = [];

  let currentTime = 0; // Current time in seconds
  let divisions = 4; // Default divisions per quarter note
  let isChord = false; // Whether the next note is part of a chord

  // Find divisions in the first attributes element
  const firstAttributes = xmlDoc.querySelector('attributes');
  if (firstAttributes) {
    const divisionsElement = firstAttributes.querySelector('divisions');
    if (divisionsElement) {
      divisions = parseInt(divisionsElement.textContent || '4', 10);
    }
  }

  // Process all measures
  const measures = xmlDoc.querySelectorAll('measure');
  measures.forEach((measure) => {
    // Update divisions if specified in this measure
    const measureAttributes = measure.querySelector('attributes');
    if (measureAttributes) {
      const divisionsElement = measureAttributes.querySelector('divisions');
      if (divisionsElement) {
        divisions = parseInt(divisionsElement.textContent || '4', 10);
      }
    }

    // Process all notes and rests
    const noteElements = measure.querySelectorAll('note');
    noteElements.forEach((noteElement) => {
      // Check if this note is a chord (simultaneous with previous)
      const chordElement = noteElement.querySelector('chord');
      if (chordElement) {
        isChord = true;
      } else {
        // Not a chord, so update current time
        if (!isChord) {
          const durationElement = noteElement.querySelector('duration');
          if (durationElement) {
            const durationDivisions = parseInt(
              durationElement.textContent || '0',
              10
            );
            // Convert divisions to seconds: (divisions / divisions_per_quarter) * (60 / tempo)
            const durationSeconds =
              (durationDivisions / divisions) * (60 / tempo);
            currentTime += durationSeconds;
          }
        }
        isChord = false;
      }

      // Skip rest elements
      const restElement = noteElement.querySelector('rest');
      if (restElement) {
        return;
      }

      // Extract pitch information
      const pitchElement = noteElement.querySelector('pitch');
      if (!pitchElement) {
        return;
      }

      const stepElement = pitchElement.querySelector('step');
      const octaveElement = pitchElement.querySelector('octave');
      const alterElement = pitchElement.querySelector('alter');

      if (!stepElement || !octaveElement) {
        return;
      }

      const step = stepElement.textContent?.trim() || 'C';
      const octave = parseInt(octaveElement.textContent || '4', 10);
      const alter = parseInt(alterElement?.textContent || '0', 10);

      const noteName = `${step}${octave}`;
      const midi = noteNameToMidi(noteName, alter);

      // Extract duration
      const durationElement = noteElement.querySelector('duration');
      const durationDivisions = parseInt(
        durationElement?.textContent || '0',
        10
      );
      const durationSeconds =
        (durationDivisions / divisions) * (60 / tempo);

      const startTime = isChord ? currentTime - 0.001 : currentTime; // Slight offset for simultaneous notes

      const parsedNote: ParsedNote = {
        pitch: noteName,
        midi,
        startTime,
        duration: durationSeconds,
      };

      notes.push(parsedNote);
    });
  });

  // Group notes by start time (with small tolerance for floating-point differences)
  const noteMap = new Map<string, ParsedNote[]>();
  const tolerance = 0.001; // 1ms tolerance for grouping

  notes.forEach((note) => {
    const timeKey = `${Math.round(note.startTime / tolerance) * tolerance}`;
    if (!noteMap.has(timeKey)) {
      noteMap.set(timeKey, []);
    }
    noteMap.get(timeKey)!.push(note);
  });

  // Convert to NoteGroups and sort by time
  const noteGroups: NoteGroup[] = Array.from(noteMap.entries())
    .map(([timeKey, groupNotes]) => ({
      startTime: parseFloat(timeKey),
      notes: groupNotes,
    }))
    .sort((a, b) => a.startTime - b.startTime);

  // Calculate total duration
  let duration = 0;
  notes.forEach((note) => {
    const noteEnd = note.startTime + note.duration;
    if (noteEnd > duration) {
      duration = noteEnd;
    }
  });

  return { noteGroups, duration };
}
