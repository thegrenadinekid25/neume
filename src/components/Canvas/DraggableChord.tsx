import React, { useState, useCallback, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ChordShape } from './ChordShape';
import { CANVAS_CONFIG } from '@/utils/constants';
import type { Chord } from '@/types';
import styles from './DraggableChord.module.css';
import { useWhyThisStore, type SongContext } from '@/store/why-this-store';
import { useCanvasStore } from '@/store/canvas-store';
import { ContextMenu, type ContextMenuItem } from '@/components/UI/ContextMenu';

interface DraggableChordProps {
  chord: Chord;
  allChords: Chord[];
  songContext?: SongContext;
  isSelected?: boolean;
  isPlaying?: boolean;
  onSelect?: () => void;
  onClick?: (e: React.MouseEvent) => void;
  zoom?: number;
}

const DraggableChordComponent: React.FC<DraggableChordProps> = ({
  chord,
  allChords,
  songContext,
  isSelected,
  isPlaying,
  onSelect,
  onClick,
  zoom = 1.0,
}) => {
  // Context menu state
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  // Store hooks
  const openWhyThisPanel = useWhyThisStore(state => state.openPanel);
  const removeChord = useCanvasStore(state => state.removeChord);

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

  // X position from startBeat (no Y needed - CSS handles vertical alignment)
  const xPosition = chord.startBeat * CANVAS_CONFIG.GRID_BEAT_WIDTH * zoom;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: xPosition,
    bottom: 0, // Align to bottom of chord area (sits on track)
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? 'none' : 'transform 150ms ease',
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return;
    onClick?.(e);
  }, [isDragging, onClick]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  }, []);

  // Get previous and next chords for context (sorted by startBeat for correct order)
  const { sortedChords, previousChord, nextChord } = useMemo(() => {
    const sorted = [...allChords].sort((a, b) => a.startBeat - b.startBeat);
    const idx = sorted.findIndex(c => c.id === chord.id);
    return {
      sortedChords: sorted,
      previousChord: idx > 0 ? sorted[idx - 1] : undefined,
      nextChord: idx < sorted.length - 1 ? sorted[idx + 1] : undefined,
    };
  }, [allChords, chord.id]);

  // Build context menu items
  const menuItems = useMemo(() => {
    const items: ContextMenuItem[] = [
    {
      id: 'why-this',
      label: 'Why This?',
      action: () => {
        openWhyThisPanel(chord, previousChord, nextChord, sortedChords, songContext);
        setContextMenuOpen(false);
      },
    },
    {
      id: 'divider-1',
      label: '',
      divider: true,
      action: () => {},
    },
    {
      id: 'delete',
      label: 'Delete',
      action: () => {
        removeChord(chord.id);
        setContextMenuOpen(false);
      },
    },
    ];
    return items;
  }, [chord, previousChord, nextChord, sortedChords, songContext, openWhyThisPanel, removeChord]);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={styles.draggableChord}
        data-chord="true"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
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
      <ContextMenu
        isOpen={contextMenuOpen}
        position={contextMenuPosition}
        items={menuItems}
        onClose={() => setContextMenuOpen(false)}
      />
    </>
  );
};

// Custom comparison for memo to prevent unnecessary re-renders
function areDraggableChordPropsEqual(prev: DraggableChordProps, next: DraggableChordProps): boolean {
  return (
    prev.chord.id === next.chord.id &&
    prev.chord.startBeat === next.chord.startBeat &&
    prev.chord.quality === next.chord.quality &&
    prev.isSelected === next.isSelected &&
    prev.isPlaying === next.isPlaying &&
    prev.zoom === next.zoom &&
    prev.allChords.length === next.allChords.length
  );
}

export const DraggableChord = React.memo(DraggableChordComponent, areDraggableChordPropsEqual);
