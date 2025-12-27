import { create } from 'zustand';
import type { SavedProgression } from '../types';
import { progressionStorage } from '../services/progression-storage';

interface ProgressionsState {
  // Modal state
  isModalOpen: boolean;
  isSaveDialogOpen: boolean;

  // Data
  savedProgressions: SavedProgression[];

  // Filters
  currentFilter: 'all' | 'favorites' | 'recent';
  searchQuery: string;

  // Actions
  openModal: () => void;
  closeModal: () => void;
  openSaveDialog: () => void;
  closeSaveDialog: () => void;
  loadProgressions: () => void;
  saveProgression: (progression: SavedProgression) => void;
  deleteProgression: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setFilter: (filter: 'all' | 'favorites' | 'recent') => void;
  setSearchQuery: (query: string) => void;

  // Computed
  getFilteredProgressions: () => SavedProgression[];
}

export const useProgressionsStore = create<ProgressionsState>((set, get) => ({
  // Initial state
  isModalOpen: false,
  isSaveDialogOpen: false,
  savedProgressions: [],
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

  // Data loading
  loadProgressions: () => {
    const progressions = progressionStorage.getAll();
    set({ savedProgressions: progressions });
  },

  // Save progression
  saveProgression: (progression) => {
    progressionStorage.save(progression);
    get().loadProgressions();
  },

  // Delete progression
  deleteProgression: (id) => {
    if (confirm('Delete this progression?')) {
      progressionStorage.delete(id);
      get().loadProgressions();
    }
  },

  // Toggle favorite status
  toggleFavorite: (id) => {
    const progression = progressionStorage.getById(id);
    if (progression) {
      progression.isFavorite = !progression.isFavorite;
      progressionStorage.save(progression);
      get().loadProgressions();
    }
  },

  // Filter management
  setFilter: (filter) => set({ currentFilter: filter }),

  setSearchQuery: (query) => set({ searchQuery: query }),

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
