/**
 * Composition Tools Store
 *
 * Manages state for the composition tools panel (Lyrics + Voice Lines).
 */

import { create } from 'zustand';

type ToolsTab = 'lyrics' | 'voices';

interface CompositionToolsState {
  isPanelOpen: boolean;
  activeTab: ToolsTab;
}

interface CompositionToolsActions {
  openPanel: (tab?: ToolsTab) => void;
  closePanel: () => void;
  setActiveTab: (tab: ToolsTab) => void;
}

export const useCompositionToolsStore = create<CompositionToolsState & CompositionToolsActions>(
  (set) => ({
    isPanelOpen: false,
    activeTab: 'lyrics',

    openPanel: (tab) => {
      set({
        isPanelOpen: true,
        activeTab: tab ?? 'lyrics',
      });
    },

    closePanel: () => {
      set({ isPanelOpen: false });
    },

    setActiveTab: (tab) => {
      set({ activeTab: tab });
    },
  })
);
