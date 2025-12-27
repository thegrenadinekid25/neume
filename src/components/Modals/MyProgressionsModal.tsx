import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgressionsStore } from '@/store/progressions-store';
import { progressionStorage } from '@/services/progression-storage';
import { SaveProgressionDialog } from './SaveProgressionDialog';
import type { SavedProgression } from '@/types';
import styles from './MyProgressionsModal.module.css';

/**
 * Modal for browsing, loading, and managing saved progressions
 * Displays saved progressions with search, filtering, and action buttons
 */
export const MyProgressionsModal: React.FC = () => {
  const {
    isModalOpen,
    closeModal,
    saveProgression,
    deleteProgression,
    toggleFavorite,
    currentFilter,
    setFilter,
    searchQuery,
    setSearchQuery,
    getFilteredProgressions,
  } = useProgressionsStore();

  const [editingProgression, setEditingProgression] =
    useState<SavedProgression | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Inline notes editing state
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [editingNotesValue, setEditingNotesValue] = useState('');

  // Get filtered progressions
  const filteredProgressions = getFilteredProgressions();

  // Get storage usage
  const storageUsage = progressionStorage.getLocalStorageUsage();
  const showStorageWarning = storageUsage.percentage > 80;

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal]);

  // Handle edit progression
  const handleEditProgression = (progression: SavedProgression) => {
    setEditingProgression(progression);
    setShowEditDialog(true);
  };

  // Handle save edited progression
  const handleSaveEditedProgression = (progression: SavedProgression) => {
    saveProgression(progression);
    setShowEditDialog(false);
    setEditingProgression(null);
  };

  // Handle load progression (close modal and trigger load in canvas store)
  const handleLoadProgression = (progression: SavedProgression) => {
    // Dispatch custom event to load progression
    window.dispatchEvent(
      new CustomEvent('loadProgression', { detail: progression })
    );
    closeModal();
  };

  // Handle inline notes editing
  const handleStartEditingNotes = (progression: SavedProgression) => {
    setEditingNotesId(progression.id);
    setEditingNotesValue(progression.notes || '');
  };

  const handleSaveNotes = (progression: SavedProgression) => {
    const updatedProgression: SavedProgression = {
      ...progression,
      notes: editingNotesValue.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    saveProgression(updatedProgression);
    setEditingNotesId(null);
    setEditingNotesValue('');
  };

  const handleCancelEditingNotes = () => {
    setEditingNotesId(null);
    setEditingNotesValue('');
  };

  // Handle export to MIDI
  const handleExportMIDI = (progression: SavedProgression) => {
    // Create a simple MIDI export by downloading JSON for now
    // In a real implementation, this would use a MIDI library like jsmidgen
    const dataUri =
      'data:application/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(progression, null, 2));

    const link = document.createElement('a');
    link.download = `${progression.title.replace(/\s+/g, '-')}.json`;
    link.href = dataUri;
    link.click();
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format storage usage
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const content = (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeModal}
          />

          {/* Modal */}
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="my-progressions-title"
          >
            {/* Header */}
            <div className={styles.header}>
              <h2 id="my-progressions-title">My Progressions</h2>
              <button
                className={styles.closeButton}
                onClick={closeModal}
                aria-label="Close modal"
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Search and Filter Bar */}
            <div className={styles.controls}>
              {/* Search input */}
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search progressions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search progressions"
                />
                {searchQuery && (
                  <button
                    className={styles.clearButton}
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter tabs */}
              <div className={styles.filterTabs}>
                <button
                  className={`${styles.filterTab} ${currentFilter === 'all' ? styles.active : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  className={`${styles.filterTab} ${currentFilter === 'favorites' ? styles.active : ''}`}
                  onClick={() => setFilter('favorites')}
                >
                  Favorites
                </button>
                <button
                  className={`${styles.filterTab} ${currentFilter === 'recent' ? styles.active : ''}`}
                  onClick={() => setFilter('recent')}
                >
                  Recent
                </button>
              </div>
            </div>

            {/* Content area */}
            <div className={styles.content} ref={scrollContainerRef}>
              {filteredProgressions.length > 0 ? (
                <div className={styles.progressionsList}>
                  {filteredProgressions.map((progression) => (
                    <motion.div
                      key={progression.id}
                      className={styles.progressionCard}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Card header with favorite star */}
                      <div className={styles.cardHeader}>
                        <h3 className={styles.progressionTitle}>
                          {progression.title}
                        </h3>
                        <button
                          className={`${styles.favoriteButton} ${progression.isFavorite ? styles.isFavorite : ''}`}
                          onClick={() => toggleFavorite(progression.id)}
                          aria-label={
                            progression.isFavorite
                              ? 'Remove from favorites'
                              : 'Add to favorites'
                          }
                          title={
                            progression.isFavorite
                              ? 'Remove from favorites'
                              : 'Add to favorites'
                          }
                        >
                          ★
                        </button>
                      </div>

                      {/* Card metadata */}
                      <div className={styles.metadata}>
                        <span className={styles.metadataItem}>
                          {progression.key} {progression.mode}
                        </span>
                        <span className={styles.metadataItem}>
                          {progression.tempo} BPM
                        </span>
                        <span className={styles.metadataItem}>
                          {progression.chords.length} chords
                        </span>
                      </div>

                      {/* Composer info (if from analysis) */}
                      {progression.analyzedFrom?.composer && (
                        <div className={styles.composerInfo}>
                          <span className={styles.composerLabel}>From:</span>
                          <span className={styles.composerName}>
                            {progression.analyzedFrom.title}
                          </span>
                          <span className={styles.composerBy}>
                            by {progression.analyzedFrom.composer}
                          </span>
                        </div>
                      )}

                      {/* Tags */}
                      {progression.tags.length > 0 && (
                        <div className={styles.tags}>
                          {progression.tags.map((tag) => (
                            <span key={tag} className={styles.tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Notes section */}
                      <div className={styles.notesSection}>
                        {editingNotesId === progression.id ? (
                          // Inline editing mode
                          <div className={styles.notesEditing}>
                            <textarea
                              className={styles.notesTextarea}
                              value={editingNotesValue}
                              onChange={(e) => setEditingNotesValue(e.target.value)}
                              placeholder="Add notes about this progression..."
                              rows={3}
                              autoFocus
                            />
                            <div className={styles.notesEditActions}>
                              <button
                                className={styles.notesSaveButton}
                                onClick={() => handleSaveNotes(progression)}
                              >
                                Save
                              </button>
                              <button
                                className={styles.notesCancelButton}
                                onClick={handleCancelEditingNotes}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Display mode
                          <div
                            className={styles.notesDisplay}
                            onClick={() => handleStartEditingNotes(progression)}
                            title="Click to edit notes"
                          >
                            {progression.notes ? (
                              <p className={styles.notesText}>{progression.notes}</p>
                            ) : (
                              <p className={styles.notesPlaceholder}>
                                Click to add notes...
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Saved date */}
                      <div className={styles.date}>
                        Saved: {formatDate(progression.createdAt)}
                      </div>

                      {/* Action buttons */}
                      <div className={styles.actions}>
                        <button
                          className={`${styles.actionButton} ${styles.loadButton}`}
                          onClick={() => handleLoadProgression(progression)}
                          title="Load this progression"
                        >
                          Load
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.editButton}`}
                          onClick={() => handleEditProgression(progression)}
                          title="Edit this progression"
                        >
                          Edit
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.exportButton}`}
                          onClick={() => handleExportMIDI(progression)}
                          title="Export to MIDI"
                        >
                          Export
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => deleteProgression(progression.id)}
                          title="Delete this progression"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🎼</div>
                  <div className={styles.emptyTitle}>No progressions saved</div>
                  <div className={styles.emptyText}>
                    {searchQuery
                      ? 'Try adjusting your search or filters'
                      : 'Start by creating or analyzing a progression'}
                  </div>
                </div>
              )}
            </div>

            {/* Storage warning */}
            {showStorageWarning && (
              <motion.div
                className={styles.storageWarning}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className={styles.warningIcon}>⚠</div>
                <div className={styles.warningText}>
                  <strong>Storage {storageUsage.percentage.toFixed(0)}% full</strong>
                  <br />
                  Consider exporting and deleting old progressions.
                </div>
                <div className={styles.storageDetails}>
                  {formatBytes(storageUsage.used)} /{' '}
                  {formatBytes(storageUsage.limit)}
                </div>
              </motion.div>
            )}

            {/* Footer */}
            <div className={styles.footer}>
              <button
                className={styles.closeFooterButton}
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {createPortal(content, document.body)}
      {editingProgression && (
        <SaveProgressionDialog
          progression={editingProgression}
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setEditingProgression(null);
          }}
          onSave={handleSaveEditedProgression}
        />
      )}
    </>
  );
};
