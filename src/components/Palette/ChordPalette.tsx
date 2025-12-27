import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScaleDegreeColor } from '@/styles/colors';
import type { ScaleDegree, Mode } from '@/types';
import styles from './ChordPalette.module.css';

interface ChordPaletteProps {
  mode: Mode;
  onAddChord: (scaleDegree: ScaleDegree) => void;
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
 */
export const ChordPalette: React.FC<ChordPaletteProps> = ({ mode, onAddChord }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChordClick = (degree: ScaleDegree) => {
    onAddChord(degree);
    // Optionally collapse after adding - uncomment if desired
    // setIsExpanded(false);
  };

  return (
    <div
      className={styles.container}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
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
              <span>Click to add chord</span>
            </div>
            <div className={styles.chordGrid}>
              {SCALE_DEGREES.map((info, index) => (
                <ChordItem
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

const ChordItem: React.FC<ChordItemProps> = ({
  degree,
  mode,
  numeral,
  name,
  index,
  onClick,
}) => {
  const color = getScaleDegreeColor(degree, mode);
  const shapePath = getShapePath(degree);
  const isOutlined = degree === 6 || degree === 7;
  const isDotted = degree === 6;

  return (
    <motion.button
      className={styles.chordItem}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      title={`Add ${name} (${numeral})`}
      aria-label={`Add ${name} chord`}
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
    case 2:
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
    case 3:
      // Triangle
      const h = radius * 1.4;
      return `M ${center} ${center - h * 0.55} L ${center + radius * 0.9} ${center + h * 0.45} L ${center - radius * 0.9} ${center + h * 0.45} Z`;
    case 4:
      // Square
      const s = radius * 0.8;
      return `M ${center - s} ${center - s} L ${center + s} ${center - s} L ${center + s} ${center + s} L ${center - s} ${center + s} Z`;
    case 5:
    case 7:
      // Pentagon
      const points = [];
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * 2 * Math.PI - Math.PI / 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        points.push([x, y]);
      }
      return `M ${points[0][0]} ${points[0][1]} ${points.slice(1).map(p => `L ${p[0]} ${p[1]}`).join(' ')} Z`;
    default:
      return `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center - 0.01} ${center - radius} Z`;
  }
}
