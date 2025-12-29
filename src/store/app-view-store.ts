import { create } from 'zustand';

interface AppViewState {
  currentView: 'dashboard' | 'canvas';
  currentProgressionId: string | null;

  // Actions
  navigateToDashboard: () => void;
  navigateToCanvas: (progressionId?: string) => void;
  setCurrentProgressionId: (id: string | null) => void;
}

export const useAppViewStore = create<AppViewState>((set) => ({
  // Initial state
  currentView: 'dashboard',
  currentProgressionId: null,

  // Actions
  navigateToDashboard: () => set({ currentView: 'dashboard' }),

  navigateToCanvas: (progressionId) => set({
    currentView: 'canvas',
    currentProgressionId: progressionId ?? null
  }),

  setCurrentProgressionId: (id) => set({ currentProgressionId: id }),
}));
