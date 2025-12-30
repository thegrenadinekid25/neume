import React from 'react';
import { motion } from 'framer-motion';
import styles from './SnapshotCameraButton.module.css';

interface SnapshotCameraButtonProps {
  hasSelection: boolean;
  onSaveSnapshot: () => void;
}

export const SnapshotCameraButton: React.FC<SnapshotCameraButtonProps> = ({
  hasSelection,
  onSaveSnapshot,
}) => {
  const handleClick = () => {
    if (hasSelection) {
      onSaveSnapshot();
    }
  };

  return (
    <motion.button
      className={`${styles.cameraButton} ${hasSelection ? styles.hasSelection : ''}`}
      onClick={handleClick}
      title={hasSelection ? 'Save selection as snapshot' : 'Select chords first'}
      aria-label="Save snapshot"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={!hasSelection}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    </motion.button>
  );
};
