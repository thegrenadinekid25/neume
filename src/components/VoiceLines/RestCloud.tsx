import React from 'react';
import { motion } from 'framer-motion';
import type { MelodicNote, VoicePart } from '@/types';
import { VOICE_RANGES } from '@/data/voice-ranges';
import styles from './RestCloud.module.css';

interface RestCloudProps {
  note: MelodicNote;
  voicePart: VoicePart;
  x: number;
  y: number;
  width: number; // duration * beatWidth
  isSelected: boolean;
  onClick: (noteId: string, e: React.MouseEvent) => void;
}

export const RestCloud = React.memo(function RestCloud({
  note,
  voicePart,
  x,
  y,
  width,
  isSelected,
  onClick,
}: RestCloudProps) {
  const voiceRange = VOICE_RANGES[voicePart];
  const voiceColor = voiceRange?.color || '#666666';

  // Create SVG path for a soft cloud shape (3 overlapping bumps)
  const cloudPath = `
    M ${x + width * 0.1} ${y + 8}
    Q ${x + width * 0.15} ${y - 4} ${x + width * 0.25} ${y}
    Q ${x + width * 0.35} ${y - 6} ${x + width * 0.5} ${y - 4}
    Q ${x + width * 0.65} ${y - 8} ${x + width * 0.75} ${y}
    Q ${x + width * 0.85} ${y - 4} ${x + width * 0.9} ${y + 8}
    Z
  `;

  const fillColor = voiceColor;
  const strokeColor = voiceColor;

  return (
    <motion.svg
      x={x}
      y={y - 12}
      width={width}
      height={24}
      viewBox={`0 0 ${width} 24`}
      className={`${styles.cloud} ${isSelected ? styles.selected : ''}`}
      onClick={(e) => onClick(note.id, e as any)}
      initial={{ opacity: 0 }}
      animate={{ opacity: isSelected ? 0.35 : 0.15 }}
      transition={{ duration: 0.2 }}
      preserveAspectRatio="none"
    >
      <defs>
        <filter id={`cloud-glow-${note.id}`}>
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={cloudPath}
        fill={fillColor}
        fillOpacity={isSelected ? 0.35 : 0.15}
        stroke={strokeColor}
        strokeOpacity={isSelected ? 0.8 : 0.4}
        strokeWidth="1.5"
        strokeDasharray="4 2"
        filter={isSelected ? `url(#cloud-glow-${note.id})` : undefined}
      />
    </motion.svg>
  );
});

RestCloud.displayName = 'RestCloud';
