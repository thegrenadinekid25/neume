import { useState, useCallback } from 'react';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import styles from './AudioInitButton.module.css';

export interface AudioInitButtonProps {
  className?: string;
}

/**
 * AudioInitButton - Button to initialize audio engine
 * Shows loading state during initialization and success/error states
 */
export function AudioInitButton({ className = '' }: AudioInitButtonProps) {
  const { isReady, error, initialize } = useAudioEngine();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (isReady || isLoading) return;

    setIsLoading(true);
    try {
      await initialize();
    } finally {
      setIsLoading(false);
    }
  }, [isReady, isLoading, initialize]);

  // Determine button text and state
  let buttonText = 'Enable Audio';
  let buttonClassName = styles.buttonDefault;

  if (isLoading) {
    buttonText = 'Initializing...';
    buttonClassName = styles.buttonLoading;
  } else if (isReady) {
    buttonText = 'Audio Ready';
    buttonClassName = styles.buttonReady;
  } else if (error) {
    buttonText = 'Audio Error';
    buttonClassName = styles.buttonError;
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <button
        onClick={handleClick}
        disabled={isReady || isLoading}
        className={buttonClassName}
        title={error ? error : undefined}
      >
        {buttonText}
      </button>
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
}
