import * as Tone from 'tone';
import { AUDIO_DEFAULTS } from '@/utils/constants';
import { reverbLoader } from './ReverbLoader';
import type { SoundType } from '@/types';

/**
 * Salamander Grand Piano sample mappings
 * Uses samples every major 3rd - Tone.js will repitch for intermediate notes
 * This matches the available samples on the Tone.js CDN
 */
const SALAMANDER_SAMPLES: Record<string, string> = {
  A0: 'A0.mp3',
  C1: 'C1.mp3',
  'D#1': 'Ds1.mp3',
  'F#1': 'Fs1.mp3',
  A1: 'A1.mp3',
  C2: 'C2.mp3',
  'D#2': 'Ds2.mp3',
  'F#2': 'Fs2.mp3',
  A2: 'A2.mp3',
  C3: 'C3.mp3',
  'D#3': 'Ds3.mp3',
  'F#3': 'Fs3.mp3',
  A3: 'A3.mp3',
  C4: 'C4.mp3',
  'D#4': 'Ds4.mp3',
  'F#4': 'Fs4.mp3',
  A4: 'A4.mp3',
  C5: 'C5.mp3',
  'D#5': 'Ds5.mp3',
  'F#5': 'Fs5.mp3',
  A5: 'A5.mp3',
  C6: 'C6.mp3',
  'D#6': 'Ds6.mp3',
  'F#6': 'Fs6.mp3',
  A6: 'A6.mp3',
  C7: 'C7.mp3',
  'D#7': 'Ds7.mp3',
  'F#7': 'Fs7.mp3',
  A7: 'A7.mp3',
  C8: 'C8.mp3',
};

const SALAMANDER_BASE_URL = 'https://tonejs.github.io/audio/salamander/';

/**
 * AudioEngine - Core audio synthesis class using Tone.js
 * Manages polyphonic synthesis with SATB voicing capabilities
 * Uses Salamander Grand Piano samples for high-quality audio output
 */
export class AudioEngine {
  private sampler: Tone.Sampler | null = null;
  private chimeSynth: Tone.PolySynth<Tone.Synth> | null = null;
  private highpass: Tone.Filter;
  private lowpass: Tone.Filter;
  private reverb: Tone.Reverb;
  private compressor: Tone.Compressor;
  private masterGain: Tone.Gain;
  private isInitialized: boolean = false;
  private isSamplesLoaded: boolean = false;
  private convolver: ConvolverNode | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private reverbMix: GainNode | null = null;
  private useConvolutionReverb: boolean = false;
  private reverbWetAmount: number = 0.35;
  private soundType: SoundType = 'piano';

  constructor() {
    // Sampler will be created asynchronously in loadSampler()
    // NOTE: Sampler creation is deferred to initialize() to ensure audio context is active

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
   * Load the Salamander Grand Piano sampler
   * Creates a Tone.Sampler with the piano samples
   */
  private async loadSampler(): Promise<void> {
    if (this.sampler) {
      return; // Already loaded
    }

    try {
      // Create sampler with Salamander piano samples
      // Use baseUrl for the CDN and just filenames in urls
      await new Promise<void>((resolve, reject) => {
        this.sampler = new Tone.Sampler({
          urls: SALAMANDER_SAMPLES,
          baseUrl: SALAMANDER_BASE_URL,
          onload: () => {
            console.log('Salamander Piano samples loaded');
            this.isSamplesLoaded = true;
            resolve();
          },
          onerror: (error: Error) => {
            console.error('Failed to load Salamander samples:', error);
            this.isSamplesLoaded = false;
            reject(error);
          },
        });
      });
    } catch (error) {
      console.error('Error loading Salamander sampler:', error);
      this.isSamplesLoaded = false;
      throw error;
    }
  }

  /**
   * Create the chime synth with warm sine wave sounds
   */
  private createChimeSynth(): void {
    if (this.chimeSynth) {
      return; // Already created
    }

    // Create a warm chime sound with sine oscillators and soft envelope
    this.chimeSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'sine',
      },
      envelope: {
        attack: 0.08,    // Soft attack
        decay: 0.1,
        sustain: 0.7,    // Holds the tone well
        release: 0.5,    // Longer release for warm decay
      },
      volume: -15, // Further reduced for better balance with piano
    }).toDestination();

    console.log('Chime synth created');
  }

  /**
   * Initialize the audio context
   * Must be called in response to user interaction
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Tone.start();

      // Load Salamander Piano samples
      await this.loadSampler();

      // Create chime synth
      this.createChimeSynth();

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
      }
      // ReverbLoader handles logging - no need to duplicate here
    } catch {
      // ReverbLoader handles error logging
    }
  }

  /**
   * Connect the signal chain
   * Uses convolution reverb if available, otherwise uses Tone.Reverb
   */
  private connectSignalChain(): void {
    if (!this.sampler) {
      console.warn('Sampler not initialized');
      return;
    }

    // Basic path: sampler -> highpass -> lowpass -> compressor -> masterGain -> destination
    this.sampler.connect(this.highpass);
    this.highpass.connect(this.lowpass);

    if (this.useConvolutionReverb && this.convolver && this.dryGain && this.wetGain && this.reverbMix) {
      // Convolution reverb path:
      // sampler -> hp -> lp -> [dry + wet convolution] -> compressor -> masterGain -> destination
      // For now, skip convolution (keep it simple) and use reverb
      // TODO: Properly bridge Web Audio API convolver with Tone.js signal chain
      this.lowpass.connect(this.reverb);
      this.reverb.connect(this.compressor);
      this.compressor.connect(this.masterGain);
      this.masterGain.toDestination();
    } else {
      // Algorithmic reverb path (default):
      // sampler -> hp -> lp -> reverb -> compressor -> masterGain -> destination
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

    if (!this.isSamplesLoaded || !this.sampler) {
      console.warn('Salamander samples not loaded yet.');
      return;
    }

    try {
      const now = Tone.now();
      notes.forEach((note) => {
        this.sampler!.triggerAttackRelease(note, duration, now);
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

    if (!this.isSamplesLoaded || !this.sampler) {
      console.warn('Salamander samples not loaded yet.');
      return;
    }

    try {
      this.sampler.triggerAttackRelease(note, duration);
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
      // Release all notes in the sampler
      if (this.sampler) {
        this.sampler.releaseAll();
      }
      // Also release chime synth notes to prevent stuck notes
      if (this.chimeSynth) {
        this.chimeSynth.releaseAll();
      }
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
    if (this.sampler) {
      this.sampler.dispose();
    }
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
   * Get the sampler for direct Transport scheduling
   */
  getSampler(): Tone.Sampler | null {
    return this.sampler;
  }

  /**
   * Check if Salamander samples are loaded
   */
  getIsSamplesLoaded(): boolean {
    return this.isSamplesLoaded;
  }

  /**
   * Get the synth for backwards compatibility
   * Note: Returns null as we now use sampler instead of synth
   */
  getSynth(): Tone.PolySynth<Tone.Synth> | null {
    return null;
  }

  /**
   * Set the current sound type
   */
  setSoundType(type: SoundType): void {
    this.soundType = type;
  }

  /**
   * Get the current sound type
   */
  getSoundType(): SoundType {
    return this.soundType;
  }

  /**
   * Get the current instrument based on sound type
   * Returns either the sampler (piano) or chimeSynth (chime)
   */
  getCurrentInstrument(): Tone.Sampler | Tone.PolySynth<Tone.Synth> | null {
    if (this.soundType === 'chime') {
      return this.chimeSynth;
    }
    return this.sampler;
  }
}

// Export singleton instance
export const audioEngine = new AudioEngine();
