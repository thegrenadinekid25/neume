import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Chord, MusicalKey, Mode, SnapshotChord, SnapshotSource } from '@/types';
import { useSnapshotsStore } from '@/store/snapshots-store';
import { SnapshotPreview } from '@/components/Panels/SnapshotPreview';
import styles from './SaveSnapshotDialog.module.css';

interface SaveSnapshotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chordsToSave: Chord[];
  currentKey: MusicalKey;
  currentMode: Mode;
  currentTempo: number;
  source: SnapshotSource;
}

function generateSnapshotName(chords: SnapshotChord[]): string {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

  return chords
    .map((chord) => {
      let numeral = romanNumerals[chord.scaleDegree - 1] || 'I';

      // Minor quality uses lowercase
      if (chord.quality === 'minor' || chord.quality.includes('min')) {
        numeral = numeral.toLowerCase();
      }

      return numeral;
    })
    .join(' - ');
}

export const SaveSnapshotDialog: React.FC<SaveSnapshotDialogProps> = ({
  isOpen,
  onClose,
  chordsToSave,
  currentKey,
  currentMode,
  currentTempo,
  source,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { saveSnapshot } = useSnapshotsStore();

  // Generate snapshot chords with relative beats
  const snapshotChords: SnapshotChord[] = chordsToSave.map((chord) => {
    const firstBeat = chordsToSave[0]?.startBeat || 0;
    return {
      scaleDegree: chord.scaleDegree,
      quality: chord.quality,
      extensions: chord.extensions,
      duration: chord.duration,
      voices: chord.voices,
      relativeBeat: chord.startBeat - firstBeat,
    };
  });

  // Auto-generate name on first render
  useEffect(() => {
    if (isOpen && !name && snapshotChords.length > 0) {
      setName(generateSnapshotName(snapshotChords));
    }
  }, [isOpen, name, snapshotChords]);

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      saveSnapshot({
        name: name.trim(),
        description: description.trim() || undefined,
        chords: snapshotChords,
        originalKey: currentKey,
        originalMode: currentMode,
        originalTempo: currentTempo,
        source,
        tags,
        isFavorite: false,
      });

      handleClose();
    } catch (error) {
      console.error('Failed to save snapshot:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setTagsInput('');
    onClose();
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            className={styles.dialog}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-snapshot-title"
          >
            {/* Header */}
            <div className={styles.header}>
              <h2 id="save-snapshot-title" className={styles.title}>
                Save as Snapshot
              </h2>
              <button
                className={styles.closeButton}
                onClick={handleClose}
                aria-label="Close dialog"
                disabled={isLoading}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
              {/* Preview */}
              <div className={styles.previewSection}>
                <label className={styles.sectionLabel}>Preview</label>
                <SnapshotPreview chords={snapshotChords} />
              </div>

              {/* Form */}
              <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                {/* Name */}
                <div className={styles.formGroup}>
                  <label htmlFor="snapshot-name" className={styles.label}>
                    Name
                  </label>
                  <input
                    id="snapshot-name"
                    type="text"
                    className={styles.input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., I - IV - V"
                    disabled={isLoading}
                  />
                </div>

                {/* Description */}
                <div className={styles.formGroup}>
                  <label htmlFor="snapshot-description" className={styles.label}>
                    Description (optional)
                  </label>
                  <textarea
                    id="snapshot-description"
                    className={styles.textarea}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add notes about this snapshot..."
                    rows={3}
                    disabled={isLoading}
                  />
                </div>

                {/* Tags */}
                <div className={styles.formGroup}>
                  <label htmlFor="snapshot-tags" className={styles.label}>
                    Tags (comma-separated)
                  </label>
                  <input
                    id="snapshot-tags"
                    type="text"
                    className={styles.input}
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g., jazz, ii-V, emotional"
                    disabled={isLoading}
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <button
                className={styles.cancelButton}
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className={styles.saveButton}
                onClick={handleSave}
                disabled={isLoading || !name.trim()}
              >
                {isLoading ? 'Saving...' : 'Save Snapshot'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
