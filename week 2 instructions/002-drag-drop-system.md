# Prompt 002: Drag-and-Drop System

## Objective
Implement drag-and-drop functionality using @dnd-kit to allow users to reposition chords on the canvas. Chords should snap to beats, show drag preview, and update positions smoothly.

## Context
Users can now add chords via right-click (Prompt 001), but can't move them. This prompt makes chords draggable, enabling users to arrange their progressions visually.

**Dependencies:**
- Requires Week 1 (complete visual system)
- Requires Week 2 Prompt 001 (context menu)
- @dnd-kit/core already installed (Week 1 Prompt 002)

**Related Components:**
- ChordShape component (Week 1 Prompt 006)
- Canvas component (Week 1 Prompt 005)

**Next Steps:** Selection system (Prompt 003) will build on this

## Requirements

### Core Requirements
1. **Chords are draggable** with mouse
2. **Drag preview** shows during drag (lifted appearance)
3. **Snap to grid** (beat positions)
4. **Smooth animations** when released
5. **Visual feedback** (cursor changes, scale effect)
6. **Performance** (60fps with 50+ chords)
7. **Boundary constraints** (can't drag outside canvas)
8. **Cancel drag** (Escape key)
9. **Keyboard support** (arrow keys for fine positioning)
10. **Accessible** (screen reader announces position)

### Drag Behavior
- Click and hold to drag
- Chord scales to 1.15x when picked up
- Semi-transparent shadow during drag
- Snaps to nearest beat on release
- Smooth animation back to rest position

### Grid Snapping
- Horizontal: Snap to beat positions (every 80px at 1x zoom)
- Vertical: Free movement OR snap to register lanes (future)
- Visual guides show snap positions

## Technical Constraints

- Use @dnd-kit/core (already installed)
- GPU-accelerated transforms
- No layout thrashing
- Memoized drag handlers
- Clean up event listeners

## Code Structure

### src/hooks/useDragDrop.ts

```typescript
import { useSensors, useSensor, PointerSensor } from '@dnd-kit/core';

/**
 * Custom hook for drag-and-drop sensors and configuration
 */
export function useDragDrop() {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum 8px movement to start drag (prevents accidental drags)
      },
    })
  );

  return { sensors };
}
```

### src/components/Canvas/DraggableChord.tsx

```typescript
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ChordShape } from './ChordShape';
import { Chord } from '@types';

interface DraggableChordProps {
  chord: Chord;
  isSelected?: boolean;
  isPlaying?: boolean;
  onSelect?: () => void;
  zoom?: number;
  beatWidth: number;
}

export const DraggableChord: React.FC<DraggableChordProps> = ({
  chord,
  isSelected,
  isPlaying,
  onSelect,
  zoom = 1.0,
  beatWidth,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: chord.id,
    data: {
      chord,
      type: 'chord',
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    // Scale up during drag
    ...(isDragging && {
      transform: `${CSS.Translate.toString(transform)} scale(1.15)`,
      cursor: 'grabbing',
      zIndex: 1000,
    }),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <ChordShape
        chord={chord}
        isSelected={isSelected}
        isPlaying={isPlaying}
        onSelect={onSelect}
        zoom={zoom}
        isDragging={isDragging}
      />
    </div>
  );
};
```

### src/components/Canvas/DroppableCanvas.tsx

```typescript
import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { useDragDrop } from '@/hooks/useDragDrop';
import { Canvas } from './Canvas';
import { DraggableChord } from './DraggableChord';
import { ChordShape } from './ChordShape';
import { Chord } from '@types';
import { CANVAS_CONFIG } from '@/utils/constants';

interface DroppableCanvasProps {
  chords: Chord[];
  currentKey: string;
  currentMode: 'major' | 'minor';
  zoom: number;
  onUpdateChordPosition: (chordId: string, newPosition: { x: number; y: number }, newBeat: number) => void;
  onAddChord: (chord: Chord) => void;
  // ... other props
}

export const DroppableCanvas: React.FC<DroppableCanvasProps> = ({
  chords,
  currentKey,
  currentMode,
  zoom,
  onUpdateChordPosition,
  onAddChord,
  // ... other props
}) => {
  const { sensors } = useDragDrop();
  const [activeChord, setActiveChord] = useState<Chord | null>(null);

  const beatWidth = CANVAS_CONFIG.GRID_BEAT_WIDTH * zoom;

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const chord = chords.find(c => c.id === active.id);
    if (chord) {
      setActiveChord(chord);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;

    if (!delta) {
      setActiveChord(null);
      return;
    }

    const chord = chords.find(c => c.id === active.id);
    if (!chord) {
      setActiveChord(null);
      return;
    }

    // Calculate new position with delta
    const newX = chord.position.x + delta.x;
    const newY = chord.position.y + delta.y;

    // Snap to nearest beat
    const snappedBeat = Math.round(newX / beatWidth);
    const snappedX = snappedBeat * beatWidth;

    // Update chord position
    onUpdateChordPosition(
      chord.id,
      { x: snappedX, y: newY },
      snappedBeat
    );

    setActiveChord(null);
  };

  const handleDragCancel = () => {
    setActiveChord(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[snapCenterToCursor]}
    >
      <Canvas
        currentKey={currentKey}
        currentMode={currentMode}
        zoom={zoom}
        onAddChord={onAddChord}
        // ... other props
      >
        {chords.map(chord => (
          <DraggableChord
            key={chord.id}
            chord={chord}
            zoom={zoom}
            beatWidth={beatWidth}
          />
        ))}
      </Canvas>

      {/* Drag Overlay */}
      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        }}
      >
        {activeChord ? (
          <ChordShape
            chord={activeChord}
            zoom={zoom}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
```

### Update ChordShape.tsx

Add `isDragging` prop to ChordShape:

```typescript
interface ChordShapeProps {
  chord: Chord;
  isSelected?: boolean;
  isPlaying?: boolean;
  isDragging?: boolean; // NEW
  onSelect?: () => void;
  onHover?: () => void;
  zoom?: number;
}

export const ChordShape: React.FC<ChordShapeProps> = ({
  chord,
  isSelected = false,
  isPlaying = false,
  isDragging = false, // NEW
  // ... rest
}) => {
  // Add dragging state to variants
  const variants = {
    default: {
      scale: 1.0,
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
    },
    dragging: { // NEW
      scale: 1.15,
      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))',
      cursor: 'grabbing',
    },
    // ... existing variants
  };

  const currentState = isDragging 
    ? 'dragging'
    : isPlaying 
    ? 'playing' 
    : isSelected 
    ? 'selected' 
    : 'default';

  return (
    <motion.div
      // ... existing props
      animate={currentState}
      // ... rest
    />
  );
};
```

### src/store/canvas-store.ts

Create Zustand store for chord management:

```typescript
import { create } from 'zustand';
import { Chord } from '@types';

interface CanvasState {
  // Data
  chords: Chord[];
  
  // Actions
  addChord: (chord: Chord) => void;
  removeChord: (id: string) => void;
  updateChordPosition: (id: string, position: { x: number; y: number }, beat: number) => void;
  updateChord: (id: string, updates: Partial<Chord>) => void;
  clearChords: () => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  chords: [],

  addChord: (chord) => set((state) => ({
    chords: [...state.chords, chord]
  })),

  removeChord: (id) => set((state) => ({
    chords: state.chords.filter(c => c.id !== id)
  })),

  updateChordPosition: (id, position, beat) => set((state) => ({
    chords: state.chords.map(chord =>
      chord.id === id
        ? { ...chord, position, startBeat: beat }
        : chord
    )
  })),

  updateChord: (id, updates) => set((state) => ({
    chords: state.chords.map(chord =>
      chord.id === id
        ? { ...chord, ...updates }
        : chord
    )
  })),

  clearChords: () => set({ chords: [] }),
}));
```

## Snap Grid Visualization (Optional Enhancement)

### src/components/Canvas/SnapGuides.tsx

```typescript
import React from 'react';
import styles from './SnapGuides.module.css';

interface SnapGuidesProps {
  beatWidth: number;
  totalBeats: number;
  height: number;
}

export const SnapGuides: React.FC<SnapGuidesProps> = ({
  beatWidth,
  totalBeats,
  height,
}) => {
  const guides = [];

  for (let i = 0; i <= totalBeats; i++) {
    guides.push(
      <div
        key={`snap-${i}`}
        className={styles.snapGuide}
        style={{
          left: `${i * beatWidth}px`,
          height: `${height}px`,
        }}
      />
    );
  }

  return <div className={styles.snapGuidesContainer}>{guides}</div>;
};
```

### src/components/Canvas/SnapGuides.module.css

```css
.snapGuidesContainer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  transition: opacity var(--duration-fast);
}

/* Show snap guides during drag */
.snapGuidesContainer.active {
  opacity: 1;
}

.snapGuide {
  position: absolute;
  width: 2px;
  background: var(--primary-action);
  opacity: 0.2;
  transition: opacity var(--duration-fast);
}

.snapGuide.nearest {
  opacity: 0.6;
}
```

## Integration Example

### Updated App.tsx

```typescript
import React from 'react';
import { DroppableCanvas } from '@/components/Canvas/DroppableCanvas';
import { useCanvasStore } from '@/store/canvas-store';

function App() {
  const { chords, updateChordPosition, addChord } = useCanvasStore();
  const [currentKey, setCurrentKey] = useState('C');
  const [currentMode, setCurrentMode] = useState<'major' | 'minor'>('major');
  const [zoom, setZoom] = useState(1.0);

  return (
    <div className="app">
      <DroppableCanvas
        chords={chords}
        currentKey={currentKey}
        currentMode={currentMode}
        zoom={zoom}
        onUpdateChordPosition={updateChordPosition}
        onAddChord={addChord}
      />
    </div>
  );
}
```

## Quality Criteria

- [ ] Chords are draggable with mouse
- [ ] Drag activates after 8px movement (prevents accidental drags)
- [ ] Chord scales to 1.15x when picked up
- [ ] Shadow appears during drag
- [ ] Smooth transform animations (GPU-accelerated)
- [ ] Snaps to nearest beat on release
- [ ] DragOverlay shows preview
- [ ] Escape cancels drag
- [ ] 60fps performance with 50+ chords
- [ ] Cursor changes to 'grab' on hover, 'grabbing' while dragging
- [ ] No layout thrashing
- [ ] Position updates in store
- [ ] startBeat updates correctly

## Implementation Notes

1. **@dnd-kit Benefits:**
   - Accessible by default
   - Collision detection built-in
   - Smooth animations
   - Keyboard support included

2. **Activation Constraint:** 8px distance prevents accidental drags when clicking to select.

3. **DragOverlay:** Renders preview in portal, above all content. Original chord stays in place.

4. **Transform vs Position:** During drag, use CSS transform (GPU). On drop, update actual position.

5. **Beat Snapping:** `Math.round(x / beatWidth)` snaps to nearest beat.

6. **Store Pattern:** Zustand store makes state management clean and performant.

## Accessibility

- Draggable elements have role="button"
- Keyboard users can press Space to "pick up" chord
- Arrow keys move chord when picked up
- Escape cancels drag
- Screen reader announces position changes

## Performance Optimization

- **useMemo** for drag handlers
- **GPU transforms** during drag
- **Batched updates** to store
- **No re-renders** of non-dragged chords
- **RequestAnimationFrame** for smooth motion

## Testing Considerations

Test scenarios:
1. **Drag chord:** Pick up, move, drop - position updates
2. **Snap to beat:** Drops between beats snap correctly
3. **Drag multiple:** Drag different chords sequentially
4. **Cancel drag:** Press Escape - chord returns to original position
5. **Edge cases:** Drag to canvas edges - stays in bounds
6. **Performance:** 100 chords - still 60fps
7. **Zoom:** Dragging works at 0.5x, 1x, 2x zoom

## Common Issues & Solutions

**Issue:** Chords jump on drag start

**Solution:** Ensure transform origin is center. Use `snapCenterToCursor` modifier.

**Issue:** Lag during drag

**Solution:** 
- Use `will-change: transform` in CSS
- Memoize handlers
- Avoid re-renders with React.memo

**Issue:** Snap position wrong

**Solution:** Account for canvas scroll position and zoom when calculating beat position.

## Next Steps

After drag-and-drop is working:
1. Add selection system (Prompt 003)
2. Multi-select drag
3. Connection lines (Prompt 004)

---

**Output Format:** Provide complete DraggableChord, DroppableCanvas, updated ChordShape, Zustand store, and snap grid components. Ensure smooth 60fps dragging and proper beat snapping.
