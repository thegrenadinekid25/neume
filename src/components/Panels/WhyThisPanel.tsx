import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWhyThisStore } from '@/store/why-this-store';
import { getChordExplanation } from '@/services/explanation-service';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { shouldShowEvolution } from '@/utils/chord-helpers';
import { generateEvolutionSteps, type EvolutionStep } from '@/utils/evolution-generator';
import styles from './WhyThisPanel.module.css';

/**
 * Get display name for a chord based on scale degree and quality
 */
function getChordDisplayName(scaleDegree: number, quality: string): string {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const numeral = romanNumerals[scaleDegree - 1] || 'I';

  // Minor quality uses lowercase
  if (quality === 'minor' || quality === 'min7') {
    return numeral.toLowerCase();
  }

  // Add quality suffixes
  if (quality === 'dom7') return `${numeral}7`;
  if (quality === 'maj7') return `${numeral}maj7`;
  if (quality === 'min7') return `${numeral.toLowerCase()}7`;
  if (quality === 'diminished') return `${numeral.toLowerCase()}°`;
  if (quality === 'augmented') return `${numeral}+`;

  return numeral;
}

/**
 * WhyThisPanel Component
 * Side panel that explains chord choices with AI insights, evolution chains, and playback controls
 * Slides in from the right side with semi-transparent overlay
 */
export const WhyThisPanel: React.FC = () => {
  const {
    isOpen,
    selectedChord,
    previousChord,
    nextChord,
    fullProgression,
    songContext,
    explanation,
    isLoading,
    error,
    isPlayingIsolated,
    isPlayingInProgression,
    closePanel,
    setExplanation,
    setLoading,
    setError,
    setPlayingIsolated,
    setPlayingInProgression,
    setPlayingEvolution,
  } = useWhyThisStore();

  // Audio engine for playback
  const { playChord, isReady } = useAudioEngine();

  // Fetch explanation when panel opens with a new chord
  useEffect(() => {
    if (isOpen && selectedChord && !explanation && !error) {
      const fetchExplanation = async () => {
        setLoading(true);
        try {
          const result = await getChordExplanation(
            selectedChord,
            previousChord || undefined,
            nextChord || undefined,
            fullProgression,
            songContext || undefined
          );
          setExplanation(result);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to get explanation');
        }
      };
      fetchExplanation();
    }
  }, [isOpen, selectedChord, explanation, error, previousChord, nextChord, fullProgression, songContext, setExplanation, setLoading, setError]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closePanel]);

  // Retry handler
  const handleRetry = useCallback(() => {
    if (selectedChord) {
      setError(null);
      setLoading(true);
      getChordExplanation(
        selectedChord,
        previousChord || undefined,
        nextChord || undefined,
        fullProgression,
        songContext || undefined
      )
        .then(setExplanation)
        .catch((err) => setError(err instanceof Error ? err.message : 'Failed to get explanation'));
    }
  }, [selectedChord, previousChord, nextChord, fullProgression, songContext, setExplanation, setLoading, setError]);

  // Play just this chord in isolation
  const handlePlayIsolated = useCallback(() => {
    if (!selectedChord || !isReady) return;

    setPlayingIsolated(true);

    const notes = [
      selectedChord.voices.bass,
      selectedChord.voices.tenor,
      selectedChord.voices.alto,
      selectedChord.voices.soprano,
    ].filter(Boolean);

    if (notes.length > 0) {
      playChord(notes, 2);
    }

    setTimeout(() => setPlayingIsolated(false), 2000);
  }, [selectedChord, isReady, playChord, setPlayingIsolated]);

  // Play previous → selected → next chord sequence
  const handlePlayInProgression = useCallback(async () => {
    if (!selectedChord || !isReady) return;

    setPlayingInProgression(true);

    const chordsToPlay = [previousChord, selectedChord, nextChord].filter(Boolean) as typeof selectedChord[];
    const chordDuration = 1500;
    const gap = 200;

    for (let i = 0; i < chordsToPlay.length; i++) {
      const chord = chordsToPlay[i];
      const notes = [
        chord.voices.bass,
        chord.voices.tenor,
        chord.voices.alto,
        chord.voices.soprano,
      ].filter(Boolean);

      if (notes.length > 0) {
        playChord(notes, chordDuration / 1000);
      }

      if (i < chordsToPlay.length - 1) {
        await new Promise(resolve => setTimeout(resolve, chordDuration + gap));
      }
    }

    setTimeout(() => setPlayingInProgression(false), chordDuration);
  }, [previousChord, selectedChord, nextChord, isReady, playChord, setPlayingInProgression]);

  // Play an evolution step
  const handlePlayEvolutionStep = useCallback((step: EvolutionStep) => {
    if (!isReady) return;

    setPlayingEvolution(true);

    const notes = [
      step.chord.voices.bass,
      step.chord.voices.tenor,
      step.chord.voices.alto,
      step.chord.voices.soprano,
    ].filter(Boolean);

    if (notes.length > 0) {
      playChord(notes, 2);
    }

    setTimeout(() => setPlayingEvolution(false), 2000);
  }, [isReady, playChord, setPlayingEvolution]);

  // Get chord display name
  const chordName = selectedChord
    ? getChordDisplayName(selectedChord.scaleDegree, selectedChord.quality)
    : '';

  // Determine if we should show evolution and generate steps
  const showEvolution = selectedChord && shouldShowEvolution(selectedChord.quality);
  const evolutionSteps = showEvolution ? generateEvolutionSteps(selectedChord) : [];

  const content = (
    <AnimatePresence>
      {isOpen && (
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
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            role="complementary"
            aria-modal="false"
            aria-labelledby="why-this-title"
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerContent}>
                <h2 id="why-this-title" className={styles.title}>
                  Why This {chordName}?
                </h2>
                <p className={styles.subtitle}>
                  Understanding this chord choice
                </p>
              </div>
              <button
                className={styles.closeButton}
                onClick={closePanel}
                aria-label="Close panel"
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Main content */}
            <div className={styles.content}>
              {/* Loading State */}
              {isLoading && (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner} />
                  <p className={styles.loadingText}>
                    Analyzing chord choice...
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className={styles.errorContainer}>
                  <div className={styles.errorIcon}>⚠</div>
                  <p className={styles.errorMessage}>{error}</p>
                  <button
                    className={styles.retryButton}
                    onClick={handleRetry}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Content State */}
              {!isLoading && !error && explanation && (
                <>
                  {/* Contextual Explanation Section */}
                  <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Context</h3>
                    <div className={styles.explanationBox}>
                      <p className={styles.explanationText}>
                        {explanation.contextual}
                      </p>
                    </div>
                  </section>

                  {/* Technical Analysis Section */}
                  {explanation.technical && (
                    <section className={styles.section}>
                      <h3 className={styles.sectionTitle}>Technical Analysis</h3>
                      <div className={styles.explanationBox}>
                        <p className={styles.explanationText}>
                          {explanation.technical}
                        </p>
                      </div>
                    </section>
                  )}

                  {/* Historical Context Section */}
                  {explanation.historical && (
                    <section className={styles.section}>
                      <h3 className={styles.sectionTitle}>Historical Context</h3>
                      <div className={styles.explanationBox}>
                        <p className={styles.explanationText}>
                          {explanation.historical}
                        </p>
                      </div>
                    </section>
                  )}

                  {/* Evolution Chain Section - only for complex chords */}
                  {showEvolution && evolutionSteps.length > 0 && (
                    <section className={styles.section}>
                      <h3 className={styles.sectionTitle}>Evolution</h3>
                      <p className={styles.sectionSubtitle}>
                        How this chord builds from simpler foundations
                      </p>
                      <div className={styles.evolutionChain}>
                        {evolutionSteps.map((step, index) => (
                          <div key={index} className={styles.evolutionStep}>
                            <div className={styles.stepNumber}>{index + 1}</div>
                            <div className={styles.stepContent}>
                              <div className={styles.stepChord}>
                                {step.name}
                              </div>
                              <div className={styles.stepDescription}>
                                {step.description}
                              </div>
                            </div>
                            <button
                              className={`${styles.playButton} ${styles.stepPlay}`}
                              onClick={() => handlePlayEvolutionStep(step)}
                              disabled={!isReady}
                              aria-label={`Play ${step.name}`}
                            >
                              <span className={styles.playIcon}>▶</span>
                            </button>
                            {index < evolutionSteps.length - 1 && (
                              <div className={styles.stepArrow}>→</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Play Controls Section */}
                  <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Listen</h3>
                    <div className={styles.playControls}>
                      <button
                        className={`${styles.playButton} ${styles.primary} ${isPlayingIsolated ? styles.playing : ''}`}
                        onClick={handlePlayIsolated}
                        disabled={!isReady}
                        title="Play this chord in isolation"
                      >
                        <span className={styles.playIcon}>{isPlayingIsolated ? '■' : '▶'}</span>
                        Play Isolated
                      </button>
                      <button
                        className={`${styles.playButton} ${styles.secondary} ${isPlayingInProgression ? styles.playing : ''}`}
                        onClick={handlePlayInProgression}
                        disabled={!isReady}
                        title="Play previous → this → next chord"
                      >
                        <span className={styles.playIcon}>{isPlayingInProgression ? '■' : '▶'}</span>
                        In Context
                      </button>
                    </div>
                  </section>
                </>
              )}

              {/* Empty State */}
              {!isLoading && !error && !explanation && (
                <div className={styles.emptyState}>
                  <p>Select a chord and click "Why This?" to see an explanation.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
