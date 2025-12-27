# Week 3 Success Criteria - Audio & Playback

**Measurable standards to verify Week 3 completion before proceeding to Week 4**

---

## Overview

Week 3 is complete when Neume produces professional-quality choral sound with perfect timing and visual synchronization. Every criterion below must pass before moving to Week 4.

**Philosophy:** If it doesn't sound professional, it's not done.

---

## Core Success Criteria

### 1. Audio Quality ⭐ CRITICAL

#### Sound Character
- [ ] **Warm and choral** - Not harsh, tinny, or synthetic
- [ ] **Spacious** - Reverb creates cathedral-like ambience
- [ ] **Balanced** - All four voices (SATB) audible and proportionate
- [ ] **Clean** - No clicks, pops, distortion, or artifacts
- [ ] **Professional** - Rivals Sibelius/Finale playback quality

**Test:**
```
1. Create I-IV-V-I progression in C major
2. Click Play
3. Close eyes and listen
4. Ask: "Would I use this sound in a presentation?"
```

**Pass:** Sounds like a professional music notation program  
**Fail:** Sounds obviously synthetic or cheap

---

#### SATB Voicing
- [ ] **Four distinct voices** - Can identify soprano, alto, tenor, bass
- [ ] **Proper ranges** - No voice goes outside its range
- [ ] **Balanced volume** - No single voice dominates
- [ ] **Rich harmony** - Full, complete chords

**Test:**
```typescript
const chord = { scaleDegree: 1, quality: 'major', key: 'C', mode: 'major' };
const voicing = generateSATBVoicing(chord);
console.log(voicing);

Expected:
{
  soprano: "C5" or "E5" or "G5" (C4-G5 range)
  alto: "E4" or "G4" or "C5" (G3-D5 range)
  tenor: "G3" or "C4" or "E4" (C3-G4 range)
  bass: "C3" (always root) (E2-C4 range)
}
```

**Pass:** All voices in proper MIDI ranges, root in bass  
**Fail:** Any voice out of range, missing voices, unbalanced

---

#### Voice Leading
- [ ] **Smooth motion** - No awkward leaps between chords
- [ ] **Common tones retained** - Same note stays in same voice when possible
- [ ] **Stepwise preference** - Voices move by 2nd or 3rd when possible
- [ ] **No parallel 5ths/8ves** - Classical voice leading rules followed
- [ ] **Contrary motion** - Bass and soprano often move in opposite directions

**Test:**
```
Progression: C major → F major → G major → C major
             (I → IV → V → I)

Expected voice motion:
Soprano: C5 → C5 → B4 → C5 (common tone C, step down to B, step up)
Alto:    E4 → F4 → D4 → E4 (step up, step down, step up)
Tenor:   G3 → A3 → G3 → G3 (step up, step down, common tone)
Bass:    C3 → F2 → G2 → C3 (roots)

Maximum motion: 2-3 semitones per voice (stepwise)
```

**Pass:** Progression sounds smooth, no jarring leaps  
**Fail:** Awkward jumps, parallel 5ths/8ves audible

---

### 2. Playback System ⭐ CRITICAL

#### Timing Accuracy
- [ ] **Perfect sync** - Chords play exactly when expected
- [ ] **No drift** - Long progressions don't speed up/slow down
- [ ] **Responsive** - Play/pause immediate (no lag)
- [ ] **Tempo accurate** - 120 BPM plays exactly 2 beats/second

**Test:**
```
1. Set tempo to 60 BPM
2. Create 4 whole-note chords (4 beats each)
3. Start playback with stopwatch
4. Measure: Should take exactly 16 seconds (4 chords × 4 beats ÷ 60 BPM × 60 sec)
```

**Pass:** Timing within ±100ms over 16 seconds  
**Fail:** Noticeable drift, chords early/late

---

#### Visual Synchronization
- [ ] **Playhead smooth** - Moves continuously, no jumps
- [ ] **Chord pulses accurate** - Pulses start when audio starts
- [ ] **Frame rate stable** - 60fps during playback
- [ ] **No lag** - Visual matches audio (not ahead/behind)

**Test:**
```
1. Create 8-chord progression
2. Click Play
3. Watch playhead and chord pulses
4. Verify visual sync with audio
```

**Pass:** Playhead arrives at chord exactly when audio plays, pulses synchronized  
**Fail:** Visual ahead/behind audio, choppy animation

---

#### Controls Responsiveness
- [ ] **Play button** - Starts immediately (<100ms)
- [ ] **Pause button** - Pauses at current position
- [ ] **Stop button** - Resets to beginning
- [ ] **Space bar** - Toggles play/pause
- [ ] **Tempo change** - Updates immediately during playback

**Test:**
```
1. Start playback
2. Change tempo from 120 → 80 BPM
3. Verify: Playback immediately slows (no restart needed)
```

**Pass:** All controls responsive, tempo changes live  
**Fail:** Lag, need to restart, controls unresponsive

---

### 3. Cathedral Reverb ⭐ HIGH PRIORITY

#### Reverb Quality
- [ ] **Spacious** - Creates sense of large space (cathedral-like)
- [ ] **Not muddy** - Chords remain clear and distinct
- [ ] **Tail length** - Reverb decays over 2-3 seconds
- [ ] **Natural** - Sounds like real acoustic space
- [ ] **Balanced** - Enhances without overwhelming

**Test:**
```
1. Play single C major chord (whole note)
2. Listen for reverb tail after chord ends
3. Reverb should fade naturally over 2-3 seconds
4. Chord should remain clear (not washed out)
```

**Pass:** Beautiful, spacious reverb that enhances clarity  
**Fail:** Muddy sound, too wet, no tail, or too dry

---

#### Wet/Dry Balance
- [ ] **Default 35% wet** - Good starting balance
- [ ] **Dry path clear** - Direct sound present
- [ ] **Wet path audible** - Reverb clearly contributes
- [ ] **No phase issues** - No weird cancellation

**Test:**
```typescript
// Verify signal routing
console.log(audioEngine.wetGain.gain.value); // Should be ~0.35
console.log(audioEngine.dryGain.gain.value); // Should be ~0.65
```

**Pass:** Balanced sound, both paths audible  
**Fail:** Too wet (muddy) or too dry (no space)

---

### 4. Tempo Dial ⭐ MEDIUM PRIORITY

#### Visual Design
- [ ] **Arc visible** - Clear 180° semicircle
- [ ] **Needle rotates** - Points to current tempo
- [ ] **Tick marks** - Every 10 BPM labeled
- [ ] **Current tempo** - Large number in center
- [ ] **Hand-drawn aesthetic** - Matches overall design

**Test:**
```
Visual inspection:
- Arc from 60 (left) to 180 (right)
- Needle rotates smoothly
- Tempo number updates
- Tick marks at 60, 70, 80... 180
```

**Pass:** Beautiful, intuitive dial matching spec  
**Fail:** Ugly, confusing, doesn't match design

---

#### Interaction
- [ ] **Drag to rotate** - Smooth, responsive
- [ ] **Click to jump** - Clicking arc jumps to that tempo
- [ ] **Keyboard control** - Arrow keys adjust ±1 BPM
- [ ] **Easing** - Smooth deceleration when released
- [ ] **Range enforced** - Can't go below 60 or above 180

**Test:**
```
1. Drag needle right → tempo increases
2. Drag needle left → tempo decreases
3. Click arc at 90° → jumps to 120 BPM
4. Press → key 5 times → tempo increases by 5
5. Try to drag below 60 → stops at 60
```

**Pass:** All interactions smooth and intuitive  
**Fail:** Jerky, unresponsive, can break range

---

### 5. Integration & Polish ⭐ CRITICAL

#### Error Handling
- [ ] **Audio context** - Clear message if not initialized
- [ ] **IR loading** - Graceful fallback if reverb IR fails
- [ ] **Invalid voicing** - Handles edge cases (aug, dim chords)
- [ ] **Empty canvas** - Doesn't crash when no chords
- [ ] **User-friendly errors** - Helpful messages, not technical jargon

**Test:**
```
1. Load page, try to play before clicking "Enable Audio"
   → Should show: "Click to enable audio"
   
2. Delete IR file, reload
   → Should fall back to algorithmic reverb
   
3. Play with no chords on canvas
   → Should show: "Add chords to hear playback"
```

**Pass:** Handles all errors gracefully  
**Fail:** Console errors, crashes, cryptic messages

---

#### Performance
- [ ] **60fps** - Maintains smooth frame rate during playback
- [ ] **Low latency** - Audio starts within 50ms of click
- [ ] **No memory leaks** - Memory stable over extended use
- [ ] **100+ chords** - Handles large progressions without lag

**Test:**
```
1. Open Chrome DevTools → Performance tab
2. Start recording
3. Play progression with 50+ chords
4. Check: FPS counter should stay near 60
5. Check: Memory usage shouldn't spike
```

**Pass:** Smooth performance with no degradation  
**Fail:** Lag, stutter, memory growth, low FPS

---

#### Cross-Browser
- [ ] **Chrome 90+** - Full functionality
- [ ] **Firefox 88+** - Full functionality
- [ ] **Safari 14+** - Full functionality (may need AudioContext workaround)
- [ ] **Edge 90+** - Full functionality

**Test:**
```
Test same progression in each browser:
1. Audio plays correctly
2. Visual sync works
3. Controls responsive
4. No console errors
```

**Pass:** Works in all supported browsers  
**Fail:** Broken in any browser

---

## Quantitative Benchmarks

### Audio Metrics
| Metric | Target | How to Measure |
|--------|--------|----------------|
| Latency | <50ms | Click play → hear sound |
| Timing accuracy | ±50ms per beat | 60 BPM = 1 beat/sec exactly |
| Reverb decay | 2-3 seconds | Tail after note ends |
| Sample rate | 44.1 or 48 kHz | `Tone.context.sampleRate` |

### Performance Metrics
| Metric | Target | How to Measure |
|--------|--------|----------------|
| Frame rate | 60fps | Chrome DevTools FPS counter |
| Memory usage | <100MB | Chrome Task Manager |
| Load time | <2 seconds | Lighthouse audit |
| Bundle size | <500KB (gzipped) | Build output |

### User Experience Metrics
| Metric | Target | How to Measure |
|--------|--------|----------------|
| Control response | <100ms | Click → action starts |
| Audio initialization | <500ms | Button → audio ready |
| Chord scheduling | <10ms per chord | Console.time() |
| Tempo change | Immediate | No playback restart |

---

## Edge Case Testing

### Test Cases (All Must Pass)

#### Empty Canvas
- [ ] Play button disabled or shows message
- [ ] No console errors
- [ ] No crashes

#### Single Chord
- [ ] Plays correctly with reverb tail
- [ ] Playhead moves across chord
- [ ] Stops at end

#### Large Progression (100+ chords)
- [ ] Loads without lag
- [ ] Plays without stuttering
- [ ] Visual sync maintained
- [ ] Memory stable

#### Rapid Tempo Changes
- [ ] Updating tempo while playing works
- [ ] No audio glitches
- [ ] Visual sync maintained
- [ ] Transport handles changes

#### Extreme Tempos
- [ ] 60 BPM: Slow, but steady
- [ ] 180 BPM: Fast, but accurate
- [ ] No drift at extremes

#### Complex Voicings
- [ ] Diminished chords: All voices in range
- [ ] Augmented chords: Handled correctly
- [ ] Extended chords (7ths, 9ths): All notes present
- [ ] Edge of ranges: Doesn't exceed limits

---

## Accessibility Testing

### Keyboard-Only Workflow
- [ ] Space bar: Play/pause
- [ ] Arrow keys: Adjust tempo
- [ ] Tab navigation: All controls accessible
- [ ] Focus indicators: Visible on all controls

### Screen Reader
- [ ] Audio controls announced
- [ ] Tempo value announced
- [ ] Playback state announced
- [ ] Error messages read

### Visual
- [ ] Color contrast: 4.5:1 minimum
- [ ] Focus indicators: Visible and clear
- [ ] No color-only information

---

## User Acceptance Tests

### The "First Impression" Test
```
1. Fresh user opens app
2. Adds 4 chords (I-IV-V-I)
3. Clicks Play
4. Listens

Question: "Does this sound professional?"
```
**Pass:** User impressed, wants to use tool  
**Fail:** User disappointed, sounds cheap

---

### The "Musician" Test
```
1. Give to choir director or composer
2. Ask them to create a progression
3. Listen to their reaction

Question: "Would you use this in your workflow?"
```
**Pass:** Musician excited, sees potential  
**Fail:** Musician dismissive, too basic

---

### The "5-Minute Demo" Test
```
1. Show app to someone unfamiliar
2. Give them 5 minutes to explore
3. No guidance or help

Can they:
- [ ] Add chords
- [ ] Play progression
- [ ] Adjust tempo
- [ ] Understand what they're hearing
```
**Pass:** User successful, enjoys experience  
**Fail:** User confused, frustrated

---

## Regression Testing

Before declaring Week 3 complete, verify Week 1-2 features still work:

### Week 1 Features
- [ ] Canvas renders
- [ ] Grid visible
- [ ] Shapes display correctly
- [ ] Colors accurate
- [ ] Watercolor background

### Week 2 Features
- [ ] Right-click menu
- [ ] Drag-and-drop
- [ ] Selection system
- [ ] Connection lines
- [ ] Delete chords
- [ ] Undo/redo
- [ ] Keyboard shortcuts

**Critical:** Adding audio shouldn't break visual features

---

## Sign-Off Checklist

Before moving to Week 4, confirm:

### Technical
- [ ] Zero TypeScript errors
- [ ] Zero console errors
- [ ] Zero console warnings
- [ ] All tests pass
- [ ] Performance targets met
- [ ] Cross-browser compatible

### Functional
- [ ] Audio plays professionally
- [ ] SATB voicing sounds full
- [ ] Playback timing perfect
- [ ] Reverb enhances sound
- [ ] Tempo control responsive
- [ ] All features integrated

### User Experience
- [ ] Intuitive controls
- [ ] Clear feedback
- [ ] Error handling graceful
- [ ] Professional polish
- [ ] Delightful to use

### Documentation
- [ ] Code well-commented
- [ ] README updated
- [ ] Known issues documented
- [ ] Setup instructions clear

---

## Failure Recovery

### If Week 3 Doesn't Meet Criteria

**Don't proceed to Week 4.** Instead:

1. **Identify specific failures** - Which criteria failed?
2. **Prioritize fixes** - Critical > High > Medium
3. **Debug systematically** - One issue at a time
4. **Test after each fix** - Verify improvement
5. **Iterate until passing** - Don't rush

**Remember:** Week 3 audio quality determines user retention. Take time to get it right.

---

## Success Definition

**Week 3 is successfully complete when:**

1. ✅ All ⭐ CRITICAL criteria pass
2. ✅ 90%+ of other criteria pass
3. ✅ No major bugs or regressions
4. ✅ Professional audio quality
5. ✅ You're proud to demo it

**If yes to all above: Proceed to Week 4! 🎉**

**If no to any: Keep iterating. Quality matters more than speed.**

---

## Next Week Preview

**Week 4: AI Features Part 1**
- Upload pieces (YouTube, audio)
- Extract chord progressions
- "Why This?" explanations
- Educational AI assistant

**Dependency:** Week 3 audio must work perfectly for analyzed pieces to play correctly.

---

**This is where your tool becomes magical. Don't cut corners on audio quality!** 🎵✨
