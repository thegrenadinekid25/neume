import { create } from 'zustand';

interface ShortcutsState {
  isGuideOpen: boolean;
  openGuide: () => void;
  closeGuide: () => void;
}

export const useShortcutsStore = create<ShortcutsState>((set) => ({
  isGuideOpen: false,

  openGuide: () => set({ isGuideOpen: true }),
  closeGuide: () => set({ isGuideOpen: false }),
}));
