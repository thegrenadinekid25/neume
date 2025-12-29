import React from 'react';
import type { SnapshotChord } from '@/types';
import styles from './SnapshotPreview.module.css';

interface SnapshotPreviewProps {
  chords: SnapshotChord[];
}

function getScaleDegreeName(degree: number): string {
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  return romans[degree - 1] || 'I';
}

function getScaleDegreeColor(degree: number): string {
  const colors = [
    'var(--color-major-I)',
    'var(--color-major-ii)',
    'var(--color-major-iii)',
    'var(--color-major-IV)',
    'var(--color-major-V)',
    'var(--color-major-vi)',
    'var(--color-major-vii)',
  ];
  return colors[degree - 1] || 'var(--color-major-I)';
}

function getQualityAbbr(quality: string): string {
  const abbrs: Record<string, string> = {
    major: '',
    minor: 'm',
    diminished: '°',
    augmented: '+',
    dom7: '7',
    maj7: 'maj7',
    min7: 'm7',
    halfdim7: 'ø7',
    dim7: '°7',
    dom9: '9',
    maj9: 'maj9',
    min9: 'm9',
    dom11: '11',
    min11: 'm11',
    dom13: '13',
    maj13: 'maj13',
    min13: 'm13',
  };
  return abbrs[quality] || '';
}

export const SnapshotPreview: React.FC<SnapshotPreviewProps> = ({ chords }) => {
  if (chords.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No chords selected</p>
      </div>
    );
  }

  return (
    <div className={styles.preview}>
      {chords.map((chord, index) => {
        const scaleDegree = chord.scaleDegree;
        const romanNumeral = getScaleDegreeName(scaleDegree);
        const isMinor = chord.quality === 'minor' || chord.quality.includes('min');
        const qualityAbbr = getQualityAbbr(chord.quality);
        const color = getScaleDegreeColor(scaleDegree);

        return (
          <div key={index} className={styles.chordCircle}>
            <div
              className={`${styles.circle} ${isMinor ? styles.minor : ''}`}
              style={{ backgroundColor: color }}
              title={`${romanNumeral}${qualityAbbr} (${chord.duration} beats)`}
            >
              <span className={styles.roman}>{romanNumeral}</span>
              {qualityAbbr && <span className={styles.quality}>{qualityAbbr}</span>}
            </div>
            <span className={styles.duration}>{chord.duration}b</span>
          </div>
        );
      })}
    </div>
  );
};
