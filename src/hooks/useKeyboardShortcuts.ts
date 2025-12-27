import { useEffect, useCallback } from 'react';
import { useAnalysisStore } from '@/store/analysis-store';

interface UseKeyboardShortcutsProps {
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDeleteSelected?: () => void;
  onDuplicateSelected?: () => void;
  onTogglePlay?: () => void;
  onStop?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onMoveSelected?: (direction: 'left' | 'right', amount: number) => void;
  onTempoChange?: (delta: number) => void;
  onShowHelp?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
  onDuplicateSelected,
  onTogglePlay,
  onStop,
  onUndo,
  onRedo,
  onMoveSelected,
  onTempoChange,
  onShowHelp,
  enabled = true,
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Don't handle shortcuts when typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Don't handle Space when a button has focus (prevents opening modals)
    if (e.key === ' ' && e.target instanceof HTMLButtonElement) {
      return;
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    // Cmd/Ctrl + A: Select All
    if (modifier && e.key === 'a') {
      e.preventDefault();
      onSelectAll();
      return;
    }

    // Cmd/Ctrl + D: Duplicate
    if (modifier && e.key === 'd' && onDuplicateSelected) {
      e.preventDefault();
      onDuplicateSelected();
      return;
    }

    // Escape: Clear Selection
    if (e.key === 'Escape') {
      e.preventDefault();
      onClearSelection();
      return;
    }

    // Delete or Backspace: Delete selected
    if ((e.key === 'Delete' || e.key === 'Backspace') && onDeleteSelected && !modifier) {
      e.preventDefault();
      onDeleteSelected();
      return;
    }

    // Shift + Space: Stop
    if (e.key === ' ' && e.shiftKey && onStop) {
      e.preventDefault();
      onStop();
      return;
    }

    // Space: Play/Pause
    if (e.key === ' ' && !e.shiftKey && onTogglePlay) {
      e.preventDefault();
      onTogglePlay();
      return;
    }

    // Cmd/Ctrl + Shift + Z: Redo
    if (modifier && e.shiftKey && e.key === 'z' && onRedo) {
      e.preventDefault();
      onRedo();
      return;
    }

    // Cmd/Ctrl + Shift + A: Open Analyze modal
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      useAnalysisStore.getState().openModal();
      return;
    }

    // Cmd/Ctrl + Z: Undo (without Shift)
    if (modifier && !e.shiftKey && e.key === 'z' && onUndo) {
      e.preventDefault();
      onUndo();
      return;
    }

    // Arrow Left/Right: Move selected chords
    if (onMoveSelected && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      const amount = e.shiftKey ? 1 : 0.25; // 1 beat or quarter beat
      const direction = e.key === 'ArrowLeft' ? 'left' : 'right';
      onMoveSelected(direction, amount);
      return;
    }

    // Arrow Up/Down: Adjust tempo
    if (onTempoChange && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      const delta = e.shiftKey ? 10 : 1; // ±10 BPM with shift, ±1 otherwise
      onTempoChange(e.key === 'ArrowUp' ? delta : -delta);
      return;
    }

    // ?: Show keyboard shortcuts guide (Shift+/)
    if ((e.key === '?' || (e.key === '/' && e.shiftKey)) && onShowHelp) {
      e.preventDefault();
      onShowHelp();
      return;
    }
  }, [enabled, onSelectAll, onClearSelection, onDeleteSelected, onDuplicateSelected, onTogglePlay, onStop, onUndo, onRedo, onMoveSelected, onTempoChange, onShowHelp]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
