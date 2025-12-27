import React from 'react';
import { motion } from 'framer-motion';
import styles from './MetadataBanner.module.css';

interface MetadataBannerProps {
  title: string;
  composer?: string;
  sourceUrl?: string;
  onClear: () => void;
}

export const MetadataBanner: React.FC<MetadataBannerProps> = ({
  title,
  composer,
  sourceUrl,
  onClear,
}) => {
  const subtitle = composer ? `by ${composer}` : undefined;

  return (
    <motion.div
      className={styles.bannerContainer}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1], // Apple smooth easing
      }}
    >
      <div className={styles.contentWrapper}>
        <div className={styles.metadataSection}>
          <div className={styles.titleContainer}>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>

          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.sourceLink}
              aria-label={`Source: ${sourceUrl}`}
            >
              <svg
                className={styles.linkIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>

        <motion.button
          className={styles.clearButton}
          onClick={onClear}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          aria-label="Clear analyzed progression"
          title="Clear"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
};

MetadataBanner.displayName = 'MetadataBanner';
