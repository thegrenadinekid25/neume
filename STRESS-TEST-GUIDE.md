# Harmonic Canvas - Stress Testing Execution Guide

**Purpose:** Validate application performance under extreme conditions
**Duration:** ~2-3 hours
**Prerequisites:** App running locally at http://localhost:3000

---

## Test Suite Overview

| Test | Category | Duration | Priority |
|------|----------|----------|----------|
| 100 Chords Test | Performance | 10 min | CRITICAL |
| Rapid Interactions | Stability | 15 min | CRITICAL |
| Memory Leak Test | Performance | 20 min | HIGH |
| localStorage Quota | Data Integrity | 10 min | HIGH |
| Concurrent AI | API Load | 15 min | MEDIUM |
| Extended Playback | Audio | 15 min | MEDIUM |
| Edge Cases | Robustness | 30 min | HIGH |

**Total:** ~2 hours

---

## Setup

### 1. Prepare Environment

```bash
# Start development server
npm run dev

# In a separate terminal, start backend
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

### 2. Open Developer Tools

- **Chrome:** Cmd/Ctrl + Option + I
- Navigate to **Performance** tab
- Navigate to **Memory** tab
- Keep **Console** tab visible

### 3. Baseline Metrics

Before starting tests, record baseline:

```javascript
// In browser console
console.log('=== BASELINE METRICS ===');
console.log('Memory:', performance.memory.usedJSHeapSize / 1024 / 1024, 'MB');
console.log('Chords:', document.querySelectorAll('[role="button"]').length);
```

---

## Test 1: 100 Chords on Canvas (CRITICAL)

**Objective:** Validate performance with large progressions

**Procedure:**

1. **Clear canvas** (Cmd+N)
2. **Open browser console**
3. **Run this script to create 100 chords:**

```javascript
// Create 100 chords programmatically
for (let i = 0; i < 100; i++) {
  // Right-click at different positions
  const x = 100 + (i % 10) * 150;
  const y = 100 + Math.floor(i / 10) * 100;

  // Simulate right-click and add chord
  // (You'll need to do this manually or use the canvas API)
  console.log(`Add chord ${i+1} at (${x}, ${y})`);
}
```

**Or manually:**
- Right-click canvas 100 times
- Add different chord types each time
- Spread them across the canvas

4. **Measure FPS during playback:**

```javascript
let frameCount = 0;
let lastTime = performance.now();

function measureFPS() {
  frameCount++;
  const now = performance.now();

  if (now >= lastTime + 1000) {
    console.log('FPS:', frameCount);
    frameCount = 0;
    lastTime = now;
  }

  requestAnimationFrame(measureFPS);
}

measureFPS();
```

5. **Click Play**
6. **Observe performance:**
   - FPS should stay above 55 (target: 60)
   - UI should remain responsive
   - No lag when dragging chords
   - Memory should not increase dramatically

**Success Criteria:**
- ✅ FPS ≥ 55 during playback
- ✅ Drag-and-drop remains smooth
- ✅ Memory increase < 100MB
- ✅ No crashes or freezes

**Record Results:**
- Initial FPS: ___
- During playback FPS: ___
- Memory before: ___ MB
- Memory after: ___ MB
- Pass/Fail: ___

---

## Test 2: Rapid Interactions (CRITICAL)

**Objective:** Test stability under rapid user actions

**Procedure:**

1. **Clear canvas**
2. **Run rapid operations** (as fast as possible for 2 minutes):
   - Add chord (right-click)
   - Select chord (click)
   - Delete chord (Delete key)
   - Undo (Cmd+Z)
   - Redo (Cmd+Shift+Z)
   - Duplicate (Cmd+D)
   - Select All (Cmd+A)
   - Clear selection (Escape)

3. **Monitor console for errors**
4. **Check memory:**

```javascript
console.log('Memory:', performance.memory.usedJSHeapSize / 1024 / 1024, 'MB');
```

**Success Criteria:**
- ✅ No crashes
- ✅ No console errors
- ✅ All operations respond correctly
- ✅ Memory stable (< 50MB increase)

**Record Results:**
- Errors encountered: ___
- App crashed: Yes/No
- Memory increase: ___ MB
- Pass/Fail: ___

---

## Test 3: Memory Leak Test (HIGH)

**Objective:** Verify no memory leaks during extended use

**Procedure:**

1. **Record initial memory:**

```javascript
const initialMemory = performance.memory.usedJSHeapSize;
console.log('Initial memory:', initialMemory / 1024 / 1024, 'MB');
```

2. **Perform this cycle 20 times:**
   - Create progression (10 chords)
   - Play progression
   - Save progression
   - Clear canvas
   - Load progression
   - Delete all
   - Wait 5 seconds

3. **Force garbage collection** (in Chrome with --js-flags="--expose-gc"):

```javascript
if (global.gc) global.gc();
```

4. **Record final memory:**

```javascript
const finalMemory = performance.memory.usedJSHeapSize;
const growth = ((finalMemory - initialMemory) / initialMemory) * 100;
console.log('Final memory:', finalMemory / 1024 / 1024, 'MB');
console.log('Growth:', growth.toFixed(2), '%');
```

**Success Criteria:**
- ✅ Memory growth < 20%
- ✅ No continuous upward trend
- ✅ Memory stabilizes after operations

**Record Results:**
- Initial memory: ___ MB
- Final memory: ___ MB
- Growth percentage: ___%
- Pass/Fail: ___

---

## Test 4: localStorage Quota Test (HIGH)

**Objective:** Handle storage limits gracefully

**Procedure:**

1. **Fill localStorage:**

```javascript
function fillLocalStorage() {
  try {
    let i = 0;
    while (true) {
      localStorage.setItem(`test-${i}`, 'x'.repeat(1000));
      i++;
    }
  } catch (e) {
    console.log('localStorage full at', i, 'items');
    console.log('Error:', e.message);
  }
}

fillLocalStorage();
```

2. **Try to save progression**
3. **Check for graceful error handling:**
   - Should show user-friendly message
   - Should not crash
   - Should offer alternatives (export, delete old)

4. **Clean up:**

```javascript
localStorage.clear();
```

**Success Criteria:**
- ✅ Graceful error message shown
- ✅ No crash
- ✅ User can export as alternative
- ✅ Can delete old progressions

**Record Results:**
- Error message shown: Yes/No
- Message was helpful: Yes/No
- App crashed: Yes/No
- Pass/Fail: ___

---

## Test 5: Concurrent AI Requests (MEDIUM)

**Objective:** Validate API handling under load

**Procedure:**

1. **Create 5 different progressions**
2. **For each progression, trigger AI features simultaneously:**
   - Click "Build From Bones"
   - Select chord, click "Refine This"
   - Run analysis

3. **Monitor network tab:**
   - Check request queue
   - Look for rate limiting
   - Verify responses

4. **Check for errors:**

```javascript
// Monitor console for failed requests
console.log('Check network tab for failed requests');
```

**Success Criteria:**
- ✅ All requests complete successfully
- ✅ Responses arrive in reasonable time (<5s)
- ✅ No rate limiting errors
- ✅ UI remains responsive

**Record Results:**
- Requests sent: ___
- Requests succeeded: ___
- Average response time: ___ seconds
- Pass/Fail: ___

---

## Test 6: Extended Playback Test (MEDIUM)

**Objective:** Verify audio stability over time

**Procedure:**

1. **Create large progression:**
   - 50+ chords
   - Various types (triads, 7ths, extensions)
   - Different durations

2. **Set tempo to 60 BPM**
3. **Click Play and let run for 10 minutes**
4. **Monitor:**
   - Audio glitches or pops
   - CPU usage
   - Memory usage
   - FPS

5. **Record metrics every 2 minutes:**

```javascript
setInterval(() => {
  console.log({
    memory: performance.memory.usedJSHeapSize / 1024 / 1024,
    isPlaying: true, // Check playback state
    time: new Date().toISOString()
  });
}, 120000); // Every 2 minutes
```

**Success Criteria:**
- ✅ No audio glitches
- ✅ Playback continuous
- ✅ Memory stable
- ✅ CPU < 50%

**Record Results:**
- Audio quality: Good/Fair/Poor
- Glitches encountered: ___
- Memory drift: ___ MB
- Pass/Fail: ___

---

## Test 7: Edge Cases (HIGH)

**Test 7.1: Empty Canvas**

```javascript
// Try to play empty canvas
// Should show friendly error
```

**Expected:** "No chords to play" or similar message

**Test 7.2: Single Chord**

```javascript
// Add one chord
// Click play
```

**Expected:** Plays successfully for duration

**Test 7.3: Network Offline**

```javascript
// Open DevTools > Network tab
// Set to "Offline"
// Try to use AI features
```

**Expected:** Clear "Network unavailable" error

**Test 7.4: Invalid YouTube URL**

```javascript
// Open Analyze modal
// Enter: "not-a-valid-url"
// Click Analyze
```

**Expected:** Helpful validation error

**Test 7.5: Corrupted localStorage Data**

```javascript
// Corrupt saved progression
localStorage.setItem('harmonic-canvas-progressions', '{invalid json}');

// Try to load progressions
```

**Expected:** Graceful error, doesn't crash

**Test 7.6: Very Long Progression**

```javascript
// Create progression with 200+ chords
// Try to save
// Try to load
// Try to play
```

**Expected:** Works, possibly with performance warning

**Test 7.7: Rapid Modal Opening**

```javascript
// Open and close modals rapidly
for (let i = 0; i < 100; i++) {
  // Press ? to open shortcuts
  // Press Escape to close
  console.log('Iteration', i);
}
```

**Expected:** No crashes, animations stable

**Record Edge Case Results:**
- Empty canvas: Pass/Fail
- Single chord: Pass/Fail
- Network offline: Pass/Fail
- Invalid URL: Pass/Fail
- Corrupted data: Pass/Fail
- Long progression: Pass/Fail
- Rapid modals: Pass/Fail

---

## Results Summary Template

### Overall Stress Test Results

**Date Executed:** __________
**Tester:** __________
**Environment:** Chrome ___ / Firefox ___ / Safari ___

| Test | Status | Notes |
|------|--------|-------|
| 100 Chords | ⬜ Pass ⬜ Fail | ____________ |
| Rapid Interactions | ⬜ Pass ⬜ Fail | ____________ |
| Memory Leak | ⬜ Pass ⬜ Fail | ____________ |
| localStorage Quota | ⬜ Pass ⬜ Fail | ____________ |
| Concurrent AI | ⬜ Pass ⬜ Fail | ____________ |
| Extended Playback | ⬜ Pass ⬜ Fail | ____________ |
| Edge Cases | ⬜ Pass ⬜ Fail | ____________ |

**Overall Assessment:**
⬜ READY FOR PRODUCTION
⬜ MINOR ISSUES (document and fix)
⬜ MAJOR ISSUES (must fix before launch)

**Critical Issues Found:** __________
**Performance Issues:** __________
**Recommendations:** __________

---

## Performance Benchmarks

Record final metrics:

```
Bundle Size: 197.42 KB gzipped ✅ (target: <500KB)
Initial Load: ___ seconds (target: <3s)
Time to Interactive: ___ seconds (target: <3s)
FPS during playback: ___ (target: 60)
Memory usage: ___ MB (target: <200MB)
Lighthouse score: ___ (target: >90)
```

---

## Next Steps

After completing stress tests:

1. ✅ Document all findings
2. ✅ Fix critical issues
3. ✅ Verify fixes with retest
4. ✅ Update TEST-REPORT.md
5. ✅ Mark application ready for production
6. 🚀 Deploy to staging
7. 🚀 Invite beta testers

---

**Remember:** The goal is to find issues BEFORE users do. Be thorough, be creative, try to break the app!

🧪 **Happy stress testing!**
