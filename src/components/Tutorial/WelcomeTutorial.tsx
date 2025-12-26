import { motion, AnimatePresence } from 'framer-motion';
import { useTutorialStore } from '../../store/tutorial-store';
import styles from './WelcomeTutorial.module.css';

const tutorialSteps = [
  {
    title: '🎵 Welcome to Neume',
    description: 'Explore chord progressions through shapes, colors, and intelligent AI',
    position: 'center',
    showButtons: true,
  },
  {
    title: 'Play Your First Progression',
    description: 'Click the Play button to hear how these chords sound together',
    position: 'bottom-left',
    target: 'play-button',
    showButtons: false,
  },
  {
    title: 'Each Shape is a Chord',
    description: 'Colors show harmonic function. Shapes show chord quality. Click and drag to rearrange!',
    position: 'center',
    showButtons: true,
  },
  {
    title: 'Add More Chords',
    description: 'Right-click anywhere on the canvas to add new chords to your progression',
    position: 'top',
    target: 'canvas',
    showButtons: true,
  },
  {
    title: 'Learn from Real Music',
    description: 'Upload YouTube URLs or audio files to analyze chord progressions from your favorite pieces',
    position: 'top-right',
    target: 'analyze-button',
    showButtons: true,
  },
];

export const WelcomeTutorial: React.FC = () => {
  const { isActive, currentStep, nextStep, skipTutorial, completeTutorial } = useTutorialStore();

  if (!isActive) return null;

  const step = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <AnimatePresence>
      <div className={styles.overlay}>
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isFirstStep ? skipTutorial : undefined}
        />

        <motion.div
          className={`${styles.tooltip} ${styles[step.position]}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.tooltipHeader}>
            <h2>{step.title}</h2>
            <button className={styles.skipButton} onClick={skipTutorial}>
              Skip Tutorial
            </button>
          </div>

          <p className={styles.description}>{step.description}</p>

          <div className={styles.progress}>
            <div className={styles.progressBar}>
              {tutorialSteps.map((_, i) => (
                <div
                  key={i}
                  className={`${styles.progressDot} ${i <= currentStep ? styles.active : ''}`}
                />
              ))}
            </div>
            <span className={styles.progressText}>
              Step {currentStep + 1} of {tutorialSteps.length}
            </span>
          </div>

          {step.showButtons && (
            <div className={styles.buttons}>
              {isFirstStep && (
                <button className={styles.primaryButton} onClick={nextStep}>
                  Start Tutorial
                </button>
              )}
              {!isFirstStep && !isLastStep && (
                <button className={styles.primaryButton} onClick={nextStep}>
                  Next
                </button>
              )}
              {isLastStep && (
                <button className={styles.primaryButton} onClick={completeTutorial}>
                  🎉 Start Creating!
                </button>
              )}
            </div>
          )}

          {!step.showButtons && (
            <div className={styles.waitingMessage}>
              Waiting for you to click Play...
            </div>
          )}
        </motion.div>

        {step.target && (
          <motion.div
            className={styles.arrow}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.7, 1, 0.7],
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            ↓
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};
