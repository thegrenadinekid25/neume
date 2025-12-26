import { create } from 'zustand';
import { SavedProgression, progressionStorage } from '../services/progression-storage';

interface ProgressionsState {
  progressions: SavedProgression[];
  isModalOpen: boolean;
  isSaveDialogOpen: boolean;

  // Actions
  loadProgressions: () => void;
  saveProgression: (progression: SavedProgression) => void;
  deleteProgression: (id: string) => void;
  toggleFavorite: (id: string) => void;
  openModal: () => void;
  closeModal: () => void;
  openSaveDialog: () => void;
  closeSaveDialog: () => void;
}

export const useProgressionsStore = create<ProgressionsState>((set, get) => ({
  progressions: [],
  isModalOpen: false,
  isSaveDialogOpen: false,

  loadProgressions: () => {
    const progressions = progressionStorage.getAll();
    set({ progressions });
  },

  saveProgression: (progression) => {
    progressionStorage.save(progression);
    get().loadProgressions();
  },

  deleteProgression: (id) => {
    progressionStorage.delete(id);
    get().loadProgressions();
  },

  toggleFavorite: (id) => {
    const progression = progressionStorage.getById(id);
    if (progression) {
      progression.isFavorite = !progression.isFavorite;
      progressionStorage.save(progression);
      get().loadProgressions();
    }
  },

  openModal: () => {
    get().loadProgressions();
    set({ isModalOpen: true });
  },

  closeModal: () => set({ isModalOpen: false }),

  openSaveDialog: () => set({ isSaveDialogOpen: true }),

  closeSaveDialog: () => set({ isSaveDialogOpen: false }),
}));
