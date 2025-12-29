import { create } from 'zustand';
import type { VoicePart } from '@/types';
import type { VoiceChordConflictResult } from '@/services/voice-chord-conflict-detector';

/**
 * Pending conflict that requires user resolution
 */
export interface PendingConflict {
  result: VoiceChordConflictResult;
  noteId: string;
  voicePart: VoicePart;
  originalMidi: number;
  newMidi: number;
}

/**
 * Voice-chord conflict store state
 * Manages dialog visibility and pending conflict resolution
 */
interface VoiceChordConflictState {
  // Dialog state
  isDialogOpen: boolean;

  // Pending conflict awaiting resolution
  pendingConflict: PendingConflict | null;

  // Actions
  showConflictDialog: (conflict: PendingConflict) => void;
  hideConflictDialog: () => void;

  // Resolution actions
  resolveWithChordChange: (newChordKey?: string) => void;
  resolveKeepAsTension: () => void;
  resolveCancel: () => void;

  // Callbacks for resolution handling
  onChordChangeConfirm?: (newChordKey: string) => void;
  onKeepAsTensionConfirm?: () => void;
  onCancelConfirm?: () => void;

  // Set callbacks
  setCallbacks: (callbacks: {
    onChordChangeConfirm?: (newChordKey: string) => void;
    onKeepAsTensionConfirm?: () => void;
    onCancelConfirm?: () => void;
  }) => void;
}

export const useVoiceChordConflictStore = create<VoiceChordConflictState>((set, get) => ({
  isDialogOpen: false,
  pendingConflict: null,

  showConflictDialog: (conflict: PendingConflict) => {
    set({
      isDialogOpen: true,
      pendingConflict: conflict,
    });
  },

  hideConflictDialog: () => {
    set({
      isDialogOpen: false,
      pendingConflict: null,
    });
  },

  resolveWithChordChange: (newChordKey?: string) => {
    const { pendingConflict, onChordChangeConfirm } = get();

    if (pendingConflict && newChordKey && onChordChangeConfirm) {
      onChordChangeConfirm(newChordKey);
    }

    set({
      isDialogOpen: false,
      pendingConflict: null,
    });
  },

  resolveKeepAsTension: () => {
    const { onKeepAsTensionConfirm } = get();

    if (onKeepAsTensionConfirm) {
      onKeepAsTensionConfirm();
    }

    set({
      isDialogOpen: false,
      pendingConflict: null,
    });
  },

  resolveCancel: () => {
    const { onCancelConfirm } = get();

    if (onCancelConfirm) {
      onCancelConfirm();
    }

    set({
      isDialogOpen: false,
      pendingConflict: null,
    });
  },

  setCallbacks: (callbacks) => {
    set({
      onChordChangeConfirm: callbacks.onChordChangeConfirm,
      onKeepAsTensionConfirm: callbacks.onKeepAsTensionConfirm,
      onCancelConfirm: callbacks.onCancelConfirm,
    });
  },
}));

/**
 * Convenience function to show conflict dialog with callbacks
 */
export function showVoiceChordConflict(
  conflict: PendingConflict,
  callbacks: {
    onChordChangeConfirm?: (newChordKey: string) => void;
    onKeepAsTensionConfirm?: () => void;
    onCancelConfirm?: () => void;
  }
) {
  const store = useVoiceChordConflictStore.getState();
  store.setCallbacks(callbacks);
  store.showConflictDialog(conflict);
}
