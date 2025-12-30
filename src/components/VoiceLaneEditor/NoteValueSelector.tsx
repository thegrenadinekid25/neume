import React, { useCallback } from 'react';
import type { NoteValue, SnapResolution } from '@/types/voice-line';
import { useVoiceLineStore } from '@/store/voice-line-store';
import styles from './NoteValueSelector.module.css';

// SVG icons for note values
const NoteIcons: Record<NoteValue, React.ReactNode> = {
  whole: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <ellipse cx="12" cy="12" rx="6" ry="4" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  half: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <ellipse cx="10" cy="16" rx="5" ry="3.5" fill="none" stroke="currentColor" strokeWidth="2"/>
      <line x1="15" y1="16" x2="15" y2="4" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  quarter: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <ellipse cx="10" cy="16" rx="5" ry="3.5"/>
      <line x1="15" y1="16" x2="15" y2="4" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  eighth: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <ellipse cx="9" cy="17" rx="5" ry="3.5"/>
      <line x1="14" y1="17" x2="14" y2="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M14 4 Q18 6 18 10" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  sixteenth: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <ellipse cx="9" cy="17" rx="5" ry="3.5"/>
      <line x1="14" y1="17" x2="14" y2="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M14 4 Q18 6 18 10" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M14 8 Q18 10 18 14" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  thirtysecond: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <ellipse cx="9" cy="18" rx="4" ry="3"/>
      <line x1="13" y1="18" x2="13" y2="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M13 3 Q17 5 17 8" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M13 6 Q17 8 17 11" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M13 9 Q17 11 17 14" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
};

/**
 * NoteValueSelector component
 * Provides UI controls for selecting note duration and snap resolution
 */
export const NoteValueSelector: React.FC = () => {
  const selectedNoteValue = useVoiceLineStore((state) => state.selectedNoteValue);
  const snapResolution = useVoiceLineStore((state) => state.snapResolution);
  const setSelectedNoteValue = useVoiceLineStore((state) => state.setSelectedNoteValue);
  const setSnapResolution = useVoiceLineStore((state) => state.setSnapResolution);

  // Note value options
  const noteValues: Array<{ value: NoteValue; title: string }> = [
    { value: 'whole', title: 'Whole Note (4 beats)' },
    { value: 'half', title: 'Half Note (2 beats)' },
    { value: 'quarter', title: 'Quarter Note (1 beat)' },
    { value: 'eighth', title: 'Eighth Note (0.5 beats)' },
    { value: 'sixteenth', title: 'Sixteenth Note (0.25 beats)' },
    { value: 'thirtysecond', title: 'Thirty-second Note (0.125 beats)' },
  ];

  // Snap resolution options
  const snapOptions: Array<{ value: SnapResolution; label: string; title: string }> = [
    { value: 1, label: 'Beat', title: 'Snap to whole beats' },
    { value: 0.5, label: 'Half', title: 'Snap to half beats' },
    { value: 0.25, label: 'Quarter', title: 'Snap to quarter beats' },
    { value: 0.125, label: '16th', title: 'Snap to sixteenth beats' },
    { value: 0, label: 'Free', title: 'No snapping - free positioning' },
  ];

  const handleNoteValueClick = useCallback((value: NoteValue) => {
    setSelectedNoteValue(value);
  }, [setSelectedNoteValue]);

  const handleSnapResolutionClick = useCallback((resolution: SnapResolution) => {
    setSnapResolution(resolution);
  }, [setSnapResolution]);

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <label className={styles.label}>Note Duration:</label>
        <div className={styles.buttonGroup}>
          {noteValues.map((option) => (
            <button
              key={option.value}
              className={`${styles.noteButton} ${selectedNoteValue === option.value ? styles.active : ''}`}
              onClick={() => handleNoteValueClick(option.value)}
              title={option.title}
              type="button"
            >
              {NoteIcons[option.value]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <label className={styles.label}>Snap Resolution:</label>
        <div className={styles.snapGroup}>
          {snapOptions.map((option) => (
            <button
              key={option.value}
              className={`${styles.snapButton} ${snapResolution === option.value ? styles.active : ''}`}
              onClick={() => handleSnapResolutionClick(option.value)}
              title={option.title}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
