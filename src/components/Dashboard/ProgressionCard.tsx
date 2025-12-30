import type { SavedProgression } from '@/types/progression';
import styles from './ProgressionCard.module.css';

interface ProgressionCardProps {
  progression: SavedProgression;
  onOpen: () => void;
  onDelete?: () => void;
}

export const ProgressionCard: React.FC<ProgressionCardProps> = ({
  progression,
  onOpen,
  onDelete,
}) => {
  const chordCount = progression.chords?.length ?? 0;
  const formattedDate = new Date(progression.updatedAt).toLocaleDateString();

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
          aria-label="Delete progression"
          title="Delete"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
          </svg>
        </button>
      )}
      <div className={styles.content}>
        <h3 className={styles.title}>{progression.title}</h3>
        <div className={styles.meta}>
          <span>{progression.key} {progression.mode}</span>
          <span>{chordCount} chords</span>
        </div>
        <div className={styles.date}>{formattedDate}</div>
      </div>
    </div>
  );
};
