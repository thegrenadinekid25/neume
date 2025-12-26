# Week 2 Execution Guide - Core Interactions

**Timeline:** 7 days (2-3 hours/day, serial execution)
**Alternative:** 6 days (with some parallel execution for advanced users)

---

## Overview

Week 2 transforms Harmonic Canvas from a static visual display into a fully interactive chord progression editor. By the end of this week, users will be able to:

- ✅ Add chords via right-click menu
- ✅ Drag and reposition chords
- ✅ Select single or multiple chords
- ✅ View connection lines showing progression flow
- ✅ Delete chords with confirmation
- ✅ Use comprehensive keyboard shortcuts
- ✅ Undo/redo all actions

---

## Prerequisites

Before starting Week 2:
- ✅ Week 1 fully complete and working
- ✅ All 7 chord shapes render correctly
- ✅ Colors match spec exactly
- ✅ Canvas displays with watercolor background
- ✅ Zero TypeScript errors
- ✅ Project runs with `npm run dev`

---

## Day-by-Day Execution Plan

### **Day 1: Right-Click Context Menu** (2-3 hours)

**Prompt:** `001-right-click-context-menu.md`

**What you're building:**
- Context menu that appears on right-click
- Shows all 7 chord types with color previews
- Clicking chord adds it to canvas at cursor position
- Chords snap to nearest beat

**Execution steps:**
1. Open new Claude conversation
2. Paste entire prompt 001
3. Copy generated code to your project:
   - `src/components/UI/ContextMenu.tsx`
   - `src/components/UI/ContextMenu.module.css`
   - `src/components/Canvas/ChordContextMenu.tsx`
   - Update `src/components/Canvas/Canvas.tsx`
4. Test: Right-click canvas → Menu appears with 7 chords
5. Test: Click "I (Tonic)" → Chord appears at cursor
6. Verify beat snapping works

**Common issues:**
- Menu appears off-screen → Check viewport adjustment logic
- Chords don't appear → Verify `onAddChord` callback is wired up
- Context menu doesn't close → Check click-outside detection

**Verification:**
```bash
npm run dev
# Right-click canvas
# Menu should appear at cursor
# Click I chord → Gold circle appears on canvas
# Click empty space → Menu closes
```

---

### **Day 2: Drag-and-Drop System** (3-4 hours)

**Prompt:** `002-drag-drop-system.md`

**What you're building:**
- Chords become draggable
- Drag preview with lifted appearance (1.15x scale)
- Beat snapping on release
- Smooth GPU-accelerated animations

**Execution steps:**
1. Open new Claude conversation
2. Paste entire prompt 002
3. Copy generated code:
   - `src/hooks/useDragDrop.ts`
   - `src/components/Canvas/DraggableChord.tsx`
   - `src/components/Canvas/DroppableCanvas.tsx`
   - `src/store/canvas-store.ts` (create if doesn't exist)
   - Update `ChordShape.tsx` with isDragging prop
4. Test: Click and drag chord → Moves smoothly
5. Test: Release → Snaps to nearest beat
6. Test: Drag 10 chords rapidly → Still 60fps

**Common issues:**
- Drag doesn't start → Check activation distance (8px minimum)
- Chord jumps on pickup → Verify transform origin is center
- Performance lag → Ensure `will-change: transform` in CSS

**Verification:**
```bash
npm run dev
# Add 3-4 chords via right-click
# Drag each chord → Should move smoothly
# Release → Should snap to beat grid
# Check Chrome DevTools Performance → 60fps maintained
```

---

### **Day 3: Selection System** (3-4 hours)

**Prompt:** `003-selection-system.md`

**What you're building:**
- Single selection (click chord)
- Multi-selection (Cmd/Ctrl + click)
- Range selection (Shift + click)
- Rectangular selection (drag on empty canvas)
- Blue stroke on selected chords
- Multi-drag (drag one → all selected move)

**Execution steps:**
1. Open new Claude conversation
2. Paste entire prompt 003
3. Copy generated code:
   - Update `src/store/canvas-store.ts` with selection actions
   - `src/components/Canvas/SelectionBox.tsx`
   - `src/components/Canvas/SelectionBox.module.css`
   - Update `DroppableCanvas.tsx` with selection logic
   - `src/hooks/useKeyboardShortcuts.ts`
4. Test: Click chord → Blue stroke appears
5. Test: Cmd+Click 3 chords → All 3 selected
6. Test: Drag rectangle → Chords within selected
7. Test: Cmd+A → All chords selected

**Common issues:**
- Cmd+Click doesn't work → Check platform detection (Mac vs Windows)
- Selection box doesn't appear → Verify SVG layer z-index
- Multi-drag doesn't work → Check drag data includes selectedIds

**Verification:**
```bash
npm run dev
# Add 5-6 chords
# Click one → Blue stroke appears
# Cmd+Click another → Both selected
# Drag rectangle around 3 chords → All 3 selected
# Drag one selected chord → All selected chords move together
```

---

### **Day 4: Connection Lines** (2-3 hours)

**Prompt:** `004-connection-lines.md`

**What you're building:**
- Smooth Bézier curves connecting consecutive chords
- Hand-drawn wobble aesthetic
- Hover interaction (opacity change)
- Toggle visibility (Cmd+L)
- Lines update when chords move

**Execution steps:**
1. Open new Claude conversation
2. Paste entire prompt 004
3. Copy generated code:
   - `src/components/Canvas/ConnectionLine.tsx`
   - `src/components/Canvas/ConnectionLine.module.css`
   - `src/components/Canvas/ConnectionLines.tsx`
   - Update `Canvas.tsx` to include ConnectionLines layer
   - Update `canvas-store.ts` with showConnectionLines toggle
   - Update `useKeyboardShortcuts.ts` with Cmd+L shortcut
4. Test: Add 3 chords → Lines appear between them
5. Test: Drag chord → Lines update in real-time
6. Test: Cmd+L → Lines disappear
7. Test: Cmd+L again → Lines reappear

**Common issues:**
- Lines don't appear → Check z-index (should be 0, below chords)
- Lines don't update on drag → Verify useMemo dependencies
- Wobble too extreme → Adjust wobble() range (±1-2px max)

**Verification:**
```bash
npm run dev
# Add 4 chords in sequence
# Smooth S-curves should connect them
# Hover over line → Opacity increases
# Cmd+L → Lines toggle on/off
# Drag middle chord → Lines reconnect smoothly
```

---

### **Day 5: Delete & Keyboard Shortcuts** (3-4 hours)

**Prompt:** `005-delete-keyboard-shortcuts.md`

**What you're building:**
- Delete selected chords (Delete/Backspace key)
- Confirmation modal for large deletions (5+ chords)
- Complete keyboard shortcut system
- Keyboard shortcuts guide (? key)
- Arrow key fine positioning

**Execution steps:**
1. Open new Claude conversation
2. Paste entire prompt 005
3. Copy generated code:
   - `src/components/UI/DeleteConfirmation.tsx`
   - `src/components/UI/DeleteConfirmation.module.css`
   - `src/components/UI/KeyboardShortcutsGuide.tsx`
   - `src/components/UI/KeyboardShortcutsGuide.module.css`
   - Update `canvas-store.ts` with delete/duplicate actions
   - Update `useKeyboardShortcuts.ts` with all shortcuts
4. Test: Select chord, press Delete → Chord removed
5. Test: Select 6 chords, press Delete → Confirmation appears
6. Test: Cmd+D → Duplicates selected chords
7. Test: ? key → Shortcuts guide appears
8. Test: Arrow keys → Selected chord moves 1px

**Common issues:**
- Delete doesn't work → Check keyboard event listener attached
- Shortcuts trigger while typing → Verify input field detection
- Arrow keys scroll page → Ensure preventDefault() called

**Verification:**
```bash
npm run dev
# Add 3 chords, select one, press Delete → Removed
# Add 6 chords, select all, press Delete → Confirmation modal appears
# Cmd+D → Creates duplicates 4 beats to the right
# Press ? → Shortcuts guide appears
# Select chord, press → → Chord moves 1px right
```

---

### **Day 6: Undo/Redo System** (3-4 hours)

**Prompt:** `006-undo-redo-system.md`

**What you're building:**
- Command pattern for all user actions
- Undo stack (last 50 commands)
- Redo stack
- Cmd+Z / Cmd+Shift+Z keyboard shortcuts
- Optional undo/redo buttons in UI

**Execution steps:**
1. Open new Claude conversation
2. Paste entire prompt 006
3. Copy generated code:
   - `src/types/commands.ts` (all Command classes)
   - Update `canvas-store.ts` with undo/redo logic
   - Update existing actions to use command pattern
   - Update `useKeyboardShortcuts.ts` with Cmd+Z, Cmd+Shift+Z
   - Optional: `src/components/Header/UndoRedoButtons.tsx`
4. Test: Add chord, Cmd+Z → Chord removed
5. Test: Delete chord, Cmd+Z → Chord restored
6. Test: Move chord, Cmd+Z → Returns to original position
7. Test: Undo 3 times, Cmd+Shift+Z → Redo works
8. Test: Undo, make new change → Redo stack cleared

**Common issues:**
- Undo doesn't restore state → Check command constructor captures all data
- Memory grows → Verify `.slice(-50)` limits stack
- Redo doesn't work → Ensure new actions clear redoStack

**Verification:**
```bash
npm run dev
# Add 3 chords
# Cmd+Z three times → All chords removed
# Cmd+Shift+Z → Chords reappear one by one
# Add new chord → Can't redo anymore (redo stack cleared)
# Make 60 changes → Undo works for last 50 only
```

---

### **Day 7: Integration & Testing** (2-3 hours)

**Prompt:** `007-integration-testing.md`

**What you're building:**
- Complete integration of all Week 2 features
- Demo progression that loads on first start
- Comprehensive testing
- Bug fixes and polish

**Execution steps:**
1. Open new Claude conversation
2. Paste entire prompt 007
3. Copy generated code:
   - Complete `src/App.tsx` integration
   - `src/App.css`
   - `src/components/Header/Header.tsx`
   - `src/components/Controls/BottomControlBar.tsx`
   - All supporting components
4. Go through entire test checklist
5. Fix any bugs found
6. Verify 60fps performance
7. Clean console (zero errors/warnings)

**Execution:**
```bash
# Run full test suite
npm run dev

# Go through test checklist systematically:
# ✓ Right-click menu works
# ✓ Drag-drop works
# ✓ Selection (single/multi/rectangular) works
# ✓ Connection lines work
# ✓ Delete with confirmation works
# ✓ All keyboard shortcuts work
# ✓ Undo/redo works for all actions
# ✓ Performance: 60fps with 50+ chords
# ✓ Zero console errors

# Test complex workflow:
# 1. Add 5 chords via right-click
# 2. Select 3, duplicate (Cmd+D)
# 3. Move duplicates
# 4. Delete 2 chords
# 5. Undo 4 times
# 6. Redo 2 times
# 7. Verify state is correct
```

**Bug fixing:**
- Use Chrome DevTools to inspect issues
- Check React DevTools for re-render issues
- Profile performance if < 60fps
- Fix any TypeScript errors
- Address any console warnings

---

## Parallel Execution (Advanced)

For experienced developers, some prompts can run in parallel:

**Day 1-2:** Prompts 001 + 002 (context menu + drag-drop)
**Day 3:** Prompt 003 (selection)
**Day 4:** Prompts 004 + 005 (connection lines + delete, if careful)
**Day 5:** Prompt 006 (undo/redo)
**Day 6:** Prompt 007 (integration)

**Total: 6 days** (saves 1 day)

**Risk:** Higher chance of integration conflicts. Only recommended if very comfortable with React and debugging.

---

## Troubleshooting Guide

### TypeScript Errors

**Error:** `Property 'x' does not exist on type 'Y'`

**Solution:**
```bash
# Check type definitions are imported
# Verify interface matches usage
# Run: npx tsc --noEmit
```

**Error:** `Cannot find module '@/components/...'`

**Solution:**
```typescript
// Verify tsconfig.json has paths:
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@types": ["src/types"]
    }
  }
}
```

### Drag-and-Drop Issues

**Issue:** Drag doesn't start

**Solution:**
- Check activation constraint (8px minimum movement)
- Verify sensors are attached to DndContext
- Ensure draggable elements have listeners/attributes

**Issue:** Chord jumps on pickup

**Solution:**
- Set transform-origin to center
- Use `snapCenterToCursor` modifier
- Check initial transform calculation

### Performance Issues

**Issue:** FPS drops during drag

**Solution:**
```css
/* Add to draggable elements */
.draggable {
  will-change: transform;
}
```

```typescript
// Memoize heavy components
const ChordShape = React.memo(({ chord, ...props }) => {
  // component
});

// Use useMemo for expensive calculations
const connections = useMemo(() => {
  return calculateConnections(chords);
}, [chords]);
```

### State Management Issues

**Issue:** State updates don't reflect in UI

**Solution:**
- Check Zustand store is properly subscribed
- Verify state mutations are immutable
- Use Redux DevTools to inspect state changes

---

## Quality Checkpoints

### After Each Prompt

- [ ] Code compiles without errors
- [ ] Feature works as described
- [ ] No console errors
- [ ] TypeScript has no errors (`npx tsc --noEmit`)
- [ ] Git commit with clear message

### After Day 7 (Full Week 2)

- [ ] All test checklist items pass
- [ ] 60fps with 50+ chords
- [ ] Zero console errors/warnings
- [ ] All keyboard shortcuts work
- [ ] Undo/redo works for all actions
- [ ] Demo progression loads correctly
- [ ] Visual polish (smooth animations)
- [ ] Accessibility (keyboard navigation, ARIA)
- [ ] Ready to show to stakeholders

---

## Success Criteria

Week 2 is **COMPLETE** when:

✅ **Functionality:**
- Can add chords via right-click
- Can drag chords smoothly
- Can select single/multiple chords
- Connection lines display and update
- Can delete with confirmation
- All keyboard shortcuts work
- Undo/redo works for all actions

✅ **Quality:**
- 60fps maintained with 50+ chords
- Zero TypeScript errors
- Zero console errors/warnings
- Smooth animations (300-400ms)
- Professional look and feel

✅ **Integration:**
- All features work together
- No conflicts between features
- Demo progression impressive
- Ready for Week 3 (audio)

---

## Next Steps

After Week 2 is complete:

**Week 3:** Audio & Playback
- Audio engine setup (Tone.js)
- SATB auto-voicing (Tonal.js)
- Playback system
- Tempo control
- Visual playback feedback

**Celebration:** You now have a fully interactive chord progression editor! 🎉

---

## Time Tracking

Expected time per prompt:
- Prompt 001: 2-3 hours
- Prompt 002: 3-4 hours
- Prompt 003: 3-4 hours
- Prompt 004: 2-3 hours
- Prompt 005: 3-4 hours
- Prompt 006: 3-4 hours
- Prompt 007: 2-3 hours

**Total: 18-25 hours over 7 days**

Average: 2.5-3.5 hours/day

---

## Tips for Success

1. **Execute in order** - Dependencies matter
2. **Test after each prompt** - Don't accumulate bugs
3. **Commit to Git** - Easy rollback if needed
4. **Take breaks** - Fresh eyes catch bugs
5. **Use Chrome DevTools** - Performance profiler is your friend
6. **Ask for help** - Paste errors back into Claude
7. **Celebrate progress** - You're building something complex!

**Ready to build? Start with Day 1: Right-Click Context Menu!**
