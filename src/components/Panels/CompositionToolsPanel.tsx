/**
 * CompositionToolsPanel Component
 *
 * A slide-up panel providing access to:
 * - Text Setting (Lyrics) - enter and assign lyrics to notes
 * - Voice Lines - manually adjust SATB voicings
 */

import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompositionToolsStore } from '@/store/composition-tools-store';
import { LyricsInput } from '@/components/TextSetting/LyricsInput';
import { VoiceHandleGroup } from '@/components/VoiceEditor/VoiceHandleGroup';
import type { VoiceType } from '@/services/voice-leading-analyzer';
import type { Chord, Voices } from '@/types';
import styles from './CompositionToolsPanel.module.css';

interface CompositionToolsPanelProps {
  chords: Chord[];
  onUpdateChordVoices?: (chordId: string, voices: Voices) => void;
}

// Icons for tabs
const LyricsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18" />
    <rect x="4" y="6" width="16" height="12" rx="2" />
    <path d="M8 10h8" />
    <path d="M8 14h5" />
  </svg>
);

const VoicesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <circle cx="4" cy="6" r="1.5" fill="currentColor" />
    <circle cx="4" cy="12" r="1.5" fill="currentColor" />
    <circle cx="4" cy="18" r="1.5" fill="currentColor" />
  </svg>
);

// Voice parts for lyrics input
const VOICE_PARTS = ['soprano', 'alto', 'tenor', 'bass'] as const;

export function CompositionToolsPanel({ chords, onUpdateChordVoices }: CompositionToolsPanelProps) {
  const { isPanelOpen, activeTab, closePanel, setActiveTab } = useCompositionToolsStore();

  // State for voice editor
  const [selectedChordId, setSelectedChordId] = useState<string | null>(null);
  const [activeVoice, setActiveVoice] = useState<VoiceType | null>(null);

  // Get selected chord
  const selectedChord = chords.find((c) => c.id === selectedChordId) || chords[0];

  // Auto-select first chord when panel opens
  useEffect(() => {
    if (isPanelOpen && chords.length > 0 && !selectedChordId) {
      setSelectedChordId(chords[0].id);
    }
  }, [isPanelOpen, chords, selectedChordId]);

  // Keyboard handler
  useEffect(() => {
    if (!isPanelOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, closePanel]);

  // Voice drag handlers
  const handleDragStart = useCallback((voice: VoiceType, _midi: number) => {
    setActiveVoice(voice);
  }, []);

  const handleDrag = useCallback(
    (voice: VoiceType, _midi: number, noteName: string) => {
      if (!selectedChord || !onUpdateChordVoices) return;

      const newVoices = {
        ...selectedChord.voices,
        [voice]: noteName,
      };

      onUpdateChordVoices(selectedChord.id, newVoices);
    },
    [selectedChord, onUpdateChordVoices]
  );

  const handleDragEnd = useCallback(() => {
    setActiveVoice(null);
  }, []);

  // Get note count for each voice (simplified - using chord count as proxy)
  const noteCount = chords.length;

  const content = (
    <AnimatePresence>
      {isPanelOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closePanel}
          />

          {/* Panel */}
          <motion.div
            className={styles.panel}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            role="complementary"
            aria-labelledby="composition-tools-title"
          >
            {/* Header */}
            <div className={styles.header}>
              <h2 id="composition-tools-title" className={styles.title}>
                Composition Tools
              </h2>
              <button
                className={styles.closeButton}
                onClick={closePanel}
                aria-label="Close panel"
                title="Close (Esc)"
              >
                &times;
              </button>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'lyrics' ? styles.active : ''}`}
                onClick={() => setActiveTab('lyrics')}
              >
                <LyricsIcon />
                Lyrics
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'voices' ? styles.active : ''}`}
                onClick={() => setActiveTab('voices')}
              >
                <VoicesIcon />
                Voice Lines
              </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
              {activeTab === 'lyrics' && (
                <div className={styles.voiceInputsGrid}>
                  {VOICE_PARTS.map((voice) => (
                    <LyricsInput key={voice} voice={voice} noteCount={noteCount} />
                  ))}
                </div>
              )}

              {activeTab === 'voices' && (
                <div className={styles.voiceEditorSection}>
                  {chords.length === 0 ? (
                    <div className={styles.emptyState}>
                      <span className={styles.emptyIcon}>🎵</span>
                      <p className={styles.emptyMessage}>
                        Add some chords to the canvas to edit their voicings.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className={styles.voiceEditorHeader}>
                        <h3 className={styles.voiceEditorTitle}>Select a Chord</h3>
                        <span className={styles.voiceEditorHint}>
                          Drag voice handles to adjust pitch
                        </span>
                      </div>

                      {/* Chord selector */}
                      <div className={styles.chordSelector}>
                        {chords.map((chord, index) => (
                          <button
                            key={chord.id}
                            className={`${styles.chordSelectorButton} ${
                              selectedChordId === chord.id ? styles.active : ''
                            }`}
                            onClick={() => setSelectedChordId(chord.id)}
                          >
                            Chord {index + 1}
                          </button>
                        ))}
                      </div>

                      {/* Voice handles */}
                      {selectedChord && (
                        <div className={styles.voiceHandlesContainer}>
                          <VoiceHandleGroup
                            voices={selectedChord.voices}
                            issues={[]}
                            activeVoice={activeVoice}
                            onDragStart={handleDragStart}
                            onDrag={handleDrag}
                            onDragEnd={handleDragEnd}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
