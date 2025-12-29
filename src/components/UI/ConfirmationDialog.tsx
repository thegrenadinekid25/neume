import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useConfirmationStore } from '@/store/confirmation-store';
import styles from './ConfirmationDialog.module.css';

export const ConfirmationDialog: React.FC = () => {
  const { isOpen, options, confirm, cancel } = useConfirmationStore();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (options?.variant === 'alert') {
          confirm();
        } else {
          cancel();
        }
      } else if (e.key === 'Enter') {
        confirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, options?.variant, confirm, cancel]);

  const isAlertOnly = options?.variant === 'alert';
  const isDestructive = options?.variant === 'destructive';

  const content = (
    <AnimatePresence>
      {isOpen && options && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isAlertOnly ? confirm : cancel}
          />

          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
            aria-describedby="confirmation-description"
          >
            <h3 id="confirmation-title">{options.title}</h3>
            <p id="confirmation-description">{options.message}</p>

            <div className={styles.buttons}>
              {!isAlertOnly && (
                <button
                  className={styles.cancelButton}
                  onClick={cancel}
                >
                  {options.cancelLabel}
                </button>
              )}
              <button
                className={`${styles.confirmButton} ${isDestructive ? styles.destructive : ''}`}
                onClick={confirm}
                autoFocus
              >
                {options.confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
