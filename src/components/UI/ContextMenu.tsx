import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ContextMenu.module.css';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action?: () => void;
  disabled?: boolean;
  divider?: boolean;
  submenu?: ContextMenuItem[];
}

export interface ContextMenuProps {
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
  const submenuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);
  const submenuCloseTimer = useRef<NodeJS.Timeout | null>(null);

  // Adjust position to stay in viewport
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x;
    let y = position.y;

    // Adjust horizontal
    if (x + menuRect.width > viewportWidth - 20) {
      x = position.x - menuRect.width;
    }

    // Adjust vertical
    if (y + menuRect.height > viewportHeight - 20) {
      y = position.y - menuRect.height;
    }

    // Ensure not off-screen on left/top
    x = Math.max(10, x);
    y = Math.max(10, y);

    setAdjustedPosition({ x, y });
  }, [isOpen, position]);

  // Close on click outside and Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (!items[focusedIndex].disabled && items[focusedIndex].action) {
            items[focusedIndex].action();
            onClose();
          }
          break;
      }
    };

    // Delay to prevent immediate close from the same click
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
      document.addEventListener('contextmenu', handleClickOutside, true);
    }, 100);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside, true);
      document.removeEventListener('contextmenu', handleClickOutside, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, items, focusedIndex]);

  // Reset focus when menu opens
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(0);
      setOpenSubmenuId(null);
    }
  }, [isOpen]);

  // Helper function to calculate submenu position
  const getSubmenuPosition = (): { x: number; y: number } => {
    const parentMenuEl = menuRef.current;

    if (!parentMenuEl) {
      return { x: adjustedPosition.x + 200, y: adjustedPosition.y };
    }

    const parentRect = parentMenuEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const submenuWidth = 200; // Estimated width

    // Calculate position relative to viewport
    let x = parentRect.right + 4; // 4px gap to the right
    const y = parentRect.top;

    // Flip to left if too close to right edge
    if (x + submenuWidth > viewportWidth - 20) {
      x = parentRect.left - submenuWidth - 4;
    }

    return { x, y };
  };

  // Handle submenu open
  const handleSubmenuEnter = (itemId: string) => {
    if (submenuCloseTimer.current) {
      clearTimeout(submenuCloseTimer.current);
      submenuCloseTimer.current = null;
    }
    setOpenSubmenuId(itemId);
  };

  // Handle submenu close with delay
  const handleSubmenuLeave = () => {
    submenuCloseTimer.current = setTimeout(() => {
      setOpenSubmenuId(null);
    }, 150);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (submenuCloseTimer.current) {
        clearTimeout(submenuCloseTimer.current);
      }
    };
  }, []);

  // Render submenu component
  const renderSubmenu = (submenuItems: ContextMenuItem[], parentId: string) => {
    const position = getSubmenuPosition();

    return (
      <motion.div
        ref={(el) => {
          if (el) submenuRefs.current[parentId] = el;
        }}
        className={styles.submenu}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.15 }}
        onMouseEnter={() => handleSubmenuEnter(parentId)}
        onMouseLeave={handleSubmenuLeave}
      >
        {submenuItems.map((item) => (
          <React.Fragment key={item.id}>
            <button
              className={`${styles.menuItem} ${item.submenu ? styles.hasSubmenu : ''}`}
              onClick={() => {
                if (!item.disabled && item.action) {
                  item.action();
                  onClose();
                }
              }}
              disabled={item.disabled}
              role="menuitem"
              aria-disabled={item.disabled}
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
    );
  };

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
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              <div
                className={styles.menuItemWrapper}
                onMouseEnter={() => {
                  if (item.submenu && item.submenu.length > 0) {
                    handleSubmenuEnter(item.id);
                  }
                }}
                onMouseLeave={handleSubmenuLeave}
              >
                <button
                  className={`${styles.menuItem} ${index === focusedIndex ? styles.focused : ''} ${
                    item.submenu ? styles.hasSubmenu : ''
                  }`}
                  onClick={() => {
                    if (!item.disabled && (!item.submenu || item.submenu.length === 0) && item.action) {
                      item.action();
                      onClose();
                    }
                  }}
                  disabled={item.disabled}
                  role="menuitem"
                  tabIndex={index === focusedIndex ? 0 : -1}
                  aria-disabled={item.disabled}
                  aria-haspopup={item.submenu ? 'menu' : undefined}
                  aria-expanded={openSubmenuId === item.id}
                >
                  {item.icon && (
                    <span className={styles.icon}>{item.icon}</span>
                  )}
                  <span className={styles.label}>{item.label}</span>
                </button>
                <AnimatePresence>
                  {openSubmenuId === item.id && item.submenu && item.submenu.length > 0 && (
                    renderSubmenu(item.submenu, item.id)
                  )}
                </AnimatePresence>
              </div>
              {item.divider && <div className={styles.divider} />}
            </React.Fragment>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!isOpen) return null;

  return createPortal(content, document.body);
};
