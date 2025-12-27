# Week 3, Day 1 Implementation Plan

## Codebase Analysis Summary

### Current State
- **Framework**: React + TypeScript + Vite
- **State Management**: Zustand (canvas-store.ts)
- **Animation**: Framer Motion
- **Audio Dependencies**: Tone.js (v15.1.22), Tonal.js (v6.4.2) - both installed

### Existing Types (src/types/)
- `audio.ts`: Already defines `AudioEngineState`, `VoiceRange`, `SATBRanges`, `AudioSettings`, `PlaybackState`
- `chord.ts`: Defines `Chord`, `Voices` (SATB), `ChordQuality`, `ScaleDegree`, `MusicalKey`, `Mode`

### Key Constants Already Defined
- `SATB_RANGES` in constants.ts
- `AUDIO_DEFAULTS` in constants.ts

---

## Day 1 Scope

1. **Complete Prompt 001: Audio Engine Setup**
2. **Begin Prompt 002: SATB Voicing** (basic structure)

---

## Files to Create

### 1. `/src/audio/AudioEngine.ts`
Core audio engine class with Tone.js:
- PolySynth with fatsawtooth oscillator (3 detuned voices, spread: 10 cents)
- ADSR envelope: Attack 50ms, Decay 100ms, Sustain 70%, Release 400ms
- Signal chain: Synth -> HighPass (60Hz) -> LowPass (4000Hz) -> Reverb -> Compressor -> MasterGain -> Destination
- Methods: `initialize()`, `playChord()`, `playNote()`, `setMasterVolume()`, `stopAll()`, `dispose()`
- Singleton export

### 2. `/src/audio/VoiceLeading.ts`
SATB voicing module with Tonal.js:
- `VOICE_RANGES` constant (MIDI note numbers)
- `generateSATBVoicing(chord, previousVoicing?)` - main function
- Helpers: `getChordNotes()`, `getChordRoot()`, `getScaleNotes()`, `getChordSymbol()`
- Voice leading: `generateDefaultVoicing()`, `voiceLeadFromPrevious()`, `findBestVoice()`, `fitToRange()`

### 3. `/src/audio/index.ts`
Barrel export file

### 4. `/src/hooks/useAudioEngine.ts`
React hook:
- State: `isReady`, `error`
- Methods: `initialize()`, `playChord()`, `playNote()`, `stopAll()`, volume controls
- Cleanup on unmount

### 5. `/src/components/Audio/AudioInitButton.tsx`
Button component:
- "Enable Audio" when not initialized
- Loading state during init
- "Audio Ready" when ready
- Error state on failure

### 6. `/src/components/Audio/AudioInitButton.module.css`
Styling for button

### 7. `/src/components/Audio/index.ts`
Barrel export

---

## Files to Modify

### 1. `/src/store/canvas-store.ts`
Add:
- `masterVolume: number` (default 0.7)
- `audioReady: boolean`
- `setMasterVolume(volume)` action
- `setAudioReady(ready)` action

### 2. `/src/App.tsx`
- Import and render `AudioInitButton`
- Connect Play button to audio engine

---

## Implementation Order

### Phase 1: Audio Engine Foundation
1. Create `/src/audio/AudioEngine.ts`
2. Create `/src/hooks/useAudioEngine.ts`
3. Create `/src/components/Audio/AudioInitButton.tsx` + CSS
4. Create barrel exports
5. Test: Manual console tests

### Phase 2: SATB Voicing Start
1. Create `/src/audio/VoiceLeading.ts`
2. Implement `generateSATBVoicing()` for first chord
3. Implement `voiceLeadFromPrevious()`
4. Update canvas-store
5. Test: Generate voicings for I-IV-V-I

---

## Signal Chain Diagram

```
PolySynth(fatsawtooth, 3 detuned voices)
  -> HighPassFilter(60Hz, -12dB/oct)
  -> LowPassFilter(4000Hz, -24dB/oct, Q=1.2)
  -> Reverb(decay=2.5s, wet=35%)
  -> Compressor(threshold=-12dB, ratio=3:1)
  -> MasterGain(0.7)
  -> Destination
```

---

## SATB Voice Ranges

| Voice   | Low  | High |
|---------|------|------|
| Soprano | C4   | G5   |
| Alto    | G3   | D5   |
| Tenor   | C3   | G4   |
| Bass    | E2   | C4   |

---

## Testing Checkpoints

**After AudioEngine:**
```typescript
await audioEngine.initialize();
audioEngine.playChord(['C3', 'E3', 'G3', 'C4'], 2);
// Should hear warm choral sound
```

**After VoiceLeading:**
```typescript
const voicing = generateSATBVoicing(cMajorChord);
// Expected: { soprano: 'C5', alto: 'E4', tenor: 'G3', bass: 'C3' }
```
