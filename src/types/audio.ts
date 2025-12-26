/**
 * Audio engine state
 */
export type AudioEngineState = 'uninitialized' | 'ready' | 'playing' | 'error';

/**
 * Voice range (SATB)
 */
export interface VoiceRange {
  low: string; // e.g., "C3"
  high: string; // e.g., "C5"
}

/**
 * SATB ranges (from spec)
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
  masterVolume: number; // 0.0-1.0
  tempo: number; // BPM
  reverbWetness: number; // 0.0-1.0
  compressionThreshold: number; // dB
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
