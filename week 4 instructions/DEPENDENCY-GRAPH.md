# Week 4 Dependency Graph

## Visual Graph
```
001 (Analyze Modal)
 ↓ BLOCKS
002 (Backend API)
 ↓ BLOCKS
003 (Display Progression)
 ↓ BLOCKS
 ├─→ 004 (Why This Panel) ────┐
 │                             ├─→ 006 (Integration)
 └─→ 005 (AI Explanations) ───┘
```

## Critical Path
```
001 → 002 → 003 → [004 || 005] → 006
Total: 3h + 3.5h + 2h + 2.5h + 2h = 13 hours minimum
```

## Dependencies Detail

### 001: Analyze Modal
- Depends: Week 1-2 (React, modals)
- Blocks: 002 (needs input format)
- Risk: LOW
- Time: 2-3 hours

### 002: Backend API
- Depends: 001 (modal format)
- Blocks: 003, 004, 005, 006
- Risk: **HIGH** (Essentia installation)
- Time: 3-4 hours

### 003: Display Progression
- Depends: 002 (backend response)
- Blocks: 004, 005 (need chords on canvas)
- Risk: LOW
- Time: 1.5-2 hours

### 004: Why This Panel
- Depends: 003 (chords displayed)
- Blocks: 006 (integration)
- Can run parallel with: 005
- Risk: LOW
- Time: 2-3 hours

### 005: AI Explanations
- Depends: 003 (chord context)
- Blocks: 006 (integration)
- Can run parallel with: 004
- Risk: MEDIUM (API setup)
- Time: 2-3 hours

### 006: Integration
- Depends: ALL above
- Blocks: Nothing (final step)
- Risk: MEDIUM
- Time: 2 hours

## Parallel Opportunities
After 003 completes, run 004 and 005 in parallel:
- Saves 2-3 hours
- Requires managing two prompts simultaneously

## Bottleneck
**Prompt 002 (Backend)** is the primary bottleneck:
- Most complex setup
- External dependencies (Essentia, FFmpeg)
- Blocks everything else

**Mitigation:** 
- Set up environment early (Day 0)
- Test with sample audio immediately
- Have backup plan (mock API responses)
