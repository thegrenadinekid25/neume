import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasStore } from '@/store/canvas-store';
import type { VoicePart } from '@/types/necklace';
import styles from './NecklaceToggle.module.css';

const VOICE_LABELS: Record<VoicePart, string> = {
  soprano: 'Soprano',
  alto: 'Alto',
  tenor: 'Tenor',
  bass: 'Bass',
};

const VOICE_ORDER: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];

export function NecklaceToggle() {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const necklaceSettings = useCanvasStore((state) => state.necklaceSettings);
  const setNecklaceVisible = useCanvasStore((state) => state.setNecklaceVisible);
  const toggleVoiceNecklace = useCanvasStore((state) => state.toggleVoiceNecklace);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  const handleMainToggle = () => {
    if (!necklaceSettings.visible) {
      setNecklaceVisible(true);
    }
    setIsExpanded(!isExpanded);
  };

  const enabledCount = VOICE_ORDER.filter(
    (v) => necklaceSettings.voices[v].enabled
  ).length;

  return (
    <div ref={containerRef} className={styles.container}>
      <button
        className={`${styles.toggleButton} ${necklaceSettings.visible ? styles.active : ''}`}
        onClick={handleMainToggle}
        aria-expanded={isExpanded}
        aria-label="Voice lines settings"
      >
        <svg
          className={styles.icon}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 12c2-3 6-6 10-6s8 3 10 6c-2 3-6 6-10 6s-8-3-10-6z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span className={styles.label}>Voice Lines</span>
        {necklaceSettings.visible && (
          <span className={styles.badge}>{enabledCount}</span>
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className={styles.menu}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <label className={styles.mainOption}>
              <input
                type="checkbox"
                checked={necklaceSettings.visible}
                onChange={(e) => setNecklaceVisible(e.target.checked)}
              />
              <span>Show voice lines</span>
            </label>

            <div className={styles.divider} />

            {VOICE_ORDER.map((voice) => {
              const config = necklaceSettings.voices[voice];
              return (
                <label
                  key={voice}
                  className={`${styles.voiceOption} ${!necklaceSettings.visible ? styles.disabled : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={() => toggleVoiceNecklace(voice)}
                    disabled={!necklaceSettings.visible}
                  />
                  <span
                    className={styles.colorSwatch}
                    style={{ backgroundColor: config.color }}
                  />
                  <span className={styles.voiceName}>{VOICE_LABELS[voice]}</span>
                </label>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
