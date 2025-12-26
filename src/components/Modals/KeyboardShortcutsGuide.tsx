import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShortcutsStore } from '../../store/shortcuts-store';
import styles from './KeyboardShortcutsGuide.module.css';

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const modifierKey = isMac ? '⌘' : 'Ctrl';

interface Shortcut {
  keys: string;
  description: string;
}

interface ShortcutSection {
  title: string;
  shortcuts: Shortcut[];
}

const shortcutSections: ShortcutSection[] = [
  {
    title: 'Playback',
    shortcuts: [
      { keys: 'Space', description: 'Play/Pause' },
      { keys: 'Shift + Space', description: 'Stop (return to start)' },
    ],
  },
  {
    title: 'Editing',
    shortcuts: [
      { keys: `${modifierKey} + Z`, description: 'Undo' },
      { keys: `${modifierKey} + Shift + Z`, description: 'Redo' },
      { keys: `${modifierKey} + D`, description: 'Duplicate selected' },
      { keys: 'Delete / Backspace', description: 'Delete selected' },
      { keys: `${modifierKey} + A`, description: 'Select all' },
      { keys: 'Esc', description: 'Clear selection' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: 'Arrow Keys', description: 'Move selected 1px' },
      { keys: 'Shift + Arrow Keys', description: 'Move selected 10px (fast)' },
      { keys: 'Tab', description: 'Next chord' },
      { keys: 'Shift + Tab', description: 'Previous chord' },
    ],
  },
  {
    title: 'Canvas',
    shortcuts: [
      { keys: `${modifierKey} + +`, description: 'Zoom in' },
      { keys: `${modifierKey} + -`, description: 'Zoom out' },
      { keys: `${modifierKey} + 0`, description: 'Reset zoom' },
      { keys: `${modifierKey} + L`, description: 'Toggle connection lines' },
    ],
  },
  {
    title: 'File',
    shortcuts: [
      { keys: `${modifierKey} + S`, description: 'Save progression' },
      { keys: `${modifierKey} + E`, description: 'Export MIDI' },
      { keys: `${modifierKey} + N`, description: 'New (clear canvas)' },
    ],
  },
  {
    title: 'Help',
    shortcuts: [
      { keys: '?', description: 'Show this guide' },
    ],
  },
];

export const KeyboardShortcutsGuide: React.FC = () => {
  const { isGuideOpen, closeGuide } = useShortcutsStore();

  // Add Escape key listener to close modal
  useEffect(() => {
    if (!isGuideOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeGuide();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isGuideOpen, closeGuide]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {isGuideOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeGuide}
          />
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', duration: 0.3 }}
          >
            <div className={styles.header}>
              <h2>Keyboard Shortcuts</h2>
              <button className={styles.closeButton} onClick={closeGuide}>
                ×
              </button>
            </div>

            <div className={styles.content}>
              {shortcutSections.map((section, index) => (
                <div key={index} className={styles.section}>
                  <h3 className={styles.sectionTitle}>{section.title}</h3>
                  <div className={styles.shortcutList}>
                    {section.shortcuts.map((shortcut, shortcutIndex) => (
                      <div key={shortcutIndex} className={styles.shortcutRow}>
                        <kbd className={styles.keys}>{shortcut.keys}</kbd>
                        <span className={styles.description}>{shortcut.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <button className={styles.printButton} onClick={handlePrint}>
                🖨 Download Printable Reference
              </button>
              <button className={styles.closeButtonFooter} onClick={closeGuide}>
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
