import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SnapResolution } from '@/types/voice-line';
import styles from './SnapIndicator.module.css';

interface SnapIndicatorProps {
  snapResolution: SnapResolution;
  refinementLevel: number;
  isVisible: boolean;
  position?: { x: number; y: number };
}

const SNAP_LABELS: Record<SnapResolution, string> = {
  1: 'Beat',
  0.5: '½',
  0.25: '¼',
  0.125: '16th',
  0: 'Free',
};

/**
 * Visual indicator showing current snap resolution
 * Appears near cursor during drag operations
 */
export const SnapIndicator: React.FC<SnapIndicatorProps> = ({
  snapResolution,
  refinementLevel,
  isVisible,
  position,
}) => {
  const label = SNAP_LABELS[snapResolution] || 'Beat';

  // Calculate progress to next refinement (for visual feedback)
  const maxLevel = 4;
  const progress = refinementLevel / maxLevel;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={styles.indicator}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          style={position ? {
            position: 'fixed',
            left: position.x + 20,
            top: position.y - 10,
          } : undefined}
        >
          <span className={styles.label}>{label}</span>
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className={styles.dots}>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`${styles.dot} ${level <= refinementLevel ? styles.active : ''}`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
