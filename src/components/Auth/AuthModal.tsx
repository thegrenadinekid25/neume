import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/auth-store';
import { isSupabaseConfigured } from '../../lib/supabase';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'signin' | 'signup';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const { signInWithEmail, signUpWithEmail, signInWithGoogle, loading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    const result = mode === 'signin'
      ? await signInWithEmail(email, password)
      : await signUpWithEmail(email, password, displayName);

    if (!result.error) {
      onClose();
      setEmail('');
      setPassword('');
      setDisplayName('');
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearError();
    await signInWithGoogle();
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setLocalError(null);
    clearError();
  };

  const displayError = localError || error?.message;
  const supabaseConfigured = isSupabaseConfigured();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <button className={styles.closeButton} onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <h2 className={styles.title}>{mode === 'signin' ? 'Welcome Back' : 'Create Account'}</h2>
            <p className={styles.subtitle}>
              {mode === 'signin'
                ? 'Sign in to access your progressions from any device'
                : 'Start saving your chord progressions to the cloud'}
            </p>

            {!supabaseConfigured && (
              <div className={styles.configWarning}>
                <span className={styles.warningIcon}>⚠️</span>
                <div>
                  <strong>Cloud features not configured</strong>
                  <p>Copy .env.local.example to .env.local and add your Supabase credentials.</p>
                </div>
              </div>
            )}

            <button
              className={styles.googleButton}
              onClick={handleGoogleSignIn}
              disabled={loading || !supabaseConfigured}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {mode === 'signup' && (
                <div className={styles.field}>
                  <label htmlFor="displayName">Display Name</label>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    disabled={!supabaseConfigured}
                  />
                </div>
              )}

              <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={!supabaseConfigured}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  disabled={!supabaseConfigured}
                />
              </div>

              {displayError && (
                <div className={styles.error}>
                  {displayError}
                </div>
              )}

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading || !supabaseConfigured}
              >
                {loading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <p className={styles.switchText}>
              {mode === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button onClick={switchMode} className={styles.switchButton}>Sign up</button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={switchMode} className={styles.switchButton}>Sign in</button>
                </>
              )}
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
