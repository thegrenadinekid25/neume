import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceChordConflictStore } from '@/store/voice-chord-conflict-store';
import { Note } from 'tonal';
import styles from '../UI/ConfirmationDialog.module.css';

export const ChordConflictDialog: React.FC = () => {
  const {
    isDialogOpen,
    pendingConflict,
    resolveWithChordChange,
    resolveKeepAsTension,
    resolveCancel,
  } = useVoiceChordConflictStore();

  useEffect(() => {
    if (!isDialogOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resolveCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDialogOpen, resolveCancel]);

  if (!pendingConflict || !isDialogOpen) {
    return null;
  }

  const { result, newMidi } = pendingConflict;
  const notePitch = Note.fromMidi(newMidi);
  const suggestedChordName = result.suggestedChordName || 'different chord';
  const severity = result.severity || 'warning';

  const getTitle = () => {
    switch (result.conflictType) {
      case 'strong-beat-non-chord':
        return 'Strong Beat Conflict';
      case 'root-third-implication':
        return 'Harmonic Tension Detected';
      case 'tension-tone-mismatch':
        return 'Tension on Strong Beat';
      default:
        return 'Harmonic Conflict';
    }
  };

  const getMessage = () => {
    switch (result.conflictType) {
      case 'strong-beat-non-chord':
        return `The note ${notePitch} on a strong beat is not a chord tone in ${result.originalChordName}. This creates an unresolved dissonance.`;
      case 'root-third-implication':
        return `The note ${notePitch} suggests a ${suggestedChordName} tonality. Consider changing the chord to match this harmonic implication.`;
      case 'tension-tone-mismatch':
        return `The note ${notePitch} creates tension on a strong beat in ${result.originalChordName}. This may feel unresolved.`;
      default:
        return result.description || 'A harmonic conflict was detected. How would you like to resolve it?';
    }
  };

  const content = (
    <AnimatePresence>
      {isDialogOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resolveCancel}
          />

          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="conflict-title"
            aria-describedby="conflict-description"
          >
            <h3 id="conflict-title">{getTitle()}</h3>
            <p id="conflict-description">{getMessage()}</p>

            <div className={styles.buttons}>
              {/* Cancel button - always available */}
              <button
                className={styles.cancelButton}
                onClick={resolveCancel}
              >
                Cancel
              </button>

              {/* Keep as tension button - secondary action */}
              <button
                className={styles.secondaryButton}
                onClick={resolveKeepAsTension}
                style={{
                  backgroundColor: 'rgba(100, 100, 100, 0.1)',
                  color: 'var(--text-secondary)',
                }}
              >
                Keep as Tension
              </button>

              {/* Change chord button - primary action */}
              {result.suggestedChordName && (
                <button
                  className={`${styles.confirmButton} ${severity === 'error' ? styles.destructive : ''}`}
                  onClick={() => resolveWithChordChange()}
                  autoFocus
                >
                  Change to {result.suggestedChordName}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
