import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/auth-store';
import { isSupabaseConfigured } from '../../lib/supabase';
import styles from './UserMenu.module.css';

interface UserMenuProps {
  onSignInClick: () => void;
}

export function UserMenu({ onSignInClick }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { user, profile, signOut, loading, initialized } = useAuthStore();
  const supabaseConfigured = isSupabaseConfigured();

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show skeleton while loading
  if (!initialized && supabaseConfigured) {
    return <div className={styles.skeleton} />;
  }

  // Not logged in - show sign in button
  if (!user) {
    return (
      <button
        className={styles.signInButton}
        onClick={onSignInClick}
        disabled={loading}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className={styles.signInIcon}>
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
        </svg>
        Sign In
      </button>
    );
  }

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'User';
  const avatarUrl = profile?.avatar_url;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className={styles.menu} ref={menuRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className={styles.avatar} />
        ) : (
          <div className={styles.avatarPlaceholder}>{initials}</div>
        )}
        <span className={styles.name}>{displayName}</span>
        <svg
          className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
        >
          <path d="M3 5l3 3 3-3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.dropdown}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            <div className={styles.header}>
              <span className={styles.email}>{user.email}</span>
              <span className={styles.syncStatus}>
                <span className={styles.syncDot} />
                Synced to cloud
              </span>
            </div>
            <div className={styles.divider} />
            <button
              className={styles.menuItem}
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
              </svg>
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
