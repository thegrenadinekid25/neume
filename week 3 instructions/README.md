# Week 3 Prompt Package - Audio & Playback

**Harmonic Canvas Development - Phase 1, Week 3**

Bring your chord progressions to life with professional audio synthesis, perfect SATB voicing, and synchronized playback.

---

## 📦 Package Contents

**6 Code Generation Prompts + 4 Supporting Documents**

### Prompts
1. **001-audio-engine-setup.md** - Tone.js audio engine with choral sound
2. **002-satb-voicing.md** - Auto-voicing with voice leading
3. **003-playback-system.md** - Synchronized playback system
4. **004-cathedral-reverb.md** - Convolution reverb with impulse responses
5. **005-tempo-dial.md** - Interactive tempo control (60-180 BPM)
6. **006-integration-polish.md** - Integration testing & polish

### Supporting Documentation
- **EXECUTION-GUIDE.md** - Day-by-day implementation plan
- **DEPENDENCY-GRAPH.md** - Task dependencies and critical path
- **SUCCESS-CRITERIA.md** - Measurable completion criteria
- **README.md** - This file

---

## 🎯 What You'll Build

By the end of Week 3, you'll have **professional audio playback** with:

### Audio Features
âœ… **Audio Engine** - Warm, choral-focused synthesis (Tone.js)  
âœ… **SATB Voicing** - Perfect 4-part harmony (Tonal.js)  
âœ… **Playback System** - Precise timing with Tone.Transport  
âœ… **Cathedral Reverb** - Spacious convolution reverb  
âœ… **Tempo Control** - Beautiful dial (60-180 BPM)  
âœ… **Visual Sync** - Chords pulse during playback  

### Sound Quality
- **Synthesis:** 60% sawtooth + 40% sine with chorus
- **ADSR:** 50ms attack, 100ms decay, 70% sustain, 400ms release
- **Voice Leading:** Classical rules (common tones, minimal motion)
- **Reverb:** 2.5s decay, cathedral impulse response
- **SATB Ranges:** Soprano (C4-G5), Alto (G3-D5), Tenor (C3-G4), Bass (E2-C4)

---

## ⚡ Quick Start

### Prerequisites
- ✅ Week 1 completed (visual foundation)
- ✅ Week 2 completed (interactions)
- Node.js 18+
- Headphones or speakers 🎧
- 2-3 hours/day for 3-4 days

### Execution Steps

1. **Read EXECUTION-GUIDE.md** (10 minutes)
   - Understand audio concepts
   - Review day-by-day plan

2. **Check DEPENDENCY-GRAPH.md** (5 minutes)
   - See task relationships
   - Identify critical path

3. **Execute prompts in order** (3-4 days)
   - 001 → 002 → 003 → 004 → 005 → 006
   - Test audio after each prompt
   - Commit working code to Git

4. **Verify SUCCESS-CRITERIA.md** (30 minutes)
   - Run through all test scenarios
   - Confirm audio quality
   - Fix any issues

---

## 📋 Prompt Overview

### 001: Audio Engine Setup (2 hours)
**What:** Tone.js-powered audio engine with warm choral synthesis  
**Key Components:** AudioEngine class, PolySynth, filters, signal chain  
**Integration:** Singleton instance, React hooks  
**Test:** `audioEngine.playChord(['C3', 'E3', 'G3', 'C4'], 2)` → Hear warm sound

### 002: SATB Auto-Voicing (2-3 hours)
**What:** Automatic 4-part harmony with classical voice leading  
**Key Components:** VoiceLeading module, Tonal.js integration  
**Integration:** Chords get SATB voicing when created  
**Test:** Generate voicing for I-IV-V-I → Smooth voice motion

### 003: Playback System (2-3 hours)
**What:** Complete playback with Tone.Transport scheduling  
**Key Components:** PlaybackSystem, PlayButton, playhead sync  
**Integration:** Play button triggers progression playback  
**Test:** Click Play → Hear progression, see playhead move

### 004: Cathedral Reverb (1.5 hours)
**What:** Convolution reverb using cathedral impulse response  
**Key Components:** ConvolverNode, ReverbLoader, impulse response file  
**Integration:** Added to audio engine signal chain  
**Test:** Play chord → Hear spacious reverb tail  
**Note:** Download free IR from OpenAir library

### 005: Tempo Dial Control (2 hours)
**What:** Interactive tempo dial (60-180 BPM)  
**Key Components:** TempoDial component, SVG visualization  
**Integration:** Updates Tone.Transport.bpm in real-time  
**Test:** Drag dial → Playback speed changes immediately

### 006: Integration & Polish (2 hours)
**What:** Complete system integration and final polish  
**Key Components:** AudioSystem, error handling, optimization  
**Integration:** All features working together seamlessly  
**Test:** Complete 5-minute workflow → Professional experience

---

## 🎨 Audio Design Specifications

### Synthesis Parameters
```
Oscillator: FatSawtooth (3 detuned oscillators, ±10 cents)
Polyphony: 8 voices (2x SATB for overlapping chords)
Envelope:  Attack 50ms, Decay 100ms, Sustain 70%, Release 400ms
Filtering: HighPass 60Hz, LowPass 4000Hz (Q=1.2)
```

### SATB Voice Ranges (MIDI)
```
Soprano: C4 (60) to G5 (79)  - High, clear voice
Alto:    G3 (55) to D5 (74)  - Middle-high voice
Tenor:   C3 (48) to G4 (67)  - Middle-low voice  
Bass:    E2 (40) to C4 (60)  - Low, foundation voice
```

### Voice Leading Rules
1. **Common Tone Retention:** Keep shared notes in same voice
2. **Stepwise Motion:** Prefer M2/m2 over leaps
3. **Contrary Motion:** Bass and soprano move opposite directions
4. **Avoid Parallels:** No parallel perfect 5ths or octaves

### Reverb Settings
```
Type:      Convolution (ConvolverNode)
IR Source: St. George's Episcopal Church (OpenAir Library)
Decay:     2.5 seconds
Pre-delay: 30ms
Wet/Dry:   35% wet, 65% dry
```

---

## 🔧 Technology Stack

**New This Week:**
- **Tone.js** (v14.7.77) - Audio synthesis & scheduling *(already installed)*
- **Tonal.js** (latest) - Music theory calculations *(already installed)*
- **Web Audio API** - Native ConvolverNode for reverb
- **OpenAir IRs** - Free cathedral impulse responses

**No new npm packages needed!**

---

## ✅ Success Metrics

By the end of Week 3, you should have:

### Functional
- âœ… Audio plays through speakers/headphones
- âœ… SATB voicing sounds full and balanced
- âœ… Playback timing is perfect (no drift)
- âœ… Tempo control responsive (60-180 BPM)
- âœ… Cathedral reverb creates spacious sound
- âœ… Visual sync perfect (playhead, chord pulses)

### Performance
- âœ… 60fps maintained during playback
- âœ… Audio latency <50ms
- âœ… No clicks, pops, or glitches
- âœ… Memory usage stable (no leaks)

### Quality
- âœ… Professional choral sound quality
- âœ… Smooth voice leading (no awkward leaps)
- âœ… Reverb enhances without muddying
- âœ… Volume levels balanced
- âœ… Zero TypeScript errors
- âœ… No console warnings

---

## 📊 Estimated Timeline

### Serial Execution (Recommended)
- **Day 1:** Prompt 001 (Audio Engine) + 002 part 1 (3 hours)
- **Day 2:** Prompt 002 complete (SATB) + 003 part 1 (3 hours)
- **Day 3:** Prompt 003 complete (Playback) + 004 (Reverb) (3 hours)
- **Day 4:** Prompt 005 (Tempo Dial) + 006 (Integration) (4 hours)

**Total:** 3-4 days × 3-4 hours/day = **13-16 hours**

### Parallel Opportunities
- Prompts 004 (Reverb) and 005 (Tempo) can run parallel after 003
- Saves ~1 hour

---

## 🎯 Critical Path

```
001 (Audio Engine)
 ↓
002 (SATB Voicing)
 ↓
003 (Playback System)
 ↓
[004 (Reverb) || 005 (Tempo Dial)] ← Can run parallel
 ↓
006 (Integration & Polish)
```

**Bottleneck:** Prompts 001-003 must be serial. Budget time accordingly.

---

## 🎵 Sound Design Philosophy

### The "Choral Canvas" Sound

Week 3 creates a signature sound optimized for choral harmony:

1. **Warm Foundation** - Sine oscillator provides fundamental warmth
2. **Rich Harmonics** - Sawtooth adds brightness and presence
3. **Organic Chorus** - Slight detuning creates ensemble width
4. **Smooth Attacks** - 50ms attack prevents harsh onsets
5. **Gentle Release** - 400ms allows chords to breathe
6. **Sacred Space** - Cathedral reverb evokes church acoustics
7. **Clear Voicing** - SATB ranges prevent muddiness

**Goal:** Sound as good as commercial notation software (Sibelius, Finale)

---

## 🐛 Common Issues & Solutions

### Issue: No sound plays
**Solution:** Check browser console for errors. Verify audio context started (user interaction required).

### Issue: Audio clicks/pops
**Solution:** Increase envelope attack to 75ms. Check reverb isn't too wet (reduce to 20-25%).

### Issue: Voice leading sounds awkward
**Solution:** Verify Tonal.js chords parsing correctly. Check voice ranges enforced.

### Issue: Playback out of sync
**Solution:** Use Tone.Transport.schedule(), not setTimeout(). Ensure visual updates on requestAnimationFrame.

### Issue: Reverb file not loading
**Solution:** Verify IR file in `/public/impulse-responses/`. Check network tab in DevTools.

---

## 📝 Tips for Success

1. **Use headphones** - Better audio quality for testing
2. **Test incrementally** - Play chords after each prompt
3. **Listen critically** - Does it sound professional?
4. **Check console** - Catch audio initialization issues early
5. **Compare references** - Listen to real choral music for benchmarks
6. **Take breaks** - Ear fatigue affects judgment
7. **Save examples** - Export MIDI of test progressions

---

## 🚀 After Week 3

You'll have a **complete audio playback system** that:
- Sounds professional (warm, balanced, spacious)
- Plays with perfect timing
- Syncs beautifully with visuals
- Feels responsive and polished
- Rivals commercial software

### Next: Week 4+ - AI Features
- Analyze uploaded pieces (chord extraction)
- "Why This?" explanations
- "Build From Bones" deconstruction
- "Refine This" emotional prompting
- Complete the vision!

---

## 📚 Additional Resources

### Music Theory Background
- Voice leading principles (common practice period)
- SATB ranges and conventions
- Chord symbols and notation

### Audio Engineering
- Web Audio API fundamentals
- Convolution reverb theory
- Synthesis basics (oscillators, envelopes)

### Tone.js Documentation
- Transport and scheduling: https://tonejs.github.io/docs/Transport
- PolySynth: https://tonejs.github.io/docs/PolySynth
- Effects: https://tonejs.github.io/docs/Reverb

### OpenAir Impulse Responses
- Library: http://www.openairlib.net/
- License: Creative Commons (attribution required)
- Quality: Professional, studio-recorded

---

## ✨ Ready?

1. Download impulse response (see Prompt 004)
2. Read [EXECUTION-GUIDE.md](computer:///mnt/user-data/outputs/week3-prompts/EXECUTION-GUIDE.md)
3. Start with [Prompt 001](computer:///mnt/user-data/outputs/week3-prompts/001-audio-engine-setup.md)

**Let's bring Harmonic Canvas to life with sound!** 🎵🎹✨
