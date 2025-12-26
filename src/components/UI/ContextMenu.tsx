import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ContextMenuItem } from '@types';
import styles from './ContextMenu.module.css';

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  position,
  items,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Adjust position to stay in viewport
  const getAdjustedPosition = () => {
    if (!menuRef.current) return position;

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x;
    let y = position.y;

    // Adjust horizontal
    if (x + menuRect.width > viewportWidth - 20) {
      x = viewportWidth - menuRect.width - 20;
    }

    // Adjust vertical
    if (y + menuRect.height > viewportHeight - 20) {
      y = viewportHeight - menuRect.height - 20;
    }

    return { x, y };
  };

  if (!isOpen) return null;

  const adjustedPosition = menuRef.current ? getAdjustedPosition() : position;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          className={styles.contextMenu}
          style={{
            left: `${adjustedPosition.x}px`,
            top: `${adjustedPosition.y}px`,
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          role="menu"
          aria-label="Chord selection menu"
        >
          {items.map((item) => (
            <React.Fragment key={item.id}>
              <button
                className={styles.menuItem}
                onClick={() => {
                  item.action();
                  onClose();
                }}
                disabled={item.disabled}
                role="menuitem"
                tabIndex={0}
              >
                {item.icon && (
                  <span className={styles.icon}>{item.icon}</span>
                )}
                <span className={styles.label}>{item.label}</span>
              </button>
              {item.divider && <div className={styles.divider} />}
            </React.Fragment>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
