import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRefineStore, Suggestion } from '../../store/refine-store';
import { useCanvasStore } from '../../store/canvas-store';
import { getSuggestions } from '../../services/api-service';
import { playbackSystem } from '../../audio/PlaybackSystem';
import { Spinner } from '../UI/Spinner';
import styles from './RefineThisModal.module.css';

const SuggestionCard: React.FC<{
  suggestion: Suggestion;
  onApply: () => void;
  onPreview: () => void;
}> = ({ suggestion, onApply, onPreview }) => {
  return (
    <div className={styles.suggestionCard}>
      <h4 className={styles.suggestionTitle}>
        {suggestion.technique}
      </h4>
      <p className={styles.suggestionRationale}>
        {suggestion.rationale}
      </p>
      {suggestion.examples && suggestion.examples.length > 0 && (
        <div className={styles.examples}>
          {suggestion.examples.map((example, i) => (
            <span key={i} className={styles.exampleTag}>
              {example}
            </span>
          ))}
        </div>
      )}
      <div className={styles.suggestionActions}>
        <button
          className={styles.previewButton}
          onClick={onPreview}
        >
          ▶ Preview
        </button>
        <button
          className={styles.applyButton}
          onClick={onApply}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export const RefineThisModal: React.FC = () => {
  const {
    isModalOpen,
    selectedChordIds,
    userIntent,
    suggestions,
    isLoading,
    error,
    closeModal,
    setUserIntent,
    setSuggestions,
    setLoading,
    setError,
    clearSuggestions,
  } = useRefineStore();

  const { chords, updateChord } = useCanvasStore();
  const [showIterativeInput, setShowIterativeInput] = useState(false);

  const selectedChords = chords.filter(c => selectedChordIds.includes(c.id));

  const handleSubmit = async () => {
    if (!userIntent.trim()) {
      setError('Please describe what you want to feel');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getSuggestions(
        userIntent,
        selectedChords,
        selectedChords[0]?.key || 'C',
        selectedChords[0]?.mode || 'major'
      );

      setSuggestions(result);
    } catch (err) {
      setError('Failed to get suggestions. Please try again.');
      console.error(err);
    }
  };

  const handleSurpriseMe = async () => {
    setUserIntent('Surprise me with something unexpected');
    setLoading(true);
    setError(null);

    try {
      const result = await getSuggestions(
        'Surprise me with something unexpected',
        selectedChords,
        selectedChords[0]?.key || 'C',
        selectedChords[0]?.mode || 'major'
      );

      setSuggestions(result);
    } catch (err) {
      setError('Failed to get suggestions. Please try again.');
      console.error(err);
    }
  };

  const handlePreview = (suggestion: Suggestion) => {
    // Temporarily update chord for preview
    const originalChord = chords.find(c => c.id === suggestion.targetChordId);
    if (!originalChord) return;

    // Update to suggested chord
    updateChord(suggestion.targetChordId, suggestion.to);

    // Play
    playbackSystem.play();

    // Restore after playback (10 seconds)
    setTimeout(() => {
      updateChord(suggestion.targetChordId, originalChord);
      playbackSystem.stop();
    }, 10000);
  };

  const handleApply = (suggestion: Suggestion) => {
    updateChord(suggestion.targetChordId, suggestion.to);
    // Keep modal open so user can try more suggestions
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isModalOpen) return null;

  const examplePrompts = [
    "More ethereal and floating",
    "Darker and more grounded",
    "Like Arvo Pärt but warmer",
    "Renaissance outside, Romantic inside"
  ];

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={closeModal}>
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <h2>✨ Refine This</h2>
            <button
              className={styles.closeButton}
              onClick={closeModal}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          <div className={styles.modalBody}>
            {suggestions.length === 0 ? (
              <>
                <label className={styles.label}>
                  How should this feel?
                </label>
                <textarea
                  className={styles.textarea}
                  value={userIntent}
                  onChange={(e) => setUserIntent(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your intent here..."
                  rows={4}
                  disabled={isLoading}
                />

                <div className={styles.examples}>
                  <p className={styles.examplesLabel}>Examples:</p>
                  {examplePrompts.map((prompt, i) => (
                    <button
                      key={i}
                      className={styles.exampleChip}
                      onClick={() => setUserIntent(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {error && (
                  <div className={styles.error}>{error}</div>
                )}

                <div className={styles.buttonRow}>
                  <button
                    className={styles.submitButton}
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" />
                        <span style={{ marginLeft: '8px' }}>Getting suggestions...</span>
                      </>
                    ) : (
                      'Get Suggestions'
                    )}
                  </button>
                  <button
                    className={styles.surpriseButton}
                    onClick={handleSurpriseMe}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" />
                        <span style={{ marginLeft: '8px' }}>Surprising...</span>
                      </>
                    ) : (
                      '🎲 Surprise Me'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.suggestionsHeader}>
                  <h3>Suggestions for "{userIntent}"</h3>
                  <button
                    className={styles.backButton}
                    onClick={clearSuggestions}
                  >
                    ← Try different prompt
                  </button>
                </div>

                <div className={styles.suggestionsList}>
                  {suggestions.map((suggestion) => (
                    <SuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onApply={() => handleApply(suggestion)}
                      onPreview={() => handlePreview(suggestion)}
                    />
                  ))}
                </div>

                {!showIterativeInput && (
                  <button
                    className={styles.iterativeButton}
                    onClick={() => setShowIterativeInput(true)}
                  >
                    Not quite right? Try again...
                  </button>
                )}

                {showIterativeInput && (
                  <div className={styles.iterativeSection}>
                    <label className={styles.label}>
                      What didn't work?
                    </label>
                    <textarea
                      className={styles.textarea}
                      placeholder="E.g., 'Too subtle, I can barely hear the difference'"
                      rows={3}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                    />
                    <button
                      className={styles.submitButton}
                      onClick={handleSubmit}
                    >
                      Get Better Suggestions
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
