import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { ChordAnnotationType, ChordAnnotation, ProgressionAnnotationType, ProgressionAnnotation } from '@/types';

interface AnnotationsState {
  // Chord annotations keyed by chordId
  chordAnnotations: Record<string, ChordAnnotation[]>;

  // Progression-level annotations
  progressionAnnotations: ProgressionAnnotation[];

  // Visibility toggle
  showAnnotations: boolean;

  // Chord annotation actions
  addChordAnnotation: (chordId: string, text: string, type: ChordAnnotationType) => ChordAnnotation;
  updateChordAnnotation: (annotationId: string, updates: Partial<Pick<ChordAnnotation, 'text' | 'type'>>) => void;
  removeChordAnnotation: (chordId: string, annotationId: string) => void;
  getChordAnnotations: (chordId: string) => ChordAnnotation[];
  removeAllChordAnnotations: (chordId: string) => void;

  // Progression annotation actions
  addProgressionAnnotation: (text: string, type: ProgressionAnnotationType, position?: number) => ProgressionAnnotation;
  updateProgressionAnnotation: (annotationId: string, updates: Partial<Pick<ProgressionAnnotation, 'text' | 'type' | 'position'>>) => void;
  removeProgressionAnnotation: (annotationId: string) => void;

  // Visibility
  toggleAnnotationsVisibility: () => void;
  setAnnotationsVisibility: (visible: boolean) => void;

  // Bulk operations
  clearAllAnnotations: () => void;
  loadAnnotations: (chordAnnotations: Record<string, ChordAnnotation[]>, progressionAnnotations: ProgressionAnnotation[]) => void;

  // Migration helper for old format (chordId -> note string)
  migrateFromOldFormat: (oldAnnotations: Record<string, string>) => void;
}

export const useAnnotationsStore = create<AnnotationsState>((set, get) => ({
  chordAnnotations: {},
  progressionAnnotations: [],
  showAnnotations: true,

  // Chord annotation actions
  addChordAnnotation: (chordId, text, type) => {
    const newAnnotation: ChordAnnotation = {
      id: uuidv4(),
      chordId,
      text,
      type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      chordAnnotations: {
        ...state.chordAnnotations,
        [chordId]: [...(state.chordAnnotations[chordId] || []), newAnnotation],
      },
    }));

    return newAnnotation;
  },

  updateChordAnnotation: (annotationId, updates) => {
    set((state) => {
      const newChordAnnotations = { ...state.chordAnnotations };

      // Find and update the annotation
      for (const chordId in newChordAnnotations) {
        const index = newChordAnnotations[chordId].findIndex((a) => a.id === annotationId);
        if (index !== -1) {
          newChordAnnotations[chordId][index] = {
            ...newChordAnnotations[chordId][index],
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          break;
        }
      }

      return { chordAnnotations: newChordAnnotations };
    });
  },

  removeChordAnnotation: (chordId, annotationId) => {
    set((state) => {
      const newChordAnnotations = { ...state.chordAnnotations };

      if (newChordAnnotations[chordId]) {
        newChordAnnotations[chordId] = newChordAnnotations[chordId].filter(
          (a) => a.id !== annotationId
        );

        // Remove the chord entry if it has no annotations
        if (newChordAnnotations[chordId].length === 0) {
          delete newChordAnnotations[chordId];
        }
      }

      return { chordAnnotations: newChordAnnotations };
    });
  },

  getChordAnnotations: (chordId) => {
    return get().chordAnnotations[chordId] || [];
  },

  removeAllChordAnnotations: (chordId) => {
    set((state) => {
      const newChordAnnotations = { ...state.chordAnnotations };
      delete newChordAnnotations[chordId];
      return { chordAnnotations: newChordAnnotations };
    });
  },

  // Progression annotation actions
  addProgressionAnnotation: (text, type, position) => {
    const newAnnotation: ProgressionAnnotation = {
      id: uuidv4(),
      text,
      type,
      position,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      progressionAnnotations: [...state.progressionAnnotations, newAnnotation],
    }));

    return newAnnotation;
  },

  updateProgressionAnnotation: (annotationId, updates) => {
    set((state) => ({
      progressionAnnotations: state.progressionAnnotations.map((a) =>
        a.id === annotationId
          ? {
              ...a,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : a
      ),
    }));
  },

  removeProgressionAnnotation: (annotationId) => {
    set((state) => ({
      progressionAnnotations: state.progressionAnnotations.filter(
        (a) => a.id !== annotationId
      ),
    }));
  },

  // Visibility actions
  toggleAnnotationsVisibility: () => {
    set((state) => ({
      showAnnotations: !state.showAnnotations,
    }));
  },

  setAnnotationsVisibility: (visible) => {
    set({ showAnnotations: visible });
  },

  // Bulk operations
  clearAllAnnotations: () => {
    set({
      chordAnnotations: {},
      progressionAnnotations: [],
    });
  },

  loadAnnotations: (chordAnnotations, progressionAnnotations) => {
    set({
      chordAnnotations,
      progressionAnnotations,
    });
  },

  // Migration helper for old format
  migrateFromOldFormat: (oldAnnotations) => {
    const newChordAnnotations: Record<string, ChordAnnotation[]> = {};

    for (const chordId in oldAnnotations) {
      const text = oldAnnotations[chordId];
      if (text && text.trim()) {
        newChordAnnotations[chordId] = [
          {
            id: uuidv4(),
            chordId,
            text,
            type: 'note',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
      }
    }

    set({
      chordAnnotations: newChordAnnotations,
    });
  },
}));
