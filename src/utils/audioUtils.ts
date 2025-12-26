import * as Tone from 'tone';
import { Chord } from '@types';

/**
 * Validate chord has valid SATB voicing
 */
export function validateVoicing(chord: Chord): boolean {
  const { voices } = chord;

  // Check all voices exist
  if (!voices.soprano || !voices.alto || !voices.tenor || !voices.bass) {
    return false;
  }

  // Check voices are in valid ranges (basic check)
  const voiceNotes = [voices.bass, voices.tenor, voices.alto, voices.soprano];
  return voiceNotes.every(note => /^[A-G][#b]?\d$/.test(note));
}

/**
 * Calculate total progression duration in seconds
 */
export function calculateDuration(chords: Chord[], tempo: number): number {
  if (chords.length === 0) return 0;

  const sortedChords = [...chords].sort((a, b) => a.startBeat - b.startBeat);
  const lastChord = sortedChords[sortedChords.length - 1];
  const totalBeats = lastChord.startBeat + lastChord.duration;

  // Convert beats to seconds at given tempo
  const beatsPerSecond = tempo / 60;
  return totalBeats / beatsPerSecond;
}

/**
 * Normalize volume to prevent clipping
 */
export function normalizeVolume(chordCount: number): number {
  // Reduce volume slightly for dense progressions
  if (chordCount > 10) {
    return 0.6;
  } else if (chordCount > 5) {
    return 0.65;
  } else {
    return 0.7;
  }
}

/**
 * Check if audio context is suspended (browser autoplay policy)
 */
export function isAudioContextSuspended(): boolean {
  const context = Tone.getContext();
  return context.state === 'suspended';
}

/**
 * Resume audio context (call on user interaction)
 */
export async function resumeAudioContext(): Promise<void> {
  const context = Tone.getContext();
  if (context.state === 'suspended') {
    await context.resume();
  }
}

/**
 * Get total duration of progression in beats
 */
export function getTotalBeats(chords: Chord[]): number {
  if (chords.length === 0) return 0;

  const sortedChords = [...chords].sort((a, b) => a.startBeat - b.startBeat);
  const lastChord = sortedChords[sortedChords.length - 1];
  return lastChord.startBeat + lastChord.duration;
}

/**
 * Format tempo for display
 */
export function formatTempo(tempo: number): string {
  return `${Math.round(tempo)} BPM`;
}

/**
 * Format duration for display (MM:SS)
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
