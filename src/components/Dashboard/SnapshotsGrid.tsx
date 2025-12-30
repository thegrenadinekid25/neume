import type { Snapshot } from '@/types';
import { SnapshotGridCard } from './SnapshotGridCard';
import styles from './SnapshotsGrid.module.css';

interface SnapshotsGridProps {
  snapshots: Snapshot[];
  loading: boolean;
  onOpen: (snapshot: Snapshot) => void;
  onDelete?: (snapshot: Snapshot) => void;
}

export const SnapshotsGrid: React.FC<SnapshotsGridProps> = ({
  snapshots,
  loading,
  onOpen,
  onDelete,
}) => {
  if (loading) {
    return <div className={styles.loading}>Loading snapshots...</div>;
  }

  if (snapshots.length === 0) {
    return <div className={styles.empty}>No snapshots yet. Save chord progressions from the canvas to build your library.</div>;
  }

  return (
    <div className={styles.grid}>
      {snapshots.map((snapshot) => (
        <SnapshotGridCard
          key={snapshot.id}
          snapshot={snapshot}
          onOpen={() => onOpen(snapshot)}
          onDelete={onDelete ? () => onDelete(snapshot) : undefined}
        />
      ))}
    </div>
  );
};
