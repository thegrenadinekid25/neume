import { create } from 'zustand';
import { Chord } from '@types';

export interface DeconstructionStep {
  stepNumber: number;
  stepName: string;
  description: string;
  chords: Chord[];
}

interface BuildFromBonesState {
  isPanelOpen: boolean;
  currentStep: number;
  totalSteps: number;
  steps: DeconstructionStep[];
  isPlaying: boolean;
  playbackMode: 'single' | 'sequence' | 'compare' | null;

  // Actions
  openPanel: (steps: DeconstructionStep[]) => void;
  closePanel: () => void;
  nextStep: () => void;
  prevStep: () => void;
  jumpToStep: (stepIndex: number) => void;
  setPlaying: (isPlaying: boolean) => void;
  setPlaybackMode: (mode: 'single' | 'sequence' | 'compare' | null) => void;
}

export const useBuildFromBonesStore = create<BuildFromBonesState>((set) => ({
  isPanelOpen: false,
  currentStep: 0,
  totalSteps: 0,
  steps: [],
  isPlaying: false,
  playbackMode: null,

  openPanel: (steps) => set({
    isPanelOpen: true,
    steps,
    totalSteps: steps.length,
    currentStep: 0
  }),

  closePanel: () => set({
    isPanelOpen: false,
    currentStep: 0,
    isPlaying: false,
    playbackMode: null
  }),

  nextStep: () => set((state) => ({
    currentStep: (state.currentStep + 1) % state.totalSteps
  })),

  prevStep: () => set((state) => ({
    currentStep: state.currentStep === 0
      ? state.totalSteps - 1
      : state.currentStep - 1
  })),

  jumpToStep: (stepIndex) => set({ currentStep: stepIndex }),

  setPlaying: (isPlaying) => set({ isPlaying }),

  setPlaybackMode: (mode) => set({ playbackMode: mode }),
}));
