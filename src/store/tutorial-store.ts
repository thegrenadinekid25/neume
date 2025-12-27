/**
 * Zustand store for welcome tutorial
 */

import { create } from 'zustand';

export interface TutorialState {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  hasCompletedTutorial: boolean;

  startTutorial: () => void;
  nextStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  checkCompletion: () => void;
}

const TUTORIAL_COMPLETED_KEY = 'tutorial-completed';

export const useTutorialStore = create<TutorialState>((set) => ({
  isActive: false,
  currentStep: 0,
  totalSteps: 6,
  hasCompletedTutorial: false,

  startTutorial: () => {
    set({ isActive: true, currentStep: 0 });
  },

  nextStep: () => {
    set((state) => {
      const nextStep = state.currentStep + 1;
      if (nextStep >= state.totalSteps) {
        // Auto-complete on last step
        localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
        return { currentStep: nextStep, isActive: false, hasCompletedTutorial: true };
      }
      return { currentStep: nextStep };
    });
  },

  skipTutorial: () => {
    localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
    set({ isActive: false, hasCompletedTutorial: true });
  },

  completeTutorial: () => {
    localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
    set({ isActive: false, hasCompletedTutorial: true });
  },

  checkCompletion: () => {
    const completed = localStorage.getItem(TUTORIAL_COMPLETED_KEY) === 'true';
    set({ hasCompletedTutorial: completed });
  },
}));
