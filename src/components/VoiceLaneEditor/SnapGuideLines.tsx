import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SnapResolution } from '@/types/voice-line';
import styles from './SnapGuideLines.module.css';

interface SnapGuideLinesProps {
  isVisible: boolean;
  snapResolution: SnapResolution;
  beatWidth: number;
  zoom: number;
  totalBeats: number;
  laneHeight: number;
}

// Labels for different snap resolutions
const RESOLUTION_LABELS: Record<number, string> = {
  1: '1',      // Full beat
  0.5: '½',    // Half beat
  0.25: '¼',   // Quarter beat (8th note)
  0.125: '⅛',  // 16th note
  0: '',       // Free (no lines)
};

/**
 * Visual guide lines showing snap positions during drag
 * Lines appear at intervals matching the current snap resolution
 */
export const SnapGuideLines: React.FC<SnapGuideLinesProps> = ({
  isVisible,
  snapResolution,
  beatWidth,
  zoom,
  totalBeats,
  laneHeight,
}) => {
  // Generate line positions based on snap resolution
  const lines = useMemo(() => {

    const result: Array<{ x: number; isBeat: boolean }> = [];
    const step = snapResolution;
    const scaledBeatWidth = beatWidth * zoom;

    for (let beat = 0; beat <= totalBeats; beat += step) {
      const x = beat * scaledBeatWidth;
      const isBeat = beat % 1 === 0; // Full beat marker

      result.push({ x, isBeat });
    }

    return result;
  }, [snapResolution, beatWidth, zoom, totalBeats]);

  // Get the resolution label for display
  const resolutionLabel = RESOLUTION_LABELS[snapResolution] || '';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={styles.container}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{ height: laneHeight }}
        >
          {/* Resolution indicator at top left */}
          <div className={styles.resolutionBadge}>
            Snap: {resolutionLabel}
          </div>

          {/* Guide lines */}
          <svg className={styles.svg} width="100%" height={laneHeight}>
            {lines.map((line, index) => (
              <line
                key={index}
                x1={line.x}
                y1={0}
                x2={line.x}
                y2={laneHeight}
                className={line.isBeat ? styles.beatLine : styles.subdivisionLine}
              />
            ))}
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
