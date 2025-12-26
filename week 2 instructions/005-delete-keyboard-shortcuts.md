# Prompt 005: Delete & Keyboard Shortcuts

## Objective
Implement delete functionality for removing chords, plus comprehensive keyboard shortcuts for common operations. This makes Harmonic Canvas efficient for power users and accessible via keyboard-only navigation.

## Context
Users can now add, move, and select chords, but can't delete them. This prompt adds deletion and a complete keyboard shortcut system for efficient workflow.

**Dependencies:**
- Requires Week 1 (complete visual system)
- Requires Week 2 Prompts 001-004 (all interaction features)

**Related Components:**
- Selection system (delete operates on selected chords)
- Context menu (right-click selected chord → delete option)
- Keyboard shortcuts hook

**Next Steps:** Undo/redo (Prompt 006) will make delete reversible

## Requirements

### Core Requirements

**Delete Functionality:**
1. **Backspace/Delete key** deletes selected chords
2. **Context menu "Delete"** option
3. **Confirmation** for large deletions (5+ chords)
4. **Visual feedback** (fade out animation)
5. **No orphan connections** (lines update automatically)

**Keyboard Shortcuts:**
6. **Cmd/Ctrl + A** - Select all
7. **Cmd/Ctrl + D** - Duplicate selected
8. **Backspace/Delete** - Delete selected
9. **Cmd/Ctrl + L** - Toggle connection lines
10. **Escape** - Clear selection
11. **Cmd/Ctrl + Z** - Undo (implemented in Prompt 006)
12. **Cmd/Ctrl + Shift + Z** - Redo (implemented in Prompt 006)
13. **Arrow keys** - Move selected chords (fine positioning)
14. **Space** - Play/Pause
15. **Cmd/Ctrl + S** - Save progression

## Technical Constraints

- Prevent default browser shortcuts
- Don't interfere with text input
- Visual shortcut guide available (? key)
- Platform-specific keys (Cmd on Mac, Ctrl on Windows)
- No conflicts with browser shortcuts

## Code Structure

### Update src/store/canvas-store.ts

```typescript
interface CanvasState {
  // ... existing state
  
  // Delete Actions
  deleteChords: (ids: string[]) => void;
  deleteSelected: () => void;
  
  // Duplicate Actions
  duplicateChords: (ids: string[]) => void;
  duplicateSelected: () => void;

  // ... existing actions
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  // ... existing state

  deleteChords: (ids) => set((state) => {
    // Remove chords
    const newChords = state.chords.filter(c => !ids.includes(c.id));
    
    // Clear selection if deleted chords were selected
    const newSelection = state.selectedChordIds.filter(id => !ids.includes(id));
    
    return {
      chords: newChords,
      selectedChordIds: newSelection,
    };
  }),

  deleteSelected: () => {
    const { selectedChordIds, deleteChords } = get();
    if (selectedChordIds.length > 0) {
      deleteChords(selectedChordIds);
    }
  },

  duplicateChords: (ids) => set((state) => {
    const chordsToDuplicate = state.chords.filter(c => ids.includes(c.id));
    
    // Create duplicates offset by 4 beats
    const duplicates = chordsToDuplicate.map(chord => ({
      ...chord,
      id: uuidv4(),
      position: {
        x: chord.position.x + (4 * CANVAS_CONFIG.GRID_BEAT_WIDTH), // 4 beats right
        y: chord.position.y + 20, // Slight vertical offset
      },
      startBeat: chord.startBeat + 4,
      createdAt: new Date().toISOString(),
    }));
    
    return {
      chords: [...state.chords, ...duplicates],
      selectedChordIds: duplicates.map(c => c.id), // Select duplicates
    };
  }),

  duplicateSelected: () => {
    const { selectedChordIds, duplicateChords } = get();
    if (selectedChordIds.length > 0) {
      duplicateChords(selectedChordIds);
    }
  },

  // ... existing actions
}));
```

### src/components/UI/DeleteConfirmation.tsx

```typescript
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './DeleteConfirmation.module.css';

interface DeleteConfirmationProps {
  isOpen: boolean;
  chordCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  chordCount,
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <h3>Delete {chordCount} chords?</h3>
            <p>This action cannot be undone.</p>
            
            <div className={styles.buttons}>
              <button
                className={styles.cancelButton}
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                className={styles.deleteButton}
                onClick={onConfirm}
                autoFocus
              >
                Delete
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
```

### src/components/UI/DeleteConfirmation.module.css

```css
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-lg);
  z-index: 2001;
  min-width: 320px;
}

.modal h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: var(--text-primary);
}

.modal p {
  margin: 0 0 20px;
  font-size: 13px;
  color: var(--text-secondary);
}

.buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancelButton,
.deleteButton {
  padding: 8px 16px;
  border-radius: var(--border-radius-sm);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-apple-smooth);
}

.cancelButton {
  background: var(--background-secondary);
  border: 1px solid var(--border-medium);
  color: var(--text-primary);
}

.cancelButton:hover {
  background: var(--border-light);
}

.deleteButton {
  background: var(--error);
  border: none;
  color: white;
}

.deleteButton:hover {
  background: #b03830;
}

.deleteButton:focus-visible,
.cancelButton:focus-visible {
  outline: 2px solid var(--primary-action);
  outline-offset: 2px;
}
```

### Update src/hooks/useKeyboardShortcuts.ts

Complete keyboard shortcut system:

```typescript
import { useEffect } from 'react';
import { useCanvasStore } from '@/store/canvas-store';

export function useKeyboardShortcuts() {
  const {
    selectAll,
    clearSelection,
    deleteSelected,
    duplicateSelected,
    toggleConnectionLines,
    selectedChordIds,
  } = useCanvasStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + A: Select All
      if (modifier && e.key === 'a') {
        e.preventDefault();
        selectAll();
      }

      // Cmd/Ctrl + D: Duplicate
      if (modifier && e.key === 'd') {
        e.preventDefault();
        duplicateSelected();
      }

      // Cmd/Ctrl + L: Toggle connection lines
      if (modifier && e.key === 'l') {
        e.preventDefault();
        toggleConnectionLines();
      }

      // Delete/Backspace: Delete selected
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        !modifier
      ) {
        e.preventDefault();
        deleteSelected();
      }

      // Escape: Clear selection
      if (e.key === 'Escape') {
        clearSelection();
      }

      // Arrow keys: Move selected chords (fine positioning)
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        if (selectedChordIds.length > 0) {
          e.preventDefault();
          handleArrowKeyMove(e.key, e.shiftKey);
        }
      }

      // ?: Show keyboard shortcuts help
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        showKeyboardShortcuts();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectAll,
    clearSelection,
    deleteSelected,
    duplicateSelected,
    toggleConnectionLines,
    selectedChordIds,
  ]);

  // Helper: Move chords with arrow keys
  const handleArrowKeyMove = (key: string, shiftKey: boolean) => {
    const { selectedChordIds, chords, updateChordPosition } = useCanvasStore.getState();
    const step = shiftKey ? 10 : 1; // Shift = 10px, normal = 1px

    selectedChordIds.forEach(id => {
      const chord = chords.find(c => c.id === id);
      if (!chord) return;

      let newX = chord.position.x;
      let newY = chord.position.y;

      switch (key) {
        case 'ArrowLeft':
          newX -= step;
          break;
        case 'ArrowRight':
          newX += step;
          break;
        case 'ArrowUp':
          newY -= step;
          break;
        case 'ArrowDown':
          newY += step;
          break;
      }

      const newBeat = Math.round(newX / CANVAS_CONFIG.GRID_BEAT_WIDTH);
      updateChordPosition(id, { x: newX, y: newY }, newBeat);
    });
  };

  // Helper: Show keyboard shortcuts modal
  const showKeyboardShortcuts = () => {
    // This will be implemented in a future modal
    console.log('Keyboard shortcuts help');
  };
}
```

### src/components/UI/KeyboardShortcutsGuide.tsx

```typescript
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './KeyboardShortcutsGuide.module.css';

interface KeyboardShortcutsGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsGuide: React.FC<KeyboardShortcutsGuideProps> = ({
  isOpen,
  onClose,
}) => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifier = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    { keys: `${modifier} A`, action: 'Select all chords' },
    { keys: `${modifier} D`, action: 'Duplicate selected' },
    { keys: 'Delete/Backspace', action: 'Delete selected' },
    { keys: `${modifier} L`, action: 'Toggle connection lines' },
    { keys: 'Esc', action: 'Clear selection' },
    { keys: '←→↑↓', action: 'Move selected (1px)' },
    { keys: `Shift + ←→↑↓`, action: 'Move selected (10px)' },
    { keys: 'Space', action: 'Play/Pause' },
    { keys: `${modifier} Z`, action: 'Undo' },
    { keys: `${modifier} Shift Z`, action: 'Redo' },
    { keys: '?', action: 'Show this guide' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className={styles.guide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <h2>Keyboard Shortcuts</h2>

            <div className={styles.shortcuts}>
              {shortcuts.map((shortcut, i) => (
                <div key={i} className={styles.shortcut}>
                  <kbd>{shortcut.keys}</kbd>
                  <span>{shortcut.action}</span>
                </div>
              ))}
            </div>

            <button onClick={onClose} className={styles.closeButton}>
              Close
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
```

### Update Context Menu

Add delete option to chord context menu:

```typescript
// In ChordContextMenu.tsx

const menuItems: ContextMenuItem[] = [
  // ... existing items (Edit, Duplicate)
  
  {
    id: 'delete',
    label: 'Delete',
    icon: '🗑️',
    action: () => deleteChords([chord.id]),
    divider: true,
  },
  
  // ... other items
];
```

## Integration Example

### In App.tsx

```typescript
import { useState } from 'react';
import { DeleteConfirmation } from '@/components/UI/DeleteConfirmation';
import { KeyboardShortcutsGuide } from '@/components/UI/KeyboardShortcutsGuide';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useCanvasStore } from '@/store/canvas-store';

function App() {
  const { deleteSelected, selectedChordIds } = useCanvasStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  const handleDelete = () => {
    if (selectedChordIds.length >= 5) {
      // Show confirmation for large deletions
      setShowDeleteConfirm(true);
    } else {
      deleteSelected();
    }
  };

  return (
    <div className="app">
      {/* ... Canvas and other components ... */}

      {/* Delete Confirmation */}
      <DeleteConfirmation
        isOpen={showDeleteConfirm}
        chordCount={selectedChordIds.length}
        onConfirm={() => {
          deleteSelected();
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Keyboard Shortcuts Guide */}
      <KeyboardShortcutsGuide
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}
```

## Quality Criteria

- [ ] Delete key removes selected chords
- [ ] Confirmation shows for 5+ chords
- [ ] Fade-out animation when deleting
- [ ] Connection lines update after delete
- [ ] Cmd/Ctrl + D duplicates selected
- [ ] Arrow keys move selected (1px/10px with Shift)
- [ ] All shortcuts work on Mac (Cmd) and Windows (Ctrl)
- [ ] Shortcuts don't trigger when typing in input
- [ ] ? key shows shortcuts guide
- [ ] Shortcuts guide is visually clear
- [ ] No conflicts with browser shortcuts
- [ ] Screen reader announces actions

## Implementation Notes

1. **Platform Detection:** Checks `navigator.platform` to show correct modifier key (⌘ or Ctrl).

2. **Input Protection:** Shortcuts disabled when focus is in text input to avoid conflicts.

3. **Confirmation Threshold:** 5+ chords triggers confirmation modal to prevent accidental large deletions.

4. **Arrow Key Movement:** Shift multiplies step by 10 for faster repositioning.

5. **Fade-Out Animation:** Using Framer Motion's exit animations for smooth deletion.

## Accessibility

- Keyboard shortcuts follow platform conventions
- All actions have keyboard equivalents
- Shortcuts guide accessible via ? key
- Screen reader announces deletions
- Focus management in confirmation modal

## Performance

- Event listener cleanup on unmount
- No performance impact from keyboard listener
- Memoized shortcut handlers

## Testing Considerations

Test scenarios:
1. **Delete single:** Select 1 chord, press Delete → Removed
2. **Delete multiple:** Select 3 chords, press Delete → All removed
3. **Delete confirmation:** Select 6 chords, press Delete → Confirmation shows
4. **Duplicate:** Select 2 chords, Cmd+D → 2 duplicates created
5. **Arrow keys:** Select chord, press → → Moves 1px right
6. **Shift + arrows:** Select chord, Shift+→ → Moves 10px right
7. **Shortcuts guide:** Press ? → Guide appears
8. **Platform detection:** On Mac shows ⌘, on Windows shows Ctrl

## Next Steps

After delete & shortcuts are working:
1. Implement undo/redo (Prompt 006)
2. Make delete reversible
3. Final integration testing (Prompt 007)

---

**Output Format:** Provide complete DeleteConfirmation component, KeyboardShortcutsGuide, updated useKeyboardShortcuts hook with all shortcuts, delete actions in store, and context menu integration.
