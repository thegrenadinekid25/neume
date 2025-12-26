import { useEffect, useState } from 'react';
import { audioEngine } from '@/audio/AudioEngine';

export function useAudioEngine() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initialize = async () => {
    try {
      await audioEngine.initialize();
      setIsReady(true);
    } catch (err) {
      setError(err as Error);
      console.error('Audio engine initialization failed:', err);
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      audioEngine.dispose();
    };
  }, []);

  return {
    isReady,
    error,
    initialize,
    playChord: audioEngine.playChord.bind(audioEngine),
    playNote: audioEngine.playNote.bind(audioEngine),
    stopAll: audioEngine.stopAll.bind(audioEngine),
    setMasterVolume: audioEngine.setMasterVolume.bind(audioEngine),
    getMasterVolume: audioEngine.getMasterVolume.bind(audioEngine),
  };
}
