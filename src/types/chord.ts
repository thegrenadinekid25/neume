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
  soprano: string;
  alto: string;
  tenor: string;
  bass: string;
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
 * Complete chord object
 */
export interface Chord {
  id: string;
  scaleDegree: ScaleDegree;
  quality: ChordQuality;
  extensions: ChordExtensions;
  key: MusicalKey;
  mode: Mode;
  isChromatic: boolean;
  chromaticType?: ChromaticType;
  voices: Voices;
  startBeat: number;
  duration: number;
  position: Position;
  size: number;
  selected: boolean;
  playing: boolean;
  source: ChordSource;
  analyzedFrom?: string;
  createdAt: string;
  // User annotation for this chord (runtime state, persisted separately)
  annotation?: string;
}

/**
 * Helper type for creating a new chord (with optional fields)
 */
export type ChordInput = Partial<Chord> &
  Pick<Chord, 'scaleDegree' | 'quality' | 'key' | 'mode'>;
