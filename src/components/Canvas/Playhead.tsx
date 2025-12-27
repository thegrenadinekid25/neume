import React from 'react';
import styles from './Playhead.module.css';

interface PlayheadProps {
  position: number;
}

export const Playhead: React.FC<PlayheadProps> = ({ position }) => {
  return (
    <div
      className={styles.playhead}
      style={{ left: `${position}px` }}
    />
  );
};
