import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './KeyboardShortcutsGuide.module.css';

interface KeyboardShortcutsGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsGuide: React.FC<KeyboardShortcutsGuideProps> = ({
  isOpen,
  onClose,
}) => {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const mod = isMac ? '⌘' : 'Ctrl';

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const shortcuts = [
    {
      category: 'Playback',
      items: [
        { keys: 'Space', description: 'Play / Pause' },
        { keys: 'Shift + Space', description: 'Stop (return to start)' },
      ]
    },
    {
      category: 'Editing',
      items: [
        { keys: `${mod} + Z`, description: 'Undo' },
        { keys: `${mod} + Shift + Z`, description: 'Redo' },
        { keys: `${mod} + D`, description: 'Duplicate selected' },
        { keys: 'Delete / Backspace', description: 'Delete selected' },
        { keys: `${mod} + A`, description: 'Select all' },
        { keys: 'Escape', description: 'Clear selection' },
      ]
    },
    {
      category: 'Navigation',
      items: [
        { keys: '← →', description: 'Move selected 0.25 beats' },
        { keys: 'Shift + ← →', description: 'Move selected 1 beat' },
        { keys: '↑ ↓', description: 'Adjust tempo (±1 BPM)' },
        { keys: 'Shift + ↑ ↓', description: 'Adjust tempo (±10 BPM)' },
      ]
    },
    {
      category: 'Analysis',
      items: [
        { keys: `${mod} + Shift + A`, description: 'Open Analyze modal' },
      ]
    },
    {
      category: 'Help',
      items: [
        { keys: '? / Shift + /', description: 'Show this guide' },
      ]
    },
  ];

  return (
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
              <h2>Keyboard Shortcuts</h2>
              <button className={styles.closeButton} onClick={onClose}>×</button>
            </div>
            <div className={styles.content}>
              {shortcuts.map(section => (
                <div key={section.category} className={styles.section}>
                  <h3>{section.category}</h3>
                  <div className={styles.shortcuts}>
                    {section.items.map(item => (
                      <div key={item.keys} className={styles.shortcut}>
                        <kbd className={styles.keys}>{item.keys}</kbd>
                        <span className={styles.description}>{item.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
