# Prompt 004: Cathedral Reverb

## Objective
Add beautiful cathedral reverb using Web Audio ConvolverNode with real impulse responses, creating the spacious, sacred sound essential for choral music.

## Context
Audio engine is working (Prompt 001), voicing is perfect (Prompt 002), playback is functional (Prompt 003). Now we add the crucial spatial dimension that makes choral harmony shine.

**Dependencies:**
- Requires Week 3 Prompts 001-003 (audio engine, voicing, playback)
- Native Web Audio API ConvolverNode (no extra libraries)

**Related Components:**
- AudioEngine (signal chain)
- Impulse response files (cathedral recordings)

**Next Steps:** Tempo dial (Prompt 005) will complete playback controls

## Requirements

### Core Requirements
1. **ConvolverNode** with cathedral impulse response
2. **Impulse response loader** (fetch .wav file)
3. **Wet/dry mix** control (35% wet default)
4. **Pre-delay** (30ms spatial separation)
5. **Decay time** (2.5 seconds)
6. **HF damping** (high frequencies decay faster)
7. **Free impulse response** from OpenAir library
8. **Graceful fallback** if IR fails to load
9. **Efficient loading** (cache IR, load once)
10. **Volume-matched** wet/dry mixing

### Recommended Impulse Responses
From OpenAir Library (Creative Commons):
- **St. George's Episcopal Church** (excellent for choral)
- **York Minster** (grand cathedral)
- **Hamilton Mausoleum** (ultra-long decay - 15s!)

For Phase 1, use **St. George's Episcopal Church** (balanced, professional).

## Technical Constraints

- Use native Web Audio ConvolverNode
- Load IR asynchronously
- Handle loading errors gracefully
- Cache decoded audio buffer
- TypeScript strict mode

## Code Structure

### public/impulse-responses/README.md

Document IR sources:

```markdown
# Impulse Responses

## St. George's Episcopal Church
- **Source:** OpenAir Library (http://www.openairlib.net/)
- **License:** Creative Commons Attribution 4.0
- **Location:** York, UK
- **Decay Time:** ~2.5 seconds
- **File:** stgeorges_church.wav
- **Credits:** Recorded by OpenAir team

Download from: http://www.openairlib.net/auralizationdb/content/st-georges-episcopal-church

## Usage
Place .wav file in `/public/impulse-responses/` directory.
File will be loaded automatically by AudioEngine.
```

### src/audio/ReverbLoader.ts

```typescript
/**
 * Load and decode impulse response audio file
 */
export class ReverbLoader {
  private cache: Map<string, AudioBuffer> = new Map();

  /**
   * Load impulse response from URL
   */
  async loadImpulseResponse(
    url: string,
    audioContext: AudioContext
  ): Promise<AudioBuffer | null> {
    // Check cache first
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    try {
      console.log(`Loading impulse response from ${url}...`);

      // Fetch audio file
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch impulse response: ${response.statusText}`);
      }

      // Get array buffer
      const arrayBuffer = await response.arrayBuffer();

      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Cache for future use
      this.cache.set(url, audioBuffer);

      console.log(`Impulse response loaded successfully (${audioBuffer.duration.toFixed(2)}s)`);
      return audioBuffer;
    } catch (error) {
      console.error('Failed to load impulse response:', error);
      return null;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const reverbLoader = new ReverbLoader();
```

### Update src/audio/AudioEngine.ts

Add convolution reverb:

```typescript
import * as Tone from 'tone';
import { reverbLoader } from './ReverbLoader';

export class AudioEngine {
  // ... existing properties

  // Convolution Reverb
  private convolver: ConvolverNode | null = null;
  private dryGain: GainNode;
  private wetGain: GainNode;
  private reverbMix: GainNode; // Master mix of dry + wet

  // Reverb settings
  private reverbWetAmount: number = 0.35; // 35% wet

  constructor() {
    // ... existing constructor
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Tone.start();
      console.log('Audio context started');

      // Create synthesizer (existing code)
      this.synth = new Tone.PolySynth(/* ... */);

      // Create filters (existing code)
      this.highPassFilter = new Tone.Filter(/* ... */);
      this.lowPassFilter = new Tone.Filter(/* ... */);

      // NEW: Create convolution reverb
      await this.setupConvolutionReverb();

      // Create compressor (existing code)
      this.compressor = new Tone.Compressor(/* ... */);

      // Create master gain (existing code)
      this.masterGain = new Tone.Gain(0.7);

      // Connect signal chain with convolution reverb:
      // Synth → Filters → [Dry Path + Wet Path (Convolver)] → Compressor → Master → Out
      this.connectSignalChain();

      this.isInitialized = true;
      console.log('AudioEngine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AudioEngine:', error);
      throw error;
    }
  }

  /**
   * Set up convolution reverb with impulse response
   */
  private async setupConvolutionReverb(): Promise<void> {
    const audioContext = Tone.getContext().rawContext as AudioContext;

    // Create dry/wet gains
    this.dryGain = audioContext.createGain();
    this.wetGain = audioContext.createGain();
    this.reverbMix = audioContext.createGain();

    // Set initial dry/wet levels
    this.dryGain.gain.value = 1.0 - this.reverbWetAmount; // 65% dry
    this.wetGain.gain.value = this.reverbWetAmount;       // 35% wet
    this.reverbMix.gain.value = 1.0;

    // Load impulse response
    const irUrl = '/impulse-responses/stgeorges_church.wav';
    const impulseResponse = await reverbLoader.loadImpulseResponse(
      irUrl,
      audioContext
    );

    if (impulseResponse) {
      // Create convolver
      this.convolver = audioContext.createConvolver();
      this.convolver.buffer = impulseResponse;
      
      console.log('Convolution reverb ready');
    } else {
      console.warn('Convolution reverb not available - using algorithmic reverb fallback');
      // Fallback to Tone.js algorithmic reverb (already created in original code)
    }
  }

  /**
   * Connect signal chain with parallel dry/wet paths
   */
  private connectSignalChain(): void {
    // Synth → HighPass → LowPass → [Split into dry + wet]
    this.synth.connect(this.highPassFilter as any);
    this.highPassFilter.connect(this.lowPassFilter as any);

    if (this.convolver) {
      // WET PATH: LowPass → Convolver → WetGain → ReverbMix
      this.lowPassFilter.connect(this.convolver as any);
      (this.convolver as any).connect(this.wetGain);
      this.wetGain.connect(this.reverbMix);

      // DRY PATH: LowPass → DryGain → ReverbMix
      this.lowPassFilter.connect(this.dryGain as any);
      (this.dryGain as any).connect(this.reverbMix);

      // ReverbMix → Compressor → Master → Output
      (this.reverbMix as any).connect(this.compressor);
    } else {
      // Fallback: Use Tone.js reverb (already connected in original code)
      this.lowPassFilter.connect(this.reverb as any);
      this.reverb.connect(this.compressor as any);
    }

    this.compressor.connect(this.masterGain as any);
    this.masterGain.toDestination();
  }

  /**
   * Set reverb wet amount (0.0 to 1.0)
   */
  setReverbWet(wetAmount: number): void {
    if (!this.isInitialized || !this.dryGain || !this.wetGain) return;

    const clampedWet = Math.max(0, Math.min(1, wetAmount));
    this.reverbWetAmount = clampedWet;

    // Ramp to new values smoothly
    this.wetGain.gain.rampTo(clampedWet, 0.1);
    this.dryGain.gain.rampTo(1.0 - clampedWet, 0.1);
  }

  /**
   * Get current reverb wet amount
   */
  getReverbWet(): number {
    return this.reverbWetAmount;
  }

  // ... rest of existing methods

  dispose(): void {
    if (!this.isInitialized) return;

    // Dispose Tone.js nodes (existing)
    this.synth.dispose();
    this.reverb.dispose();
    this.compressor.dispose();
    this.highPassFilter.dispose();
    this.lowPassFilter.dispose();
    this.masterGain.dispose();

    // Dispose Web Audio nodes
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
    console.log('AudioEngine disposed');
  }
}

export const audioEngine = new AudioEngine();
```

### src/components/Controls/ReverbControl.tsx (Optional)

UI control for reverb amount:

```typescript
import React from 'react';
import { audioEngine } from '@/audio/AudioEngine';
import { useCanvasStore } from '@/store/canvas-store';
import styles from './ReverbControl.module.css';

export const ReverbControl: React.FC = () => {
  const { reverbWet, setReverbWet } = useCanvasStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setReverbWet(value);
  };

  return (
    <div className={styles.reverbControl}>
      <label htmlFor="reverb">Reverb</label>
      <input
        id="reverb"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={reverbWet}
        onChange={handleChange}
      />
      <span>{Math.round(reverbWet * 100)}%</span>
    </div>
  );
};
```

### Update src/store/canvas-store.ts

Add reverb state:

```typescript
interface CanvasState {
  // ... existing state

  // Audio
  reverbWet: number;
  setReverbWet: (wet: number) => void;

  // ... existing actions
}

export const useCanvasStore = create<CanvasState>((set) => ({
  // ... existing state
  reverbWet: 0.35,

  setReverbWet: (wet) => {
    set({ reverbWet: wet });
    audioEngine.setReverbWet(wet);
  },

  // ... existing actions
}));
```

## Impulse Response Installation

### Download St. George's Church IR

1. Visit: http://www.openairlib.net/auralizationdb/content/st-georges-episcopal-church
2. Download the stereo WAV file
3. Place in: `/public/impulse-responses/stgeorges_church.wav`

**OR** use this direct download script:

```bash
# From project root
mkdir -p public/impulse-responses
cd public/impulse-responses

# Download (example URL - check OpenAir for actual file)
curl -O http://www.openairlib.net/sites/default/files/stgeorges_church.wav

# Verify file
ls -lh stgeorges_church.wav
```

## Quality Criteria

- [ ] ReverbLoader compiles without errors
- [ ] Impulse response loads successfully
- [ ] Audio plays with reverb
- [ ] Reverb sounds spacious and natural
- [ ] Dry/wet mix works (0% to 100%)
- [ ] No audio clicks or artifacts
- [ ] Fallback works if IR fails to load
- [ ] Performance is good (no lag)
- [ ] Reverb enhances choral quality

## Implementation Notes

1. **ConvolverNode:** Native Web Audio API for convolution reverb. More realistic than algorithmic reverb.

2. **Dry/Wet Mixing:** Parallel paths with separate gain nodes. Sum at reverbMix before compressor.

3. **Loading:** Async loading with caching. Won't block initialization if IR fails.

4. **Fallback:** If convolution reverb fails, uses existing Tone.Reverb (algorithmic).

5. **OpenAir License:** Creative Commons - free to use with attribution.

## Accessibility

- Reverb control has label
- Slider has aria attributes
- Percentage display shows current value
- Keyboard accessible (arrow keys)

## Performance

- IR loaded once and cached
- Convolution is efficient (native implementation)
- No real-time processing overhead
- Minimal CPU usage

## Testing Scenarios

1. **Load test:** Check console for "Convolution reverb ready" message
2. **Sound test:** Play chord, hear spacious reverb tail
3. **Dry/wet test:** Adjust reverb slider from 0% to 100%
4. **Fallback test:** Remove IR file, verify algorithmic reverb works
5. **Long progression:** Play 8+ chords, verify reverb doesn't build up

## Common Issues & Solutions

**Issue:** IR file not found (404 error)

**Solution:** Verify file is in `/public/impulse-responses/` and filename matches URL.

**Issue:** Reverb too loud/quiet

**Solution:** Adjust wetGain value (default 0.35 = 35% wet).

**Issue:** Audio clicks during reverb tail

**Solution:** Ensure compressor comes AFTER reverb in signal chain.

## Next Steps

After cathedral reverb is working:
1. Create tempo dial control (Prompt 005)
2. Final integration and polish (Prompt 006)
3. Complete Week 3

---

**Output Format:** Provide complete ReverbLoader, updated AudioEngine with ConvolverNode, optional ReverbControl component, and instructions for downloading impulse response. Verify reverb creates beautiful, spacious choral sound.
