# Week 3 Dependency Graph - Audio & Playback

**Task dependencies and critical path for Week 3 implementation**

---

## Visual Dependency Graph

```
001 (Audio Engine)
 ↓ BLOCKS
002 (SATB Voicing)
 ↓ BLOCKS
003 (Playback System)
 ↓ BLOCKS
 ├─→ 004 (Cathedral Reverb) ────┐
 │                               ├─→ 006 (Integration & Polish)
 └─→ 005 (Tempo Dial) ──────────┘
```

**Legend:**
- `↓ BLOCKS` - Must complete before next step
- `→` - Can run in parallel
- `┐ ┘` - Multiple paths converge

---

## Critical Path

**Longest dependency chain (determines minimum timeline):**

```
001 → 002 → 003 → 004 → 006
```

**Total Time (Serial):** 2h + 2.5h + 2.5h + 1.5h + 2h = **10.5 hours**

**With Parallel Execution:**
```
001 → 002 → 003 → [004 || 005] → 006
```

**Total Time (Parallel):** 2h + 2.5h + 2.5h + 2h + 2h = **11 hours**  
(Parallel saves minimal time since 004 and 005 have similar durations)

---

## Detailed Dependencies

### 001: Audio Engine Setup

**Depends On:**
- ✅ Week 1 complete (React project setup)
- ✅ Week 2 complete (interaction system)
- ✅ Tone.js installed (from Week 1)

**Blocks:**
- 002 (SATB Voicing) - Needs audio engine to play voiced chords
- 003 (Playback System) - Needs audio engine to schedule playback
- 004 (Cathedral Reverb) - Needs audio engine signal chain
- 005 (Tempo Dial) - Needs playback system (which needs audio engine)
- 006 (Integration) - Needs all features

**Can Run in Parallel With:**
- Nothing - this is the foundation

**Estimated Time:** 2 hours

**Risk Level:** 🟢 LOW
- Well-documented Tone.js API
- Straightforward implementation
- Clear verification tests

---

### 002: SATB Auto-Voicing

**Depends On:**
- ✅ 001 (Audio Engine) - Must have audio to test voicings
- ✅ Tonal.js installed (from Week 1)

**Blocks:**
- 003 (Playback System) - Playback needs valid SATB voicings
- 006 (Integration) - Needs complete voicing system

**Can Run in Parallel With:**
- Nothing - sequential dependency on 001

**Estimated Time:** 2-3 hours

**Risk Level:** 🟡 MEDIUM
- Voice leading logic is complex
- Tonal.js chord parsing can be tricky
- Edge cases (diminished, augmented chords)

**Mitigation:**
- Test with simple progressions first (I-IV-V-I)
- Verify ranges strictly enforced
- Start with basic voice leading, refine later

---

### 003: Playback System

**Depends On:**
- ✅ 001 (Audio Engine) - Must have audio playback
- ✅ 002 (SATB Voicing) - Must have valid voicings to play
- ✅ Week 2 Prompt 003 (ChordShape with playing state)

**Blocks:**
- 004 (Cathedral Reverb) - Reverb integrates into playback
- 005 (Tempo Dial) - Tempo control affects playback
- 006 (Integration) - Final system integration

**Can Run in Parallel With:**
- Nothing - both 004 and 005 depend on this

**Estimated Time:** 2-3 hours

**Risk Level:** 🟡 MEDIUM
- Tone.Transport scheduling can be tricky
- Visual sync requires careful timing
- Callback management complex

**Mitigation:**
- Use Tone.Transport (not setTimeout)
- Test with single chord first
- Verify visual sync separately from audio

---

### 004: Cathedral Reverb

**Depends On:**
- ✅ 001 (Audio Engine) - Must have signal chain
- ✅ 003 (Playback System) - Test reverb during playback
- 📥 Impulse response file (external download)

**Blocks:**
- 006 (Integration) - Reverb is part of complete system

**Can Run in Parallel With:**
- 005 (Tempo Dial) - Independent features after 003

**Estimated Time:** 1.5 hours

**Risk Level:** 🟢 LOW
- ConvolverNode is straightforward
- Impulse response loading is simple
- Good fallback options

**External Dependency:**
- Must download IR file from OpenAir
- URL: http://www.openairlib.net/
- File: stgeorges_church.wav (~5-10MB)

---

### 005: Tempo Dial

**Depends On:**
- ✅ 003 (Playback System) - Tempo affects playback speed
- ✅ Week 2 (interaction patterns)

**Blocks:**
- 006 (Integration) - Tempo dial is part of final UI

**Can Run in Parallel With:**
- 004 (Cathedral Reverb) - Independent features after 003

**Estimated Time:** 2 hours

**Risk Level:** 🟢 LOW
- SVG math is provided
- Framer Motion handles animation
- Clear interaction patterns

---

### 006: Integration & Polish

**Depends On:**
- ✅ 001 (Audio Engine) - Complete
- ✅ 002 (SATB Voicing) - Complete
- ✅ 003 (Playback System) - Complete
- ✅ 004 (Cathedral Reverb) - Complete
- ✅ 005 (Tempo Dial) - Complete
- ✅ ALL Week 1 & 2 prompts - Complete

**Blocks:**
- Nothing - this is the final step

**Can Run in Parallel With:**
- Nothing - requires all features complete

**Estimated Time:** 2 hours

**Risk Level:** 🟡 MEDIUM
- Integration bugs can be tricky
- Edge cases may emerge
- Performance optimization needed

**Focus Areas:**
- Error handling
- Edge cases (empty canvas, single chord)
- Performance validation
- Cross-browser testing

---

## Parallel Execution Opportunities

### After 003 Completes

```
                    ┌─→ 004 (Reverb) [1.5h] ─┐
003 (Playback) ────┤                          ├─→ 006 (Integration)
                    └─→ 005 (Tempo)  [2h]   ─┘
```

**Requirements:**
- Both 004 and 005 can start once 003 is working
- They don't interfere with each other
- Both integrate into the same system

**Potential Time Savings:**
- If both run parallel: Max(1.5h, 2h) = 2h
- If serial: 1.5h + 2h = 3.5h
- **Savings: 1.5 hours**

**Recommended Approach:**
- **For first-time execution:** Do serially (less cognitive load)
- **For experienced developers:** Run parallel (faster completion)

---

## Risk Matrix

| Prompt | Complexity | Dependencies | External Deps | Overall Risk |
|--------|-----------|--------------|---------------|--------------|
| 001 | Medium | Low | None | 🟢 LOW |
| 002 | High | Medium | None | 🟡 MEDIUM |
| 003 | High | High | None | 🟡 MEDIUM |
| 004 | Low | Medium | IR file | 🟢 LOW |
| 005 | Medium | Low | None | 🟢 LOW |
| 006 | Medium | Very High | All above | 🟡 MEDIUM |

**Risk Levels:**
- 🟢 LOW - Straightforward, well-documented, low chance of issues
- 🟡 MEDIUM - Some complexity, potential for bugs, needs testing
- 🔴 HIGH - Complex, many dependencies, high chance of iteration

---

## Recovery Strategies

### If 001 (Audio Engine) Fails

**Problem:** Audio doesn't initialize or play
**Impact:** BLOCKS entire Week 3
**Recovery:**
1. Check browser console for specific error
2. Verify Tone.js installed: `npm list tone`
3. Test in Chrome first (best Web Audio support)
4. Try basic Tone.js example from docs
5. If still stuck: Create new Claude chat with error details

**Time Lost:** 30-60 minutes typically

---

### If 002 (SATB Voicing) Fails

**Problem:** Voice leading sounds awkward or notes out of range
**Impact:** BLOCKS playback quality
**Recovery:**
1. Test with simple C major chord first
2. Verify Tonal.js parsing chords correctly
3. Check ranges: Log each voice MIDI number
4. Simplify voice leading (remove complex rules initially)
5. Compare output to expected voicings

**Time Lost:** 30-90 minutes typically

---

### If 003 (Playback System) Fails

**Problem:** Timing is off or visual sync broken
**Impact:** BLOCKS 004, 005, 006
**Recovery:**
1. Separate audio from visual - test each independently
2. Use Tone.Transport.schedule() not setTimeout()
3. Verify callbacks fire at correct times (add console.log)
4. Test with single chord before progression
5. Check requestAnimationFrame for visual updates

**Time Lost:** 1-2 hours typically

---

### If 004 (Cathedral Reverb) Fails

**Problem:** IR doesn't load or reverb doesn't work
**Impact:** Blocks integration, but not critical path
**Recovery:**
1. Verify IR file exists: `ls public/impulse-responses/`
2. Check network tab in DevTools for 404
3. Use fallback Tone.Reverb (already in code)
4. Test with simple algorithmic reverb first

**Time Lost:** 15-30 minutes typically

**Note:** Reverb failure is NOT critical - can skip and use fallback

---

### If 005 (Tempo Dial) Fails

**Problem:** Dial doesn't rotate or tempo doesn't update
**Impact:** Blocks final integration
**Recovery:**
1. Test SVG separately from interaction
2. Verify transform origin is correct
3. Check playbackSystem.setTempo() is called
4. Simplify to buttons (60, 90, 120, 150 BPM) temporarily
5. Return to dial implementation later

**Time Lost:** 30-60 minutes typically

---

## Bottlenecks

### Primary Bottleneck: Prompt 003 (Playback System)

**Why:**
- Most complex prompt in Week 3
- Blocks both 004 and 005
- Requires careful timing coordination
- Visual sync is tricky

**Mitigation:**
- Budget extra time (2.5-3 hours)
- Test audio and visual separately first
- Use provided code examples exactly
- Don't optimize prematurely

---

### Secondary Bottleneck: Prompt 002 (SATB Voicing)

**Why:**
- Voice leading logic is complex
- Tonal.js integration can be tricky
- Edge cases with chord types

**Mitigation:**
- Start with simple I-IV-V-I progression
- Test each voice range independently
- Use analyzer function to debug voice leading
- Accept imperfect voice leading initially

---

## Timeline Estimates

### Conservative (Serial Execution)

```
Day 1: 001 (2h) + 002 (2.5h) = 4.5 hours
Day 2: 003 (3h) + 004 (1.5h) = 4.5 hours
Day 3: 005 (2h) + 006 (2h) = 4 hours

Total: 13 hours over 3 days
```

### Optimistic (Partial Parallel)

```
Day 1: 001 (2h) + 002 (2.5h) = 4.5 hours
Day 2: 003 (2.5h) + [004 || 005] (2h) = 4.5 hours
Day 3: 006 (2h) = 2 hours

Total: 11 hours over 3 days
```

### Realistic (With Breaks & Debugging)

```
Day 1: 001 (2.5h) + 002 (3h) = 5.5 hours
Day 2: 003 (3.5h) + 004 (1.5h) = 5 hours
Day 3: 005 (2.5h) = 2.5 hours
Day 4: 006 (2.5h) = 2.5 hours

Total: 15.5 hours over 4 days
```

**Recommended:** Plan for 4 days at 3-4 hours/day

---

## Quality Gates

Check these after each prompt before proceeding:

### After 001 (Audio Engine)
- [ ] Audio plays through speakers
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Volume control works

### After 002 (SATB Voicing)
- [ ] All voices in range
- [ ] Voice leading sounds smooth
- [ ] Works with major, minor, diminished chords
- [ ] No parallel 5ths/8ves (check analyzer)

### After 003 (Playback System)
- [ ] Chords play at correct times
- [ ] Playhead moves smoothly
- [ ] Visual sync is accurate
- [ ] Play/pause/stop work

### After 004 (Cathedral Reverb)
- [ ] Reverb tail audible
- [ ] Sound is spacious (not muddy)
- [ ] Wet/dry balance good
- [ ] No audio artifacts

### After 005 (Tempo Dial)
- [ ] Dial rotates smoothly
- [ ] Tempo updates immediately
- [ ] Range 60-180 BPM enforced
- [ ] Keyboard control works

### After 006 (Integration)
- [ ] All features work together
- [ ] No console errors
- [ ] 60fps during playback
- [ ] Professional user experience

---

## Success Metrics

Week 3 is complete when:

1. **Audio plays** - Chords sound through speakers/headphones
2. **SATB sounds full** - 4-part harmony is balanced
3. **Playback works** - Perfect timing, smooth visuals
4. **Reverb enhances** - Spacious without being muddy
5. **Tempo controls** - Responsive dial (60-180 BPM)
6. **Integration solid** - All features polished and professional

**If any metric fails:** Debug before moving to Week 4

---

## Next Steps

After completing Week 3:

1. ✅ Test extensively with various progressions
2. ✅ Get feedback on sound quality
3. ✅ Export MIDI of favorite progressions
4. 🚀 Prepare for Week 4: AI Features

**Week 4 Preview:**
- Upload pieces (YouTube, audio files)
- Extract chord progressions with AI
- "Why This?" educational explanations
- Advanced harmonic analysis

---

**Week 3 is where your tool becomes an instrument. Take your time, test thoroughly, and enjoy the transformation!** 🎵
