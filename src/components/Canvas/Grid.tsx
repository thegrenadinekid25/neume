import React from 'react';
import styles from './Grid.module.css';

interface GridProps {
  width: number;
  height: number;
  beatWidth: number;
  beatsPerMeasure: number;
}

export const Grid: React.FC<GridProps> = ({
  width,
  height,
  beatWidth,
  beatsPerMeasure,
}) => {
  const beats = Math.ceil(width / beatWidth);
  const beatLines: React.ReactNode[] = [];

  for (let i = 0; i <= beats; i++) {
    const isMeasureLine = i % beatsPerMeasure === 0;
    const x = i * beatWidth;

    beatLines.push(
      <line
        key={`beat-${i}`}
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        className={isMeasureLine ? styles.measureLine : styles.beatLine}
        strokeDasharray={isMeasureLine ? 'none' : '2,2'}
      />
    );
  }

  return (
    <svg
      className={styles.grid}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      {beatLines}
    </svg>
  );
};
