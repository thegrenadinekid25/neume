/**
 * Zustand store for voice editing mode state
 */

import { create } from 'zustand';
import type { Voices } from '@/types/chord';
import type { VoiceLeadingIssue, VoiceType } from '@/services/voice-leading-analyzer';

interface VoiceEditingState {
  // Mode state
  isVoiceEditingMode: boolean;
  activeChordId: string | null;
  activeVoice: VoiceType | null;

  // Drag state
  isDragging: boolean;
  dragStartMidi: number | null;
  currentDragMidi: number | null;

  // Pending changes before commit
  pendingVoices: Voices | null;

  // Voice-leading analysis
  voiceLeadingIssues: VoiceLeadingIssue[];

  // Actions
  enterVoiceEditingMode: (chordId: string, currentVoices: Voices) => void;
  exitVoiceEditingMode: () => void;
  setActiveVoice: (voice: VoiceType | null) => void;
  startVoiceDrag: (voice: VoiceType, midi: number) => void;
  updateVoiceDrag: (midi: number, newNote: string) => void;
  commitVoiceChange: () => Voices | null;
  cancelVoiceChange: () => void;
  setVoiceLeadingIssues: (issues: VoiceLeadingIssue[]) => void;
  updatePendingVoice: (voice: VoiceType, note: string) => void;
}

export const useVoiceEditingStore = create<VoiceEditingState>((set, get) => ({
  // Initial state
  isVoiceEditingMode: false,
  activeChordId: null,
  activeVoice: null,
  isDragging: false,
  dragStartMidi: null,
  currentDragMidi: null,
  pendingVoices: null,
  voiceLeadingIssues: [],

  // Mode actions
  enterVoiceEditingMode: (chordId, currentVoices) =>
    set({
      isVoiceEditingMode: true,
      activeChordId: chordId,
      activeVoice: null,
      pendingVoices: { ...currentVoices },
      voiceLeadingIssues: [],
    }),

  exitVoiceEditingMode: () =>
    set({
      isVoiceEditingMode: false,
      activeChordId: null,
      activeVoice: null,
      isDragging: false,
      dragStartMidi: null,
      currentDragMidi: null,
      pendingVoices: null,
      voiceLeadingIssues: [],
    }),

  // Voice selection
  setActiveVoice: (voice) =>
    set({ activeVoice: voice }),

  // Drag actions
  startVoiceDrag: (voice, midi) =>
    set({
      activeVoice: voice,
      isDragging: true,
      dragStartMidi: midi,
      currentDragMidi: midi,
    }),

  updateVoiceDrag: (midi, newNote) => {
    const { activeVoice, pendingVoices } = get();
    if (!activeVoice || !pendingVoices) return;

    set({
      currentDragMidi: midi,
      pendingVoices: {
        ...pendingVoices,
        [activeVoice]: newNote,
      },
    });
  },

  commitVoiceChange: () => {
    const { pendingVoices } = get();
    const result = pendingVoices ? { ...pendingVoices } : null;

    set({
      isDragging: false,
      dragStartMidi: null,
      currentDragMidi: null,
    });

    return result;
  },

  cancelVoiceChange: () =>
    set({
      isDragging: false,
      dragStartMidi: null,
      currentDragMidi: null,
      activeVoice: null,
    }),

  // Voice-leading analysis
  setVoiceLeadingIssues: (issues) =>
    set({ voiceLeadingIssues: issues }),

  // Pending voice updates
  updatePendingVoice: (voice, note) => {
    const { pendingVoices } = get();
    if (!pendingVoices) return;

    set({
      pendingVoices: {
        ...pendingVoices,
        [voice]: note,
      },
    });
  },
}));
