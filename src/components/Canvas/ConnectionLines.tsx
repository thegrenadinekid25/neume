import React, { useMemo } from 'react';
import { ConnectionLine } from './ConnectionLine';
import { Chord } from '@types';

interface ConnectionLinesProps {
  chords: Chord[];
  isPlaying?: boolean;
  playheadPosition?: number;
  zoom?: number;
}

export const ConnectionLines: React.FC<ConnectionLinesProps> = ({
  chords,
  isPlaying = false,
  playheadPosition = 0,
  zoom = 1.0,
}) => {
  // Sort chords by timeline position
  const sortedChords = useMemo(() => {
    return [...chords].sort((a, b) => a.startBeat - b.startBeat);
  }, [chords]);

  // Generate connection pairs
  const connections = useMemo(() => {
    const pairs: Array<{ from: Chord; to: Chord }> = [];

    for (let i = 0; i < sortedChords.length - 1; i++) {
      pairs.push({
        from: sortedChords[i],
        to: sortedChords[i + 1],
      });
    }

    return pairs;
  }, [sortedChords]);

  if (connections.length === 0) return null;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {connections.map(({ from, to }) => {
        const isLinePlaying = isPlaying &&
          playheadPosition >= from.startBeat &&
          playheadPosition < to.startBeat + to.duration;

        return (
          <ConnectionLine
            key={`${from.id}-${to.id}`}
            from={{
              x: from.position.x,
              y: from.position.y,
              size: from.size * zoom,
            }}
            to={{
              x: to.position.x,
              y: to.position.y,
              size: to.size * zoom,
            }}
            isPlaying={isLinePlaying}
          />
        );
      })}
    </svg>
  );
};
