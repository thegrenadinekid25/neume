import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './ConnectionLine.module.css';

interface ConnectionLineProps {
  from: { x: number; y: number; size: number };
  to: { x: number; y: number; size: number };
  isHovered?: boolean;
  isPlaying?: boolean;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  from,
  to,
  isHovered = false,
  isPlaying = false,
}) => {
  // Calculate path
  const path = useMemo(() => {
    return generateConnectionPath(from, to);
  }, [from, to]);

  const strokeColor = isPlaying ? '#4A90E2' : '#7F8C8D';
  const opacity = isHovered ? 0.9 : 0.6;

  return (
    <motion.path
      d={path}
      className={styles.connectionLine}
      stroke={strokeColor}
      strokeWidth={2}
      fill="none"
      opacity={opacity}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
    />
  );
};

/**
 * Generate Bézier curve path with hand-drawn wobble
 */
function generateConnectionPath(
  from: { x: number; y: number; size: number },
  to: { x: number; y: number; size: number }
): string {
  // Start point: right edge of source chord, centered vertically
  const startX = from.x + from.size;
  const startY = from.y + from.size / 2;

  // End point: left edge of target chord, centered vertically
  const endX = to.x;
  const endY = to.y + to.size / 2;

  // Control points for S-curve
  const distance = endX - startX;
  const controlPoint1X = startX + distance * 0.4;
  const controlPoint1Y = startY;

  const controlPoint2X = startX + distance * 0.6;
  const controlPoint2Y = endY;

  // Add slight wobble for hand-drawn feel
  const wobble = () => (Math.random() - 0.5) * 2;

  const cp1X = controlPoint1X + wobble();
  const cp1Y = controlPoint1Y + wobble();
  const cp2X = controlPoint2X + wobble();
  const cp2Y = controlPoint2Y + wobble();

  // Cubic Bézier path
  return `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
}
