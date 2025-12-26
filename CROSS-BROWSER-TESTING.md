# Cross-Browser Testing Checklist

**Last Updated:** Week 6 - Launch Prep
**Purpose:** Ensure Harmonic Canvas works perfectly across all major browsers

---

## Test Matrix

| Feature | Chrome 90+ | Firefox 88+ | Safari 14+ | Edge 90+ | Notes |
|---------|-----------|-------------|-----------|----------|-------|
| Visual rendering | ⬜ | ⬜ | ⬜ | ⬜ | Shapes, colors, fonts |
| Audio playback | ⬜ | ⬜ | ⬜ | ⬜ | Web Audio API |
| Drag-and-drop | ⬜ | ⬜ | ⬜ | ⬜ | Chord positioning |
| Modals | ⬜ | ⬜ | ⬜ | ⬜ | Open/close, animations |
| File upload | ⬜ | ⬜ | ⬜ | ⬜ | Audio file analysis |
| YouTube analysis | ⬜ | ⬜ | ⬜ | ⬜ | URL parsing |
| MIDI export | ⬜ | ⬜ | ⬜ | ⬜ | File download |
| localStorage | ⬜ | ⬜ | ⬜ | ⬜ | Save/load progressions |
| Keyboard shortcuts | ⬜ | ⬜ | ⬜ | ⬜ | Cmd/Ctrl detection |
| Tutorial system | ⬜ | ⬜ | ⬜ | ⬜ | First-time user flow |

---

## Testing Procedure

### For Each Browser:

#### 1. **Fresh Install Test** (First-Time User Experience)

**Setup:**
- Clear all browser data (cache, cookies, localStorage)
- Open app in private/incognito mode
- Note: The URL is `http://localhost:3000` (or production URL)

**Steps:**
1. ✅ App loads successfully (no errors in console)
2. ✅ Tutorial appears automatically
3. ✅ Click through all 5 tutorial steps
4. ✅ Tutorial completes successfully
5. ✅ Tutorial does NOT reappear on refresh
6. ✅ Example progression is visible on canvas
7. ✅ No TypeScript or runtime errors in console

**Expected Result:** Clean first-time experience with tutorial

---

#### 2. **Visual Rendering Test**

**Steps:**
1. ✅ All 7 chord shapes render correctly:
   - I: Circle (gold)
   - ii: Rounded square (sage green)
   - iii: Triangle (dusty rose)
   - IV: Square (periwinkle blue)
   - V: Pentagon (terracotta)
   - vi: Circle (purple)
   - vii°: Pentagon (gray)
2. ✅ Colors match specification
3. ✅ Fonts load correctly (Inter, DM Sans)
4. ✅ Connection lines appear when toggled (Cmd/Ctrl+L)
5. ✅ Selection highlights visible
6. ✅ Playhead animates smoothly

**Expected Result:** All visual elements render pixel-perfect

---

#### 3. **Audio System Test**

**Setup:**
- Ensure computer volume is audible
- Browser must allow audio playback

**Steps:**
1. ✅ Click "Start Audio" button (appears on load)
2. ✅ Audio initializes successfully
3. ✅ Click Play button (Space key)
4. ✅ Chords play with correct timing
5. ✅ Chords pulse during playback
6. ✅ Stop button works (Shift+Space)
7. ✅ Tempo slider changes speed
8. ✅ No audio glitches or pops
9. ✅ Volume is appropriate (not clipping)

**Safari-Specific:**
- ✅ Audio starts after user click (not before)
- ✅ Audio context resumes correctly

**Firefox-Specific:**
- ✅ Audio timing is accurate
- ✅ No delayed playback

**Expected Result:** Clean, glitch-free audio playback

---

#### 4. **Interaction Test**

**Steps:**
1. ✅ Click chord to select
2. ✅ Cmd/Ctrl+Click to multi-select
3. ✅ Drag chord to move
4. ✅ Dragging is smooth (no lag)
5. ✅ Right-click opens context menu
6. ✅ Undo (Cmd/Ctrl+Z) works
7. ✅ Redo (Cmd/Ctrl+Shift+Z) works
8. ✅ Delete key removes chord
9. ✅ Cmd/Ctrl+A selects all
10. ✅ Escape clears selection
11. ✅ Duplicate (Cmd/Ctrl+D) works
12. ✅ Zoom controls work (Cmd/Ctrl +/-)

**Expected Result:** All interactions feel responsive

---

#### 5. **Modal Test**

**Test Analyze Modal:**
1. ✅ Click "Analyze" button
2. ✅ Modal opens with smooth animation
3. ✅ Backdrop darkens screen
4. ✅ YouTube URL input accepts text
5. ✅ Close button (×) works
6. ✅ Escape key closes modal
7. ✅ Click outside closes modal

**Test Refine This Modal:**
1. ✅ Select chord
2. ✅ Click "Refine This" button
3. ✅ Modal opens
4. ✅ Text input works
5. ✅ All interactions functional

**Test My Progressions Modal:**
1. ✅ Click "My Progressions" button
2. ✅ Modal displays saved progressions
3. ✅ Filter buttons work
4. ✅ Load button works
5. ✅ Delete button works with confirmation

**Test Keyboard Shortcuts Guide:**
1. ✅ Press `?` key
2. ✅ Modal opens showing shortcuts
3. ✅ Correct modifier key shown (⌘ on Mac, Ctrl on Windows)
4. ✅ Printable reference works

**Expected Result:** All modals function correctly

---

#### 6. **Save/Load Test**

**Steps:**
1. ✅ Create custom progression (add/remove chords)
2. ✅ Click "Save" button (or Cmd/Ctrl+S)
3. ✅ Enter title and tags
4. ✅ Save successfully
5. ✅ Clear canvas (Cmd/Ctrl+N)
6. ✅ Open "My Progressions"
7. ✅ Load saved progression
8. ✅ Progression loads exactly as saved
9. ✅ Close browser tab
10. ✅ Reopen app
11. ✅ Progression still exists in localStorage

**Expected Result:** Data persists correctly

---

#### 7. **AI Features Test**

**Build From Bones:**
1. ✅ Load progression with chords
2. ✅ Click "Build From Bones"
3. ✅ Panel slides up from bottom
4. ✅ Steps are clickable
5. ✅ Canvas updates when step changes
6. ✅ Play button works for each step
7. ✅ "Play All Steps" works
8. ✅ "Compare" mode works

**Refine This:**
1. ✅ Select chord
2. ✅ Click "Refine This"
3. ✅ Enter emotional description
4. ✅ Suggestions appear
5. ✅ Preview works
6. ✅ Apply modifies chord

**Expected Result:** AI features work with real API

---

#### 8. **Performance Test**

**Steps:**
1. ✅ Add 50+ chords to canvas
2. ✅ Drag chords around
3. ✅ Interactions remain smooth (60fps)
4. ✅ Play progression
5. ✅ Audio plays without glitches
6. ✅ Open DevTools Performance tab
7. ✅ Record performance during playback
8. ✅ Check for long tasks (>50ms) - should be minimal
9. ✅ Monitor memory usage - should be <200MB

**Expected Result:** App performs well under load

---

## Browser-Specific Known Issues

### Safari

✅ **Audio Context Initialization**
- Issue: Safari requires user gesture before audio can play
- Fix: AudioInitButton component handles this
- Test: Verify audio only starts after user clicks button

✅ **Drag-and-Drop**
- Issue: Safari needs explicit dataTransfer settings
- Fix: Already implemented in drag handlers
- Test: Verify drag-and-drop works smoothly

### Firefox

✅ **Audio Timing**
- Issue: Firefox may have slightly different audio timing
- Fix: No specific fix needed, timing is consistent
- Test: Verify playback timing matches other browsers

### Edge

✅ **Chromium-Based Compatibility**
- Issue: None expected (same engine as Chrome)
- Fix: N/A
- Test: Verify all Chrome features work identically

---

## Quality Gates

Before marking cross-browser testing complete:

- [ ] All features work in Chrome 90+
- [ ] All features work in Firefox 88+
- [ ] All features work in Safari 14+
- [ ] All features work in Edge 90+
- [ ] No console errors in any browser
- [ ] Performance is acceptable in all browsers
- [ ] Known issues are documented

---

## Bug Report Template

If you find a bug, document it here:

```
**Browser:** [Chrome/Firefox/Safari/Edge]
**Version:** [Browser version]
**OS:** [Windows/Mac/Linux]

**Issue:**
[Description of the problem]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected:**
[What should happen]

**Actual:**
[What actually happened]

**Screenshots:**
[If applicable]

**Console Errors:**
[Copy any errors from console]

**Priority:** [Critical/High/Medium/Low]
```

---

## Testing Completed

- [ ] Chrome 90+ - Tester: _____ Date: _____
- [ ] Firefox 88+ - Tester: _____ Date: _____
- [ ] Safari 14+ - Tester: _____ Date: _____
- [ ] Edge 90+ - Tester: _____ Date: _____

**Notes:**
[Add any additional notes or observations]

---

**Status:** Ready for testing
**Next Steps:** Complete manual testing on all browsers, document any issues found
