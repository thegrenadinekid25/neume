# Prompt 001: Audio Engine Setup

## Objective
Set up the audio engine using Tone.js, creating a warm, choral-focused sound with proper signal chain (synth → reverb → compression → output). This is the foundation for all playback in Harmonic Canvas.

## Context
Users can now build chord progressions visually (Weeks 1-2), but can't hear them. Week 3 adds audio capabilities, starting with the audio engine.

**Dependencies:**
- Requires Week 1 (visual system)
- Requires Week 2 (interaction system)
- Tone.js already installed (Week 1 Prompt 002)

**Related Components:**
- Will be used by playback system (Prompt 003)
- Supports SATB voicing (Prompt 002)

**Next Steps:** SATB voicing (Prompt 002) will use this engine

## Requirements

### Core Requirements
1. **AudioEngine class** with Tone.js
2. **Polyphonic synthesizer** (4 voices for SATB)
3. **Signal chain:** Synth → Reverb → Compressor → Master → Output
4. **ADSR envelope** (Attack 20-50ms, Decay 100ms, Sustain 70%, Release 400ms)
5. **Oscillator mix** (60% sawtooth, 40% sine)
6. **Detuning** for chorus effect (-5¢, 0¢, +5¢, +10¢)
7. **Filter** (low-pass 4000Hz, high-pass 60Hz)
8. **Master volume control**
9. **Audio context management** (start on user interaction)
10. **Clean initialization/disposal**

### Sound Design Goals
- Warm, choral-focused timbre
- Rich harmonics from sawtooth
- Fundamental warmth from sine
- Subtle chorus from detuning
- Smooth attack and release
- No harsh frequencies

## Technical Constraints

- Use Tone.js v14.7.77 (already installed)
- Browser AudioContext restrictions (user gesture required)
- Efficient voice allocation
- No memory leaks on cleanup
- TypeScript strict mode

## Code Structure

### src/audio/AudioEngine.ts

```typescript
import * as Tone from 'tone';

/**
 * AudioEngine manages all audio synthesis and playback
 * Uses Tone.js for Web Audio API abstraction
 */
export class AudioEngine {
  // Synthesizer
  private synth: Tone.PolySynth;
  
  // Effects
  private reverb: Tone.Reverb;
  private compressor: Tone.Compressor;
  private lowPassFilter: Tone.Filter;
  private highPassFilter: Tone.Filter;
  
  // Master output
  private masterGain: Tone.Gain;
  
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

      // Create synthesizer
      this.synth = new Tone.PolySynth(Tone.Synth, {
        maxPolyphony: 8, // Support up to 8 simultaneous notes (2x SATB for overlap)
        voice: Tone.Synth,
        options: {
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
          // Additional sine oscillator for warmth
          // Note: Tone.js doesn't support oscillator mixing directly
          // We'll achieve this through the oscillator type
        },
      });

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

      // Create reverb (will be loaded in Prompt 004)
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
```

### src/hooks/useAudioEngine.ts

React hook for audio engine:

```typescript
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
```

### src/components/Audio/AudioInitButton.tsx

Button to initialize audio (required by browser):

```typescript
import React, { useState } from 'react';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import styles from './AudioInitButton.module.css';

export const AudioInitButton: React.FC = () => {
  const { isReady, error, initialize } = useAudioEngine();
  const [isInitializing, setIsInitializing] = useState(false);

  const handleClick = async () => {
    setIsInitializing(true);
    await initialize();
    setIsInitializing(false);
  };

  if (isReady) {
    return (
      <div className={styles.status}>
        <span className={styles.indicator}>🔊</span>
        Audio Ready
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        Audio failed to load. Please refresh.
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isInitializing}
      className={styles.initButton}
    >
      {isInitializing ? 'Initializing Audio...' : 'Enable Audio'}
    </button>
  );
};
```

### Update src/store/canvas-store.ts

Add audio state:

```typescript
interface CanvasState {
  // ... existing state

  // Audio
  masterVolume: number;
  setMasterVolume: (volume: number) => void;

  // ... existing actions
}

export const useCanvasStore = create<CanvasState>((set) => ({
  // ... existing state
  masterVolume: 0.7,

  setMasterVolume: (volume) => {
    set({ masterVolume: volume });
    audioEngine.setMasterVolume(volume);
  },

  // ... existing actions
}));
```

## Testing & Verification

### Manual Test 1: Initialization

```typescript
// In browser console after user interaction
import { audioEngine } from './audio/AudioEngine';

await audioEngine.initialize();
console.log('Ready:', audioEngine.ready); // Should be true
```

### Manual Test 2: Play Single Note

```typescript
// Play middle C for 2 seconds
audioEngine.playNote('C4', 2);
```

### Manual Test 3: Play Chord

```typescript
// Play C major chord (C-E-G-C) for 3 seconds
audioEngine.playChord(['C3', 'E3', 'G3', 'C4'], 3);
```

### Manual Test 4: Volume Control

```typescript
// Set to 50% volume
audioEngine.setMasterVolume(0.5);

// Play test chord
audioEngine.playChord(['C4', 'E4', 'G4'], 2);

// Set back to 70%
audioEngine.setMasterVolume(0.7);
```

## Quality Criteria

- [ ] AudioEngine class compiles without errors
- [ ] Tone.js imports correctly
- [ ] initialize() starts AudioContext
- [ ] playChord() produces sound
- [ ] playNote() produces sound
- [ ] Sound is warm and choral-like
- [ ] No harsh frequencies
- [ ] Volume control works (0.0 to 1.0)
- [ ] stopAll() silences immediately
- [ ] dispose() cleans up resources
- [ ] No memory leaks on repeated init/dispose
- [ ] AudioInitButton enables audio on click
- [ ] Browser console shows no errors

## Implementation Notes

1. **User Gesture Requirement:** Browsers require user interaction before audio plays. Always call `initialize()` in a click handler.

2. **PolySynth:** Supports up to 8 simultaneous notes (we need 4 for SATB, extra for overlapping chords).

3. **Oscillator Type:** `fatsawtooth` creates multiple detuned sawtooth waves for natural chorus effect.

4. **Signal Chain Order:** Filters before reverb (cleaner reverb tail), compressor after reverb (even dynamics).

5. **Reverb Wet/Dry:** 35% wet creates spaciousness without washing out clarity.

## Accessibility

- Audio initialization button has clear label
- Visual feedback when audio is ready
- Error states communicated clearly
- Volume control will have ARIA labels

## Performance

- Efficient voice allocation (polyphony: 8)
- No audio processing when not playing
- Minimal CPU usage in idle state
- Clean disposal prevents memory leaks

## Next Steps

After audio engine is working:
1. Implement SATB voicing (Prompt 002)
2. Add playback system (Prompt 003)
3. Enhance with cathedral reverb (Prompt 004)

---

**Output Format:** Provide complete AudioEngine class, useAudioEngine hook, AudioInitButton component, and updated canvas-store. Verify audio plays in browser after user interaction.
