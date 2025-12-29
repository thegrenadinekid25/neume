import React, { useState } from 'react';
import type { Snapshot } from '@/types';
import { useSnapshotsStore } from '@/store/snapshots-store';
import { SnapshotPreview } from './SnapshotPreview';
import styles from './SnapshotCard.module.css';

interface SnapshotCardProps {
  snapshot: Snapshot;
  onInsert: (snapshot: Snapshot) => void;
  isDragging?: boolean;
}

export const SnapshotCard: React.FC<SnapshotCardProps> = ({
  snapshot,
  onInsert,
  isDragging = false,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const { toggleFavorite, deleteSnapshot } = useSnapshotsStore();

  const handleDelete = async () => {
    if (window.confirm(`Delete snapshot "${snapshot.name}"?`)) {
      await deleteSnapshot(snapshot.id);
    }
  };

  const handleToggleFavorite = async () => {
    await toggleFavorite(snapshot.id);
  };

  const createdDate = new Date(snapshot.createdAt);
  const dateStr = createdDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  });

  return (
    <div
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer?.setData('application/json', JSON.stringify(snapshot));
      }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{snapshot.name}</h3>
          <span className={styles.date}>{dateStr}</span>
        </div>
        <button
          className={`${styles.favoriteButton} ${snapshot.isFavorite ? styles.active : ''}`}
          onClick={handleToggleFavorite}
          title={snapshot.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-label={snapshot.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {snapshot.isFavorite ? '★' : '☆'}
        </button>
      </div>

      {/* Description */}
      {snapshot.description && (
        <p className={styles.description}>{snapshot.description}</p>
      )}

      {/* Preview */}
      <div className={styles.previewWrapper}>
        <SnapshotPreview chords={snapshot.chords} />
      </div>

      {/* Metadata */}
      <div className={styles.metadata}>
        <span className={styles.chordCount}>
          {snapshot.chords.length} {snapshot.chords.length === 1 ? 'chord' : 'chords'}
        </span>
        <span className={styles.source}>{snapshot.source.type}</span>
      </div>

      {/* Tags */}
      {snapshot.tags.length > 0 && (
        <div className={styles.tagsContainer}>
          {snapshot.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className={`${styles.actions} ${isHovering ? styles.visible : ''}`}>
        <button
          className={styles.insertButton}
          onClick={() => onInsert(snapshot)}
          title="Insert at playhead"
        >
          Insert
        </button>
        <button
          className={styles.deleteButton}
          onClick={handleDelete}
          title="Delete snapshot"
          aria-label="Delete snapshot"
        >
          Delete
        </button>
      </div>
    </div>
  );
};
