import React from 'react';
import { motion } from 'framer-motion';
import styles from './MelismaConnector.module.css';

interface MelismaConnectorProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
}

export const MelismaConnector = React.memo(function MelismaConnector({
  startX,
  startY,
  endX,
  endY,
  color,
}: MelismaConnectorProps) {
  // Calculate control point for quadratic bezier curve (curves below the notes)
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2 + 15;

  // SVG path using quadratic bezier curve
  const pathData = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;

  return (
    <motion.path
      className={styles.connector}
      d={pathData}
      stroke={color}
      strokeWidth="2"
      strokeOpacity="0.4"
      strokeLinecap="round"
      fill="none"
      pointerEvents="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
});

MelismaConnector.displayName = 'MelismaConnector';
