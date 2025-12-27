import { useState, useCallback, useRef } from 'react';
import { Chord } from '@/types';

const MAX_HISTORY_SIZE = 50;

interface UseHistoryReturn {
  pushState: (chords: Chord[]) => void;
  undo: () => Chord[] | null;
  redo: () => Chord[] | null;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
}

export function useHistory(): UseHistoryReturn {
  const [history, setHistory] = useState<Chord[][]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  // Use a ref to avoid closure issues with currentIndex
  const currentIndexRef = useRef<number>(-1);

  const pushState = useCallback((chords: Chord[]) => {
    setHistory((prevHistory) => {
      // Use ref value to get the actual current index
      const idx = currentIndexRef.current;

      // When pushing a new state while not at the end, clear the "future" states
      const newHistory = prevHistory.slice(0, idx + 1);

      // Add the new state
      newHistory.push([...chords]);

      // Limit history to MAX_HISTORY_SIZE entries
      let newIndex = newHistory.length - 1;
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
        newIndex = newHistory.length - 1;
      }

      // Update both ref and state
      currentIndexRef.current = newIndex;
      setCurrentIndex(newIndex);

      return newHistory;
    });
  }, []);

  const undo = useCallback((): Chord[] | null => {
    const idx = currentIndexRef.current;
    if (idx <= 0) {
      return null;
    }

    const newIndex = idx - 1;
    currentIndexRef.current = newIndex;
    setCurrentIndex(newIndex);
    return [...history[newIndex]];
  }, [history]);

  const redo = useCallback((): Chord[] | null => {
    const idx = currentIndexRef.current;
    if (idx >= history.length - 1) {
      return null;
    }

    const newIndex = idx + 1;
    currentIndexRef.current = newIndex;
    setCurrentIndex(newIndex);
    return [...history[newIndex]];
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    currentIndexRef.current = -1;
  }, []);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
  };
}
