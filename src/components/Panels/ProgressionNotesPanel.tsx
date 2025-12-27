import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnnotationsStore } from '@/store/annotations-store';
import type { ProgressionAnnotationType } from '@/types/progression';
import styles from './ProgressionNotesPanel.module.css';

interface ProgressionNotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_LABELS: Record<ProgressionAnnotationType, string> = {
  intent: 'Intent',
  context: 'Context',
  history: 'History',
  general: 'General',
};

const TYPE_COLORS: Record<ProgressionAnnotationType, string> = {
  intent: '#8b5cf6',   // Purple
  context: '#3b82f6',  // Blue
  history: '#f59e0b',  // Amber
  general: '#6b7280',  // Gray
};

const ANNOTATION_TYPES: ProgressionAnnotationType[] = ['intent', 'context', 'history', 'general'];

/**
 * ProgressionNotesPanel Component
 * Side panel for managing progression-level annotations and notes
 * Slides in from the right side with semi-transparent overlay
 */
export function ProgressionNotesPanel({ isOpen, onClose }: ProgressionNotesPanelProps) {
  const {
    progressionAnnotations,
    addProgressionAnnotation,
    updateProgressionAnnotation,
    removeProgressionAnnotation,
  } = useAnnotationsStore();

  // Filter state
  const [activeFilter, setActiveFilter] = useState<ProgressionAnnotationType | 'all'>('all');

  // Form state
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState<ProgressionAnnotationType>('general');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Filter annotations based on selected type
  const filteredAnnotations = useMemo(() => {
    if (activeFilter === 'all') {
      return progressionAnnotations;
    }
    return progressionAnnotations.filter((a) => a.type === activeFilter);
  }, [progressionAnnotations, activeFilter]);

  // Handle adding a new annotation
  const handleAddAnnotation = () => {
    if (newText.trim()) {
      addProgressionAnnotation(newText, newType);
      setNewText('');
      setNewType('general');
    }
  };

  // Handle starting edit
  const handleStartEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  // Handle saving edit
  const handleSaveEdit = (id: string) => {
    if (editingText.trim()) {
      updateProgressionAnnotation(id, { text: editingText });
    }
    setEditingId(null);
    setEditingText('');
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  // Handle deleting annotation
  const handleDelete = (id: string) => {
    removeProgressionAnnotation(id);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (editingId) {
        handleCancelEdit();
      } else {
        onClose();
      }
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

          {/* Panel */}
          <motion.div
            className={styles.panel}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            role="complementary"
            aria-modal="false"
            aria-labelledby="progression-notes-title"
            onKeyDown={handleKeyDown}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerContent}>
                <h2 id="progression-notes-title" className={styles.title}>
                  Progression Notes
                </h2>
                <p className={styles.subtitle}>
                  Track intent, context, and history
                </p>
              </div>
              <button
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close panel"
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Main content */}
            <div className={styles.content}>
              {/* Filter tabs */}
              <div className={styles.filterTabs}>
                <button
                  className={`${styles.filterTab} ${activeFilter === 'all' ? styles.active : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  All
                </button>
                {ANNOTATION_TYPES.map((type) => (
                  <button
                    key={type}
                    className={`${styles.filterTab} ${activeFilter === type ? styles.active : ''}`}
                    onClick={() => setActiveFilter(type)}
                    style={{
                      borderBottomColor: activeFilter === type ? TYPE_COLORS[type] : undefined,
                    }}
                  >
                    {TYPE_LABELS[type]}
                  </button>
                ))}
              </div>

              {/* Annotations list */}
              <div className={styles.annotationsList}>
                {filteredAnnotations.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>
                      {activeFilter === 'all'
                        ? 'No notes yet. Add one below to get started.'
                        : `No ${TYPE_LABELS[activeFilter as ProgressionAnnotationType].toLowerCase()} notes yet.`}
                    </p>
                  </div>
                ) : (
                  <div className={styles.annotationsContainer}>
                    {filteredAnnotations.map((annotation) => (
                      <div key={annotation.id} className={styles.annotationItem}>
                        <div
                          className={styles.typeBadge}
                          style={{ backgroundColor: TYPE_COLORS[annotation.type] }}
                          title={TYPE_LABELS[annotation.type]}
                        >
                          {TYPE_LABELS[annotation.type].substring(0, 1)}
                        </div>

                        <div className={styles.annotationContent}>
                          {editingId === annotation.id ? (
                            <div className={styles.editForm}>
                              <textarea
                                className={styles.editInput}
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                placeholder="Edit note..."
                                autoFocus
                              />
                              <div className={styles.editActions}>
                                <button
                                  className={`${styles.editButton} ${styles.save}`}
                                  onClick={() => handleSaveEdit(annotation.id)}
                                >
                                  Save
                                </button>
                                <button
                                  className={`${styles.editButton} ${styles.cancel}`}
                                  onClick={handleCancelEdit}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p
                                className={styles.annotationText}
                                onClick={() =>
                                  handleStartEdit(annotation.id, annotation.text)
                                }
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleStartEdit(annotation.id, annotation.text);
                                  }
                                }}
                              >
                                {annotation.text}
                              </p>
                              {annotation.position !== undefined && (
                                <p className={styles.positionLabel}>
                                  Beat {annotation.position}
                                </p>
                              )}
                            </>
                          )}
                        </div>

                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(annotation.id)}
                          aria-label="Delete note"
                          title="Delete note"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add new annotation form */}
              <div className={styles.addForm}>
                <div className={styles.formSection}>
                  <label htmlFor="annotation-type" className={styles.label}>
                    Type
                  </label>
                  <select
                    id="annotation-type"
                    className={styles.typeSelect}
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ProgressionAnnotationType)}
                  >
                    {ANNOTATION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formSection}>
                  <label htmlFor="annotation-text" className={styles.label}>
                    Note
                  </label>
                  <textarea
                    id="annotation-text"
                    className={styles.textInput}
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Add a note about this progression..."
                    rows={3}
                  />
                </div>

                <button
                  className={styles.addButton}
                  onClick={handleAddAnnotation}
                  disabled={!newText.trim()}
                >
                  Add Note
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
