import { create } from 'zustand';
import type { SoundType } from '@/types';

interface AudioState {
  soundType: SoundType;
  setSoundType: (type: SoundType) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  soundType: 'chime',
  setSoundType: (type: SoundType) => set({ soundType: type }),
}));
