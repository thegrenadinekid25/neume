# Prompt 006: Undo/Redo System

## Objective
Implement a robust undo/redo system using the command pattern, making all user actions reversible. This is essential for confident experimentation and professional workflow.

## Context
Users can now add, move, delete, and manipulate chords, but mistakes are permanent. An undo/redo system enables risk-free experimentation and professional editing workflows.

**Dependencies:**
- Requires Week 1 (complete visual system)
- Requires Week 2 Prompts 001-005 (all user actions)

**Related Components:**
- All actions that modify chords
- Keyboard shortcuts (Cmd/Ctrl + Z, Cmd/Ctrl + Shift + Z)
- Store state management

**Next Steps:** Integration testing (Prompt 007)

## Requirements

### Core Requirements
1. **Undo** (Cmd/Ctrl + Z) - Reverse last action
2. **Redo** (Cmd/Ctrl + Shift + Z) - Reapply undone action
3. **Undo stack** (last 50 actions)
4. **Supported actions:**
   - Add chord
   - Delete chord(s)
   - Move chord(s)
   - Duplicate chord(s)
   - Edit chord properties
5. **Visual feedback** (toast notification)
6. **Undo/Redo buttons** in UI (optional)
7. **Clear on save** (optional - reset stack after save)
8. **Ignore insignificant changes** (micro-movements during drag)

### Command Pattern
- Each action = Command object
- Commands are reversible (execute + undo)
- Undo stack stores commands
- Redo stack stores undone commands

## Technical Constraints

- Max 50 commands in stack (memory management)
- Efficient state snapshots
- No performance impact on normal operations
- Works with Zustand store
- Type-safe command definitions

## Code Structure

### src/types/commands.ts

Define command interface and types:

```typescript
/**
 * Base command interface
 */
export interface Command {
  execute: () => void;
  undo: () => void;
  description: string; // For debugging/UI
}

/**
 * Command types for different actions
 */
export type CommandType =
  | 'add'
  | 'delete'
  | 'move'
  | 'duplicate'
  | 'edit';

/**
 * Add chord command
 */
export class AddChordCommand implements Command {
  private chord: Chord;
  private store: any; // CanvasStore

  constructor(chord: Chord, store: any) {
    this.chord = chord;
    this.store = store;
  }

  execute() {
    this.store.getState().addChord(this.chord);
  }

  undo() {
    this.store.getState().deleteChords([this.chord.id]);
  }

  get description() {
    return `Add ${this.chord.scaleDegree} chord`;
  }
}

/**
 * Delete chord(s) command
 */
export class DeleteChordsCommand implements Command {
  private chordIds: string[];
  private deletedChords: Chord[];
  private store: any;

  constructor(chordIds: string[], store: any) {
    this.chordIds = chordIds;
    this.store = store;
    // Capture chords before deletion
    this.deletedChords = store.getState().chords.filter((c: Chord) =>
      chordIds.includes(c.id)
    );
  }

  execute() {
    this.store.getState().deleteChords(this.chordIds);
  }

  undo() {
    // Restore deleted chords
    const currentChords = this.store.getState().chords;
    this.store.setState({
      chords: [...currentChords, ...this.deletedChords],
    });
  }

  get description() {
    return `Delete ${this.chordIds.length} chord(s)`;
  }
}

/**
 * Move chord(s) command
 */
export class MoveChordsCommand implements Command {
  private moves: Array<{
    id: string;
    oldPosition: { x: number; y: number };
    newPosition: { x: number; y: number };
    oldBeat: number;
    newBeat: number;
  }>;
  private store: any;

  constructor(
    chordIds: string[],
    delta: { x: number; y: number },
    store: any
  ) {
    this.store = store;
    const chords = store.getState().chords;

    this.moves = chordIds.map(id => {
      const chord = chords.find((c: Chord) => c.id === id)!;
      const newX = chord.position.x + delta.x;
      const newY = chord.position.y + delta.y;
      const newBeat = Math.round(newX / CANVAS_CONFIG.GRID_BEAT_WIDTH);

      return {
        id,
        oldPosition: { ...chord.position },
        newPosition: { x: newX, y: newY },
        oldBeat: chord.startBeat,
        newBeat,
      };
    });
  }

  execute() {
    this.moves.forEach(move => {
      this.store.getState().updateChordPosition(
        move.id,
        move.newPosition,
        move.newBeat
      );
    });
  }

  undo() {
    this.moves.forEach(move => {
      this.store.getState().updateChordPosition(
        move.id,
        move.oldPosition,
        move.oldBeat
      );
    });
  }

  get description() {
    return `Move ${this.moves.length} chord(s)`;
  }
}

/**
 * Duplicate chord(s) command
 */
export class DuplicateChordsCommand implements Command {
  private originalIds: string[];
  private duplicates: Chord[];
  private store: any;

  constructor(chordIds: string[], store: any) {
    this.originalIds = chordIds;
    this.store = store;
    
    // Create duplicates
    const chords = store.getState().chords;
    this.duplicates = chords
      .filter((c: Chord) => chordIds.includes(c.id))
      .map((chord: Chord) => ({
        ...chord,
        id: uuidv4(),
        position: {
          x: chord.position.x + (4 * CANVAS_CONFIG.GRID_BEAT_WIDTH),
          y: chord.position.y + 20,
        },
        startBeat: chord.startBeat + 4,
        createdAt: new Date().toISOString(),
      }));
  }

  execute() {
    const currentChords = this.store.getState().chords;
    this.store.setState({
      chords: [...currentChords, ...this.duplicates],
      selectedChordIds: this.duplicates.map(c => c.id),
    });
  }

  undo() {
    const duplicateIds = this.duplicates.map(c => c.id);
    this.store.getState().deleteChords(duplicateIds);
  }

  get description() {
    return `Duplicate ${this.originalIds.length} chord(s)`;
  }
}
```

### Update src/store/canvas-store.ts

Add undo/redo state and actions:

```typescript
import { Command } from '@types/commands';

interface CanvasState {
  // ... existing state

  // Undo/Redo
  undoStack: Command[];
  redoStack: Command[];
  
  executeCommand: (command: Command) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;

  // ... existing actions
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  // ... existing state
  undoStack: [],
  redoStack: [],

  executeCommand: (command) => {
    // Execute the command
    command.execute();

    // Add to undo stack
    set((state) => ({
      undoStack: [...state.undoStack, command].slice(-50), // Keep last 50
      redoStack: [], // Clear redo stack on new action
    }));
  },

  undo: () => {
    const { undoStack, redoStack } = get();
    
    if (undoStack.length === 0) return;

    // Pop from undo stack
    const command = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    // Undo the command
    command.undo();

    // Push to redo stack
    set({
      undoStack: newUndoStack,
      redoStack: [...redoStack, command],
    });
  },

  redo: () => {
    const { redoStack, undoStack } = get();
    
    if (redoStack.length === 0) return;

    // Pop from redo stack
    const command = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    // Re-execute the command
    command.execute();

    // Push to undo stack
    set({
      redoStack: newRedoStack,
      undoStack: [...undoStack, command],
    });
  },

  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,

  clearHistory: () => set({
    undoStack: [],
    redoStack: [],
  }),

  // ... existing actions
}));
```

### Update Actions to Use Commands

Modify existing actions to use command pattern:

```typescript
// In canvas-store.ts

// Old way (direct mutation)
addChord: (chord) => set((state) => ({
  chords: [...state.chords, chord]
})),

// New way (via command)
addChordWithCommand: (chord) => {
  const command = new AddChordCommand(chord, useCanvasStore);
  get().executeCommand(command);
},

deleteSelectedWithCommand: () => {
  const { selectedChordIds } = get();
  if (selectedChordIds.length > 0) {
    const command = new DeleteChordsCommand(selectedChordIds, useCanvasStore);
    get().executeCommand(command);
  }
},

duplicateSelectedWithCommand: () => {
  const { selectedChordIds } = get();
  if (selectedChordIds.length > 0) {
    const command = new DuplicateChordsCommand(selectedChordIds, useCanvasStore);
    get().executeCommand(command);
  }
},
```

### Update Keyboard Shortcuts

Add undo/redo shortcuts:

```typescript
// In useKeyboardShortcuts.ts

export function useKeyboardShortcuts() {
  const { undo, redo, canUndo, canRedo, /* ... */ } = useCanvasStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ... existing shortcuts

      // Cmd/Ctrl + Z: Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
      }

      // Cmd/Ctrl + Shift + Z: Redo
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        if (canRedo()) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo, /* ... */]);
}
```

### Optional: Undo/Redo Buttons

```typescript
// In ControlBar or Header
import { useCanvasStore } from '@/store/canvas-store';

export const UndoRedoButtons: React.FC = () => {
  const { undo, redo, canUndo, canRedo } = useCanvasStore();

  return (
    <div className={styles.undoRedoButtons}>
      <button
        onClick={undo}
        disabled={!canUndo()}
        aria-label="Undo"
        title="Undo (Cmd+Z)"
      >
        ↶
      </button>
      <button
        onClick={redo}
        disabled={!canRedo()}
        aria-label="Redo"
        title="Redo (Cmd+Shift+Z)"
      >
        ↷
      </button>
    </div>
  );
};
```

### Update DroppableCanvas handleDragEnd

Use MoveChordsCommand:

```typescript
const handleDragEnd = (event: DragEndEvent) => {
  const { active, delta } = event;

  if (!delta) return;

  const dragData = active.data.current;
  const selectedIds = dragData?.selectedIds || [active.id];

  // Create move command
  const command = new MoveChordsCommand(selectedIds, delta, useCanvasStore);
  executeCommand(command);
};
```

## Quality Criteria

- [ ] Cmd/Ctrl + Z undoes last action
- [ ] Cmd/Ctrl + Shift + Z redoes undone action
- [ ] Add chord → undo → chord removed
- [ ] Delete chord → undo → chord restored
- [ ] Move chord → undo → returns to original position
- [ ] Duplicate → undo → duplicates removed
- [ ] Multiple undos work in sequence
- [ ] Redo works after undo
- [ ] Undo stack limited to 50 commands
- [ ] New action clears redo stack
- [ ] Buttons disabled when can't undo/redo
- [ ] No memory leaks with large undo stacks

## Implementation Notes

1. **Command Pattern:** Each action is encapsulated as a Command object with execute() and undo() methods.

2. **State Snapshots:** Commands capture necessary state (deleted chords, old positions) in constructor.

3. **Stack Limit:** `.slice(-50)` keeps only last 50 commands to prevent memory bloat.

4. **Redo Invalidation:** New action clears redo stack (standard behavior).

5. **Direct vs Command:** Keep direct mutation methods for internal use, use command methods for user actions.

## Accessibility

- Undo/redo buttons have aria-labels
- Keyboard shortcuts follow platform conventions
- Screen reader announces undo/redo actions

## Performance

- Commands store minimal state (not full snapshots)
- O(1) undo/redo operations
- Stack limited to prevent memory issues
- No re-renders unless state actually changes

## Testing Considerations

Test scenarios:
1. **Add & undo:** Add chord, Cmd+Z → Chord removed
2. **Delete & undo:** Delete chord, Cmd+Z → Chord restored with same properties
3. **Move & undo:** Move chord, Cmd+Z → Chord back to original position
4. **Multiple undos:** 5 actions, 5 undos → Back to initial state
5. **Redo:** Undo 3 times, redo 2 times → Correct state
6. **New action clears redo:** Undo, make new change → Can't redo
7. **Stack limit:** 60 actions → Only last 50 in stack
8. **Multi-chord operations:** Select 3, delete, undo → All 3 restored

## Common Issues & Solutions

**Issue:** Undo doesn't restore exact state

**Solution:** Ensure command constructor captures all necessary data before execution.

**Issue:** Memory grows indefinitely

**Solution:** `.slice(-50)` limits stack size. Adjust if needed.

**Issue:** Redo doesn't work

**Solution:** Verify new actions clear redoStack.

## Next Steps

After undo/redo is working:
1. Integration testing (Prompt 007)
2. Test all interactions work together
3. Prepare for Week 3 (audio)

---

**Output Format:** Provide complete Command classes, updated canvas-store with undo/redo logic, keyboard shortcuts integration, and optional UI buttons. Ensure all user actions are reversible and memory is managed efficiently.
