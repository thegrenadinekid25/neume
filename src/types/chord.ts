/**
 * Chord quality types
 */
export type ChordQuality =
  | 'major'
  | 'minor'
  | 'diminished'
  | 'augmented'
  | 'dom7'
  | 'maj7'
  | 'min7'
  | 'halfdim7'
  | 'dim7';

/**
 * Scale degree (1-7 for I-vii)
 */
export type ScaleDegree = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Musical keys
 */
export type MusicalKey =
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'A'
  | 'B'
  | 'Db'
  | 'Eb'
  | 'Gb'
  | 'Ab'
  | 'Bb';

/**
 * Mode (major or minor)
 */
export type Mode = 'major' | 'minor';

/**
 * Chord extensions and alterations
 */
export interface ChordExtensions {
  add9?: boolean;
  add11?: boolean;
  add13?: boolean;
  sus2?: boolean;
  sus4?: boolean;
  sharp11?: boolean;
  flat9?: boolean;
  sharp9?: boolean;
  flat13?: boolean;
}

/**
 * Chromatic chord types
 */
export type ChromaticType = 'borrowed' | 'secondary' | 'neapolitan' | 'aug6th';

/**
 * SATB voicing
 */
export interface Voices {
  soprano: string; // e.g., "C5"
  alto: string; // e.g., "E4"
  tenor: string; // e.g., "G3"
  bass: string; // e.g., "C3"
}

/**
 * Position on canvas (pixels)
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Chord source type
 */
export type ChordSource = 'user' | 'analyzed' | 'library';

/**
 * Complete chord object (from spec)
 */
export interface Chord {
  // Identity
  id: string; // UUID

  // Musical Properties
  scaleDegree: ScaleDegree;
  quality: ChordQuality;

  // Extensions
  extensions: ChordExtensions;

  // Key Context
  key: MusicalKey;
  mode: Mode;

  // Chromatic
  isChromatic: boolean;
  chromaticType?: ChromaticType;

  // Voicing (auto-generated)
  voices: Voices;

  // Timeline Position
  startBeat: number; // 0-indexed
  duration: number; // In beats

  // Visual
  position: Position;
  size: number; // Base size in pixels

  // State
  selected: boolean;
  playing: boolean;

  // Metadata
  source: ChordSource;
  analyzedFrom?: string; // Piece name if from analysis
  createdAt: string; // ISO timestamp
}

/**
 * Helper type for creating a new chord (with optional fields)
 */
export type ChordInput = Partial<Chord> &
  Pick<Chord, 'scaleDegree' | 'quality' | 'key' | 'mode'>;
