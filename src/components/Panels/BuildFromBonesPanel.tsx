import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuildFromBonesStore } from '../../store/build-from-bones-store';
import { useCanvasStore } from '../../store/canvas-store';
import { playbackSystem } from '../../audio/PlaybackSystem';
import styles from './BuildFromBonesPanel.module.css';

const StepIndicator: React.FC<{
  totalSteps: number;
  currentStep: number;
  stepNames: string[];
  onStepClick: (stepIndex: number) => void;
}> = ({ totalSteps, currentStep, stepNames, onStepClick }) => {
  return (
    <div className={styles.stepIndicator}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className={styles.stepItem}>
          <button
            className={`${styles.stepDot} ${i === currentStep ? styles.active : ''}`}
            onClick={() => onStepClick(i)}
            aria-label={`Go to ${stepNames[i]}`}
          >
            <span className={styles.stepNumber}>{i}</span>
          </button>
          {i < totalSteps - 1 && (
            <div className={styles.stepLine} />
          )}
        </div>
      ))}
    </div>
  );
};

const StepContent: React.FC<{
  stepNumber: number;
  stepName: string;
  description: string;
  chordCount: number;
}> = ({ stepNumber, stepName, description, chordCount }) => {
  return (
    <div className={styles.stepContent}>
      <h3 className={styles.stepTitle}>
        Step {stepNumber}: {stepName}
      </h3>
      <p className={styles.stepDescription}>{description}</p>
      <div className={styles.stepMeta}>
        {chordCount} {chordCount === 1 ? 'chord' : 'chords'} in this step
      </div>
    </div>
  );
};

export const BuildFromBonesPanel: React.FC = () => {
  const {
    isPanelOpen,
    currentStep,
    steps,
    isPlaying,
    playbackMode,
    nextStep,
    prevStep,
    jumpToStep,
    closePanel,
    setPlaying,
    setPlaybackMode,
  } = useBuildFromBonesStore();

  const { setChords } = useCanvasStore();

  // Update canvas when step changes
  useEffect(() => {
    if (steps.length > 0 && steps[currentStep]) {
      setChords(steps[currentStep].chords);
    }
  }, [currentStep, steps, setChords]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isPanelOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevStep();
      } else if (e.key === 'ArrowRight') {
        nextStep();
      } else if (e.key === 'Escape') {
        closePanel();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPanelOpen, nextStep, prevStep, closePanel]);

  const handlePlayStep = () => {
    if (isPlaying) {
      playbackSystem.stop();
      setPlaying(false);
      setPlaybackMode(null);
      return;
    }

    setPlaying(true);
    setPlaybackMode('single');
    playbackSystem.play();

    // Stop after playback completes (will be handled by playback system events)
    setTimeout(() => {
      setPlaying(false);
      setPlaybackMode(null);
    }, 10000); // 10 seconds for demo
  };

  const handlePlaySequence = async () => {
    if (isPlaying) {
      playbackSystem.stop();
      setPlaying(false);
      setPlaybackMode(null);
      return;
    }

    setPlaying(true);
    setPlaybackMode('sequence');

    for (let i = 0; i < steps.length; i++) {
      jumpToStep(i);
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for canvas update
      playbackSystem.play();
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for playback + gap
      playbackSystem.stop();
      await new Promise(resolve => setTimeout(resolve, 2000)); // Gap between steps
    }

    setPlaying(false);
    setPlaybackMode(null);
    jumpToStep(0);
  };

  const handleCompare = async () => {
    if (isPlaying) {
      playbackSystem.stop();
      setPlaying(false);
      setPlaybackMode(null);
      return;
    }

    setPlaying(true);
    setPlaybackMode('compare');

    // Play Step 0 (skeleton)
    jumpToStep(0);
    await new Promise(resolve => setTimeout(resolve, 500));
    playbackSystem.play();
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for playback
    playbackSystem.stop();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Gap

    // Play Final Step
    jumpToStep(steps.length - 1);
    await new Promise(resolve => setTimeout(resolve, 500));
    playbackSystem.play();
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for playback
    playbackSystem.stop();

    setPlaying(false);
    setPlaybackMode(null);
  };

  const handleSaveBuildUp = () => {
    // TODO: Implement save to My Progressions (Prompt 004)
    alert('Save to My Progressions - Coming in Prompt 004!');
  };

  if (!isPanelOpen || steps.length === 0) return null;

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        className={styles.panel}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>
            Build From Bones 🦴
          </h2>
          <button
            className={styles.closeButton}
            onClick={closePanel}
            aria-label="Close panel"
          >
            ×
          </button>
        </div>

        <div className={styles.panelBody}>
          {/* Step Indicator */}
          <StepIndicator
            totalSteps={steps.length}
            currentStep={currentStep}
            stepNames={steps.map(s => s.stepName)}
            onStepClick={jumpToStep}
          />

          {/* Step Content */}
          <StepContent
            stepNumber={currentStepData.stepNumber}
            stepName={currentStepData.stepName}
            description={currentStepData.description}
            chordCount={currentStepData.chords.length}
          />

          {/* Navigation Controls */}
          <div className={styles.navControls}>
            <button
              className={styles.navButton}
              onClick={prevStep}
              disabled={isPlaying}
            >
              ◄ Previous
            </button>
            <button
              className={`${styles.playButton} ${isPlaying && playbackMode === 'single' ? styles.playing : ''}`}
              onClick={handlePlayStep}
            >
              {isPlaying && playbackMode === 'single' ? '⏸ Pause' : '▶ Play This Step'}
            </button>
            <button
              className={styles.navButton}
              onClick={nextStep}
              disabled={isPlaying}
            >
              Next ►
            </button>
          </div>

          {/* Global Controls */}
          <div className={styles.globalControls}>
            <button
              className={styles.globalButton}
              onClick={handlePlaySequence}
              disabled={isPlaying && playbackMode !== 'sequence'}
            >
              {isPlaying && playbackMode === 'sequence' ? '⏸ Stop Sequence' : '▶ Play All Steps In Sequence'}
            </button>
            <button
              className={styles.globalButton}
              onClick={handleCompare}
              disabled={isPlaying && playbackMode !== 'compare'}
            >
              {isPlaying && playbackMode === 'compare' ? '⏸ Stop Comparison' : '▶ Compare Step 0 vs Final'}
            </button>
            <button
              className={styles.saveButton}
              onClick={handleSaveBuildUp}
              disabled={isPlaying}
            >
              💾 Save This Build-Up
            </button>
          </div>

          {/* Playback Status */}
          {isPlaying && (
            <div className={styles.playbackStatus}>
              {playbackMode === 'sequence' && 'Playing sequence...'}
              {playbackMode === 'compare' && currentStep === 0 && 'Before (Skeleton)'}
              {playbackMode === 'compare' && currentStep === steps.length - 1 && 'After (Final)'}
              {playbackMode === 'single' && 'Playing...'}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
