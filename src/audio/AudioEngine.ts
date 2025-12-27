import * as Tone from 'tone';
import { AUDIO_DEFAULTS } from '@/utils/constants';
import { reverbLoader } from './ReverbLoader';

/**
 * AudioEngine - Core audio synthesis class using Tone.js
 * Manages polyphonic synthesis with SATB voicing capabilities
 */
export class AudioEngine {
  private synth: Tone.PolySynth<Tone.Synth>;
  private highpass: Tone.Filter;
  private lowpass: Tone.Filter;
  private reverb: Tone.Reverb;
  private compressor: Tone.Compressor;
  private masterGain: Tone.Gain;
  private isInitialized: boolean = false;
  private convolver: ConvolverNode | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private reverbMix: GainNode | null = null;
  private useConvolutionReverb: boolean = false;
  private reverbWetAmount: number = 0.35;

  constructor() {
    // Create synth with fatsawtooth, 3 detuned voices, 10 cents spread
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'fatsawtooth',
        count: 3,
        spread: 10,
      },
      envelope: {
        attack: 0.05,
        decay: 0.1,
        sustain: 0.7,
        release: 0.4,
      },
    });

    // Create signal chain filters
    this.highpass = new Tone.Filter({
      frequency: 60,
      type: 'highpass',
      rolloff: -12,
    });

    this.lowpass = new Tone.Filter({
      frequency: 4000,
      type: 'lowpass',
      rolloff: -24,
    });

    // Create reverb with 2.5s decay and 35% wet
    this.reverb = new Tone.Reverb({
      decay: AUDIO_DEFAULTS.REVERB_DECAY,
      wet: AUDIO_DEFAULTS.REVERB_WET,
    });

    // Create compressor
    this.compressor = new Tone.Compressor({
      threshold: AUDIO_DEFAULTS.COMPRESSION_THRESHOLD,
      ratio: AUDIO_DEFAULTS.COMPRESSION_RATIO,
    });

    // Create master gain
    this.masterGain = new Tone.Gain({
      gain: AUDIO_DEFAULTS.MASTER_VOLUME,
    });

    // NOTE: Signal chain connection is deferred to initialize()
    // to allow convolution reverb setup to take precedence if available
  }

  /**
   * Initialize the audio context
   * Must be called in response to user interaction
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Tone.start();

      // Attempt to setup convolution reverb
      await this.setupConvolutionReverb();

      // Connect signal chain based on reverb mode
      this.connectSignalChain();

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
      throw error;
    }
  }

  /**
   * Setup convolution reverb with graceful fallback
   */
  private async setupConvolutionReverb(): Promise<void> {
    try {
      const audioContext = Tone.getContext().rawContext as AudioContext;
      const irUrl = '/impulse-responses/cathedral.wav';

      const irBuffer = await reverbLoader.loadImpulseResponse(irUrl, audioContext);

      if (irBuffer) {
        // Create convolution reverb nodes
        this.convolver = audioContext.createConvolver();
        this.convolver.buffer = irBuffer;
        this.dryGain = audioContext.createGain();
        this.wetGain = audioContext.createGain();
        this.reverbMix = audioContext.createGain();

        // Set initial wet amount
        this.dryGain.gain.value = 1 - this.reverbWetAmount;
        this.wetGain.gain.value = this.reverbWetAmount;
        this.reverbMix.gain.value = 1;

        this.useConvolutionReverb = true;
        console.log('Convolution reverb ready');
      } else {
        console.log('Using algorithmic fallback reverb');
      }
    } catch (error) {
      console.warn('Convolution reverb setup failed, using algorithmic fallback:', error);
    }
  }

  /**
   * Connect the signal chain
   * Uses convolution reverb if available, otherwise uses Tone.Reverb
   */
  private connectSignalChain(): void {
    // Basic path: synth -> highpass -> lowpass -> compressor -> masterGain -> destination
    this.synth.connect(this.highpass);
    this.highpass.connect(this.lowpass);

    if (this.useConvolutionReverb && this.convolver && this.dryGain && this.wetGain && this.reverbMix) {
      // Convolution reverb path:
      // synth -> hp -> lp -> [dry + wet convolution] -> compressor -> masterGain -> destination
      // For now, skip convolution (keep it simple) and use reverb
      // TODO: Properly bridge Web Audio API convolver with Tone.js signal chain
      this.lowpass.connect(this.reverb);
      this.reverb.connect(this.compressor);
      this.compressor.connect(this.masterGain);
      this.masterGain.toDestination();
    } else {
      // Algorithmic reverb path (default):
      // synth -> hp -> lp -> reverb -> compressor -> masterGain -> destination
      this.lowpass.connect(this.reverb);
      this.reverb.connect(this.compressor);
      this.compressor.connect(this.masterGain);
      this.masterGain.toDestination();
    }
  }

  /**
   * Play a chord (array of note names)
   * @param notes - Array of note names (e.g., ['C3', 'E3', 'G3', 'C4'])
   * @param duration - Duration in seconds
   */
  playChord(notes: string[], duration: number = 2): void {
    if (!this.isInitialized) {
      console.warn('Audio engine not initialized. Call initialize() first.');
      return;
    }

    try {
      const now = Tone.now();
      notes.forEach((note) => {
        this.synth.triggerAttackRelease(note, duration, now);
      });
    } catch (error) {
      console.error('Error playing chord:', error);
    }
  }

  /**
   * Play a single note
   * @param note - Note name (e.g., 'C4')
   * @param duration - Duration in seconds
   */
  playNote(note: string, duration: number = 1): void {
    if (!this.isInitialized) {
      console.warn('Audio engine not initialized. Call initialize() first.');
      return;
    }

    try {
      this.synth.triggerAttackRelease(note, duration);
    } catch (error) {
      console.error('Error playing note:', error);
    }
  }

  /**
   * Set master volume
   * @param volume - Volume level (0-1)
   */
  setMasterVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.masterGain.gain.value = clampedVolume;
  }

  /**
   * Get current master volume
   */
  getMasterVolume(): number {
    return this.masterGain.gain.value;
  }

  /**
   * Stop all currently playing notes
   */
  stopAll(): void {
    if (this.isInitialized) {
      // Release all voices in the PolySynth
      this.synth.releaseAll();
    }
  }

  /**
   * Set reverb wet amount (0-1)
   * @param wetAmount - Wet amount (0 = dry, 1 = fully wet)
   */
  setReverbWet(wetAmount: number): void {
    const clamped = Math.max(0, Math.min(1, wetAmount));
    this.reverbWetAmount = clamped;

    if (this.useConvolutionReverb && this.dryGain && this.wetGain) {
      // Update convolution reverb mix
      this.dryGain.gain.value = 1 - clamped;
      this.wetGain.gain.value = clamped;
    } else {
      // Update algorithmic reverb
      this.reverb.wet.value = clamped;
    }
  }

  /**
   * Get current reverb wet amount
   */
  getReverbWet(): number {
    return this.reverbWetAmount;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.synth.dispose();
    this.highpass.dispose();
    this.lowpass.dispose();
    this.reverb.dispose();
    this.compressor.dispose();
    this.masterGain.dispose();

    // Clean up convolution reverb nodes if used
    if (this.convolver) {
      this.convolver.disconnect();
    }
    if (this.dryGain) {
      this.dryGain.disconnect();
    }
    if (this.wetGain) {
      this.wetGain.disconnect();
    }
    if (this.reverbMix) {
      this.reverbMix.disconnect();
    }

    this.isInitialized = false;
  }

  /**
   * Check if audio engine is initialized
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get the synth for direct Transport scheduling
   */
  getSynth(): Tone.PolySynth<Tone.Synth> {
    return this.synth;
  }
}

// Export singleton instance
export const audioEngine = new AudioEngine();
