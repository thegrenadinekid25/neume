import { useAccessibilityStore } from '@/store/accessibility-store';
import styles from './ColorblindModeToggle.module.css';

export function ColorblindModeToggle() {
  const colorblindMode = useAccessibilityStore((state) => state.colorblindMode);
  const setColorblindMode = useAccessibilityStore((state) => state.setColorblindMode);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.badge}>Accessibility</span>
        <span className={styles.title}>Pattern Overlays</span>
      </div>

      <p className={styles.description}>
        Enable pattern overlays to distinguish scale degrees by shape and pattern in addition to color, making the app more accessible for colorblind users.
      </p>

      <label className={styles.toggleOption}>
        <input
          type="checkbox"
          checked={colorblindMode}
          onChange={(e) => setColorblindMode(e.target.checked)}
        />
        <span className={styles.toggleLabel}>
          Enable colorblind patterns
        </span>
      </label>

      <div className={styles.patterns}>
        <span className={styles.patternsTitle}>Patterns:</span>
        <ul className={styles.patternsList}>
          <li>I (1) = Solid</li>
          <li>ii (2) = Horizontal lines</li>
          <li>iii (3) = Vertical lines</li>
          <li>IV (4) = Diagonal lines (/)</li>
          <li>V (5) = Diagonal lines (\)</li>
          <li>vi (6) = Dots</li>
          <li>vii (7) = Crosshatch</li>
        </ul>
      </div>
    </div>
  );
}
