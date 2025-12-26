# Prompt 004: Connection Lines

## Objective
Create visual connection lines between consecutive chords on the timeline, showing harmonic relationships and voice leading. Lines should be smooth Bézier curves with hand-drawn aesthetic matching the overall design.

## Context
Chords are currently isolated shapes. Connection lines will show the progression flow and help users understand voice leading relationships between chords.

**Dependencies:**
- Requires Week 1 (complete visual system)
- Requires Week 2 Prompts 001-003 (chords can be added, moved, selected)

**Related Components:**
- Canvas component (renders lines as background layer)
- ChordShape component (connection points)

**Next Steps:** Delete & keyboard shortcuts (Prompt 005)

## Requirements

### Core Requirements
1. **Draw lines between consecutive chords** (sorted by startBeat)
2. **Smooth Bézier curves** (S-curve from right edge to left edge)
3. **Hand-drawn aesthetic** (slight irregularity)
4. **Visual hierarchy** (2px stroke, 60% opacity)
5. **Interactive states:**
   - Default: Medium gray
   - Hover: 90% opacity
   - Playing: Highlighted color
6. **Performance:** No lag with 50+ chords
7. **Toggle visibility** (keyboard shortcut or setting)
8. **Avoid overlaps** (control points positioned for clean curves)

### Line Behavior
- Connect chords in timeline order (startBeat)
- Start from right edge of source chord
- End at left edge of target chord
- Use cubic Bézier for smooth S-curve
- Slight wobble for hand-drawn feel

### Visual Design
- Color: Medium gray `#7F8C8D`
- Stroke width: 2px
- Opacity: 60% (default), 90% (hover)
- Hand-drawn: Slight path variation
- No arrowheads (implied direction left-to-right)

## Technical Constraints

- SVG paths for clean scaling
- GPU-accelerated rendering
- Memoize path calculations
- Re-calculate only when chords move
- Layer below chords (z-index: 0)

## Code Structure

### src/components/Canvas/ConnectionLine.tsx

```typescript
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './ConnectionLine.module.css';

interface ConnectionLineProps {
  from: { x: number; y: number; size: number };
  to: { x: number; y: number; size: number };
  isHovered?: boolean;
  isPlaying?: boolean;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  from,
  to,
  isHovered = false,
  isPlaying = false,
}) => {
  // Calculate path
  const path = useMemo(() => {
    return generateConnectionPath(from, to);
  }, [from, to]);

  const strokeColor = isPlaying ? '#4A90E2' : '#7F8C8D';
  const opacity = isHovered ? 0.9 : 0.6;

  return (
    <motion.path
      d={path}
      className={styles.connectionLine}
      stroke={strokeColor}
      strokeWidth={2}
      fill="none"
      opacity={opacity}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
    />
  );
};

/**
 * Generate Bézier curve path with hand-drawn wobble
 */
function generateConnectionPath(
  from: { x: number; y: number; size: number },
  to: { x: number; y: number; size: number }
): string {
  // Start point: right edge of source chord, centered vertically
  const startX = from.x + from.size;
  const startY = from.y + from.size / 2;

  // End point: left edge of target chord, centered vertically
  const endX = to.x;
  const endY = to.y + to.size / 2;

  // Control points for S-curve
  const distance = endX - startX;
  const controlPoint1X = startX + distance * 0.4;
  const controlPoint1Y = startY;

  const controlPoint2X = startX + distance * 0.6;
  const controlPoint2Y = endY;

  // Add slight wobble for hand-drawn feel
  const wobble = () => (Math.random() - 0.5) * 2;

  const cp1X = controlPoint1X + wobble();
  const cp1Y = controlPoint1Y + wobble();
  const cp2X = controlPoint2X + wobble();
  const cp2Y = controlPoint2Y + wobble();

  // Cubic Bézier path
  return `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
}
```

### src/components/Canvas/ConnectionLine.module.css

```css
.connectionLine {
  pointer-events: stroke;
  transition: opacity var(--duration-fast) var(--ease-apple-smooth);
  stroke-linecap: round;
}

.connectionLine:hover {
  opacity: 0.9;
}
```

### src/components/Canvas/ConnectionLines.tsx

Container that renders all connection lines:

```typescript
import React, { useMemo } from 'react';
import { ConnectionLine } from './ConnectionLine';
import { Chord } from '@types';

interface ConnectionLinesProps {
  chords: Chord[];
  playheadPosition?: number;
}

export const ConnectionLines: React.FC<ConnectionLinesProps> = ({
  chords,
  playheadPosition = 0,
}) => {
  // Sort chords by timeline position
  const sortedChords = useMemo(() => {
    return [...chords].sort((a, b) => a.startBeat - b.startBeat);
  }, [chords]);

  // Generate connection pairs
  const connections = useMemo(() => {
    const pairs: Array<{ from: Chord; to: Chord }> = [];

    for (let i = 0; i < sortedChords.length - 1; i++) {
      pairs.push({
        from: sortedChords[i],
        to: sortedChords[i + 1],
      });
    }

    return pairs;
  }, [sortedChords]);

  // Determine which connection is currently playing
  const getIsPlaying = (from: Chord, to: Chord) => {
    return playheadPosition >= from.startBeat && playheadPosition < to.startBeat;
  };

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {connections.map(({ from, to }, index) => (
        <ConnectionLine
          key={`connection-${from.id}-${to.id}`}
          from={{
            x: from.position.x,
            y: from.position.y,
            size: from.size,
          }}
          to={{
            x: to.position.x,
            y: to.position.y,
            size: to.size,
          }}
          isPlaying={getIsPlaying(from, to)}
        />
      ))}
    </svg>
  );
};
```

### Update Canvas.tsx

Add ConnectionLines layer:

```typescript
import { ConnectionLines } from './ConnectionLines';

export const Canvas: React.FC<CanvasProps> = ({
  chords,
  playheadPosition,
  showConnectionLines = true, // NEW: toggle setting
  // ... other props
}) => {
  return (
    <div className={styles.canvasContainer}>
      {/* ... Timeline Ruler ... */}

      <div className={styles.canvas}>
        {/* Background */}
        <WatercolorBackground /* ... */ />

        {/* Grid */}
        <Grid /* ... */ />

        {/* Connection Lines (below chords) */}
        {showConnectionLines && (
          <ConnectionLines
            chords={chords}
            playheadPosition={playheadPosition}
          />
        )}

        {/* Chords Layer */}
        <div className={styles.chordLayer}>
          {children}
        </div>

        {/* Playhead */}
        {isPlaying && <Playhead /* ... */ />}
      </div>
    </div>
  );
};
```

### src/store/canvas-store.ts

Add connection lines visibility toggle:

```typescript
interface CanvasState {
  // ... existing state

  // Settings
  showConnectionLines: boolean;
  toggleConnectionLines: () => void;

  // ... existing actions
}

export const useCanvasStore = create<CanvasState>((set) => ({
  // ... existing state
  showConnectionLines: true,

  toggleConnectionLines: () => set((state) => ({
    showConnectionLines: !state.showConnectionLines
  })),

  // ... existing actions
}));
```

### Keyboard Shortcut

Update `useKeyboardShortcuts.ts`:

```typescript
export function useKeyboardShortcuts() {
  const { 
    selectAll, 
    clearSelection, 
    toggleConnectionLines, // NEW
    selectedChordIds 
  } = useCanvasStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ... existing shortcuts

      // Cmd/Ctrl + L: Toggle connection lines
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        toggleConnectionLines();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectAll, clearSelection, toggleConnectionLines, selectedChordIds]);
}
```

## Advanced: Voice Leading Visualization (Optional)

For future enhancement, show which voices connect:

```typescript
/**
 * Generate multiple lines showing voice connections (SATB)
 */
function generateVoiceLeadingPaths(from: Chord, to: Chord): string[] {
  const voices = ['soprano', 'alto', 'tenor', 'bass'] as const;
  
  return voices.map(voice => {
    // Calculate vertical offset for each voice
    const voiceOffset = getVoiceOffset(voice); // e.g., soprano = -10, bass = +10
    
    const startX = from.position.x + from.size;
    const startY = from.position.y + from.size / 2 + voiceOffset;
    
    const endX = to.position.x;
    const endY = to.position.y + to.size / 2 + voiceOffset;
    
    // Generate Bézier curve for this voice
    // ...
    
    return path;
  });
}
```

## Quality Criteria

- [ ] Lines connect chords in timeline order
- [ ] Smooth Bézier S-curves
- [ ] Hand-drawn wobble visible
- [ ] 60% opacity (default)
- [ ] 90% opacity on hover
- [ ] Playing connections highlighted blue
- [ ] Lines appear/disappear smoothly (400ms)
- [ ] No performance impact with 50+ chords
- [ ] Lines re-calculate when chords move
- [ ] Toggle on/off with Cmd/Ctrl + L
- [ ] Lines layer below chords (z-index correct)
- [ ] No visual glitches during drag

## Implementation Notes

1. **Path Calculation:** Cubic Bézier (`M x y C cp1x cp1y, cp2x cp2y, endx endy`)

2. **Control Points:** Positioned at 40% and 60% of horizontal distance for balanced S-curve.

3. **Wobble:** Applied to control points, not start/end (keeps connections accurate).

4. **Performance:** Memoized path generation, only re-calculate when chord positions change.

5. **SVG Layer:** Single SVG container for all lines is more performant than individual SVGs.

6. **Hover:** Uses `pointer-events: stroke` to make lines hoverable without affecting chord interaction.

## Accessibility

- Connection lines are decorative (aria-hidden="true")
- Don't interfere with keyboard navigation
- Visual-only enhancement

## Performance Optimization

- **Memoization:** useMemo for sorted chords and connection pairs
- **SVG rendering:** More efficient than Canvas for static paths
- **Path caching:** Regenerate only on position change
- **Layer isolation:** SVG layer separate from interactive elements

## Testing Considerations

Test scenarios:
1. **Add chords:** Lines appear between consecutive chords
2. **Move chord:** Lines update in real-time
3. **Toggle visibility:** Cmd+L turns lines on/off
4. **Playback:** Lines highlight during playback
5. **Delete chord:** Lines re-connect correctly
6. **50+ chords:** No performance degradation
7. **Hover:** Line opacity increases

## Visual Examples

**Expected appearance:**

```
    Chord 1 ─────╮
                  ╰─── Chord 2 ─────╮
                                     ╰─── Chord 3
```

Smooth, organic curves that feel hand-drawn but clear.

## Next Steps

After connection lines are working:
1. Add delete functionality (Prompt 005)
2. Keyboard shortcuts for edit operations
3. Undo/redo (Prompt 006)

---

**Output Format:** Provide complete ConnectionLine component, ConnectionLines container, updated Canvas with lines layer, toggle functionality in store, and keyboard shortcut. Ensure smooth curves, proper z-index layering, and good performance.
