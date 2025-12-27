import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { ExpertModeProgress } from '@/components/UI/ExpertModeProgress';
import { ExpertModeToggle } from '@/components/UI/ExpertModeToggle';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>Settings</h2>
              <button
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close settings"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.content}>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Expert Mode</h3>
                <p className={styles.sectionDescription}>
                  Unlock advanced chord types as you use the app. Expert mode gives you access to extended chords (9ths, 11ths, 13ths) and altered dominants.
                </p>
                <div className={styles.expertModeContainer}>
                  <ExpertModeProgress />
                  <ExpertModeToggle />
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
