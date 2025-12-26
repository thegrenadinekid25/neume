import { Chord } from './index';

/**
 * Base command interface
 */
export interface Command {
  execute: () => void;
  undo: () => void;
  description: string;
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
  private store: any;

  constructor(chord: Chord, store: any) {
    this.chord = chord;
    this.store = store;
  }

  execute() {
    const state = this.store.getState();
    state.addChordDirect(this.chord);
  }

  undo() {
    const state = this.store.getState();
    state.removeChordDirect(this.chord.id);
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
    const state = this.store.getState();
    state.deleteChordsDirectinternal(this.chordIds);
  }

  undo() {
    // Restore deleted chords
    const state = this.store.getState();
    const currentChords = state.chords;
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
    newPositions: Array<{ id: string; position: { x: number; y: number }; beat: number }>,
    store: any
  ) {
    this.store = store;
    const chords = store.getState().chords;

    this.moves = chordIds.map((id, index) => {
      const chord = chords.find((c: Chord) => c.id === id)!;
      const newData = newPositions[index];

      return {
        id,
        oldPosition: { ...chord.position },
        newPosition: newData.position,
        oldBeat: chord.startBeat,
        newBeat: newData.beat,
      };
    });
  }

  execute() {
    this.moves.forEach(move => {
      const state = this.store.getState();
      state.updateChordPositionDirect(
        move.id,
        move.newPosition,
        move.newBeat
      );
    });
  }

  undo() {
    this.moves.forEach(move => {
      const state = this.store.getState();
      state.updateChordPositionDirect(
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
        id: crypto.randomUUID(),
        position: {
          x: chord.position.x + 320,
          y: chord.position.y,
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
    const state = this.store.getState();
    state.deleteChordsDirectinternal(duplicateIds);
  }

  get description() {
    return `Duplicate ${this.originalIds.length} chord(s)`;
  }
}
