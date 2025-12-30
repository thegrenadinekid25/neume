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
import type { DeconstructionStep } from './build-from-bones-store';
import { convertAnalysisResultToChords, quantizeProgression } from '@/utils/chord-converter';
import { useCanvasStore } from './canvas-store';
import { parseMidiFile } from '@/services/midi-parser';
import { parseMusicXMLFile } from '@/services/musicxml-parser';
import { detectChordsFromNoteGroups } from '@/services/file-chord-detector';
import { detectKeyFromChords } from '@/services/file-key-detector';

interface AnalysisState {
  // Modal state
  isModalOpen: boolean;
  activeTab: 'youtube' | 'audio';
  showResultsView: boolean;

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

  // Deconstruction state
  deconstructionSteps: DeconstructionStep[] | null;
  isDeconstructing: boolean;
  deconstructionError: AnalysisError | null;

  // Actions
  openModal: () => void;
  closeModal: () => void;
  setActiveTab: (tab: 'youtube' | 'audio') => void;
  setInput: (input: AnalysisInput) => void;
  clearInput: () => void;
  startAnalysis: (input: AnalysisInput) => Promise<void>;
  startDeconstruction: () => Promise<void>;
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
  showResultsView: false,
  input: null,
  isAnalyzing: false,
  progress: null,
  error: null,
  result: null,
  metadata: null,
  convertedChords: null,
  phraseBoundaries: null,
  deconstructionSteps: null,
  isDeconstructing: false,
  deconstructionError: null,

  // Modal actions
  openModal: () => set({ isModalOpen: true, error: null, result: null, progress: null, showResultsView: false }),
  closeModal: () => {
    const { isAnalyzing, isDeconstructing } = get();
    if (!isAnalyzing && !isDeconstructing) {
      set({ isModalOpen: false, showResultsView: false });
    }
  },
  setActiveTab: (tab) => set({ activeTab: tab, error: null }),

  // Input actions
  setInput: (input) => set({ input, error: null }),
  clearInput: () => set({ input: null, error: null }),

  // Analysis actions - implement full API call logic or client-side file parsing
  startAnalysis: async (input) => {
    set({
      isAnalyzing: true,
      input,
      error: null,
      progress: { stage: 'uploading', progress: 0, message: 'Preparing...' },
    });

    try {
      // Handle file type inputs with client-side parsing
      if (input.type === 'file') {
        if (!input.importFile) {
          throw new Error('No file provided');
        }

        // Step 1: Read file
        set({
          progress: {
            stage: 'processing',
            progress: 25,
            message: 'Reading file...',
          },
        });

        // Parse file based on format
        let parsedResult;
        if (input.importFormat === 'midi') {
          parsedResult = await parseMidiFile(input.importFile);
        } else if (input.importFormat === 'musicxml') {
          parsedResult = await parseMusicXMLFile(input.importFile);
        } else {
          throw new Error(`Unsupported format: ${input.importFormat}`);
        }

        // Validate that we have musical content
        if (!parsedResult.noteGroups || parsedResult.noteGroups.length === 0) {
          throw new Error('No musical content found in file');
        }

        // Step 2: Detect chords
        set({
          progress: {
            stage: 'analyzing',
            progress: 50,
            message: 'Detecting chords...',
          },
        });

        const tempo = parsedResult.metadata?.tempo || 120;
        const analyzedChords = await detectChordsFromNoteGroups(parsedResult.noteGroups, tempo);

        if (!analyzedChords || analyzedChords.length === 0) {
          throw new Error('No chords detected. This file may be a single melodic line.');
        }

        // Step 3: Analyze key
        set({
          progress: {
            stage: 'analyzing',
            progress: 75,
            message: 'Analyzing key...',
          },
        });

        const keyInfo = await detectKeyFromChords(analyzedChords, parsedResult.metadata?.keySignature);

        // Step 4: Build analysis result
        const analysisResult: AnalysisResult = {
          title: input.importFile?.name ? input.importFile.name.replace(/\.[^.]+$/, '') : 'Imported Progression',
          composer: parsedResult.metadata?.composer,
          key: keyInfo.key,
          mode: keyInfo.mode,
          tempo: Math.round(tempo),
          timeSignature: parsedResult.metadata?.timeSignature || '4/4',
          chords: analyzedChords,
          analyzedAt: new Date().toISOString(),
        };

        // Step 5: Convert to canvas format
        const rawChords = convertAnalysisResultToChords(analysisResult);

        // Quantize the progression for clearer harmonic analysis:
        // - Removes consecutive duplicate chords
        // - Detects repeating patterns (2-6 chords) with fuzzy matching
        // - Keeps 2 cycles of each unique pattern (verse, chorus, etc.)
        // - Normalizes all chord durations to 2 beats each
        const { chords: convertedChords, phrases: phraseBoundaries } = quantizeProgression(rawChords, 2);

        // Create metadata for banner display
        const metadata = {
          title: analysisResult.title,
          composer: analysisResult.composer,
          analyzedAt: analysisResult.analyzedAt,
        };

        // Apply to canvas store - update key, mode, tempo, chords, and phrases
        useCanvasStore.getState().loadAnalyzedProgression({
          chords: convertedChords,
          phrases: phraseBoundaries,
          key: analysisResult.key as MusicalKey,
          mode: analysisResult.mode as Mode,
          tempo: analysisResult.tempo,
        });

        set({
          result: analysisResult,
          convertedChords,
          phraseBoundaries,
          metadata,
          isAnalyzing: false,
          progress: { stage: 'complete', progress: 100, message: 'Analysis complete!' },
          showResultsView: true,
          deconstructionSteps: null,
          deconstructionError: null,
        });

        return;
      }

      // Handle audio/youtube uploads (legacy backend API)
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
          showResultsView: true, // Show results in modal instead of auto-closing
          deconstructionSteps: null, // Reset deconstruction when new analysis is done
          deconstructionError: null,
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

  // Deconstruction action
  startDeconstruction: async () => {
    const { result, convertedChords } = get();

    if (!result || !convertedChords) {
      set({
        deconstructionError: {
          code: 'ANALYSIS_FAILED',
          message: 'Please analyze a progression first',
          retryable: false,
        },
      });
      return;
    }

    set({
      isDeconstructing: true,
      deconstructionError: null,
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/deconstruct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chords: convertedChords.map((chord) => ({
            quality: chord.quality,
            scaleDegree: chord.scaleDegree,
          })),
          key: result.key,
          mode: result.mode,
        }),
      });

      const data = await response.json();

      if (data.success && data.steps) {
        set({
          deconstructionSteps: data.steps,
          isDeconstructing: false,
          deconstructionError: null,
        });
      } else {
        set({
          deconstructionError: data.error || {
            code: 'ANALYSIS_FAILED',
            message: 'Failed to deconstruct progression',
            retryable: true,
          },
          isDeconstructing: false,
        });
      }
    } catch (error) {
      set({
        deconstructionError: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
          retryable: true,
        },
        isDeconstructing: false,
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
      deconstructionSteps: null,
      deconstructionError: null,
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
      deconstructionSteps: null,
      deconstructionError: null,
      showResultsView: false,
      activeTab: 'youtube',
    }),
}));
