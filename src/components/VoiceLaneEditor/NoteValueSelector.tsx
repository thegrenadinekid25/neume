import React, { useCallback } from 'react';
import type { NoteValue, SnapResolution } from '@/types/voice-line';
import { useVoiceLineStore } from '@/store/voice-line-store';
import styles from './NoteValueSelector.module.css';

/**
 * NoteValueSelector component
 * Provides UI controls for selecting note duration and snap resolution
 */
export const NoteValueSelector: React.FC = () => {
  const selectedNoteValue = useVoiceLineStore((state) => state.selectedNoteValue);
  const snapResolution = useVoiceLineStore((state) => state.snapResolution);
  const setSelectedNoteValue = useVoiceLineStore((state) => state.setSelectedNoteValue);
  const setSnapResolution = useVoiceLineStore((state) => state.setSnapResolution);

  // Note value options with their display labels
  const noteValues: Array<{ value: NoteValue; label: string; title: string }> = [
    { value: 'whole', label: '𝅝', title: 'Whole Note (4 beats)' },
    { value: 'half', label: '𝅗𝅥', title: 'Half Note (2 beats)' },
    { value: 'quarter', label: '𝅘𝅥', title: 'Quarter Note (1 beat)' },
    { value: 'eighth', label: '𝅘𝅥𝅮', title: 'Eighth Note (0.5 beats)' },
    { value: 'sixteenth', label: '𝅘𝅥𝅯', title: 'Sixteenth Note (0.25 beats)' },
    { value: 'thirtysecond', label: '𝅘𝅥𝅰', title: 'Thirty-second Note (0.125 beats)' },
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
              <span className={styles.noteSymbol}>{option.label}</span>
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
