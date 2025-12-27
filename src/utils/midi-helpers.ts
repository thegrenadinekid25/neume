import type { Chord } from '@/types';
import type { VoicePart } from '@/types/necklace';

/**
 * Note name to semitone offset mapping (C = 0)
 */
const NOTE_SEMITONES: Record<string, number> = {
  'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11,
};

/**
 * Parse note string (e.g., "C4", "F#3", "Bb5") to MIDI number
 * MIDI 60 = C4 (middle C)
 */
export function noteToMidi(note: string): number {
  if (!note || note.length < 2) return 60; // Default to middle C

  // Extract base note, accidental, and octave
  const match = note.match(/^([A-Ga-g])([#b]?)(-?\d+)$/);
  if (!match) return 60;

  const [, baseName, accidental, octaveStr] = match;
  const baseNote = baseName.toUpperCase();
  const octave = parseInt(octaveStr, 10);

  let semitone = NOTE_SEMITONES[baseNote] ?? 0;
  if (accidental === '#') semitone += 1;
  if (accidental === 'b') semitone -= 1;

  // MIDI formula: (octave + 1) * 12 + semitone
  // This makes C4 = 60
  return (octave + 1) * 12 + semitone;
}

/**
 * Convert MIDI number to Y position
 * Higher pitch = lower Y value (SVG coordinates)
 * @param midi - MIDI note number
 * @param containerHeight - Height of the container in pixels
 * @param midiRange - Range of MIDI values to map
 * @returns Y position in pixels
 */
export function midiToYPosition(
  midi: number,
  containerHeight: number,
  midiRange: { min: number; max: number }
): number {
  const { min, max } = midiRange;
  const range = max - min;
  if (range === 0) return containerHeight / 2;

  // Normalize to 0-1, then invert (higher pitch = lower Y)
  const normalized = (midi - min) / range;
  const inverted = 1 - normalized;

  // Add padding (10% top and bottom)
  const padding = containerHeight * 0.1;
  const usableHeight = containerHeight - padding * 2;

  return padding + inverted * usableHeight;
}

/**
 * Get the MIDI range for all voices in a chord array
 * Adds padding for visual breathing room
 */
export function getVoiceMidiRange(chords: Chord[]): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;

  const voices: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];

  for (const chord of chords) {
    for (const voice of voices) {
      const note = chord.voices[voice];
      if (note) {
        const midi = noteToMidi(note);
        min = Math.min(min, midi);
        max = Math.max(max, midi);
      }
    }
  }

  // Handle empty case
  if (min === Infinity || max === -Infinity) {
    return { min: 48, max: 72 }; // C3 to C5 default
  }

  // Add 3 semitone padding
  return { min: min - 3, max: max + 3 };
}

/**
 * Generate a point for a voice at a specific chord position
 */
export interface NecklacePoint {
  x: number;
  y: number;
  midi: number;
  note: string;
  chordId: string;
}

/**
 * Generate necklace points for a specific voice
 */
export function generateNecklacePoints(
  chords: Chord[],
  voice: VoicePart,
  containerHeight: number,
  gridBeatWidth: number,
  zoom: number,
  chordWidth: number
): NecklacePoint[] {
  if (chords.length === 0) return [];

  const midiRange = getVoiceMidiRange(chords);
  const sortedChords = [...chords].sort((a, b) => a.startBeat - b.startBeat);

  return sortedChords
    .filter(chord => chord.voices[voice]) // Only include chords with this voice
    .map(chord => {
      const note = chord.voices[voice]!;
      const midi = noteToMidi(note);

      // X position: start beat * grid width * zoom + half chord width (center)
      const x = chord.startBeat * gridBeatWidth * zoom + chordWidth / 2;

      // Y position: MIDI to pixel position
      const y = midiToYPosition(midi, containerHeight, midiRange);

      return {
        x,
        y,
        midi,
        note,
        chordId: chord.id,
      };
    });
}

/**
 * Generate SVG path data for smooth curved line through points
 * Uses quadratic bezier curves for smooth connections
 */
export function generateSmoothPath(points: NecklacePoint[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  if (points.length === 2) {
    // Simple line for 2 points
    path += ` L ${points[1].x} ${points[1].y}`;
    return path;
  }

  // Use quadratic bezier curves through midpoints for smooth curve
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];

    if (i === 0) {
      // First segment: line to midpoint
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      path += ` L ${midX} ${midY}`;
    }

    if (i < points.length - 2) {
      // Middle segments: quadratic curve to next midpoint
      const nextNext = points[i + 2];
      const midX = (next.x + nextNext.x) / 2;
      const midY = (next.y + nextNext.y) / 2;
      path += ` Q ${next.x} ${next.y} ${midX} ${midY}`;
    } else {
      // Last segment: line to end
      path += ` L ${next.x} ${next.y}`;
    }
  }

  return path;
}
