import React from 'react';
import type { PhraseBoundary } from '@/types/progression';
import { CANVAS_CONFIG } from '@/utils/constants';
import styles from './PhraseBackgrounds.module.css';

interface PhraseBackgroundsProps {
  phrases: PhraseBoundary[];
  zoom: number;
}

// Soft pastel colors for phrase backgrounds
const PHRASE_COLORS = [
  'rgba(99, 179, 237, 0.15)',   // Blue
  'rgba(154, 230, 180, 0.15)', // Green
  'rgba(246, 173, 85, 0.15)',  // Orange
];

export const PhraseBackgrounds: React.FC<PhraseBackgroundsProps> = ({
  phrases,
  zoom,
}) => {
  if (phrases.length === 0) return null;

  const beatWidth = CANVAS_CONFIG.GRID_BEAT_WIDTH * zoom;

  return (
    <div className={styles.container}>
      {phrases.map((phrase, index) => {
        const left = phrase.startBeat * beatWidth;
        const width = (phrase.endBeat - phrase.startBeat) * beatWidth;
        const color = PHRASE_COLORS[index % PHRASE_COLORS.length];

        return (
          <div
            key={`phrase-${index}`}
            className={styles.phraseBox}
            style={{
              left: `${left}px`,
              width: `${width}px`,
              backgroundColor: color,
            }}
          >
            <span className={styles.phraseLabel}>
              {phrase.patternName}
            </span>
          </div>
        );
      })}
    </div>
  );
};
