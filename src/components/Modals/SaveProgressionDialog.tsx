import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { SavedProgression } from '@/types';
import styles from './SaveProgressionDialog.module.css';

interface SaveProgressionDialogProps {
  progression: SavedProgression;
  isOpen: boolean;
  onClose: () => void;
  onSave: (progression: SavedProgression) => void;
}

/**
 * Dialog for saving/updating a chord progression
 * Allows user to set title, tags, and favorite status
 */
export const SaveProgressionDialog: React.FC<SaveProgressionDialogProps> = ({
  progression,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(progression.title);
  const [tagsInput, setTagsInput] = useState(progression.tags.join(', '));
  const [notes, setNotes] = useState(progression.notes || '');
  const [isFavorite, setIsFavorite] = useState(progression.isFavorite);
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTitle(progression.title);
      setTagsInput(progression.tags.join(', '));
      setNotes(progression.notes || '');
      setIsFavorite(progression.isFavorite);
    }
  }, [isOpen, progression]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, title, tagsInput, isFavorite]);

  // Validate title
  const titleError = !title.trim() ? 'Title is required' : '';
  const isValid = !titleError && title.trim().length > 0;

  // Handle save
  const handleSave = async () => {
    if (!isValid || isSaving) return;

    setIsSaving(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const updatedProgression: SavedProgression = {
        ...progression,
        title: title.trim(),
        tags,
        notes: notes.trim() || undefined,
        isFavorite,
        updatedAt: new Date().toISOString(),
      };

      onSave(updatedProgression);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            className={styles.dialog}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-dialog-title"
          >
            {/* Header */}
            <div className={styles.header}>
              <h2 id="save-dialog-title">Save Progression</h2>
              <button
                className={styles.closeButton}
                onClick={onClose}
                disabled={isSaving}
                aria-label="Close dialog"
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
              {/* Title input */}
              <div className={styles.formGroup}>
                <label htmlFor="progression-title" className={styles.label}>
                  Title
                </label>
                <input
                  id="progression-title"
                  type="text"
                  className={`${styles.input} ${titleError ? styles.error : ''}`}
                  placeholder="e.g., My Sacred Progression"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSaving}
                  aria-describedby={titleError ? 'title-error' : undefined}
                  autoFocus
                />
                {titleError && (
                  <div id="title-error" className={styles.errorText}>
                    {titleError}
                  </div>
                )}
              </div>

              {/* Tags input */}
              <div className={styles.formGroup}>
                <label htmlFor="progression-tags" className={styles.label}>
                  Tags
                </label>
                <input
                  id="progression-tags"
                  type="text"
                  className={styles.input}
                  placeholder="e.g., ethereal, Lauridsen-style (comma-separated)"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  disabled={isSaving}
                />
                <div className={styles.helpText}>
                  Separate tags with commas for easy searching
                </div>
              </div>

              {/* Notes textarea */}
              <div className={styles.formGroup}>
                <label htmlFor="progression-notes" className={styles.label}>
                  Notes
                </label>
                <textarea
                  id="progression-notes"
                  className={styles.textarea}
                  placeholder="Add notes about this progression..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isSaving}
                  rows={3}
                />
                <div className={styles.helpText}>
                  Personal notes, inspiration, or context for this progression
                </div>
              </div>

              {/* Analyzed from metadata */}
              {progression.analyzedFrom && (
                <div className={styles.analyzedInfo}>
                  <div className={styles.analyzedLabel}>Analyzed from</div>
                  <div className={styles.analyzedContent}>
                    <span className={styles.analyzedTitle}>
                      {progression.analyzedFrom.title}
                    </span>
                    {progression.analyzedFrom.composer && (
                      <span className={styles.analyzedComposer}>
                        by {progression.analyzedFrom.composer}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Favorite checkbox */}
              <div className={styles.checkboxGroup}>
                <label htmlFor="is-favorite" className={styles.checkboxLabel}>
                  <input
                    id="is-favorite"
                    type="checkbox"
                    className={styles.checkbox}
                    checked={isFavorite}
                    onChange={(e) => setIsFavorite(e.target.checked)}
                    disabled={isSaving}
                  />
                  <span>Add to favorites</span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <button
                className={styles.cancelButton}
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className={styles.saveButton}
                onClick={handleSave}
                disabled={!isValid || isSaving}
              >
                {isSaving ? (
                  <>
                    <div className={styles.spinner} />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
