import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Chord } from '@/types';
import { getScaleDegreeColor, CHROMATIC_INDICATORS, UI_COLORS } from '@/styles/colors';
import { getChordBadgeText, hasChordModifications } from '@/utils/chord-helpers';
import styles from './ChordShape.module.css';

interface ChordShapeProps {
  chord: Chord;
  isSelected?: boolean;
  isPlaying?: boolean;
  isDragging?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  zoom?: number;
}

// Wobble configuration for organic feel
const WOBBLE_CONFIG = {
  rotation: 1.5,   // ±1.5° rotation
  scale: 0.02,     // ±2% scale
} as const;

// Custom comparison function for React.memo
function areChordShapePropsEqual(prev: ChordShapeProps, next: ChordShapeProps): boolean {
  return (
    prev.chord.id === next.chord.id &&
    prev.chord.scaleDegree === next.chord.scaleDegree &&
    prev.chord.size === next.chord.size &&
    prev.chord.quality === next.chord.quality &&
    prev.chord.extensions === next.chord.extensions &&
    prev.chord.isChromatic === next.chord.isChromatic &&
    prev.isSelected === next.isSelected &&
    prev.isPlaying === next.isPlaying &&
    prev.isDragging === next.isDragging &&
    prev.zoom === next.zoom
  );
}

const ChordShapeComponent: React.FC<ChordShapeProps> = ({
  chord,
  isSelected = false,
  isPlaying = false,
  isDragging = false,
  onSelect,
  onHover,
  zoom = 1.0,
}) => {
  const size = chord.size * zoom;
  const baseColor = getScaleDegreeColor(chord.scaleDegree, chord.mode);

  const shapePath = useMemo(() => {
    return generateShapePath(chord.scaleDegree, size);
  }, [chord.scaleDegree, size]);

  // Generate stable organic transform based on chord ID
  const organicTransform = useMemo(() => {
    // Use chord ID to seed randomness so same chord always has same wobble
    const seed = chord.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const seededRandom = (index: number) => {
      const x = Math.sin(seed + index) * 10000;
      return x - Math.floor(x);
    };

    const rotation = (seededRandom(1) - 0.5) * WOBBLE_CONFIG.rotation;
    const scale = 1 + (seededRandom(2) - 0.5) * WOBBLE_CONFIG.scale;

    return `rotate(${rotation}deg) scale(${scale})`;
  }, [chord.id]);

  // vi (6) = dotted circle, vii° (7) = outlined pentagon
  const isOutlinedShape = chord.scaleDegree === 6 || chord.scaleDegree === 7;
  const isDottedShape = chord.scaleDegree === 6;

  // For outlined shapes: stroke with the color, no fill (or light fill)
  // For filled shapes: fill with color, stroke only when selected
  const fillColor = isOutlinedShape ? 'rgba(255,255,255,0.9)' : baseColor;
  const defaultStrokeColor = isOutlinedShape ? baseColor : 'none';
  const strokeColor = isSelected ? UI_COLORS.primaryAction : defaultStrokeColor;
  const strokeWidth = isOutlinedShape ? 2.5 : (isSelected ? 3.5 : 2.5);
  const strokeDasharray = isDottedShape ? '4,4' : 'none';

  const variants = {
    default: {
      scale: 1.0,
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
    },
    hover: {
      scale: 1.05,
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
    },
    selected: {
      scale: 1.03,
      filter: 'drop-shadow(0 4px 8px rgba(74,144,226,0.3))',
    },
    playing: {
      scale: [1.0, 1.12, 1.0],
      filter: [
        'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        'drop-shadow(0 6px 12px rgba(74,144,226,0.4))',
        'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
      ],
    },
    dragging: {
      scale: 1.15,
      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))',
    },
  };

  const currentState = isDragging
    ? 'dragging'
    : isPlaying
    ? 'playing'
    : isSelected
    ? 'selected'
    : 'default';

  return (
    <motion.div
      className={styles.chordShapeContainer}
      initial="default"
      animate={currentState}
      whileHover="hover"
      variants={variants}
      transition={{
        duration: isPlaying ? 0.6 : 0.3,
        ease: isPlaying ? [0.45, 0.05, 0.55, 0.95] : [0.4, 0.0, 0.2, 1],
        repeat: isPlaying ? Infinity : 0,
      }}
      onClick={onSelect}
      onMouseEnter={onHover}
      role="button"
      aria-label={`${chord.quality} chord on scale degree ${chord.scaleDegree}`}
      tabIndex={0}
      style={{ transform: organicTransform }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {chord.isChromatic && (
          <defs>
            <linearGradient id={`shimmer-${chord.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={CHROMATIC_INDICATORS.shimmerGradientStart} stopOpacity={CHROMATIC_INDICATORS.shimmerOpacity} />
              <stop offset="100%" stopColor={CHROMATIC_INDICATORS.shimmerGradientEnd} stopOpacity={CHROMATIC_INDICATORS.shimmerOpacity} />
            </linearGradient>
          </defs>
        )}

        <path
          d={shapePath}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          className={styles.chordShape}
        />

        {chord.isChromatic && (
          <>
            <path
              d={shapePath}
              fill={`url(#shimmer-${chord.id})`}
              className={styles.chromaticShimmer}
            />
            <path
              d={shapePath}
              fill="none"
              stroke={CHROMATIC_INDICATORS.edgeGlow}
              strokeWidth={1}
              opacity={CHROMATIC_INDICATORS.glowOpacity}
            />
          </>
        )}
      </svg>

      {hasChordModifications(chord.quality, chord.extensions) && (() => {
        const badgeText = getChordBadgeText(chord.quality, chord.extensions);
        if (!badgeText) return null;

        const badgeColor = getScaleDegreeColor(chord.scaleDegree, chord.mode);
        const borderColor = `rgba(${hexToRgb(badgeColor)}, 0.4)`;

        return (
          <motion.div
            className={styles.badge}
            style={{ borderColor }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {badgeText}
          </motion.div>
        );
      })()}
    </motion.div>
  );
};

ChordShapeComponent.displayName = 'ChordShape';

// Export memoized version with custom comparison function
export const ChordShape = React.memo(ChordShapeComponent, areChordShapePropsEqual);

function generateShapePath(scaleDegree: number, size: number): string {
  const center = size / 2;
  const radius = (size - 10) / 2;

  switch (scaleDegree) {
    case 1:
    case 6:
      return generateWobblyCircle(center, center, radius);
    case 2:
      return generateRoundedSquare(center, radius);
    case 3:
      return generateTriangle(center, radius);
    case 4:
      return generateSquare(center, radius);
    case 5:
    case 7:
      return generatePentagon(center, radius);
    default:
      return generateWobblyCircle(center, center, radius);
  }
}

function generateWobblyCircle(cx: number, cy: number, r: number): string {
  const points = 32;
  const wobbleAmount = 0.5;

  let path = '';
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const wobbledR = r + (Math.sin(i * 5) * wobbleAmount);
    const x = cx + Math.cos(angle) * wobbledR;
    const y = cy + Math.sin(angle) * wobbledR;

    if (i === 0) {
      path += `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  }

  return path + ' Z';
}

function generateSquare(center: number, radius: number): string {
  const wobble = 1.5;
  const half = radius * 0.8;
  const w = Math.sin(Date.now() / 1000) * wobble * 0.1;

  return `M ${center - half + w} ${center - half - w} L ${center + half - w} ${center - half + w} L ${center + half + w} ${center + half - w} L ${center - half - w} ${center + half + w} Z`;
}

function generateRoundedSquare(center: number, radius: number): string {
  const half = radius * 0.8;
  const cornerRadius = 8;

  return `
    M ${center - half + cornerRadius} ${center - half}
    L ${center + half - cornerRadius} ${center - half}
    Q ${center + half} ${center - half} ${center + half} ${center - half + cornerRadius}
    L ${center + half} ${center + half - cornerRadius}
    Q ${center + half} ${center + half} ${center + half - cornerRadius} ${center + half}
    L ${center - half + cornerRadius} ${center + half}
    Q ${center - half} ${center + half} ${center - half} ${center + half - cornerRadius}
    L ${center - half} ${center - half + cornerRadius}
    Q ${center - half} ${center - half} ${center - half + cornerRadius} ${center - half}
    Z
  `;
}

function generateTriangle(center: number, radius: number): string {
  const height = radius * 1.5;

  return `M ${center} ${center - height * 0.6} L ${center + radius * 0.9} ${center + height * 0.4} L ${center - radius * 0.9} ${center + height * 0.4} Z`;
}

function generatePentagon(center: number, radius: number): string {
  const points = [];

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * 2 * Math.PI - Math.PI / 2;
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    points.push([x, y]);
  }

  return `M ${points[0][0]} ${points[0][1]} ${points.slice(1).map(p => `L ${p[0]} ${p[1]}`).join(' ')} Z`;
}

function hexToRgb(hex: string): string {
  // Handle formats like #RRGGBB or rgb(r, g, b)
  if (hex.startsWith('rgb')) {
    return hex.replace(/[^\d,]/g, '');
  }

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return '0, 0, 0'; // Fallback
  }

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `${r}, ${g}, ${b}`;
}
