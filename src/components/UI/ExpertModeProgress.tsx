import { motion } from 'framer-motion';
import { useExpertModeStore } from '@/store/expert-mode-store';
import styles from './ExpertModeProgress.module.css';

export function ExpertModeProgress() {
  const isUnlocked = useExpertModeStore((state) => state.isUnlocked);
  const getUnlockProgress = useExpertModeStore((state) => state.getUnlockProgress);
  const forceUnlock = useExpertModeStore((state) => state.forceUnlock);

  const progress = getUnlockProgress();

  if (isUnlocked) {
    return (
      <div className={styles.container}>
        <div className={styles.unlockedBadge}>
          <span className={styles.checkmark}>✓</span>
          <span>Expert Mode Unlocked</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.lockIcon}>🔒</span>
        <span className={styles.title}>Unlock Expert Mode</span>
      </div>

      <div className={styles.progressBars}>
        <div className={styles.progressItem}>
          <div className={styles.progressLabel}>
            <span>Progressions</span>
            <span>{progress.progressions.current}/{progress.progressions.required}</span>
          </div>
          <div className={styles.progressTrack}>
            <motion.div
              className={styles.progressFill}
              initial={{ width: 0 }}
              animate={{ width: `${progress.progressions.percentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className={styles.progressItem}>
          <div className={styles.progressLabel}>
            <span>Unique Chords</span>
            <span>{progress.uniqueChords.current}/{progress.uniqueChords.required}</span>
          </div>
          <div className={styles.progressTrack}>
            <motion.div
              className={styles.progressFill}
              initial={{ width: 0 }}
              animate={{ width: `${progress.uniqueChords.percentage}%` }}
              transition={{ duration: 0.5, delay: 0.1 }}
            />
          </div>
        </div>

        <div className={styles.progressItem}>
          <div className={styles.progressLabel}>
            <span>Cadences</span>
            <span>{progress.cadences.current}/{progress.cadences.required}</span>
          </div>
          <div className={styles.progressTrack}>
            <motion.div
              className={styles.progressFill}
              initial={{ width: 0 }}
              animate={{ width: `${progress.cadences.percentage}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
        </div>
      </div>

      <div className={styles.overallProgress}>
        <span>{Math.round(progress.overall)}% complete</span>
      </div>

      {/* Dev mode force unlock - only show in development */}
      {import.meta.env.DEV && (
        <button
          className={styles.devUnlock}
          onClick={forceUnlock}
        >
          Force Unlock (Dev)
        </button>
      )}
    </div>
  );
}
