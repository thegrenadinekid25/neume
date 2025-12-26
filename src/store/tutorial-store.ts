import { create } from 'zustand';

interface TutorialState {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  hasCompletedTutorial: boolean;

  startTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
}

export const useTutorialStore = create<TutorialState>((set) => ({
  isActive: false,
  currentStep: 0,
  totalSteps: 5,
  hasCompletedTutorial: false,

  startTutorial: () => set({ isActive: true, currentStep: 0 }),

  nextStep: () => set((state) => {
    const nextStepNum = state.currentStep + 1;
    if (nextStepNum >= state.totalSteps) {
      // Tutorial complete
      localStorage.setItem('tutorial-completed', 'true');
      return { isActive: false, currentStep: 0, hasCompletedTutorial: true };
    }
    return { currentStep: nextStepNum };
  }),

  prevStep: () => set((state) => ({
    currentStep: Math.max(0, state.currentStep - 1)
  })),

  skipTutorial: () => {
    localStorage.setItem('tutorial-completed', 'true');
    set({ isActive: false, currentStep: 0, hasCompletedTutorial: true });
  },

  completeTutorial: () => {
    localStorage.setItem('tutorial-completed', 'true');
    set({ isActive: false, currentStep: 0, hasCompletedTutorial: true });
  },
}));

// Check if tutorial should start
export function checkTutorialStatus(): boolean {
  return !localStorage.getItem('tutorial-completed');
}
