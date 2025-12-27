import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChordAnnotation, ChordAnnotationType } from '@/types/chord';
import styles from './ChordAnnotationPopover.module.css';

export interface ChordAnnotationPopoverProps {
  isOpen: boolean;
  position: { x: number; y: number };
  annotations: ChordAnnotation[];
  onAddAnnotation: (text: string) => void;
  onUpdateAnnotation: (text: string) => void;
  onDeleteAnnotation: () => void;
  onClose: () => void;
}

const TYPE_OPTIONS: { value: ChordAnnotationType; label: string; color: string }[] = [
  { value: 'note', label: 'Note', color: '#6b7280' },
  { value: 'performance', label: 'Performance', color: '#8b5cf6' },
  { value: 'theory', label: 'Theory', color: '#3b82f6' },
  { value: 'reference', label: 'Reference', color: '#10b981' },
];

export const ChordAnnotationPopover: React.FC<ChordAnnotationPopoverProps> = ({
  isOpen,
  position,
  annotations,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onClose,
}) => {
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState<ChordAnnotationType>('note');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editType, setEditType] = useState<ChordAnnotationType>('note');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Focus textarea when opening new annotation input
  useEffect(() => {
    if (isOpen && textareaRef.current && !editingId) {
      textareaRef.current.focus();
    }
  }, [isOpen, editingId]);

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
        if (editingId) {
          setEditingId(null);
        } else {
          onClose();
        }
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (editingId) {
          handleUpdateAnnotation();
        } else {
          handleAddAnnotation();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, newText, newType, editingId, editText, editType]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
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
  }, [isOpen, onClose]);

  const handleAddAnnotation = () => {
    const trimmedText = newText.trim();
    if (trimmedText) {
      onAddAnnotation(trimmedText);
      setNewText('');
      setNewType('note');
    }
  };

  const startEditing = (annotation: ChordAnnotation) => {
    setEditingId(annotation.id);
    setEditText(annotation.text);
    setEditType(annotation.type);
  };

  const handleUpdateAnnotation = () => {
    const trimmedText = editText.trim();
    if (trimmedText && editingId) {
      onUpdateAnnotation(trimmedText);
      setEditingId(null);
      setEditText('');
      setEditType('note');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditType('note');
  };

  const getTypeColor = (type: ChordAnnotationType) => {
    return TYPE_OPTIONS.find(opt => opt.value === type)?.color || '#6b7280';
  };

  const getTypeLabel = (type: ChordAnnotationType) => {
    return TYPE_OPTIONS.find(opt => opt.value === type)?.label || 'Note';
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
            <span className={styles.title}>Chord Annotations</span>
          </div>

          {/* Annotations List */}
          {annotations.length > 0 && (
            <div className={styles.annotationsList}>
              {annotations.map((annotation) => (
                <div key={annotation.id} className={styles.annotationItem}>
                  {editingId === annotation.id ? (
                    // Edit Mode
                    <div className={styles.editMode}>
                      <div className={styles.typeSelector}>
                        {TYPE_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            className={`${styles.typePill} ${editType === option.value ? styles.typePillActive : ''}`}
                            onClick={() => setEditType(option.value)}
                            style={editType === option.value ? { backgroundColor: option.color, color: 'white' } : undefined}
                            title={option.label}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      <textarea
                        ref={textareaRef}
                        className={styles.editTextarea}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={2}
                      />
                      <div className={styles.editButtons}>
                        <button
                          className={styles.cancelButton}
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                        <button
                          className={styles.saveButton}
                          onClick={handleUpdateAnnotation}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className={styles.annotationContent}>
                        <span
                          className={styles.typeBadge}
                          style={{ backgroundColor: getTypeColor(annotation.type) }}
                        >
                          {getTypeLabel(annotation.type)}
                        </span>
                        <p className={styles.annotationText}>{annotation.text}</p>
                      </div>
                      <div className={styles.annotationActions}>
                        <button
                          className={styles.editButton}
                          onClick={() => startEditing(annotation)}
                          title="Edit annotation"
                        >
                          Edit
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => onDeleteAnnotation()}
                          title="Delete annotation"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Divider */}
          {annotations.length > 0 && <div className={styles.divider} />}

          {/* Add New Annotation */}
          {editingId === null && (
            <div className={styles.addAnnotationSection}>
              <div className={styles.typeSelector}>
                {TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`${styles.typePill} ${newType === option.value ? styles.typePillActive : ''}`}
                    onClick={() => setNewType(option.value)}
                    style={newType === option.value ? { backgroundColor: option.color, color: 'white' } : undefined}
                    title={option.label}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Add a new annotation..."
                rows={3}
              />
              <div className={styles.footer}>
                <span className={styles.hint}>Cmd+Enter to save</span>
                <div className={styles.buttons}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={onClose}
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    className={styles.saveButton}
                    onClick={handleAddAnnotation}
                    disabled={!newText.trim()}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!isOpen) return null;

  return createPortal(content, document.body);
};
