# Prompt 003: Playback System

## Objective
Implement the complete playback system using Tone.Transport for precise scheduling. Enable users to hear their chord progressions with perfect timing, synchronized visual feedback, and professional playback controls.

## Context
Audio engine is ready (Prompt 001), chords are perfectly voiced (Prompt 002). Now we need to schedule and play complete progressions with synchronized animations.

**Dependencies:**
- Requires Week 3 Prompts 001-002 (audio engine, SATB voicing)
- Requires Week 2 (chord data and interactions)
- Tone.js Transport for scheduling

**Related Components:**
- AudioEngine (plays individual chords)
- VoiceLeading (provides SATB voicings)
- ChordShape (animates during playback)
- Playhead (shows current position)

**Next Steps:** Tempo dial (Prompt 005) will control playback speed

## Requirements

### Core Requirements
1. **Tone.Transport** for precise scheduling
2. **Play/Pause button** in UI
3. **Playhead animation** synchronized with audio
4. **Chord pulse animation** when playing
5. **Loop playback** (optional - stop at end or loop)
6. **Tempo control** (default 120 BPM)
7. **Schedule all chords** before playback starts
8. **Clean stop** (release all notes, reset playhead)
9. **Transport state management** (playing, paused, stopped)
10. **Keyboard shortcut** (Space bar)

### Playback Behavior
- Press Play → Playhead moves, chords pulse
- Press Pause → Pauses at current position
- Press Stop → Returns to beginning
- Reach end → Stop (or loop, configurable)
- Chords trigger exactly on their startBeat

### Visual Synchronization
- Playhead position = (current beat / total beats) × canvas width
- Chord pulses when its beat is playing
- Smooth 60fps animation

## Technical Constraints

- Use Tone.Transport for scheduling
- Musical time (beats, measures) not seconds
- Sync visual updates with audio callbacks
- Efficient scheduling (no memory leaks)
- Clean cleanup on stop

## Code Structure

### src/audio/PlaybackSystem.ts

```typescript
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

  constructor() {
    // Set up transport callback
    Tone.Transport.scheduleRepeat((time) => {
      this.currentBeat = Tone.Transport.position as any; // Get current beat
      
      if (this.onPlayheadUpdate) {
        // Schedule visual update on animation frame
        requestAnimationFrame(() => {
          this.onPlayheadUpdate!(this.currentBeat);
        });
      }
    }, '16n'); // Update every 16th note for smooth animation
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
      // Convert startBeat to Tone.js time notation
      const beatTime = `${chord.startBeat}`;

      // Schedule chord attack
      const eventId = Tone.Transport.schedule((time) => {
        // Get SATB voicing
        const notes = [
          chord.voices.bass,
          chord.voices.tenor,
          chord.voices.alto,
          chord.voices.soprano,
        ];

        // Trigger chord in audio engine
        audioEngine.synth.triggerAttack(notes, time);

        // Schedule release
        audioEngine.synth.triggerRelease(
          notes,
          time + Tone.Time(chord.duration, 'beats').toSeconds()
        );

        // Notify visual system
        if (this.onChordTrigger) {
          // Use setTimeout to avoid blocking audio thread
          setTimeout(() => {
            this.onChordTrigger!(chord.id);
          }, 0);
        }
      }, beatTime);

      this.scheduledEvents.push(eventId);
    });

    // Schedule stop at end
    Tone.Transport.schedule((time) => {
      this.stop();
    }, `${this.totalBeats}`);
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
  }

  /**
   * Pause playback (can be resumed)
   */
  pause(): void {
    Tone.Transport.pause();
  }

  /**
   * Stop playback and reset to beginning
   */
  stop(): void {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    this.currentBeat = 0;
    
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
```

### src/hooks/usePlayback.ts

React hook for playback:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { playbackSystem } from '@/audio/PlaybackSystem';
import { useCanvasStore } from '@/store/canvas-store';

export function usePlayback() {
  const { chords } = useCanvasStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [currentChordId, setCurrentChordId] = useState<string | null>(null);

  // Set up callbacks
  useEffect(() => {
    playbackSystem.setPlayheadCallback((beat) => {
      setPlayheadPosition(beat);
    });

    playbackSystem.setChordTriggerCallback((chordId) => {
      setCurrentChordId(chordId);
      
      // Clear after chord duration
      setTimeout(() => {
        setCurrentChordId(null);
      }, 500); // Visual feedback duration
    });
  }, []);

  // Schedule progression when chords change
  useEffect(() => {
    if (chords.length > 0) {
      playbackSystem.scheduleProgression(chords);
    }
  }, [chords]);

  const play = useCallback(() => {
    playbackSystem.play();
    setIsPlaying(true);
  }, []);

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
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  return {
    isPlaying,
    playheadPosition,
    currentChordId,
    play,
    pause,
    stop,
    togglePlay,
  };
}
```

### src/components/Controls/PlayButton.tsx

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { usePlayback } from '@/hooks/usePlayback';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import styles from './PlayButton.module.css';

export const PlayButton: React.FC = () => {
  const { isReady, initialize } = useAudioEngine();
  const { isPlaying, togglePlay } = usePlayback();

  const handleClick = async () => {
    // Initialize audio if needed
    if (!isReady) {
      await initialize();
    }
    
    togglePlay();
  };

  return (
    <motion.button
      className={styles.playButton}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {isPlaying ? (
        // Pause icon
        <svg viewBox="0 0 24 24" width="24" height="24">
          <rect x="6" y="4" width="4" height="16" fill="currentColor" />
          <rect x="14" y="4" width="4" height="16" fill="currentColor" />
        </svg>
      ) : (
        // Play icon
        <svg viewBox="0 0 24 24" width="24" height="24">
          <polygon points="5,3 19,12 5,21" fill="currentColor" />
        </svg>
      )}
    </motion.button>
  );
};
```

### src/components/Controls/PlayButton.module.css

```css
.playButton {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-action);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: background var(--duration-fast) var(--ease-apple-smooth);
}

.playButton:hover {
  background: #3a7bc8;
}

.playButton:active {
  background: #2a5f9e;
}

.playButton:focus-visible {
  outline: 2px solid var(--primary-action);
  outline-offset: 2px;
}
```

### Update src/components/Canvas/Playhead.tsx

Add playback position prop:

```typescript
interface PlayheadProps {
  position: number; // Current beat
  totalBeats: number;
  beatWidth: number;
  zoom: number;
}

export const Playhead: React.FC<PlayheadProps> = ({
  position,
  totalBeats,
  beatWidth,
  zoom,
}) => {
  const x = position * beatWidth * zoom;

  return (
    <motion.div
      className={styles.playhead}
      style={{ left: `${x}px` }}
      animate={{ left: `${x}px` }}
      transition={{ duration: 0.016, ease: 'linear' }} // 60fps
    />
  );
};
```

### Update src/components/Canvas/ChordShape.tsx

Add playing state animation:

```typescript
export const ChordShape: React.FC<ChordShapeProps> = ({
  chord,
  isPlaying, // NEW prop
  // ... other props
}) => {
  const variants = {
    // ... existing variants
    playing: {
      scale: [1.0, 1.12, 1.0],
      filter: 'drop-shadow(0 4px 12px rgba(74, 144, 226, 0.4))',
    },
  };

  const currentState = isPlaying 
    ? 'playing' 
    : isSelected 
    ? 'selected' 
    : isDragging
    ? 'dragging'
    : 'default';

  return (
    <motion.div
      variants={variants}
      animate={currentState}
      transition={{
        duration: isPlaying ? chord.duration : 0.3,
        ease: isPlaying ? [0.45, 0.05, 0.55, 0.95] : [0.4, 0.0, 0.2, 1],
        repeat: isPlaying ? Infinity : 0,
      }}
    >
      {/* ... chord shape SVG */}
    </motion.div>
  );
};
```

### Update Keyboard Shortcuts

Add Space bar for play/pause:

```typescript
// In useKeyboardShortcuts.ts

const { togglePlay } = usePlayback();

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // ... existing shortcuts

    // Space: Play/Pause
    if (e.key === ' ' && !isTyping) {
      e.preventDefault();
      togglePlay();
    }
  };

  // ... rest of hook
}, [togglePlay, /* ... */]);
```

## Quality Criteria

- [ ] PlaybackSystem compiles without errors
- [ ] Play button starts playback
- [ ] Pause button pauses at current position
- [ ] Stop button returns to beginning
- [ ] Chords play at correct times
- [ ] SATB voicing sounds full
- [ ] Playhead moves smoothly (60fps)
- [ ] Chords pulse during playback
- [ ] Space bar toggles play/pause
- [ ] Playback stops at end
- [ ] No audio glitches or clicks
- [ ] Clean stop (all notes release)

## Implementation Notes

1. **Tone.Transport:** Provides musical time (beats, measures) instead of seconds.

2. **Scheduling:** All chords scheduled before playback starts for precise timing.

3. **Visual Sync:** `requestAnimationFrame` ensures smooth 60fps visual updates.

4. **Chord Triggers:** Callbacks notify React when chords should pulse.

5. **Beat Position:** Tone.Transport.position gives current beat for playhead.

## Accessibility

- Play button has aria-label
- Keyboard shortcut (Space) for play/pause
- Visual feedback (icon changes)
- Screen reader announces play/pause state

## Performance

- Efficient scheduling (O(n) where n = chord count)
- No re-renders during playback
- requestAnimationFrame for smooth visuals
- Clean cleanup prevents memory leaks

## Testing Scenarios

1. **Single chord:** Add one chord, press play → Plays for duration, stops
2. **Progression:** Add I-IV-V-I, press play → All chords play in sequence
3. **Pause/Resume:** Play, pause midway, resume → Continues from pause point
4. **Stop:** Play, stop → Returns to beginning
5. **Edit while playing:** Add chord during playback → Reschedules automatically
6. **Space bar:** Press Space → Toggles play/pause

## Next Steps

After playback system is working:
1. Add cathedral reverb (Prompt 004)
2. Create tempo dial control (Prompt 005)
3. Final integration and polish (Prompt 006)

---

**Output Format:** Provide complete PlaybackSystem class, usePlayback hook, PlayButton component, updated Playhead and ChordShape with playback state, and keyboard shortcut integration. Verify chords play with perfect timing and smooth visual synchronization.
