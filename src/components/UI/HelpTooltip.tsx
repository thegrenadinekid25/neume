/**
 * HelpTooltip Component
 *
 * A reusable tooltip component for displaying help content.
 * Can be used with the HELP_CONTENT system for consistent help text across the application.
 *
 * Usage:
 * <HelpTooltip content="This is helpful information">
 *   <button>Hover for help</button>
 * </HelpTooltip>
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './HelpTooltip.module.css';

export interface HelpTooltipProps {
  /** The help content to display */
  content: string;
  /** Optional title for the tooltip */
  title?: string;
  /** Position of the tooltip relative to the trigger element */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay before showing tooltip in milliseconds */
  delay?: number;
  /** Optional className for styling */
  className?: string;
  /** The element that triggers the tooltip */
  children: React.ReactNode;
  /** Optional keyboard shortcut to display */
  shortcut?: string;
  /** Optional examples to display */
  examples?: string[];
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  title,
  position = 'top',
  delay = 300,
  className,
  children,
  shortcut,
  examples,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const delayTimer = useRef<NodeJS.Timeout>();

  // Calculate and adjust tooltip position to keep it in viewport
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 10;

    let newPosition = position;

    // Check if tooltip would be off-screen and adjust
    if (position === 'top' && triggerRect.top - tooltipRect.height < padding) {
      newPosition = 'bottom';
    } else if (position === 'bottom' && triggerRect.bottom + tooltipRect.height > viewportHeight - padding) {
      newPosition = 'top';
    } else if (position === 'left' && triggerRect.left - tooltipRect.width < padding) {
      newPosition = 'right';
    } else if (position === 'right' && triggerRect.right + tooltipRect.width > viewportWidth - padding) {
      newPosition = 'left';
    }

    setAdjustedPosition(newPosition);
  }, [isOpen, position]);

  // Handle mouse enter with delay
  const handleMouseEnter = () => {
    delayTimer.current = setTimeout(() => {
      setIsOpen(true);
    }, delay);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    if (delayTimer.current) {
      clearTimeout(delayTimer.current);
    }
    setIsOpen(false);
  };

  // Handle focus for keyboard accessibility
  const handleFocus = () => {
    delayTimer.current = setTimeout(() => {
      setIsOpen(true);
    }, 0);
  };

  // Handle blur
  const handleBlur = () => {
    if (delayTimer.current) {
      clearTimeout(delayTimer.current);
    }
    setIsOpen(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (delayTimer.current) {
        clearTimeout(delayTimer.current);
      }
    };
  }, []);

  const getTooltipClasses = () => {
    return `${styles.tooltip} ${styles[`position-${adjustedPosition}`]} ${className || ''}`;
  };

  return (
    <div
      ref={triggerRef}
      className={styles.triggerWrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={tooltipRef}
            className={getTooltipClasses()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            role="tooltip"
          >
            {title && <div className={styles.title}>{title}</div>}
            <div className={styles.content}>{content}</div>
            {shortcut && <div className={styles.shortcut}>⌨ {shortcut}</div>}
            {examples && examples.length > 0 && (
              <div className={styles.examples}>
                <div className={styles.examplesLabel}>Examples:</div>
                <ul className={styles.examplesList}>
                  {examples.map((example, index) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HelpTooltip;
