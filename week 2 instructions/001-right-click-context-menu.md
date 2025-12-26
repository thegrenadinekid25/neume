# Prompt 001: Right-Click Context Menu

## Objective
Create a context menu that appears when right-clicking on the canvas, allowing users to add chords. This is the primary way users will build chord progressions.

## Context
Currently (Week 1), the canvas displays static chord shapes but users can't add new chords. This prompt implements the right-click menu that will be the main interaction for chord creation.

**Dependencies:**
- Requires ALL Week 1 prompts (001-008)
- Canvas component from Week 1 Prompt 005
- ChordShape component from Week 1 Prompt 006

**Related Components:**
- Will be used by drag-and-drop system (Week 2 Prompt 002)
- Chord menu items will trigger chord creation

**Next Steps:** After this, chords will be draggable (Prompt 002)

## Requirements

### Core Requirements
1. **Right-click detection** on canvas (preventDefault browser menu)
2. **Context menu appears** at click position
3. **Shows 7 basic chords** (I-vii in current key)
4. **Menu positioning** (stays within viewport)
5. **Click outside closes** menu
6. **Escape key closes** menu
7. **Create chord on click** at mouse position
8. **Visual feedback** on hover
9. **Keyboard navigation** (arrow keys, Enter)
10. **Accessible** (ARIA, screen reader support)

### Menu Content
- Display all 7 scale degrees (I, ii, iii, IV, V, vi, vii°)
- Show chord quality (major, minor, diminished)
- Color-coded previews
- Clear labels

### Positioning Logic
- Appear at mouse cursor
- If near right edge → open leftward
- If near bottom → open upward
- Always fully visible in viewport

## Technical Constraints

- Portal rendering (above all other content)
- z-index: 1000
- Smooth fade-in (150ms)
- Click propagation handled correctly
- No memory leaks on mount/unmount

## Code Structure

### src/components/UI/ContextMenu.tsx

```typescript
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ContextMenuItem } from '@types';
import styles from './ContextMenu.module.css';

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  position,
  items,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Adjust position to stay in viewport
  const getAdjustedPosition = () => {
    if (!menuRef.current) return position;

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x;
    let y = position.y;

    // Adjust horizontal
    if (x + menuRect.width > viewportWidth - 20) {
      x = viewportWidth - menuRect.width - 20;
    }

    // Adjust vertical
    if (y + menuRect.height > viewportHeight - 20) {
      y = viewportHeight - menuRect.height - 20;
    }

    return { x, y };
  };

  if (!isOpen) return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          className={styles.contextMenu}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          role="menu"
          aria-label="Chord selection menu"
        >
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              <button
                className={styles.menuItem}
                onClick={() => {
                  item.action();
                  onClose();
                }}
                disabled={item.disabled}
                role="menuitem"
                tabIndex={0}
              >
                {item.icon && (
                  <span className={styles.icon}>{item.icon}</span>
                )}
                <span className={styles.label}>{item.label}</span>
              </button>
              {item.divider && <div className={styles.divider} />}
            </React.Fragment>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
```

### src/components/Canvas/ChordContextMenu.tsx

```typescript
import React from 'react';
import { ContextMenu } from '@/components/UI/ContextMenu';
import { ContextMenuItem, Chord, ScaleDegree } from '@types';
import { getScaleDegreeColor } from '@/styles/colors';
import { v4 as uuidv4 } from 'uuid';

interface ChordContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  currentKey: string;
  currentMode: 'major' | 'minor';
  onClose: () => void;
  onAddChord: (chord: Chord) => void;
  canvasScrollLeft: number;
  beatWidth: number;
}

export const ChordContextMenu: React.FC<ChordContextMenuProps> = ({
  isOpen,
  position,
  currentKey,
  currentMode,
  onClose,
  onAddChord,
  canvasScrollLeft,
  beatWidth,
}) => {
  // Calculate canvas-relative position
  const createChordAtPosition = (scaleDegree: ScaleDegree) => {
    // Convert screen position to canvas position
    const canvasX = position.x + canvasScrollLeft;
    const canvasY = position.y;

    // Snap to nearest beat
    const beatPosition = Math.round(canvasX / beatWidth);
    const snappedX = beatPosition * beatWidth;

    const newChord: Chord = {
      id: uuidv4(),
      scaleDegree,
      quality: getChordQuality(scaleDegree, currentMode),
      extensions: {},
      key: currentKey as any,
      mode: currentMode,
      isChromatic: false,
      voices: generateDefaultVoices(scaleDegree, currentKey, currentMode),
      startBeat: beatPosition,
      duration: 4, // Default to whole note
      position: { x: snappedX, y: canvasY - 30 }, // Center on cursor
      size: 60,
      selected: false,
      playing: false,
      source: 'user',
      createdAt: new Date().toISOString(),
    };

    onAddChord(newChord);
  };

  // Generate menu items for all 7 scale degrees
  const menuItems: ContextMenuItem[] = [
    {
      id: 'chord-I',
      label: `I (${currentMode === 'major' ? 'Tonic' : 'Tonic'})`,
      icon: renderColorDot(1, currentMode),
      action: () => createChordAtPosition(1),
    },
    {
      id: 'chord-ii',
      label: `ii (${currentMode === 'major' ? 'Supertonic' : 'Supertonic°'})`,
      icon: renderColorDot(2, currentMode),
      action: () => createChordAtPosition(2),
    },
    {
      id: 'chord-iii',
      label: `iii (${currentMode === 'major' ? 'Mediant' : 'Mediant'})`,
      icon: renderColorDot(3, currentMode),
      action: () => createChordAtPosition(3),
    },
    {
      id: 'chord-IV',
      label: `IV (${currentMode === 'major' ? 'Subdominant' : 'Subdominant'})`,
      icon: renderColorDot(4, currentMode),
      action: () => createChordAtPosition(4),
    },
    {
      id: 'chord-V',
      label: `V (Dominant)`,
      icon: renderColorDot(5, currentMode),
      action: () => createChordAtPosition(5),
    },
    {
      id: 'chord-vi',
      label: `vi (${currentMode === 'major' ? 'Submediant' : 'Submediant'})`,
      icon: renderColorDot(6, currentMode),
      action: () => createChordAtPosition(6),
    },
    {
      id: 'chord-vii',
      label: `vii° (Leading Tone)`,
      icon: renderColorDot(7, currentMode),
      action: () => createChordAtPosition(7),
    },
  ];

  return (
    <ContextMenu
      isOpen={isOpen}
      position={position}
      items={menuItems}
      onClose={onClose}
    />
  );
};

/**
 * Render colored dot preview
 */
function renderColorDot(degree: ScaleDegree, mode: 'major' | 'minor') {
  const color = getScaleDegreeColor(degree, mode);
  return (
    <span
      style={{
        display: 'inline-block',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: color,
        marginRight: '8px',
      }}
    />
  );
}

/**
 * Get chord quality based on scale degree and mode
 */
function getChordQuality(
  degree: ScaleDegree,
  mode: 'major' | 'minor'
): Chord['quality'] {
  if (mode === 'major') {
    const qualities: Record<ScaleDegree, Chord['quality']> = {
      1: 'major',
      2: 'minor',
      3: 'minor',
      4: 'major',
      5: 'major',
      6: 'minor',
      7: 'diminished',
    };
    return qualities[degree];
  } else {
    const qualities: Record<ScaleDegree, Chord['quality']> = {
      1: 'minor',
      2: 'diminished',
      3: 'major',
      4: 'minor',
      5: 'major', // or minor, but we'll default to major V
      6: 'major',
      7: 'major',
    };
    return qualities[degree];
  }
}

/**
 * Generate default SATB voices (placeholder - will use Tonal.js in Week 5)
 */
function generateDefaultVoices(
  degree: ScaleDegree,
  key: string,
  mode: 'major' | 'minor'
): Chord['voices'] {
  // Simplified placeholder - real implementation in Week 5 with Tonal.js
  return {
    soprano: 'C4',
    alto: 'G3',
    tenor: 'E3',
    bass: 'C3',
  };
}
```

### src/components/Canvas/Canvas.tsx (Updated)

Update the Canvas component to handle right-click:

```typescript
import React, { useState, useRef } from 'react';
import { ChordContextMenu } from './ChordContextMenu';
// ... other imports

export const Canvas: React.FC<CanvasProps> = ({
  // ... existing props
  onAddChord, // NEW: callback to add chord to state
}) => {
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
  }>({ isOpen: false, position: { x: 0, y: 0 } });

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ ...contextMenu, isOpen: false });
  };

  return (
    <div className={styles.canvasContainer}>
      {/* ... existing content */}
      
      <div
        ref={canvasRef}
        className={styles.canvas}
        onContextMenu={handleContextMenu}
      >
        {/* ... existing canvas content */}
      </div>

      {/* Context Menu */}
      <ChordContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        currentKey={currentKey}
        currentMode={currentMode}
        onClose={handleCloseContextMenu}
        onAddChord={onAddChord}
        canvasScrollLeft={canvasRef.current?.scrollLeft || 0}
        beatWidth={CANVAS_CONFIG.GRID_BEAT_WIDTH * zoom}
      />
    </div>
  );
};
```

### src/components/UI/ContextMenu.module.css

```css
.contextMenu {
  position: fixed;
  background: white;
  border: 1px solid var(--border-medium);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 200px;
  padding: 4px;
  z-index: 1000;
  overflow: hidden;
}

.menuItem {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 13px;
  font-family: var(--font-ui);
  color: var(--text-primary);
  border-radius: var(--border-radius-sm);
  transition: background-color var(--duration-fast) var(--ease-apple-smooth);
}

.menuItem:hover:not(:disabled) {
  background-color: var(--background-secondary);
}

.menuItem:focus-visible {
  outline: 2px solid var(--primary-action);
  outline-offset: -2px;
}

.menuItem:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon {
  display: inline-flex;
  align-items: center;
  margin-right: 8px;
}

.label {
  flex: 1;
}

.divider {
  height: 1px;
  background-color: var(--border-light);
  margin: 4px 0;
}
```

## Integration Example

### In App.tsx

```typescript
import { useState } from 'react';
import { Canvas } from '@/components/Canvas/Canvas';
import { Chord } from '@types';

function App() {
  const [chords, setChords] = useState<Chord[]>([]);

  const handleAddChord = (chord: Chord) => {
    setChords(prev => [...prev, chord]);
  };

  return (
    <Canvas
      currentKey="C"
      currentMode="major"
      zoom={1.0}
      onAddChord={handleAddChord}
    >
      {chords.map(chord => (
        <ChordShape key={chord.id} chord={chord} />
      ))}
    </Canvas>
  );
}
```

## Quality Criteria

- [ ] Right-click prevents browser context menu
- [ ] Menu appears at cursor position
- [ ] All 7 chord types listed
- [ ] Color dots match chord colors
- [ ] Menu stays within viewport
- [ ] Click outside closes menu
- [ ] Escape key closes menu
- [ ] Clicking chord adds it to canvas
- [ ] Chord snaps to nearest beat
- [ ] Smooth fade-in animation (150ms)
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Screen reader announces menu items
- [ ] No memory leaks on open/close

## Implementation Notes

1. **Portal Rendering:** Using ReactDOM.createPortal ensures menu renders above all content.

2. **Position Adjustment:** Menu automatically adjusts position to stay in viewport.

3. **Beat Snapping:** Chords snap to nearest beat based on click position and beatWidth.

4. **Default Values:** New chords get sensible defaults (4-beat duration, user source).

5. **Keyboard Support:** Menu items are focusable and activatable with Enter/Space.

## Accessibility

- Menu has role="menu"
- Items have role="menuitem"
- Keyboard navigable (Tab, Enter, Escape)
- Screen reader announces chord names
- Focus trap when open
- ARIA labels present

## Testing Considerations

Test scenarios:
1. **Right-click center:** Menu appears at cursor
2. **Right-click near edge:** Menu stays in viewport
3. **Add chord:** Chord appears on canvas
4. **Close menu:** Click outside, Escape key
5. **Keyboard navigation:** Tab through items, Enter to select
6. **Multiple adds:** Can add many chords
7. **Different keys:** Color dots update with key change

## Next Steps

After context menu is working:
1. Add drag-and-drop (Prompt 002)
2. Enable chord repositioning
3. Add selection system (Prompt 003)

---

**Output Format:** Provide complete ContextMenu component, ChordContextMenu wrapper, updated Canvas component, and all CSS. Ensure portal rendering, keyboard support, and viewport-aware positioning work correctly.
