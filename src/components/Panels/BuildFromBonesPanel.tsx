import React, { useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuildFromBonesStore, type DeconstructionStep } from '@/store/build-from-bones-store';
import styles from './BuildFromBonesPanel.module.css';

/**
 * Helper component: StepIndicator
 * Displays clickable dots and progress line for navigating between steps
 */
interface StepIndicatorProps {
  steps: DeconstructionStep[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className={styles.stepIndicator}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <React.Fragment key={step.stepNumber}>
            {/* Step dot with geometric frame */}
            <div className={styles.stepContainer}>
              <button
                className={`${styles.stepDot} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
                onClick={() => onStepClick(index)}
                title={`Go to Step ${index + 1}: ${step.stepName}`}
                aria-label={`Step ${index + 1}: ${step.stepName}`}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className={styles.stepNumber}>{index + 1}</span>
                {isCompleted && (
                  <span className={styles.checkmark} aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8.5L6.5 12L13 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </button>
              <span className={styles.stepLabel}>{step.stepName}</span>
            </div>

            {/* Progress line between dots (skip after last step) - wobbly SVG path */}
            {index < steps.length - 1 && (
              <svg
                className={`${styles.progressLine} ${isCompleted ? styles.completed : ''}`}
                width="32"
                height="24"
                viewBox="0 0 32 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  className={styles.progressPath}
                  d="M0 12 C8 8, 12 16, 16 12 C20 8, 24 16, 32 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/**
 * Helper component: StepContent
 * Displays the current step's name, description, and progression preview
 */
interface StepContentProps {
  step: DeconstructionStep;
}

const StepContent: React.FC<StepContentProps> = ({ step }) => {
  const formatChordName = (scaleDegree: number, quality: string): string => {
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    const numeral = romanNumerals[scaleDegree - 1] || 'I';

    if (quality === 'minor' || quality === 'min7') {
      return numeral.toLowerCase();
    }

    if (quality === 'dom7') return `${numeral}7`;
    if (quality === 'maj7') return `${numeral}maj7`;
    if (quality === 'diminished') return `${numeral}°`;
    if (quality === 'augmented') return `${numeral}+`;

    return numeral;
  };

  const progressionText = useMemo(() => {
    return step.chords
      .map((chord) => formatChordName(chord.scaleDegree, chord.quality))
      .join(' → ');
  }, [step.chords]);

  return (
    <div className={styles.stepContent}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className={styles.stepTitle}>{step.stepName}</h3>
        <p className={styles.stepDescription}>{step.description}</p>

        {/* Progression preview */}
        <div className={styles.progressionSection}>
          <p className={styles.progressionLabel}>Progression at this step:</p>
          <div className={styles.progressionChords}>{progressionText}</div>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Helper component: NavigationControls
 * Previous, Play This Step, and Next buttons
 */
interface NavigationControlsProps {
  onPrevious: () => void;
  onPlayStep: () => void;
  onNext: () => void;
  isPlayingStep: boolean;
  canNavigate: boolean;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  onPrevious,
  onPlayStep,
  onNext,
  isPlayingStep,
  canNavigate,
}) => {
  return (
    <div className={styles.navControls}>
      <button
        className={styles.navButton}
        onClick={onPrevious}
        disabled={!canNavigate}
        title="Previous step (Left arrow)"
      >
        ◄ Previous
      </button>
      <button
        className={`${styles.playButton} ${styles.primary}`}
        onClick={onPlayStep}
        title="Play this step"
      >
        <span className={styles.playIcon}>{isPlayingStep ? '■' : '▶'}</span>
        Play This Step
      </button>
      <button
        className={styles.navButton}
        onClick={onNext}
        disabled={!canNavigate}
        title="Next step (Right arrow)"
      >
        Next ►
      </button>
    </div>
  );
};

/**
 * Helper component: GlobalControls
 * Play sequence, compare, and save buttons
 */
interface GlobalControlsProps {
  onPlaySequence: () => void;
  onCompare: () => void;
  onSave: () => void;
  isPlayingSequence: boolean;
  isComparing: boolean;
}

const GlobalControls: React.FC<GlobalControlsProps> = ({
  onPlaySequence,
  onCompare,
  onSave,
  isPlayingSequence,
  isComparing,
}) => {
  return (
    <div className={styles.globalControls}>
      <button
        className={`${styles.playButton} ${styles.primary}`}
        onClick={onPlaySequence}
        title="Play all steps in sequence (10 seconds each)"
      >
        <span className={styles.playIcon}>{isPlayingSequence ? '■' : '▶'}</span>
        Play All Steps In Sequence
      </button>
      <button
        className={`${styles.playButton} ${styles.primary}`}
        onClick={onCompare}
        title="Compare step 0 vs final step"
      >
        <span className={styles.playIcon}>{isComparing ? '■' : '▶'}</span>
        Compare Step 0 vs Final
      </button>
      <button
        className={`${styles.playButton} ${styles.secondary}`}
        onClick={onSave}
        title="Save this build-up to My Progressions"
      >
        💾 Save This Build-Up
      </button>
    </div>
  );
};

/**
 * BuildFromBonesPanel Component
 * Main panel component that displays step-by-step deconstruction of progressions
 * Slides up from bottom with framer-motion AnimatePresence
 * Includes inline sub-components: StepIndicator, StepContent, NavigationControls, GlobalControls
 */
export const BuildFromBonesPanel: React.FC = () => {
  const {
    isPanelOpen,
    currentStep,
    totalSteps,
    steps,
    isPlaying,
    playbackMode,
    closePanel,
    nextStep,
    prevStep,
    jumpToStep,
    setPlaying,
    setPlaybackMode,
  } = useBuildFromBonesStore();

  // Track which playback mode is currently active
  const isPlayingStep = isPlaying && playbackMode === 'single';
  const isPlayingSequence = isPlaying && playbackMode === 'sequence';
  const isComparing = isPlaying && playbackMode === 'compare';

  // Handle keyboard navigation
  useEffect(() => {
    if (!isPanelOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePanel();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, closePanel, nextStep, prevStep]);

  // Handlers for playback (placeholder - actual playback integration later)
  const handlePlayStep = useCallback(() => {
    const newState = isPlayingStep ? false : true;
    setPlaying(newState);
    setPlaybackMode(newState ? 'single' : null);
    // TODO: Integrate with audio engine to play current step's progression
  }, [isPlayingStep, setPlaying, setPlaybackMode]);

  const handlePlaySequence = useCallback(() => {
    const newState = isPlayingSequence ? false : true;
    setPlaying(newState);
    setPlaybackMode(newState ? 'sequence' : null);
    // TODO: Integrate with audio engine to play all steps in sequence
    // Auto-advance through steps every 10 seconds
  }, [isPlayingSequence, setPlaying, setPlaybackMode]);

  const handleCompare = useCallback(() => {
    const newState = isComparing ? false : true;
    setPlaying(newState);
    setPlaybackMode(newState ? 'compare' : null);
    // TODO: Integrate with audio engine to play step 0, gap, then final step
  }, [isComparing, setPlaying, setPlaybackMode]);

  const handleSave = useCallback(() => {
    // TODO: Save all steps to My Progressions
    console.log('Saving build-up steps...', steps);
  }, [steps]);

  const canNavigate = totalSteps > 0 && !isPlaying;
  const currentStepData = steps[currentStep];

  const content = (
    <AnimatePresence>
      {isPanelOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closePanel}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            className={styles.panel}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            role="complementary"
            aria-modal="false"
            aria-labelledby="build-from-bones-title"
          >
            {/* Header */}
            <div className={styles.header}>
              <h2 id="build-from-bones-title" className={styles.title}>
                Build From Bones 🦴
              </h2>
              <button
                className={styles.closeButton}
                onClick={closePanel}
                aria-label="Close panel"
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Step indicator with progress line */}
            {totalSteps > 0 && (
              <StepIndicator
                steps={steps}
                currentStep={currentStep}
                onStepClick={jumpToStep}
              />
            )}

            {/* Main content area */}
            {totalSteps > 0 && currentStepData ? (
              <>
                {/* Step content section */}
                <StepContent step={currentStepData} />

                {/* Navigation controls */}
                <NavigationControls
                  onPrevious={prevStep}
                  onPlayStep={handlePlayStep}
                  onNext={nextStep}
                  isPlayingStep={isPlayingStep}
                  canNavigate={canNavigate}
                />

                {/* Global playback controls */}
                <GlobalControls
                  onPlaySequence={handlePlaySequence}
                  onCompare={handleCompare}
                  onSave={handleSave}
                  isPlayingSequence={isPlayingSequence}
                  isComparing={isComparing}
                />
              </>
            ) : (
              /* Empty state */
              <div className={styles.emptyContainer}>
                <div className={styles.emptyIcon}>🎵</div>
                <p className={styles.emptyMessage}>
                  Analyze a chord progression to see its step-by-step deconstruction.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
