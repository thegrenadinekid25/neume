import React, { useCallback } from 'react';
import type { NoteValue } from '@/types/voice-line';
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
 * Provides UI controls for selecting note duration
 */
export const NoteValueSelector: React.FC = () => {
  const selectedNoteValue = useVoiceLineStore((state) => state.selectedNoteValue);
  const setSelectedNoteValue = useVoiceLineStore((state) => state.setSelectedNoteValue);

  // Note value options
  const noteValues: Array<{ value: NoteValue; title: string }> = [
    { value: 'whole', title: 'Whole Note (4 beats)' },
    { value: 'half', title: 'Half Note (2 beats)' },
    { value: 'quarter', title: 'Quarter Note (1 beat)' },
    { value: 'eighth', title: 'Eighth Note (0.5 beats)' },
    { value: 'sixteenth', title: 'Sixteenth Note (0.25 beats)' },
    { value: 'thirtysecond', title: 'Thirty-second Note (0.125 beats)' },
  ];

  const handleNoteValueClick = useCallback((value: NoteValue) => {
    setSelectedNoteValue(value);
  }, [setSelectedNoteValue]);

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
    </div>
  );
};
