import React, { useState } from 'react';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import styles from './AudioInitButton.module.css';

export const AudioInitButton: React.FC = () => {
  const { isReady, error, initialize } = useAudioEngine();
  const [isInitializing, setIsInitializing] = useState(false);

  const handleClick = async () => {
    setIsInitializing(true);
    await initialize();
    setIsInitializing(false);
  };

  if (isReady) {
    return (
      <div className={styles.status}>
        <span className={styles.indicator}>🔊</span>
        Audio Ready
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        Audio failed to load. Please refresh.
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isInitializing}
      className={styles.initButton}
    >
      {isInitializing ? 'Initializing Audio...' : 'Enable Audio'}
    </button>
  );
};
