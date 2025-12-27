/**
 * Zustand store for analysis feature
 */

import { create } from 'zustand';
import type {
  AnalysisInput,
  AnalysisProgress,
  AnalysisResult,
  AnalysisError,
} from '@/types/analysis';
import type { Chord, MusicalKey, Mode } from '@/types/chord';
import type { PhraseBoundary } from '@/types/progression';
import { convertAnalysisResultToChords, quantizeProgression } from '@/utils/chord-converter';
import { useCanvasStore } from './canvas-store';

interface AnalysisState {
  // Modal state
  isModalOpen: boolean;
  activeTab: 'youtube' | 'audio';

  // Input state
  input: AnalysisInput | null;

  // Process state
  isAnalyzing: boolean;
  progress: AnalysisProgress | null;
  error: AnalysisError | null;
  result: AnalysisResult | null;

  // Metadata for banner display
  metadata: {
    title: string;
    composer?: string;
    sourceUrl?: string;
    analyzedAt: string;
  } | null;

  // Converted chords ready for canvas
  convertedChords: Chord[] | null;

  // Phrase boundaries for visual grouping
  phraseBoundaries: PhraseBoundary[] | null;

  // Actions
  openModal: () => void;
  closeModal: () => void;
  setActiveTab: (tab: 'youtube' | 'audio') => void;
  setInput: (input: AnalysisInput) => void;
  clearInput: () => void;
  startAnalysis: (input: AnalysisInput) => Promise<void>;
  updateProgress: (progress: AnalysisProgress) => void;
  setError: (error: AnalysisError) => void;
  setResult: (result: AnalysisResult) => void;
  cancelAnalysis: () => void;
  clearAnalyzedProgression: () => void;
  reset: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  // Initial state
  isModalOpen: false,
  activeTab: 'youtube',
  input: null,
  isAnalyzing: false,
  progress: null,
  error: null,
  result: null,
  metadata: null,
  convertedChords: null,
  phraseBoundaries: null,

  // Modal actions
  openModal: () => set({ isModalOpen: true, error: null, result: null }),
  closeModal: () => {
    const { isAnalyzing } = get();
    if (!isAnalyzing) {
      set({ isModalOpen: false });
    }
  },
  setActiveTab: (tab) => set({ activeTab: tab, error: null }),

  // Input actions
  setInput: (input) => set({ input, error: null }),
  clearInput: () => set({ input: null, error: null }),

  // Analysis actions - implement full API call logic
  startAnalysis: async (input) => {
    set({
      isAnalyzing: true,
      input,
      error: null,
      progress: { stage: 'uploading', progress: 0, message: 'Preparing...' },
    });

    try {
      // If audio file, upload first
      if (input.type === 'audio' && input.audioFile) {
        set({
          progress: {
            stage: 'uploading',
            progress: 25,
            message: 'Uploading audio file...',
          },
        });

        const formData = new FormData();
        formData.append('file', input.audioFile);

        const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) throw new Error('Upload failed');
        const { uploadId } = await uploadRes.json();
        input.uploadId = uploadId;
      }

      set({
        progress: {
          stage: 'analyzing',
          progress: 50,
          message: 'Analyzing chords...',
        },
      });

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

      const data = await response.json();

      if (data.success) {
        // Convert the analyzed chords to canvas format
        const rawChords = convertAnalysisResultToChords(data.result);

        // Quantize the progression for clearer harmonic analysis:
        // - Removes consecutive duplicate chords
        // - Detects repeating patterns (2-6 chords) with fuzzy matching
        // - Keeps 2 cycles of each unique pattern (verse, chorus, etc.)
        // - Normalizes all chord durations to 2 beats each
        const { chords: convertedChords, phrases: phraseBoundaries } = quantizeProgression(rawChords, 2);

        // Create metadata for banner display
        const metadata = {
          title: data.result.title || (input.type === 'youtube' && input.videoId ? `YouTube: ${input.videoId}` : 'Analyzed Progression'),
          sourceUrl: input.youtubeUrl,
          analyzedAt: new Date().toISOString(),
        };

        // Apply to canvas store - update key, mode, tempo, chords, and phrases
        useCanvasStore.getState().loadAnalyzedProgression({
          chords: convertedChords,
          phrases: phraseBoundaries,
          key: data.result.key as MusicalKey,
          mode: data.result.mode as Mode,
          tempo: data.result.tempo,
        });

        set({
          result: data.result,
          convertedChords,
          phraseBoundaries,
          metadata,
          isAnalyzing: false,
          progress: { stage: 'complete', progress: 100, message: 'Analysis complete!' },
          isModalOpen: false, // Close the modal after successful analysis
        });
      } else {
        set({
          error: data.error,
          isAnalyzing: false,
          progress: null,
        });
      }
    } catch (error) {
      set({
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
          retryable: true,
        },
        isAnalyzing: false,
        progress: null,
      });
    }
  },

  updateProgress: (progress) => set({ progress }),
  setError: (error) => set({ error, isAnalyzing: false, progress: null }),
  setResult: (result) => set({ result, isAnalyzing: false }),
  cancelAnalysis: () => set({ isAnalyzing: false, progress: null }),
  clearAnalyzedProgression: () =>
    set({
      result: null,
      metadata: null,
      convertedChords: null,
      phraseBoundaries: null,
    }),
  reset: () =>
    set({
      input: null,
      error: null,
      progress: null,
      result: null,
      metadata: null,
      convertedChords: null,
      phraseBoundaries: null,
      activeTab: 'youtube',
    }),
}));
