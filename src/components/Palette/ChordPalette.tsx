import React, { useState, useMemo } from 'react';
import { useDraggable, useDndMonitor } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { getScaleDegreeColor } from '@/styles/colors';
import type { ScaleDegree, Mode } from '@/types';
import styles from './ChordPalette.module.css';

interface ChordPaletteProps {
  mode: Mode;
  onAddChord: (scaleDegree: ScaleDegree) => void;
  onBuildFromBones?: () => void;
  hasChords?: boolean;
}

// Scale degree info for the palette
const SCALE_DEGREES: Array<{
  degree: ScaleDegree;
  majorName: string;
  minorName: string;
  majorNumeral: string;
  minorNumeral: string;
}> = [
  { degree: 1, majorName: 'Tonic', minorName: 'Tonic', majorNumeral: 'I', minorNumeral: 'i' },
  { degree: 2, majorName: 'Supertonic', minorName: 'Supertonic', majorNumeral: 'ii', minorNumeral: 'ii°' },
  { degree: 3, majorName: 'Mediant', minorName: 'Mediant', majorNumeral: 'iii', minorNumeral: 'III' },
  { degree: 4, majorName: 'Subdominant', minorName: 'Subdominant', majorNumeral: 'IV', minorNumeral: 'iv' },
  { degree: 5, majorName: 'Dominant', minorName: 'Dominant', majorNumeral: 'V', minorNumeral: 'V' },
  { degree: 6, majorName: 'Submediant', minorName: 'Submediant', majorNumeral: 'vi', minorNumeral: 'VI' },
  { degree: 7, majorName: 'Leading Tone', minorName: 'Subtonic', majorNumeral: 'vii°', minorNumeral: 'VII' },
];

/**
 * Hover-expand chord palette for adding chords to the canvas
 * Shows at bottom center, expands on hover to reveal all 7 scale degrees
 * Click on a chord to add it at the next available position
 * Drag a chord to place it at a specific position on the canvas
 * When chords exist, displays a "Build From Bones" button for deconstruction analysis
 */
export const ChordPalette: React.FC<ChordPaletteProps> = ({ mode, onAddChord, onBuildFromBones, hasChords }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDraggingFromPalette, setIsDraggingFromPalette] = useState(false);

  // Track when a palette chord is being dragged to prevent collapse
  useDndMonitor({
    onDragStart: (event) => {
      const id = String(event.active.id);
      if (id.startsWith('palette-chord-')) {
        setIsDraggingFromPalette(true);
      }
    },
    onDragEnd: () => {
      setIsDraggingFromPalette(false);
      setIsExpanded(false); // Collapse after drop
    },
    onDragCancel: () => {
      setIsDraggingFromPalette(false);
      setIsExpanded(false); // Collapse after cancel
    },
  });

  const handleChordClick = (degree: ScaleDegree) => {
    onAddChord(degree);
    // Optionally collapse after adding - uncomment if desired
    // setIsExpanded(false);
  };

  const handleMouseLeave = () => {
    // Don't collapse if we're dragging from the palette
    if (!isDraggingFromPalette) {
      setIsExpanded(false);
    }
  };

  return (
    <div
      className={styles.container}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Collapsed trigger */}
      <motion.div
        className={styles.trigger}
        animate={{
          opacity: isExpanded ? 0 : 1,
          y: isExpanded ? 10 : 0,
          pointerEvents: isExpanded ? 'none' : 'auto',
        }}
        transition={{ duration: 0.15 }}
      >
        <span className={styles.triggerIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <circle cx="7" cy="8" r="1.5" fill="currentColor" opacity="0.6" />
            <circle cx="17" cy="8" r="1.5" fill="currentColor" opacity="0.6" />
            <circle cx="7" cy="16" r="1.5" fill="currentColor" opacity="0.6" />
            <circle cx="17" cy="16" r="1.5" fill="currentColor" opacity="0.6" />
          </svg>
        </span>
        <span className={styles.triggerLabel}>Add Chords</span>
      </motion.div>

      {/* Expanded palette */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className={styles.palette}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className={styles.paletteHeader}>
              <span>Click or drag to add chord</span>
            </div>
            <div className={styles.chordGrid}>
              {SCALE_DEGREES.map((info, index) => (
                <DraggablePaletteChord
                  key={info.degree}
                  degree={info.degree}
                  mode={mode}
                  numeral={mode === 'major' ? info.majorNumeral : info.minorNumeral}
                  name={mode === 'major' ? info.majorName : info.minorName}
                  index={index}
                  onClick={() => handleChordClick(info.degree)}
                />
              ))}
            </div>
            {hasChords && onBuildFromBones && (
              <button
                onClick={onBuildFromBones}
                className={styles.buildFromBonesButton}
                title="Analyze progression with AI deconstruction"
                aria-label="Build From Bones"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v20M2 12h20" />
                  <circle cx="12" cy="12" r="8" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                </svg>
                <span>Build From Bones</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ChordItemProps {
  degree: ScaleDegree;
  mode: Mode;
  numeral: string;
  name: string;
  index: number;
  onClick: () => void;
}

interface DraggablePaletteChordProps extends ChordItemProps {}

/**
 * Wrapper component that makes palette chords draggable
 * Uses useDraggable from @dnd-kit/core to enable drag-and-drop
 */
const DraggablePaletteChord: React.FC<DraggablePaletteChordProps> = ({
  degree,
  mode,
  numeral,
  name,
  index,
  onClick,
}) => {
  // Memoize data to ensure stable reference for @dnd-kit
  const dragData = useMemo(() => ({
    scaleDegree: degree,
    type: 'palette-chord' as const,
  }), [degree]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `palette-chord-${degree}`,
    data: dragData,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1000 : undefined,
  };

  const handleClick = (_e: React.MouseEvent) => {
    // Only trigger click if not dragging
    if (!isDragging) {
      onClick();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.draggablePaletteChord} ${isDragging ? styles.isDragging : ''}`}
      {...listeners}
      {...attributes}
    >
      <ChordItem
        degree={degree}
        mode={mode}
        numeral={numeral}
        name={name}
        index={index}
        onClick={handleClick}
        isDragging={isDragging}
      />
    </div>
  );
};

interface ChordItemInternalProps {
  degree: ScaleDegree;
  mode: Mode;
  numeral: string;
  name: string;
  index: number;
  onClick: (e: React.MouseEvent) => void;
  isDragging?: boolean;
}

const ChordItem: React.FC<ChordItemInternalProps> = ({
  degree,
  mode,
  numeral,
  name,
  index,
  onClick,
  isDragging = false,
}) => {
  const color = getScaleDegreeColor(degree, mode);
  const shapePath = getShapePath(degree);
  const isOutlined = degree === 6 || degree === 7;
  const isDotted = degree === 6;

  return (
    <motion.button
      className={styles.chordItem}
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: isDragging ? 0.8 : 1,
        y: 0,
        scale: isDragging ? 1.05 : 1,
      }}
      transition={{ delay: isDragging ? 0 : index * 0.03 }}
      onClick={onClick}
      title={`Add ${name} (${numeral}) - Click or drag to canvas`}
      aria-label={`Add ${name} chord`}
      style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
    >
      <svg
        className={styles.chordShape}
        viewBox="0 0 48 48"
        width="48"
        height="48"
      >
        <path
          d={shapePath}
          fill={isOutlined ? 'rgba(255,255,255,0.9)' : color}
          stroke={isOutlined ? color : 'none'}
          strokeWidth={isOutlined ? 2 : 0}
          strokeDasharray={isDotted ? '3,3' : 'none'}
        />
      </svg>
      <span className={styles.chordNumeral} style={{ color }}>
        {numeral}
      </span>
    </motion.button>
  );
};

// Generate SVG path for each scale degree shape (48x48 viewBox)
function getShapePath(degree: ScaleDegree): string {
  const center = 24;
  const radius = 18;

  switch (degree) {
    case 1:
    case 6:
      // Circle
      return `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center - 0.01} ${center - radius} Z`;
    case 2: {
      // Rounded square
      const half = radius * 0.85;
      const cr = 4;
      return `
        M ${center - half + cr} ${center - half}
        L ${center + half - cr} ${center - half}
        Q ${center + half} ${center - half} ${center + half} ${center - half + cr}
        L ${center + half} ${center + half - cr}
        Q ${center + half} ${center + half} ${center + half - cr} ${center + half}
        L ${center - half + cr} ${center + half}
        Q ${center - half} ${center + half} ${center - half} ${center + half - cr}
        L ${center - half} ${center - half + cr}
        Q ${center - half} ${center - half} ${center - half + cr} ${center - half}
        Z
      `;
    }
    case 3: {
      // Triangle
      const h = radius * 1.4;
      return `M ${center} ${center - h * 0.55} L ${center + radius * 0.9} ${center + h * 0.45} L ${center - radius * 0.9} ${center + h * 0.45} Z`;
    }
    case 4: {
      // Square
      const s = radius * 0.8;
      return `M ${center - s} ${center - s} L ${center + s} ${center - s} L ${center + s} ${center + s} L ${center - s} ${center + s} Z`;
    }
    case 5:
    case 7: {
      // Pentagon
      const points = [];
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * 2 * Math.PI - Math.PI / 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        points.push([x, y]);
      }
      return `M ${points[0][0]} ${points[0][1]} ${points.slice(1).map(p => `L ${p[0]} ${p[1]}`).join(' ')} Z`;
    }
    default:
      return `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center - 0.01} ${center - radius} Z`;
  }
}
