import React from 'react';
import styles from './TimelineRuler.module.css';

interface TimelineRulerProps {
  totalBeats: number;
  zoom: number;
  beatWidth: number;
}

export const TimelineRuler: React.FC<TimelineRulerProps> = ({
  totalBeats,
  zoom,
  beatWidth,
}) => {
  const measures = Math.ceil(totalBeats / 4); // Assuming 4/4 time
  const measureMarkers: React.ReactNode[] = [];

  for (let i = 1; i <= measures; i++) {
    const x = (i - 1) * 4 * beatWidth * zoom;
    measureMarkers.push(
      <div
        key={`measure-${i}`}
        className={styles.measureMarker}
        style={{ left: `${x}px` }}
      >
        {i}
      </div>
    );
  }

  return (
    <div className={styles.timelineRuler}>
      {measureMarkers}
    </div>
  );
};
