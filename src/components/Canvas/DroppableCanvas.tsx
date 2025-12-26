import React, { useState, useRef } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { useDragDrop } from '@/hooks/useDragDrop';
import { Canvas } from './Canvas';
import { DraggableChord } from './DraggableChord';
import { ChordShape } from './ChordShape';
import { SelectionBox } from './SelectionBox';
import { ConnectionLines } from './ConnectionLines';
import { Chord } from '@types';
import { CANVAS_CONFIG } from '@/utils/constants';

interface DroppableCanvasProps {
  chords: Chord[];
  currentKey: string;
  currentMode: 'major' | 'minor';
  zoom: number;
  isPlaying?: boolean;
  playheadPosition?: number;
  selectedChordIds?: string[];
  showConnectionLines?: boolean;
  onUpdateChordPosition: (chordId: string, newPosition: { x: number; y: number }, newBeat: number) => void;
  onAddChord: (chord: Chord) => void;
  onSelectChord?: (chordId: string, event?: React.MouseEvent) => void;
  onSelectMultiple?: (chordIds: string[]) => void;
  onClearSelection?: () => void;
}

export const DroppableCanvas: React.FC<DroppableCanvasProps> = ({
  chords,
  currentKey,
  currentMode,
  zoom,
  isPlaying = false,
  playheadPosition = 0,
  selectedChordIds = [],
  showConnectionLines = true,
  onUpdateChordPosition,
  onAddChord,
  onSelectChord,
  onSelectMultiple,
  onClearSelection,
}) => {
  const { sensors } = useDragDrop();
  const [activeChord, setActiveChord] = useState<Chord | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionCurrent, setSelectionCurrent] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const beatWidth = CANVAS_CONFIG.GRID_BEAT_WIDTH * zoom;
  const totalBeats = Math.max(32, ...chords.map(c => c.startBeat + c.duration));

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
    const snappedBeat = Math.max(0, Math.round(newX / beatWidth));
    const snappedX = snappedBeat * beatWidth;

    // Constrain Y position (keep within canvas bounds)
    const constrainedY = Math.max(50, Math.min(550, newY));

    // Update chord position
    onUpdateChordPosition(
      chord.id,
      { x: snappedX, y: constrainedY },
      snappedBeat
    );

    setActiveChord(null);
  };

  const handleDragCancel = () => {
    setActiveChord(null);
  };

  // Rectangular selection handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only start selection on empty canvas (not on chords)
    if ((e.target as HTMLElement).closest('[role="button"]')) {
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsSelecting(true);
    setSelectionStart({ x, y });
    setSelectionCurrent({ x, y });

    // Clear selection if not holding Shift
    if (!e.shiftKey) {
      onClearSelection?.();
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting || !selectionStart) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSelectionCurrent({ x, y });
  };

  const handleCanvasMouseUp = () => {
    if (!isSelecting || !selectionStart || !selectionCurrent) {
      setIsSelecting(false);
      return;
    }

    // Calculate selection rectangle
    const minX = Math.min(selectionStart.x, selectionCurrent.x);
    const maxX = Math.max(selectionStart.x, selectionCurrent.x);
    const minY = Math.min(selectionStart.y, selectionCurrent.y);
    const maxY = Math.max(selectionStart.y, selectionCurrent.y);

    // Find chords within selection rectangle
    const selectedIds = chords
      .filter(chord => {
        const chordCenterX = chord.position.x + (chord.size * zoom) / 2;
        const chordCenterY = chord.position.y + (chord.size * zoom) / 2;

        return (
          chordCenterX >= minX &&
          chordCenterX <= maxX &&
          chordCenterY >= minY &&
          chordCenterY <= maxY
        );
      })
      .map(chord => chord.id);

    if (selectedIds.length > 0) {
      onSelectMultiple?.(selectedIds);
    }

    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionCurrent(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        ref={canvasRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={() => {
          if (isSelecting) {
            setIsSelecting(false);
            setSelectionStart(null);
            setSelectionCurrent(null);
          }
        }}
      >
        <Canvas
          currentKey={currentKey}
          currentMode={currentMode}
          zoom={zoom}
          isPlaying={isPlaying}
          playheadPosition={playheadPosition}
          totalBeats={totalBeats}
          onAddChord={onAddChord}
        >
          {/* Connection Lines */}
          {showConnectionLines && (
            <ConnectionLines
              chords={chords}
              isPlaying={isPlaying}
              playheadPosition={playheadPosition}
              zoom={zoom}
            />
          )}

          {chords.map(chord => {
            const isCurrentlyPlaying = isPlaying &&
              playheadPosition >= chord.startBeat &&
              playheadPosition < chord.startBeat + chord.duration;

            return (
              <DraggableChord
                key={chord.id}
                chord={chord}
                isSelected={selectedChordIds.includes(chord.id)}
                isPlaying={isCurrentlyPlaying}
                zoom={zoom}
                beatWidth={beatWidth}
                onSelect={(e) => onSelectChord?.(chord.id, e)}
              />
            );
          })}

          {/* Rectangular Selection Box */}
          {isSelecting && selectionStart && selectionCurrent && (
            <SelectionBox start={selectionStart} current={selectionCurrent} />
          )}
        </Canvas>
      </div>

      {/* Drag Overlay */}
      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        }}
      >
        {activeChord ? (
          <div style={{ cursor: 'grabbing' }}>
            <ChordShape
              chord={activeChord}
              zoom={zoom}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
