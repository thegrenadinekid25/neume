import { useEffect } from 'react';
import { useShortcutsStore } from '../store/shortcuts-store';

interface KeyboardShortcutsConfig {
  onDelete?: () => void;
  onSelectAll?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDuplicate?: () => void;
  onToggleConnectionLines?: () => void;
  onClearSelection?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onNew?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  const openGuide = useShortcutsStore(state => state.openGuide);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // ? - Show shortcuts guide
      if (e.key === '?' && !cmdOrCtrl) {
        e.preventDefault();
        openGuide();
        return;
      }

      // Delete/Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        config.onDelete?.();
      }

      // Cmd/Ctrl + A (Select All)
      if (cmdOrCtrl && e.key === 'a') {
        e.preventDefault();
        config.onSelectAll?.();
      }

      // Cmd/Ctrl + Z (Undo)
      if (cmdOrCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        config.onUndo?.();
      }

      // Cmd/Ctrl + Shift + Z (Redo)
      if (cmdOrCtrl && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        config.onRedo?.();
      }

      // Cmd/Ctrl + D (Duplicate)
      if (cmdOrCtrl && e.key === 'd') {
        e.preventDefault();
        config.onDuplicate?.();
      }

      // Cmd/Ctrl + L (Toggle Connection Lines)
      if (cmdOrCtrl && e.key === 'l') {
        e.preventDefault();
        config.onToggleConnectionLines?.();
      }

      // Cmd/Ctrl + S (Save)
      if (cmdOrCtrl && e.key === 's') {
        e.preventDefault();
        config.onSave?.();
      }

      // Cmd/Ctrl + E (Export)
      if (cmdOrCtrl && e.key === 'e') {
        e.preventDefault();
        config.onExport?.();
      }

      // Cmd/Ctrl + N (New/Clear)
      if (cmdOrCtrl && e.key === 'n') {
        e.preventDefault();
        config.onNew?.();
      }

      // Cmd/Ctrl + = or + (Zoom In)
      if (cmdOrCtrl && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        config.onZoomIn?.();
      }

      // Cmd/Ctrl + - (Zoom Out)
      if (cmdOrCtrl && e.key === '-') {
        e.preventDefault();
        config.onZoomOut?.();
      }

      // Cmd/Ctrl + 0 (Reset Zoom)
      if (cmdOrCtrl && e.key === '0') {
        e.preventDefault();
        config.onResetZoom?.();
      }

      // Escape (Clear Selection)
      if (e.key === 'Escape') {
        config.onClearSelection?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [config, openGuide]);
}
