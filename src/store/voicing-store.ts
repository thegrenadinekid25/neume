/**
 * Voicing Store
 *
 * Manages state for voicing settings:
 * - mode: simple vs voice-led
 * - voiceCount: 4 (SATB) vs 8 (SSAATTBB)
 * - style: classical, jazz, or modern shell voicing
 * - preferShellVoicing: whether to use shell voicing for extended chords
 */

import { create } from 'zustand';
import type { VoicingMode, VoicingStyle, VoiceCount } from '@/types/voicing';

interface VoicingState {
  // Basic voicing mode
  mode: VoicingMode;
  setMode: (mode: VoicingMode) => void;

  // Voice count (4 or 8)
  voiceCount: VoiceCount;
  setVoiceCount: (count: VoiceCount) => void;

  // Voicing style for extended chords
  style: VoicingStyle;
  setStyle: (style: VoicingStyle) => void;

  // Whether to use shell voicing for extended chords
  preferShellVoicing: boolean;
  setPreferShellVoicing: (prefer: boolean) => void;
}

export const useVoicingStore = create<VoicingState>((set) => ({
  mode: 'simple',
  setMode: (mode: VoicingMode) => set({ mode }),

  voiceCount: 4,
  setVoiceCount: (voiceCount: VoiceCount) => set({ voiceCount }),

  style: 'classical',
  setStyle: (style: VoicingStyle) => set({ style }),

  preferShellVoicing: true,
  setPreferShellVoicing: (preferShellVoicing: boolean) => set({ preferShellVoicing }),
}));
