# Week 2 Prompt Package - Core Interactions

**Harmonic Canvas Development - Phase 1, Week 2**

Transform the static visual foundation from Week 1 into a fully interactive chord progression builder.

---

## 📦 Package Contents

**7 Code Generation Prompts + 4 Supporting Documents**

### Prompts
1. **001-right-click-context-menu.md** - Add chords via right-click
2. **002-drag-drop-system.md** - Reposition chords with drag-and-drop
3. **003-selection-system.md** - Select single/multiple chords
4. **004-connection-lines.md** - Visual voice leading connections
5. **005-delete-keyboard-shortcuts.md** - Delete and keyboard shortcuts
6. **006-undo-redo-system.md** - Full undo/redo with command pattern
7. **007-integration-testing.md** - Integration tests and demo

### Supporting Documentation
- **EXECUTION-GUIDE.md** - Step-by-step implementation guide
- **DEPENDENCY-GRAPH.md** - Task dependencies and critical path
- **SUCCESS-CRITERIA.md** - Measurable completion criteria
- **README.md** - This file

---

## 🎯 What You'll Build

By the end of Week 2, you'll have a **fully interactive chord progression builder** with:

### Core Features
âœ… **Context Menu** - Right-click to add any of 7 chord types  
âœ… **Drag-and-Drop** - Smooth, snapping chord repositioning  
âœ… **Selection System** - Single, multi, and rectangular selection  
âœ… **Connection Lines** - Beautiful Bézier curves showing progression flow  
âœ… **Delete** - Remove chords with confirmation for large deletions  
âœ… **Undo/Redo** - Full command pattern with 50-action history  
âœ… **Keyboard Shortcuts** - Professional power-user workflow  

### Interaction Capabilities
- **Add chords** - Right-click anywhere on canvas
- **Move chords** - Drag to reposition, snap to beats
- **Select chords** - Click, Cmd/Ctrl+Click, Shift+Click, drag rectangle
- **Multi-drag** - Select multiple, drag one, all move together
- **Duplicate** - Cmd/Ctrl+D duplicates selection
- **Delete** - Backspace/Delete removes selected
- **Undo/Redo** - Cmd/Ctrl+Z reverses any action
- **Arrow keys** - Fine positioning (1px or 10px with Shift)
- **Toggle lines** - Cmd/Ctrl+L shows/hides connections

---

## ⚡ Quick Start

### Prerequisites
- ✅ Week 1 completed (all 8 prompts executed successfully)
- Node.js 18+
- VS Code (recommended)
- 3-4 hours/day for 4-5 days

### Execution Steps

1. **Read EXECUTION-GUIDE.md** (15 minutes)
   - Understand the day-by-day plan
   - Review prompt execution process

2. **Check DEPENDENCY-GRAPH.md** (5 minutes)
   - See task relationships
   - Identify critical path

3. **Execute prompts in order** (4-5 days)
   - 001 → 002 → 003 → 004 → 005 → 006 → 007
   - Test after each prompt
   - Commit working code to Git

4. **Verify SUCCESS-CRITERIA.md** (30 minutes)
   - Run through all test scenarios
   - Confirm performance targets
   - Fix any issues

---

## 📋 Prompt Overview

### 001: Right-Click Context Menu (2 hours)
**What:** Context menu that appears on right-click, showing 7 chord options (I-vii)  
**Key Components:** ContextMenu, ChordContextMenu, portal rendering  
**Integration:** Canvas component handles right-click events  
**Test:** Right-click → Menu appears → Click chord → Chord added

### 002: Drag-and-Drop System (2-3 hours)
**What:** Full drag-and-drop using @dnd-kit with beat snapping  
**Key Components:** DraggableChord, DroppableCanvas, Zustand store  
**Integration:** Wraps Canvas in DndContext, uses sensors  
**Test:** Drag chord → Snaps to beat → Position updates

### 003: Selection System (2-3 hours)
**What:** Single, multi, range, and rectangular selection  
**Key Components:** SelectionBox, selection actions in store  
**Integration:** Canvas handles click events and selection rectangle  
**Test:** Click chord → Selected (blue stroke)  
**Test:** Cmd+A → All selected  
**Test:** Drag rectangle → Chords within selected

### 004: Connection Lines (1.5 hours)
**What:** Bézier curves connecting consecutive chords  
**Key Components:** ConnectionLine, ConnectionLines container  
**Integration:** SVG layer below chords in Canvas  
**Test:** Add 3 chords → Lines connect them  
**Test:** Move chord → Lines update  
**Test:** Cmd+L → Lines toggle

### 005: Delete & Keyboard Shortcuts (2 hours)
**What:** Delete functionality with confirmation + complete keyboard shortcut system  
**Key Components:** DeleteConfirmation modal, KeyboardShortcutsGuide, useKeyboardShortcuts hook  
**Integration:** Global keyboard listener, store actions  
**Test:** Select 2 chords, Delete → Removed  
**Test:** Select 6 chords, Delete → Confirmation appears  
**Test:** Arrow keys → Selected chords move

### 006: Undo/Redo System (2-3 hours)
**What:** Command pattern with undo/redo for all actions  
**Key Components:** Command classes, undo/redo in store  
**Integration:** Wrap actions in commands, maintain stacks  
**Test:** Add chord, Cmd+Z → Chord removed  
**Test:** Delete 3, Cmd+Z → All 3 restored  
**Test:** Undo, redo, new action → Redo stack clears

### 007: Integration Testing (1-2 hours)
**What:** Complete integrated demo and comprehensive testing  
**Key Components:** Header, BottomControls, complete App.tsx  
**Integration:** All features working together seamlessly  
**Test:** Complete 5-minute workflow → All features work

---

## 🎨 Visual Design Features

### Selection States
- **Default:** Normal appearance
- **Hover:** Scale 1.05x, enhanced shadow
- **Selected:** Blue stroke 3.5px, scale 1.03x
- **Dragging:** Scale 1.15x, strong shadow

### Connection Lines
- **Color:** Medium gray #7F8C8D
- **Style:** Smooth Bézier S-curves with hand-drawn wobble
- **Opacity:** 60% (default), 90% (hover), blue when playing
- **Animation:** Draw-in over 400ms

### Context Menu
- **Appearance:** White background, clean list
- **Items:** All 7 scale degrees with color dots
- **Positioning:** Viewport-aware (stays in bounds)
- **Animation:** Fade-in 150ms

---

## ⌨️ Keyboard Shortcuts

### Selection
- **Cmd/Ctrl + A** - Select all chords
- **Escape** - Clear selection

### Edit Operations
- **Cmd/Ctrl + D** - Duplicate selected
- **Delete/Backspace** - Delete selected
- **Cmd/Ctrl + Z** - Undo
- **Cmd/Ctrl + Shift + Z** - Redo

### Positioning
- **Arrow Keys** - Move selected 1px
- **Shift + Arrow Keys** - Move selected 10px

### View
- **Cmd/Ctrl + L** - Toggle connection lines

### Help
- **?** - Show keyboard shortcuts guide

---

## 🔧 Technology Stack

**All from Week 1, Plus:**
- **@dnd-kit/core** - Drag-and-drop (already installed)
- **@dnd-kit/utilities** - Helper utilities (already installed)
- **Command Pattern** - For undo/redo (implemented in code)

**No new dependencies needed!**

---

## ✅ Success Metrics

By the end of Week 2, you should have:

### Functional
- âœ… Right-click adds chords
- âœ… Drag-and-drop repositions chords (snaps to beats)
- âœ… All selection modes work (single, multi, range, rectangular)
- âœ… Connection lines connect consecutive chords
- âœ… Delete removes chords with confirmation
- âœ… Undo/redo reverses all actions
- âœ… All keyboard shortcuts functional

### Performance
- âœ… 60fps maintained with 100+ chords
- âœ… Drag feels smooth and responsive
- âœ… Selection instant even with many chords
- âœ… Undo/redo operations < 100ms

### Quality
- âœ… Zero TypeScript errors (`npx tsc --noEmit` passes)
- âœ… No console warnings or errors
- âœ… Keyboard-only workflow possible
- âœ… Professional polish and animations

---

## 📊 Estimated Timeline

### Serial Execution (Recommended for First Time)
- **Day 1:** Prompt 001 (2h) + 002 part 1 (1.5h)
- **Day 2:** Prompt 002 complete + 003 (3.5h)
- **Day 3:** Prompt 003 complete + 004 (3h)
- **Day 4:** Prompt 005 + 006 part 1 (3.5h)
- **Day 5:** Prompt 006 complete + 007 (4h)

**Total:** 4-5 days × 3-4 hours/day = **16-20 hours**

### Partial Parallel (Advanced)
Can work on 004 (connection lines) while testing 003 (selection), saving ~2-3 hours.

---

## 🎯 Critical Path

```
001 (Context Menu)
 â†"
002 (Drag-Drop)
 â†"
003 (Selection)
 ↓
005 (Delete) → 006 (Undo/Redo) → 007 (Integration)
 ↓
004 (Connection Lines) can run parallel after 003
```

**Bottleneck:** Prompts 005-006-007 must be serial. Budget time accordingly.

---

## 🐛 Common Issues & Solutions

### Issue: Drag doesn't activate
**Solution:** Check activation constraint (8px distance), ensure listeners attached

### Issue: Selection doesn't work
**Solution:** Verify event propagation, check z-index layering

### Issue: Undo restores wrong state
**Solution:** Ensure command constructor captures data BEFORE execution

### Issue: Context menu appears off-screen
**Solution:** Check viewport-aware positioning logic

### Issue: Connection lines don't update
**Solution:** Verify useMemo dependencies include chord positions

---

## 📝 Tips for Success

1. **Test frequently** - After each prompt, verify it works before moving on
2. **Commit often** - Git commit after each working prompt
3. **Read carefully** - Each prompt has detailed implementation notes
4. **Use the examples** - Code examples in prompts are production-quality
5. **Check dependencies** - Don't skip prompts; they build on each other
6. **Take breaks** - 2-3 hour sessions work better than marathon coding
7. **Ask Claude** - If stuck, paste the error and prompt context into new chat

---

## 🚀 After Week 2

You'll have a **fully functional chord progression builder** that:
- Feels professional and polished
- Supports efficient power-user workflows
- Handles complex interactions smoothly
- Provides immediate visual feedback

### Next: Week 3 - Audio & Playback
- Tone.js audio engine setup
- SATB auto-voicing with Tonal.js
- Playback system with pulse animations
- Tempo dial control
- Beautiful cathedral reverb

---

## 📚 Additional Resources

### Week 1 Recap
If you haven't completed Week 1, go back and execute those 8 prompts first:
- Project setup
- Dependencies
- TypeScript types
- Color system
- Canvas grid
- Chord shapes (7 types)
- Watercolor backgrounds
- Integration demo

### Documentation
- Main spec: `harmonic-canvas-final-spec.md`
- Research: `harmonic-canvas-open-source-research.md`
- Project management: `harmonic-canvas-pm-prompt.md`

---

## ✨ Ready?

1. Open EXECUTION-GUIDE.md
2. Start with Prompt 001
3. Build something extraordinary

**Let's make Harmonic Canvas fully interactive!** 🎵🎹✨
