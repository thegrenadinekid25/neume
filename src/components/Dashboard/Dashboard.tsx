import { useState, useEffect } from 'react';
import { useProgressionsStore } from '@/store/progressions-store';
import { useAppViewStore } from '@/store/app-view-store';
import { useAuthStore } from '@/store/auth-store';
import { progressionStorage } from '@/services/progression-storage';
import { ProgressionGrid } from './ProgressionGrid';
import { ExploreSection } from './ExploreSection';
import { RecentSection } from './RecentSection';
import styles from './Dashboard.module.css';

export const Dashboard: React.FC = () => {
  const { savedProgressions, isLoading, loadProgressions } = useProgressionsStore();
  const navigateToCanvas = useAppViewStore((s) => s.navigateToCanvas);
  const { user, profile, signOut } = useAuthStore();
  const [recentProgressions, setRecentProgressions] = useState<any[]>([]);

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    loadProgressions();
    progressionStorage.getRecent(5).then(setRecentProgressions);
  }, [loadProgressions]);

  const handleOpenProgression = (progression: any) => {
    // Dispatch event for App.tsx to load the progression
    window.dispatchEvent(new CustomEvent('loadProgression', { detail: progression }));
    navigateToCanvas(progression.id);
  };

  const handleCreateNew = () => {
    navigateToCanvas();
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
            onCreateNew={handleCreateNew}
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
