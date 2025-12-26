import { create } from 'zustand';
import { Chord } from '@types';
import { Command, DeleteChordsCommand, DuplicateChordsCommand } from '@/types/commands';

interface CanvasState {
  // Data
  chords: Chord[];
  selectedChordIds: string[];
  showConnectionLines: boolean;

  // Undo/Redo stacks
  undoStack: Command[];
  redoStack: Command[];

  // Actions (direct - used internally by commands)
  addChordDirect: (chord: Chord) => void;
  removeChordDirect: (id: string) => void;
  updateChordPositionDirect: (id: string, position: { x: number; y: number }, beat: number) => void;
  deleteChordsDirectinternal: (ids: string[]) => void;

  // Actions (user-facing - create commands)
  addChord: (chord: Chord) => void;
  removeChord: (id: string) => void;
  updateChordPosition: (id: string, position: { x: number; y: number }, beat: number) => void;
  updateChord: (id: string, updates: Partial<Chord>) => void;
  clearChords: () => void;
  setChords: (chords: Chord[]) => void;

  // Selection
  selectChord: (id: string) => void;
  deselectChord: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  selectChords: (ids: string[]) => void;
  selectRange: (fromId: string, toId: string) => void;
  toggleChordSelection: (id: string) => void;

  // View settings
  toggleConnectionLines: () => void;

  // Delete & duplicate
  deleteSelected: () => void;
  duplicateSelected: () => void;

  // Undo/redo
  executeCommand: (command: Command) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  chords: [],
  selectedChordIds: [],
  showConnectionLines: true,
  undoStack: [],
  redoStack: [],

  // Direct actions (used by commands, don't add to undo stack)
  addChordDirect: (chord) => set((state) => ({
    chords: [...state.chords, chord]
  })),

  removeChordDirect: (id) => set((state) => ({
    chords: state.chords.filter(c => c.id !== id),
    selectedChordIds: state.selectedChordIds.filter(sid => sid !== id)
  })),

  updateChordPositionDirect: (id, position, beat) => set((state) => ({
    chords: state.chords.map(chord =>
      chord.id === id
        ? { ...chord, position, startBeat: beat }
        : chord
    )
  })),

  deleteChordsDirectinternal: (ids) => set((state) => ({
    chords: state.chords.filter(c => !ids.includes(c.id)),
    selectedChordIds: state.selectedChordIds.filter(sid => !ids.includes(sid))
  })),

  // User-facing actions (for backward compatibility, don't create commands here)
  addChord: (chord) => set((state) => ({
    chords: [...state.chords, chord]
  })),

  removeChord: (id) => set((state) => ({
    chords: state.chords.filter(c => c.id !== id),
    selectedChordIds: state.selectedChordIds.filter(sid => sid !== id)
  })),

  updateChordPosition: (id, position, beat) => set((state) => ({
    chords: state.chords.map(chord =>
      chord.id === id
        ? { ...chord, position, startBeat: beat }
        : chord
    )
  })),

  updateChord: (id, updates) => set((state) => ({
    chords: state.chords.map(chord =>
      chord.id === id
        ? { ...chord, ...updates }
        : chord
    )
  })),

  clearChords: () => set({ chords: [], selectedChordIds: [] }),

  setChords: (chords) => set({ chords }),

  // Selection actions
  selectChord: (id) => set((state) => ({
    selectedChordIds: [...state.selectedChordIds, id],
    chords: state.chords.map(chord =>
      chord.id === id ? { ...chord, selected: true } : chord
    )
  })),

  deselectChord: (id) => set((state) => ({
    selectedChordIds: state.selectedChordIds.filter(sid => sid !== id),
    chords: state.chords.map(chord =>
      chord.id === id ? { ...chord, selected: false } : chord
    )
  })),

  clearSelection: () => set((state) => ({
    selectedChordIds: [],
    chords: state.chords.map(chord => ({ ...chord, selected: false }))
  })),

  selectAll: () => set((state) => ({
    selectedChordIds: state.chords.map(c => c.id),
    chords: state.chords.map(chord => ({ ...chord, selected: true }))
  })),

  selectChords: (ids: string[]) => set((state) => ({
    selectedChordIds: ids,
    chords: state.chords.map(chord => ({
      ...chord,
      selected: ids.includes(chord.id)
    }))
  })),

  selectRange: (fromId: string, toId: string) => set((state) => {
    const chordsSorted = [...state.chords].sort((a, b) => a.startBeat - b.startBeat);
    const fromIndex = chordsSorted.findIndex(c => c.id === fromId);
    const toIndex = chordsSorted.findIndex(c => c.id === toId);

    if (fromIndex === -1 || toIndex === -1) return state;

    const [start, end] = fromIndex < toIndex
      ? [fromIndex, toIndex]
      : [toIndex, fromIndex];

    const rangeIds = chordsSorted.slice(start, end + 1).map(c => c.id);

    return {
      selectedChordIds: rangeIds,
      chords: state.chords.map(chord => ({
        ...chord,
        selected: rangeIds.includes(chord.id)
      }))
    };
  }),

  toggleChordSelection: (id: string) => set((state) => ({
    selectedChordIds: state.selectedChordIds.includes(id)
      ? state.selectedChordIds.filter(selectedId => selectedId !== id)
      : [...state.selectedChordIds, id],
    chords: state.chords.map(chord =>
      chord.id === id ? { ...chord, selected: !chord.selected } : chord
    )
  })),

  // View settings
  toggleConnectionLines: () => set((state) => ({
    showConnectionLines: !state.showConnectionLines
  })),

  // Delete & duplicate (using command pattern)
  deleteSelected: () => {
    const { selectedChordIds, executeCommand } = get();
    if (selectedChordIds.length > 0) {
      const command = new DeleteChordsCommand(selectedChordIds, useCanvasStore);
      executeCommand(command);
    }
  },

  duplicateSelected: () => {
    const { selectedChordIds, executeCommand } = get();
    if (selectedChordIds.length > 0) {
      const command = new DuplicateChordsCommand(selectedChordIds, useCanvasStore);
      executeCommand(command);
    }
  },

  // Command pattern for undo/redo
  executeCommand: (command) => {
    // Execute the command
    command.execute();

    // Add to undo stack
    set((state) => ({
      undoStack: [...state.undoStack, command].slice(-50), // Keep last 50
      redoStack: [], // Clear redo stack on new action
    }));
  },

  undo: () => {
    const { undoStack, redoStack } = get();

    if (undoStack.length === 0) return;

    // Pop from undo stack
    const command = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    // Undo the command
    command.undo();

    // Push to redo stack
    set({
      undoStack: newUndoStack,
      redoStack: [...redoStack, command],
    });
  },

  redo: () => {
    const { redoStack, undoStack } = get();

    if (redoStack.length === 0) return;

    // Pop from redo stack
    const command = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    // Re-execute the command
    command.execute();

    // Push to undo stack
    set({
      redoStack: newRedoStack,
      undoStack: [...undoStack, command],
    });
  },

  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,

  clearHistory: () => set({
    undoStack: [],
    redoStack: [],
  }),
}));
