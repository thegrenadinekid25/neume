import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ChordAnnotationPopover.module.css';

export interface ChordAnnotationPopoverProps {
  isOpen: boolean;
  position: { x: number; y: number };
  initialNote: string;
  onSave: (note: string) => void;
  onCancel: () => void;
}

export const ChordAnnotationPopover: React.FC<ChordAnnotationPopoverProps> = ({
  isOpen,
  position,
  initialNote,
  onSave,
  onCancel,
}) => {
  const [note, setNote] = useState(initialNote);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Reset note when popover opens
  useEffect(() => {
    if (isOpen) {
      setNote(initialNote);
    }
  }, [isOpen, initialNote]);

  // Focus textarea when popover opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isOpen]);

  // Adjust position to stay in viewport
  useEffect(() => {
    if (!isOpen || !popoverRef.current) return;

    const popoverRect = popoverRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x;
    let y = position.y;

    // Adjust horizontal
    if (x + popoverRect.width > viewportWidth - 20) {
      x = viewportWidth - popoverRect.width - 20;
    }

    // Adjust vertical
    if (y + popoverRect.height > viewportHeight - 20) {
      y = viewportHeight - popoverRect.height - 20;
    }

    // Ensure not off-screen on left/top
    x = Math.max(20, x);
    y = Math.max(20, y);

    setAdjustedPosition({ x, y });
  }, [isOpen, position]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const trimmedNote = note.trim();
        onSave(trimmedNote);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, note, onCancel, onSave]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };

    // Delay to prevent immediate close from the same click
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onCancel]);

  const handleSave = () => {
    const trimmedNote = note.trim();
    onSave(trimmedNote);
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popoverRef}
          className={styles.popover}
          style={{
            left: `${adjustedPosition.x}px`,
            top: `${adjustedPosition.y}px`,
          }}
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          <div className={styles.header}>
            <span className={styles.title}>Annotation</span>
          </div>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note about this chord..."
            rows={3}
          />
          <div className={styles.footer}>
            <span className={styles.hint}>Cmd+Enter to save</span>
            <div className={styles.buttons}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.saveButton}
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!isOpen) return null;

  return createPortal(content, document.body);
};
