import React from 'react';
import styles from './StaffGuides.module.css';

interface Props {
  laneHeight: number;
  width: number;
  visible: boolean;
}

export const StaffGuides: React.FC<Props> = ({ laneHeight, width, visible }) => {
  const linePositions = [0.1, 0.3, 0.5, 0.7, 0.9].map(p => p * laneHeight);

  return (
    <svg className={`${styles.guides} ${visible ? styles.visible : ''}`} width={width} height={laneHeight}>
      {linePositions.map((y, i) => (
        <line key={i} x1={0} y1={y} x2={width} y2={y} />
      ))}
    </svg>
  );
};
