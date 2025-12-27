import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './FloatingActionButton.module.css';

interface FABAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface FloatingActionButtonProps {
  actions: FABAction[];
  position?: 'bottom-right' | 'bottom-left';
}

/**
 * Floating Action Button with expandable menu
 * Shows a primary button that expands to reveal additional actions
 */
export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions,
  position = 'bottom-right',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (actions.length === 0) return null;

  // If only one action, show it directly without expand menu
  if (actions.length === 1) {
    const action = actions[0];
    return (
      <div className={`${styles.container} ${styles[position]}`}>
        <motion.button
          className={styles.fab}
          onClick={action.onClick}
          disabled={action.disabled}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={action.label}
          aria-label={action.label}
        >
          {action.icon}
        </motion.button>
      </div>
    );
  }

  // Multiple actions - show expandable menu
  return (
    <div
      className={`${styles.container} ${styles[position]}`}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className={styles.menu}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                className={styles.menuItem}
                onClick={() => {
                  action.onClick();
                  setIsExpanded(false);
                }}
                disabled={action.disabled}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                title={action.label}
              >
                <span className={styles.menuIcon}>{action.icon}</span>
                <span className={styles.menuLabel}>{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={`${styles.fab} ${isExpanded ? styles.expanded : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={() => setIsExpanded(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isExpanded ? 'Close menu' : 'Open menu'}
        aria-expanded={isExpanded}
      >
        <motion.span
          className={styles.fabIcon}
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.span>
      </motion.button>
    </div>
  );
};

// Common icons for FAB actions
export const FABIcons = {
  save: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  folder: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  bones: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="14" width="18" height="6" rx="1" />
      <rect x="5" y="8" width="14" height="5" rx="1" opacity="0.7" />
      <rect x="7" y="3" width="10" height="4" rx="1" opacity="0.4" />
    </svg>
  ),
  wand: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 4V2" />
      <path d="M15 16v-2" />
      <path d="M8 9h2" />
      <path d="M20 9h2" />
      <path d="M17.8 11.8L19 13" />
      <path d="M15 9h.01" />
      <path d="M17.8 6.2L19 5" />
      <path d="m3 21 9-9" />
      <path d="M12.2 6.2 11 5" />
    </svg>
  ),
};
