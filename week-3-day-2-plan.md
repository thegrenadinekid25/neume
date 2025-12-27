# Week 3, Day 2 Implementation Plan

## Overview
Complete SATB Voicing integration (Prompt 002) and start Playback System (Prompt 003)

---

## Part 1: Fix Day 1 Issues

### 1.1 SATB Voicing Bug Fix (DONE)
- Fixed: Added default octave (4) to pitch classes from Tonal.js
- `generateSATBVoicing()` now works correctly

### 1.2 Integrate AudioInitButton into App.tsx
- Import AudioInitButton from '@/components/Audio'
- Add to header area, before Play button

---

## Part 2: Complete SATB Voicing Integration

### 2.1 Chord Creation with Voicing
- When creating chords, call `generateSATBVoicing()` to populate voices
- For sequences, pass previousVoicing for smooth voice leading

---

## Part 3: PlaybackSystem Class (New File)

### Create `/src/audio/PlaybackSystem.ts`

```typescript
// Key features:
- Tone.Transport for precise scheduling
- scheduleProgression(chords) - schedules all chords before play
- play(), pause(), stop() methods
- setTempo(bpm) method
- Callbacks for playhead updates and chord triggers
- Clear scheduled events on stop
- Export singleton: playbackSystem
```

Key implementation:
- Use `Tone.Transport.schedule()` for each chord at its startBeat
- Use `Tone.Transport.scheduleRepeat()` for smooth playhead updates (every 16n)
- Access audioEngine.synth for triggering notes
- Convert beats to Tone.js time format

---

## Part 4: usePlayback Hook (New File)

### Create `/src/hooks/usePlayback.ts`

```typescript
// Key features:
- Wraps PlaybackSystem for React
- States: isPlaying, playheadPosition, currentChordId
- Functions: play(), pause(), stop(), togglePlay()
- Auto-schedule progression when chords change
- Sets up callbacks for visual updates
```

---

## Part 5: App.tsx Integration

### 5.1 Add AudioInitButton
- In header, before Play button
- Show audio init status

### 5.2 Replace Visual-Only Playback
Current: requestAnimationFrame drives visual-only playback
New: usePlayback hook drives both audio AND visuals

### 5.3 Connect Play Button
- Use togglePlay() from usePlayback
- Remove manual animate() function

### 5.4 Space Bar Shortcut
- Pass togglePlay to useKeyboardShortcuts via DroppableCanvas

---

## Part 6: Chord Pulse During Playback

### Already Implemented
- ChordShape has "playing" variant with scale animation
- App.tsx has chordsWithPlayState logic

### Wire Up
- currentChordId from usePlayback triggers isPlaying on correct chord

---

## Files to Create

| File | Description |
|------|-------------|
| `/src/audio/PlaybackSystem.ts` | Tone.Transport scheduling |
| `/src/hooks/usePlayback.ts` | React hook for playback |

## Files to Modify

| File | Changes |
|------|---------|
| `/src/App.tsx` | Add AudioInitButton, use usePlayback, integrate voicing |
| `/src/audio/AudioEngine.ts` | Add getSynth() accessor |
| `/src/components/Canvas/DroppableCanvas.tsx` | Pass togglePlay to keyboard shortcuts |

---

## Implementation Order

1. Create PlaybackSystem.ts
2. Add getSynth() to AudioEngine.ts
3. Create usePlayback.ts
4. Update App.tsx - AudioInitButton + usePlayback
5. Update DroppableCanvas.tsx - keyboard shortcut integration
6. Test full playback flow
