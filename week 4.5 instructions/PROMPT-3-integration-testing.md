# Week 4.5 Prompt 3: Integration Testing & Polish

## Objective
Comprehensive testing of extended chord functionality across the entire system (UI, audio, state management, export) and polish any rough edges before Week 5 AI features.

## Context
- **What's new:** 17 extended chord types with badges and advanced voice leading
- **Why test now:** Week 5 AI will suggest these chords - they must be bulletproof
- **Scope:** Full integration testing, not just unit tests
- **Goal:** 100% confidence that extended chords work perfectly

## Requirements

### 1. Comprehensive Test Suite

**UI Tests:**
- [ ] All 17 chord types appear in "More Chords" menu
- [ ] Submenus expand on hover (7th Chords, Suspensions, etc.)
- [ ] Clicking chord type creates it on canvas
- [ ] Badges render with correct labels (7, △7, sus4, +9, etc.)
- [ ] Badges positioned correctly on all 7 shape types
- [ ] Badges don't overlap with selection indicators
- [ ] Tooltips show full chord names (e.g., "C major 7th (Cmaj7)")

**Audio Tests:**
- [ ] All extended chords play correct notes
- [ ] Cmaj7 plays C-E-G-B across SATB
- [ ] Cadd9 plays C-E-G-D (omits nothing)
- [ ] Csus4 plays C-F-G (no E)
- [ ] C13 plays correctly distributed notes
- [ ] Volume/timbre consistent across all types
- [ ] No audio glitches or pops

**Voice Leading Tests:**
- [ ] No parallel 5ths in I-IV-V-I with 7ths
- [ ] No parallel octaves in any test progression
- [ ] Soprano gets 7th in all 7th chords
- [ ] Suspensions are doubled
- [ ] 9ths appear in soprano for add9 chords
- [ ] All voices stay in range
- [ ] Voice leading is smooth (minimal leaps)

**State Management Tests:**
- [ ] Extended chords save to Zustand correctly
- [ ] Undo/redo works with extended chords
- [ ] Can delete extended chords
- [ ] Can select/deselect extended chords
- [ ] Multiple extended chords can exist simultaneously

**Integration Tests:**
- [ ] Can create progression: I-Imaj7-Iadd9-I
- [ ] Can create progression: I7-IV7-V7-I
- [ ] Playback works across mixed basic + extended chords
- [ ] Can transpose progression with extended chords
- [ ] Extended chords survive page reload (localStorage)

### 2. Test Progressions

Create these progressions manually and verify everything works:

**Test 1: "Evolution of Tonic"**
```
I → Imaj7 → Iadd9 → I6 → I
```
- Should sound increasingly sophisticated, then resolve
- Voice leading should be smooth throughout
- Each chord should have correct badge

**Test 2: "Jazz Turnaround"**
```
Imaj7 → vi7 → ii7 → V7 → Imaj7
```
- All chords should have 7th in soprano
- Should sound like classic jazz progression
- No voice leading errors

**Test 3: "Suspension Chain"**
```
Isus4 → I → Vsus4 → V → VIsus4 → vi → IVsus4 → IV
```
- Each suspension should resolve properly
- sus4 should sound tense, resolution should release
- Suspensions should be doubled

**Test 4: "Extended Harmony Showcase"**
```
Iadd9 → IVmaj7 → V13 → vimin7 → IImaj7 → V7(♭9) → Iadd9
```
- Mix of all extension types
- Should sound sophisticated but coherent
- All badges should display correctly

**Test 5: "Complex Voice Leading"**
```
I7 → IV7 → ♭VII7 → I7 (chromatic)
```
- Tests voice leading with chromatic motion
- Should handle out-of-key chords gracefully
- Voice leading should remain smooth

### 3. Performance Testing

**Stress Tests:**
1. Create 50 extended chords on canvas
   - Verify 60fps
   - Verify no memory leaks
   - Verify badges all render

2. Play progression with 20+ extended chords
   - Verify audio doesn't stutter
   - Verify playhead animation smooth
   - Verify pulse animations sync

3. Rapid chord creation
   - Spam-click "More Chords" menu 50 times
   - Verify no crashes
   - Verify all chords created correctly

**Browser Compatibility:**
- Test in Chrome, Firefox, Safari
- Verify badges render identically
- Verify audio works in all browsers
- Verify no console errors

### 4. Edge Cases

**Musical Edge Cases:**
- [ ] C♭maj7 (double-flat notes)
- [ ] E♯sus4 (double-sharp notes)
- [ ] Very high register (soprano at G5 limit)
- [ ] Very low register (bass at E2 limit)
- [ ] Enharmonic equivalents (C♯ vs D♭)

**UI Edge Cases:**
- [ ] Badge on very small chord shape
- [ ] Badge on very large chord shape (zoomed in)
- [ ] Multiple badges on same chord (add9 + sus4)
- [ ] Badge text overflow (very long label)
- [ ] Badge on light colored chord (readability)

**State Edge Cases:**
- [ ] Undo extended chord creation
- [ ] Redo extended chord creation
- [ ] Delete extended chord and undo
- [ ] Select 10 extended chords at once
- [ ] Transpose progression with extended chords to 12 different keys

**Audio Edge Cases:**
- [ ] Play extended chord while previous still sounding
- [ ] Play very fast (tempo 220 BPM)
- [ ] Play very slow (tempo 60 BPM)
- [ ] Change chord type while playing
- [ ] Rapid play/pause/play

### 5. Bug Fixes & Polish

**Common Issues to Check:**
- Badge positioning shifts when chord is selected
- Badge text is blurry (needs pixel-perfect alignment)
- Menu closes before user can click submenu
- Audio pops when switching between chords
- Voice leading creates harsh intervals
- Tooltips show incorrect chord names
- Undo doesn't restore badge correctly

**Polish Items:**
- Badge fade-in animation is smooth (200ms)
- Menu hover states are responsive
- Tooltip appears after 500ms (not instant)
- Audio ADSR envelope is smooth (no clicks)
- Selection indicator respects badge space

### 6. Documentation Updates

Update these files with extended chord information:

**README Updates:**
```markdown
## Extended Chord Types

Neume now supports 17 extended chord types:

**7th Chords:** dom7, maj7, min7, halfdim7, dim7
**Suspensions:** sus2, sus4
**Extensions:** add9, add11, add13
**Alterations:** ♭9, ♯9, ♯11, ♭13

To create: Right-click canvas → More Chords → [select type]
```

**Keyboard Shortcuts:**
```markdown
7     - Add dominant 7th to selected chord
M     - Add major 7th to selected chord
9     - Add 9th extension to selected chord
4     - Add sus4 to selected chord
```

**Tooltips:**
```typescript
const chordTooltips = {
  'maj7': 'Major 7th - warm, jazzy color',
  'add9': 'Added 9th - shimmering, ethereal',
  'sus4': 'Suspended 4th - tension awaiting resolution',
  // ... all 17 types
};
```

## Testing Checklist

**Before marking Week 4.5 complete:**

### UI Checklist
- [ ] All 17 chord types in menu
- [ ] All badges render correctly
- [ ] All tooltips show correct names
- [ ] Menu interactions smooth
- [ ] Badges animate in properly

### Audio Checklist
- [ ] All chord types sound correct
- [ ] Voice leading is smooth
- [ ] No parallel 5ths or octaves
- [ ] No audio artifacts
- [ ] Playback tempo-independent

### Integration Checklist
- [ ] Works with undo/redo
- [ ] Works with delete
- [ ] Works with selection
- [ ] Works with transpose
- [ ] Saves to state correctly

### Performance Checklist
- [ ] 60fps with 50+ chords
- [ ] No memory leaks
- [ ] No audio stuttering
- [ ] Fast menu interactions

### Browser Checklist
- [ ] Chrome ✓
- [ ] Firefox ✓
- [ ] Safari ✓
- [ ] No console errors

## Manual Testing Script

Run through this script completely:

**Part 1: Create All Types (10 min)**
1. Open app
2. Right-click → More Chords → 7th Chords
3. Create one of each: dom7, maj7, min7, halfdim7, dim7
4. Verify badges appear with correct labels
5. Right-click → More Chords → Suspensions
6. Create sus2 and sus4
7. Right-click → More Chords → Extensions
8. Create add9, add11, add13
9. Right-click → More Chords → Alterations
10. Create ♭9, ♯9, ♯11, ♭13

**Part 2: Test Playback (5 min)**
11. Click Play button
12. Listen to each chord
13. Verify they sound correct
14. Verify no audio pops or clicks

**Part 3: Test Voice Leading (5 min)**
15. Create progression: I → Imaj7 → Iadd9 → I
16. Play it
17. Listen for smooth voice leading
18. Hover each chord - verify tooltip correct

**Part 4: Test Integration (5 min)**
19. Select all chords (Cmd+A)
20. Delete them (Delete key)
21. Undo (Cmd+Z)
22. Verify all chords restored with badges
23. Transpose to different key
24. Verify everything still works

**Part 5: Stress Test (5 min)**
25. Create 50 extended chords
26. Verify UI still responsive
27. Play entire progression
28. Verify audio doesn't stutter
29. Verify playhead smooth

**Total time:** 30 minutes

If any step fails, mark as bug and fix before proceeding.

## Success Criteria

Week 4.5 is complete when:

1. ✓ All 17 extended chord types work perfectly
2. ✓ Manual testing script passes 100%
3. ✓ All 5 test progressions sound correct
4. ✓ No voice leading errors detected
5. ✓ Performance remains at 60fps
6. ✓ Works in Chrome, Firefox, Safari
7. ✓ Documentation updated
8. ✓ No console errors or warnings

---

**Estimated Time:** 0.5-1 hour
**Dependencies:** Prompts 1 & 2 (extended chords, voice leading)
**Next Step:** Week 5 - AI Composition Features (which will use these chords)
