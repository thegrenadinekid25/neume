# Week 5 Dependency Graph

## Visual Graph

```
[Weeks 1-4 Complete]
         ↓
    ┌────┴────┬────────┬────────┐
    ↓         ↓        ↓        ↓
   001       003      004     [All above]
  (Build)  (Refine)  (Save)      ↓
    ↓                           005
   002                      (Integration)
  (AI Dec)
```

## Critical Path

```
001 → 002 → [003 || 004] → 005

Total Serial: 3.5h + 2.5h + 3.5h + 2.5h = 12 hours
Total Parallel: 3.5h + 2.5h + 3.5h + 2.5h = 12 hours
(No time savings from parallel - features independent)
```

## Dependencies Detail

### 001: Build From Bones Panel
- **Depends on:** Week 4 (analyzed progressions)
- **Blocks:** 002 (needs UI to display results)
- **Can run parallel with:** 003, 004 (independent features)
- **Risk:** LOW
- **Time:** 3-4 hours

### 002: AI Deconstruction System
- **Depends on:** 001 (panel must exist), Week 4 backend
- **Blocks:** 005 (integration testing)
- **Can run parallel with:** 003, 004 (after 001)
- **Risk:** MEDIUM (algorithm complexity)
- **Time:** 2-3 hours

### 003: Refine This Modal
- **Depends on:** Weeks 1-4 (chord system)
- **Blocks:** 005 (integration testing)
- **Can run parallel with:** 001, 002, 004 (all independent)
- **Risk:** MEDIUM (emotional mapping accuracy)
- **Time:** 2-3 hours

### 004: My Progressions System
- **Depends on:** Weeks 1-4 (progression data structure)
- **Blocks:** 005 (integration testing)
- **Can run parallel with:** 001, 002, 003 (all independent)
- **Risk:** LOW
- **Time:** 3-4 hours

### 005: Integration & Polish
- **Depends on:** ALL above (001-004)
- **Blocks:** Nothing (final step)
- **Can run parallel with:** Nothing
- **Risk:** LOW (testing only)
- **Time:** 2-3 hours

## Parallel Execution Strategy

### Recommended Approach
Since 001-004 are mostly independent, you can choose your order:

**Option A: Sequential (Safest)**
```
Day 1: 001 → 002
Day 2: 003
Day 3: 004
Day 4: 005
```

**Option B: Feature-based**
```
Day 1: 001 → 002 (Complete Build From Bones)
Day 2: 003 (Complete Refine This)
Day 3: 004 (Complete My Progressions)
Day 4: 005 (Integration)
```

**Option C: Parallel (Fastest but complex)**
```
Day 1 AM: 001 (Build From Bones UI)
Day 1 PM: 002 (Deconstruction) + 003 (Refine This) parallel
Day 2: 004 (My Progressions)
Day 3: 005 (Integration)
```

## Bottlenecks

**No major bottlenecks** - All features are relatively independent.

Minor dependencies:
- 002 needs 001 (panel must exist to display results)
- 005 needs everything (integration testing)

## Risk Assessment

| Prompt | Complexity | Dependencies | Risk | Mitigation |
|--------|-----------|--------------|------|------------|
| 001 | Medium | Week 4 | LOW | Similar to existing panels |
| 002 | High | 001, Week 4 | MEDIUM | Test algorithm with real pieces |
| 003 | Medium | Week 4 | MEDIUM | Start with simple emotional mappings |
| 004 | Low | Week 4 | LOW | localStorage is straightforward |
| 005 | Low | ALL | LOW | Just testing and polish |

## Time Optimization

**If short on time, prioritize:**
1. **001-002 (Build From Bones)** - Core educational feature
2. **004 (My Progressions)** - Essential for workflow
3. **003 (Refine This)** - Nice to have but can be basic
4. **005 (Integration)** - Required

**Minimum viable Week 5:**
- Build From Bones working (001-002): 6 hours
- Basic save/load (004 simplified): 2 hours  
- Testing (005): 1 hour
**Total: 9 hours**

## Success Indicators

After each prompt:
- ✅ **001:** Panel slides up, shows steps, navigation works
- ✅ **002:** API returns 3-6 meaningful steps with explanations
- ✅ **003:** Type intent → Get relevant suggestions → Apply works
- ✅ **004:** Save → Clear → Load → Exact restoration
- ✅ **005:** All 3 workflow tests pass

---

**Week 5 is highly parallelizable. Choose the approach that fits your working style.**
