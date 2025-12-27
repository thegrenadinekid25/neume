import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './DeleteConfirmation.module.css';

interface DeleteConfirmationProps {
  isOpen: boolean;
  chordCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  chordCount,
  onConfirm,
  onCancel,
}) => {
  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            aria-describedby="delete-description"
          >
            <h3 id="delete-title">Delete {chordCount} chords?</h3>
            <p id="delete-description">You can undo this with Cmd/Ctrl+Z.</p>

            <div className={styles.buttons}>
              <button
                className={styles.cancelButton}
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                className={styles.deleteButton}
                onClick={onConfirm}
                autoFocus
              >
                Delete
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
