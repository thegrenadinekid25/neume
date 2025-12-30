import type { Snapshot } from '@/types';
import { getScaleDegreeColor } from '@/styles/colors';
import styles from './SnapshotGridCard.module.css';

interface SnapshotGridCardProps {
  snapshot: Snapshot;
  onOpen: () => void;
  onDelete?: () => void;
}

export const SnapshotGridCard: React.FC<SnapshotGridCardProps> = ({
  snapshot,
  onOpen,
  onDelete,
}) => {
  const chordCount = snapshot.chords?.length ?? 0;
  const formattedDate = new Date(snapshot.createdAt).toLocaleDateString();
  const modeLabel = snapshot.originalMode === 'major' ? 'Major' : 'Minor';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <div className={styles.card} onClick={onOpen}>
      {onDelete && (
        <button
          className={styles.deleteButton}
          onClick={handleDelete}
          aria-label="Delete snapshot"
          title="Delete"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
          </svg>
        </button>
      )}
      <div className={styles.content}>
        <h3 className={styles.title}>{snapshot.name}</h3>
        <div className={styles.meta}>
          <span>{snapshot.originalKey} {modeLabel}</span>
          <span>{chordCount} chords</span>
        </div>
        <div className={styles.chordPreview}>
          {snapshot.chords.map((chord, index) => (
            <div
              key={index}
              className={styles.chordDot}
              style={{
                backgroundColor: getScaleDegreeColor(chord.scaleDegree, snapshot.originalMode),
              }}
              title={`Scale degree ${chord.scaleDegree}`}
            />
          ))}
        </div>
        <div className={styles.date}>{formattedDate}</div>
      </div>
    </div>
  );
};
