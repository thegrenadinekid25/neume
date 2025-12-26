import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ChordShape } from './ChordShape';
import { Chord } from '@types';

interface DraggableChordProps {
  chord: Chord;
  isSelected?: boolean;
  isPlaying?: boolean;
  onSelect?: (e?: React.MouseEvent) => void;
  zoom?: number;
  beatWidth: number;
}

export const DraggableChord: React.FC<DraggableChordProps> = ({
  chord,
  isSelected,
  isPlaying,
  onSelect,
  zoom = 1.0,
}) => {
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

  const style: React.CSSProperties = {
    position: 'absolute',
    left: chord.position.x,
    top: chord.position.y,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 1000 : 10,
    transition: transform ? 'none' : 'transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
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
  );
};
