import React, { useState, useRef, useEffect, useCallback } from 'react';
import { KEY_BACKGROUNDS } from '@/styles/colors';
import type { MusicalKey, Mode } from '@/types';
import styles from './MusicalSelector.module.css';

// Circle of fifths order for key arrangement
const CIRCLE_OF_FIFTHS: MusicalKey[] = ['C', 'G', 'D', 'A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

interface KeySelectorProps {
  value: MusicalKey;
  onChange: (key: MusicalKey) => void;
  mode?: Mode;
}

export const KeySelector: React.FC<KeySelectorProps> = ({ value, onChange, mode = 'major' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const getKeyBackground = (key: MusicalKey): string => {
    const colorKey = `${key}-${mode}` as keyof typeof KEY_BACKGROUNDS;
    return KEY_BACKGROUNDS[colorKey] || KEY_BACKGROUNDS['C-major'];
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        setIsOpen(true);
        setFocusedIndex(CIRCLE_OF_FIFTHS.indexOf(value));
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case 'ArrowRight':
        event.preventDefault();
        setFocusedIndex(prev => (prev + 1) % 12);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        setFocusedIndex(prev => (prev - 1 + 12) % 12);
        break;
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => (prev + 6) % 12);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => (prev - 6 + 12) % 12);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0) {
          onChange(CIRCLE_OF_FIFTHS[focusedIndex]);
          setIsOpen(false);
          triggerRef.current?.focus();
        }
        break;
    }
  }, [isOpen, focusedIndex, value, onChange]);

  const handleKeySelect = (key: MusicalKey) => {
    onChange(key);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div
      className={styles.keySelectorContainer}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <span className={styles.selectorLabel}>Key</span>
      <button
        ref={triggerRef}
        className={styles.keyTrigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Key: ${value}`}
        style={{ backgroundColor: getKeyBackground(value) }}
      >
        <span className={styles.keyValue}>{value}</span>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {isOpen && (
        <div
          className={styles.keyDropdown}
          role="listbox"
          aria-label="Select key"
        >
          <div className={styles.keyGrid}>
            {CIRCLE_OF_FIFTHS.map((key, index) => (
              <button
                key={key}
                className={`${styles.keyTile} ${key === value ? styles.keyTileActive : ''} ${index === focusedIndex ? styles.keyTileFocused : ''}`}
                onClick={() => handleKeySelect(key)}
                role="option"
                aria-selected={key === value}
                style={{ backgroundColor: getKeyBackground(key) }}
                tabIndex={-1}
              >
                <span className={styles.keyTileLabel}>{key}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface ModeToggleProps {
  value: Mode;
  onChange: (mode: Mode) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ value, onChange }) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      onChange(value === 'major' ? 'minor' : 'major');
    }
  };

  return (
    <div className={styles.modeToggleContainer}>
      <span className={styles.selectorLabel}>Mode</span>
      <div
        className={styles.modeToggle}
        role="radiogroup"
        aria-label="Mode selection"
        onKeyDown={handleKeyDown}
      >
        <button
          className={`${styles.modeOption} ${styles.modeMajor} ${value === 'major' ? styles.modeActive : ''}`}
          onClick={() => onChange('major')}
          role="radio"
          aria-checked={value === 'major'}
          tabIndex={value === 'major' ? 0 : -1}
        >
          Major
        </button>
        <button
          className={`${styles.modeOption} ${styles.modeMinor} ${value === 'minor' ? styles.modeActive : ''}`}
          onClick={() => onChange('minor')}
          role="radio"
          aria-checked={value === 'minor'}
          tabIndex={value === 'minor' ? 0 : -1}
        >
          Minor
        </button>
        <div
          className={styles.modeIndicator}
          style={{ transform: `translateX(${value === 'minor' ? '100%' : '0'})` }}
        />
      </div>
    </div>
  );
};

interface BeatsSelectorProps {
  value: number;
  onChange: (beats: number) => void;
}

const BEAT_OPTIONS = [2, 3, 4, 6] as const;

// Dot patterns for each meter
const DotPattern: React.FC<{ beats: number }> = ({ beats }) => {
  switch (beats) {
    case 2:
      return (
        <div className={styles.dotPattern2}>
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      );
    case 3:
      return (
        <div className={styles.dotPattern3}>
          <span className={styles.dot} />
          <div className={styles.dotRow}>
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </div>
      );
    case 4:
      return (
        <div className={styles.dotPattern4}>
          <div className={styles.dotRow}>
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
          <div className={styles.dotRow}>
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </div>
      );
    case 6:
      return (
        <div className={styles.dotPattern6}>
          <div className={styles.dotRow}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
          <div className={styles.dotRow}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </div>
      );
    default:
      return null;
  }
};

export const BeatsSelector: React.FC<BeatsSelectorProps> = ({ value, onChange }) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    const currentIndex = BEAT_OPTIONS.indexOf(value as typeof BEAT_OPTIONS[number]);

    switch (event.key) {
      case 'ArrowRight': {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % BEAT_OPTIONS.length;
        onChange(BEAT_OPTIONS[nextIndex]);
        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + BEAT_OPTIONS.length) % BEAT_OPTIONS.length;
        onChange(BEAT_OPTIONS[prevIndex]);
        break;
      }
    }
  };

  return (
    <div className={styles.beatsSelectorContainer}>
      <span className={styles.selectorLabel}>Beats</span>
      <div
        className={styles.beatsTileGrid}
        role="radiogroup"
        aria-label="Beats per measure"
        onKeyDown={handleKeyDown}
      >
        {BEAT_OPTIONS.map((beats) => (
          <button
            key={beats}
            className={`${styles.beatsTile} ${value === beats ? styles.beatsTileActive : ''}`}
            onClick={() => onChange(beats)}
            role="radio"
            aria-checked={value === beats}
            aria-label={`${beats} beats per measure`}
            tabIndex={value === beats ? 0 : -1}
          >
            <DotPattern beats={beats} />
          </button>
        ))}
      </div>
    </div>
  );
};
