import { useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNarrativeComposerStore, EXAMPLE_NARRATIVES } from '@/store/narrative-composer-store';
import { useCanvasStore } from '@/store/canvas-store';
import type { StyleReference } from '@/types';
import styles from './NarrativeComposerModal.module.css';

const STYLES: { id: StyleReference; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'lauridsen', label: 'Lauridsen' },
  { id: 'part', label: 'Pärt' },
  { id: 'whitacre', label: 'Whitacre' },
  { id: 'bach', label: 'Bach' },
  { id: 'debussy', label: 'Debussy' },
];

const BAR_OPTIONS = [4, 8, 16, 32];

function formatChordName(chord: { scaleDegree: number; quality: string }): string {
  const degrees = ['', 'I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
  const base = degrees[chord.scaleDegree] || chord.scaleDegree.toString();

  if (chord.quality === 'dom7') return `${base}7`;
  if (chord.quality === 'maj7') return `${base}maj7`;
  if (chord.quality === 'min7') return `${base}m7`;
  if (chord.quality === 'diminished') return `${base}°`;
  if (chord.quality === 'augmented') return `${base}+`;

  return base;
}

export function NarrativeComposerModal() {
  const {
    isModalOpen,
    narrative,
    styleReference,
    barCount,
    isLoading,
    error,
    result,
    generatedChords,
    closeModal,
    setNarrative,
    setStyleReference,
    setBarCount,
    selectExample,
    generate,
    reset,
  } = useNarrativeComposerStore();

  const loadAnalyzedProgression = useCanvasStore((state) => state.loadAnalyzedProgression);
  const tempo = useCanvasStore((state) => state.tempo);

  const handleApply = useCallback(() => {
    if (generatedChords.length > 0 && result) {
      loadAnalyzedProgression({
        chords: generatedChords,
        key: result.key,
        mode: result.mode,
        tempo: tempo, // Keep current tempo
      });
      reset();
      closeModal();
    }
  }, [generatedChords, result, loadAnalyzedProgression, tempo, reset, closeModal]);

  const handleClose = useCallback(() => {
    closeModal();
  }, [closeModal]);

  if (!isModalOpen) return null;

  const showResults = result && !isLoading;
  const showForm = !isLoading && !result;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <h2 className={styles.title}>Compose from Narrative</h2>
            <button className={styles.closeButton} onClick={handleClose}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className={styles.content}>
            {isLoading && (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p className={styles.loadingText}>Composing your progression...</p>
              </div>
            )}

            {showForm && (
              <>
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.section}>
                  <label className={styles.label}>How should this progression feel?</label>
                  <textarea
                    className={styles.textarea}
                    value={narrative}
                    onChange={(e) => setNarrative(e.target.value)}
                    placeholder="Describe the emotional journey... e.g., 'Start mysterious, build tension, triumphant resolution'"
                  />
                </div>

                <div className={styles.section}>
                  <label className={styles.label}>Style Reference</label>
                  <div className={styles.styleGrid}>
                    {STYLES.map((style) => (
                      <button
                        key={style.id}
                        className={`${styles.styleButton} ${styleReference === style.id ? styles.active : ''}`}
                        onClick={() => setStyleReference(style.id)}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.section}>
                  <label className={styles.label}>Length</label>
                  <div className={styles.barGrid}>
                    {BAR_OPTIONS.map((bars) => (
                      <button
                        key={bars}
                        className={`${styles.barButton} ${barCount === bars ? styles.active : ''}`}
                        onClick={() => setBarCount(bars)}
                      >
                        {bars} bars
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.section}>
                  <label className={styles.label}>Examples to try</label>
                  <div className={styles.examples}>
                    {EXAMPLE_NARRATIVES.slice(0, 3).map((example, i) => (
                      <button
                        key={i}
                        className={styles.exampleButton}
                        onClick={() => selectExample(i)}
                      >
                        "{example}"
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {showResults && (
              <>
                <div className={styles.resultSection}>
                  <div className={styles.resultLabel}>AI Explanation</div>
                  <div className={styles.explanation}>{result.explanation}</div>
                </div>

                <div className={styles.resultSection}>
                  <div className={styles.resultLabel}>Emotional Mapping</div>
                  <div className={styles.phaseList}>
                    {result.emotionalMapping.map((phase, i) => (
                      <div key={i} className={styles.phase}>
                        <div className={styles.phaseName}>{phase.phase}</div>
                        <div className={styles.phaseDescription}>{phase.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.resultSection}>
                  <div className={styles.resultLabel}>Generated Chords</div>
                  <div className={styles.chordPreview}>
                    {result.chords.map((chord, i) => (
                      <span key={i} className={styles.previewChord}>
                        {formatChordName(chord)}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className={styles.footer}>
            <button className={styles.cancelButton} onClick={handleClose}>
              Cancel
            </button>
            {showForm && (
              <button
                className={styles.generateButton}
                onClick={generate}
                disabled={!narrative.trim()}
              >
                Generate
              </button>
            )}
            {showResults && (
              <>
                <button className={styles.cancelButton} onClick={reset}>
                  Try Again
                </button>
                <button className={styles.applyButton} onClick={handleApply}>
                  Apply to Canvas
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
