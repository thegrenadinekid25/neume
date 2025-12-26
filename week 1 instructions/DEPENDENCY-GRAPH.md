# Week 1 Dependency Graph

This document shows the dependencies between all Week 1 tasks and the recommended execution order.

---

## Visual Dependency Graph

```
                    START
                      │
                      ↓
        ┌─────────────────────────┐
        │  001: Project Setup     │ ← CRITICAL PATH START
        │  (Vite + React + TS)    │
        └─────────────────────────┘
                      │
                      ↓
        ┌─────────────────────────┐
        │  002: Dependencies      │
        │  (npm install all libs) │
        └─────────────────────────┘
                      │
                      ↓
        ┌─────────────────────────┐
        │  003: Structure & Types │
        │  (Folders + TS types)   │
        └─────────────────────────┘
                      │
            ┌─────────┴─────────┐
            │                   │
            ↓                   ↓
  ┌──────────────────┐   ┌──────────────────┐
  │  004: Colors     │   │  005: Canvas     │
  │  (Color system)  │   │  (Grid + Ruler)  │
  └──────────────────┘   └──────────────────┘
            │                   │
            └─────────┬─────────┘
                      │
                      ↓
        ┌─────────────────────────┐
        │  006: ChordShape        │ ← CRITICAL PATH
        │  (All 7 shapes + SVG)   │
        └─────────────────────────┘
                      │
                      ↓
        ┌─────────────────────────┐
        │  007: Watercolor        │
        │  (Background effect)    │
        └─────────────────────────┘
                      │
                      ↓
        ┌─────────────────────────┐
        │  008: Integration       │ ← CRITICAL PATH END
        │  (Demo + Testing)       │
        └─────────────────────────┘
                      │
                      ↓
                  COMPLETE!
                  (Week 1 Done)
```

---

## Dependency Matrix

| Prompt | Depends On | Can Start After | Blocks | Parallel With |
|--------|------------|----------------|--------|---------------|
| 001 | None | Immediately | All others | None |
| 002 | 001 | Day 1 | All others | None |
| 003 | 002 | Day 2 | 004, 005, 006 | None |
| 004 | 003 | Day 3 | 006, 007 | 005 |
| 005 | 003 | Day 4 | 006, 007 | 004 |
| 006 | 003, 004, 005 | Day 5 | 007, 008 | None |
| 007 | 004, 005 | Day 6 | 008 | None |
| 008 | All (001-007) | Day 7 | None | None |

---

## Critical Path

The **critical path** (longest sequence of dependent tasks) is:

```
001 → 002 → 003 → 006 → 007 → 008
```

**Duration:** 7 days (if following day-by-day plan)

**Bottleneck:** Prompt 006 (ChordShape) is the most complex and blocks both 007 and 008.

---

## Parallel Work Opportunities

### After Prompt 003 (Day 2)

You can work on **004 and 005 in parallel** if desired:

```
        003: Structure & Types
              ↓
        ┌─────┴─────┐
        ↓           ↓
    004: Colors  005: Canvas
        └─────┬─────┘
              ↓
          006: ChordShape
```

**Benefit:** Could save ~0.5 day
**Risk:** Increased cognitive load, potential merge conflicts
**Recommendation:** Only do this if comfortable with both topics

### Serial vs. Parallel Execution

**Serial (Recommended for Week 1):**
- Easier to debug
- Lower cognitive load
- Safer for first-time execution
- Timeline: 7 days

**Partial Parallel:**
- Do 004 and 005 together on Day 3-4
- Saves ~0.5 day
- Timeline: 6.5 days

**Not Recommended:**
- Running 3+ prompts in parallel
- Skipping ahead
- Out-of-order execution

---

## Task Complexity & Time Estimates

| Prompt | Complexity | Time Estimate | Difficulty |
|--------|-----------|---------------|------------|
| 001 | Low | 30 min | ⭐ Easy |
| 002 | Low | 15 min | ⭐ Easy |
| 003 | Medium | 45 min | ⭐⭐ Moderate |
| 004 | Medium | 30 min | ⭐⭐ Moderate |
| 005 | Medium | 1 hour | ⭐⭐ Moderate |
| 006 | **High** | **2-3 hours** | ⭐⭐⭐ Complex |
| 007 | Medium | 45 min | ⭐⭐ Moderate |
| 008 | Medium | 2 hours | ⭐⭐ Moderate |

**Total:** ~8-10 hours of focused work

---

## Blocking Relationships

### What Each Prompt Blocks

**001 blocks:** Everything (foundation)

**002 blocks:** Everything (need dependencies)

**003 blocks:**
- 004 (needs type definitions)
- 005 (needs type definitions)
- 006 (needs types and structure)

**004 blocks:**
- 006 (ChordShape needs colors)
- 007 (Watercolor needs colors)

**005 blocks:**
- 006 (ChordShape renders in Canvas)
- 007 (Watercolor applies to Canvas)

**006 blocks:**
- 008 (Integration needs shapes)

**007 blocks:**
- 008 (Integration needs complete visual system)

---

## Risk Analysis

### High-Risk Dependencies

**🔴 003 → 006 (CRITICAL)**
- If types are wrong, shapes won't compile
- Mitigation: Thoroughly test 003 with `npx tsc --noEmit`

**🔴 004 → 006 (CRITICAL)**
- If colors are wrong, shapes will be wrong colors
- Mitigation: Verify colors match spec hex values exactly

**🔴 006 → 008 (CRITICAL)**
- If shapes don't work, demo won't work
- Mitigation: Test each shape type individually before moving on

### Medium-Risk Dependencies

**🟡 005 → 007**
- If Canvas has issues, watercolor might not apply correctly
- Mitigation: Verify Canvas renders before adding watercolor

**🟡 All → 008**
- Integration depends on everything working
- Mitigation: Test each component individually before integration

---

## Execution Strategy

### Recommended Approach: Serial with Checkpoints

```
Day 1:  001 ✓ → 002 ✓
        Checkpoint: Dev server runs

Day 2:  003 ✓
        Checkpoint: Types compile

Day 3:  004 ✓
        Checkpoint: Colors import correctly

Day 4:  005 ✓
        Checkpoint: Canvas displays with grid

Day 5:  006 ✓
        Checkpoint: All 7 shapes render

Day 6:  007 ✓
        Checkpoint: Background has texture

Day 7:  008 ✓
        Checkpoint: Full demo works
```

### Alternative: Slightly Accelerated

```
Day 1:  001 ✓ → 002 ✓
Day 2:  003 ✓
Day 3:  004 ✓ + 005 ✓ (parallel)
Day 4:  006 ✓
Day 5:  007 ✓ + 008 ✓ (if 007 is quick)
```

**Savings:** 1-2 days
**Risk:** Higher cognitive load, more potential for errors

---

## Quality Gates

### Gate 1: After 003 (Structure & Types)

**Must verify:**
- [ ] `npx tsc --noEmit` succeeds
- [ ] All folders created
- [ ] Can import types: `import { Chord } from '@types'`

**If fails:** Stop, debug types before continuing

---

### Gate 2: After 005 (Canvas)

**Must verify:**
- [ ] Canvas displays with grid
- [ ] Background color changes with key
- [ ] No console errors

**If fails:** Stop, debug Canvas before shapes

---

### Gate 3: After 006 (ChordShape)

**Must verify:**
- [ ] All 7 shapes render
- [ ] Colors match spec
- [ ] Hover/select works

**If fails:** Stop, debug shapes before proceeding

---

### Gate 4: After 008 (Integration)

**Must verify:**
- [ ] All success criteria met
- [ ] Demo functional
- [ ] 60fps performance

**If fails:** Identify which component has issues, fix before claiming completion

---

## Recovery Plan

### If You Get Stuck

**On Prompt 001-003:**
- These are foundational, must be perfect
- Don't proceed until they work
- Ask Claude for help in new conversation
- Consider starting over if severely broken

**On Prompt 004-005:**
- Can isolate and test independently
- Create minimal test component
- Verify one piece at a time

**On Prompt 006:**
- Most complex prompt, expect to spend time here
- Test each shape type individually
- Simplify wobble if needed for first pass
- Can refine later

**On Prompt 007-008:**
- These add polish, less critical than foundation
- Can simplify watercolor effect if needed
- Integration is about wiring, not new logic

---

## Completion Criteria

Week 1 is complete when:

âœ… All 8 prompts executed
âœ… All dependencies satisfied
âœ… All quality gates passed
âœ… Integration demo works
âœ… Success criteria met
âœ… No blocking issues remain

---

## Next Steps (Week 2 Preview)

Week 2 dependencies will build on Week 1:

```
Week 1 Complete (001-008)
        ↓
    ┌───┴───┐
    ↓       ↓
Context    Drag-Drop
Menu       System
    └───┬───┘
        ↓
    Selection
    System
        ↓
    Undo/Redo
```

**Critical:** Week 1 must be solid before Week 2 begins!

---

## Summary

**Sequential Execution:** 001 → 002 → 003 → 004 → 005 → 006 → 007 → 008

**Critical Path:** 001 → 002 → 003 → 006 → 007 → 008

**Parallel Opportunities:** 004 & 005 (after 003)

**Highest Risk:** 003 → 006 (types to shapes)

**Most Complex:** 006 (ChordShape component)

**Estimated Duration:** 7 days (serial), 6 days (partial parallel)

**Success Metric:** Integration demo works smoothly

---

Ready to execute! Start with Prompt 001 and follow the critical path. 🚀
