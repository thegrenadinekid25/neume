import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Chord } from '@/types';
import type { VoicePart } from '@/types/necklace';
import { generateNecklacePoints, generateSmoothPath } from '@/utils/midi-helpers';
import { CANVAS_CONFIG, DEFAULT_CHORD_SIZE } from '@/utils/constants';
import styles from './MelodicNecklace.module.css';

interface MelodicNecklaceProps {
  chords: Chord[];
  voice: VoicePart;
  color: string;
  opacity: number;
  containerHeight: number;
  zoom: number;
  showDots: boolean;
  showLines: boolean;
  dotSize: number;
  lineWidth: number;
  animate: boolean;
}

export function MelodicNecklace({
  chords,
  voice,
  color,
  opacity,
  containerHeight,
  zoom,
  showDots,
  showLines,
  dotSize,
  lineWidth,
  animate,
}: MelodicNecklaceProps) {
  // Generate points for this voice
  const points = useMemo(() => {
    return generateNecklacePoints(
      chords,
      voice,
      containerHeight,
      CANVAS_CONFIG.GRID_BEAT_WIDTH,
      zoom,
      DEFAULT_CHORD_SIZE * zoom
    );
  }, [chords, voice, containerHeight, zoom]);

  // Generate SVG path
  const pathData = useMemo(() => {
    return generateSmoothPath(points);
  }, [points]);

  if (points.length === 0) return null;

  return (
    <svg className={styles.necklace} style={{ opacity }}>
      {/* Voice line */}
      {showLines && pathData && (
        <motion.path
          d={pathData}
          className={styles.voicePath}
          stroke={color}
          strokeWidth={lineWidth}
          fill="none"
          initial={animate ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 1.2, ease: 'easeInOut' },
            opacity: { duration: 0.3 },
          }}
        />
      )}

      {/* Voice dots */}
      {showDots &&
        points.map((point, index) => (
          <motion.circle
            key={point.chordId}
            cx={point.x}
            cy={point.y}
            r={dotSize}
            fill={color}
            className={styles.voiceDot}
            initial={animate ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: animate ? index * 0.08 : 0,
              duration: 0.25,
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
          />
        ))}
    </svg>
  );
}
