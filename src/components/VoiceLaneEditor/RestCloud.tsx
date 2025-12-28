import React from 'react';
import styles from './RestCloud.module.css';

interface Props {
  x: number;
  color: string;
  laneHeight: number;
}

export const RestCloud: React.FC<Props> = ({ x, color, laneHeight }) => (
  <div
    className={styles.restCloud}
    style={{
      left: x,
      top: laneHeight / 2,
      backgroundColor: color,
    }}
  />
);
