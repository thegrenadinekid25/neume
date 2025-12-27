# Week 3 Execution Guide - Audio & Playback

**Step-by-step implementation plan for Week 3 prompts**

---

## Overview

Week 3 transforms Neume from a visual tool into a complete musical instrument. You'll add professional audio synthesis, intelligent voicing, synchronized playback, and beautiful reverb.

**Duration:** 3-4 days (13-16 hours total)  
**Prerequisites:** Weeks 1-2 completed  
**Output:** Fully playable chord progression builder with professional audio

---

## Day-by-Day Plan

### Day 1: Audio Foundation (3-4 hours)

**Morning Session (2 hours):**
- ✅ Execute Prompt 001: Audio Engine Setup
- Set up Tone.js PolySynth
- Create signal chain (synth → filters → reverb → compressor → output)
- Test: Play a single chord through speakers
- **Milestone:** `audioEngine.playChord(['C3', 'E3', 'G3', 'C4'], 2)` produces sound

**Afternoon Session (1-2 hours):**
- ✅ Start Prompt 002: SATB Auto-Voicing
- Implement voice range constants
- Create `generateSATBVoicing()` function
- Test: Generate voicing for C major chord
- **Milestone:** Function returns valid SATB notes in proper ranges

**Checkpoint:** Audio engine plays sound, voicing logic exists

---

### Day 2: Voicing & Playback (3-4 hours)

**Morning Session (2 hours):**
- ✅ Complete Prompt 002: SATB Auto-Voicing
- Implement voice leading rules (common tones, stepwise motion)
- Test progression: I-IV-V-I
- Verify smooth voice motion
- **Milestone:** Progression has minimal voice movement, sounds smooth

**Afternoon Session (1-2 hours):**
- ✅ Start Prompt 003: Playback System
- Create PlaybackSystem class
- Implement Tone.Transport scheduling
- Add PlayButton component
- **Milestone:** Click Play → Hear first chord

**Checkpoint:** SATB voicing complete, basic playback works

---

### Day 3: Playback & Reverb (3-4 hours)

**Morning Session (2 hours):**
- ✅ Complete Prompt 003: Playback System
- Implement playhead animation
- Add chord pulse synchronization
- Test: Visual sync with audio
- **Milestone:** Playhead moves smoothly, chords pulse at correct times

**Afternoon Session (1-2 hours):**
- ✅ Execute Prompt 004: Cathedral Reverb
- Download impulse response from OpenAir
- Implement ConvolverNode
- Set up dry/wet mixing
- Test: Reverb tail audible
- **Milestone:** Chords sound spacious with cathedral reverb

**Checkpoint:** Complete playback with visual sync, reverb working

---

### Day 4: Controls & Polish (3-4 hours)

**Morning Session (2 hours):**
- ✅ Execute Prompt 005: Tempo Dial
- Create SVG dial visualization
- Implement drag interaction
- Add click-to-jump
- Test: Tempo changes affect playback immediately
- **Milestone:** Dial feels responsive, tempo range 60-180 BPM works

**Afternoon Session (1-2 hours):**
- ✅ Execute Prompt 006: Integration & Polish
- Integrate all audio components
- Add error handling
- Optimize performance
- Test complete workflow
- **Milestone:** Professional, polished audio experience

**Checkpoint:** Week 3 complete - full audio system operational

---

## Detailed Execution Process

### For Each Prompt:

1. **Read Completely** (5-10 minutes)
   - Review objective and requirements
   - Check dependencies
   - Note implementation tips

2. **Open New Claude Chat** (1 minute)
   - Paste entire prompt
   - No modifications needed

3. **Copy Generated Code** (10-30 minutes)
   - Claude generates complete files
   - Copy each file to correct location
   - Install any new dependencies (rare)

4. **Test Immediately** (5-10 minutes)
   - Run verification tests from prompt
   - Check console for errors
   - Verify functionality

5. **Commit to Git** (2 minutes)
   ```bash
   git add .
   git commit -m "Week 3 Prompt XXX: [Feature Name]"
   ```

6. **Move to Next** (0 minutes)
   - If tests pass, continue
   - If issues, debug before proceeding

---

## Prompt-Specific Guidance

### Prompt 001: Audio Engine Setup

**Before Starting:**
- Verify Tone.js installed: `npm list tone`
- Have headphones ready for testing

**During Execution:**
- Audio context requires user interaction (browser security)
- Test playback AFTER clicking a button

**Verification:**
```typescript
// In browser console after clicking "Enable Audio"
import { audioEngine } from './src/audio/AudioEngine';
audioEngine.playNote('C4', 2);
// Should hear a note
```

**Common Issues:**
- "AudioContext not started" → Call initialize() on button click
- No sound → Check speaker/headphone volume
- Distorted sound → Reduce masterVolume to 0.5

**Time:** 2 hours

---

### Prompt 002: SATB Auto-Voicing

**Before Starting:**
- Verify Tonal.js installed: `npm list tonal`
- Review SATB ranges in spec

**During Execution:**
- Voice leading is complex - trust the algorithm
- Test with simple progressions first (I-IV-V-I)

**Verification:**
```typescript
const voicing = generateSATBVoicing(chordData);
console.log(voicing);
// Should show 4 notes in proper ranges
// Example: { soprano: "C5", alto: "E4", tenor: "G3", bass: "C3" }
```

**Common Issues:**
- Notes out of range → Check fitToRange() logic
- Awkward voice leading → Verify common tone retention
- Missing notes → Check Tonal.js chord parsing

**Time:** 2-3 hours

---

### Prompt 003: Playback System

**Before Starting:**
- Audio engine must be working (Prompt 001)
- SATB voicing must be complete (Prompt 002)

**During Execution:**
- Tone.Transport handles timing - don't use setTimeout
- Visual sync requires requestAnimationFrame

**Verification:**
```typescript
// Add 3 chords, click Play
// Should hear: chord 1 → chord 2 → chord 3 with perfect timing
// Playhead should move smoothly
// Chords should pulse when playing
```

**Common Issues:**
- Timing drift → Use Tone.Transport.schedule(), not manual timing
- Visual lag → Ensure callbacks use requestAnimationFrame
- Playback doesn't stop → Call audioEngine.stopAll()

**Time:** 2-3 hours

---

### Prompt 004: Cathedral Reverb

**Before Starting:**
- Download impulse response FIRST
- From: http://www.openairlib.net/
- File: St. George's Episcopal Church
- Place in: `/public/impulse-responses/stgeorges_church.wav`

**During Execution:**
- File size ~5-10MB (normal)
- Loading is async - handle gracefully
- Fallback to algorithmic reverb if needed

**Verification:**
```bash
# Verify IR file exists
ls -lh public/impulse-responses/stgeorges_church.wav

# Should show file ~5-10MB
```

```typescript
// Play chord, listen for reverb tail
audioEngine.playChord(['C3', 'E3', 'G3', 'C4'], 2);
// Should hear spacious reverb lasting 2-3 seconds after notes end
```

**Common Issues:**
- File not found (404) → Check file path and name
- No reverb effect → Verify ConvolverNode connected in signal chain
- Too wet/dry → Adjust wetGain/dryGain values

**Time:** 1.5 hours

---

### Prompt 005: Tempo Dial

**Before Starting:**
- Playback system must be working (Prompt 003)

**During Execution:**
- SVG math can be tricky - trust the formulas
- Drag interaction uses pointer events (not mouse)

**Verification:**
```typescript
// Drag dial left → tempo decreases
// Drag dial right → tempo increases
// Click arc at different positions → jumps to that tempo
// Arrow keys → fine-tune tempo
```

**Common Issues:**
- Dial doesn't rotate → Check transform origin
- Tempo doesn't update → Verify playbackSystem.setTempo() called
- Range incorrect → Check tempoToRotation() math

**Time:** 2 hours

---

### Prompt 006: Integration & Polish

**Before Starting:**
- ALL previous prompts (001-005) must be working
- Set aside time for thorough testing

**During Execution:**
- This is validation, not new features
- Focus on finding and fixing bugs
- Test edge cases thoroughly

**Verification Checklist:**
- [ ] Audio initializes smoothly
- [ ] Play/pause works perfectly
- [ ] Tempo dial responsive
- [ ] Reverb sounds good (not muddy)
- [ ] Visual sync is perfect
- [ ] No console errors
- [ ] 60fps during playback
- [ ] Works in Chrome, Firefox, Safari

**Common Issues:**
- Performance lag → Profile with DevTools, optimize re-renders
- Audio glitches → Check envelope settings, reduce reverb wet
- Memory leaks → Verify cleanup in dispose() methods

**Time:** 2 hours

---

## Testing Strategy

### After Each Prompt

**Quick Test (2 minutes):**
1. Run dev server: `npm run dev`
2. Open browser
3. Execute verification steps from prompt
4. Check console for errors

**Comprehensive Test (5 minutes):**
1. Test with multiple chords
2. Try edge cases (empty, single chord, 50+ chords)
3. Check audio quality with headphones
4. Verify visual sync
5. Test keyboard shortcuts

### After Completing Day

**Integration Test (10 minutes):**
1. Build complete progression (8-12 chords)
2. Add, move, delete chords
3. Play progression
4. Adjust tempo during playback
5. Toggle reverb amount
6. Verify all features work together

---

## Troubleshooting Guide

### No Sound

**Check:**
1. Audio initialized? (Browser requires user interaction)
2. Volume up? (Master volume, system volume)
3. Headphones connected?
4. Console errors? (Check browser console)
5. Tone.context.state? (Should be "running")

**Fix:**
```typescript
// Force audio context resume
await Tone.start();
console.log(Tone.context.state); // Should be "running"
```

---

### Audio Glitches/Clicks

**Check:**
1. Envelope attack too short? (Increase to 75ms)
2. Too many voices? (Reduce polyphony)
3. Reverb too wet? (Reduce to 20-25%)
4. Sample rate mismatch? (Check 44.1kHz or 48kHz)

**Fix:**
```typescript
// Smoother attack
envelope: { attack: 0.075 } // 75ms instead of 50ms

// Less reverb
this.wetGain.gain.value = 0.25; // 25% instead of 35%
```

---

### Visual Sync Issues

**Check:**
1. Using requestAnimationFrame? (Not setTimeout)
2. Playhead position calculated correctly?
3. Chord pulses triggered on time?
4. Frame rate dropping? (Check performance)

**Fix:**
```typescript
// Ensure smooth visual updates
requestAnimationFrame(() => {
  this.onPlayheadUpdate!(currentBeat);
});
```

---

### TypeScript Errors

**Common:**
1. Missing types: `npm install -D @types/tone`
2. Tone.js any types: Use type assertions
3. Audio node types: Cast to `any` if needed

**Fix:**
```typescript
// Type assertion for Tone.js
this.synth.connect(this.filter as any);
```

---

## Performance Benchmarks

Target metrics for Week 3:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Audio latency | <50ms | Play note, measure delay |
| Visual frame rate | 60fps | Chrome DevTools Performance tab |
| Memory usage | <100MB | Chrome Task Manager |
| Load time | <2s | Lighthouse audit |
| Chord scheduling | <10ms per chord | Console.time() |

**If performance is poor:**
1. Reduce reverb wet amount
2. Limit polyphony to 4 voices
3. Optimize visual updates
4. Profile with Chrome DevTools

---

## Success Checklist

Before moving to Week 4, verify:

### Audio Quality
- [ ] Sound is warm and choral (not harsh or tinny)
- [ ] SATB voicing is balanced (no voice dominates)
- [ ] Voice leading is smooth (no awkward leaps)
- [ ] Reverb is spacious (not muddy or overwhelming)
- [ ] No clicks, pops, or artifacts
- [ ] Volume is appropriate (not too loud/quiet)

### Functionality
- [ ] Play button starts playback
- [ ] Pause button pauses at current position
- [ ] Space bar toggles play/pause
- [ ] Tempo dial changes speed (60-180 BPM)
- [ ] Playhead moves smoothly
- [ ] Chords pulse during playback
- [ ] Playback stops at end

### Technical
- [ ] Zero TypeScript errors
- [ ] No console warnings
- [ ] 60fps during playback
- [ ] Audio context starts properly
- [ ] Impulse response loads successfully
- [ ] Memory doesn't leak

### User Experience
- [ ] Audio initialization is smooth
- [ ] Controls are responsive
- [ ] Visual feedback is clear
- [ ] Error messages are helpful
- [ ] Overall experience feels polished

---

## Next Steps

After Week 3 is complete:

1. **Celebrate!** 🎉 You now have a fully playable instrument
2. **Test extensively** - Play with different progressions
3. **Share with friends** - Get feedback on sound quality
4. **Export MIDI** - Save your favorite progressions
5. **Prepare for Week 4** - AI features coming next!

**Week 4 Preview:** Upload real pieces, extract progressions, get AI explanations

---

## Tips for Success

1. **Use good headphones** - Audio quality matters
2. **Test in quiet environment** - Easier to hear issues
3. **Compare to references** - Listen to real choral music
4. **Take breaks** - Ear fatigue is real
5. **Save your work** - Git commit after each prompt
6. **Ask for help** - If stuck, create new Claude chat with error details
7. **Have fun!** - This is where your tool comes alive 🎵

**You've got this!** Week 3 is where Neume transforms from a visual tool into a living, breathing musical instrument. Enjoy the journey!
