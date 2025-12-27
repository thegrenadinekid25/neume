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
          <span className={styles.label}>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Piano ready
          </span>
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
