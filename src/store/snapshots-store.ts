import { create } from 'zustand';
import type { Snapshot, SnapshotInput } from '../types';
import { snapshotStorage } from '../services/snapshot-storage';
import { showSuccessToast, showErrorToast } from './toast-store';

interface SnapshotsState {
  // Data
  snapshots: Snapshot[];
  isLoading: boolean;
  error: string | null;

  // UI state
  isPanelOpen: boolean;
  searchQuery: string;
  currentFilter: 'all' | 'favorites' | 'recent';
  filterTags: string[];
  selectedSnapshotId: string | null;

  // Actions
  loadSnapshots: () => void;
  saveSnapshot: (input: SnapshotInput) => Snapshot;
  updateSnapshot: (id: string, updates: Partial<SnapshotInput>) => Promise<void>;
  deleteSnapshot: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  markAsUsed: (id: string) => void;

  // UI Actions
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  setSearchQuery: (query: string) => void;
  setFilter: (filter: 'all' | 'favorites' | 'recent') => void;
  setFilterTags: (tags: string[]) => void;
  setSelectedSnapshotId: (id: string | null) => void;
  clearError: () => void;

  // Computed
  getFilteredSnapshots: () => Snapshot[];
  getAllTags: () => string[];
}

export const useSnapshotsStore = create<SnapshotsState>((set, get) => ({
  // Initial state
  snapshots: [],
  isLoading: false,
  error: null,
  isPanelOpen: false,
  searchQuery: '',
  currentFilter: 'all',
  filterTags: [],
  selectedSnapshotId: null,

  // Data loading
  loadSnapshots: () => {
    set({ isLoading: true, error: null });
    try {
      const snapshots = snapshotStorage.getAll();
      set({ snapshots, isLoading: false });
    } catch (error) {
      console.error('Failed to load snapshots:', error);
      set({ error: 'Failed to load snapshots', isLoading: false });
    }
  },

  // Save snapshot
  saveSnapshot: (input) => {
    try {
      const snapshot = snapshotStorage.save(input);
      set((state) => ({
        snapshots: [...state.snapshots, snapshot],
      }));
      showSuccessToast('Snapshot saved');
      return snapshot;
    } catch (error) {
      console.error('Failed to save snapshot:', error);
      showErrorToast('Failed to save snapshot');
      throw error;
    }
  },

  // Update snapshot
  updateSnapshot: async (id, updates) => {
    try {
      const updated = snapshotStorage.update(id, updates);
      if (!updated) {
        throw new Error('Snapshot not found');
      }
      set((state) => ({
        snapshots: state.snapshots.map((s) => (s.id === id ? updated : s)),
      }));
      showSuccessToast('Snapshot updated');
    } catch (error) {
      console.error('Failed to update snapshot:', error);
      set({ error: 'Failed to update snapshot' });
      showErrorToast('Failed to update snapshot');
      throw error;
    }
  },

  // Delete snapshot
  deleteSnapshot: async (id) => {
    try {
      const deleted = snapshotStorage.delete(id);
      if (!deleted) {
        throw new Error('Snapshot not found');
      }
      set((state) => ({
        snapshots: state.snapshots.filter((s) => s.id !== id),
        selectedSnapshotId: state.selectedSnapshotId === id ? null : state.selectedSnapshotId,
      }));
      showSuccessToast('Snapshot deleted');
    } catch (error) {
      console.error('Failed to delete snapshot:', error);
      set({ error: 'Failed to delete snapshot' });
      showErrorToast('Failed to delete snapshot');
      throw error;
    }
  },

  // Toggle favorite status
  toggleFavorite: async (id) => {
    try {
      const snapshot = get().snapshots.find((s) => s.id === id);
      if (!snapshot) {
        throw new Error('Snapshot not found');
      }
      await get().updateSnapshot(id, { isFavorite: !snapshot.isFavorite });
      showSuccessToast(
        !snapshot.isFavorite ? 'Added to favorites' : 'Removed from favorites'
      );
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      showErrorToast('Failed to update snapshot');
    }
  },

  // Mark snapshot as used (update usedAt timestamp)
  markAsUsed: (id) => {
    try {
      const now = new Date().toISOString();
      snapshotStorage.update(id, { usedAt: now });
      set((state) => ({
        snapshots: state.snapshots.map((s) =>
          s.id === id ? { ...s, usedAt: now } : s
        ),
      }));
    } catch (error) {
      console.error('Failed to mark snapshot as used:', error);
    }
  },

  // UI Actions
  openPanel: () => {
    get().loadSnapshots();
    set({ isPanelOpen: true });
  },

  closePanel: () => set({ isPanelOpen: false }),

  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilter: (filter) => set({ currentFilter: filter }),

  setFilterTags: (tags) => set({ filterTags: tags }),

  setSelectedSnapshotId: (id) => set({ selectedSnapshotId: id }),

  clearError: () => set({ error: null }),

  // Computed getter for filtered snapshots
  getFilteredSnapshots: () => {
    const { snapshots, currentFilter, searchQuery, filterTags } = get();

    let filtered = [...snapshots];

    // Apply filter
    if (currentFilter === 'favorites') {
      filtered = filtered.filter((s) => s.isFavorite);
    } else if (currentFilter === 'recent') {
      filtered = filtered.sort(
        (a, b) =>
          new Date(b.usedAt || b.createdAt).getTime() -
          new Date(a.usedAt || a.createdAt).getTime()
      );
      filtered = filtered.slice(0, 20);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply tag filter
    if (filterTags.length > 0) {
      filtered = filtered.filter((s) =>
        filterTags.every((tag) => s.tags.includes(tag))
      );
    }

    return filtered;
  },

  // Get all unique tags from snapshots
  getAllTags: () => {
    const { snapshots } = get();
    const tagsSet = new Set<string>();

    snapshots.forEach((snapshot) => {
      snapshot.tags.forEach((tag) => tagsSet.add(tag));
    });

    return Array.from(tagsSet).sort();
  },
}));
