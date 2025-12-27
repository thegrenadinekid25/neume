import { useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import type { VoiceType } from '@/services/voice-leading-analyzer';
import styles from './VoiceHandle.module.css';

// SATB voice ranges in MIDI
const VOICE_RANGES: Record<VoiceType, { low: number; high: number }> = {
  soprano: { low: 60, high: 79 }, // C4 - G5
  alto: { low: 55, high: 74 },    // G3 - D5
  tenor: { low: 48, high: 67 },   // C3 - G4
  bass: { low: 40, high: 60 },    // E2 - C4
};

const VOICE_COLORS: Record<VoiceType, string> = {
  soprano: '#E8A03E', // amber
  alto: '#6B8FAD',    // blue
  tenor: '#7A9E87',   // sage
  bass: '#8B7355',    // taupe
};

interface VoiceHandleProps {
  voice: VoiceType;
  currentMidi: number;
  containerHeight: number;
  isActive: boolean;
  hasWarning: boolean;
  hasError: boolean;
  disabled?: boolean;
  onDragStart: (voice: VoiceType, midi: number) => void;
  onDrag: (midi: number) => void;
  onDragEnd: () => void;
}

function midiToNoteName(midi: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const note = noteNames[midi % 12];
  return `${note}${octave}`;
}

function midiToYPosition(midi: number, range: { low: number; high: number }, height: number): number {
  const rangeSpan = range.high - range.low;
  const positionInRange = midi - range.low;
  const normalized = positionInRange / rangeSpan;
  return height * (1 - normalized); // Invert: higher notes = lower Y
}

function yPositionToMidi(y: number, range: { low: number; high: number }, height: number): number {
  const normalized = 1 - (y / height);
  const midi = range.low + (normalized * (range.high - range.low));
  return Math.round(Math.max(range.low, Math.min(range.high, midi)));
}

export function VoiceHandle({
  voice,
  currentMidi,
  containerHeight,
  isActive,
  hasWarning,
  hasError,
  disabled = false,
  onDragStart,
  onDrag,
  onDragEnd,
}: VoiceHandleProps) {
  const constraintRef = useRef<HTMLDivElement>(null);
  const range = VOICE_RANGES[voice];
  const yPosition = midiToYPosition(currentMidi, range, containerHeight);
  const color = VOICE_COLORS[voice];
  const noteName = midiToNoteName(currentMidi);

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;
    const newY = yPosition + info.offset.y;
    const newMidi = yPositionToMidi(newY, range, containerHeight);
    onDrag(newMidi);
  };

  return (
    <div
      ref={constraintRef}
      className={styles.container}
      style={{ height: containerHeight }}
    >
      <motion.div
        className={`${styles.handle} ${isActive ? styles.active : ''} ${hasError ? styles.error : ''} ${hasWarning ? styles.warning : ''}`}
        style={{
          backgroundColor: color,
          y: yPosition,
        }}
        drag={disabled ? false : 'y'}
        dragConstraints={constraintRef}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={() => onDragStart(voice, currentMidi)}
        onDrag={handleDrag}
        onDragEnd={onDragEnd}
        whileDrag={{ scale: 1.2, zIndex: 100 }}
        whileHover={{ scale: 1.1 }}
      >
        <span className={styles.label}>{voice[0].toUpperCase()}</span>
        <span className={styles.note}>{noteName}</span>
      </motion.div>
    </div>
  );
}

export { VOICE_RANGES, VOICE_COLORS, midiToNoteName, midiToYPosition, yPositionToMidi };
