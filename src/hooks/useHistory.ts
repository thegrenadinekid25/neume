import { useState, useCallback } from 'react';
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

  const pushState = useCallback((chords: Chord[]) => {
    setHistory((prevHistory) => {
      // When pushing a new state while not at the end, clear the "future" states
      const newHistory = prevHistory.slice(0, currentIndex + 1);

      // Add the new state
      newHistory.push([...chords]);

      // Limit history to MAX_HISTORY_SIZE entries
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
        // Don't need to adjust currentIndex here since we'll set it below
        setCurrentIndex(newHistory.length - 1);
      } else {
        setCurrentIndex(newHistory.length - 1);
      }

      return newHistory;
    });
  }, [currentIndex]);

  const undo = useCallback((): Chord[] | null => {
    if (currentIndex <= 0) {
      return null;
    }

    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    return [...history[newIndex]];
  }, [currentIndex, history]);

  const redo = useCallback((): Chord[] | null => {
    if (currentIndex >= history.length - 1) {
      return null;
    }

    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    return [...history[newIndex]];
  }, [currentIndex, history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
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
