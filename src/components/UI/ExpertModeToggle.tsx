import { useExpertModeStore } from '@/store/expert-mode-store';
import styles from './ExpertModeToggle.module.css';

export function ExpertModeToggle() {
  const isUnlocked = useExpertModeStore((state) => state.isUnlocked);
  const showExtendedChords = useExpertModeStore((state) => state.showExtendedChords);
  const showAlteredChords = useExpertModeStore((state) => state.showAlteredChords);
  const setShowExtendedChords = useExpertModeStore((state) => state.setShowExtendedChords);
  const setShowAlteredChords = useExpertModeStore((state) => state.setShowAlteredChords);

  if (!isUnlocked) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.badge}>Expert</span>
        <span className={styles.title}>Advanced Chords</span>
      </div>

      <div className={styles.toggles}>
        <label className={styles.toggleOption}>
          <input
            type="checkbox"
            checked={showExtendedChords}
            onChange={(e) => setShowExtendedChords(e.target.checked)}
          />
          <span className={styles.toggleLabel}>
            Extended (9, 11, 13)
          </span>
        </label>

        <label className={styles.toggleOption}>
          <input
            type="checkbox"
            checked={showAlteredChords}
            onChange={(e) => setShowAlteredChords(e.target.checked)}
          />
          <span className={styles.toggleLabel}>
            Altered Dominants
          </span>
        </label>
      </div>
    </div>
  );
}
