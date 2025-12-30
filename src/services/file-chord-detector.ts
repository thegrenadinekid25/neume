import { Chord, Note } from 'tonal';
import type { NoteGroup } from '@/types/file-import';
import type { AnalyzedChord } from '@/types/analysis';

/**
 * Maps Tonal.js chord type names to the app's ChordQuality format
 * Uses chordInfo.type for full extended chord recognition
 * @param chordInfo The chord info object from Tonal.js Chord.get()
 * @returns The mapped quality string matching ChordQuality type
 */
function mapChordQuality(chordInfo: { type?: string; quality?: string; symbol?: string }): string {
  const type = chordInfo.type?.toLowerCase() || '';
  const symbol = chordInfo.symbol || '';

  // Map by chord type (most accurate for extended chords)
  const typeMap: Record<string, string> = {
    // Extended chords (9ths, 11ths, 13ths)
    'major ninth': 'maj9',
    'minor ninth': 'min9',
    'dominant ninth': 'dom9',
    'ninth': 'dom9',
    'major eleventh': 'maj9',  // App doesn't have maj11, use maj9
    'minor eleventh': 'min11',
    'dominant eleventh': 'dom11',
    'eleventh': 'dom11',
    'major thirteenth': 'maj13',
    'minor thirteenth': 'min13',
    'dominant thirteenth': 'dom13',
    'thirteenth': 'dom13',
    // Seventh chords
    'major seventh': 'maj7',
    'minor seventh': 'min7',
    'dominant seventh': 'dom7',
    'half-diminished': 'halfdim7',
    'diminished seventh': 'dim7',
    // Triads
    'major': 'major',
    'minor': 'minor',
    'diminished': 'diminished',
    'augmented': 'augmented',
  };

  // Check type first
  if (type && typeMap[type]) {
    return typeMap[type];
  }

  // Fallback: check symbol for extensions
  if (symbol.includes('maj9') || symbol.includes('M9') || symbol.includes('Δ9')) return 'maj9';
  if (symbol.includes('m9') || symbol.includes('min9') || symbol.includes('-9')) return 'min9';
  if (symbol.includes('9') && !symbol.includes('maj') && !symbol.includes('m9')) return 'dom9';
  if (symbol.includes('m11') || symbol.includes('min11')) return 'min11';
  if (symbol.includes('11')) return 'dom11';
  if (symbol.includes('maj13') || symbol.includes('M13')) return 'maj13';
  if (symbol.includes('m13') || symbol.includes('min13')) return 'min13';
  if (symbol.includes('13')) return 'dom13';
  if (symbol.includes('maj7') || symbol.includes('M7') || symbol.includes('Δ7')) return 'maj7';
  if (symbol.includes('m7') || symbol.includes('min7') || symbol.includes('-7')) return 'min7';
  if (symbol.includes('7')) return 'dom7';

  // Final fallback to basic quality
  const basicQuality = chordInfo.quality?.toLowerCase() || 'major';
  return basicQuality === 'major' ? 'major' :
         basicQuality === 'minor' ? 'minor' :
         basicQuality === 'diminished' ? 'diminished' :
         basicQuality === 'augmented' ? 'augmented' : 'major';
}

/**
 * Extracts extension indicators from a chord symbol
 * @param chordInfo The chord info object from Tonal.js Chord.get()
 * @returns Record of extension flags
 */
function extractExtensions(chordInfo: any): Record<string, boolean> {
  const extensions: Record<string, boolean> = {};
  const symbol = chordInfo.symbol || '';

  if (symbol.includes('9')) extensions.add9 = true;
  if (symbol.includes('11')) extensions.add11 = true;
  if (symbol.includes('13')) extensions.add13 = true;
  if (symbol.includes('sus4')) extensions.sus4 = true;
  if (symbol.includes('sus2')) extensions.sus2 = true;

  return extensions;
}

/**
 * Detects chords from grouped notes using Tonal.js
 * Processes note groups and converts them to AnalyzedChord objects
 *
 * @param noteGroups Array of note groups (simultaneous notes at specific times)
 * @param tempo The tempo in BPM for beat calculation
 * @returns Array of detected and merged chords
 */
export function detectChordsFromNoteGroups(
  noteGroups: NoteGroup[],
  tempo: number
): AnalyzedChord[] {
  if (noteGroups.length === 0 || tempo <= 0) {
    return [];
  }

  const detectedChords: AnalyzedChord[] = [];

  // Process each note group
  for (let i = 0; i < noteGroups.length; i++) {
    const noteGroup = noteGroups[i];

    // Extract unique pitch classes from notes in this group
    const pitchClasses = new Set<string>();
    const pitchChromas: number[] = [];

    for (const note of noteGroup.notes) {
      try {
        const pitchClass = Note.pitchClass(note.pitch);
        if (pitchClass !== undefined && pitchClass !== null) {
          pitchClasses.add(pitchClass);
          const chroma = Note.chroma(note.pitch);
          if (chroma !== undefined && chroma !== null) {
            pitchChromas.push(chroma);
          }
        }
      } catch (e) {
        // Skip notes that can't be parsed
        console.warn(`Could not parse pitch: ${note.pitch}`, e);
      }
    }

    // Skip groups with less than 2 unique pitch classes (not a chord)
    if (pitchClasses.size < 2) {
      continue;
    }

    // Convert Set to array for Chord.detect
    const pitchClassArray = Array.from(pitchClasses);

    // Detect possible chords from pitch classes
    const detectedNames = Chord.detect(pitchClassArray);

    if (!detectedNames || detectedNames.length === 0) {
      continue;
    }

    // Take the first detected chord name
    const chordName = detectedNames[0];
    const chordInfo = Chord.get(chordName);

    if (!chordInfo || !chordInfo.tonic) {
      continue;
    }

    // Calculate startBeat: convert seconds to beats using tempo
    const startBeat = noteGroup.startTime * (tempo / 60);

    // Calculate duration: time until next note group, or use first note's duration
    let duration = 1; // Default duration
    if (i < noteGroups.length - 1) {
      const nextStartTime = noteGroups[i + 1].startTime;
      duration = (nextStartTime - noteGroup.startTime) * (tempo / 60);
    } else if (noteGroup.notes.length > 0) {
      // Use the duration of the first note for the last group
      duration = noteGroup.notes[0].duration * (tempo / 60);
    }

    // Ensure duration is at least a minimal value
    duration = Math.max(0.25, duration);

    // Map chord quality to standard format (pass full chordInfo for type detection)
    const quality = mapChordQuality(chordInfo);

    // Extract extensions from the chord symbol
    const extensions = extractExtensions(chordInfo);

    // Get the root note
    const root = chordInfo.tonic;

    // Create AnalyzedChord object
    const analyzedChord: AnalyzedChord = {
      startBeat,
      duration,
      root,
      quality,
      extensions,
      confidence: 1.0, // File-based detection is deterministic
      detectedIntervals: pitchChromas,
    };

    detectedChords.push(analyzedChord);
  }

  // Merge consecutive identical chords
  const mergedChords: AnalyzedChord[] = [];

  for (const chord of detectedChords) {
    if (mergedChords.length === 0) {
      mergedChords.push(chord);
    } else {
      const prevChord = mergedChords[mergedChords.length - 1];

      // Check if current chord is identical to previous
      if (prevChord.root === chord.root && prevChord.quality === chord.quality) {
        // Merge: extend the duration of the previous chord
        prevChord.duration += chord.duration;
      } else {
        // Add as new chord
        mergedChords.push(chord);
      }
    }
  }

  return mergedChords;
}
