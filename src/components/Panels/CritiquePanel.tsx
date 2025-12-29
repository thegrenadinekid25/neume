/**
 * CritiquePanel Component
 * Side panel displaying harmonic critique analysis results
 * Identifies voice leading issues, unresolved tensions, and harmonic problems
 */

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCritiqueStore } from '@/store/critique-store';
import { CritiqueIssueCard } from './CritiqueIssueCard';
import styles from './CritiquePanel.module.css';

interface CritiquePanelProps {
  onSelectChords?: (ids: string[]) => void;
}

/**
 * Get color class for score badge based on harmonic quality
 */
function getScoreBadgeClass(score: number): 'excellent' | 'good' | 'poor' {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  return 'poor';
}

/**
 * CritiquePanel Component
 * Displays harmonic analysis with issue cards organized by severity
 */
export const CritiquePanel: React.FC<CritiquePanelProps> = ({
  onSelectChords,
}) => {
  const {
    isOpen,
    issues,
    summary,
    score,
    isLoading,
    error,
    highlightedIssueId,
    closePanel,
    setHighlightedIssue,
  } = useCritiqueStore();

  // Group issues by severity
  const errorIssues = issues.filter(i => i.severity === 'error');
  const warningIssues = issues.filter(i => i.severity === 'warning');
  const suggestionIssues = issues.filter(i => i.severity === 'suggestion');

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

  // Retry handler - would need parent to handle this
  // Since the panel is stateless, we rely on parent component to set error/loading

  // Handle show chords - highlight them in the canvas
  const handleShowChords = useCallback((chordIds: string[]) => {
    onSelectChords?.(chordIds);
  }, [onSelectChords]);

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
            aria-labelledby="critique-title"
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerContent}>
                <h2 id="critique-title" className={styles.title}>
                  Harmonic Critique
                </h2>
                <p className={styles.subtitle}>
                  Voice leading analysis
                </p>
              </div>

              {score !== null && !isLoading && !error && (
                <div
                  className={`${styles.scoreBadge} ${styles[getScoreBadgeClass(score)]}`}
                  title={`Harmonic quality score: ${score}%`}
                >
                  {score}
                </div>
              )}

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
                    Analyzing voice leading...
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className={styles.errorContainer}>
                  <div className={styles.errorIcon}>⚠</div>
                  <p className={styles.errorMessage}>{error}</p>
                </div>
              )}

              {/* Content State */}
              {!isLoading && !error && score !== null && (
                <>
                  {/* Summary */}
                  {summary && (
                    <div className={styles.summary}>
                      <p className={styles.summaryText}>
                        {summary}
                      </p>
                    </div>
                  )}

                  {/* Issues organized by severity */}
                  <div className={styles.issuesList}>
                    {/* Error Issues */}
                    {errorIssues.length > 0 && (
                      <div className={styles.issuesSection}>
                        <h3 className={styles.sectionHeader}>
                          Errors ({errorIssues.length})
                        </h3>
                        {errorIssues.map((issue) => (
                          <CritiqueIssueCard
                            key={issue.id}
                            issue={issue}
                            isHighlighted={highlightedIssueId === issue.id}
                            onShowChords={handleShowChords}
                            onHighlight={setHighlightedIssue}
                          />
                        ))}
                      </div>
                    )}

                    {/* Warning Issues */}
                    {warningIssues.length > 0 && (
                      <div className={styles.issuesSection}>
                        <h3 className={styles.sectionHeader}>
                          Warnings ({warningIssues.length})
                        </h3>
                        {warningIssues.map((issue) => (
                          <CritiqueIssueCard
                            key={issue.id}
                            issue={issue}
                            isHighlighted={highlightedIssueId === issue.id}
                            onShowChords={handleShowChords}
                            onHighlight={setHighlightedIssue}
                          />
                        ))}
                      </div>
                    )}

                    {/* Suggestion Issues */}
                    {suggestionIssues.length > 0 && (
                      <div className={styles.issuesSection}>
                        <h3 className={styles.sectionHeader}>
                          Suggestions ({suggestionIssues.length})
                        </h3>
                        {suggestionIssues.map((issue) => (
                          <CritiqueIssueCard
                            key={issue.id}
                            issue={issue}
                            isHighlighted={highlightedIssueId === issue.id}
                            onShowChords={handleShowChords}
                            onHighlight={setHighlightedIssue}
                          />
                        ))}
                      </div>
                    )}

                    {/* No issues */}
                    {issues.length === 0 && (
                      <div className={styles.emptyState}>
                        <p>Excellent! No harmonic issues detected in this progression.</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Empty State */}
              {!isLoading && !error && score === null && (
                <div className={styles.emptyState}>
                  <p>Add some chords and click "Critique" to analyze voice leading and harmony.</p>
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
