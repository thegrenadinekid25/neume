import type { SATBRanges } from '@/types';

/**
 * SATB vocal ranges
 */
export const SATB_RANGES: SATBRanges = {
  soprano: { low: 'C4', high: 'G5' },
  alto: { low: 'G3', high: 'D5' },
  tenor: { low: 'C3', high: 'G4' },
  bass: { low: 'E2', high: 'C4' },
};

/**
 * Default chord size (pixels)
 */
export const DEFAULT_CHORD_SIZE = 60;

/**
 * Default tempo (BPM)
 */
export const DEFAULT_TEMPO = 120;

/**
 * Grid snap resolution (beats)
 */
export const DEFAULT_SNAP_RESOLUTION = 0.25;

/**
 * Canvas viewport settings
 */
export const CANVAS_CONFIG = {
  DEFAULT_ZOOM: 1.0,
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 2.0,
  GRID_BEAT_WIDTH: 80,
  MEASURES_VISIBLE: 8,
};

/**
 * Audio settings defaults
 */
export const AUDIO_DEFAULTS = {
  MASTER_VOLUME: 0.7,
  REVERB_DECAY: 2.5,
  REVERB_WET: 0.35,
  COMPRESSION_THRESHOLD: -12,
  COMPRESSION_RATIO: 3,
};

/**
 * Animation durations (ms)
 */
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 400,
  PULSE: 600,
};

/**
 * Tempo range (BPM)
 */
export const TEMPO_RANGE = {
  MIN: 60,
  MAX: 180,
  DEFAULT: 120,
};
