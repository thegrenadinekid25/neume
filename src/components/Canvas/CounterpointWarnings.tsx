import React, { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCounterpointWarningsStore } from '@/store/counterpoint-warnings-store';
import type {
  CounterpointViolation,
  CounterpointSeverity,
} from '@/types/counterpoint';
import styles from './CounterpointWarnings.module.css';

interface CounterpointWarningsProps {
  zoom: number;
  canvasHeight: number;
  beatWidth: number;
}

interface WarningMarkerProps {
  violation: CounterpointViolation;
  x: number;
  y: number;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
  onDismiss: (id: string) => void;
}

const SEVERITY_COLORS: Record<CounterpointSeverity, string> = {
  error: 'var(--warm-terracotta, #E85D3D)',
  warning: 'var(--warm-gold, #E8A03E)',
  info: 'var(--warm-text-secondary, #7A7067)',
};

const SEVERITY_ICONS: Record<CounterpointSeverity, string> = {
  error: '!',
  warning: '!',
  info: 'i',
};

function formatViolationType(type: string): string {
  const typeLabels: Record<string, string> = {
    parallelFifths: 'Parallel Fifths',
    parallelOctaves: 'Parallel Octaves',
    hiddenFifths: 'Hidden Fifths',
    hiddenOctaves: 'Hidden Octaves',
    voiceCrossing: 'Voice Crossing',
    voiceOverlap: 'Voice Overlap',
    spacingViolation: 'Spacing Issue',
    rangeViolation: 'Range Issue',
  };
  return typeLabels[type] || type;
}

const WarningMarker: React.FC<WarningMarkerProps> = ({
  violation,
  x,
  y,
  isHovered,
  isSelected,
  onHover,
  onClick,
  onDismiss,
}) => {
  const color = SEVERITY_COLORS[violation.severity];
  const icon = SEVERITY_ICONS[violation.severity];

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick(violation.id);
    },
    [onClick, violation.id]
  );

  const handleDismiss = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDismiss(violation.id);
    },
    [onDismiss, violation.id]
  );

  return (
    <motion.g
      className={styles.warningMarker}
      onMouseEnter={() => onHover(violation.id)}
      onMouseLeave={() => onHover(null)}
      onClick={handleClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Glow effect for hovered/selected state */}
      {(isHovered || isSelected) && (
        <motion.circle
          cx={x}
          cy={y}
          r={16}
          fill="none"
          stroke={color}
          strokeWidth={2}
          opacity={0.3}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0.3 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Warning indicator circle */}
      <motion.circle
        cx={x}
        cy={y}
        r={12}
        fill={color}
        className={styles.markerCircle}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.15 }}
      />

      {/* Icon text */}
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        className={styles.markerIcon}
        fill="var(--warm-cream, #FAF8F5)"
        fontSize="12"
        fontWeight="bold"
      >
        {icon}
      </text>

      {/* Tooltip on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.foreignObject
            x={x + 16}
            y={y - 60}
            width={280}
            height={140}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'visible' }}
          >
            <div className={styles.tooltip}>
              <div className={styles.tooltipHeader}>
                <span
                  className={styles.severityBadge}
                  style={{ backgroundColor: color }}
                >
                  {violation.severity}
                </span>
                <span className={styles.violationType}>
                  {formatViolationType(violation.type)}
                </span>
              </div>

              <p className={styles.tooltipDescription}>
                {violation.description}
              </p>

              {violation.suggestion && (
                <div className={styles.tooltipSuggestion}>
                  <span className={styles.suggestionLabel}>Suggestion:</span>
                  <span className={styles.suggestionText}>
                    {violation.suggestion}
                  </span>
                </div>
              )}

              <div className={styles.tooltipActions}>
                <button className={styles.dismissButton} onClick={handleDismiss}>
                  Dismiss
                </button>
              </div>
            </div>
          </motion.foreignObject>
        )}
      </AnimatePresence>
    </motion.g>
  );
};

export const CounterpointWarnings: React.FC<CounterpointWarningsProps> = ({
  zoom,
  canvasHeight,
  beatWidth,
}) => {
  const {
    isOverlayVisible,
    hoveredViolationId,
    selectedViolationId,
    getVisibleViolations,
    hoverViolation,
    selectViolation,
    dismissViolation,
  } = useCounterpointWarningsStore();

  const visibleViolations = getVisibleViolations();

  // Group violations by beat for positioning
  const violationsByBeat = useMemo(() => {
    const grouped = new Map<number, CounterpointViolation[]>();
    visibleViolations.forEach((v) => {
      const beat = v.location.beat;
      if (!grouped.has(beat)) {
        grouped.set(beat, []);
      }
      grouped.get(beat)!.push(v);
    });
    return grouped;
  }, [visibleViolations]);

  const scaledBeatWidth = beatWidth * zoom;

  if (!isOverlayVisible || visibleViolations.length === 0) {
    return null;
  }

  return (
    <svg className={styles.overlay} width="100%" height={canvasHeight}>
      <AnimatePresence>
        {Array.from(violationsByBeat.entries()).map(([beat, violations]) => {
          const x = beat * scaledBeatWidth + scaledBeatWidth / 2;

          // Stack multiple violations at the same beat
          return violations.map((violation, index) => {
            const y = 20 + index * 28;

            return (
              <WarningMarker
                key={violation.id}
                violation={violation}
                x={x}
                y={y}
                isHovered={hoveredViolationId === violation.id}
                isSelected={selectedViolationId === violation.id}
                onHover={hoverViolation}
                onClick={selectViolation}
                onDismiss={dismissViolation}
              />
            );
          });
        })}
      </AnimatePresence>
    </svg>
  );
};
