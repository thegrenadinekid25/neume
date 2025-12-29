import type { SavedProgression } from '@/types/progression';
import styles from './ProgressionCard.module.css';

interface ProgressionCardProps {
  progression: SavedProgression;
  onOpen: () => void;
}

export const ProgressionCard: React.FC<ProgressionCardProps> = ({
  progression,
  onOpen,
}) => {
  const chordCount = progression.chords?.length ?? 0;
  const formattedDate = new Date(progression.updatedAt).toLocaleDateString();

  return (
    <button className={styles.card} onClick={onOpen}>
      <div className={styles.content}>
        <h3 className={styles.title}>{progression.title}</h3>
        <div className={styles.meta}>
          <span>{progression.key} {progression.mode}</span>
          <span>{chordCount} chords</span>
        </div>
        <div className={styles.date}>{formattedDate}</div>
      </div>
    </button>
  );
};
