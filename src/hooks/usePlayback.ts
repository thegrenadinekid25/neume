import { useState, useEffect, useCallback } from 'react';
import { playbackSystem } from '@/audio/PlaybackSystem';
import { useAudioEngine } from './useAudioEngine';
import type { Chord } from '@/types';

export interface UsePlaybackReturn {
  isPlaying: boolean;
  playheadPosition: number;
  currentChordId: string | null;
  play: () => void;
  pause: () => void;
  stop: () => void;
  togglePlay: () => void;
  setTempo: (bpm: number) => void;
  tempo: number;
}

/**
 * React hook for playback control
 * Accepts chords as parameter instead of reading from store
 */
export function usePlayback(chords: Chord[], totalBeats: number = 16): UsePlaybackReturn {
  const { isReady: audioReady, initialize } = useAudioEngine();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [currentChordId, setCurrentChordId] = useState<string | null>(null);
  const [tempo, setTempoState] = useState(120);

  // Set up playback callbacks
  useEffect(() => {
    playbackSystem.setPlayheadCallback((beat: number) => {
      setPlayheadPosition(beat);
    });

    playbackSystem.setChordTriggerCallback((chordId: string) => {
      setCurrentChordId(chordId);
      // Clear after a short delay for visual feedback
      setTimeout(() => {
        setCurrentChordId(null);
      }, 200);
    });

    // Handle playback end - sync state when playhead reaches end
    playbackSystem.setPlaybackEndCallback(() => {
      setIsPlaying(false);
      setPlayheadPosition(0);
      setCurrentChordId(null);
    });

    return () => {
      playbackSystem.dispose();
    };
  }, []);

  // Update total beats when it changes
  useEffect(() => {
    playbackSystem.setTotalBeats(totalBeats);
  }, [totalBeats]);

  // Schedule progression when chords change
  useEffect(() => {
    if (chords.length > 0) {
      playbackSystem.scheduleProgression(chords);
    }
  }, [chords]);

  const play = useCallback(async () => {
    if (!audioReady) {
      // Initialize audio on first play attempt
      await initialize();
    }
    playbackSystem.play();
    setIsPlaying(true);
  }, [audioReady, initialize]);

  const pause = useCallback(() => {
    playbackSystem.pause();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    playbackSystem.stop();
    setIsPlaying(false);
    setPlayheadPosition(0);
    setCurrentChordId(null);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stop(); // Use stop() instead of pause() for cleaner behavior
    } else {
      // Re-schedule events before playing to ensure fresh state
      if (chords.length > 0) {
        playbackSystem.scheduleProgression(chords);
      }
      play();
    }
  }, [isPlaying, play, stop, chords]);

  const setTempo = useCallback((bpm: number) => {
    playbackSystem.setTempo(bpm);
    setTempoState(bpm);
  }, []);

  return {
    isPlaying,
    playheadPosition,
    currentChordId,
    play,
    pause,
    stop,
    togglePlay,
    setTempo,
    tempo,
  };
}
