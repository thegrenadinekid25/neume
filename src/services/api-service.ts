/**
 * API service for backend communication
 */

import type { AnalysisInput, AnalysisResult, AnalysisError } from '@/types/analysis';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  success: boolean;
  result?: T;
  error?: AnalysisError;
}

/**
 * Upload audio file for analysis
 */
export async function uploadAudioFile(file: File): Promise<{ uploadId: string; expiresAt: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return response.json();
}

/**
 * Analyze audio and extract chords
 */
export async function analyzeAudio(input: AnalysisInput): Promise<ApiResponse<AnalysisResult>> {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: input.type,
      youtubeUrl: input.youtubeUrl,
      videoId: input.videoId,
      uploadId: input.uploadId,
      startTime: input.startTime,
      endTime: input.endTime,
      keyHint: input.keyHint || 'auto',
      modeHint: input.modeHint || 'auto',
    }),
  });

  return response.json();
}

/**
 * Check analysis status (for long-running jobs)
 */
export async function getAnalysisStatus(jobId: string): Promise<{
  status: 'processing' | 'complete' | 'failed';
  progress: number;
  stage: string;
  estimatedTimeRemaining?: number;
}> {
  const response = await fetch(`${API_BASE_URL}/api/analyze/status/${jobId}`);
  return response.json();
}
