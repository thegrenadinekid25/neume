# Week 6 Prompt 003: Performance Optimization

## Objective
Optimize app for 60fps performance, fast load times, and minimal memory usage.

## Performance Targets

| Metric | Target | Current | Tool |
|--------|--------|---------|------|
| Lighthouse Score | >90 | ___ | Lighthouse |
| First Paint | <1.5s | ___ | Lighthouse |
| Time to Interactive | <3s | ___ | Lighthouse |
| Bundle Size | <500KB (gzipped) | ___ | Webpack |
| FPS (playback) | 60fps | ___ | DevTools |
| Memory Usage | <200MB | ___ | Task Manager |

## Optimization Strategies

### 1. React Re-render Optimization

**Problem:** Unnecessary re-renders slow down UI

**Solution:**
```typescript
// Use memo for expensive components
const ChordShape = React.memo(({ chord }) => {
  // Only re-renders if chord changes
}, (prev, next) => prev.chord.id === next.chord.id);

// Use useMemo for expensive calculations
const sortedChords = useMemo(() => {
  return chords.sort((a, b) => a.startBeat - b.startBeat);
}, [chords]);

// Use useCallback for handlers
const handleChordClick = useCallback((id: string) => {
  selectChord(id);
}, [selectChord]);
```

### 2. Canvas Rendering Optimization

**Problem:** Rendering 100+ chords is slow

**Solution:**
```typescript
// Virtual scrolling - only render visible chords
const visibleChords = chords.filter(chord => 
  chord.position.x > viewportX - 100 &&
  chord.position.x < viewportX + viewportWidth + 100
);

// Debounce canvas updates
const debouncedUpdate = useMemo(
  () => debounce(updateCanvas, 16), // 60fps = 16ms
  []
);
```

### 3. Audio Optimization

**Problem:** Audio glitches during playback

**Solution:**
```typescript
// Pre-load audio buffers
await audioEngine.preloadBuffers();

// Use AudioWorklet for heavy processing (not main thread)
const worklet = new AudioWorkletNode(context, 'reverb-processor');

// Dispose unused audio resources
audioEngine.dispose();
```

### 4. Bundle Size Reduction

**Problem:** Large initial bundle

**Solution:**
```typescript
// Code splitting with lazy loading
const AnalyzeModal = lazy(() => import('./AnalyzeModal'));
const BuildFromBonesPanel = lazy(() => import('./BuildFromBonesPanel'));

// Use Suspense for loading
<Suspense fallback={<LoadingSpinner />}>
  <AnalyzeModal />
</Suspense>

// Tree shaking - import only what you need
import { Chord } from 'tonal/packages/chord'; // Not whole tonal
```

### 5. Image Optimization

**Problem:** Large image files

**Solution:**
- Use WebP format (smaller than PNG)
- Compress images (TinyPNG)
- Lazy load non-critical images
- Use SVG for icons (scalable, small)

## Profiling Tools

### Chrome DevTools Performance Tab
1. Open DevTools → Performance
2. Click Record
3. Interact with app (play progression)
4. Stop recording
5. Analyze: Look for long tasks (>50ms)

### React DevTools Profiler
1. Install React DevTools
2. Open Profiler tab
3. Click Record
4. Interact with app
5. See which components re-render

### Lighthouse Audit
```bash
npm run build
npx serve -s build
# Open Chrome Incognito
# Open DevTools → Lighthouse
# Run audit
```

### Bundle Analyzer
```bash
npm install -D webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer build/stats.json
```

## Common Performance Issues

### Issue 1: Slow Canvas Updates
**Symptom:** Lag when dragging chords
**Fix:** Debounce updates, use requestAnimationFrame

### Issue 2: Memory Leaks
**Symptom:** Memory usage grows over time
**Fix:** Clean up listeners, dispose audio nodes

### Issue 3: Large Bundle
**Symptom:** Slow initial load
**Fix:** Code splitting, tree shaking

### Issue 4: Janky Animations
**Symptom:** Animations stutter
**Fix:** Use CSS transforms (GPU), reduce re-paints

## Quality Criteria
- [ ] Lighthouse score >90
- [ ] 60fps during playback
- [ ] <3s time to interactive
- [ ] <500KB bundle (gzipped)
- [ ] No memory leaks (stable over 10 min)
- [ ] Fast canvas interactions

**Estimated Time:** 2-3 hours
