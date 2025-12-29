import { useCallback, useRef } from 'react';
import type { VoicePart, MelodicNote } from '@/types';
import type { Chord } from '@/types/chord';
import type { TimeSignature } from '@/types/progression';
import {
  detectVoiceChordConflict,
  type DetectConflictInput,
  type VoiceChordConflictResult,
} from '@/services/voice-chord-conflict-detector';
import { showVoiceChordConflict } from '@/store/voice-chord-conflict-store';

/**
 * Hook configuration options
 */
interface UseVoiceChordConflictOptions {
  /** Enable automatic conflict detection (default: true) */
  enabled?: boolean;
  /** Minimum severity level to show dialog ('warning' | 'error', default: 'warning') */
  minSeverity?: 'warning' | 'error';
  /** Callback when note should be updated */
  onNoteUpdate?: (noteId: string, newMidi: number) => void;
  /** Callback when chord should be changed */
  onChordChange?: (newChordKey: string) => void;
  /** Callback when user cancels */
  onCancel?: () => void;
}

/**
 * Track state during a drag operation
 */
interface DragState {
  noteId: string;
  originalMidi: number;
  startX: number;
  startY: number;
}

/**
 * Hook for detecting and handling voice-chord conflicts during note dragging
 * Integrates with the voice-chord conflict store and dialog system
 *
 * @param voicePart - The voice part being edited (soprano, alto, tenor, bass)
 * @param timeSignature - The current time signature (4/4, 3/4, 6/8, 2/2)
 * @param options - Configuration options
 * @returns Object with drag handlers
 *
 * @example
 * ```tsx
 * const { handleDragStart, handleDragEnd } = useVoiceChordConflict(
 *   'soprano',
 *   '4/4',
 *   {
 *     enabled: true,
 *     minSeverity: 'error',
 *     onNoteUpdate: (noteId, newMidi) => updateNote(noteId, newMidi),
 *   }
 * );
 * ```
 */
export function useVoiceChordConflict(
  voicePart: VoicePart,
  timeSignature: TimeSignature,
  options: UseVoiceChordConflictOptions = {}
) {
  const {
    enabled = true,
    minSeverity = 'warning',
    onNoteUpdate,
    onChordChange,
    onCancel,
  } = options;

  const dragStateRef = useRef<DragState | null>(null);
  const lastConflictRef = useRef<VoiceChordConflictResult | null>(null);

  /**
   * Handle start of note drag
   * Records initial position for conflict detection on drag end
   */
  const handleDragStart = useCallback((
    noteId: string,
    note: MelodicNote,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!enabled) return;

    dragStateRef.current = {
      noteId,
      originalMidi: note.midi,
      startX: event.clientX,
      startY: event.clientY,
    };
  }, [enabled]);

  /**
   * Handle end of note drag
   * Detects conflicts with new position and shows dialog if needed
   */
  const handleDragEnd = useCallback((
    note: MelodicNote,
    newMidi: number,
    currentChord: Chord,
    prevNote?: MelodicNote,
    nextNote?: MelodicNote,
    beatPosition?: number
  ) => {
    if (!enabled || !dragStateRef.current) return;

    const dragState = dragStateRef.current;

    // Only check for conflicts if note actually moved
    if (newMidi === dragState.originalMidi) {
      dragStateRef.current = null;
      return;
    }

    // Create updated note with new MIDI
    const updatedNote: MelodicNote = {
      ...note,
      midi: newMidi,
    };

    // Prepare conflict detection input
    const detectionInput: DetectConflictInput = {
      note: updatedNote,
      voicePart,
      currentChord,
      timeSignature,
      beatPosition: beatPosition ?? note.startBeat,
      prevNote,
      nextNote,
    };

    // Run conflict detection
    const result = detectVoiceChordConflict(detectionInput);
    lastConflictRef.current = result;

    // If conflict detected and meets severity threshold, show dialog
    if (result.hasConflict) {
      const shouldShow =
        !result.severity ||
        (minSeverity === 'warning') ||
        (minSeverity === 'error' && result.severity === 'error');

      if (shouldShow) {
        // Show conflict dialog with callbacks
        showVoiceChordConflict(
          {
            result,
            noteId: dragState.noteId,
            voicePart,
            originalMidi: dragState.originalMidi,
            newMidi,
          },
          {
            onChordChangeConfirm: (newChordKey) => {
              // Update the note to the new position
              if (onNoteUpdate) {
                onNoteUpdate(dragState.noteId, newMidi);
              }
              // Notify about chord change
              if (onChordChange) {
                onChordChange(newChordKey);
              }
            },
            onKeepAsTensionConfirm: () => {
              // User wants to keep the note even though it creates tension
              if (onNoteUpdate) {
                onNoteUpdate(dragState.noteId, newMidi);
              }
            },
            onCancelConfirm: () => {
              // Revert to original position
              if (onNoteUpdate) {
                onNoteUpdate(dragState.noteId, dragState.originalMidi);
              }
              if (onCancel) {
                onCancel();
              }
            },
          }
        );
      } else {
        // No dialog needed, just update
        if (onNoteUpdate) {
          onNoteUpdate(dragState.noteId, newMidi);
        }
      }
    } else {
      // No conflict, update the note
      if (onNoteUpdate) {
        onNoteUpdate(dragState.noteId, newMidi);
      }
    }

    dragStateRef.current = null;
  }, [enabled, voicePart, timeSignature, minSeverity, onNoteUpdate, onChordChange, onCancel]);

  return {
    handleDragStart,
    handleDragEnd,
    lastConflict: lastConflictRef.current,
  };
}
