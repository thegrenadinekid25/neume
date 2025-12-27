import React, { useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MelodicNote, VoicePart, Accidental, NonChordToneType } from '@/types';
import { VOICE_RANGES } from '@/data/voice-ranges';
import { yToNearestMidi, PITCH_CONFIG } from '@/utils/pitch-positioning';
import styles from './PitchDot.module.css';

interface PitchDotProps {
  note: MelodicNote;
  voicePart: VoicePart;
  x: number;
  y: number;
  isSelected: boolean;
  isPlaying: boolean;
  showNonChordToneBadge: boolean;
  onDrag: (noteId: string, newMidi: number) => void;
  onDragEnd: (noteId: string) => void;
  onClick: (noteId: string, e: React.MouseEvent) => void;
  onHover: (noteId: string | null) => void;
}

// Type for Framer Motion drag info
interface DragInfo {
  delta: { x: number; y: number };
  offset: { x: number; y: number };
  point: { x: number; y: number };
  velocity: { x: number; y: number };
}

const ACCIDENTAL_SYMBOLS: Record<Exclude<Accidental, null>, string> = {
  sharp: '♯',
  flat: '♭',
  natural: '♮',
  doubleSharp: '𝄪',
  doubleFlat: '𝄫',
};

const NCT_ABBREVIATIONS: Record<Exclude<NonChordToneType, null>, string> = {
  passing: 'p',
  neighbor: 'n',
  suspension: 's',
  anticipation: 'ant',
  escape: 'e',
  appoggiatura: 'app',
  pedal: 'ped',
  retardation: 'ret',
};

export const PitchDot = React.memo(function PitchDot({
  note,
  voicePart,
  x,
  y,
  isSelected,
  isPlaying,
  showNonChordToneBadge,
  onDrag,
  onDragEnd,
  onClick,
  onHover,
}: PitchDotProps) {
  const dragRef = useRef(false);
  const voiceColor = VOICE_RANGES[voicePart].color;

  // Calculate accidental class for styling
  const accidentalClass = useMemo(() => {
    if (note.accidental === 'sharp' || note.accidental === 'doubleSharp') {
      return styles.sharp;
    }
    if (note.accidental === 'flat' || note.accidental === 'doubleFlat') {
      return styles.flat;
    }
    return '';
  }, [note.accidental]);

  // Get accidental symbol to display
  const accidentalSymbol = useMemo(() => {
    if (!note.accidental) return null;
    return ACCIDENTAL_SYMBOLS[note.accidental];
  }, [note.accidental]);

  // Get NCT badge text if applicable
  const nctBadgeText = useMemo(() => {
    if (!showNonChordToneBadge || !note.analysis.nonChordToneType) {
      return null;
    }
    return NCT_ABBREVIATIONS[note.analysis.nonChordToneType];
  }, [showNonChordToneBadge, note.analysis.nonChordToneType]);

  // Handle drag movement
  const handleDragMove = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: DragInfo) => {
      dragRef.current = true;
      const newY = y + info.delta.y;
      const newMidi = yToNearestMidi(newY, PITCH_CONFIG);
      onDrag(note.id, newMidi);
    },
    [note.id, y, onDrag]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    dragRef.current = false;
    onDragEnd(note.id);
  }, [note.id, onDragEnd]);

  // Handle click
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!dragRef.current) {
        onClick(note.id, e);
      }
    },
    [note.id, onClick]
  );

  return (
    <motion.g
      x={x}
      y={y}
      transform={`translate(${x}, ${y})`}
      className={styles.container}
      onHoverStart={() => onHover(note.id)}
      onHoverEnd={() => onHover(null)}
      whileHover={{ scale: 1.15 }}
      transition={{ duration: 0.15 }}
    >
      {/* Main circle (draggable) */}
      <motion.circle
        cx={0}
        cy={0}
        r={8}
        fill={voiceColor}
        className={`${styles.dot} ${isSelected ? styles.selected : ''} ${isPlaying ? styles.playing : ''}`}
        drag="y"
        dragElastic={0.2}
        onDrag={handleDragMove}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        cursor="grab"
        whileDrag={{ scale: 1.2, cursor: 'grabbing' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      />

      {/* Accidental symbol to the left */}
      <AnimatePresence>
        {accidentalSymbol && (
          <motion.text
            x={-14}
            y={4}
            className={`${styles.accidentalSymbol} ${accidentalClass}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: -14 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
          >
            {accidentalSymbol}
          </motion.text>
        )}
      </AnimatePresence>

      {/* Non-chord tone badge below */}
      <AnimatePresence>
        {nctBadgeText && (
          <motion.g
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 16 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <rect
              x={-18}
              y={0}
              width={36}
              height={16}
              rx={3}
              fill="white"
              opacity={0.95}
              className={styles.nctBadge}
            />
            <text
              x={0}
              y={11}
              textAnchor="middle"
              className={styles.nctBadge}
              fontSize="10"
              fontWeight="600"
              fill="#3D3530"
            >
              {nctBadgeText}
            </text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* Tooltip on hover */}
      <AnimatePresence>
        {isSelected && (
          <motion.g
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: -28 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <rect
              x={-24}
              y={0}
              width={48}
              height={20}
              rx={4}
              fill="#3D3530"
              opacity={0.95}
              className={styles.tooltip}
            />
            <text
              x={0}
              y={13}
              textAnchor="middle"
              className={styles.tooltip}
              fontSize="12"
              fontWeight="500"
              fill="#FAF8F5"
            >
              {note.pitch}
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </motion.g>
  );
});

PitchDot.displayName = 'PitchDot';
