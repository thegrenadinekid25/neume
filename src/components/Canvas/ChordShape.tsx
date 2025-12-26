import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Chord } from '@types';
import { getScaleDegreeColor, CHROMATIC_INDICATORS, ANIMATION_COLORS } from '@/styles/colors';
import { Tooltip } from '@/components/UI/Tooltip';
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

export const ChordShape: React.FC<ChordShapeProps> = React.memo(({
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

  // Get shape path based on scale degree
  const shapePath = useMemo(() => {
    return generateShapePath(chord.scaleDegree, size);
  }, [chord.scaleDegree, size]);

  // Determine stroke color and width
  const strokeColor = isSelected ? ANIMATION_COLORS.selectionStroke : 'none';
  const strokeWidth = isSelected ? 3.5 : 2.5;

  // Animation variants
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
    dragging: {
      scale: 1.15,
      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))',
    },
    playing: {
      scale: [1.0, 1.12, 1.0],
      filter: [
        'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        'drop-shadow(0 6px 12px rgba(74,144,226,0.4))',
        'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
      ],
    },
  };

  // Determine current state
  const currentState = isDragging
    ? 'dragging'
    : isPlaying
    ? 'playing'
    : isSelected
    ? 'selected'
    : 'default';

  return (
    <Tooltip content="Drag to move • Alt+Drag to connect" delay={500}>
      <motion.div
        className={styles.chordShapeContainer}
        initial="default"
        animate={currentState}
        whileHover={isDragging ? undefined : "hover"}
        variants={variants}
        transition={{
          duration: isPlaying ? chord.duration : 0.3,
          ease: isPlaying ? [0.45, 0.05, 0.55, 0.95] : [0.4, 0.0, 0.2, 1],
          repeat: isPlaying ? Infinity : 0,
        }}
        onClick={onSelect}
        onMouseEnter={onHover}
        role="button"
        aria-label={`${chord.quality} chord on scale degree ${chord.scaleDegree}`}
        tabIndex={0}
      >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Chromatic shimmer (if applicable) */}
        {chord.isChromatic && (
          <defs>
            <linearGradient id={`shimmer-${chord.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={CHROMATIC_INDICATORS.shimmerGradientStart} stopOpacity={CHROMATIC_INDICATORS.shimmerOpacity} />
              <stop offset="100%" stopColor={CHROMATIC_INDICATORS.shimmerGradientEnd} stopOpacity={CHROMATIC_INDICATORS.shimmerOpacity} />
            </linearGradient>
          </defs>
        )}

        {/* Main shape */}
        <path
          d={shapePath}
          fill={baseColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          className={styles.chordShape}
        />

        {/* Chromatic overlay */}
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
              filter={`blur(${CHROMATIC_INDICATORS.glowBlur}px)`}
            />
          </>
        )}
      </svg>

      {/* Extension badges */}
      {hasExtensions(chord.extensions) && (
        <div className={styles.badge}>
          {getBadgeText(chord.extensions)}
        </div>
      )}
      </motion.div>
    </Tooltip>
  );
});

ChordShape.displayName = 'ChordShape';

/**
 * Generate SVG path for each shape type with hand-drawn wobble
 */
function generateShapePath(scaleDegree: number, size: number): string {
  const center = size / 2;
  const radius = (size - 10) / 2; // Leave 5px margin

  switch (scaleDegree) {
    case 1: // I - Solid circle (Tonic)
      return generateWobblyCircle(center, center, radius);

    case 2: // ii - Rounded square (Supertonic, Subdominant function)
      return generateRoundedSquare(center, radius);

    case 3: // iii - Triangle (Mediant)
      return generateTriangle(center, radius);

    case 4: // IV - Solid square (Subdominant)
      return generateSquare(center, radius);

    case 5: // V - Pentagon (Dominant)
      return generatePentagon(center, radius);

    case 6: // vi - Dotted circle (Submediant, relative minor)
      return generateWobblyCircle(center, center, radius);

    case 7: // vii° - Outlined pentagon (Leading tone)
      return generatePentagon(center, radius);

    default:
      return generateWobblyCircle(center, center, radius);
  }
}

/**
 * Generate wobbly circle path
 */
function generateWobblyCircle(cx: number, cy: number, r: number): string {
  const points = 32; // More points = smoother circle
  const wobbleAmount = 0.5;

  let path = '';
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const wobbledR = r + (Math.random() - 0.5) * wobbleAmount;
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

/**
 * Generate square with wobble
 */
function generateSquare(center: number, radius: number): string {
  const wobble = 1.5;
  const half = radius * 0.8;

  const points = [
    [center - half + (Math.random() - 0.5) * wobble, center - half + (Math.random() - 0.5) * wobble],
    [center + half + (Math.random() - 0.5) * wobble, center - half + (Math.random() - 0.5) * wobble],
    [center + half + (Math.random() - 0.5) * wobble, center + half + (Math.random() - 0.5) * wobble],
    [center - half + (Math.random() - 0.5) * wobble, center + half + (Math.random() - 0.5) * wobble],
  ];

  return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]} L ${points[2][0]} ${points[2][1]} L ${points[3][0]} ${points[3][1]} Z`;
}

/**
 * Generate rounded square
 */
function generateRoundedSquare(center: number, radius: number): string {
  const half = radius * 0.8;
  const cornerRadius = 8;
  const wobble = 1.5;

  const w = (Math.random() - 0.5) * wobble;

  // Use SVG arc commands for rounded corners
  return `
    M ${center - half + cornerRadius + w} ${center - half + w}
    L ${center + half - cornerRadius + w} ${center - half + w}
    Q ${center + half + w} ${center - half + w} ${center + half + w} ${center - half + cornerRadius + w}
    L ${center + half + w} ${center + half - cornerRadius + w}
    Q ${center + half + w} ${center + half + w} ${center + half - cornerRadius + w} ${center + half + w}
    L ${center - half + cornerRadius + w} ${center + half + w}
    Q ${center - half + w} ${center + half + w} ${center - half + w} ${center + half - cornerRadius + w}
    L ${center - half + w} ${center - half + cornerRadius + w}
    Q ${center - half + w} ${center - half + w} ${center - half + cornerRadius + w} ${center - half + w}
    Z
  `;
}

/**
 * Generate triangle
 */
function generateTriangle(center: number, radius: number): string {
  const wobble = 1.5;
  const height = radius * 1.5;

  const points = [
    [center + (Math.random() - 0.5) * wobble, center - height * 0.6],
    [center + radius * 0.9 + (Math.random() - 0.5) * wobble, center + height * 0.4],
    [center - radius * 0.9 + (Math.random() - 0.5) * wobble, center + height * 0.4],
  ];

  return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]} L ${points[2][0]} ${points[2][1]} Z`;
}

/**
 * Generate pentagon (pointing right for forward motion)
 */
function generatePentagon(center: number, radius: number): string {
  const wobble = 1.5;
  const points = [];

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * 2 * Math.PI - Math.PI / 2; // Start at top
    const x = center + Math.cos(angle) * radius + (Math.random() - 0.5) * wobble;
    const y = center + Math.sin(angle) * radius + (Math.random() - 0.5) * wobble;
    points.push([x, y]);
  }

  return `M ${points[0][0]} ${points[0][1]} ${points.map(p => `L ${p[0]} ${p[1]}`).join(' ')} Z`;
}

/**
 * Check if chord has any extensions
 */
function hasExtensions(extensions: Chord['extensions']): boolean {
  return Object.values(extensions).some(val => val === true);
}

/**
 * Get badge text for extensions
 */
function getBadgeText(extensions: Chord['extensions']): string {
  if (extensions.add9) return '+9';
  if (extensions.add11) return '+11';
  if (extensions.add13) return '+13';
  if (extensions.sus2) return 'sus2';
  if (extensions.sus4) return 'sus4';
  if (extensions.sharp11) return '#11';
  if (extensions.flat9) return '♭9';
  if (extensions.sharp9) return '#9';
  return '7';
}
