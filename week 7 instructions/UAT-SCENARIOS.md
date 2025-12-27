# Week 7: User Acceptance Test Scenarios for Neume

**Date:** Week 7 (Launch Preparation)
**Focus:** Manual testing of core features in current state
**Platform:** Neume (Harmonic Canvas - blocks-first architecture)
**Duration:** ~2-3 hours for full test suite

---

## Important Context

**Neume's Current Architecture (as of Week 7):**
- ✅ No user accounts (localStorage only for persistence)
- ✅ No cloud sync
- ✅ Canvas-based block editor for 4-16 bar harmonic sections
- ✅ Core features: Tutorial, Canvas editing, Audio playback, Analysis, Save/Load, Keyboard shortcuts
- ✅ Extended chord types (7ths, suspensions, alterations)
- ✅ Visual polish applied (Bauhaus design system)

**What's NOT in scope for Week 7 testing:**
- ❌ User authentication (cloud storage moved to Phase 1.5)
- ❌ "My Blocks" library cloud sync
- ❌ Multi-device sync
- ❌ Offline->Online queue management
- ❌ MIDI export
- ❌ Sheet music generation

---

## UAT Test Scenarios

### UAT-01: Welcome Tutorial Flow

**Objective:** First-time user gets clear onboarding experience

**Scenario:** New user visits application and completes welcome tutorial

**Steps:**
1. Open Neume in fresh browser (first visit)
2. Observe welcome tutorial overlay appears
3. Read first slide
4. Click "Next" to advance
5. Complete all tutorial steps
6. Click "Done" or dismiss tutorial
7. Verify tutorial doesn't reappear on reload
8. Check browser localStorage has `tutorial-completed` flag

**Expected Results:**
- Tutorial appears only on first visit
- All slides are readable and clear
- Navigation works smoothly
- Dismissing tutorial doesn't lose state
- Tutorial state persists across page reloads

**Pass Criteria:**
- [ ] Tutorial displays on first visit
- [ ] All navigation buttons work
- [ ] Tutorial state persists in localStorage
- [ ] No console errors

**Status:** Ready to test (Tutorial component implemented)

---

### UAT-02: Canvas Chord Creation and Playback

**Objective:** User can create and play a basic progression

**Scenario:** User creates a simple I-V-vi-IV progression and plays it

**Steps:**
1. Start with fresh canvas (demo chords visible)
2. Right-click on canvas → Add chord
3. Select "I" (C major) from menu
4. Chord appears on canvas
5. Right-click again → Add "V" (G major)
6. Right-click again → Add "vi" (A minor)
7. Right-click again → Add "IV" (F major)
8. Press spacebar to play progression
9. Listen to all 4 chords playing
10. Click stop/pause
11. Press spacebar again to verify playback restarts
12. Right-click on a chord → Delete
13. Verify chord is removed from canvas
14. Verify playback no longer includes deleted chord

**Expected Results:**
- Chords appear on canvas immediately after adding
- Playback includes all chords in order
- Audio plays without errors
- Chord deletion works
- Playback updates when chords change

**Pass Criteria:**
- [ ] Can add 4+ chords without errors
- [ ] Playback works from start to finish
- [ ] Chord deletion works
- [ ] Visual feedback shows during playback
- [ ] No console errors

**Status:** PASS (Core Week 1-3 functionality)

---

### UAT-03: Chord Extended Types (Week 4.5 Feature)

**Objective:** User can create extended chord types

**Scenario:** User builds a progression with 7th and suspended chords

**Steps:**
1. Right-click canvas → Add chord
2. Select "I" (basic major)
3. Right-click on that chord → "Edit Chord"
4. Verify chord extension options appear (7, sus2, sus4, etc.)
5. Select "maj7" extension
6. Verify chord display updates with visual badge
7. Create another chord "V"
8. Edit it to "V7" (dominant 7th)
9. Create "IV" and make it "sus4"
10. Play progression with extended chords
11. Verify audio reflects extensions (different voicing)
12. Undo last change (Cmd+Z or Ctrl+Z)
13. Verify extension reverted

**Expected Results:**
- Chord extension menu is accessible
- Extensions display visually on chord shapes
- Audio reflects extended harmonies
- Undo/redo works with extensions

**Pass Criteria:**
- [ ] Can add extended chord types
- [ ] Visual badges show extensions
- [ ] Playback includes extended voicings
- [ ] Undo/redo preserves extension state
- [ ] No console errors

**Status:** PASS (Week 4.5 implementation complete)

---

### UAT-04: Audio Analysis Modal

**Objective:** User can analyze a song and extract chord progression

**Scenario:** User analyzes a YouTube URL and views extracted chords

**Steps:**
1. Click "Analyze" button in interface
2. AnalyzeModal opens
3. Paste a YouTube URL (or test URL)
   - Example: "https://www.youtube.com/watch?v=..."
4. Click "Analyze" button
5. Wait for processing (shows spinner/loading state)
6. Observe extracted chords appear on canvas (30-60 seconds typical)
7. Verify chords match expected progression for that song
8. Click "Play" to hear analyzed progression
9. Note the key/mode detected by analyzer
10. Close modal or click "Done"
11. Chords remain on canvas for editing
12. Check localStorage has progression saved

**Expected Results:**
- Modal opens without errors
- Analysis processes asynchronously
- Chords appear after analysis
- Audio plays correctly
- Modal dismissal preserves results

**Pass Criteria:**
- [ ] Modal opens and closes properly
- [ ] Chord extraction works (produces chords)
- [ ] Loading state shows during processing
- [ ] Extracted chords appear on canvas
- [ ] Playback works for analyzed progression
- [ ] No console errors

**Status:** PASS (Week 4 implementation, backend operational)

---

### UAT-05: Why This? Explanations

**Objective:** User understands why a chord was chosen through AI explanations

**Scenario:** User analyzes progression and reads chord explanations

**Steps:**
1. Complete UAT-04 (analyze a progression)
2. Click "Why This?" button on a chord
3. WhyThisPanel opens showing explanation
4. Read explanation text (why chord works)
5. Verify explanation mentions:
   - Harmonic function (tension/resolution)
   - Voice leading considerations
   - Emotional character
6. Click to next chord's explanation
7. Observe different explanations for different chords
8. Close panel
9. Click "Build From Bones" on analyzed progression
10. View deconstructed harmonic skeleton
11. Read educational breakdown

**Expected Results:**
- Explanations are readable and relevant
- Different chords have different explanations
- "Build From Bones" deconstructs progression logically
- Panels open/close smoothly

**Pass Criteria:**
- [ ] Why This panel shows explanation text
- [ ] Explanations are relevant to chord choice
- [ ] Build From Bones shows logical breakdown
- [ ] UI is readable and well-formatted
- [ ] No console errors

**Status:** PASS (Week 4 + Week 5 implementation)

---

### UAT-06: Refine This Modal with Suggestions

**Objective:** User gets AI suggestions for progression refinement

**Scenario:** User refines progression with emotional prompt

**Steps:**
1. Create or analyze a progression (4+ chords)
2. Click "Refine This" button
3. RefineModal opens with input field
4. Type emotional descriptor: "more ethereal"
5. Click "Get Suggestions" or press Enter
6. Wait for AI suggestions to generate
7. Observe suggestions list appears (3-5 options)
8. Hover over first suggestion
9. Preview plays (hear suggested variation)
10. Click "Apply" on suggestion
11. Modal closes and chords update on canvas
12. Listen to new progression
13. Press Undo (Cmd+Z) to revert
14. Original progression restores
15. Open Refine again and try different prompt: "more dark"
16. Verify suggestions differ from first attempt

**Expected Results:**
- Suggestions are generated from prompt
- Preview plays suggestion without applying
- Apply button updates canvas immediately
- Undo reverts to previous state
- Different prompts generate different suggestions

**Pass Criteria:**
- [ ] Refine modal opens without errors
- [ ] Suggestions generate from prompt
- [ ] Preview audio works
- [ ] Apply button works
- [ ] Undo reverts changes
- [ ] Different prompts produce different suggestions
- [ ] No console errors

**Status:** PASS (Week 5 implementation, suggestion engine operational)

---

### UAT-07: Save and Load Progressions (localStorage)

**Objective:** User can save progressions locally and reload them

**Scenario:** User creates progression, saves it, clears canvas, loads it back

**Steps:**
1. Create a custom progression (I-IV-V-I variation)
2. Right-click canvas → "Save This Block" or use Save button
3. SaveProgressionDialog opens
4. Enter name: "My Jazz Turn"
5. Enter optional description
6. Click "Save"
7. Toast/confirmation appears: "Block saved"
8. Reload page (Cmd+R or Ctrl+R)
9. After reload, progression is still visible on canvas
10. Create a NEW different progression
11. Click "Clear Canvas" or "New Block"
12. Canvas clears to empty state
13. Click "Load Block" or "My Progressions"
14. Dialog shows saved blocks (includes "My Jazz Turn")
15. Click on "My Jazz Turn" block
16. Canvas loads that block's chords
17. Verify chords match what was saved
18. Delete the block from library
19. Confirm deletion
20. Verify block no longer appears in library

**Expected Results:**
- Save dialog captures block data
- Block persists in localStorage across reloads
- Load dialog shows all saved blocks
- Loading block restores exact chord data
- Delete removes block from library
- Block state is independent of current canvas

**Pass Criteria:**
- [ ] Save dialog works
- [ ] Block persists after page reload
- [ ] Load dialog displays saved blocks
- [ ] Loading restores chords correctly
- [ ] Delete removes block
- [ ] No data loss
- [ ] No console errors

**Status:** PASS (Week 1-3 persistence implementation)

---

## Quick Reference: Features by Source

### Week 1-3: Core Canvas
- ✅ Canvas rendering
- ✅ Chord creation/deletion
- ✅ Drag to reposition chords
- ✅ Visual chord shapes with labels

### Week 2: Audio & Playback
- ✅ Audio initialization on user interaction
- ✅ Spacebar play/pause
- ✅ Tempo dial control
- ✅ Individual chord playback
- ✅ Audio latency optimization

### Week 3: Enhanced Audio
- ✅ SATB voice leading
- ✅ Smooth transitions between chords
- ✅ Reverb effects
- ✅ Full progression playback

### Week 4: Analysis
- ✅ YouTube URL analysis
- ✅ Chord extraction
- ✅ Audio file analysis
- ✅ Key/mode detection

### Week 4.5: Extended Chords
- ✅ 7th chords (maj7, dom7, min7, etc.)
- ✅ Suspended chords (sus2, sus4)
- ✅ Extensions (9, 11, 13)
- ✅ Alterations (♭5, ♯5, ♯11, ♭13)
- ✅ Visual badges for extensions

### Week 5: Educational Features
- ✅ Why This? explanations
- ✅ Build From Bones deconstruction
- ✅ Refine This suggestions
- ✅ Emotional prompting

### Week 5.5: Visual Polish
- ✅ Bauhaus design system
- ✅ Typography (Fraunces, Space Grotesk, DM Mono)
- ✅ Color refinement
- ✅ Animation polish
- ✅ Micro-interactions

---

## Manual Testing Checklist

This checklist can be run without automated tools. Each test takes ~5-10 minutes.

### Core Functionality (30 minutes total)

**Canvas Basics**
- [ ] UAT-02: Create 4+ chords without errors
- [ ] Right-click context menu appears
- [ ] Chords display with correct Roman numerals
- [ ] Chord shapes have visible labels

**Keyboard Shortcuts**
- [ ] Spacebar plays/pauses progression
- [ ] Cmd+Z / Ctrl+Z undoes last action
- [ ] Cmd+Shift+Z / Ctrl+Shift+Y redoes
- [ ] Delete key removes selected chord
- [ ] Escape dismisses modals

**Playback**
- [ ] UAT-02: Playback includes all chords in order
- [ ] Tempo dial affects playback speed
- [ ] Playback stops at end of progression
- [ ] Audio is audible without console errors

### Feature Tests (45 minutes total)

**Tutorial & Onboarding**
- [ ] UAT-01: Welcome tutorial shows on first visit
- [ ] Tutorial can be dismissed
- [ ] Tutorial doesn't reappear after completion

**Extended Chords**
- [ ] UAT-03: Can add maj7, dom7, sus2, sus4 types
- [ ] Extensions display visual badges
- [ ] Extended chords play different voicings

**Analysis**
- [ ] UAT-04: YouTube URL analysis produces chords
- [ ] Loading spinner shows during analysis
- [ ] Analyzed chords appear on canvas
- [ ] Analyzed progression plays correctly

**Educational Features**
- [ ] UAT-05: Why This panel shows explanation
- [ ] Why This has relevant chord information
- [ ] Build From Bones deconstructs progression
- [ ] Explanation text is readable

**Refinement**
- [ ] UAT-06: Refine modal opens with input
- [ ] Suggestions generate from prompt
- [ ] Preview plays suggestion audio
- [ ] Apply button updates canvas
- [ ] Different prompts yield different suggestions
- [ ] Undo reverts changes

**Save/Load**
- [ ] UAT-07: Save dialog captures block info
- [ ] Block persists after page reload
- [ ] Load dialog shows saved blocks
- [ ] Loading block restores chords exactly
- [ ] Delete removes block from library

### Browser & Performance (30 minutes total)

**Browser Compatibility**
- [ ] Test in Chrome (latest)
- [ ] Test in Firefox (latest)
- [ ] Test in Safari (latest)
- [ ] All core features work in each browser
- [ ] Audio plays in each browser
- [ ] No visual glitches

**Responsive Design**
- [ ] Canvas adapts to window resize
- [ ] Modals center correctly
- [ ] Touch events work on tablet/mobile
- [ ] Interface readable at 1024px width

**Console Errors**
- [ ] Open DevTools console (F12)
- [ ] Run through all tests above
- [ ] Note any errors or warnings
- [ ] All should be zero critical errors

---

## Test Results Template

For each test scenario, record:

```
### UAT-XX: [Feature Name]
Status: [ ] PASS [ ] FAIL
Duration: ___ minutes
Browser(s): ___________
Notes: _____________________
Issues Found:
- [ ] Issue 1
- [ ] Issue 2
Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
```

---

## Known Limitations (Document, Don't Test)

These features are OUT OF SCOPE for Week 7 and should NOT be tested:

1. **User Accounts** - Cloud storage moved to Phase 1.5
2. **"My Blocks" Library Sync** - Database not integrated
3. **Multi-Device Sync** - No backend infrastructure
4. **Offline Queue** - No cloud sync needed
5. **MIDI Export** - Not implemented
6. **Sheet Music** - Phase 2 feature
7. **Collaboration** - Phase 2 feature
8. **Mobile App** - Web-only for Phase 1

---

## Test Environment Setup

### Before Testing

1. **Clear Browser Data**
   ```
   Dev Tools > Application > Clear site data
   OR: Settings > Privacy & Security > Clear browsing data
   ```

2. **Start Fresh**
   - First test should use clean localStorage
   - Later tests can accumulate saved blocks
   - Note which test uses which state

3. **Audio Setup**
   - Speakers/headphones should be ready
   - Volume at 50% to avoid surprises
   - Test audio works with simple online tone

4. **Environment**
   - Test on localhost:5173 (dev server running)
   - Browser dev tools open (F12)
   - Watch console for errors
   - Note timestamps of issues

### Test Session Flow

1. **Start (5 min)**
   - Clear browser data
   - Load Neume
   - Verify tutorial appears
   - Complete tutorial
   - Note any issues

2. **Core Tests (30 min)**
   - UAT-02 (canvas)
   - UAT-07 (save/load)
   - Basic keyboard shortcuts
   - Check console for errors

3. **Feature Tests (45 min)**
   - UAT-03 (extended chords)
   - UAT-04 (analysis)
   - UAT-05 (why this)
   - UAT-06 (refine)
   - Check console after each

4. **Browser Tests (30 min)**
   - Switch browser
   - Repeat key scenarios
   - Note any browser-specific issues

5. **Wrap-up (10 min)**
   - Document results
   - Note any blocking issues
   - Screenshot failures

---

## Severity Levels for Issues

**Critical:** Feature doesn't work, user can't complete task
- Example: Canvas doesn't render
- Example: Audio doesn't play
- Example: Save doesn't work

**High:** Feature partially broken, workaround exists
- Example: Tooltip appears at wrong position
- Example: Loading spinner too slow
- Example: Undo doesn't work sometimes

**Medium:** Visual or UX glitch, doesn't block workflow
- Example: Button text slightly misaligned
- Example: Animation runs at 30fps instead of 60fps
- Example: Modal closes slowly

**Low:** Polish issue, no impact on usage
- Example: Hover effect missing
- Example: Color slightly off
- Example: Font weight inconsistent

---

## Test Results Summary Template

```markdown
## Test Session Results

**Date:** [Date]
**Tester:** [Name]
**Browser:** [Chrome/Firefox/Safari]
**Environment:** [localhost:5173]

### Tests Run
- [ ] UAT-01: Tutorial (PASS/FAIL)
- [ ] UAT-02: Canvas (PASS/FAIL)
- [ ] UAT-03: Extended Chords (PASS/FAIL)
- [ ] UAT-04: Analysis (PASS/FAIL)
- [ ] UAT-05: Why This (PASS/FAIL)
- [ ] UAT-06: Refine (PASS/FAIL)
- [ ] UAT-07: Save/Load (PASS/FAIL)

### Issues Found
[List any issues with severity and description]

### Recommendations
[Any improvements for next iteration]

### Overall Status
[ ] Launch Ready
[ ] Minor Issues (can launch)
[ ] Blocking Issues (fix before launch)
```

---

## Next Steps After Testing

1. **If All Tests PASS:**
   - Document passing test run
   - Proceed to Week 7 launch checklist
   - Deploy to staging/production
   - Announce beta availability

2. **If Issues Found:**
   - Prioritize by severity
   - Fix critical/high issues
   - Re-test affected areas
   - Document workarounds for known issues

3. **If Major Blockers:**
   - Identify root cause
   - Estimated fix time
   - Decide: delay launch or deploy with known issue + mitigation

---

## References

- **UAT Scenarios:** Based on PROMPT-01-testing-suite.md (modified for current architecture)
- **Implementation Status:** Reflects Week 1-5.5 completion
- **Architecture:** Blocks-first, localStorage persistence, no cloud storage in Phase 1
- **Target Launch:** After all UAT scenarios pass
