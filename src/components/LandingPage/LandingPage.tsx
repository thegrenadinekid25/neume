import { useAuthStore } from '@/store/auth-store';
import { useAppViewStore } from '@/store/app-view-store';
import styles from './LandingPage.module.css';

interface LandingPageProps {
  onSignInClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSignInClick }) => {
  const navigateToCanvas = useAppViewStore((s) => s.navigateToCanvas);
  const { loading } = useAuthStore();

  const handleTryNow = () => {
    navigateToCanvas();
  };

  return (
    <div className={styles.landing}>
      <header className={styles.header}>
        <h1 className={styles.logo}>NEUME</h1>
        <button
          className={styles.signInButton}
          onClick={onSignInClick}
          disabled={loading}
        >
          Sign In
        </button>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h2 className={styles.tagline}>
            Compose with <span className={styles.highlight}>intention</span>
          </h2>
          <p className={styles.subtitle}>
            A thoughtful chord progression tool for composers, songwriters, and music students.
            Build harmonies, explore voice leading, and learn music theory along the way.
          </p>
          <div className={styles.ctaGroup}>
            <button
              className={styles.primaryCta}
              onClick={handleTryNow}
            >
              Start Composing
            </button>
            <button
              className={styles.secondaryCta}
              onClick={onSignInClick}
            >
              Sign in to save your work
            </button>
          </div>
        </section>

        <section className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Timeline-Based</h3>
            <p className={styles.featureDesc}>
              Drag and drop chords on a timeline. See your progression unfold beat by beat.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Voice Leading</h3>
            <p className={styles.featureDesc}>
              SATB voice lines with smooth voice leading. Edit individual voices for custom arrangements.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Learn As You Go</h3>
            <p className={styles.featureDesc}>
              Built-in analysis explains why chords work together. Check for voice leading rules and get AI-powered feedback.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Export Anywhere</h3>
            <p className={styles.featureDesc}>
              Export to MusicXML for use in notation software like MuseScore, Sibelius, or Finale.
            </p>
          </div>
        </section>

        <section className={styles.tryItSection}>
          <p className={styles.tryItText}>
            No account needed to start. Sign in later to save your progressions to the cloud.
          </p>
          <button
            className={styles.tryItButton}
            onClick={handleTryNow}
          >
            Try It Now
          </button>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>Built for musicians who want to understand harmony, not just use it.</p>
      </footer>
    </div>
  );
};
