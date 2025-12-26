import { create } from 'zustand';
import { AnalysisInput, AnalysisProgress, AnalysisResult, AnalysisError } from '@/types/analysis';
import { useCanvasStore } from './canvas-store';

interface AnalysisState {
  // Modal state
  isModalOpen: boolean;

  // Input state
  input: AnalysisInput | null;

  // Process state
  isAnalyzing: boolean;
  progress: AnalysisProgress | null;
  error: AnalysisError | null;
  result: AnalysisResult | null;

  // Actions
  openModal: () => void;
  closeModal: () => void;
  setInput: (input: AnalysisInput) => void;
  startAnalysis: (input: AnalysisInput) => Promise<void>;
  updateProgress: (progress: AnalysisProgress) => void;
  setError: (error: AnalysisError) => void;
  setResult: (result: AnalysisResult) => void;
  cancelAnalysis: () => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  isModalOpen: false,
  input: null,
  isAnalyzing: false,
  progress: null,
  error: null,
  result: null,

  openModal: () => set({ isModalOpen: true, error: null }),
  closeModal: () => set({ isModalOpen: false }),

  setInput: (input) => set({ input, error: null }),

  startAnalysis: async (input) => {
    const { analyzeAudio } = await import('@/services/api-service');

    set({
      isAnalyzing: true,
      input,
      error: null,
      progress: {
        stage: 'uploading',
        progress: 10,
        message: 'Uploading audio...',
      },
    });

    try {
      // Update progress
      set({
        progress: {
          stage: 'processing',
          progress: 30,
          message: 'Processing audio with Essentia...',
        },
      });

      // Call backend API
      const result = await analyzeAudio(input);

      // Update progress
      set({
        progress: {
          stage: 'analyzing',
          progress: 70,
          message: 'Extracting chord progression...',
        },
      });

      // Simulate final processing
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Complete
      set({
        result,
        isAnalyzing: false,
        progress: {
          stage: 'complete',
          progress: 100,
          message: 'Analysis complete!',
        },
      });

      // Add analyzed chords to canvas
      if (result.chords && result.chords.length > 0) {
        const { setChords } = useCanvasStore.getState();
        setChords(result.chords);
      }

      // Close modal after brief delay
      setTimeout(() => {
        set({ isModalOpen: false });
      }, 1500);
    } catch (error) {
      set({
        isAnalyzing: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: error instanceof Error ? error.message : 'Analysis failed',
          retryable: true,
        },
      });
    }
  },

  updateProgress: (progress) => set({ progress }),
  setError: (error) => set({ error, isAnalyzing: false }),
  setResult: (result) => set({ result, isAnalyzing: false, isModalOpen: false }),

  cancelAnalysis: () =>
    set({
      isAnalyzing: false,
      progress: null,
    }),

  reset: () =>
    set({
      input: null,
      error: null,
      progress: null,
      result: null,
    }),
}));
