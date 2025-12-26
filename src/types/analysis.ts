import { Chord } from './index';

export type UploadType = 'youtube' | 'audio';

export interface AnalysisInput {
  type: UploadType;

  // YouTube
  youtubeUrl?: string;
  videoId?: string;

  // Audio file
  audioFile?: File;

  // Advanced options
  startTime?: number; // seconds
  endTime?: number;   // seconds
  keyHint?: string;   // 'auto' | 'C' | 'D' | etc.
  modeHint?: 'auto' | 'major' | 'minor';
}

export interface AnalysisProgress {
  stage: 'uploading' | 'processing' | 'analyzing' | 'complete';
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number; // seconds
}

export interface AnalysisResult {
  title: string;
  composer?: string;
  key: string;
  mode: 'major' | 'minor';
  tempo: number;
  chords: Chord[];
  sourceUrl?: string;
  analyzedAt: string; // ISO timestamp
}

export interface AnalysisError {
  code: string;
  message: string;
  retryable: boolean;
}
