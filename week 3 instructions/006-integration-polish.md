# Prompt 006: Integration & Polish

## Objective
Integrate all audio features into a cohesive, polished experience. Add final touches, handle edge cases, optimize performance, and ensure professional quality throughout the audio system.

## Context
All individual audio features are complete (engine, voicing, playback, reverb, tempo). This prompt brings everything together, adds polish, and validates the complete Week 3 system.

**Dependencies:**
- Requires ALL Week 3 Prompts (001-005)
- Requires Weeks 1-2 (visual and interaction systems)

**Related Components:**
- All audio components
- All UI components
- Complete integration

**Next Steps:** Ready for Week 4 (AI features)

## Requirements

### Core Requirements
1. **Complete UI integration** - All controls accessible and logical
2. **Audio initialization flow** - Smooth first-time experience
3. **Error handling** - Graceful failures, helpful messages
4. **Performance optimization** - 60fps with audio playing
5. **Edge case handling** - Empty canvas, single chord, etc.
6. **Visual feedback polish** - Perfect timing, smooth animations
7. **Accessibility audit** - Complete keyboard workflow
8. **Volume management** - Prevent clipping, normalize levels
9. **Cross-browser testing** - Chrome, Firefox, Safari
10. **Final bug fixes** - Squash remaining issues

### Polish Checklist
- [ ] Audio init happens smoothly
- [ ] Play button responsive and clear
- [ ] Tempo dial feels natural
- [ ] Reverb enhances sound (not muddy)
- [ ] Chord pulses synchronized perfectly
- [ ] Playhead moves smoothly
- [ ] No audio glitches or clicks
- [ ] Volume levels balanced
- [ ] Error states handled gracefully
- [ ] Loading states shown
- [ ] Performance is excellent

## Code Structure

### src/components/Audio/AudioSystem.tsx

Unified audio system component:

```typescript
import React, { useEffect, useState } from 'react';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { usePlayback } from '@/hooks/usePlayback';
import { AudioInitButton } from './AudioInitButton';
import { PlayButton } from '@/components/Controls/PlayButton';
import { TempoDial } from '@/components/Controls/TempoDial';
import { ReverbControl } from '@/components/Controls/ReverbControl';
import styles from './AudioSystem.module.css';

export const AudioSystem: React.FC = () => {
  const { isReady, error, initialize } = useAudioEngine();
  const [showInitPrompt, setShowInitPrompt] = useState(true);

  // Auto-hide init prompt once audio is ready
  useEffect(() => {
    if (isReady) {
      setShowInitPrompt(false);
    }
  }, [isReady]);

  if (error) {
    return (
      <div className={styles.error}>
        <h3>Audio Error</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>
          Reload Page
        </button>
      </div>
    );
  }

  if (!isReady && showInitPrompt) {
    return (
      <div className={styles.initPrompt}>
        <h3>Enable Audio</h3>
        <p>Click below to enable audio playback</p>
        <AudioInitButton />
      </div>
    );
  }

  return (
    <div className={styles.audioControls}>
      <PlayButton />
      <TempoDial />
      <ReverbControl />
    </div>
  );
};
```

### src/utils/audioUtils.ts

Audio utility functions:

```typescript
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
```

### src/hooks/useAudioSync.ts

Hook for synchronized audio-visual updates:

```typescript
import { useEffect } from 'react';
import { usePlayback } from './usePlayback';
import { useCanvasStore } from '@/store/canvas-store';

/**
 * Synchronize audio playback with visual updates
 */
export function useAudioSync() {
  const { playheadPosition, currentChordId } = usePlayback();
  const { chords } = useCanvasStore();

  // Update visual state based on audio
  useEffect(() => {
    // Could trigger additional visual effects here
    // e.g., highlight current measure, update waveform, etc.
  }, [playheadPosition, currentChordId]);

  // Calculate derived values
  const totalBeats = chords.length > 0
    ? Math.max(...chords.map(c => c.startBeat + c.duration))
    : 0;

  const progress = totalBeats > 0 ? playheadPosition / totalBeats : 0;

  return {
    playheadPosition,
    currentChordId,
    totalBeats,
    progress,
  };
}
```

### Update src/App.tsx

Final integrated App:

```typescript
import React, { useEffect } from 'react';
import { Header } from '@/components/Layout/Header';
import { DroppableCanvas } from '@/components/Canvas/DroppableCanvas';
import { BottomControls } from '@/components/Layout/BottomControls';
import { AudioSystem } from '@/components/Audio/AudioSystem';
import { useCanvasStore } from '@/store/canvas-store';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAudioSync } from '@/hooks/useAudioSync';
import { normalizeVolume } from '@/utils/audioUtils';
import { audioEngine } from '@/audio/AudioEngine';
import styles from './App.module.css';

function App() {
  const { chords, setMasterVolume } = useCanvasStore();
  const { playheadPosition, currentChordId } = useAudioSync();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Auto-adjust volume based on chord count
  useEffect(() => {
    const normalizedVolume = normalizeVolume(chords.length);
    setMasterVolume(normalizedVolume);
  }, [chords.length, setMasterVolume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioEngine.dispose();
    };
  }, []);

  return (
    <div className={styles.app}>
      {/* Header with controls */}
      <Header />

      {/* Main canvas area */}
      <main className={styles.main}>
        <DroppableCanvas
          playheadPosition={playheadPosition}
          currentChordId={currentChordId}
        />
      </main>

      {/* Bottom controls */}
      <BottomControls>
        <AudioSystem />
      </BottomControls>
    </div>
  );
}

export default App;
```

### Error Boundary for Audio

```typescript
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AudioErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Audio error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Audio System Error</h2>
          <p>The audio system encountered an error.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Performance Optimization Checklist

### Audio Performance
- [ ] Synth polyphony limited (8 voices max)
- [ ] Reverb convolution optimized
- [ ] No audio processing when not playing
- [ ] Efficient scheduling (Tone.Transport)
- [ ] Clean disposal prevents memory leaks

### Visual Performance
- [ ] 60fps maintained during playback
- [ ] Chord pulse animations GPU-accelerated
- [ ] Playhead updates throttled (16ms)
- [ ] No unnecessary re-renders
- [ ] Memoized expensive calculations

### Memory Management
- [ ] Audio resources disposed on unmount
- [ ] Event listeners cleaned up
- [ ] Impulse response cached (not reloaded)
- [ ] No memory leaks in Transport callbacks

## Edge Case Handling

### Empty Canvas
- Play button disabled when no chords
- Graceful message: "Add chords to play"

### Single Chord
- Plays single chord, then stops
- No visual glitches

### Very Long Progression (50+ chords)
- Smooth playback
- Normalized volume
- Efficient scheduling

### Rapid Tempo Changes
- No audio artifacts
- Smooth transitions

### Browser Tab Inactive
- Audio continues (or pauses, user preference)
- Visual updates when tab becomes active

## Quality Criteria

- [ ] All audio features integrated
- [ ] Smooth user experience
- [ ] No errors in console
- [ ] 60fps with audio playing
- [ ] Audio sounds professional
- [ ] Visual sync is perfect
- [ ] Edge cases handled
- [ ] Cross-browser compatible
- [ ] Accessible (keyboard + screen reader)
- [ ] Error messages helpful

## Manual Testing Checklist

### Audio Initialization
- [ ] First click enables audio
- [ ] Clear feedback audio is ready
- [ ] Error states handled

### Playback
- [ ] Play button works
- [ ] Pause works (resumes from same position)
- [ ] Stop returns to beginning
- [ ] Playback loops or stops at end
- [ ] Space bar toggles play/pause

### Visual Sync
- [ ] Playhead position accurate
- [ ] Chord pulses at correct times
- [ ] Smooth 60fps animation
- [ ] No visual lag or stutter

### Audio Quality
- [ ] SATB voicing sounds full
- [ ] Reverb is spacious, not muddy
- [ ] No clicks or pops
- [ ] Volume balanced
- [ ] Tempo changes work smoothly

### Controls
- [ ] Tempo dial responsive
- [ ] Reverb control works
- [ ] Volume appropriate
- [ ] All keyboard shortcuts functional

### Edge Cases
- [ ] Empty canvas handled
- [ ] Single chord handled
- [ ] 50+ chords handled
- [ ] Rapid edits during playback
- [ ] Browser tab switching

## Browser Compatibility

Test in:
- [ ] Chrome 90+ (primary target)
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+

Common issues:
- **Safari:** May need audio context resume on every interaction
- **Firefox:** Check reverb performance
- **Mobile:** Test responsiveness (future enhancement)

## Accessibility Audit

- [ ] All controls keyboard accessible
- [ ] Tab order logical
- [ ] Focus indicators visible
- [ ] Screen reader announces states
- [ ] ARIA labels present
- [ ] High contrast mode works
- [ ] No keyboard traps

## Final Polish Items

1. **Loading States**
   - Show spinner while IR loads
   - Disable play until audio ready

2. **Error Messages**
   - Clear, actionable error text
   - Fallback for missing IR

3. **Visual Feedback**
   - Pulse on play start
   - Color change during playback
   - Smooth transitions everywhere

4. **Sound Design**
   - Final EQ tweaks
   - Reverb fine-tuning
   - Volume balancing

5. **Performance**
   - Profile with Chrome DevTools
   - Optimize hot paths
   - Reduce re-renders

## Success Metrics

By end of Week 3, you should have:

### Functional
- âœ… Audio plays through speakers
- âœ… SATB voicing sounds professional
- âœ… Playback synchronized with visuals
- âœ… Tempo control responsive
- âœ… Reverb enhances sound quality

### Performance
- âœ… 60fps during playback
- âœ… No audio latency (<50ms)
- âœ… Smooth visual animations
- âœ… Memory usage stable

### Quality
- âœ… Professional sound quality
- âœ… Perfect visual sync
- âœ… No bugs or glitches
- âœ… Polished user experience

---

**Output Format:** Provide complete integrated AudioSystem component, utility functions, error handling, performance optimizations, and comprehensive testing results. Verify entire Week 3 audio system works flawlessly end-to-end.
