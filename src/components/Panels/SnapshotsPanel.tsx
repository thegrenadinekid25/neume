import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Snapshot } from '@/types';
import { useSnapshotsStore } from '@/store/snapshots-store';
import { useCanvasStore } from '@/store/canvas-store';
import { showSuccessToast } from '@/store/toast-store';
import { SnapshotCard } from './SnapshotCard';
import styles from './SnapshotsPanel.module.css';

/**
 * SnapshotsPanel - Slide-in panel for browsing and inserting snapshots
 * Features: search, filtering, favorites, drag-to-canvas
 */
export const SnapshotsPanel: React.FC = () => {
  const {
    isPanelOpen,
    snapshots,
    searchQuery,
    currentFilter,
    filterTags,
    isLoading,
    closePanel,
    loadSnapshots,
    setSearchQuery,
    setFilter,
    setFilterTags,
    getFilteredSnapshots,
    getAllTags,
    markAsUsed,
  } = useSnapshotsStore();

  const { addChord } = useCanvasStore();

  // Load snapshots when panel opens
  useEffect(() => {
    if (isPanelOpen) {
      loadSnapshots();
    }
  }, [isPanelOpen, loadSnapshots]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isPanelOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, closePanel]);

  // Handle inserting snapshot
  const handleInsert = useCallback(
    (snapshot: Snapshot) => {
      try {
        // Insert each chord from snapshot
        snapshot.chords.forEach((snapChord, index) => {
          addChord({
            scaleDegree: snapChord.scaleDegree,
            quality: snapChord.quality,
            extensions: snapChord.extensions,
            voices: snapChord.voices,
            duration: snapChord.duration,
            source: 'user',
            position: { x: 100 + index * 100, y: 200 },
          });
        });

        markAsUsed(snapshot.id);
        showSuccessToast(`Inserted "${snapshot.name}"`);
        closePanel();
      } catch (error) {
        console.error('Failed to insert snapshot:', error);
      }
    },
    [addChord, markAsUsed, closePanel]
  );

  const filteredSnapshots = getFilteredSnapshots();
  const allTags = getAllTags();

  const content = (
    <AnimatePresence>
      {isPanelOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closePanel}
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
            aria-labelledby="snapshots-panel-title"
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerContent}>
                <h2 id="snapshots-panel-title" className={styles.title}>
                  Snapshots
                </h2>
                <p className={styles.subtitle}>
                  {snapshots.length} saved {snapshots.length === 1 ? 'snapshot' : 'snapshots'}
                </p>
              </div>
              <button
                className={styles.closeButton}
                onClick={closePanel}
                aria-label="Close panel"
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Search Bar */}
            <div className={styles.searchSection}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search snapshots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Tabs */}
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

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div className={styles.tagFilter}>
                <div className={styles.tagLabel}>Tags:</div>
                <div className={styles.tags}>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      className={`${styles.tagButton} ${
                        filterTags.includes(tag) ? styles.selected : ''
                      }`}
                      onClick={() => {
                        setFilterTags(
                          filterTags.includes(tag)
                            ? filterTags.filter((t) => t !== tag)
                            : [...filterTags, tag]
                        );
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div className={styles.content}>
              {isLoading && (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner} />
                  <p>Loading snapshots...</p>
                </div>
              )}

              {!isLoading && filteredSnapshots.length === 0 && (
                <div className={styles.emptyState}>
                  {snapshots.length === 0 ? (
                    <>
                      <p className={styles.emptyMessage}>No snapshots yet</p>
                      <p className={styles.emptySubtext}>
                        Select chords and save them as snapshots for quick reuse
                      </p>
                    </>
                  ) : (
                    <>
                      <p className={styles.emptyMessage}>No snapshots match your search</p>
                      <p className={styles.emptySubtext}>Try adjusting your filters or search</p>
                    </>
                  )}
                </div>
              )}

              {!isLoading &&
                filteredSnapshots.map((snapshot) => (
                  <SnapshotCard
                    key={snapshot.id}
                    snapshot={snapshot}
                    onInsert={handleInsert}
                  />
                ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
