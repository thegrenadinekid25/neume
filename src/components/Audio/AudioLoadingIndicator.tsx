import { useEffect, useState } from 'react';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import styles from './AudioLoadingIndicator.module.css';

export function AudioLoadingIndicator() {
  const { isReady, isSamplesLoaded } = useAudioEngine();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (isSamplesLoaded) {
      // Fade out after loaded
      const timer = setTimeout(() => setVisible(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isSamplesLoaded]);

  // Don't show if not initialized or already faded
  if (!isReady || !visible) {
    return null;
  }

  return (
    <div className={`${styles.container} ${isSamplesLoaded ? styles.loaded : ''}`}>
      <div className={styles.content}>
        {isSamplesLoaded ? (
          <span className={styles.label}>🎹 Piano ready</span>
        ) : (
          <>
            <span className={styles.spinner} />
            <span className={styles.label}>Loading piano samples...</span>
          </>
        )}
      </div>
    </div>
  );
}
