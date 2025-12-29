/**
 * CritiqueIssueCard Component
 * Individual issue display with severity indicator and action buttons
 */

import React from 'react';
import type { CritiqueIssue } from '@/types/critique';
import styles from './CritiquePanel.module.css';

interface CritiqueIssueCardProps {
  issue: CritiqueIssue;
  isHighlighted: boolean;
  onShowChords: (chordIds: string[]) => void;
  onHighlight: (issueId: string | null) => void;
}

export const CritiqueIssueCard: React.FC<CritiqueIssueCardProps> = ({
  issue,
  isHighlighted,
  onShowChords,
  onHighlight,
}) => {
  // Get icon based on severity
  const getIcon = (severity: string): string => {
    switch (severity) {
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'suggestion':
        return '💡';
      default:
        return 'ℹ';
    }
  };

  return (
    <div
      className={`${styles.issueCard} ${isHighlighted ? styles.highlighted : ''}`}
      onMouseEnter={() => onHighlight(issue.id)}
      onMouseLeave={() => onHighlight(null)}
    >
      <div className={`${styles.issueIcon} ${styles[issue.severity]}`}>
        {getIcon(issue.severity)}
      </div>

      <div className={styles.issueContent}>
        <h4 className={styles.issueTitle}>{issue.title}</h4>
        <p className={styles.issueDescription}>{issue.description}</p>

        {issue.suggestion && (
          <p className={styles.issueSuggestion}>
            <strong>Suggestion:</strong> {issue.suggestion}
          </p>
        )}

        {issue.voice && (
          <p className={styles.issueDescription} style={{ marginTop: 'var(--spacing-xs)' }}>
            <strong>Voice:</strong> {issue.voice.charAt(0).toUpperCase() + issue.voice.slice(1)}
          </p>
        )}
      </div>

      <div className={styles.issueButtons}>
        <button
          className={styles.showButton}
          onClick={() => onShowChords(issue.chordIds)}
          title={`Highlight chord(s) ${issue.chordIds.join(', ')}`}
        >
          Show
        </button>
      </div>
    </div>
  );
};
