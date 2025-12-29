import type { SavedProgression } from '@/types/progression';
import styles from './RecentSection.module.css';

interface RecentSectionProps {
  progressions: SavedProgression[];
  onOpen: (progression: SavedProgression) => void;
}

export const RecentSection: React.FC<RecentSectionProps> = ({
  progressions,
  onOpen,
}) => {
  return (
    <div className={styles.container}>
      {progressions.map((progression) => (
        <button
          key={progression.id}
          className={styles.item}
          onClick={() => onOpen(progression)}
        >
          <span className={styles.title}>{progression.title}</span>
          <span className={styles.meta}>{progression.key} {progression.mode}</span>
        </button>
      ))}
    </div>
  );
};
