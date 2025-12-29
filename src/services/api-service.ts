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

/**
 * Types for suggestion API
 */
export interface SimpleChord {
  root: string;
  quality: string;
  extensions?: Record<string, boolean>;
}

export interface SuggestionData {
  id: string;
  technique: string;
  targetChordId?: string;
  fromChord: SimpleChord;
  toChord: SimpleChord;
  rationale: string;
  examples: string[];
  relevanceScore: number;
}

export interface SuggestResponse {
  success: boolean;
  suggestions?: SuggestionData[];
  error?: string;
}

/**
 * Get chord refinement suggestions from the API
 */
export async function suggestRefinements(
  intent: string,
  chords: SimpleChord[],
  key: string,
  mode: string
): Promise<SuggestResponse> {
  const response = await fetch(`${API_BASE_URL}/api/suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intent, chords, key, mode }),
  });
  if (!response.ok) {
    throw new Error('Suggestion request failed');
  }
  return response.json();
}
