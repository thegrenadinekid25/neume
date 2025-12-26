import * as Tone from 'tone';

/**
 * AudioEngine manages all audio synthesis and playback
 * Uses Tone.js for Web Audio API abstraction
 */
export class AudioEngine {
  // Synthesizer
  private synth!: Tone.PolySynth;

  // Effects
  private reverb!: Tone.Reverb;
  private compressor!: Tone.Compressor;
  private lowPassFilter!: Tone.Filter;
  private highPassFilter!: Tone.Filter;

  // Master output
  private masterGain!: Tone.Gain;

  // State
  private isInitialized: boolean = false;

  constructor() {
    // Initialize will be called on user interaction
  }

  /**
   * Initialize audio engine
   * MUST be called after user interaction (browser requirement)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Start Tone.js AudioContext
      await Tone.start();
      console.log('Audio context started');

      // Create synthesizer with 8-voice polyphony (2x SATB for overlap)
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: 'fatsawtooth', // Sawtooth with multiple detuned oscillators
          count: 3,
          spread: 10, // Slight detuning for chorus
        },
        envelope: {
          attack: 0.05, // 50ms - smooth but clear onset
          decay: 0.1, // 100ms
          sustain: 0.7, // 70% of peak
          release: 0.4, // 400ms - gentle tail
        },
      });
      this.synth.maxPolyphony = 8;

      // Create filters
      this.highPassFilter = new Tone.Filter({
        type: 'highpass',
        frequency: 60, // Remove subsonic rumble
        rolloff: -12,
      });

      this.lowPassFilter = new Tone.Filter({
        type: 'lowpass',
        frequency: 4000, // Tame harshness
        rolloff: -24,
        Q: 1.2, // Gentle resonance peak
      });

      // Create reverb (will be enhanced in Prompt 004)
      this.reverb = new Tone.Reverb({
        decay: 2.5,
        preDelay: 0.03,
        wet: 0.35, // 35% wet, 65% dry
      });

      // Create compressor
      this.compressor = new Tone.Compressor({
        threshold: -12, // dB
        ratio: 3, // 3:1 compression
        attack: 0.01, // 10ms
        release: 0.1, // 100ms
      });

      // Create master gain
      this.masterGain = new Tone.Gain(0.7); // 70% master volume

      // Connect signal chain:
      // Synth → HighPass → LowPass → Reverb → Compressor → MasterGain → Destination
      this.synth.connect(this.highPassFilter);
      this.highPassFilter.connect(this.lowPassFilter);
      this.lowPassFilter.connect(this.reverb);
      this.reverb.connect(this.compressor);
      this.compressor.connect(this.masterGain);
      this.masterGain.toDestination();

      this.isInitialized = true;
      console.log('AudioEngine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AudioEngine:', error);
      throw error;
    }
  }

  /**
   * Play a chord (4 SATB voices)
   */
  playChord(notes: string[], duration: number = 1): void {
    if (!this.isInitialized) {
      console.warn('AudioEngine not initialized. Call initialize() first.');
      return;
    }

    // Trigger attack
    this.synth.triggerAttack(notes);

    // Schedule release
    this.synth.triggerRelease(notes, `+${duration}`);
  }

  /**
   * Play a single note (for testing)
   */
  playNote(note: string, duration: number = 1): void {
    this.playChord([note], duration);
  }

  /**
   * Set master volume (0.0 to 1.0)
   */
  setMasterVolume(volume: number): void {
    if (!this.isInitialized) return;

    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.masterGain.gain.rampTo(clampedVolume, 0.1);
  }

  /**
   * Get master volume
   */
  getMasterVolume(): number {
    if (!this.isInitialized) return 0.7;
    return this.masterGain.gain.value;
  }

  /**
   * Stop all currently playing notes
   */
  stopAll(): void {
    if (!this.isInitialized) return;
    this.synth.releaseAll();
  }

  /**
   * Clean up and dispose of all audio resources
   */
  dispose(): void {
    if (!this.isInitialized) return;

    this.synth.dispose();
    this.reverb.dispose();
    this.compressor.dispose();
    this.highPassFilter.dispose();
    this.lowPassFilter.dispose();
    this.masterGain.dispose();

    this.isInitialized = false;
    console.log('AudioEngine disposed');
  }

  /**
   * Check if audio engine is ready
   */
  get ready(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();
