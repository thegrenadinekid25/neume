import { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import { audioEngine } from '@/audio/AudioEngine';

export interface UseAudioEngineReturn {
  isReady: boolean;
  isSamplesLoaded: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  playChord: (notes: string[], duration?: number) => void;
  playNote: (note: string, duration?: number) => void;
  stopAll: () => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
}

// Subscribers for audio ready state changes
const listeners = new Set<() => void>();
let cachedIsReady = audioEngine.getIsInitialized();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return cachedIsReady;
}

function notifyListeners() {
  cachedIsReady = audioEngine.getIsInitialized();
  listeners.forEach(listener => listener());
}

// Subscribers for samples loaded state changes
const samplesLoadedListeners = new Set<() => void>();
let cachedIsSamplesLoaded = audioEngine.getIsSamplesLoaded();

function subscribeSamplesLoaded(callback: () => void) {
  samplesLoadedListeners.add(callback);
  return () => samplesLoadedListeners.delete(callback);
}

function getSamplesLoadedSnapshot() {
  return cachedIsSamplesLoaded;
}

function notifySamplesLoadedListeners() {
  cachedIsSamplesLoaded = audioEngine.getIsSamplesLoaded();
  samplesLoadedListeners.forEach(listener => listener());
}

/**
 * React hook for managing audio engine lifecycle
 * Provides audio playback controls with error handling
 * Uses useSyncExternalStore to share state across all hook instances
 */
export function useAudioEngine(): UseAudioEngineReturn {
  const isReady = useSyncExternalStore(subscribe, getSnapshot);
  const isSamplesLoaded = useSyncExternalStore(subscribeSamplesLoaded, getSamplesLoadedSnapshot);
  const [error, setError] = useState<string | null>(null);

  // Initialize audio engine on first call (user interaction)
  const initialize = useCallback(async () => {
    try {
      setError(null);
      await audioEngine.initialize();
      notifyListeners(); // Notify all components that audio is ready
      notifySamplesLoadedListeners(); // Notify all components that samples are loaded
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize audio';
      setError(errorMessage);
      console.error('Audio initialization error:', err);
    }
  }, []);

  // Auto-initialize on first user interaction (respects browser autoplay policy)
  useEffect(() => {
    if (isReady) return; // Already initialized

    const handleFirstInteraction = async () => {
      if (!audioEngine.getIsInitialized()) {
        try {
          await audioEngine.initialize();
          notifyListeners();
          notifySamplesLoadedListeners(); // Notify that samples are loaded
        } catch (err) {
          console.error('Auto-init failed:', err);
        }
      }
      // Remove all listeners after first interaction
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    // Listen for any user interaction
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [isReady]);

  // Play a chord
  const playChord = useCallback((notes: string[], duration: number = 2) => {
    if (!isReady) {
      console.warn('Audio engine not ready');
      return;
    }
    audioEngine.playChord(notes, duration);
  }, [isReady]);

  // Play a single note
  const playNote = useCallback((note: string, duration: number = 1) => {
    if (!isReady) {
      console.warn('Audio engine not ready');
      return;
    }
    audioEngine.playNote(note, duration);
  }, [isReady]);

  // Stop all notes
  const stopAll = useCallback(() => {
    audioEngine.stopAll();
  }, []);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    audioEngine.setMasterVolume(volume);
  }, []);

  // Get current volume
  const getVolume = useCallback(() => {
    return audioEngine.getMasterVolume();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't dispose on unmount - audioEngine is a singleton
      // that should persist across component remounts
    };
  }, []);

  return {
    isReady,
    isSamplesLoaded,
    error,
    initialize,
    playChord,
    playNote,
    stopAll,
    setVolume,
    getVolume,
  };
}
