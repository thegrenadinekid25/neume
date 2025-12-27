import React, { useState, useCallback, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ChordShape } from './ChordShape';
import { CANVAS_CONFIG } from '@/utils/constants';
import type { Chord, ChordQuality, ChordExtensions } from '@/types';
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
  const updateChord = useCanvasStore(state => state.updateChord);

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

  // Helper to update chord quality
  const handleQualityChange = useCallback((quality: ChordQuality) => {
    updateChord(chord.id, { quality });
    setContextMenuOpen(false);
  }, [chord.id, updateChord]);

  // Helper to toggle an extension
  const handleExtensionToggle = useCallback((extension: keyof ChordExtensions) => {
    const currentExtensions = chord.extensions || {};
    const newExtensions = {
      ...currentExtensions,
      [extension]: !currentExtensions[extension],
    };
    updateChord(chord.id, { extensions: newExtensions });
    setContextMenuOpen(false);
  }, [chord.id, chord.extensions, updateChord]);

  // Helper to clear all extensions
  const handleClearExtensions = useCallback(() => {
    updateChord(chord.id, { extensions: {} });
    setContextMenuOpen(false);
  }, [chord.id, updateChord]);

  // Check if chord has any extensions
  const hasExtensions = useMemo(() => {
    const ext = chord.extensions || {};
    return Object.values(ext).some(v => v === true);
  }, [chord.extensions]);

  // Build context menu items
  const menuItems = useMemo(() => {
    const currentQuality = chord.quality;
    const currentExtensions = chord.extensions || {};

    const items: ContextMenuItem[] = [
      // Quality submenu
      {
        id: 'change-quality',
        label: 'Change Quality',
        submenu: [
          { id: 'q-major', label: currentQuality === 'major' ? '✓ Major' : 'Major', action: () => handleQualityChange('major') },
          { id: 'q-minor', label: currentQuality === 'minor' ? '✓ Minor' : 'Minor', action: () => handleQualityChange('minor') },
          { id: 'q-diminished', label: currentQuality === 'diminished' ? '✓ Diminished' : 'Diminished', action: () => handleQualityChange('diminished') },
          { id: 'q-augmented', label: currentQuality === 'augmented' ? '✓ Augmented' : 'Augmented', action: () => handleQualityChange('augmented') },
          { id: 'q-divider', label: '', divider: true },
          { id: 'q-dom7', label: currentQuality === 'dom7' ? '✓ Dominant 7th' : 'Dominant 7th', action: () => handleQualityChange('dom7') },
          { id: 'q-maj7', label: currentQuality === 'maj7' ? '✓ Major 7th' : 'Major 7th', action: () => handleQualityChange('maj7') },
          { id: 'q-min7', label: currentQuality === 'min7' ? '✓ Minor 7th' : 'Minor 7th', action: () => handleQualityChange('min7') },
          { id: 'q-halfdim7', label: currentQuality === 'halfdim7' ? '✓ Half-dim 7th' : 'Half-dim 7th', action: () => handleQualityChange('halfdim7') },
          { id: 'q-dim7', label: currentQuality === 'dim7' ? '✓ Dim 7th' : 'Dim 7th', action: () => handleQualityChange('dim7') },
        ],
      },
      // Extensions submenu
      {
        id: 'extensions',
        label: 'Extensions',
        submenu: [
          { id: 'ext-sus2', label: currentExtensions.sus2 ? '✓ sus2' : 'sus2', action: () => handleExtensionToggle('sus2') },
          { id: 'ext-sus4', label: currentExtensions.sus4 ? '✓ sus4' : 'sus4', action: () => handleExtensionToggle('sus4') },
          { id: 'ext-divider', label: '', divider: true },
          { id: 'ext-add9', label: currentExtensions.add9 ? '✓ add9' : 'add9', action: () => handleExtensionToggle('add9') },
          { id: 'ext-add11', label: currentExtensions.add11 ? '✓ add11' : 'add11', action: () => handleExtensionToggle('add11') },
          { id: 'ext-add13', label: currentExtensions.add13 ? '✓ add13' : 'add13', action: () => handleExtensionToggle('add13') },
          { id: 'ext-divider2', label: '', divider: true },
          { id: 'ext-flat9', label: currentExtensions.flat9 ? '✓ ♭9' : '♭9', action: () => handleExtensionToggle('flat9') },
          { id: 'ext-sharp9', label: currentExtensions.sharp9 ? '✓ ♯9' : '♯9', action: () => handleExtensionToggle('sharp9') },
          { id: 'ext-sharp11', label: currentExtensions.sharp11 ? '✓ ♯11' : '♯11', action: () => handleExtensionToggle('sharp11') },
          { id: 'ext-flat13', label: currentExtensions.flat13 ? '✓ ♭13' : '♭13', action: () => handleExtensionToggle('flat13') },
        ],
      },
      // Clear extensions (only show if there are extensions)
      ...(hasExtensions ? [{
        id: 'clear-extensions',
        label: 'Clear Extensions',
        action: handleClearExtensions,
      }] : []),
      // Divider
      {
        id: 'divider-1',
        label: '',
        divider: true,
      },
      // Why This?
      {
        id: 'why-this',
        label: 'Why This?',
        action: () => {
          openWhyThisPanel(chord, previousChord, nextChord, sortedChords, songContext);
          setContextMenuOpen(false);
        },
      },
      // Delete
      {
        id: 'divider-2',
        label: '',
        divider: true,
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
  }, [chord, previousChord, nextChord, sortedChords, songContext, openWhyThisPanel, removeChord, hasExtensions, handleQualityChange, handleExtensionToggle, handleClearExtensions]);

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
  // Compare extensions objects
  const prevExt = prev.chord.extensions || {};
  const nextExt = next.chord.extensions || {};
  const extensionsEqual = JSON.stringify(prevExt) === JSON.stringify(nextExt);

  return (
    prev.chord.id === next.chord.id &&
    prev.chord.startBeat === next.chord.startBeat &&
    prev.chord.quality === next.chord.quality &&
    extensionsEqual &&
    prev.isSelected === next.isSelected &&
    prev.isPlaying === next.isPlaying &&
    prev.zoom === next.zoom &&
    prev.allChords.length === next.allChords.length
  );
}

export const DraggableChord = React.memo(DraggableChordComponent, areDraggableChordPropsEqual);
