/**
 * LyricsInput Component
 *
 * Text input for entering lyrics with syllable preview and voice selection.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VoicePart } from '@/types/voice-line';
import { useTextSettingStore } from '@/store/text-setting-store';
import { formatSyllablesForDisplay } from '@/services/syllable-parser';
import styles from './LyricsInput.module.css';

interface LyricsInputProps {
  voice: VoicePart;
  noteCount: number;
}

const VOICE_LABELS: Record<VoicePart, string> = {
  soprano: 'Soprano',
  alto: 'Alto',
  tenor: 'Tenor',
  bass: 'Bass',
};

export function LyricsInput({ voice, noteCount }: LyricsInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    voiceSettings,
    setInputText,
    clearInputText,
    setTextSettingMode,
  } = useTextSettingStore();

  const settings = voiceSettings[voice];
  const { inputText, syllables, mode } = settings;

  const syllablePreview = formatSyllablesForDisplay(syllables);
  const syllableCount = syllables.filter(
    (s) => !['_', '-', '~'].includes(s.text.trim())
  ).length;

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputText(voice, e.target.value);
    },
    [voice, setInputText]
  );

  const handleClear = useCallback(() => {
    clearInputText(voice);
    textareaRef.current?.focus();
  }, [voice, clearInputText]);

  const handleModeChange = useCallback(
    (newMode: 'syllabic' | 'melismatic' | 'neumatic') => {
      setTextSettingMode(voice, newMode);
    },
    [voice, setTextSettingMode]
  );

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputText]);

  const getRatioStatus = () => {
    if (syllableCount === 0) return null;
    if (noteCount === 0) return { type: 'warning', message: 'No notes available' };
    if (syllableCount > noteCount) {
      return {
        type: 'error',
        message: `${syllableCount - noteCount} extra syllable${syllableCount - noteCount > 1 ? 's' : ''}`,
      };
    }
    if (syllableCount < noteCount) {
      return {
        type: 'info',
        message: `${noteCount - syllableCount} melismatic note${noteCount - syllableCount > 1 ? 's' : ''}`,
      };
    }
    return { type: 'success', message: 'Perfect fit' };
  };

  const ratioStatus = getRatioStatus();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.voiceLabel}>{VOICE_LABELS[voice]}</span>
        <div className={styles.modeSelector}>
          <button
            className={`${styles.modeButton} ${mode === 'syllabic' ? styles.active : ''}`}
            onClick={() => handleModeChange('syllabic')}
            title="One syllable per note"
          >
            Syllabic
          </button>
          <button
            className={`${styles.modeButton} ${mode === 'melismatic' ? styles.active : ''}`}
            onClick={() => handleModeChange('melismatic')}
            title="Extend syllables across multiple notes"
          >
            Melismatic
          </button>
          <button
            className={`${styles.modeButton} ${mode === 'neumatic' ? styles.active : ''}`}
            onClick={() => handleModeChange('neumatic')}
            title="Groups of 2-4 notes per syllable"
          >
            Neumatic
          </button>
        </div>
      </div>

      <div className={`${styles.inputWrapper} ${isFocused ? styles.focused : ''}`}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={inputText}
          onChange={handleTextChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Enter lyrics (use hyphens for syllables: glo-ri-a)"
          rows={2}
        />
        {inputText && (
          <button
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear text"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <AnimatePresence>
        {syllables.length > 0 && (
          <motion.div
            className={styles.preview}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className={styles.previewHeader}>
              <span className={styles.previewLabel}>Syllables:</span>
              <span className={styles.syllableCount}>
                {syllableCount} syllable{syllableCount !== 1 ? 's' : ''}
                {noteCount > 0 && ` / ${noteCount} note${noteCount !== 1 ? 's' : ''}`}
              </span>
            </div>
            <div className={styles.syllablePreview}>{syllablePreview}</div>
            {ratioStatus && (
              <div className={`${styles.ratioStatus} ${styles[ratioStatus.type]}`}>
                {ratioStatus.message}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.helpText}>
        <span>Tips: Use hyphens for syllables (hal-le-lu-jah), underscore _ for melisma</span>
      </div>
    </div>
  );
}
