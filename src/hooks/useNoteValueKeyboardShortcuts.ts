import { useEffect } from 'react';
import type { NoteValue } from '@/types/voice-line';
import { useVoiceLineStore } from '@/store/voice-line-store';

/**
 * Hook for handling keyboard shortcuts for note values
 *
 * Shortcuts:
 * - '1': Whole note
 * - '2': Half note
 * - '3': Quarter note (default)
 * - '4': Eighth note
 * - '5': Sixteenth note
 * - '6': Thirty-second note
 */
export const useNoteValueKeyboardShortcuts = () => {
  const setSelectedNoteValue = useVoiceLineStore((state) => state.setSelectedNoteValue);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Map of number keys to note values
      const noteValueMap: Record<string, NoteValue> = {
        '1': 'whole',
        '2': 'half',
        '3': 'quarter',
        '4': 'eighth',
        '5': 'sixteenth',
        '6': 'thirtysecond',
      };

      // Check for note value shortcuts (1-6)
      if (e.key in noteValueMap) {
        e.preventDefault();
        setSelectedNoteValue(noteValueMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedNoteValue]);
};
