import { v4 as uuidv4 } from 'uuid';
import { Scale } from 'tonal';
import type {
  Chord,
  ChordQuality,
  ChordExtensions,
  MusicalKey,
  Mode,
  ScaleDegree,
} from '@/types/chord';
import type { AnalyzedChord, AnalysisResult } from '@/types/analysis';
import type { PhraseBoundary, QuantizedProgression } from '@/types/progression';
import { CANVAS_CONFIG, DEFAULT_CHORD_SIZE } from '@/utils/constants';
import { generateSATBVoicing } from '@/audio/VoiceLeading';

/**
 * Convert a note name to a scale degree relative to a musical key
 * @param root The root note (e.g., 'C', 'D', 'G')
 * @param key The musical key (e.g., 'C', 'G', 'Bb')
 * @returns The scale degree (1-7)
 */
export function rootToScaleDegree(root: string, key: MusicalKey): ScaleDegree {
  try {
    // Get the scale notes for the major scale in the given key
    const scale = Scale.get(`${key} major`);
    if (!scale.notes || scale.notes.length === 0) {
      console.warn(`Could not get scale for key ${key}`);
      return 1; // Fallback to tonic
    }

    // Normalize the root to remove octave information if present
    const rootNormalized = root.replace(/\d+$/, '');

    // Find the index of the root in the scale
    const index = scale.notes.findIndex(
      (note) => note.replace(/\d+$/, '') === rootNormalized
    );

    if (index === -1) {
      console.warn(`Root ${root} not found in scale of ${key}`);
      return 1; // Fallback to tonic
    }

    // Scale degree is 1-indexed
    return (index + 1) as ScaleDegree;
  } catch (error) {
    console.warn(`Error calculating scale degree for ${root} in ${key}:`, error);
    return 1; // Fallback to tonic
  }
}

/**
 * Map a quality string from the backend to frontend ChordQuality type
 * @param qualityString The quality string from analyzed chord (e.g., 'major', 'min7', 'dom7')
 * @returns The ChordQuality type
 */
export function mapQuality(qualityString: string): ChordQuality {
  const normalized = qualityString.toLowerCase().trim();

  // Map common quality variations
  const qualityMap: Record<string, ChordQuality> = {
    major: 'major',
    maj: 'major',
    minor: 'minor',
    min: 'minor',
    diminished: 'diminished',
    dim: 'diminished',
    augmented: 'augmented',
    aug: 'augmented',
    dominant7: 'dom7',
    dom7: 'dom7',
    '7': 'dom7',
    maj7: 'maj7',
    major7: 'maj7',
    min7: 'min7',
    minor7: 'min7',
    halfdim7: 'halfdim7',
    'm7b5': 'halfdim7',
    dim7: 'dim7',
  };

  return qualityMap[normalized] || 'major'; // Default to major if unknown
}

/**
 * Convert extensions record from backend to frontend ChordExtensions interface
 * @param extensionsRecord Raw extensions record from analyzed chord
 * @returns ChordExtensions interface
 */
export function convertExtensions(extensionsRecord: Record<string, boolean>): ChordExtensions {
  const extensions: ChordExtensions = {};

  // Map known extension keys
  if (extensionsRecord.add9) extensions.add9 = true;
  if (extensionsRecord.add11) extensions.add11 = true;
  if (extensionsRecord.add13) extensions.add13 = true;
  if (extensionsRecord.sus2) extensions.sus2 = true;
  if (extensionsRecord.sus4) extensions.sus4 = true;
  if (extensionsRecord.sharp11) extensions.sharp11 = true;
  if (extensionsRecord.flat9) extensions.flat9 = true;
  if (extensionsRecord.sharp9) extensions.sharp9 = true;
  if (extensionsRecord.flat13) extensions.flat13 = true;

  return extensions;
}

/**
 * Convert a backend AnalyzedChord to a frontend Chord
 * @param analyzed The analyzed chord from the backend
 * @param key The musical key
 * @param mode The mode (major/minor)
 * @param index The index of this chord in the sequence (for positioning)
 * @param previousVoices Optional previous chord voices for voice leading
 * @returns A complete Chord object ready for the canvas
 */
export function convertAnalyzedChordToChord(
  analyzed: AnalyzedChord,
  key: MusicalKey,
  mode: Mode,
  _index: number,
  previousVoices?: { soprano: string; alto: string; tenor: string; bass: string }
): Chord {
  // Generate unique ID
  const id = uuidv4();

  // Calculate scale degree from root and key
  const scaleDegree = rootToScaleDegree(analyzed.root, key);

  // Map quality string to ChordQuality
  const quality = mapQuality(analyzed.quality);

  // Convert extensions
  const extensions = convertExtensions(analyzed.extensions);

  // Calculate x position based on startBeat
  const positionX = analyzed.startBeat * CANVAS_CONFIG.GRID_BEAT_WIDTH;

  // Create a temporary chord object for voice leading generation
  const tempChord: Chord = {
    id,
    scaleDegree,
    quality,
    extensions,
    key,
    mode,
    isChromatic: false,
    voices: { soprano: 'C5', alto: 'G4', tenor: 'E3', bass: 'C3' }, // Temporary
    startBeat: analyzed.startBeat,
    duration: analyzed.duration,
    position: { x: positionX, y: 150 },
    size: DEFAULT_CHORD_SIZE,
    selected: false,
    playing: false,
    source: 'analyzed',
    createdAt: new Date().toISOString(),
  };

  // Generate SATB voices using voice leading if available
  const voices = generateSATBVoicing(tempChord, previousVoices);

  // Return complete chord with generated voices
  return {
    ...tempChord,
    voices,
  };
}

/**
 * Convert all analyzed chords from an analysis result to frontend Chord format
 * @param result The analysis result from the backend
 * @returns An array of Chord objects
 */
export function convertAnalysisResultToChords(result: AnalysisResult): Chord[] {
  const chords: Chord[] = [];
  let previousVoices: { soprano: string; alto: string; tenor: string; bass: string } | undefined;

  // Ensure key and mode are in the correct format
  const key = result.key as MusicalKey;
  const mode = result.mode as Mode;

  for (let i = 0; i < result.chords.length; i++) {
    const analyzedChord = result.chords[i];
    const chord = convertAnalyzedChordToChord(analyzedChord, key, mode, i, previousVoices);

    chords.push(chord);
    previousVoices = chord.voices;
  }

  return chords;
}

/**
 * Get a unique key for a chord based on its harmonic identity
 * Used to detect duplicate/repeating chords
 */
function getChordKey(chord: Chord): string {
  return `${chord.scaleDegree}-${chord.quality}`;
}

/**
 * Quantize and simplify a chord progression for clearer harmonic analysis
 *
 * This function performs three key transformations:
 * 1. ROUND TO BEAT: Snaps chord start times to nearest beat (quarter note)
 * 2. MERGE SAME-BEAT: Keeps last chord when multiple land on same beat
 * 3. REMOVE DUPLICATES: Removes consecutive identical chords
 * 4. CREATE PHRASES: Groups chords into standard 4-bar musical phrases
 *
 * Why round to beats:
 * - Essentia analysis is hyper-precise but music is felt in beats
 * - Reduces noise while preserving actual harmonic rhythm
 * - More intuitive than equal-spacing all chords
 *
 * @param chords The array of chords to quantize
 * @param beatsPerMeasure Time signature (default: 4 beats per measure)
 * @returns QuantizedProgression with chords and phrase boundaries
 */
export function quantizeProgression(
  chords: Chord[],
  _beatsPerChord: number = 2, // Kept for API compatibility but not used
  beatsPerMeasure: number = 4
): QuantizedProgression {
  if (chords.length === 0) return { chords: [], phrases: [] };

  // Step 1: Round start times to nearest quarter note (1 beat) and merge
  // Preserves harmonic detail while snapping to the beat grid
  const GRID_SIZE = 1; // Quarter note grid (1 beat)
  const beatMap = new Map<number, Chord>(); // beat -> chord (last one wins)

  for (const chord of chords) {
    const roundedBeat = Math.round(chord.startBeat / GRID_SIZE) * GRID_SIZE;
    beatMap.set(roundedBeat, chord); // Last chord at this beat wins
  }

  // Convert map to sorted array
  const snapped = Array.from(beatMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([beat, chord]) => ({ ...chord, startBeat: beat }));

  // Step 2: Remove consecutive duplicates (same chord identity)
  const deduplicated: Chord[] = [];
  let lastKey = '';

  for (const chord of snapped) {
    const key = getChordKey(chord);
    if (key !== lastKey) {
      deduplicated.push(chord);
      lastKey = key;
    }
  }

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Quantize] Original:', chords.length, '→ Snapped:', snapped.length, '→ Deduplicated:', deduplicated.length);
  }

  // Step 3: Calculate durations based on gaps to next chord
  const quantized: Chord[] = deduplicated.map((chord, index, arr) => {
    const nextChord = arr[index + 1];
    const duration = nextChord
      ? nextChord.startBeat - chord.startBeat
      : Math.max(2, beatsPerMeasure); // Last chord gets reasonable duration

    return {
      ...chord,
      id: uuidv4(),
      duration: Math.max(1, duration), // Minimum 1 beat
      position: {
        x: chord.startBeat * CANVAS_CONFIG.GRID_BEAT_WIDTH,
        y: chord.position.y,
      },
    };
  });

  // Step 4: Create phrases based on standard 4-bar groupings
  const beatsPerPhrase = 4 * beatsPerMeasure; // 4 bars = 16 beats in 4/4
  const lastChord = quantized[quantized.length - 1];
  const totalBeats = lastChord ? lastChord.startBeat + lastChord.duration : 0;
  const phrases: PhraseBoundary[] = [];

  const numPhrases = Math.ceil(totalBeats / beatsPerPhrase);

  for (let phraseNum = 0; phraseNum < numPhrases; phraseNum++) {
    const phraseStartBeat = phraseNum * beatsPerPhrase;
    const phraseEndBeat = Math.min((phraseNum + 1) * beatsPerPhrase, totalBeats);

    // Find chords that start within this phrase
    const chordsInPhrase = quantized.filter(
      c => c.startBeat >= phraseStartBeat && c.startBeat < phraseEndBeat
    );

    if (chordsInPhrase.length > 0) {
      const startIndex = quantized.indexOf(chordsInPhrase[0]);
      const endIndex = quantized.indexOf(chordsInPhrase[chordsInPhrase.length - 1]);

      // Use musical section labels: A, B, C, D...
      const sectionLabel = String.fromCharCode(65 + (phraseNum % 26));

      phrases.push({
        startIndex,
        endIndex,
        patternName: sectionLabel,
        startBeat: phraseStartBeat,
        endBeat: phraseEndBeat,
      });
    }
  }

  return { chords: quantized, phrases };
}
