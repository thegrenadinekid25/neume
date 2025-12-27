import * as Tone from 'tone';
import type { Chord } from '@/types';
import { audioEngine } from './AudioEngine';

export class PlaybackSystem {
  private scheduledEvents: number[] = [];
  private isPlaying: boolean = false;
  private onPlayheadUpdate?: (beat: number) => void;
  private onChordTrigger?: (chordId: string) => void;
  private onPlaybackEnd?: () => void;
  private animationFrameId?: number;
  private totalBeats: number = 16;

  constructor() {
    // Set default tempo
    Tone.Transport.bpm.value = 120;
  }

  /**
   * Convert beat number to Tone.js time format (bars:beats:sixteenths)
   */
  private beatToTransportTime(beat: number): string {
    const bars = Math.floor(beat / 4);
    const beats = beat % 4;
    return `${bars}:${beats}:0`;
  }

  /**
   * Schedule a chord progression for playback
   */
  scheduleProgression(chords: Chord[]): void {
    this.clearSchedule();
    // Release any currently playing notes
    audioEngine.stopAll();
    if (chords.length === 0) return;

    const sortedChords = [...chords].sort((a, b) => a.startBeat - b.startBeat);
    const sampler = audioEngine.getSampler();

    if (!sampler) {
      console.warn('Sampler not available for playback scheduling');
      return;
    }

    sortedChords.forEach((chord, index) => {
      // Convert startBeat to Tone.js transport time
      const startTime = this.beatToTransportTime(chord.startBeat);

      // Calculate duration: until next chord starts, or use default for last chord
      const nextChord = sortedChords[index + 1];
      const durationBeats = nextChord
        ? nextChord.startBeat - chord.startBeat
        : chord.duration;

      // Schedule chord
      const eventId = Tone.Transport.schedule((time) => {
        const notes = [
          chord.voices.bass,
          chord.voices.tenor,
          chord.voices.alto,
          chord.voices.soprano,
        ].filter(Boolean);

        if (notes.length > 0) {
          // Calculate duration in seconds
          const durationSeconds = (durationBeats / Tone.Transport.bpm.value) * 60;

          // Use triggerAttackRelease for clean attack and release
          sampler.triggerAttackRelease(notes, durationSeconds, time);
        }

        // Notify visual system
        if (this.onChordTrigger) {
          this.onChordTrigger(chord.id);
        }
      }, startTime);

      this.scheduledEvents.push(eventId);
    });
  }

  /**
   * Start playback
   */
  play(): void {
    if (!audioEngine.getIsInitialized()) {
      console.warn('Audio engine not initialized');
      return;
    }

    this.isPlaying = true;
    Tone.Transport.start();
    this.startPlayheadAnimation();
  }

  /**
   * Pause playback
   */
  pause(): void {
    this.isPlaying = false;
    Tone.Transport.pause();
    this.stopPlayheadAnimation();
  }

  /**
   * Stop and reset to beginning
   */
  stop(): void {
    this.isPlaying = false;
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    audioEngine.stopAll();
    this.stopPlayheadAnimation();

    if (this.onPlayheadUpdate) {
      this.onPlayheadUpdate(0);
    }
  }

  /**
   * Toggle play/pause
   */
  togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Set tempo in BPM
   */
  setTempo(bpm: number): void {
    Tone.Transport.bpm.value = Math.max(60, Math.min(220, bpm));
  }

  /**
   * Get current tempo
   */
  getTempo(): number {
    return Tone.Transport.bpm.value;
  }

  /**
   * Get current beat position (fractional for smooth animation)
   */
  getCurrentBeat(): number {
    const position = Tone.Transport.position;
    if (typeof position === 'string') {
      // Position format: "bars:quarters:sixteenths"
      const [bars, quarters, sixteenths] = position.split(':').map(Number);
      // Convert to total beats (4 beats per bar)
      return bars * 4 + quarters + (sixteenths / 4);
    }
    return 0;
  }

  /**
   * Check if playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Set playhead update callback
   */
  setPlayheadCallback(callback: (beat: number) => void): void {
    this.onPlayheadUpdate = callback;
  }

  /**
   * Set chord trigger callback
   */
  setChordTriggerCallback(callback: (chordId: string) => void): void {
    this.onChordTrigger = callback;
  }

  /**
   * Set playback end callback
   */
  setPlaybackEndCallback(callback: () => void): void {
    this.onPlaybackEnd = callback;
  }

  /**
   * Set total beats for end detection
   */
  setTotalBeats(beats: number): void {
    this.totalBeats = beats;
  }

  /**
   * Start playhead animation loop
   */
  private startPlayheadAnimation(): void {
    const animate = () => {
      if (!this.isPlaying) return;

      const currentBeat = this.getCurrentBeat();

      // Check if we've reached the end of the timeline
      if (currentBeat >= this.totalBeats) {
        this.stop();
        if (this.onPlaybackEnd) {
          this.onPlaybackEnd();
        }
        return;
      }

      if (this.onPlayheadUpdate) {
        this.onPlayheadUpdate(currentBeat);
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  /**
   * Stop playhead animation
   */
  private stopPlayheadAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
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
   * Dispose resources
   */
  dispose(): void {
    this.stop();
    this.clearSchedule();
  }
}

// Singleton instance
export const playbackSystem = new PlaybackSystem();
