import React, { useState, useCallback, useRef } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { useDragDrop } from '@/hooks/useDragDrop';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Canvas } from './Canvas';
import { DraggableChord } from './DraggableChord';
import { ChordShape } from './ChordShape';
import { SelectionBox } from './SelectionBox';
import type { Chord, ScaleDegree, MusicalKey, Mode } from '@/types';
import type { PhraseBoundary } from '@/types/progression';
import type { SongContext } from '@/store/why-this-store';
import { CANVAS_CONFIG } from '@/utils/constants';
import styles from './DroppableCanvas.module.css';

interface DroppableCanvasProps {
  chords: Chord[];
  phrases?: PhraseBoundary[];
  songContext?: SongContext;
  currentKey: MusicalKey;
  currentMode: Mode;
  beatsPerMeasure?: number;
  zoom?: number;
  isPlaying?: boolean;
  playheadPosition?: number;
  totalBeats?: number;
  selectedChordIds: string[];
  onUpdateChordPosition: (chordId: string, startBeat: number) => void;
  onAddChord: (scaleDegree: ScaleDegree, position: { x: number }, options?: { quality?: import('@/types').ChordQuality; extensions?: import('@/types').ChordExtensions }) => void;
  onSelectChord: (id: string) => void;
  onSelectChords: (ids: string[]) => void;
  onToggleChordSelection: (id: string) => void;
  onSelectRange: (fromId: string, toId: string) => void;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onDeleteSelected?: () => void;
  onDuplicateSelected?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomChange?: (zoom: number) => void;
  onShowHelp?: () => void;
  onTogglePlay?: () => void;
  onStop?: () => void;
  onTempoChange?: (delta: number) => void;
}

export const DroppableCanvas: React.FC<DroppableCanvasProps> = ({
  chords,
  phrases = [],
  songContext,
  currentKey,
  currentMode,
  beatsPerMeasure = 4,
  zoom = 1.0,
  isPlaying = false,
  playheadPosition = 0,
  totalBeats = 32,
  selectedChordIds,
  onUpdateChordPosition,
  onAddChord,
  onSelectChord,
  onSelectChords,
  onToggleChordSelection,
  onSelectRange,
  onClearSelection,
  onSelectAll,
  onDeleteSelected,
  onDuplicateSelected,
  onUndo,
  onRedo,
  onZoomChange,
  onShowHelp,
  onTogglePlay,
  onStop,
  onTempoChange,
}) => {
  const { sensors } = useDragDrop();
  const [activeChord, setActiveChord] = useState<Chord | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Selection box state
  const [selectionBox, setSelectionBox] = useState<{
    isSelecting: boolean;
    start: { x: number; y: number };
    current: { x: number; y: number };
  } | null>(null);

  const beatWidth = CANVAS_CONFIG.GRID_BEAT_WIDTH * zoom;

  // Handle arrow key movement
  const handleMoveSelected = useCallback((direction: 'left' | 'right', amount: number) => {
    if (selectedChordIds.length === 0) return;

    const delta = direction === 'left' ? -amount : amount;
    selectedChordIds.forEach(id => {
      const chord = chords.find(c => c.id === id);
      if (chord) {
        const newBeat = Math.max(0, chord.startBeat + delta);
        onUpdateChordPosition(id, newBeat);
      }
    });
  }, [selectedChordIds, chords, onUpdateChordPosition]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSelectAll,
    onClearSelection,
    onDeleteSelected,
    onDuplicateSelected,
    onUndo,
    onRedo,
    onMoveSelected: handleMoveSelected,
    onTempoChange,
    onShowHelp,
    onTogglePlay,
    onStop,
  });

  // Handle chord click for selection
  const handleChordClick = useCallback((chord: Chord, e: React.MouseEvent) => {
    e.stopPropagation();

    if (e.metaKey || e.ctrlKey) {
      onToggleChordSelection(chord.id);
    } else if (e.shiftKey) {
      const lastSelected = selectedChordIds[selectedChordIds.length - 1];
      if (lastSelected) {
        onSelectRange(lastSelected, chord.id);
      } else {
        onSelectChord(chord.id);
      }
    } else {
      onSelectChord(chord.id);
    }
  }, [selectedChordIds, onSelectChord, onToggleChordSelection, onSelectRange]);

  // Clear selection when clicking empty space
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-chord]')) {
      onClearSelection();
    }
  }, [onClearSelection]);

  // Selection box handlers
  const handleSelectionStart = useCallback((e: React.MouseEvent) => {
    // Only start selection if Shift is held and clicking empty space (not a chord)
    if (!e.shiftKey) return;

    const target = e.target as HTMLElement;
    if (target.closest('[data-chord]')) return;

    const rect = canvasContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSelectionBox({
      isSelecting: true,
      start: { x, y },
      current: { x, y },
    });
  }, []);

  const handleSelectionMove = useCallback((e: React.MouseEvent) => {
    if (!selectionBox?.isSelecting) return;

    const rect = canvasContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSelectionBox(prev => prev ? { ...prev, current: { x, y } } : null);
  }, [selectionBox?.isSelecting]);

  const handleSelectionEnd = useCallback(() => {
    if (!selectionBox?.isSelecting) return;

    // Calculate selection bounds
    const minX = Math.min(selectionBox.start.x, selectionBox.current.x);
    const maxX = Math.max(selectionBox.start.x, selectionBox.current.x);
    const minY = Math.min(selectionBox.start.y, selectionBox.current.y);
    const maxY = Math.max(selectionBox.start.y, selectionBox.current.y);

    // Find chords within the selection box
    const selectedIds = chords.filter(chord => {
      const chordX = chord.startBeat * beatWidth;
      const chordSize = chord.size * zoom;
      const chordCenterX = chordX + chordSize / 2;
      const chordCenterY = 40 * zoom; // Approximate center Y in chord area

      return chordCenterX >= minX && chordCenterX <= maxX &&
             chordCenterY >= minY - 100 && chordCenterY <= maxY + 100; // More forgiving Y bounds
    }).map(c => c.id);

    if (selectedIds.length > 0) {
      onSelectChords(selectedIds);
    }

    setSelectionBox(null);
  }, [selectionBox, chords, beatWidth, zoom, onSelectChords]);

  // Drag handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const chord = chords.find(c => c.id === active.id);
    if (chord) {
      setActiveChord(chord);
    }
  }, [chords]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;

    if (!delta) {
      setActiveChord(null);
      return;
    }

    const isSelected = selectedChordIds.includes(active.id as string);
    const chordsToMove = isSelected && selectedChordIds.length > 1
      ? selectedChordIds
      : [active.id as string];

    // Move chords horizontally
    chordsToMove.forEach((id) => {
      const chord = chords.find(c => c.id === id);
      if (!chord) return;

      // Calculate new X position and snap to beat
      const currentX = chord.startBeat * beatWidth;
      const newX = currentX + delta.x;
      const snappedBeat = Math.max(0, Math.round(newX / beatWidth));

      onUpdateChordPosition(id, snappedBeat);
    });

    setActiveChord(null);
  }, [chords, beatWidth, selectedChordIds, onUpdateChordPosition]);

  const handleDragCancel = useCallback(() => {
    setActiveChord(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[restrictToHorizontalAxis]}
    >
      <div
        ref={canvasContainerRef}
        className={styles.canvasWrapper}
        onClick={handleCanvasClick}
        onMouseDown={handleSelectionStart}
        onMouseMove={handleSelectionMove}
        onMouseUp={handleSelectionEnd}
        onMouseLeave={handleSelectionEnd}
      >
        <Canvas
          currentKey={currentKey}
          currentMode={currentMode}
          beatsPerMeasure={beatsPerMeasure}
          zoom={zoom}
          isPlaying={isPlaying}
          playheadPosition={playheadPosition}
          totalBeats={totalBeats}
          phrases={phrases}
          onAddChord={onAddChord}
          onZoomChange={onZoomChange}
        >
          {chords.map(chord => (
            <DraggableChord
              key={chord.id}
              chord={chord}
              allChords={chords}
              songContext={songContext}
              isSelected={selectedChordIds.includes(chord.id)}
              isPlaying={isPlaying && chord.playing}
              onClick={(e) => handleChordClick(chord, e)}
              zoom={zoom}
            />
          ))}
        </Canvas>

        {/* Selection Info */}
        {selectedChordIds.length > 1 && (
          <div className={styles.selectionInfo}>
            {selectedChordIds.length} chords selected
          </div>
        )}

        {/* Selection Box */}
        {selectionBox?.isSelecting && (
          <SelectionBox
            start={selectionBox.start}
            current={selectionBox.current}
          />
        )}
      </div>

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
