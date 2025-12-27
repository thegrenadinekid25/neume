import { Note } from 'tonal';
import { VOICE_RANGES, VOICE_ORDER } from '@/data/voice-ranges';

/**
 * Configuration for pitch positioning calculations
 */
export interface PitchPositioningConfig {
  /** Pixels per semitone for vertical scaling */
  pixelsPerSemitone: number;
  /** Reference note name (e.g., 'C4') */
  referenceNote: string;
  /** MIDI number of the reference note */
  referenceMidi: number;
  /** Y coordinate of the reference note in pixels */
  referenceY: number;
  /** Top padding in pixels */
  topPadding: number;
  /** Bottom padding in pixels */
  bottomPadding: number;
}

/**
 * Default pitch positioning configuration
 */
export const PITCH_CONFIG: PitchPositioningConfig = {
  pixelsPerSemitone: 12,
  referenceNote: 'C4',
  referenceMidi: 60,
  referenceY: 300,
  topPadding: 40,
  bottomPadding: 40,
};

/**
 * Information about a guide line for pitch visualization
 */
export interface GuideLine {
  /** Y coordinate in pixels */
  y: number;
  /** MIDI number */
  midi: number;
  /** Note name (e.g., 'C4') */
  pitch: string;
  /** Whether this line marks an octave boundary */
  isOctaveLine: boolean;
  /** Whether this is the Middle C reference line */
  isMiddleC: boolean;
}

/**
 * Convert MIDI number to Y coordinate
 * Higher MIDI numbers produce lower Y coordinates (inverted axis for visualization)
 *
 * @param midi - MIDI number (0-127)
 * @param config - Pitch positioning configuration (defaults to PITCH_CONFIG)
 * @returns Y coordinate in pixels
 */
export function midiToY(midi: number, config: PitchPositioningConfig = PITCH_CONFIG): number {
  const semitoneOffset = config.referenceMidi - midi;
  const pixelOffset = semitoneOffset * config.pixelsPerSemitone;
  return config.referenceY + pixelOffset;
}

/**
 * Convert Y coordinate to MIDI number
 *
 * @param y - Y coordinate in pixels
 * @param config - Pitch positioning configuration (defaults to PITCH_CONFIG)
 * @returns MIDI number (may be fractional)
 */
export function yToMidi(y: number, config: PitchPositioningConfig = PITCH_CONFIG): number {
  const pixelOffset = y - config.referenceY;
  const semitoneOffset = pixelOffset / config.pixelsPerSemitone;
  return config.referenceMidi - semitoneOffset;
}

/**
 * Convert Y coordinate to nearest MIDI number (rounded to whole number)
 *
 * @param y - Y coordinate in pixels
 * @param config - Pitch positioning configuration (defaults to PITCH_CONFIG)
 * @returns Nearest MIDI number
 */
export function yToNearestMidi(y: number, config: PitchPositioningConfig = PITCH_CONFIG): number {
  return Math.round(yToMidi(y, config));
}

/**
 * Convert pitch name to Y coordinate
 *
 * @param pitch - Pitch name (e.g., 'C4', 'D#4')
 * @param config - Pitch positioning configuration (defaults to PITCH_CONFIG)
 * @returns Y coordinate in pixels, or null if pitch is invalid
 */
export function pitchToY(pitch: string, config: PitchPositioningConfig = PITCH_CONFIG): number | null {
  const noteInfo = Note.get(pitch);
  if (!noteInfo || noteInfo.midi === null) {
    return null;
  }
  return midiToY(noteInfo.midi, config);
}

/**
 * Convert Y coordinate to nearest pitch name
 *
 * @param y - Y coordinate in pixels
 * @param config - Pitch positioning configuration (defaults to PITCH_CONFIG)
 * @returns Pitch name (e.g., 'C4')
 */
export function yToPitch(y: number, config: PitchPositioningConfig = PITCH_CONFIG): string {
  const midi = yToNearestMidi(y, config);
  const noteInfo = Note.fromMidi(midi);
  return noteInfo || 'C4';
}

/**
 * Get guide line positions for a pitch range
 * Generates horizontal lines at semitone intervals, with emphasis on octaves and Middle C
 *
 * @param lowMidi - Lowest MIDI number in range
 * @param highMidi - Highest MIDI number in range
 * @param config - Pitch positioning configuration (defaults to PITCH_CONFIG)
 * @param interval - Semitone interval between guide lines (default: 1)
 * @returns Array of guide line information
 */
export function getGuideLinePositions(
  lowMidi: number,
  highMidi: number,
  config: PitchPositioningConfig = PITCH_CONFIG,
  interval: number = 1
): GuideLine[] {
  const guideLines: GuideLine[] = [];

  for (let midi = Math.ceil(lowMidi); midi <= Math.floor(highMidi); midi += interval) {
    const y = midiToY(midi, config);
    const noteInfo = Note.fromMidi(midi);
    const pitch = noteInfo || 'C4';

    // Check if this is an octave line (note name ends with octave number, and octave number matches)
    const isOctaveLine = pitch.endsWith('C') || pitch.endsWith('C#');
    const isMiddleC = midi === 60; // C4

    guideLines.push({
      y,
      midi,
      pitch,
      isOctaveLine,
      isMiddleC,
    });
  }

  return guideLines;
}

/**
 * Get guide lines for all voice ranges combined
 *
 * @param config - Pitch positioning configuration (defaults to PITCH_CONFIG)
 * @returns Array of guide line information for all voices
 */
export function getAllVoiceGuideLines(config: PitchPositioningConfig = PITCH_CONFIG): GuideLine[] {
  // Find the lowest and highest MIDI across all voices
  let minMidi = Infinity;
  let maxMidi = -Infinity;

  VOICE_ORDER.forEach((voice) => {
    const range = VOICE_RANGES[voice];
    minMidi = Math.min(minMidi, range.lowMidi);
    maxMidi = Math.max(maxMidi, range.highMidi);
  });

  return getGuideLinePositions(minMidi, maxMidi, config);
}

/**
 * Calculate the required container height for a pitch range
 *
 * @param lowMidi - Lowest MIDI number in range
 * @param highMidi - Highest MIDI number in range
 * @param config - Pitch positioning configuration (defaults to PITCH_CONFIG)
 * @returns Container height in pixels
 */
export function getContainerHeight(
  lowMidi: number,
  highMidi: number,
  config: PitchPositioningConfig = PITCH_CONFIG
): number {
  const topY = midiToY(highMidi, config);
  const bottomY = midiToY(lowMidi, config);
  return bottomY - topY + config.topPadding + config.bottomPadding;
}

/**
 * Calculate pitch positioning config that fits a range within a container height
 * Adjusts pixelsPerSemitone to fit the range while respecting padding
 *
 * @param containerHeight - Available height in pixels
 * @param lowMidi - Lowest MIDI number in range
 * @param highMidi - Highest MIDI number in range
 * @param padding - Total padding (top + bottom) in pixels (default: 80)
 * @returns Adjusted pitch positioning configuration
 */
export function fitRangeToContainer(
  containerHeight: number,
  lowMidi: number,
  highMidi: number,
  padding: number = 80
): PitchPositioningConfig {
  const availableHeight = containerHeight - padding;
  const semitoneRange = highMidi - lowMidi;

  // Calculate pixels per semitone to fit the range
  const pixelsPerSemitone = Math.max(1, availableHeight / (semitoneRange || 1));

  // Calculate reference Y to center the range vertically with padding
  const referenceY = padding / 2 + (pixelsPerSemitone * lowMidi);

  return {
    pixelsPerSemitone,
    referenceNote: PITCH_CONFIG.referenceNote,
    referenceMidi: PITCH_CONFIG.referenceMidi,
    referenceY,
    topPadding: padding / 2,
    bottomPadding: padding / 2,
  };
}

/**
 * Snap a Y coordinate to the nearest note in a scale
 * Useful for constraining mouse/touch input to valid pitches
 *
 * @param y - Y coordinate in pixels
 * @param scaleNotes - Array of note names in the scale (e.g., ['C', 'D', 'E', 'F', 'G', 'A', 'B'])
 * @param config - Pitch positioning configuration (defaults to PITCH_CONFIG)
 * @returns Y coordinate snapped to nearest scale note
 */
export function snapYToScale(
  y: number,
  scaleNotes: string[],
  config: PitchPositioningConfig = PITCH_CONFIG
): number {
  const midi = yToMidi(y, config);
  const octave = Math.floor(midi / 12);

  // Find closest scale note
  let closestMidi = midi;
  let closestDistance = Infinity;

  for (let oct = octave - 1; oct <= octave + 1; oct++) {
    for (const scaleNote of scaleNotes) {
      const pitchName = scaleNote + oct;
      const noteInfo = Note.get(pitchName);
      if (noteInfo && noteInfo.midi !== null) {
        const distance = Math.abs(noteInfo.midi - midi);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestMidi = noteInfo.midi;
        }
      }
    }
  }

  return midiToY(closestMidi, config);
}
