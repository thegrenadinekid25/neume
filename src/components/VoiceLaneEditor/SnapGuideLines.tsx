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
    if (snapResolution === 0) return []; // Free mode = no lines

    const result: Array<{ x: number; isBeat: boolean; label?: string }> = [];
    const step = snapResolution;
    const scaledBeatWidth = beatWidth * zoom;

    for (let beat = 0; beat <= totalBeats; beat += step) {
      const x = beat * scaledBeatWidth;
      const isBeat = beat % 1 === 0; // Full beat marker

      // Add label only at full beats for cleaner display
      const label = isBeat ? `${Math.floor(beat) + 1}` : undefined;

      result.push({ x, isBeat, label });
    }

    return result;
  }, [snapResolution, beatWidth, zoom, totalBeats]);

  // Get the resolution label for display
  const resolutionLabel = RESOLUTION_LABELS[snapResolution] || '';

  return (
    <AnimatePresence>
      {isVisible && snapResolution !== 0 && (
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
              <g key={index}>
                <line
                  x1={line.x}
                  y1={0}
                  x2={line.x}
                  y2={laneHeight}
                  className={line.isBeat ? styles.beatLine : styles.subdivisionLine}
                />
                {line.label && (
                  <text
                    x={line.x + 4}
                    y={14}
                    className={styles.beatLabel}
                  >
                    {line.label}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
