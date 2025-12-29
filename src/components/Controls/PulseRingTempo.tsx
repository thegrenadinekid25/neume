import React, { useRef, useState } from 'react';
import styles from './PulseRingTempo.module.css';

export interface PulseRingTempoProps {
  tempo: number;
  onTempoChange: (tempo: number) => void;
  minTempo?: number;
  maxTempo?: number;
  disabled?: boolean;
  isPlaying?: boolean;
}

export function PulseRingTempo({
  tempo,
  onTempoChange,
  minTempo = 60,
  maxTempo = 220,
  disabled = false,
  isPlaying = false,
}: PulseRingTempoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(tempo));
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const startY = useRef(0);
  const startTempo = useRef(tempo);
  const pointerId = useRef<number | null>(null);

  // Calculate animation duration based on tempo (one beat)
  const beatDuration = 60000 / tempo; // ms per beat

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || isEditing) return;
    e.preventDefault();
    isDragging.current = true;
    hasDragged.current = false;
    startY.current = e.clientY;
    startTempo.current = tempo;
    pointerId.current = e.pointerId;
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || disabled) return;
    const deltaY = startY.current - e.clientY;

    // Detect drag (3px threshold)
    if (Math.abs(deltaY) >= 3) {
      hasDragged.current = true;
    }

    const tempoChange = Math.round(deltaY / 3); // 3px = 1 BPM
    const newTempo = Math.max(minTempo, Math.min(maxTempo, startTempo.current + tempoChange));
    onTempoChange(newTempo);
  };

  const handlePointerUp = (_e: React.PointerEvent) => {
    if (pointerId.current !== null) {
      containerRef.current?.releasePointerCapture(pointerId.current);
      pointerId.current = null;
    }

    // Only enter edit mode if it was a click (not a drag)
    if (isDragging.current && !hasDragged.current && !disabled) {
      setIsEditing(true);
      setEditValue(String(tempo));
    }

    isDragging.current = false;
    hasDragged.current = false;
  };

  const handleDoubleClick = () => {
    if (disabled) return;
    // Reset tempo to 120 BPM on double-click
    onTempoChange(120);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (disabled) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    const newTempo = Math.max(minTempo, Math.min(maxTempo, tempo + delta));
    onTempoChange(newTempo);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const newTempo = parseInt(editValue, 10);
    if (!isNaN(newTempo)) {
      onTempoChange(Math.max(minTempo, Math.min(maxTempo, newTempo)));
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(String(tempo));
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${disabled ? styles.disabled : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
    >
      {/* Pulse Ring SVG */}
      <svg
        className={styles.ringSvg}
        viewBox="0 0 120 120"
        style={{ '--beat-duration': `${beatDuration}ms` } as React.CSSProperties}
      >
        <circle
          className={`${styles.ring} ${isPlaying ? styles.ringPlaying : ''}`}
          cx="60"
          cy="60"
          r="54"
          fill="none"
          strokeWidth="2"
        />
      </svg>

      {/* Tempo Display */}
      <div className={styles.tempoDisplay}>
        {isEditing ? (
          <input
            type="number"
            className={styles.tempoInput}
            value={editValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            autoFocus
            min={minTempo}
            max={maxTempo}
          />
        ) : (
          <span
            className={styles.tempoValue}
            role="button"
            tabIndex={0}
          >
            {tempo}
          </span>
        )}
        <span className={styles.tempoLabel}>BPM</span>
      </div>
    </div>
  );
}
