/**
 * Welcome Tutorial Component
 * Guides first-time users through core features
 */

import { useState, useEffect, useCallback } from 'react';
import { useTutorialStore } from '@/store/tutorial-store';
import styles from './WelcomeTutorial.module.css';

interface Step {
  title: string;
  description: string;
  action?: string;
  highlightElement?: string;
}

const TUTORIAL_STEPS: Step[] = [
  {
    title: '🎵 Welcome to Neume',
    description: 'Explore chord progressions through shapes, colors, and intelligent AI. Let\'s get started!',
    action: 'start',
  },
  {
    title: 'This is a Chord Progression',
    description: 'Each shape represents a chord. Click the Play button to hear this progression.',
    action: 'play',
    highlightElement: 'play-button',
  },
  {
    title: 'Great! You can hear it',
    description: 'Each shape represents a chord. Colors show harmonic function. Shapes make them easy to remember.',
    action: 'next',
  },
  {
    title: 'Add More Chords',
    description: 'Right-click anywhere on the canvas to add more chords to your progression.',
    action: 'add-chord',
  },
  {
    title: 'Analyze Real Music',
    description: 'Upload a YouTube link or audio file to extract chord progressions from songs you love.',
    action: 'analyze',
    highlightElement: 'analyze-button',
  },
  {
    title: '🎉 You\'re Ready!',
    description: 'You\'ve learned the basics. Now explore and create your own progressions!',
    action: 'complete',
  },
];

export function WelcomeTutorial() {
  const {
    isActive,
    currentStep,
    totalSteps,
    nextStep,
    skipTutorial,
    completeTutorial,
  } = useTutorialStore();

  const [showConfetti, setShowConfetti] = useState(false);
  const [hasPlayedDemo, setHasPlayedDemo] = useState(false);

  // Handle play button in tutorial
  const handleTutorialPlay = useCallback(() => {
    // Click the actual play button in the sidebar
    const playButton = document.querySelector('.play-button') as HTMLButtonElement;
    if (playButton) {
      playButton.click();
      setHasPlayedDemo(true);
      // Advance after a short delay to let them hear the music
      setTimeout(() => nextStep(), 1500);
    }
  }, [nextStep]);

  // Handle step-specific actions (only for add-chord step now)
  useEffect(() => {
    if (!isActive) return;

    const step = TUTORIAL_STEPS[currentStep];

    // For add-chord step, wait for right-click
    if (step.action === 'add-chord') {
      const canvas = document.querySelector('[class*="Canvas"]') as HTMLElement;
      if (canvas) {
        const handleContextMenu = (e: MouseEvent) => {
          e.preventDefault();
          setTimeout(() => nextStep(), 300);
          canvas.removeEventListener('contextmenu', handleContextMenu as EventListener);
        };
        canvas.addEventListener('contextmenu', handleContextMenu as EventListener);
        return () => canvas.removeEventListener('contextmenu', handleContextMenu as EventListener);
      }
    }
  }, [isActive, currentStep, nextStep]);

  // Handle completion with confetti
  useEffect(() => {
    if (currentStep === totalSteps - 1 && isActive) {
      setShowConfetti(true);
    }
  }, [currentStep, totalSteps, isActive]);

  if (!isActive) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={skipTutorial} />

      {/* Confetti */}
      {showConfetti && <Confetti />}

      {/* First step: Full-screen welcome */}
      {isFirstStep && (
        <div className={styles.welcomeContainer}>
          <div className={styles.welcomeCard}>
            <h2 className={styles.welcomeTitle}>{step.title}</h2>
            <p className={styles.welcomeDescription}>{step.description}</p>
            <div className={styles.welcomeActions}>
              <button
                className={styles.primaryButton}
                onClick={nextStep}
              >
                Start Tutorial
              </button>
              <button
                className={styles.secondaryButton}
                onClick={skipTutorial}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Other steps: Tooltip */}
      {!isFirstStep && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipContent}>
            <h3 className={styles.tooltipTitle}>{step.title}</h3>
            <p className={styles.tooltipDescription}>{step.description}</p>

            <div className={styles.tooltipFooter}>
              <div className={styles.progressIndicator}>
                Step {currentStep + 1} of {totalSteps}
              </div>

              <div className={styles.tooltipActions}>
                {step.action === 'play' && (
                  <button
                    className={styles.playDemoButton}
                    onClick={handleTutorialPlay}
                    disabled={hasPlayedDemo}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4 2.5v11l9-5.5-9-5.5z" />
                    </svg>
                    {hasPlayedDemo ? 'Playing...' : 'Play Demo'}
                  </button>
                )}
                {!isLastStep && step.action !== 'play' && step.action !== 'add-chord' && (
                  <button
                    className={styles.primaryButton}
                    onClick={nextStep}
                  >
                    Next
                  </button>
                )}
                {isLastStep && (
                  <button
                    className={styles.primaryButton}
                    onClick={completeTutorial}
                  >
                    Start Creating
                  </button>
                )}
                <button
                  className={styles.skipButton}
                  onClick={skipTutorial}
                >
                  Skip
                </button>
              </div>
            </div>
          </div>

          {/* Arrow pulse */}
          {step.highlightElement && (
            <div className={styles.arrow} />
          )}
        </div>
      )}
    </>
  );
}

/**
 * Simple confetti animation
 */
function Confetti() {
  const confettiPieces = Array.from({ length: 30 }, (_, i) => (
    <div
      key={i}
      className={styles.confetti}
      style={{
        left: `${Math.random() * 100}%`,
        '--delay': `${Math.random() * 0.5}s`,
        '--duration': `${2 + Math.random() * 1}s`,
      } as React.CSSProperties}
    >
      {['🎵', '🎶', '🎼', '✨', '⭐'][Math.floor(Math.random() * 5)]}
    </div>
  ));

  return <div className={styles.confettiContainer}>{confettiPieces}</div>;
}
