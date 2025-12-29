import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { DeconstructionStep } from '@/store/build-from-bones-store';
import styles from './BuildFromBonesContent.module.css';

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
 * Layer type display info - icons and colors for each layer
 */
const LAYER_INFO: Record<string, { icon: string; color: string; label: string }> = {
  skeleton: { icon: '🎵', color: '#888', label: 'Foundation' },
  sevenths: { icon: '7', color: '#E8A03E', label: 'Richness' },
  suspensions: { icon: '~', color: '#6B8FAD', label: 'Tension' },
  extensions: { icon: '↑', color: '#7A9E87', label: 'Color' },
  alterations: { icon: '♯♭', color: '#C4756E', label: 'Edge' },
};

/**
 * Helper component: StepContent
 * Displays the current step's name, description, and progression preview
 * Now with enhanced display for layerType, modifiedIndices, and romanNumerals
 */
interface StepContentProps {
  step: DeconstructionStep;
}

const StepContent: React.FC<StepContentProps> = ({ step }) => {
  // Use backend-provided Roman numerals if available, otherwise generate from chords
  const progressionText = useMemo(() => {
    if (step.romanNumerals) {
      return step.romanNumerals;
    }
    // Fallback to generating from chords
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    return step.chords
      .map((chord) => {
        const numeral = romanNumerals[chord.scaleDegree - 1] || 'I';
        if (chord.quality === 'minor' || chord.quality === 'min7') {
          return numeral.toLowerCase();
        }
        if (chord.quality === 'dom7') return `${numeral}7`;
        if (chord.quality === 'maj7') return `${numeral}maj7`;
        if (chord.quality === 'diminished') return `${numeral}°`;
        if (chord.quality === 'augmented') return `${numeral}+`;
        return numeral;
      })
      .join(' → ');
  }, [step.romanNumerals, step.chords]);

  // Get layer display info
  const layerInfo = LAYER_INFO[step.layerType || 'skeleton'];
  const modifiedCount = step.modifiedIndices?.length || 0;

  return (
    <div className={styles.stepContent}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {/* Step header with layer badge */}
        <div className={styles.stepHeader}>
          <h3 className={styles.stepTitle}>{step.stepName}</h3>
          {step.layerType && layerInfo && (
            <span
              className={styles.layerBadge}
              style={{ backgroundColor: layerInfo.color }}
              title={`Layer: ${layerInfo.label}`}
            >
              <span className={styles.layerIcon}>{layerInfo.icon}</span>
              <span className={styles.layerLabel}>{layerInfo.label}</span>
            </span>
          )}
        </div>

        {/* What changed indicator */}
        {modifiedCount > 0 && (
          <p className={styles.modifiedIndicator}>
            {modifiedCount} chord{modifiedCount !== 1 ? 's' : ''} modified from previous step
          </p>
        )}

        {/* AI-generated description */}
        <p className={styles.stepDescription}>{step.description}</p>

        {/* Progression preview with Roman numerals */}
        <div className={styles.progressionSection}>
          <p className={styles.progressionLabel}>Progression:</p>
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
  onPlay: () => void;
  onNext: () => void;
  isPlaying: boolean;
  canNavigate: boolean;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  onPrevious,
  onPlay,
  onNext,
  isPlaying,
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
        onClick={onPlay}
        title="Play this step"
      >
        <span className={styles.playIcon}>{isPlaying ? '■' : '▶'}</span>
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
 * BuildFromBonesContent Component Props
 */
export interface BuildFromBonesContentProps {
  steps: DeconstructionStep[];
  currentStep: number;
  isPlaying: boolean;
  onStepClick: (stepIndex: number) => void;
  onPrevious: () => void;
  onPlay: () => void;
  onNext: () => void;
}

/**
 * BuildFromBonesContent
 * Reusable component for displaying step-by-step deconstruction
 * Includes StepIndicator, StepContent, and NavigationControls
 */
export const BuildFromBonesContent: React.FC<BuildFromBonesContentProps> = ({
  steps,
  currentStep,
  isPlaying,
  onStepClick,
  onPrevious,
  onPlay,
  onNext,
}) => {
  const currentStepData = steps[currentStep];
  const canNavigate = steps.length > 0 && !isPlaying;

  return (
    <div className={styles.contentContainer}>
      {/* Step indicator */}
      {steps.length > 0 && (
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={onStepClick}
        />
      )}

      {/* Main content area */}
      {steps.length > 0 && currentStepData ? (
        <>
          {/* Step content section */}
          <StepContent step={currentStepData} />

          {/* Navigation controls */}
          <NavigationControls
            onPrevious={onPrevious}
            onPlay={onPlay}
            onNext={onNext}
            isPlaying={isPlaying}
            canNavigate={canNavigate}
          />
        </>
      ) : (
        /* Empty state */
        <div className={styles.emptyContainer}>
          <p className={styles.emptyMessage}>
            Analyze a chord progression to see its step-by-step deconstruction.
          </p>
        </div>
      )}
    </div>
  );
};
