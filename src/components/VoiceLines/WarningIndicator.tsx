import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CounterpointSeverity } from '@/types/counterpoint';
import styles from './WarningIndicator.module.css';

interface WarningIndicatorProps {
  severity: CounterpointSeverity;
  count: number;
  isHovered: boolean;
}

const SEVERITY_COLORS: Record<CounterpointSeverity, string> = {
  error: 'var(--warm-terracotta, #E85D3D)',
  warning: 'var(--warm-gold, #E8A03E)',
  info: 'var(--warm-text-secondary, #7A7067)',
};

export const WarningIndicator: React.FC<WarningIndicatorProps> = ({
  severity,
  count,
  isHovered,
}) => {
  const color = SEVERITY_COLORS[severity];

  return (
    <AnimatePresence>
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.15 }}
      >
        {/* Warning ring around the note */}
        <motion.circle
          cx={0}
          cy={0}
          r={12}
          className={`${styles.warningRing} ${styles[severity]}`}
          animate={isHovered ? { scale: 1.2 } : { scale: 1 }}
          transition={{ duration: 0.15 }}
        />

        {/* Badge showing count if > 1 */}
        {count > 1 && (
          <motion.g
            className={styles.badge}
            transform="translate(10, -10)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15, delay: 0.1 }}
          >
            <circle
              cx={0}
              cy={0}
              r={8}
              fill={color}
              className={styles.badgeCircle}
            />
            <text
              x={0}
              y={3}
              textAnchor="middle"
              fill="var(--warm-cream, #FAF8F5)"
              fontSize="10"
              fontWeight="bold"
              className={styles.badgeText}
            >
              {count}
            </text>
          </motion.g>
        )}
      </motion.g>
    </AnimatePresence>
  );
};
