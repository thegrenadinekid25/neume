import type { SavedProgression } from '@/types/progression';
import { ProgressionCard } from './ProgressionCard';
import { NewProgressionCard } from './NewProgressionCard';
import styles from './ProgressionGrid.module.css';

interface ProgressionGridProps {
  progressions: SavedProgression[];
  loading: boolean;
  onOpen: (progression: SavedProgression) => void;
  onDelete?: (progression: SavedProgression) => void;
  onCreateNew: () => void;
}

export const ProgressionGrid: React.FC<ProgressionGridProps> = ({
  progressions,
  loading,
  onOpen,
  onDelete,
  onCreateNew,
}) => {
  if (loading) {
    return <div className={styles.loading}>Loading progressions...</div>;
  }

  return (
    <div className={styles.grid}>
      <NewProgressionCard onClick={onCreateNew} />
      {progressions.map((progression) => (
        <ProgressionCard
          key={progression.id}
          progression={progression}
          onOpen={() => onOpen(progression)}
          onDelete={onDelete ? () => onDelete(progression) : undefined}
        />
      ))}
    </div>
  );
};
