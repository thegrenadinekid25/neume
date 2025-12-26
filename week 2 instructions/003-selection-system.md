# Prompt 003: Selection System

## Objective
Implement a comprehensive selection system allowing users to select single or multiple chords using click, Shift-click, Cmd/Ctrl-click, and rectangular selection (drag-to-select). Selected chords can then be moved together, deleted, or edited.

## Context
Users can now add chords (Prompt 001) and drag them (Prompt 002), but can't select multiple chords at once. This prompt adds robust selection capabilities essential for efficient progression building.

**Dependencies:**
- Requires Week 1 (complete visual system)
- Requires Week 2 Prompts 001-002 (context menu, drag-drop)

**Related Components:**
- ChordShape component (shows selected state)
- DraggableChord component (handles selection clicks)
- Canvas component (handles rectangular selection)

**Next Steps:** Delete functionality (Prompt 005) will use selection

## Requirements

### Core Requirements
1. **Single selection** (click chord)
2. **Multi-selection** (Cmd/Ctrl + click to add/remove)
3. **Range selection** (Shift + click to select range)
4. **Rectangular selection** (drag on empty canvas)
5. **Select all** (Cmd/Ctrl + A)
6. **Deselect all** (click empty space, Escape)
7. **Visual feedback** (blue stroke on selected)
8. **Drag selected group** (all move together)
9. **Selection count** (show "3 chords selected")
10. **Keyboard navigation** (Tab to cycle, Space to toggle)

### Selection Modes

**Single Click:**
- Click chord → Select only that chord
- Click empty space → Deselect all

**Cmd/Ctrl + Click:**
- Click unselected chord → Add to selection
- Click selected chord → Remove from selection

**Shift + Click:**
- Select all chords between last selected and clicked chord
- Based on startBeat position (timeline order)

**Rectangular Selection:**
- Click and drag on empty canvas → Draw rectangle
- All chords within rectangle → Selected
- Previous selection cleared unless Shift held

## Technical Constraints

- Selection state in Zustand store
- Efficient collision detection (rectangular selection)
- No performance impact with 100+ chords
- Keyboard shortcuts don't conflict
- Mobile-friendly (long-press future consideration)

## Code Structure

### Update src/store/canvas-store.ts

```typescript
import { create } from 'zustand';
import { Chord } from '@types';

interface CanvasState {
  // Data
  chords: Chord[];
  selectedChordIds: string[];
  
  // Selection Actions
  selectChord: (id: string, multiSelect?: boolean) => void;
  selectChords: (ids: string[]) => void;
  deselectChord: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  selectRange: (fromId: string, toId: string) => void;
  toggleChordSelection: (id: string) => void;
  
  // ... existing actions
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  chords: [],
  selectedChordIds: [],

  selectChord: (id, multiSelect = false) => set((state) => {
    if (multiSelect) {
      // Add to existing selection
      return {
        selectedChordIds: state.selectedChordIds.includes(id)
          ? state.selectedChordIds
          : [...state.selectedChordIds, id]
      };
    } else {
      // Replace selection
      return { selectedChordIds: [id] };
    }
  }),

  selectChords: (ids) => set({
    selectedChordIds: ids
  }),

  deselectChord: (id) => set((state) => ({
    selectedChordIds: state.selectedChordIds.filter(selectedId => selectedId !== id)
  })),

  clearSelection: () => set({
    selectedChordIds: []
  }),

  selectAll: () => set((state) => ({
    selectedChordIds: state.chords.map(c => c.id)
  })),

  selectRange: (fromId, toId) => set((state) => {
    const chordsSorted = [...state.chords].sort((a, b) => a.startBeat - b.startBeat);
    const fromIndex = chordsSorted.findIndex(c => c.id === fromId);
    const toIndex = chordsSorted.findIndex(c => c.id === toId);
    
    if (fromIndex === -1 || toIndex === -1) return state;
    
    const [start, end] = fromIndex < toIndex 
      ? [fromIndex, toIndex] 
      : [toIndex, fromIndex];
    
    const rangeIds = chordsSorted.slice(start, end + 1).map(c => c.id);
    
    return { selectedChordIds: rangeIds };
  }),

  toggleChordSelection: (id) => set((state) => ({
    selectedChordIds: state.selectedChordIds.includes(id)
      ? state.selectedChordIds.filter(selectedId => selectedId !== id)
      : [...state.selectedChordIds, id]
  })),

  // ... existing actions (addChord, updateChordPosition, etc.)
}));
```

### src/components/Canvas/SelectionBox.tsx

Rectangular selection component:

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import styles from './SelectionBox.module.css';

interface SelectionBoxProps {
  start: { x: number; y: number };
  current: { x: number; y: number };
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({ start, current }) => {
  const x = Math.min(start.x, current.x);
  const y = Math.min(start.y, current.y);
  const width = Math.abs(current.x - start.x);
  const height = Math.abs(current.y - start.y);

  return (
    <motion.div
      className={styles.selectionBox}
      style={{
        left: x,
        top: y,
        width,
        height,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
    />
  );
};
```

### src/components/Canvas/SelectionBox.module.css

```css
.selectionBox {
  position: absolute;
  border: 2px dashed var(--primary-action);
  background-color: rgba(74, 144, 226, 0.1);
  pointer-events: none;
  z-index: 999;
}
```

### Update DroppableCanvas.tsx

Add rectangular selection logic:

```typescript
import React, { useState, useRef, useCallback } from 'react';
import { SelectionBox } from './SelectionBox';
import { useCanvasStore } from '@/store/canvas-store';

export const DroppableCanvas: React.FC<DroppableCanvasProps> = ({
  // ... existing props
}) => {
  const { 
    chords, 
    selectedChordIds, 
    selectChords, 
    clearSelection, 
    selectChord,
    toggleChordSelection,
  } = useCanvasStore();

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionCurrent, setSelectionCurrent] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only start selection if clicking on empty canvas (not on a chord)
    if (e.target === canvasRef.current || e.target === canvasRef.current?.firstChild) {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left + canvasRef.current!.scrollLeft;
      const y = e.clientY - rect.top;

      setIsSelecting(true);
      setSelectionStart({ x, y });
      setSelectionCurrent({ x, y });

      // Clear selection unless Shift is held
      if (!e.shiftKey) {
        clearSelection();
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left + canvasRef.current!.scrollLeft;
    const y = e.clientY - rect.top;

    setSelectionCurrent({ x, y });
  };

  const handleCanvasMouseUp = () => {
    if (!isSelecting) return;

    // Calculate selection rectangle
    const selectionRect = {
      left: Math.min(selectionStart.x, selectionCurrent.x),
      right: Math.max(selectionStart.x, selectionCurrent.x),
      top: Math.min(selectionStart.y, selectionCurrent.y),
      bottom: Math.max(selectionStart.y, selectionCurrent.y),
    };

    // Find chords within rectangle
    const selectedIds = chords
      .filter(chord => {
        const chordRect = {
          left: chord.position.x,
          right: chord.position.x + chord.size,
          top: chord.position.y,
          bottom: chord.position.y + chord.size,
        };

        return (
          chordRect.left < selectionRect.right &&
          chordRect.right > selectionRect.left &&
          chordRect.top < selectionRect.bottom &&
          chordRect.bottom > selectionRect.top
        );
      })
      .map(chord => chord.id);

    if (selectedIds.length > 0) {
      selectChords(selectedIds);
    }

    setIsSelecting(false);
  };

  const handleChordClick = (chord: Chord, e: React.MouseEvent) => {
    e.stopPropagation();

    if (e.metaKey || e.ctrlKey) {
      // Cmd/Ctrl + Click: Toggle selection
      toggleChordSelection(chord.id);
    } else if (e.shiftKey) {
      // Shift + Click: Range selection
      const lastSelected = selectedChordIds[selectedChordIds.length - 1];
      if (lastSelected) {
        selectRange(lastSelected, chord.id);
      } else {
        selectChord(chord.id);
      }
    } else {
      // Normal click: Single selection
      selectChord(chord.id);
    }
  };

  return (
    <DndContext
      // ... existing DndContext props
    >
      <Canvas
        ref={canvasRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        // ... other props
      >
        {chords.map(chord => (
          <DraggableChord
            key={chord.id}
            chord={chord}
            isSelected={selectedChordIds.includes(chord.id)}
            onClick={(e) => handleChordClick(chord, e)}
            // ... other props
          />
        ))}

        {/* Selection Box */}
        {isSelecting && (
          <SelectionBox
            start={selectionStart}
            current={selectionCurrent}
          />
        )}
      </Canvas>

      {/* Selection Info */}
      {selectedChordIds.length > 1 && (
        <div className={styles.selectionInfo}>
          {selectedChordIds.length} chords selected
        </div>
      )}
    </DndContext>
  );
};
```

### src/hooks/useKeyboardShortcuts.ts

```typescript
import { useEffect } from 'react';
import { useCanvasStore } from '@/store/canvas-store';

export function useKeyboardShortcuts() {
  const { selectAll, clearSelection, selectedChordIds } = useCanvasStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + A: Select All
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        selectAll();
      }

      // Escape: Clear Selection
      if (e.key === 'Escape') {
        clearSelection();
      }

      // Future: Delete, Copy, Paste, etc.
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectAll, clearSelection, selectedChordIds]);
}
```

### Update DraggableChord.tsx

Allow multi-drag:

```typescript
import { useDraggable } from '@dnd-kit/core';
import { useCanvasStore } from '@/store/canvas-store';

export const DraggableChord: React.FC<DraggableChordProps> = ({
  chord,
  isSelected,
  onClick,
  // ... other props
}) => {
  const { selectedChordIds } = useCanvasStore();

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
      isMultiDrag: isSelected && selectedChordIds.length > 1,
      selectedIds: isSelected ? selectedChordIds : [chord.id],
    },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
      }}
      {...listeners}
      {...attributes}
      onClick={onClick}
    >
      <ChordShape
        chord={chord}
        isSelected={isSelected}
        isDragging={isDragging}
        // ... other props
      />
    </div>
  );
};
```

### Update DroppableCanvas handleDragEnd

Support multi-chord dragging:

```typescript
const handleDragEnd = (event: DragEndEvent) => {
  const { active, delta } = event;

  if (!delta) {
    setActiveChord(null);
    return;
  }

  const dragData = active.data.current;
  const isMultiDrag = dragData?.isMultiDrag;
  const selectedIds = dragData?.selectedIds || [active.id];

  if (isMultiDrag) {
    // Move all selected chords
    selectedIds.forEach((id: string) => {
      const chord = chords.find(c => c.id === id);
      if (!chord) return;

      const newX = chord.position.x + delta.x;
      const newY = chord.position.y + delta.y;

      const snappedBeat = Math.round(newX / beatWidth);
      const snappedX = snappedBeat * beatWidth;

      onUpdateChordPosition(id, { x: snappedX, y: newY }, snappedBeat);
    });
  } else {
    // Move single chord (existing logic)
    const chord = chords.find(c => c.id === active.id);
    if (!chord) return;

    const newX = chord.position.x + delta.x;
    const newY = chord.position.y + delta.y;

    const snappedBeat = Math.round(newX / beatWidth);
    const snappedX = snappedBeat * beatWidth;

    onUpdateChordPosition(active.id, { x: snappedX, y: newY }, snappedBeat);
  }

  setActiveChord(null);
};
```

## Quality Criteria

- [ ] Click chord → Selects single chord
- [ ] Cmd/Ctrl + Click → Toggles chord in selection
- [ ] Shift + Click → Selects range between chords
- [ ] Cmd/Ctrl + A → Selects all chords
- [ ] Escape → Clears selection
- [ ] Rectangular selection works
- [ ] Shift + drag rectangle → Adds to selection
- [ ] Selected chords show blue stroke
- [ ] Drag one selected chord → All move together
- [ ] Selection count displays for multi-select
- [ ] Click empty space → Clears selection
- [ ] Performance: 100+ chords, instant selection
- [ ] No visual glitches during selection

## Implementation Notes

1. **Range Selection:** Sorted by startBeat (timeline position), not visual position.

2. **Multi-Drag:** When dragging one chord in a multi-selection, all selected chords move with the same delta.

3. **Rectangular Selection:** Uses bounding box collision detection. Efficient even with many chords.

4. **Store Pattern:** All selection state centralized in Zustand store.

5. **Shift Behavior:** Holding Shift adds to selection instead of replacing.

## Accessibility

- Selected chords have aria-selected="true"
- Selection count announced to screen readers
- Keyboard shortcuts follow platform conventions
- Tab cycles through chords
- Space toggles selection

## Performance Optimization

- **Collision detection** uses simple rectangle overlap (O(n))
- **Memoized handlers** prevent re-renders
- **Batched store updates** for multi-selection
- **No re-render** of non-selected chords

## Testing Considerations

Test scenarios:
1. **Single select:** Click chord → Only that chord selected
2. **Multi-select:** Cmd+Click 3 chords → All 3 selected
3. **Range select:** Click 1st chord, Shift+Click 5th → Chords 1-5 selected
4. **Rectangular select:** Drag box around 4 chords → All 4 selected
5. **Select all:** Cmd+A → All chords selected
6. **Deselect:** Click empty space → None selected
7. **Multi-drag:** Select 3, drag one → All 3 move
8. **Edge cases:** Select, drag, then click elsewhere - selection updates correctly

## Next Steps

After selection system is working:
1. Add connection lines (Prompt 004)
2. Delete selected chords (Prompt 005)
3. Copy/paste (future)

---

**Output Format:** Provide complete SelectionBox component, updated CanvasStore with selection actions, updated DroppableCanvas with rectangular selection, keyboard shortcuts hook, and multi-drag support.
