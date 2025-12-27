# Prompt 005: Canvas Grid Component

## Objective
Create the main Canvas component with timeline grid, measure markers, beat indicators, and playhead. This is the workspace where users will build chord progressions.

## Context
The Canvas is the central workspace of Neume - 100% of available screen space between the header and controls. It provides a visual timeline grid where chords are placed and arranged.

**Dependencies:**
- Requires Prompt 003 (Project Structure & Types)
- Requires Prompt 004 (Color System)

**Related Components:** 
- Will contain ChordShape components (Prompt 006)
- Will display watercolor background (Prompt 007)

**Next Steps:** After this, chord shapes will be placed on the canvas

## Requirements

1. **Create scrollable canvas** with horizontal timeline
2. **Render grid lines** for beats and measures
3. **Display timeline ruler** with measure numbers
4. **Show playhead** (vertical line indicating current position)
5. **Support zoom levels** (0.5x to 2x)
6. **Enable horizontal scrolling** for long progressions
7. **Apply key-specific background** based on current key
8. **Show empty state** with helpful message
9. **Handle window resize** appropriately
10. **Provide ref** for child components to access canvas context

## Technical Constraints

- Fixed vertical height (~600px)
- Scrollable horizontal width (dynamic based on progression length)
- Grid spacing: 80px per beat (from spec constants)
- Shows ~8 measures at default zoom
- Smooth scroll performance (60fps)
- Background updates when key changes

## Code Structure

### src/components/Canvas/Canvas.tsx

```typescript
import React, { useRef, useEffect, useState } from 'react';
import { getKeyBackground } from '@/styles/colors';
import { CANVAS_CONFIG } from '@/utils/constants';
import styles from './Canvas.module.css';
import { Playhead } from './Playhead';
import { TimelineRuler } from './TimelineRuler';
import { Grid } from './Grid';

interface CanvasProps {
  currentKey: string;
  currentMode: 'major' | 'minor';
  zoom?: number;
  isPlaying?: boolean;
  playheadPosition?: number; // In beats
  totalBeats?: number;
  onCanvasClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onCanvasRightClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
}

export const Canvas: React.FC<CanvasProps> = ({
  currentKey = 'C',
  currentMode = 'major',
  zoom = 1.0,
  isPlaying = false,
  playheadPosition = 0,
  totalBeats = 32, // Default to 8 measures in 4/4
  onCanvasClick,
  onCanvasRightClick,
  children,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);

  // Calculate canvas width based on total beats and zoom
  useEffect(() => {
    const width = totalBeats * CANVAS_CONFIG.GRID_BEAT_WIDTH * zoom;
    setCanvasWidth(width);
  }, [totalBeats, zoom]);

  // Get background color for current key
  const backgroundColor = getKeyBackground(currentKey, currentMode);

  // Handle right-click (context menu)
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    onCanvasRightClick?.(e);
  };

  return (
    <div className={styles.canvasContainer}>
      {/* Timeline Ruler */}
      <TimelineRuler 
        totalBeats={totalBeats} 
        zoom={zoom}
        beatWidth={CANVAS_CONFIG.GRID_BEAT_WIDTH}
      />

      {/* Main Canvas */}
      <div
        ref={canvasRef}
        className={styles.canvas}
        style={{ backgroundColor }}
        onClick={onCanvasClick}
        onContextMenu={handleContextMenu}
      >
        {/* Background Grid */}
        <Grid 
          width={canvasWidth}
          height={600}
          beatWidth={CANVAS_CONFIG.GRID_BEAT_WIDTH * zoom}
          beatsPerMeasure={4}
        />

        {/* Playhead */}
        {isPlaying && (
          <Playhead 
            position={playheadPosition * CANVAS_CONFIG.GRID_BEAT_WIDTH * zoom}
          />
        )}

        {/* Chord shapes will render here as children */}
        <div className={styles.chordLayer}>
          {children}
        </div>

        {/* Empty State */}
        {!children && (
          <div className={styles.emptyState}>
            <p>Right-click anywhere to add a chord</p>
            <div className={styles.emptyStateArrow}>↗</div>
          </div>
        )}
      </div>
    </div>
  );
};
```

### src/components/Canvas/Grid.tsx

```typescript
import React from 'react';
import styles from './Grid.module.css';

interface GridProps {
  width: number;
  height: number;
  beatWidth: number;
  beatsPerMeasure: number;
}

export const Grid: React.FC<GridProps> = ({
  width,
  height,
  beatWidth,
  beatsPerMeasure,
}) => {
  const beats = Math.ceil(width / beatWidth);
  const beatLines: React.ReactNode[] = [];

  for (let i = 0; i <= beats; i++) {
    const isMeasureLine = i % beatsPerMeasure === 0;
    const x = i * beatWidth;

    beatLines.push(
      <line
        key={`beat-${i}`}
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        className={isMeasureLine ? styles.measureLine : styles.beatLine}
        strokeDasharray={isMeasureLine ? 'none' : '2,2'}
      />
    );
  }

  return (
    <svg
      className={styles.grid}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      {beatLines}
    </svg>
  );
};
```

### src/components/Canvas/TimelineRuler.tsx

```typescript
import React from 'react';
import styles from './TimelineRuler.module.css';

interface TimelineRulerProps {
  totalBeats: number;
  zoom: number;
  beatWidth: number;
}

export const TimelineRuler: React.FC<TimelineRulerProps> = ({
  totalBeats,
  zoom,
  beatWidth,
}) => {
  const measures = Math.ceil(totalBeats / 4); // Assuming 4/4 time
  const measureMarkers: React.ReactNode[] = [];

  for (let i = 1; i <= measures; i++) {
    const x = (i - 1) * 4 * beatWidth * zoom;
    measureMarkers.push(
      <div
        key={`measure-${i}`}
        className={styles.measureMarker}
        style={{ left: `${x}px` }}
      >
        {i}
      </div>
    );
  }

  return (
    <div className={styles.timelineRuler}>
      {measureMarkers}
    </div>
  );
};
```

### src/components/Canvas/Playhead.tsx

```typescript
import React from 'react';
import styles from './Playhead.module.css';

interface PlayheadProps {
  position: number; // In pixels
}

export const Playhead: React.FC<PlayheadProps> = ({ position }) => {
  return (
    <div
      className={styles.playhead}
      style={{ left: `${position}px` }}
    />
  );
};
```

## Styling

### src/components/Canvas/Canvas.module.css

```css
.canvasContainer {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height) - var(--controls-height));
  overflow: hidden;
}

.canvas {
  position: relative;
  height: 600px;
  overflow-x: auto;
  overflow-y: hidden;
  transition: background-color var(--duration-normal) var(--ease-apple-smooth);
  
  /* Watercolor texture effect - will be enhanced in Prompt 007 */
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.chordLayer {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Allow click-through to canvas */
}

.chordLayer > * {
  pointer-events: all; /* Re-enable for chord shapes */
}

.emptyState {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--text-secondary);
  font-size: 15px;
  user-select: none;
}

.emptyStateArrow {
  font-size: 32px;
  margin-top: 12px;
  opacity: 0.5;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
```

### src/components/Canvas/Grid.module.css

```css
.grid {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 0;
}

.beatLine {
  stroke: var(--border-light);
  stroke-width: 1px;
  opacity: 0.3;
}

.measureLine {
  stroke: var(--border-light);
  stroke-width: 1px;
  opacity: 0.5;
}
```

### src/components/Canvas/TimelineRuler.module.css

```css
.timelineRuler {
  position: relative;
  height: 30px;
  background-color: var(--background-secondary);
  border-bottom: 1px solid var(--border-light);
  overflow: hidden;
}

.measureMarker {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: var(--text-secondary);
  font-family: var(--font-ui);
  user-select: none;
  padding-left: 8px;
}
```

### src/components/Canvas/Playhead.module.css

```css
.playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: #E07A5F; /* Red from spec */
  opacity: 0.8;
  pointer-events: none;
  z-index: 100;
  transition: left 50ms linear; /* Smooth movement during playback */
}
```

## Integration Example

### In App.tsx

```typescript
import { Canvas } from '@/components/Canvas/Canvas';
import { useState } from 'react';

function App() {
  const [currentKey, setCurrentKey] = useState('C');
  const [currentMode, setCurrentMode] = useState<'major' | 'minor'>('major');

  return (
    <div className="app">
      <Canvas
        currentKey={currentKey}
        currentMode={currentMode}
        zoom={1.0}
        isPlaying={false}
        playheadPosition={0}
        totalBeats={32}
        onCanvasRightClick={(e) => {
          console.log('Right-clicked at:', e.clientX, e.clientY);
          // Will open context menu in future
        }}
      >
        {/* Chord shapes will be rendered here */}
      </Canvas>
    </div>
  );
}
```

## Quality Criteria

- [ ] Canvas scrolls smoothly horizontally
- [ ] Grid lines are visible and properly spaced
- [ ] Measure numbers display correctly
- [ ] Background color changes with key
- [ ] Empty state shows when no chords present
- [ ] Right-click is captured (prevents browser menu)
- [ ] Playhead animates smoothly during playback
- [ ] Zoom affects grid spacing correctly
- [ ] No performance issues with 100+ beat timeline

## Implementation Notes

1. **Horizontal Scrolling:** The canvas container uses `overflow-x: auto` for natural scrolling behavior.

2. **Zoom Implementation:** Zoom is applied by multiplying the beat width. All child components receive the zoomed width.

3. **Background Transitions:** When key changes, the background color smoothly transitions using CSS transitions.

4. **Empty State:** Only shows when there are no children (chord shapes).

5. **Playhead Movement:** Uses `transition: left 50ms linear` for smooth animation during playback.

6. **Grid Performance:** SVG lines are more performant than CSS borders for large grids.

## Accessibility

- Canvas has proper ARIA labels
- Empty state message is screen-reader friendly
- Keyboard navigation will be added in Week 3
- Focus indicators for interactive elements

## Testing Considerations

Test scenarios:
1. **Background changes:** Switch between keys, verify smooth color transition
2. **Zoom levels:** Test 0.5x, 1x, 2x - grid should scale correctly
3. **Long progressions:** Create 200-beat timeline, verify smooth scrolling
4. **Playhead:** Simulate playback, verify smooth movement
5. **Empty state:** Remove all chords, verify message appears
6. **Right-click:** Verify context menu doesn't show (preventDefault works)

## Performance Optimization

- Grid lines are static SVG (no re-renders)
- Background color uses CSS transition (GPU-accelerated)
- Playhead uses transform (GPU-accelerated)
- Chord layer uses `pointer-events` optimization

## Next Steps

After Canvas is complete:
1. Create ChordShape component (Prompt 006)
2. Place chord shapes on canvas
3. Add watercolor background texture (Prompt 007)
4. Test complete visual system (Prompt 008)

---

**Output Format:** Provide complete Canvas component with Grid, TimelineRuler, and Playhead sub-components, all with proper styling and TypeScript types.
