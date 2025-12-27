import React, { useRef, useCallback, useEffect, useState } from 'react';
import styles from './TempoDial.module.css';

export interface TempoDialProps {
  tempo: number;
  onTempoChange: (tempo: number) => void;
  minTempo?: number;
  maxTempo?: number;
  disabled?: boolean;
}

// SVG dimensions for pendulum metronome
const WIDTH = 100;
const HEIGHT = 120;
const PIVOT_X = WIDTH / 2;
const PIVOT_Y = 16; // Pivot at top
const ARM_LENGTH = 60;
const WEIGHT_RADIUS = 10;
const PIVOT_RADIUS = 4;
const SWING_ANGLE = 25; // degrees

// Default tempo for double-click reset
const DEFAULT_TEMPO = 120;

export function TempoDial({
  tempo,
  onTempoChange,
  minTempo = 60,
  maxTempo = 220,
  disabled = false,
}: TempoDialProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartTempo = useRef(tempo);
  const [isHovering, setIsHovering] = useState(false);

  // Calculate animation duration from tempo (one full swing = one beat)
  const swingDuration = 60000 / tempo;

  // Calculate weight position based on tempo (higher position = faster tempo)
  // Map tempo range to arm length range (shorter arm = higher position = faster)
  const tempoToArmLength = (t: number): number => {
    // Invert: higher tempo = shorter arm (weight closer to pivot)
    const normalized = (t - minTempo) / (maxTempo - minTempo);
    // Arm length ranges from 55px (slow) to 25px (fast)
    return 55 - normalized * 30;
  };

  const currentArmLength = tempoToArmLength(tempo);

  // Weight position (at rest, pointing straight down)
  const weightX = PIVOT_X;
  const weightY = PIVOT_Y + currentArmLength;

  // Tick mark positions at swing limits
  const leftTickAngle = -SWING_ANGLE * (Math.PI / 180);
  const rightTickAngle = SWING_ANGLE * (Math.PI / 180);
  const tickLength = 8;
  const tickRadius = ARM_LENGTH + 5;

  const leftTickStart = {
    x: PIVOT_X + Math.sin(leftTickAngle) * (tickRadius - tickLength),
    y: PIVOT_Y + Math.cos(leftTickAngle) * (tickRadius - tickLength),
  };
  const leftTickEnd = {
    x: PIVOT_X + Math.sin(leftTickAngle) * tickRadius,
    y: PIVOT_Y + Math.cos(leftTickAngle) * tickRadius,
  };
  const rightTickStart = {
    x: PIVOT_X + Math.sin(rightTickAngle) * (tickRadius - tickLength),
    y: PIVOT_Y + Math.cos(rightTickAngle) * (tickRadius - tickLength),
  };
  const rightTickEnd = {
    x: PIVOT_X + Math.sin(rightTickAngle) * tickRadius,
    y: PIVOT_Y + Math.cos(rightTickAngle) * tickRadius,
  };

  // Handle vertical dragging on the weight bob
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartTempo.current = tempo;
    (e.target as Element).setPointerCapture(e.pointerId);
  }, [disabled, tempo]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || disabled) return;

    // Calculate vertical delta (up = negative Y = faster tempo)
    const deltaY = dragStartY.current - e.clientY;

    // Scale: ~2px per BPM
    const tempoDelta = Math.round(deltaY / 2);
    const newTempo = Math.max(minTempo, Math.min(maxTempo, dragStartTempo.current + tempoDelta));

    if (newTempo !== tempo) {
      onTempoChange(newTempo);
    }
  }, [disabled, minTempo, maxTempo, tempo, onTempoChange]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Double-click to reset to default tempo
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    onTempoChange(DEFAULT_TEMPO);
  }, [disabled, onTempoChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isDragging.current = false;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${disabled ? styles.disabled : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      <svg
        width={WIDTH}
        height={HEIGHT - 30} // Leave space for tempo display
        className={styles.pendulum}
        viewBox={`0 0 ${WIDTH} ${HEIGHT - 30}`}
      >
        {/* Tick marks at swing limits */}
        <line
          x1={leftTickStart.x}
          y1={leftTickStart.y}
          x2={leftTickEnd.x}
          y2={leftTickEnd.y}
          className={styles.tickMark}
        />
        <line
          x1={rightTickStart.x}
          y1={rightTickStart.y}
          x2={rightTickEnd.x}
          y2={rightTickEnd.y}
          className={styles.tickMark}
        />

        {/* Pendulum group (arm + weight) - animated */}
        <g
          className={styles.pendulumArm}
          style={{
            transformOrigin: `${PIVOT_X}px ${PIVOT_Y}px`,
            animationDuration: `${swingDuration}ms`,
          }}
        >
          {/* Pendulum arm */}
          <line
            x1={PIVOT_X}
            y1={PIVOT_Y}
            x2={weightX}
            y2={weightY}
            className={styles.arm}
          />

          {/* Weight bob (draggable) */}
          <circle
            cx={weightX}
            cy={weightY}
            r={WEIGHT_RADIUS}
            className={`${styles.weightBob} ${isHovering ? styles.weightBobHover : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          />
        </g>

        {/* Pivot point circle at top (drawn last to be on top) */}
        <circle
          cx={PIVOT_X}
          cy={PIVOT_Y}
          r={PIVOT_RADIUS}
          className={styles.pivot}
        />
      </svg>

      <div className={styles.tempoDisplay}>
        <span className={styles.tempoValue}>{tempo}</span>
        <span className={styles.tempoLabel}>BPM</span>
      </div>
    </div>
  );
}
