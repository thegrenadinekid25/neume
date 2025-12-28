import React, { useMemo } from 'react';
import type { MelodicNote } from '@/types';

interface ThreadConnectorProps {
  notes: MelodicNote[];
  getX: (beat: number) => number;
  getY: (midi: number) => number;
  color: string;
  svgWidth: number;
  svgHeight: number;
}

export const ThreadConnector: React.FC<ThreadConnectorProps> = ({
  notes,
  getX,
  getY,
  color,
  svgWidth,
  svgHeight,
}) => {
  const pathData = useMemo(() => {
    // Filter out rests and sort by startBeat
    const validNotes = notes
      .filter((note) => note.pitch && note.midi !== 0 && !note.isRest)
      .sort((a, b) => a.startBeat - b.startBeat);

    if (validNotes.length < 2) return '';

    // Build a single continuous path through all notes
    const pathParts: string[] = [];

    // Start at the first note
    const firstNote = validNotes[0];
    const firstX = getX(firstNote.startBeat);
    const firstY = getY(firstNote.midi);
    pathParts.push(`M ${firstX} ${firstY}`);

    // Connect to each subsequent note with a smooth curve
    for (let i = 1; i < validNotes.length; i++) {
      const toNote = validNotes[i];
      const toX = getX(toNote.startBeat);
      const toY = getY(toNote.midi);

      // Use a simple line for now - cleaner than bezier curves
      pathParts.push(`L ${toX} ${toY}`);
    }

    return pathParts.join(' ');
  }, [notes, getX, getY]);

  if (!pathData) return null;

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <path
        d={pathData}
        stroke={color}
        strokeWidth={2}
        fill="none"
        opacity={0.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
