# PROMPT-02: Performance Optimization

## Objective

Optimize Neume for production with bundle size under 500KB, 60fps canvas rendering, code splitting, lazy loading, and React performance best practices.

## Estimated Time: 2 hours

## Context

Performance directly impacts user experience. A slow app feels frustrating; a fast app feels professional. We target: sub-3-second load, 60fps interactions, and minimal memory usage.

**Dependencies:**
- All features complete (Weeks 1-6)
- PROMPT-01: Testing Suite (performance benchmarks defined)

## Requirements

### 1. Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      filename: 'dist/stats.html',
    }),
  ],
});
```

### 2. Code Splitting Strategy

```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';

// Lazy load routes
const Library = lazy(() => import('./pages/Library'));
const Editor = lazy(() => import('./pages/Editor'));
const Analyze = lazy(() => import('./pages/Analyze'));

// Lazy load heavy components
const WhyThisPanel = lazy(() => import('./components/WhyThisPanel'));
const BuildFromBonesPanel = lazy(() => import('./components/BuildFromBonesPanel'));
const RefineModal = lazy(() => import('./components/RefineModal'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/edit/:id" element={<Editor />} />
        <Route path="/analyze" element={<Analyze />} />
      </Routes>
    </Suspense>
  );
}
```

### 3. Chunk Configuration

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-audio': ['tone'],
          'vendor-music': ['tonal'],
          'vendor-ui': ['framer-motion', '@dnd-kit/core'],
          'vendor-data': ['@supabase/supabase-js', '@tanstack/react-query'],
          
          // Feature chunks
          'feature-ai': [
            './src/ai/analyze.ts',
            './src/ai/whyThis.ts',
            './src/ai/buildFromBones.ts',
            './src/ai/refine.ts',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
```

### 4. Image Optimization

```typescript
// vite.config.ts
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 3 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: false },
        ],
      },
    }),
  ],
});
```

### 5. React Performance Optimizations

#### Memoization

```typescript
// Memoize expensive computations
const ChordShape = memo(function ChordShape({ 
  chord, 
  selected, 
  onSelect 
}: ChordShapeProps) {
  // Only re-render if props change
  return (
    <svg className="chord-shape">
      {/* ... */}
    </svg>
  );
});

// Memoize computed values
function Canvas() {
  const chords = useCanvasStore((state) => state.chords);
  
  // Only recompute when chords change
  const sortedChords = useMemo(
    () => [...chords].sort((a, b) => a.startBeat - b.startBeat),
    [chords]
  );
  
  // Stable callback reference
  const handleChordClick = useCallback((id: string) => {
    selectChord(id);
  }, [selectChord]);
  
  return (
    <div className="canvas">
      {sortedChords.map((chord) => (
        <ChordShape
          key={chord.id}
          chord={chord}
          onSelect={handleChordClick}
        />
      ))}
    </div>
  );
}
```

#### Virtualization for Lists

```typescript
// For library with many blocks
import { useVirtualizer } from '@tanstack/react-virtual';

function BlockGrid({ blocks }: { blocks: Block[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: blocks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280, // Card height
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="block-grid-scroll">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <BlockCard block={blocks[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Prevent Unnecessary Re-renders

```typescript
// Use selectors to pick specific state slices
function ChordCount() {
  // Only re-renders when count changes, not on any store update
  const count = useCanvasStore((state) => state.chords.length);
  return <span>{count} chords</span>;
}

// Bad: subscribes to entire store
function BadComponent() {
  const store = useCanvasStore(); // Re-renders on ANY change
  return <span>{store.chords.length}</span>;
}
```

### 6. Audio Optimization

```typescript
// Pre-initialize audio on first interaction
let audioInitialized = false;

async function initAudio() {
  if (audioInitialized) return;
  
  await Tone.start();
  
  // Pre-load synth
  const synth = new Tone.PolySynth(Tone.Synth).toDestination();
  synth.volume.value = -Infinity; // Silent
  synth.triggerAttackRelease('C4', '16n'); // Warm up
  
  audioInitialized = true;
}

// Reuse synth instances
const synthPool = new Map<string, Tone.PolySynth>();

function getSynth(type: string): Tone.PolySynth {
  if (!synthPool.has(type)) {
    synthPool.set(type, createSynth(type));
  }
  return synthPool.get(type)!;
}

// Dispose when not needed
function cleanupAudio() {
  synthPool.forEach((synth) => synth.dispose());
  synthPool.clear();
}
```

### 7. Canvas Rendering Optimization

```typescript
// Use requestAnimationFrame for smooth animations
function usePlaybackAnimation(isPlaying: boolean) {
  const rafRef = useRef<number>();
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    let lastTime = performance.now();

    function animate(currentTime: number) {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      setPosition((prev) => prev + delta * 0.001); // Smooth increment
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  return position;
}

// Batch DOM updates
function batchUpdates(updates: (() => void)[]) {
  ReactDOM.unstable_batchedUpdates(() => {
    updates.forEach((update) => update());
  });
}
```

### 8. Network Optimization

```typescript
// Prefetch critical resources
function prefetchResources() {
  // Prefetch audio impulse response
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = '/impulses/cathedral.wav';
  document.head.appendChild(link);
}

// Cache API responses
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Debounce search requests
const debouncedSearch = useDebouncedCallback(
  (query: string) => searchBlocks(query),
  300
);
```

### 9. CSS Optimization

```css
/* Use GPU acceleration for animations */
.chord-shape {
  transform: translateZ(0); /* Create new layer */
  will-change: transform, opacity; /* Hint to browser */
}

/* Avoid expensive properties in animations */
/* Bad: animating width, height, box-shadow */
/* Good: animating transform, opacity */
.chord-shape:hover {
  transform: scale(1.05) translateZ(0);
}

/* Use CSS containment */
.block-card {
  contain: layout style paint;
}

/* Reduce paint areas */
.canvas {
  overflow: hidden;
  isolation: isolate; /* Create stacking context */
}
```

### 10. Preload Critical Assets

```html
<!-- index.html -->
<head>
  <!-- Preload fonts -->
  <link rel="preload" href="/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/DMSans-Regular.woff2" as="font" type="font/woff2" crossorigin>
  
  <!-- Preload critical CSS -->
  <link rel="preload" href="/styles/critical.css" as="style">
  
  <!-- DNS prefetch for API -->
  <link rel="dns-prefetch" href="https://your-project.supabase.co">
  <link rel="preconnect" href="https://your-project.supabase.co">
</head>
```

### 11. Service Worker (Optional)

```typescript
// src/sw.ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache audio files
registerRoute(
  ({ url }) => url.pathname.startsWith('/impulses/'),
  new CacheFirst({
    cacheName: 'audio-cache',
    plugins: [
      { maxEntries: 10, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 days
    ],
  })
);

// Cache API responses
registerRoute(
  ({ url }) => url.origin === 'https://your-project.supabase.co',
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
  })
);
```

### 12. Performance Monitoring

```typescript
// src/lib/performance.ts
export function reportWebVitals() {
  if (typeof window === 'undefined') return;

  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(logMetric);
    getFID(logMetric);
    getFCP(logMetric);
    getLCP(logMetric);
    getTTFB(logMetric);
  });
}

function logMetric(metric: { name: string; value: number }) {
  // Send to analytics
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/metrics', {
      method: 'POST',
      body: JSON.stringify(metric),
    });
  }
  
  console.log(`[Performance] ${metric.name}: ${metric.value.toFixed(2)}`);
}

// Custom performance marks
export function measureOperation(name: string, fn: () => void) {
  performance.mark(`${name}-start`);
  fn();
  performance.mark(`${name}-end`);
  performance.measure(name, `${name}-start`, `${name}-end`);
}
```

## Technical Constraints

- Bundle size < 500KB gzipped
- Initial load < 3 seconds
- 60fps for all animations
- Memory < 200MB with 50 chords
- Time to Interactive < 4 seconds

## Optimization Checklist

```markdown
## Bundle Size
- [ ] Code split by route
- [ ] Lazy load heavy components
- [ ] Tree shake unused code
- [ ] Compress images
- [ ] Minify CSS/JS

## Runtime Performance
- [ ] Memoize components
- [ ] Use selectors for state
- [ ] Virtualize long lists
- [ ] Debounce expensive operations
- [ ] Use requestAnimationFrame

## Audio
- [ ] Pre-initialize on interaction
- [ ] Pool synth instances
- [ ] Dispose when not needed

## Network
- [ ] Preload critical resources
- [ ] Cache API responses
- [ ] Use stale-while-revalidate
- [ ] Compress API payloads

## CSS
- [ ] GPU-accelerated animations
- [ ] CSS containment
- [ ] Avoid layout thrashing
- [ ] Use efficient selectors
```

## Quality Criteria

- [ ] Bundle analyzer shows < 500KB
- [ ] Lighthouse score > 90
- [ ] 60fps confirmed in DevTools
- [ ] No memory leaks detected
- [ ] Web Vitals all "Good"

## Testing Considerations

1. Profile with React DevTools
2. Test on low-end device
3. Test on slow network (3G)
4. Test with 50+ chords
5. Monitor memory over time
