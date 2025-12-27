/**
 * Analysis types for the Analyze Modal feature
 */

export type UploadType = 'youtube' | 'audio';

export interface AnalysisInput {
  type: UploadType;
  youtubeUrl?: string;
  videoId?: string;
  audioFile?: File;
  uploadId?: string;
  startTime?: number;
  endTime?: number;
  keyHint?: string;
  modeHint?: 'auto' | 'major' | 'minor';
}

export type AnalysisStage = 'uploading' | 'processing' | 'analyzing' | 'complete';

export interface AnalysisProgress {
  stage: AnalysisStage;
  progress: number;
  message: string;
  estimatedTimeRemaining?: number;
}

export interface AnalysisError {
  code: 'INVALID_URL' | 'FILE_TOO_LARGE' | 'INVALID_FORMAT' | 'DOWNLOAD_FAILED' | 'ANALYSIS_FAILED' | 'NETWORK_ERROR';
  message: string;
  retryable: boolean;
}

export interface AnalysisResult {
  title: string;
  composer?: string;
  key: string;
  mode: 'major' | 'minor';
  tempo: number;
  timeSignature: string;
  chords: AnalyzedChord[];
  sourceUrl?: string;
  analyzedAt: string;
}

export interface AnalyzedChord {
  startBeat: number;
  duration: number;
  root: string;
  quality: string;
  extensions: Record<string, boolean>;
  confidence: number;
}
