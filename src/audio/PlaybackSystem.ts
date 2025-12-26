import * as Tone from 'tone';
import { Chord } from '@types';
import { audioEngine } from './AudioEngine';

/**
 * PlaybackSystem manages chord progression playback
 */
export class PlaybackSystem {
  private scheduledEvents: number[] = [];
  private currentBeat: number = 0;
  private totalBeats: number = 0;
  private onPlayheadUpdate?: (beat: number) => void;
  private onChordTrigger?: (chordId: string) => void;
  private updateInterval?: number;

  constructor() {
    // Set default tempo
    Tone.Transport.bpm.value = 120;
  }

  /**
   * Schedule a chord progression for playback
   */
  scheduleProgression(chords: Chord[]): void {
    // Clear existing schedule
    this.clearSchedule();

    if (chords.length === 0) return;

    // Sort chords by startBeat
    const sortedChords = [...chords].sort((a, b) => a.startBeat - b.startBeat);

    // Calculate total beats
    const lastChord = sortedChords[sortedChords.length - 1];
    this.totalBeats = lastChord.startBeat + lastChord.duration;

    // Schedule each chord
    sortedChords.forEach(chord => {
      // Convert startBeat to Tone.js time notation (measures:beats:sixteenths)
      const measures = Math.floor(chord.startBeat / 4);
      const beats = chord.startBeat % 4;
      const beatTime = `${measures}:${beats}:0`;

      // Schedule chord attack
      const eventId = Tone.Transport.schedule((_time) => {
        // Get SATB voicing
        const notes = [
          chord.voices.bass,
          chord.voices.tenor,
          chord.voices.alto,
          chord.voices.soprano,
        ];

        // Trigger chord in audio engine
        audioEngine.playChord(notes, chord.duration);

        // Notify visual system (on main thread)
        if (this.onChordTrigger) {
          requestAnimationFrame(() => {
            this.onChordTrigger!(chord.id);
          });
        }
      }, beatTime);

      this.scheduledEvents.push(eventId);
    });

    // Schedule stop at end
    const endMeasures = Math.floor(this.totalBeats / 4);
    const endBeats = this.totalBeats % 4;
    Tone.Transport.schedule(() => {
      requestAnimationFrame(() => {
        this.stop();
      });
    }, `${endMeasures}:${endBeats}:0`);
  }

  /**
   * Start playback
   */
  play(): void {
    if (!audioEngine.ready) {
      console.warn('Audio engine not initialized');
      return;
    }

    Tone.Transport.start();

    // Start updating playhead
    this.updateInterval = window.setInterval(() => {
      // Get current position in beats
      const position = Tone.Transport.position as string;
      const parts = position.split(':');
      const measures = parseInt(parts[0]);
      const beats = parseInt(parts[1]);
      this.currentBeat = measures * 4 + beats;

      if (this.onPlayheadUpdate) {
        this.onPlayheadUpdate(this.currentBeat);
      }
    }, 16); // ~60fps
  }

  /**
   * Pause playback (can be resumed)
   */
  pause(): void {
    Tone.Transport.pause();
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }
  }

  /**
   * Stop playback and reset to beginning
   */
  stop(): void {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    this.currentBeat = 0;

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }

    // Release all notes
    audioEngine.stopAll();

    // Update visuals
    if (this.onPlayheadUpdate) {
      this.onPlayheadUpdate(0);
    }
  }

  /**
   * Set playback tempo (BPM)
   */
  setTempo(bpm: number): void {
    Tone.Transport.bpm.value = bpm;
  }

  /**
   * Get current tempo
   */
  getTempo(): number {
    return Tone.Transport.bpm.value;
  }

  /**
   * Check if playing
   */
  get isPlaying(): boolean {
    return Tone.Transport.state === 'started';
  }

  /**
   * Check if paused
   */
  get isPaused(): boolean {
    return Tone.Transport.state === 'paused';
  }

  /**
   * Check if stopped
   */
  get isStopped(): boolean {
    return Tone.Transport.state === 'stopped';
  }

  /**
   * Set callback for playhead updates
   */
  setPlayheadCallback(callback: (beat: number) => void): void {
    this.onPlayheadUpdate = callback;
  }

  /**
   * Set callback for chord triggers
   */
  setChordTriggerCallback(callback: (chordId: string) => void): void {
    this.onChordTrigger = callback;
  }

  /**
   * Clear all scheduled events
   */
  private clearSchedule(): void {
    this.scheduledEvents.forEach(id => {
      Tone.Transport.clear(id);
    });
    this.scheduledEvents = [];
  }

  /**
   * Clean up
   */
  dispose(): void {
    this.stop();
    this.clearSchedule();
  }
}

// Singleton instance
export const playbackSystem = new PlaybackSystem();
