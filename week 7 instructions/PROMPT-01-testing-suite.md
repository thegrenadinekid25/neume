# PROMPT-01: Testing Suite

## Objective

Establish comprehensive testing coverage including user acceptance test scenarios, performance benchmarks, browser compatibility testing, and accessibility audits to ensure launch readiness.

## Estimated Time: 2 hours

## Context

Before beta launch, we need confidence that the application works correctly across browsers, performs well under load, and meets accessibility standards. This prompt defines what to test and how to measure success.

**Dependencies:**
- All previous weeks (1-6) complete
- Application deployed to staging environment

## Requirements

### 1. User Acceptance Test Scenarios

#### Core Workflow Tests

```markdown
## UAT-01: First-Time User Experience

**Scenario:** New user signs up and creates first block

**Steps:**
1. Navigate to home page
2. Click "Get Started" 
3. Complete signup with email
4. Verify email (check inbox)
5. Log in
6. See welcome overlay
7. Dismiss overlay
8. Right-click canvas → Add chord (I)
9. Add 3 more chords (V, vi, IV)
10. Press spacebar to play
11. Verify audio plays
12. Check auto-save (wait 30s)
13. Refresh page
14. Verify chords restored
15. Click "My Blocks"
16. Verify block appears in library

**Expected:** Complete workflow without errors
**Pass Criteria:** All 16 steps complete successfully
```

```markdown
## UAT-02: Analyze Feature

**Scenario:** User analyzes a song from YouTube

**Steps:**
1. Log in
2. Click "Analyze" button
3. Paste YouTube URL (known song)
4. Click "Analyze"
5. Wait for processing (30-60s)
6. Verify chords appear on canvas
7. Play analyzed progression
8. Click "Why This?" on a chord
9. Read explanation
10. Click "Build From Bones"
11. Navigate through steps
12. Save to library

**Expected:** Complete analysis and educational flow
**Pass Criteria:** Chords extracted, explanations display, save works
```

```markdown
## UAT-03: Refine Feature

**Scenario:** User refines a progression with emotional prompting

**Steps:**
1. Create basic progression (I-V-vi-IV)
2. Select all chords
3. Click "Refine This"
4. Type "more ethereal"
5. View suggestions
6. Preview first suggestion
7. Apply suggestion
8. Verify chord updated
9. Undo (Cmd+Z)
10. Verify reverted
11. Re-apply different suggestion

**Expected:** AI suggestions work, preview/apply functional
**Pass Criteria:** Suggestions appear, preview plays, undo works
```

```markdown
## UAT-04: Offline Behavior

**Scenario:** User works offline then syncs

**Steps:**
1. Log in and create a block
2. Disable network (DevTools → Offline)
3. Verify "Offline" indicator
4. Add new chords
5. Delete a chord
6. Wait 30s (no sync should occur)
7. Re-enable network
8. Verify sync indicator shows "Syncing"
9. Wait for "Saved"
10. Refresh page
11. Verify all changes persisted

**Expected:** Offline changes queue and sync
**Pass Criteria:** No data loss, sync completes
```

```markdown
## UAT-05: Multi-Device Sync

**Scenario:** Same account on two devices

**Steps:**
1. Log in on Device A (Chrome)
2. Log in on Device B (Firefox)
3. On Device A: Create block "Test Block"
4. On Device B: Refresh library
5. Verify block appears on Device B
6. On Device B: Edit block (add chord)
7. On Device A: Refresh
8. Verify edit visible on Device A
9. On both: Edit same chord simultaneously
10. Verify conflict resolution message

**Expected:** Cross-device sync works
**Pass Criteria:** Changes sync within 30s
```

#### Edge Case Tests

```markdown
## UAT-06: Maximum Chords

**Scenario:** Canvas with 64 chords (maximum)

**Steps:**
1. Create block
2. Add 64 chords
3. Try to add 65th chord
4. Verify limit message
5. Play full progression
6. Save and reload
7. Verify all chords preserved

**Expected:** Graceful limit handling
**Pass Criteria:** 64 chords work, 65th prevented
```

```markdown
## UAT-07: Rapid Actions

**Scenario:** User performs rapid actions

**Steps:**
1. Add chord, delete immediately (10x)
2. Select/deselect rapidly (20x)
3. Play/pause rapidly (10x)
4. Undo/redo rapidly (10x)
5. Change tempo rapidly (slide dial)
6. Verify no console errors
7. Verify state is consistent

**Expected:** No crashes or inconsistent state
**Pass Criteria:** Zero errors, correct final state
```

### 2. Performance Benchmarks

```typescript
// src/tests/performance.test.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Benchmarks', () => {
  test('Initial load under 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('Canvas renders 50 chords at 60fps', async ({ page }) => {
    await page.goto('/app');
    
    // Add 50 chords
    for (let i = 0; i < 50; i++) {
      await page.click('[data-testid="add-chord"]');
    }
    
    // Measure frame rate during playback
    const fps = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frames = 0;
        const start = performance.now();
        
        function countFrame() {
          frames++;
          if (performance.now() - start < 1000) {
            requestAnimationFrame(countFrame);
          } else {
            resolve(frames);
          }
        }
        
        requestAnimationFrame(countFrame);
      });
    });
    
    expect(fps).toBeGreaterThanOrEqual(55); // Allow small variance
  });

  test('Audio latency under 100ms', async ({ page }) => {
    await page.goto('/app');
    await page.click('[data-testid="add-chord"]');
    
    // Measure click to sound
    const latency = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        const start = performance.now();
        
        // Listen for audio context start
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        oscillator.connect(audioContext.destination);
        oscillator.start();
        
        const latency = performance.now() - start;
        oscillator.stop();
        audioContext.close();
        
        resolve(latency);
      });
    });
    
    expect(latency).toBeLessThan(100);
  });

  test('Memory stays under 200MB with 50 chords', async ({ page }) => {
    await page.goto('/app');
    
    // Add 50 chords
    for (let i = 0; i < 50; i++) {
      await page.click('[data-testid="add-chord"]');
    }
    
    const metrics = await page.metrics();
    const memoryMB = metrics.JSHeapUsedSize / (1024 * 1024);
    
    expect(memoryMB).toBeLessThan(200);
  });

  test('Bundle size under 500KB gzipped', async () => {
    const stats = require('../dist/stats.json');
    const mainBundle = stats.assets.find(
      (a: { name: string }) => a.name.startsWith('main') && a.name.endsWith('.js')
    );
    const sizeKB = mainBundle.gzipSize / 1024;
    
    expect(sizeKB).toBeLessThan(500);
  });
});
```

### 3. Browser Compatibility Matrix

| Feature | Chrome 90+ | Firefox 88+ | Safari 14+ | Edge 90+ |
|---------|------------|-------------|------------|----------|
| Canvas rendering | Required | Required | Required | Required |
| Audio playback | Required | Required | Required | Required |
| Drag and drop | Required | Required | Required | Required |
| IndexedDB (offline) | Required | Required | Required | Required |
| CSS Grid/Flexbox | Required | Required | Required | Required |
| Web Animations | Required | Required | Required | Required |
| Clipboard API | Optional | Optional | Limited | Optional |
| File System API | Optional | N/A | N/A | Optional |

```typescript
// src/tests/browser-compat.test.ts
test.describe('Browser Compatibility', () => {
  const browsers = ['chromium', 'firefox', 'webkit'];

  for (const browserType of browsers) {
    test.describe(browserType, () => {
      test('Canvas renders correctly', async ({ browser }) => {
        const page = await browser.newPage();
        await page.goto('/app');
        
        // Add chord and verify rendering
        await page.click('[data-testid="add-chord"]');
        const chord = await page.$('[data-testid="chord-shape"]');
        
        expect(chord).toBeTruthy();
      });

      test('Audio context initializes', async ({ page }) => {
        await page.goto('/app');
        
        const hasAudio = await page.evaluate(() => {
          return typeof AudioContext !== 'undefined' || 
                 typeof webkitAudioContext !== 'undefined';
        });
        
        expect(hasAudio).toBe(true);
      });

      test('Drag and drop works', async ({ page }) => {
        await page.goto('/app');
        await page.click('[data-testid="add-chord"]');
        
        const chord = await page.$('[data-testid="chord-shape"]');
        const box = await chord!.boundingBox();
        
        await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
        await page.mouse.down();
        await page.mouse.move(box!.x + 100, box!.y + 50);
        await page.mouse.up();
        
        const newBox = await chord!.boundingBox();
        expect(newBox!.x).not.toBe(box!.x);
      });
    });
  }
});
```

### 4. Accessibility Audit

```typescript
// src/tests/accessibility.test.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('Home page passes WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(results.violations).toEqual([]);
  });

  test('Canvas is keyboard navigable', async ({ page }) => {
    await page.goto('/app');
    
    // Tab to first chord
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify focus visible
    const focused = await page.evaluate(() => {
      return document.activeElement?.getAttribute('data-testid');
    });
    
    expect(focused).toBe('chord-shape');
    
    // Arrow key navigation
    await page.keyboard.press('ArrowRight');
    // ... verify focus moved
  });

  test('Color contrast meets 4.5:1', async ({ page }) => {
    await page.goto('/');
    
    const results = await new AxeBuilder({ page })
      .withTags(['color-contrast'])
      .analyze();
    
    expect(results.violations).toEqual([]);
  });

  test('Screen reader announces chord info', async ({ page }) => {
    await page.goto('/app');
    await page.click('[data-testid="add-chord"]');
    
    const ariaLabel = await page.$eval(
      '[data-testid="chord-shape"]',
      (el) => el.getAttribute('aria-label')
    );
    
    expect(ariaLabel).toMatch(/C major/i);
  });

  test('Modals trap focus', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="login-button"]');
    
    // Tab through modal
    const focusableElements = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const tagName = await page.evaluate(() => 
        document.activeElement?.tagName
      );
      focusableElements.push(tagName);
    }
    
    // Should not include elements outside modal
    const uniqueElements = new Set(focusableElements);
    expect(uniqueElements.size).toBeLessThanOrEqual(5);
  });
});
```

### 5. Test Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
  ],
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 6. Test Checklist

```markdown
## Pre-Launch Test Checklist

### Functional Tests
- [ ] User can sign up with email
- [ ] User can sign up with Google
- [ ] User can sign up with GitHub
- [ ] User can reset password
- [ ] User can create a block
- [ ] User can add/delete chords
- [ ] User can play/pause progression
- [ ] User can adjust tempo
- [ ] User can analyze YouTube URL
- [ ] User can analyze audio file
- [ ] "Why This?" shows explanation
- [ ] "Build From Bones" shows steps
- [ ] "Refine This" shows suggestions
- [ ] User can save to library
- [ ] Library search works
- [ ] Library filters work
- [ ] MIDI export downloads file
- [ ] Undo/redo works
- [ ] Keyboard shortcuts work

### Performance Tests
- [ ] Initial load < 3 seconds
- [ ] 60fps with 50 chords
- [ ] Audio latency < 100ms
- [ ] Memory < 200MB
- [ ] Bundle size < 500KB

### Compatibility Tests
- [ ] Chrome 90+ works
- [ ] Firefox 88+ works
- [ ] Safari 14+ works
- [ ] Edge 90+ works
- [ ] Mobile responsive (768px+)

### Accessibility Tests
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigable
- [ ] Screen reader compatible
- [ ] Color contrast 4.5:1+
- [ ] Focus indicators visible

### Security Tests
- [ ] RLS prevents cross-user access
- [ ] Auth tokens not in localStorage
- [ ] XSS inputs sanitized
- [ ] HTTPS enforced
```

## Technical Constraints

- Use Playwright for E2E tests
- Use axe-core for accessibility
- Run tests in CI on every PR
- Generate HTML reports
- Screenshot on failure

## Quality Criteria

- [ ] All UAT scenarios documented
- [ ] Performance benchmarks defined
- [ ] Browser matrix complete
- [ ] Accessibility audit passes
- [ ] Test configuration ready
- [ ] CI integration works

## Testing Considerations

1. Run full suite before launch
2. Fix all critical/high severity issues
3. Document known limitations
4. Create regression test plan
5. Set up monitoring for production
