import { create } from 'zustand';
import type { SavedProgression } from '../types';
import { progressionStorage } from '../services/progression-storage';
import { useExpertModeStore } from './expert-mode-store';
import { showDestructiveConfirm } from './confirmation-store';
import { showSuccessToast, showErrorToast } from './toast-store';

interface ProgressionsState {
  // Modal state
  isModalOpen: boolean;
  isSaveDialogOpen: boolean;

  // Data
  savedProgressions: SavedProgression[];
  isLoading: boolean;
  error: string | null;
  currentRequestId: number;

  // Filters
  currentFilter: 'all' | 'favorites' | 'recent';
  searchQuery: string;

  // Actions
  openModal: () => void;
  closeModal: () => void;
  openSaveDialog: () => void;
  closeSaveDialog: () => void;
  loadProgressions: () => Promise<void>;
  saveProgression: (progression: SavedProgression) => Promise<void>;
  deleteProgression: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  renameProgression: (id: string, newTitle: string) => Promise<void>;
  setFilter: (filter: 'all' | 'favorites' | 'recent') => void;
  setSearchQuery: (query: string) => void;
  migrateLocalData: (userId: string) => Promise<{ migrated: number; errors: number }>;
  clearError: () => void;

  // Computed
  getFilteredProgressions: () => SavedProgression[];
}

export const useProgressionsStore = create<ProgressionsState>((set, get) => ({
  // Initial state
  isModalOpen: false,
  isSaveDialogOpen: false,
  savedProgressions: [],
  isLoading: false,
  error: null,
  currentRequestId: 0,
  currentFilter: 'all',
  searchQuery: '',

  // Modal actions
  openModal: () => {
    get().loadProgressions();
    set({ isModalOpen: true });
  },

  closeModal: () => set({ isModalOpen: false }),

  openSaveDialog: () => set({ isSaveDialogOpen: true }),

  closeSaveDialog: () => set({ isSaveDialogOpen: false }),

  // Data loading (now async)
  loadProgressions: async () => {
    const requestId = ++get().currentRequestId;
    set({ isLoading: true, error: null, currentRequestId: requestId });
    try {
      const progressions = await progressionStorage.getAll();
      if (get().currentRequestId === requestId) {
        set({ savedProgressions: progressions, isLoading: false });
      }
    } catch (error) {
      if (get().currentRequestId === requestId) {
        console.error('Failed to load progressions:', error);
        set({ error: 'Failed to load progressions', isLoading: false });
      }
    }
  },

  // Save progression (now async)
  saveProgression: async (progression) => {
    set({ isLoading: true, error: null });
    try {
      await progressionStorage.save(progression);

      // Track progression save for Expert Mode
      useExpertModeStore.getState().trackProgressionSaved();

      await get().loadProgressions();
      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to save progression:', error);
      set({ error: 'Failed to save progression', isLoading: false });
      throw error; // Re-throw so caller can handle
    }
  },

  // Delete progression (now async)
  deleteProgression: async (id) => {
    showDestructiveConfirm(
      'Delete Progression',
      'Are you sure you want to delete this progression? This cannot be undone.',
      async () => {
        set({ isLoading: true, error: null });
        try {
          await progressionStorage.delete(id);
          await get().loadProgressions();
          showSuccessToast('Progression deleted');
        } catch (error) {
          console.error('Failed to delete progression:', error);
          set({ error: 'Failed to delete progression', isLoading: false });
          showErrorToast('Failed to delete progression');
        }
      }
    );
  },

  // Toggle favorite status (now async)
  toggleFavorite: async (id) => {
    try {
      const progression = await progressionStorage.getById(id);
      if (progression) {
        const wasFavorite = progression.isFavorite;
        progression.isFavorite = !progression.isFavorite;
        await progressionStorage.save(progression);
        await get().loadProgressions();
        showSuccessToast(wasFavorite ? 'Removed from favorites' : 'Added to favorites');
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      set({ error: 'Failed to update progression' });
      showErrorToast('Failed to update progression');
    }
  },

  // Rename progression (now async)
  renameProgression: async (id, newTitle) => {
    try {
      const progression = await progressionStorage.getById(id);
      if (progression) {
        const updated = { ...progression, title: newTitle, updatedAt: new Date().toISOString() };
        await progressionStorage.save(updated);
        await get().loadProgressions();
        showSuccessToast('Progression renamed');
      }
    } catch (error) {
      console.error('Failed to rename progression:', error);
      set({ error: 'Failed to rename progression' });
      showErrorToast('Failed to rename progression');
    }
  },

  // Filter management
  setFilter: (filter) => set({ currentFilter: filter }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  // Migrate local data to cloud
  migrateLocalData: async (userId: string) => {
    return progressionStorage.migrateToCloud(userId);
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Computed getter for filtered progressions
  getFilteredProgressions: () => {
    const { savedProgressions, currentFilter, searchQuery } = get();

    let filtered = [...savedProgressions];

    // Apply filter
    if (currentFilter === 'favorites') {
      filtered = filtered.filter((p) => p.isFavorite);
    } else if (currentFilter === 'recent') {
      filtered = filtered.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      filtered = filtered.slice(0, 10);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  },
}));
