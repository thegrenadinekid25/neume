import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { track } from '@/utils/analytics';
import styles from './FeedbackWidget.module.css';

type FeedbackType = 'bug' | 'feature' | 'general';

interface FeedbackItem {
  id: string;
  type: FeedbackType;
  message: string;
  timestamp: string;
}

interface FeedbackWidgetProps {
  onFeedbackSubmitted?: (feedback: FeedbackItem) => void;
}

const FEEDBACK_STORAGE_KEY = 'neume_feedback_items';
const MAX_MESSAGE_LENGTH = 500;

/**
 * Get all stored feedback items from localStorage
 */
function getFeedbackItems(): FeedbackItem[] {
  try {
    const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('[FeedbackWidget] Failed to retrieve feedback:', error);
    return [];
  }
}

/**
 * Save feedback item to localStorage
 */
function saveFeedbackItem(feedback: FeedbackItem): void {
  try {
    const items = getFeedbackItems();
    items.push(feedback);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('[FeedbackWidget] Failed to save feedback:', error);
  }
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ onFeedbackSubmitted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const handleOpenModal = useCallback(() => {
    setIsOpen(true);
    track('feedback_submitted', { action: 'modal_opened' });
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsOpen(false);
    setMessage('');
    setFeedbackType('general');
  }, []);

  const handleSubmitFeedback = useCallback(() => {
    if (!message.trim()) return;

    const feedbackItem: FeedbackItem = {
      id: `feedback-${Date.now()}`,
      type: feedbackType,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    // Save to localStorage
    saveFeedbackItem(feedbackItem);

    // Track analytics
    track('feedback_submitted', {
      type: feedbackType,
      messageLength: message.length,
    });

    // Call callback if provided
    if (onFeedbackSubmitted) {
      onFeedbackSubmitted(feedbackItem);
    }

    // Show success message
    setShowSuccess(true);
    setMessage('');
    setFeedbackType('general');

    // Auto-close modal after success
    successTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setShowSuccess(false);
    }, 2000);
  }, [message, feedbackType, onFeedbackSubmitted]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  }, [handleCloseModal]);

  const isMessageValid = message.trim().length > 0;
  const characterCount = message.length;
  const characterCountClass =
    characterCount > MAX_MESSAGE_LENGTH
      ? styles.error
      : characterCount > MAX_MESSAGE_LENGTH * 0.9
      ? styles.warning
      : '';

  const feedbackIcon = feedbackType === 'bug' ? 'Bug' : feedbackType === 'feature' ? 'Feature' : 'Feedback';

  return (
    <>
      {/* Floating Feedback Button */}
      <motion.button
        className={styles.feedbackButton}
        onClick={handleOpenModal}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Send feedback"
        aria-label="Send feedback"
      >
        ?
      </motion.button>

      {/* Feedback Modal */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                className={styles.backdrop}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleBackdropClick}
              />

              {/* Modal */}
              <motion.div
                className={styles.modal}
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.2 }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="feedback-title"
              >
                {/* Close button */}
                <motion.button
                  className={styles.closeButton}
                  onClick={handleCloseModal}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="Close feedback form"
                  aria-label="Close feedback form"
                >
                  ✕
                </motion.button>

                <h2 id="feedback-title">
                  {feedbackIcon} Send Feedback
                </h2>
                <p>Help us improve Neume by sharing your thoughts, bug reports, or feature ideas.</p>

                {/* Feedback Type Selector */}
                <div className={styles.formGroup}>
                  <label>
                    Feedback Type <span>*</span>
                  </label>
                  <div className={styles.typeSelector}>
                    {(['bug', 'feature', 'general'] as FeedbackType[]).map((type) => (
                      <button
                        key={type}
                        className={`${styles.typeButton} ${feedbackType === type ? styles.active : ''}`}
                        onClick={() => {
                          setFeedbackType(type);
                          track('feedback_type_selected', { type });
                        }}
                        aria-pressed={feedbackType === type}
                      >
                        {type === 'bug' ? 'Bug' : type === 'feature' ? 'Feature' : 'General'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Textarea */}
                <div className={styles.formGroup}>
                  <label htmlFor="feedback-message">
                    Message <span>*</span>
                  </label>
                  <textarea
                    id="feedback-message"
                    ref={textareaRef}
                    className={styles.textarea}
                    placeholder="Tell us what you think..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={MAX_MESSAGE_LENGTH}
                  />
                  <div className={`${styles.characterCount} ${characterCountClass}`}>
                    {characterCount} / {MAX_MESSAGE_LENGTH}
                  </div>
                </div>

                {/* Success Message */}
                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={styles.successMessage}
                    >
                      <p>✓ Thank you for your feedback!</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Buttons */}
                <div className={styles.buttons}>
                  <button
                    className={styles.cancelButton}
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.submitButton}
                    onClick={handleSubmitFeedback}
                    disabled={!isMessageValid}
                  >
                    Send Feedback
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

// Export storage utility functions for development
export { getFeedbackItems, saveFeedbackItem };
