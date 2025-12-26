# Week 2 Dependency Graph - Core Interactions

**Visual dependency map showing which prompts must be completed before others.**

---

## Visual Dependency Graph

```
Week 1 (Complete)
    â"‚
    â"œâ"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"
    â"‚                                                       â"‚
    â–¼                                                       â"‚
001: Right-Click Context Menu                               â"‚
    â"‚                                                       â"‚
    â"‚ (Chords can be added)                                â"‚
    â"‚                                                       â"‚
    â–¼                                                       â"‚
002: Drag-and-Drop System ◄────────────────────┐           │
    │                                           │           │
    │ (Chords can be moved)                     │           │
    │                                           │           │
    ▼                                           │           │
003: Selection System                           │           │
    │                                           │           │
    │ (Chords can be selected)                  │           │
    │                                           │           │
    ├──────────────────────┬────────────────────┤           │
    │                      │                    │           │
    ▼                      ▼                    │           │
004: Connection Lines  005: Delete &            │           │
                           Keyboard Shortcuts   │           │
    │                      │                    │           │
    │                      │                    │           │
    └──────────┬───────────┘                    │           │
               │                                │           │
               │                                │           │
               ▼                                │           │
           006: Undo/Redo ◄────────────────────┘           │
               │                                            │
               │ (All actions reversible)                   │
               │                                            │
               ▼                                            │
           007: Integration & Testing ◄────────────────────┘
```

---

## Critical Path

**Longest dependency chain (must execute serially):**

```
Week 1 → 001 → 002 → 003 → 006 → 007
```

**Days:** 7 days (if executing one prompt per day)

**Why critical:**
- 001: Foundation for adding chords
- 002: Foundation for moving chords
- 003: Foundation for selection (used by 005, 006)
- 006: Needs all actions to undo/redo them
- 007: Needs everything to integrate

---

## Parallel Execution Opportunities

### Potential Parallelization

After completing **003 (Selection System)**, you can work on:

**Parallel Track A:**
- 004: Connection Lines (independent of delete/undo)

**Parallel Track B:**
- 005: Delete & Keyboard Shortcuts (independent of connection lines)

**Then merge both tracks at:**
- 006: Undo/Redo (needs both tracks complete)

### Timeline with Parallelization

```
Day 1: 001 (Context Menu)
Day 2: 002 (Drag-Drop)
Day 3: 003 (Selection)
Day 4: 004 + 005 in parallel (if advanced user)
Day 5: 006 (Undo/Redo)
Day 6: 007 (Integration)
```

**Total: 6 days** (saves 1 day)

**Risk level:** ⚠️ **MEDIUM** - Requires careful attention to avoid integration conflicts

---

## Dependency Matrix

| Prompt | Depends On | Blocks | Can Run Parallel With |
|--------|-----------|--------|----------------------|
| 001 | Week 1 | 002, 003, 005, 006, 007 | ❌ None |
| 002 | 001 | 003, 006, 007 | ❌ None |
| 003 | 002 | 004, 005, 006, 007 | ❌ None |
| 004 | 003 | 007 | ✅ 005 (advanced users) |
| 005 | 003 | 006, 007 | ✅ 004 (advanced users) |
| 006 | 002, 003, 005 | 007 | ❌ None |
| 007 | ALL (001-006) | Week 3 | ❌ None |

---

## Detailed Dependencies

### 001: Right-Click Context Menu

**Requires:**
- ✅ Week 1 complete (Canvas, ChordShape components exist)
- ✅ Color system (from Week 1)
- ✅ Chord type definitions (from Week 1)

**Provides:**
- Ability to add chords to canvas
- Foundation for all other interactions

**Blocks:**
- 002 (can't drag chords that don't exist)
- 003 (can't select chords that don't exist)
- 005 (can't delete chords that don't exist)

### 002: Drag-and-Drop System

**Requires:**
- ✅ 001 complete (chords exist on canvas)
- ✅ @dnd-kit installed (from Week 1)
- ✅ ChordShape component (from Week 1)

**Provides:**
- Draggable chords
- Beat snapping
- Store for chord position updates

**Blocks:**
- 003 (selection needs to work with drag)
- 006 (undo/redo needs to reverse moves)

### 003: Selection System

**Requires:**
- ✅ 002 complete (chords can be dragged)
- ✅ Canvas component (from Week 1)

**Provides:**
- Single/multi selection
- Selection state management
- Foundation for group operations

**Blocks:**
- 004 (connection lines can check if chord selected)
- 005 (delete operates on selected chords)
- 006 (undo/redo needs selection state)

**Enables parallel work:** ✅ After 003, can do 004 and 005 simultaneously

### 004: Connection Lines

**Requires:**
- ✅ 003 complete (chords can be selected)
- ✅ Chord positions stable (from 002)

**Provides:**
- Visual progression flow
- Voice leading visualization

**Blocks:**
- 007 (integration needs connection lines)

**Can run parallel with:** ✅ 005 (independent features)

### 005: Delete & Keyboard Shortcuts

**Requires:**
- ✅ 003 complete (selection system exists)
- ✅ Store actions (from 002, 003)

**Provides:**
- Delete functionality
- Complete keyboard shortcut system
- Duplicate functionality

**Blocks:**
- 006 (undo/redo needs to reverse deletes)
- 007 (integration needs all shortcuts)

**Can run parallel with:** ✅ 004 (independent features)

### 006: Undo/Redo System

**Requires:**
- ✅ 002 complete (move actions to undo)
- ✅ 003 complete (selection to restore)
- ✅ 005 complete (delete/duplicate to undo)
- ✅ Store with all actions (from 002, 003, 005)

**Provides:**
- Command pattern
- Undo stack
- Redo stack
- Reversible operations

**Blocks:**
- 007 (integration tests undo/redo)

**Critical:** Cannot run in parallel with anything

### 007: Integration & Testing

**Requires:**
- ✅ ALL prompts 001-006 complete
- ✅ No outstanding bugs from previous prompts

**Provides:**
- Complete Week 2 integration
- Comprehensive testing
- Demo progression
- Week 2 completion

**Blocks:**
- Week 3 (audio features)

**Critical:** Final integration step

---

## Risk Assessment

### High-Risk Dependencies

1. **003 → 006:** Selection system must be solid before undo/redo
   - **Risk:** If selection is buggy, undo/redo will amplify issues
   - **Mitigation:** Thoroughly test 003 before starting 006

2. **002 → 006:** Drag-drop state must be stable
   - **Risk:** Undo/redo of moves could corrupt positions
   - **Mitigation:** Verify drag-drop beat snapping is consistent

3. **005 → 006:** Delete must preserve chord data for undo
   - **Risk:** Deleted chords might lose properties
   - **Mitigation:** Test delete thoroughly before undo/redo

### Medium-Risk Dependencies

4. **001 → 002:** Right-click adds chords that drag uses
   - **Risk:** Chord creation could have incomplete data
   - **Mitigation:** Verify all Chord properties populated

5. **004 ∥ 005:** Parallel execution risk
   - **Risk:** Connection lines and delete might interfere
   - **Mitigation:** Clear separation of concerns (004 is visual only, 005 modifies state)

### Low-Risk Dependencies

6. **Week 1 → 001:** Well-defined interface
   - **Risk:** Week 1 bugs could affect Week 2
   - **Mitigation:** Week 1 should be bug-free before starting

---

## Quality Gates

### After Prompt 003

**STOP and verify:**
- [ ] Right-click menu works perfectly
- [ ] Drag-drop is smooth (60fps)
- [ ] Selection (all 4 modes) works correctly
- [ ] No TypeScript errors
- [ ] No console warnings

**Why:** Prompts 004, 005, 006 all depend on a stable foundation

### After Prompt 005

**STOP and verify:**
- [ ] Delete works correctly
- [ ] Keyboard shortcuts don't conflict
- [ ] Duplicate works as expected
- [ ] Still 60fps performance

**Why:** Undo/redo (006) must reverse all these actions correctly

### After Prompt 006

**STOP and verify:**
- [ ] Undo works for all actions (add, move, delete, duplicate)
- [ ] Redo works correctly
- [ ] No state corruption after 10+ undos/redos
- [ ] Memory doesn't grow indefinitely

**Why:** Integration (007) assumes undo/redo is bulletproof

---

## Recovery Procedures

### If You Get Stuck on a Prompt

**Option 1: Iterate with Claude**
1. Paste the error message back to Claude
2. Ask for specific fix
3. Apply the fix
4. Test again

**Option 2: Simplify**
1. Break the prompt into smaller pieces
2. Get each piece working
3. Integrate pieces

**Option 3: Skip and Return**
1. If a feature is non-critical (e.g., 004 connection lines)
2. Comment out the code
3. Continue to next prompt
4. Return later

**Option 4: Rollback**
1. If completely stuck, revert to last working commit
2. Re-read the prompt more carefully
3. Start fresh with better understanding

### If Integration (007) Fails

**Most likely causes:**
1. A previous prompt wasn't fully tested
2. TypeScript errors were ignored
3. State management inconsistencies

**Solution:**
1. Go back to last quality gate
2. Re-verify all tests pass
3. Fix any skipped issues
4. Continue to integration

---

## Execution Strategies

### Strategy 1: Serial (Safest)

```
Day 1: 001
Day 2: 002
Day 3: 003
Day 4: 004
Day 5: 005
Day 6: 006
Day 7: 007
```

**Pros:** Lowest risk, easiest to debug
**Cons:** Takes full 7 days
**Recommended for:** Most users

### Strategy 2: Partial Parallel (Moderate Risk)

```
Day 1: 001
Day 2: 002
Day 3: 003
Day 4: 004 + 005 (parallel)
Day 5: 006
Day 6: 007
```

**Pros:** Saves 1 day
**Cons:** Potential merge conflicts
**Recommended for:** Experienced React developers

### Strategy 3: Aggressive Parallel (High Risk)

```
Day 1: 001
Day 2: 002
Day 3: 003
Day 4 AM: 004
Day 4 PM: 005
Day 5: 006
Day 6: 007
```

**Pros:** Fastest completion
**Cons:** High risk of bugs and conflicts
**Recommended for:** Expert developers only

---

## Completion Checklist

### After Each Prompt
- [ ] Feature works as described in prompt
- [ ] No TypeScript errors
- [ ] No console errors/warnings
- [ ] Git commit made
- [ ] Quick smoke test passed

### After Week 2 Complete
- [ ] All 7 prompts executed successfully
- [ ] Integration tests (007) all pass
- [ ] Performance: 60fps with 50+ chords
- [ ] Zero TypeScript errors (`npx tsc --noEmit`)
- [ ] Zero console errors
- [ ] Demo progression loads and works
- [ ] Ready to start Week 3

---

## Next Week Dependencies

**Week 3 requires:**
- ✅ Week 2 Prompt 007 complete
- ✅ All interactions working
- ✅ Stable chord state management
- ✅ No outstanding bugs

**Week 3 will add:**
- Audio engine (Tone.js)
- SATB voicing (Tonal.js)
- Playback system
- Tempo control

---

**Use this dependency graph to plan your execution strategy and avoid getting blocked by missing prerequisites!**
