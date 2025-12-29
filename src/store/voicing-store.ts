/**
 * Voicing Store
 *
 * Manages state for voicing mode (simple vs voice-led)
 */

import { create } from 'zustand';
import type { VoicingMode } from '@/types/voicing';

interface VoicingState {
  mode: VoicingMode;
  setMode: (mode: VoicingMode) => void;
}

export const useVoicingStore = create<VoicingState>((set) => ({
  mode: 'simple',
  setMode: (mode: VoicingMode) => set({ mode }),
}));
