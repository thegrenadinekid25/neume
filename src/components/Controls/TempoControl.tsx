import React, { useState, useEffect } from 'react';
import { playbackSystem } from '@/audio/PlaybackSystem';
import styles from './TempoControl.module.css';

interface TempoControlProps {
  defaultTempo?: number;
  onChange?: (tempo: number) => void;
}

export const TempoControl: React.FC<TempoControlProps> = ({
  defaultTempo = 120,
  onChange,
}) => {
  const [tempo, setTempo] = useState(defaultTempo);

  const handleTempoChange = (newTempo: number) => {
    const clampedTempo = Math.max(60, Math.min(180, newTempo));
    setTempo(clampedTempo);
    playbackSystem.setTempo(clampedTempo);
    onChange?.(clampedTempo);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleTempoChange(parseInt(e.target.value));
  };

  const handleIncrement = (delta: number) => {
    handleTempoChange(tempo + delta);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === '[') {
        e.preventDefault();
        handleTempoChange(tempo - 5);
      } else if (e.key === ']') {
        e.preventDefault();
        handleTempoChange(tempo + 5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tempo]);

  return (
    <div className={styles.tempoControl}>
      <label className={styles.label}>Tempo</label>
      <div className={styles.controls}>
        <button
          onClick={() => handleIncrement(-5)}
          className={styles.button}
          title="Slower ([ key)"
        >
          −
        </button>
        <div className={styles.display}>
          <span className={styles.value}>{tempo}</span>
          <span className={styles.unit}>BPM</span>
        </div>
        <button
          onClick={() => handleIncrement(5)}
          className={styles.button}
          title="Faster (] key)"
        >
          +
        </button>
      </div>
      <input
        type="range"
        min="60"
        max="180"
        step="1"
        value={tempo}
        onChange={handleSliderChange}
        className={styles.slider}
        title={`${tempo} BPM`}
      />
    </div>
  );
};
