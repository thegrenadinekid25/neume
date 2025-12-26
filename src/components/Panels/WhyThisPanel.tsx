import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chord } from '@types';
import { getChordExplanation } from '@/services/api-service';
import { ChordExplanation } from '@/types/explanation';
import styles from './WhyThisPanel.module.css';

interface WhyThisPanelProps {
  chord: Chord;
  previousChord: Chord | null;
  nextChord: Chord | null;
  onClose: () => void;
}

export const WhyThisPanel: React.FC<WhyThisPanelProps> = ({
  chord,
  previousChord,
  nextChord,
  onClose,
}) => {
  const [explanation, setExplanation] = useState<ChordExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExplanation();
  }, [chord.id]);

  const loadExplanation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getChordExplanation(
        chord,
        previousChord,
        nextChord,
        chord.key,
        chord.mode
      );

      setExplanation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load explanation');
    } finally {
      setIsLoading(false);
    }
  };

  const getRomanNumeral = () => {
    const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    let numeral = numerals[chord.scaleDegree - 1];

    if (chord.quality.includes('minor') || chord.quality.includes('dim')) {
      numeral = numeral.toLowerCase();
    }

    if (chord.quality === 'diminished') {
      numeral += '°';
    } else if (chord.quality === 'augmented') {
      numeral += '+';
    } else if (chord.quality === 'dom7') {
      numeral += '7';
    } else if (chord.quality === 'maj7') {
      numeral += 'maj7';
    }

    return numeral;
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.panel}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Why This Chord?</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {/* Chord Info */}
        <div className={styles.chordInfo}>
          <div className={styles.romanNumeral}>{getRomanNumeral()}</div>
          <div className={styles.chordDetails}>
            <div>{chord.quality} chord</div>
            <div className={styles.chordKey}>
              in {chord.key} {chord.mode}
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className={styles.explanation}>
          {isLoading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Generating explanation...</p>
            </div>
          ) : error ? (
            <div className={styles.error}>
              <p>{error}</p>
              <button className={styles.retryButton} onClick={loadExplanation}>
                Retry
              </button>
            </div>
          ) : explanation ? (
            <>
              <div className={styles.section}>
                <h3>Why This Chord?</h3>
                <p>{explanation.context}</p>
              </div>

              {explanation.evolutionSteps && explanation.evolutionSteps.length > 0 && (
                <div className={styles.section}>
                  <h3>Evolution Chain</h3>
                  <div className={styles.evolutionSteps}>
                    {explanation.evolutionSteps.map((step, index) => (
                      <div key={index} className={styles.evolutionStep}>
                        <div className={styles.stepNumber}>{index + 1}</div>
                        <div className={styles.stepContent}>
                          <div className={styles.stepChord}>{step.chord}</div>
                          <div className={styles.stepDescription}>{step.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {explanation.emotion && (
                <div className={styles.section}>
                  <h3>Emotional Effect</h3>
                  <p>{explanation.emotion}</p>
                </div>
              )}

              {explanation.examples && explanation.examples.length > 0 && (
                <div className={styles.section}>
                  <h3>Used By</h3>
                  <div className={styles.examples}>
                    {explanation.examples.map((example, index) => (
                      <span key={index} className={styles.exampleTag}>
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Context */}
        {(previousChord || nextChord) && (
          <div className={styles.context}>
            <h3>Context</h3>
            <div className={styles.contextChords}>
              {previousChord && (
                <div className={styles.contextChord}>
                  <span className={styles.contextLabel}>Previous:</span>
                  <span className={styles.contextValue}>
                    {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][
                      previousChord.scaleDegree - 1
                    ]}
                  </span>
                </div>
              )}
              {nextChord && (
                <div className={styles.contextChord}>
                  <span className={styles.contextLabel}>Next:</span>
                  <span className={styles.contextValue}>
                    {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][nextChord.scaleDegree - 1]}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
