/**
 * Audio engine state
 */
export type AudioEngineState = 'uninitialized' | 'ready' | 'playing' | 'error';

/**
 * Sound type for instrument selection
 */
export type SoundType = 'piano' | 'chime';

/**
 * Voice range (SATB)
 */
export interface VoiceRange {
  low: string;
  high: string;
}

/**
 * SATB ranges
 */
export interface SATBRanges {
  soprano: VoiceRange;
  alto: VoiceRange;
  tenor: VoiceRange;
  bass: VoiceRange;
}

/**
 * Audio settings
 */
export interface AudioSettings {
  masterVolume: number;
  tempo: number;
  reverbWetness: number;
  compressionThreshold: number;
}

/**
 * Playback state
 */
export interface PlaybackState {
  isPlaying: boolean;
  currentBeat: number;
  loopEnabled: boolean;
  loopStart?: number;
  loopEnd?: number;
}
