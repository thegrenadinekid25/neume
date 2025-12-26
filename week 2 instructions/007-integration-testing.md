# Prompt 007: Integration & Testing

## Objective
Create a comprehensive integration test suite and demo that validates all Week 2 interactions work seamlessly together. This ensures quality and provides a reference implementation.

## Context
Week 2 has added 6 major features: right-click menu, drag-drop, selection, connection lines, delete/shortcuts, and undo/redo. This prompt integrates everything and creates a polished demo.

**Dependencies:**
- Requires Week 1 (complete visual system)
- Requires Week 2 Prompts 001-006 (all interaction features)

**Related Components:**
- All Week 2 components
- Updated App.tsx with full integration

**Next Steps:** Week 3 will add audio playback

## Requirements

### Integration Requirements
1. **All features work together** without conflicts
2. **State management** is consistent across features
3. **No visual glitches** during complex interactions
4. **Performance** maintained (60fps with 50+ chords)
5. **Comprehensive demo** showing all capabilities
6. **Edge cases handled** gracefully
7. **Error boundaries** for resilience
8. **Clean console** (no warnings/errors)

### Demo Scenarios
Create a working demo that includes:
- 10-12 chords on canvas (variety of types)
- Pre-loaded progression (e.g., "I-V-vi-IV" pop progression)
- Interactive controls for all features
- Visual indicators of state
- Instructions panel

## Code Structure

### src/App.tsx (Complete Integration)

```typescript
import React, { useState } from 'react';
import { DroppableCanvas } from '@/components/Canvas/DroppableCanvas';
import { BottomControlBar } from '@/components/Controls/BottomControlBar';
import { Header } from '@/components/Header/Header';
import { DeleteConfirmation } from '@/components/UI/DeleteConfirmation';
import { KeyboardShortcutsGuide } from '@/components/UI/KeyboardShortcutsGuide';
import { WelcomeOverlay } from '@/components/UI/WelcomeOverlay';
import { useCanvasStore } from '@/store/canvas-store';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Chord } from '@types';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

function App() {
  const {
    chords,
    selectedChordIds,
    showConnectionLines,
    addChordWithCommand,
    deleteSelectedWithCommand,
    updateChordPosition,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCanvasStore();

  const [currentKey, setCurrentKey] = useState('C');
  const [currentMode, setCurrentMode] = useState<'major' | 'minor'>('major');
  const [zoom, setZoom] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('harmonic-canvas-welcome-seen');
  });

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Load demo progression on first load
  React.useEffect(() => {
    if (chords.length === 0) {
      loadDemoProgression();
    }
  }, []);

  const loadDemoProgression = () => {
    // Pop progression: I - V - vi - IV (in C major)
    const demoChords: Chord[] = [
      createChord(1, 'major', 0, 120, 'C'),
      createChord(5, 'major', 4, 120, 'G'),
      createChord(6, 'minor', 8, 120, 'Am'),
      createChord(4, 'major', 12, 120, 'F'),
      // Add some extended harmony
      createChord(2, 'minor', 16, 100, 'Dm'),
      createChord(3, 'minor', 20, 100, 'Em'),
      createChord(7, 'diminished', 24, 100, 'Bdim'),
      // Add a chord with extension
      { ...createChord(1, 'major', 28, 120, 'C'), extensions: { add9: true } },
    ];

    demoChords.forEach(chord => addChordWithCommand(chord));
  };

  const createChord = (
    degree: number,
    quality: Chord['quality'],
    beat: number,
    yPos: number,
    name: string
  ): Chord => ({
    id: uuidv4(),
    scaleDegree: degree as any,
    quality,
    extensions: {},
    key: currentKey as any,
    mode: currentMode,
    isChromatic: false,
    voices: {
      soprano: 'C4',
      alto: 'E3',
      tenor: 'G3',
      bass: 'C3',
    },
    startBeat: beat,
    duration: 4,
    position: {
      x: beat * 80,
      y: yPos,
    },
    size: 60,
    selected: false,
    playing: false,
    source: 'user',
    createdAt: new Date().toISOString(),
  });

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    localStorage.setItem('harmonic-canvas-welcome-seen', 'true');
  };

  const handleDelete = () => {
    if (selectedChordIds.length >= 5) {
      setShowDeleteConfirm(true);
    } else {
      deleteSelectedWithCommand();
    }
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    // Playback simulation will be implemented in Week 5
  };

  return (
    <div className="app">
      {/* Header */}
      <Header
        onShowShortcuts={() => setShowShortcuts(true)}
        canUndo={canUndo()}
        canRedo={canRedo()}
        onUndo={undo}
        onRedo={redo}
      />

      {/* Main Canvas */}
      <main className="main-content">
        <DroppableCanvas
          chords={chords}
          currentKey={currentKey}
          currentMode={currentMode}
          zoom={zoom}
          isPlaying={isPlaying}
          playheadPosition={playheadPosition}
          showConnectionLines={showConnectionLines}
          onAddChord={(chord) => addChordWithCommand(chord)}
          onUpdateChordPosition={updateChordPosition}
        />
      </main>

      {/* Bottom Control Bar */}
      <BottomControlBar
        isPlaying={isPlaying}
        onPlayPause={handlePlay}
        tempo={120}
        onTempoChange={() => {}}
        currentKey={currentKey}
        currentMode={currentMode}
        onKeyChange={setCurrentKey}
        onModeChange={setCurrentMode}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      {/* Modals & Overlays */}
      <WelcomeOverlay
        isOpen={showWelcome}
        onClose={handleWelcomeClose}
      />

      <DeleteConfirmation
        isOpen={showDeleteConfirm}
        chordCount={selectedChordIds.length}
        onConfirm={() => {
          deleteSelectedWithCommand();
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <KeyboardShortcutsGuide
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* Selection Info */}
      {selectedChordIds.length > 0 && (
        <div className="selection-info">
          {selectedChordIds.length} chord{selectedChordIds.length > 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}

export default App;
```

### src/App.css

```css
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.selection-info {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--text-primary);
  color: white;
  padding: 8px 16px;
  border-radius: var(--border-radius-md);
  font-size: 12px;
  font-weight: 500;
  z-index: 100;
  pointer-events: none;
  box-shadow: var(--shadow-md);
}
```

### src/components/Header/Header.tsx

```typescript
import React from 'react';
import { UndoRedoButtons } from './UndoRedoButtons';
import styles from './Header.module.css';

interface HeaderProps {
  onShowShortcuts: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onShowShortcuts,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.textButton}>
          Analyze
        </button>
      </div>

      <div className={styles.center}>
        <h1 className={styles.title}>Harmonic Canvas</h1>
      </div>

      <div className={styles.right}>
        <UndoRedoButtons
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={onUndo}
          onRedo={onRedo}
        />
        
        <button className={styles.textButton}>
          My Progressions
        </button>

        <button
          className={styles.iconButton}
          onClick={onShowShortcuts}
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (?)"
        >
          ?
        </button>
      </div>
    </header>
  );
};
```

### src/components/Controls/BottomControlBar.tsx

```typescript
import React from 'react';
import styles from './BottomControlBar.module.css';

interface BottomControlBarProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  tempo: number;
  onTempoChange: (tempo: number) => void;
  currentKey: string;
  currentMode: 'major' | 'minor';
  onKeyChange: (key: string) => void;
  onModeChange: (mode: 'major' | 'minor') => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export const BottomControlBar: React.FC<BottomControlBarProps> = ({
  isPlaying,
  onPlayPause,
  currentKey,
  currentMode,
  onKeyChange,
  onModeChange,
  zoom,
  onZoomChange,
}) => {
  return (
    <div className={styles.controlBar}>
      <div className={styles.left}>
        <button
          className={styles.playButton}
          onClick={onPlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>

      <div className={styles.center}>
        <div className={styles.controls}>
          <label>Key:</label>
          <select
            value={currentKey}
            onChange={(e) => onKeyChange(e.target.value)}
          >
            <option value="C">C</option>
            <option value="G">G</option>
            <option value="D">D</option>
            <option value="A">A</option>
            <option value="E">E</option>
            <option value="F">F</option>
          </select>

          <label>Mode:</label>
          <select
            value={currentMode}
            onChange={(e) => onModeChange(e.target.value as any)}
          >
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>

          <label>Zoom:</label>
          <select
            value={zoom}
            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
          >
            <option value="0.5">50%</option>
            <option value="1.0">100%</option>
            <option value="2.0">200%</option>
          </select>
        </div>
      </div>

      <div className={styles.right}>
        <button className={styles.secondaryButton}>
          Export MIDI
        </button>
      </div>
    </div>
  );
};
```

### Testing Checklist

Create a comprehensive test document:

```markdown
# Week 2 Integration Test Checklist

## Basic Interactions
- [ ] Right-click empty canvas → Context menu appears
- [ ] Click chord from menu → Chord added at cursor position
- [ ] Drag chord → Chord moves smoothly
- [ ] Release drag → Chord snaps to nearest beat
- [ ] Click chord → Chord selected (blue stroke)
- [ ] Click empty space → Selection cleared

## Multi-Selection
- [ ] Cmd+Click chord → Added to selection
- [ ] Cmd+Click selected chord → Removed from selection
- [ ] Shift+Click → Range selection works
- [ ] Drag rectangle around chords → All selected
- [ ] Cmd+A → All chords selected
- [ ] Escape → Selection cleared

## Multi-Drag
- [ ] Select 3 chords, drag one → All move together
- [ ] Release → All snap to beats maintaining relative positions

## Connection Lines
- [ ] Lines connect consecutive chords
- [ ] Lines update when chords move
- [ ] Lines are smooth Bézier curves
- [ ] Cmd+L toggles line visibility

## Delete
- [ ] Select chord, press Delete → Chord removed
- [ ] Select 5+ chords, press Delete → Confirmation appears
- [ ] Confirm deletion → All removed
- [ ] Cancel deletion → Nothing happens
- [ ] Deleted chord → Connection lines update

## Keyboard Shortcuts
- [ ] Cmd+A → Select all
- [ ] Cmd+D → Duplicate selected
- [ ] Delete → Delete selected
- [ ] Cmd+L → Toggle connection lines
- [ ] Escape → Clear selection
- [ ] Arrow keys → Move selected (1px)
- [ ] Shift+Arrow → Move selected (10px)
- [ ] ? → Show shortcuts guide

## Undo/Redo
- [ ] Add chord, Cmd+Z → Chord removed
- [ ] Delete chord, Cmd+Z → Chord restored
- [ ] Move chord, Cmd+Z → Returns to original position
- [ ] Duplicate, Cmd+Z → Duplicates removed
- [ ] Undo 3 times, Cmd+Shift+Z → Redo works
- [ ] New action → Redo stack cleared

## Complex Workflows
- [ ] Add 5 chords → Select 3 → Duplicate → Move duplicates → Undo twice
- [ ] Create progression → Delete all → Undo → Chords restored
- [ ] Drag selection, press Escape mid-drag → Drag cancelled

## Edge Cases
- [ ] Drag chord to canvas edge → Stays in bounds
- [ ] Select all, delete, undo → All restored with correct properties
- [ ] Change key → Background transitions smoothly
- [ ] Zoom 2x, drag chord → Snapping still works correctly
- [ ] 50+ chords on canvas → Still 60fps

## Visual Quality
- [ ] No flicker during drag
- [ ] Smooth animations (300-400ms)
- [ ] Shadows and strokes render correctly
- [ ] Connection lines don't overlap chords
- [ ] Selected state visible and clear

## Performance
- [ ] Initial load < 2 seconds
- [ ] Adding chord < 16ms (60fps)
- [ ] Dragging chord maintains 60fps
- [ ] Selection of 100 chords instant
- [ ] Undo/redo instant (< 16ms)

## Accessibility
- [ ] Tab cycles through interactive elements
- [ ] All buttons have visible focus states
- [ ] Keyboard shortcuts work
- [ ] Screen reader announces actions
- [ ] Contrast meets WCAG AA (4.5:1)

## Console & Errors
- [ ] No errors in console
- [ ] No warnings in console
- [ ] TypeScript compiles without errors
- [ ] No memory leaks after 10 minutes of use
```

## Quality Criteria

- [ ] All 6 Week 2 features integrated
- [ ] Demo progression loads on first start
- [ ] All test checklist items pass
- [ ] Zero console errors/warnings
- [ ] 60fps maintained with 50+ chords
- [ ] Undo/redo works for all actions
- [ ] Keyboard shortcuts don't conflict
- [ ] Visual polish (smooth animations, correct z-index)
- [ ] Code is clean and well-documented
- [ ] Ready for Week 3 (audio features)

## Implementation Notes

1. **Error Boundaries:** Wrap major sections to catch errors gracefully.

2. **Performance Monitoring:** Use React DevTools Profiler to verify 60fps.

3. **State Consistency:** All features use the same Zustand store.

4. **Demo Data:** Pre-loaded progression shows off all features.

5. **Welcome Overlay:** Introduces users to basic interactions.

## Testing Strategy

**Manual Testing:**
1. Go through test checklist systematically
2. Test on multiple browsers (Chrome, Firefox, Safari)
3. Test on different screen sizes
4. Test keyboard-only navigation
5. Test with screen reader (VoiceOver/NVDA)

**Automated Testing (Future):**
- Unit tests for store actions
- Integration tests for drag-drop
- E2E tests for complete workflows

## Common Integration Issues

**Issue:** Drag-drop interferes with selection

**Solution:** Ensure drag activation distance (8px) prevents accidental drags.

**Issue:** Undo doesn't work for some actions

**Solution:** Verify all user actions use command pattern.

**Issue:** Performance degrades with many chords

**Solution:** Memoize components, use React.memo, optimize re-renders.

**Issue:** Z-index conflicts

**Solution:** Document z-index layers:
- 0: Connection lines
- 1: Chords
- 100: Selection info
- 1000: Context menu
- 2000: Modals

## Next Steps

After Week 2 is complete and tested:
1. **Week 3:** Audio engine, SATB voicing, playback
2. **Week 4:** Tempo control, visual playback feedback
3. **Week 5-10:** AI features, export, polish

---

**Output Format:** Provide complete integrated App.tsx, all supporting components, comprehensive test checklist, and verification that all Week 2 features work together seamlessly. The demo should be impressive and bug-free.
