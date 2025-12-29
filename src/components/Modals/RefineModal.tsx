import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRefineStore, getSuggestions, type Suggestion } from '@/store/refine-store';
import { useCanvasStore } from '@/store/canvas-store';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import styles from './RefineModal.module.css';

// Example prompts to help users
const EXAMPLE_PROMPTS = [
  'More ethereal and floating',
  'Darker and more grounded',
  'Like Arvo Pärt but warmer',
  'Renaissance outside, Romantic inside',
  'Minimalist but lush',
  'Jazz-influenced harmony',
];

export const RefineModal: React.FC = () => {
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
    applySuggestion,
    clearSuggestions,
  } = useRefineStore();

  const { chords } = useCanvasStore();
  const { playChord } = useAudioEngine();

  // Local state for preview
  const [previewingSuggestionId, setPreviewingSuggestionId] = useState<string | null>(null);

  // Get selected chords for refinement
  const selectedChords = chords.filter((c) => selectedChordIds.includes(c.id));

  // Handle getting suggestions from API
  const handleGetSuggestions = async () => {
    if (!userIntent.trim() || selectedChords.length === 0) {
      setError('Please enter an intent and select at least one chord');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newSuggestions = await getSuggestions(userIntent, selectedChords);
      setSuggestions(newSuggestions);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate suggestions'
      );
    }
  };

  // Preview a suggestion by playing it
  const handlePreview = async (suggestion: Suggestion) => {
    setPreviewingSuggestionId(suggestion.id);

    try {
      // Play the original chord using its voices
      const fromNotes = Object.values(suggestion.from.voices);
      playChord(fromNotes, 1000);

      // Small pause
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Play the refined chord using its voices
      const toNotes = Object.values(suggestion.to.voices);
      playChord(toNotes, 1000);

      // Wait for playback to finish
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      console.error('Preview failed:', err);
    }

    setPreviewingSuggestionId(null);
  };

  // Apply suggestion and update canvas
  const handleApply = (suggestion: Suggestion) => {
    // Update the chord in the canvas store
    useCanvasStore.getState().updateChord(suggestion.targetChordId, {
      quality: suggestion.to.quality,
      extensions: suggestion.to.extensions,
      isChromatic: suggestion.to.isChromatic,
      chromaticType: suggestion.to.chromaticType,
    });

    // Mark as applied
    applySuggestion(suggestion.id);

    // Show feedback
    setError(null);
  };

  // Surprise me - get random suggestion
  const handleSurpriseMe = async () => {
    if (selectedChords.length === 0) {
      setError('Please select at least one chord first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Generate with a special "surprise" intent
      const allSuggestions = await getSuggestions('surprising and unexpected', selectedChords);
      const surpriseSuggestion = allSuggestions[Math.floor(Math.random() * allSuggestions.length)];

      if (surpriseSuggestion) {
        setSuggestions([surpriseSuggestion]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate surprise suggestion'
      );
    }
  };

  // Try again - clear suggestions and reset
  const handleTryAgain = () => {
    clearSuggestions();
    setUserIntent('');
    setError(null);
  };

  // Close modal with keyboard
  useEffect(() => {
    if (!isModalOpen || isLoading) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isLoading, closeModal]);

  const content = (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !isLoading && closeModal()}
          />

          {/* Modal */}
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="refine-title"
          >
            {/* Header */}
            <div className={styles.header}>
              <h2 id="refine-title">Refine This</h2>
              <button
                className={styles.closeButton}
                onClick={closeModal}
                disabled={isLoading}
                aria-label="Close modal"
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
              {/* Show input form before suggestions */}
              {suggestions.length === 0 && (
                <>
                  <div className={styles.inputGroup}>
                    <label htmlFor="intent-input" className={styles.inputLabel}>
                      How should this feel?
                    </label>
                    <textarea
                      id="intent-input"
                      className={styles.textarea}
                      placeholder="Type your intent here..."
                      value={userIntent}
                      onChange={(e) => setUserIntent(e.target.value)}
                      disabled={isLoading}
                      rows={4}
                    />
                  </div>

                  {/* Example prompts */}
                  <div className={styles.examplesSection}>
                    <p className={styles.examplesTitle}>Examples:</p>
                    <div className={styles.examplesList}>
                      {EXAMPLE_PROMPTS.map((prompt, idx) => (
                        <button
                          key={idx}
                          className={styles.examplePrompt}
                          onClick={() => setUserIntent(prompt)}
                          disabled={isLoading}
                          title={prompt}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error display */}
                  {error && (
                    <motion.div
                      className={styles.errorBox}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {error}
                    </motion.div>
                  )}
                </>
              )}

              {/* Show suggestions after submit */}
              {suggestions.length > 0 && (
                <motion.div
                  className={styles.suggestionsContainer}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className={styles.suggestionsTitle}>
                    Suggestions for "{userIntent}"
                  </h3>

                  <div className={styles.suggestionsList}>
                    {suggestions.map((suggestion, idx) => (
                      <motion.div
                        key={suggestion.id}
                        className={styles.suggestionCard}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className={styles.suggestionHeader}>
                          <h4 className={styles.suggestionTechnique}>
                            {idx + 1}. {formatTechniqueName(suggestion.technique)}
                          </h4>
                          <div className={styles.relevanceScore}>
                            {Math.round(suggestion.relevanceScore * 100)}%
                          </div>
                        </div>

                        <p className={styles.suggestionRationale}>
                          {suggestion.rationale}
                        </p>

                        {suggestion.examples.length > 0 && (
                          <p className={styles.suggestionExamples}>
                            {suggestion.examples.join(', ')}
                          </p>
                        )}

                        <div className={styles.suggestionActions}>
                          <button
                            className={styles.previewButton}
                            onClick={() => handlePreview(suggestion)}
                            disabled={previewingSuggestionId !== null || isLoading}
                            title="Preview this suggestion"
                          >
                            {previewingSuggestionId === suggestion.id ? (
                              <>
                                <span className={styles.playIcon}>♪</span> Playing
                              </>
                            ) : (
                              <>
                                <span className={styles.playIcon}>▶</span> Preview
                              </>
                            )}
                          </button>
                          <button
                            className={styles.applyButton}
                            onClick={() => handleApply(suggestion)}
                            disabled={previewingSuggestionId !== null || isLoading}
                            title="Apply this suggestion to the chord"
                          >
                            Apply
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Try again and surprise buttons */}
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.tryAgainButton}
                      onClick={handleTryAgain}
                      disabled={isLoading}
                    >
                      ← Try Different Intent
                    </button>
                    <button
                      className={styles.surpriseButton}
                      onClick={handleSurpriseMe}
                      disabled={isLoading}
                    >
                      Surprise Me
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Loading state */}
              {isLoading && (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner} />
                  <p className={styles.loadingText}>Generating suggestions...</p>
                </div>
              )}
            </div>

            {/* Footer with main action button */}
            {suggestions.length === 0 && (
              <div className={styles.footer}>
                <button
                  className={styles.cancelButton}
                  onClick={closeModal}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleGetSuggestions}
                  disabled={!userIntent.trim() || selectedChords.length === 0 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className={styles.miniSpinner} />
                      Generating...
                    </>
                  ) : (
                    'Get Suggestions'
                  )}
                </button>
              </div>
            )}

            {/* Footer when showing suggestions */}
            {suggestions.length > 0 && (
              <div className={styles.footer}>
                <button
                  className={styles.cancelButton}
                  onClick={closeModal}
                  disabled={isLoading}
                >
                  Done
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

/**
 * Format technique name from camelCase/snake_case to Title Case
 */
function formatTechniqueName(technique: string): string {
  return technique
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
