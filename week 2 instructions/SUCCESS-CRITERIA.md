# Week 2 Success Criteria - Core Interactions

**Measurable, testable criteria for determining Week 2 completion.**

---

## Critical Success Criteria

These **MUST** all be true for Week 2 to be considered complete:

### 1. Project Runs Without Errors

```bash
✅ npm run dev
✅ No TypeScript compilation errors
✅ No console errors
✅ No console warnings
✅ Application loads in < 2 seconds
```

**Test:**
```bash
npx tsc --noEmit
# Should output: No errors found

npm run dev
# Open browser console (F12)
# Console should be clean (no red errors, no yellow warnings)
```

---

### 2. Right-Click Context Menu Works

**Must Pass:**
- [ ] Right-click on empty canvas → Menu appears at cursor position
- [ ] Menu shows all 7 chord types (I, ii, iii, IV, V, vi, vii°)
- [ ] Each chord has correct color dot preview
- [ ] Click "I (Tonic)" → Gold circle appears on canvas
- [ ] Click "V (Dominant)" → Terracotta pentagon appears
- [ ] Chords snap to nearest beat (80px grid at 1x zoom)
- [ ] Click outside menu → Menu closes
- [ ] Press Escape → Menu closes
- [ ] Menu stays within viewport (doesn't appear off-screen)

**Test:**
```
1. Right-click center of canvas → Menu appears
2. Click I → Gold circle appears
3. Right-click near right edge → Menu adjusts position
4. Right-click, press Escape → Menu closes
```

---

### 3. Drag-and-Drop Works Smoothly

**Must Pass:**
- [ ] Click and drag chord → Chord moves with cursor
- [ ] Chord scales to 1.15x during drag
- [ ] Drop shadow appears during drag (darker)
- [ ] Release drag → Chord snaps to nearest beat
- [ ] Smooth animation back to rest state (200ms)
- [ ] Maintain 60fps during drag (check Chrome DevTools Performance tab)
- [ ] Drag 10 chords rapidly → No lag
- [ ] Cursor changes to 'grab' on hover, 'grabbing' during drag

**Performance Test:**
```
1. Add 50 chords to canvas
2. Open Chrome DevTools > Performance
3. Start recording
4. Drag chord across canvas
5. Stop recording
6. Check FPS → Should maintain ~60fps throughout
```

---

### 4. Selection System Complete

**Single Selection:**
- [ ] Click chord → Blue stroke appears (3.5px width)
- [ ] Click another chord → Previous deselected, new selected
- [ ] Click empty space → All deselected

**Multi-Selection:**
- [ ] Cmd/Ctrl + Click unselected chord → Added to selection
- [ ] Cmd/Ctrl + Click selected chord → Removed from selection
- [ ] Cmd/Ctrl + Click 3 chords → All 3 have blue stroke

**Range Selection:**
- [ ] Click first chord, Shift + Click fifth chord → Chords 1-5 selected
- [ ] Works based on beat position (timeline order)

**Rectangular Selection:**
- [ ] Drag rectangle on empty canvas → Selection box appears
- [ ] Release → All chords within box selected
- [ ] Shift + Drag rectangle → Adds to existing selection

**Select All:**
- [ ] Cmd/Ctrl + A → All chords selected
- [ ] Escape → All deselected

**Selection Info:**
- [ ] Select 3+ chords → "3 chords selected" appears at bottom

**Test:**
```
1. Add 6 chords
2. Click chord 1 → Blue stroke
3. Cmd+Click chord 2 → Both have blue stroke
4. Shift+Click chord 5 → Chords 1-5 selected
5. Drag rectangle around chords 3-4 → Only 3-4 selected
6. Cmd+A → All 6 selected
7. Escape → All deselected
```

---

### 5. Multi-Drag Works

**Must Pass:**
- [ ] Select 3 chords
- [ ] Drag any one of them → All 3 move together
- [ ] Release → All 3 snap to beats maintaining relative positions
- [ ] Relative spacing preserved after drag

**Test:**
```
1. Add chords at beats 0, 4, 8
2. Select all 3 (Cmd+A)
3. Drag middle chord 4 beats to the right
4. All 3 should now be at beats 4, 8, 12 (4-beat offset maintained)
```

---

### 6. Connection Lines Display

**Must Pass:**
- [ ] Add 3 consecutive chords → Lines connect them
- [ ] Lines are smooth Bézier curves (S-shape)
- [ ] Lines have slight hand-drawn wobble
- [ ] Line color: Medium gray #7F8C8D
- [ ] Line opacity: 60% (default)
- [ ] Hover over line → Opacity increases to 90%
- [ ] Move chord → Lines update in real-time
- [ ] Delete chord → Lines reconnect correctly
- [ ] Cmd/Ctrl + L → Lines toggle visibility

**Test:**
```
1. Add 4 chords in sequence (beats 0, 4, 8, 12)
2. Lines should appear connecting them
3. Hover over line → Opacity increases
4. Drag middle chord → Lines adjust smoothly
5. Delete chord 3 → Line connects chord 2 to chord 4
6. Cmd+L → Lines disappear
7. Cmd+L → Lines reappear
```

---

### 7. Delete Functionality Works

**Must Pass:**
- [ ] Select 1 chord, press Delete → Chord removed
- [ ] Select 1 chord, press Backspace → Chord removed
- [ ] Select 3 chords, press Delete → All 3 removed
- [ ] Select 5+ chords, press Delete → Confirmation modal appears
- [ ] Confirm deletion → All chords removed
- [ ] Cancel deletion → No chords removed
- [ ] Connection lines update after deletion
- [ ] Right-click chord → Context menu has "Delete" option

**Test:**
```
1. Add 6 chords
2. Select chord 1, press Delete → Removed
3. Select chords 2-6 (5 chords), press Delete → Confirmation shows
4. Click "Cancel" → Chords remain
5. Press Delete again → Click "Delete" → All 5 removed
```

---

### 8. Keyboard Shortcuts All Work

**Must Pass:**
- [ ] Cmd/Ctrl + A → Select all chords
- [ ] Cmd/Ctrl + D → Duplicate selected chords
- [ ] Delete/Backspace → Delete selected
- [ ] Cmd/Ctrl + L → Toggle connection lines
- [ ] Escape → Clear selection
- [ ] Arrow keys → Move selected 1px
- [ ] Shift + Arrow keys → Move selected 10px
- [ ] ? → Show keyboard shortcuts guide
- [ ] Cmd/Ctrl + Z → Undo
- [ ] Cmd/Ctrl + Shift + Z → Redo
- [ ] Space → Play/Pause (UI only in Week 2, actual playback in Week 5)

**Platform Detection:**
- [ ] On Mac → Shows ⌘ in shortcuts guide
- [ ] On Windows → Shows Ctrl in shortcuts guide

**Input Protection:**
- [ ] Shortcuts don't trigger when typing in text field

**Test:**
```
1. Add 3 chords, Cmd+A → All selected
2. Cmd+D → 3 duplicates appear 4 beats to the right
3. Cmd+A, Delete → Confirmation for 6 chords
4. Cmd+L → Connection lines toggle
5. Press ? → Shortcuts guide appears
6. Select chord, press → 10 times → Moved 10px right
7. Press Shift+→ → Moved 10px right (single press)
```

---

### 9. Undo/Redo Fully Functional

**Add Chord:**
- [ ] Add chord, Cmd+Z → Chord removed
- [ ] Cmd+Shift+Z → Chord restored

**Delete Chord:**
- [ ] Delete chord, Cmd+Z → Chord restored with exact same properties
- [ ] Restored chord has same ID, position, extensions, etc.

**Move Chord:**
- [ ] Move chord from beat 4 to beat 8, Cmd+Z → Returns to beat 4
- [ ] Cmd+Shift+Z → Moves back to beat 8

**Duplicate Chord:**
- [ ] Duplicate 2 chords, Cmd+Z → Duplicates removed
- [ ] Cmd+Shift+Z → Duplicates reappear

**Multiple Undos:**
- [ ] Make 5 changes, Cmd+Z five times → Returns to initial state
- [ ] Cmd+Shift+Z five times → Returns to final state

**Redo Invalidation:**
- [ ] Undo 3 times, make new change → Can't redo anymore

**Stack Limit:**
- [ ] Make 60 changes → Can undo last 50 only

**Test:**
```
1. Add chord A → Cmd+Z → Chord A removed → Cmd+Shift+Z → Chord A restored
2. Add chord B → Move chord B → Delete chord B → Cmd+Z three times → Chord B at original position
3. Undo again → Chord B doesn't exist
4. Add chord C → Can't redo chord B operations (redo stack cleared)
```

---

### 10. Integration: All Features Work Together

**Complex Workflow Test:**
```
1. Add 5 chords via right-click (I, V, vi, IV, ii)
2. Select chords 1-3 (Shift+Click)
3. Cmd+D → Duplicates appear
4. Drag duplicates 4 beats to right
5. Select chord 2, press Delete → Removed
6. Cmd+L → Connection lines disappear
7. Cmd+L → Connection lines reappear
8. Cmd+Z six times → Back to 5 original chords
9. Cmd+Shift+Z three times → Some actions redone
10. Cmd+A → All chords selected
```

**Must Pass:**
- [ ] All steps execute without errors
- [ ] State is consistent throughout
- [ ] No visual glitches
- [ ] Maintains 60fps
- [ ] Undo/redo stack is consistent

---

## Performance Criteria

### Frame Rate
- [ ] **60fps maintained** during all interactions
- [ ] **No dropped frames** during drag
- [ ] **Smooth animations** (no jank)

**Test:**
```
Chrome DevTools > Performance > Record
Perform: Add 50 chords, drag one around, select all, delete all, undo
Check: Green bars should be at 60fps throughout
```

### Load Time
- [ ] **Initial load < 2 seconds**
- [ ] **First interaction < 16ms** (60fps frame budget)

### Memory
- [ ] **No memory leaks** after 10 minutes of use
- [ ] **Undo stack doesn't grow indefinitely** (50 command limit)

**Test:**
```
Chrome DevTools > Memory > Take heap snapshot
Use app for 10 minutes (add, move, delete, undo, redo)
Take another heap snapshot
Compare: Should be similar size (no significant growth)
```

---

## Code Quality Criteria

### TypeScript
```bash
✅ npx tsc --noEmit
# Output: No errors found
```

- [ ] **Zero TypeScript errors**
- [ ] **All types properly defined**
- [ ] **No `any` types** (except where truly necessary)
- [ ] **Interfaces complete** (all properties documented)

### Code Organization
- [ ] **Components in correct folders**
- [ ] **Imports use path aliases** (@/, @components, @types)
- [ ] **No circular dependencies**
- [ ] **CSS modules used** (no global styles except globals.css)

### Best Practices
- [ ] **React.memo** on heavy components (ChordShape, ConnectionLine)
- [ ] **useMemo** for expensive calculations
- [ ] **useCallback** for event handlers passed as props
- [ ] **Proper cleanup** (useEffect returns cleanup function)

---

## Visual Quality Criteria

### Animations
- [ ] All transitions use cubic-bezier easing from spec
- [ ] Default duration: 300ms
- [ ] Hover: 1.05x scale
- [ ] Dragging: 1.15x scale
- [ ] No visual "popping" or sudden changes

### Styling
- [ ] All colors match spec exactly
- [ ] Font sizes consistent with spec
- [ ] Spacing follows 8px grid
- [ ] Shadows are subtle and appropriate
- [ ] Hand-drawn wobble visible but not excessive

### Z-Index Layers
- [ ] 0: Connection lines (below chords)
- [ ] 1: Chords (main layer)
- [ ] 100: Selection info
- [ ] 1000: Context menu
- [ ] 2000: Modals (delete confirmation, shortcuts guide)

**Test:**
```
1. Open context menu over chords → Menu should be on top
2. Open delete confirmation → Should be on top of everything
3. Connection lines should be behind chords
```

---

## Accessibility Criteria

### Keyboard Navigation
- [ ] **Tab** cycles through interactive elements
- [ ] **All buttons focusable**
- [ ] **Focus states visible** (2px blue outline)
- [ ] **Escape** closes modals/menus
- [ ] **Enter/Space** activates buttons

### ARIA
- [ ] **Buttons have aria-labels**
- [ ] **Modals have role="dialog"**
- [ ] **Menu has role="menu"**
- [ ] **Selected chords have aria-selected="true"**

### Screen Reader
- [ ] Selection count announced
- [ ] Chord additions announced
- [ ] Deletions announced
- [ ] Undo/redo actions announced

### Color Contrast
- [ ] **Text on white background: 4.5:1 minimum** (WCAG AA)
- [ ] **Buttons have sufficient contrast**
- [ ] **Selected state clearly visible**

**Test:**
```
1. Use Tab to navigate through all interactive elements
2. Use screen reader (VoiceOver on Mac, NVDA on Windows)
3. Verify all actions are announced
4. Check contrast with browser DevTools (Lighthouse audit)
```

---

## Browser Compatibility

### Supported Browsers
- [ ] Chrome 90+ ✅
- [ ] Firefox 88+ ✅
- [ ] Safari 14+ ✅
- [ ] Edge 90+ ✅

### Not Supported
- [ ] Internet Explorer ❌ (no Web Audio API)

**Test:**
```
Test in each browser:
1. Right-click menu works
2. Drag-drop works
3. Keyboard shortcuts work
4. Performance is acceptable
```

---

## Final Acceptance Test

**The "5-Minute Demo" Test:**

Give the app to someone unfamiliar with the project. They should be able to:

1. **Start the app** (`npm run dev`)
2. **Add 3 chords** via right-click
3. **Move chords** by dragging
4. **Select multiple chords** (try Cmd+Click and rectangle selection)
5. **See connection lines** between chords
6. **Delete a chord** (with confirmation if 5+)
7. **Undo the deletion** (Cmd+Z)
8. **Understand keyboard shortcuts** (press ?)

**Pass Criteria:**
- [ ] Complete all 8 tasks without help
- [ ] No confusion about how to use features
- [ ] No errors encountered
- [ ] Positive reaction ("This is cool!")

---

## Failure Criteria

Week 2 is **NOT COMPLETE** if any of these are true:

❌ TypeScript compilation errors
❌ Console errors during normal use  
❌ Console warnings during normal use
❌ Drag-drop doesn't work smoothly
❌ Undo/redo doesn't work for all actions
❌ Performance < 60fps with 50 chords
❌ Keyboard shortcuts conflict or don't work
❌ Visual glitches (flicker, pop, incorrect z-index)
❌ Memory leaks
❌ Features don't work on supported browsers

---

## Week 2 Completion Checklist

### Before Claiming Week 2 Complete

- [ ] All 7 prompts (001-007) executed
- [ ] All critical success criteria pass
- [ ] Performance criteria met (60fps, < 2s load)
- [ ] Code quality criteria met (zero TS errors)
- [ ] Visual quality criteria met (animations smooth)
- [ ] Accessibility criteria met (keyboard nav, ARIA)
- [ ] Browser compatibility verified
- [ ] "5-Minute Demo" test passed
- [ ] Zero failure criteria present
- [ ] Git committed with clear commit messages
- [ ] README updated with Week 2 features

### Post-Completion

- [ ] Take screenshots/GIF of demo
- [ ] Document any known issues (if any)
- [ ] Celebrate! 🎉 You've built a sophisticated interaction system!
- [ ] Ready to start Week 3 (Audio & Playback)

---

**If all criteria above are met, Week 2 is COMPLETE and you're ready for Week 3!**
