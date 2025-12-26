import React from 'react';
import { motion } from 'framer-motion';
import styles from './SelectionBox.module.css';

interface SelectionBoxProps {
  start: { x: number; y: number };
  current: { x: number; y: number };
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({ start, current }) => {
  const x = Math.min(start.x, current.x);
  const y = Math.min(start.y, current.y);
  const width = Math.abs(current.x - start.x);
  const height = Math.abs(current.y - start.y);

  return (
    <motion.div
      className={styles.selectionBox}
      style={{
        left: x,
        top: y,
        width,
        height,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
    />
  );
};
