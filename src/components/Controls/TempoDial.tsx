import React, { useRef } from 'react';
import styles from './TempoDial.module.css';

export interface TempoDialProps {
  tempo: number;
  onTempoChange: (tempo: number) => void;
  minTempo?: number;
  maxTempo?: number;
  disabled?: boolean;
}

// SVG dimensions for floating dial
const WIDTH = 100;
const HEIGHT = 56;
const CX = WIDTH / 2;
const CY = HEIGHT - 4; // Center near bottom for semicircle
const RADIUS = 40;

// Arc angles: -90° to 90° (upward-facing semicircle)
// In our coordinate system: -90° = left, 0° = top, 90° = right
const START_ANGLE = -90;
const END_ANGLE = 90;
const ANGLE_RANGE = END_ANGLE - START_ANGLE;

export function TempoDial({
  tempo,
  onTempoChange,
  minTempo = 60,
  maxTempo = 220,
  disabled = false,
}: TempoDialProps) {
  const dialRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);

  // Calculate needle angle from tempo
  const tempoToAngle = (t: number): number => {
    const normalized = (t - minTempo) / (maxTempo - minTempo);
    return START_ANGLE + normalized * ANGLE_RANGE;
  };

  // Calculate tempo from angle
  const angleToTempo = (angle: number): number => {
    const normalized = (angle - START_ANGLE) / ANGLE_RANGE;
    const clamped = Math.max(0, Math.min(1, normalized));
    return Math.round(minTempo + clamped * (maxTempo - minTempo));
  };

  // Convert angle to SVG coordinates
  const polarToCartesian = (angle: number, r: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: CX + r * Math.cos(rad),
      y: CY + r * Math.sin(rad),
    };
  };

  // Get angle from mouse/touch position
  const getAngleFromEvent = (clientX: number, clientY: number): number => {
    if (!dialRef.current) return tempoToAngle(tempo);
    const rect = dialRef.current.getBoundingClientRect();
    const x = clientX - rect.left - CX;
    const y = clientY - rect.top - CY;
    // atan2 gives: right=0°, down=90°, left=±180°, up=-90°
    // Adding 90° shifts to: up=0°, right=90°, left=270°/-90°
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    // Convert angles > 180° to negative equivalent (270° → -90°)
    if (angle > 180) angle -= 360;
    // Clamp to dial range
    return Math.max(START_ANGLE, Math.min(END_ANGLE, angle));
  };

  // Create arc path
  const arcStart = polarToCartesian(START_ANGLE, RADIUS);
  const arcEnd = polarToCartesian(END_ANGLE, RADIUS);
  const arcPathD = `M ${arcStart.x} ${arcStart.y} A ${RADIUS} ${RADIUS} 0 0 1 ${arcEnd.x} ${arcEnd.y}`;

  // Needle position
  const needleAngle = tempoToAngle(tempo);
  const needleEnd = polarToCartesian(needleAngle, RADIUS - 4);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    isDragging.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    const angle = getAngleFromEvent(e.clientX, e.clientY);
    onTempoChange(angleToTempo(angle));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || disabled) return;
    const angle = getAngleFromEvent(e.clientX, e.clientY);
    onTempoChange(angleToTempo(angle));
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    const angle = getAngleFromEvent(e.clientX, e.clientY);
    onTempoChange(angleToTempo(angle));
  };

  return (
    <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
      <svg
        ref={dialRef}
        width={WIDTH}
        height={HEIGHT}
        className={styles.dial}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Background arc */}
        <path
          d={arcPathD}
          fill="none"
          stroke="#ddd"
          strokeWidth={4}
          strokeLinecap="round"
          className={styles.arc}
        />

        {/* Active arc (filled portion) */}
        <path
          d={`M ${arcStart.x} ${arcStart.y} A ${RADIUS} ${RADIUS} 0 0 1 ${needleEnd.x} ${needleEnd.y}`}
          fill="none"
          stroke="#4A90E2"
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* Needle */}
        <line
          x1={CX}
          y1={CY}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke="#333"
          strokeWidth={2}
          strokeLinecap="round"
          className={styles.needle}
        />

        {/* Center dot */}
        <circle cx={CX} cy={CY} r={3} fill="#333" />
      </svg>

      <div className={styles.tempoDisplay}>
        <span className={styles.tempoValue}>{tempo}</span>
        <span className={styles.tempoLabel}>BPM</span>
      </div>
    </div>
  );
}
