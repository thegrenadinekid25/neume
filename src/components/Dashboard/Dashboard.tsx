import { useState, useEffect } from 'react';
import { useProgressionsStore } from '@/store/progressions-store';
import { useSnapshotsStore } from '@/store/snapshots-store';
import { useAppViewStore } from '@/store/app-view-store';
import { useAuthStore } from '@/store/auth-store';
import { progressionStorage } from '@/services/progression-storage';
import { ProgressionGrid } from './ProgressionGrid';
import { SnapshotsGrid } from './SnapshotsGrid';
import { ExploreSection } from './ExploreSection';
import { RecentSection } from './RecentSection';
import type { Snapshot } from '@/types';
import styles from './Dashboard.module.css';

export const Dashboard: React.FC = () => {
  const { savedProgressions, isLoading, loadProgressions, deleteProgression } = useProgressionsStore();
  const { snapshots, isLoading: snapshotsLoading, loadSnapshots, deleteSnapshot, openPanel: openSnapshotsPanel } = useSnapshotsStore();
  const navigateToCanvas = useAppViewStore((s) => s.navigateToCanvas);
  const { user, profile, signOut } = useAuthStore();
  const [recentProgressions, setRecentProgressions] = useState<any[]>([]);

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    loadProgressions();
    loadSnapshots();
    progressionStorage.getRecent(5).then(setRecentProgressions);
  }, [loadProgressions, loadSnapshots]);

  const handleOpenProgression = (progression: any) => {
    // Dispatch event for App.tsx to load the progression
    window.dispatchEvent(new CustomEvent('loadProgression', { detail: progression }));
    navigateToCanvas(progression.id);
  };

  const handleCreateNew = () => {
    navigateToCanvas();
  };

  const handleDeleteProgression = async (progression: any) => {
    if (!window.confirm(`Delete "${progression.title}"? This cannot be undone.`)) return;
    await deleteProgression(progression.id);
    // Refresh recent progressions after delete
    progressionStorage.getRecent(5).then(setRecentProgressions);
  };

  const handleOpenSnapshot = (_snapshot: Snapshot) => {
    // Open the snapshots panel
    openSnapshotsPanel();
  };

  const handleDeleteSnapshot = async (snapshot: Snapshot) => {
    if (!window.confirm(`Delete snapshot "${snapshot.name}"? This cannot be undone.`)) return;
    await deleteSnapshot(snapshot.id);
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.logo}>NEUME</h1>
        <div className={styles.userSection}>
          <span className={styles.userName}>{displayName}</span>
          <button className={styles.signOutButton} onClick={signOut}>
            Sign Out
          </button>
        </div>
      </header>

      <main className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>My Progressions</h2>
          <ProgressionGrid
            progressions={savedProgressions}
            loading={isLoading}
            onOpen={handleOpenProgression}
            onDelete={handleDeleteProgression}
            onCreateNew={handleCreateNew}
          />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>My Snapshots</h2>
          <SnapshotsGrid
            snapshots={snapshots}
            loading={snapshotsLoading}
            onOpen={handleOpenSnapshot}
            onDelete={handleDeleteSnapshot}
          />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Explore</h2>
          <ExploreSection />
        </section>

        {recentProgressions.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Recent</h2>
            <RecentSection
              progressions={recentProgressions}
              onOpen={handleOpenProgression}
            />
          </section>
        )}
      </main>
    </div>
  );
};
