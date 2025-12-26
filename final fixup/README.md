# Harmonic Canvas - Launch Fixes

**Claude Code prompts to get from 85% → 100% launch-ready**

---

## Overview

Based on the QA test report, your app is **85% complete**. These 4 prompts will fix the remaining issues and get you to **100% launch-ready**.

**Current Status:**
- ✅ Visual system perfect (10/10)
- ✅ Audio system perfect (10/10)
- ✅ Save/load perfect (10/10)
- ✅ Core interactions excellent (9/10)
- ⚠️ AI features need backend (6/10)
- ⚠️ Tutorial has minor bug (7/10)

**After these fixes:**
- 🎯 95/100 quality score
- 🚀 Ready to launch!

---

## The 4 Fixes

### 1. Fix Tutorial Step 2 Bug ⭐⭐⭐
**File:** `01-fix-tutorial-step2.md`  
**Priority:** CRITICAL (blocks launch)  
**Time:** 15-30 minutes  

**Problem:** Play button click doesn't advance tutorial from Step 2  
**Fix:** Add event handler to progress tutorial when Play is clicked  
**Impact:** New users won't get stuck in tutorial

---

### 2. Add Escape Key to Shortcuts Modal ⭐⭐
**File:** `02-add-escape-key-shortcuts.md`  
**Priority:** HIGH (UX improvement)  
**Time:** 10 minutes  

**Problem:** Escape key doesn't close keyboard shortcuts modal  
**Fix:** Add useEffect with Escape key listener  
**Impact:** Standard modal behavior, better UX

---

### 3. Add Loading States to API Calls ⭐⭐
**File:** `03-add-loading-states.md`  
**Priority:** HIGH (UX clarity)  
**Time:** 30-40 minutes  

**Problem:** No feedback when AI features are processing  
**Fix:** Add loading spinners and states to 3 modals  
**Impact:** Users see progress, understand what's happening

**Affected components:**
- AnalyzeModal.tsx
- BuildFromBonesPanel.tsx
- RefineThisModal.tsx

---

### 4. Add Drag Behavior Tooltip ⭐
**File:** `04-add-drag-tooltip.md`  
**Priority:** MEDIUM (UX clarity)  
**Time:** 15-20 minutes  

**Problem:** Unclear what happens when dragging chords  
**Fix:** Add tooltip: "Drag to move • Alt+Drag to connect"  
**Impact:** Users understand interaction model

---

## Execution Order

**Recommended sequence:**

```
Day 1 (Morning - 1 hour):
├── 01-fix-tutorial-step2.md      [30 min]
└── 02-add-escape-key-shortcuts.md [10 min]
    └── Test: Tutorial + shortcuts ✓

Day 1 (Afternoon - 1 hour):
├── 03-add-loading-states.md       [40 min]
└── 04-add-drag-tooltip.md         [20 min]
    └── Test: All features ✓

Total: ~2 hours of coding
```

---

## How to Use These Prompts

### Option 1: Claude Code (Recommended)

1. Open terminal in your project directory
2. Run: `claude-code`
3. Paste entire prompt file (e.g., `01-fix-tutorial-step2.md`)
4. Claude Code will make the changes
5. Review the diff
6. Test the fix
7. Commit the changes

### Option 2: Claude Chat with Computer Use

1. Open Claude chat with computer use enabled
2. Navigate to your project in the file browser
3. Paste the prompt
4. Claude will edit files directly
5. Review changes in your IDE
6. Test and commit

### Option 3: Manual Implementation

1. Read the prompt
2. Locate the files mentioned
3. Make the changes as described
4. Test thoroughly
5. Commit

---

## Testing Checklist

After each fix, test:

### After Fix #1 (Tutorial)
- [ ] Clear localStorage
- [ ] Refresh page
- [ ] Start tutorial
- [ ] Click Play on Step 2
- [ ] Tutorial advances to Step 3 ✓

### After Fix #2 (Escape Key)
- [ ] Press `?` to open shortcuts
- [ ] Press `Escape`
- [ ] Modal closes ✓
- [ ] Can reopen with `?` ✓

### After Fix #3 (Loading States)
- [ ] Click "Analyze" with URL
- [ ] See "Analyzing..." spinner ✓
- [ ] Get result or error ✓
- [ ] Try other AI features ✓

### After Fix #4 (Tooltip)
- [ ] Hover over chord
- [ ] Tooltip appears after 500ms ✓
- [ ] Tooltip text clear ✓
- [ ] Mouse away, tooltip disappears ✓

---

## Complete Testing Flow

After ALL fixes, run this complete test:

```
1. Fresh Start Test
   - Clear localStorage
   - Refresh page
   - Welcome overlay appears ✓
   - Start tutorial ✓
   - Complete all 5 steps ✓
   - No bugs ✓

2. Core Features Test
   - Right-click, add chord ✓
   - Play/pause works ✓
   - Tempo changes work ✓
   - Save progression ✓
   - Load progression ✓
   - Export MIDI ✓

3. AI Features Test (requires backend)
   - Analyze YouTube URL ✓
   - Build From Bones shows steps ✓
   - Refine This gives suggestions ✓
   - All show loading states ✓

4. Shortcuts Test
   - Press `?` ✓
   - Press `Escape` to close ✓
   - Press `Space` (play/pause) ✓
   - Press `⌘Z` (undo) ✓

5. Polish Check
   - Chord drag tooltip visible ✓
   - No console errors ✓
   - Smooth 60fps ✓
   - Looks professional ✓
```

If ALL tests pass → **READY TO LAUNCH! 🚀**

---

## What About the Backend?

These prompts fix **frontend issues only**. The backend deployment is separate:

**Backend checklist:**
- [ ] Deploy FastAPI server (Railway, Render, etc.)
- [ ] Configure environment variables (Claude API key)
- [ ] Test endpoints: `/api/analyze`, `/api/deconstruct`, `/api/suggest`
- [ ] Update frontend `API_BASE_URL` config
- [ ] Verify CORS settings
- [ ] Test end-to-end with frontend

**Estimated time:** 2-4 hours (infrastructure/ops work)

**See:** `FINAL-LAUNCH-PLAN.md` for backend deployment details

---

## Success Metrics

### Before These Fixes
```
Quality Score: 80/100
Launch Ready: 85%
Blockers: 1 (tutorial bug)
Major Issues: 2 (API-related, expected)
Minor Issues: 3
```

### After These Fixes
```
Quality Score: 95/100
Launch Ready: 100% (pending backend)
Blockers: 0
Major Issues: 0 (backend separate)
Minor Issues: 0
```

---

## Estimated Timeline

**Fastest path (focused work):**
- Coding: 2 hours
- Testing: 30 minutes
- Backend deploy: 2-4 hours
- Final verification: 30 minutes
- **Total: 5-7 hours to launch**

**Realistic path:**
- Day 1 Morning: Fixes #1-2 (1 hour)
- Day 1 Afternoon: Fixes #3-4 (1 hour)
- Day 2 Morning: Backend deploy (2-4 hours)
- Day 2 Afternoon: Testing + launch (1 hour)
- **Total: 2 days to launch**

---

## Priority Matrix

| Fix | Priority | Impact | Time | Blocks Launch? |
|-----|----------|--------|------|----------------|
| #1 Tutorial | CRITICAL | HIGH | 30m | YES |
| #2 Escape | HIGH | MEDIUM | 10m | NO |
| #3 Loading | HIGH | HIGH | 40m | NO |
| #4 Tooltip | MEDIUM | LOW | 20m | NO |

**Must complete before launch:** #1  
**Should complete before launch:** #2, #3  
**Nice to have:** #4

---

## When You're Done

After completing all 4 fixes:

1. ✅ Commit all changes
2. ✅ Run full test suite
3. ✅ Build production (`npm run build`)
4. ✅ Deploy to production
5. ✅ Test production URL
6. ✅ Invite beta testers
7. 🚀 **LAUNCH!**

---

## Questions?

Each prompt file contains:
- Clear problem statement
- Root cause analysis
- Step-by-step solution
- Code examples
- Testing instructions
- Success criteria

**If stuck:** The prompts are designed to be self-contained. Everything you need is in each `.md` file.

---

## Files in This Package

```
launch-fixes/
├── README.md (this file)
├── 01-fix-tutorial-step2.md      [CRITICAL]
├── 02-add-escape-key-shortcuts.md [HIGH]
├── 03-add-loading-states.md       [HIGH]
└── 04-add-drag-tooltip.md         [MEDIUM]
```

---

**You're 2 hours of coding away from launch. Let's finish strong! 💪🚀**

---

*Generated: November 30, 2025*  
*Based on: QA Test Report (85% complete)*  
*Goal: 100% launch-ready*
