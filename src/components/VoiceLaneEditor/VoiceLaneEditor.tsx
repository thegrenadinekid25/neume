import React, { useMemo, useEffect, useRef } from 'react';
import { useVoiceLineStore } from '@/store/voice-line-store';
import { useNoteValueKeyboardShortcuts } from '@/hooks/useNoteValueKeyboardShortcuts';
import type { Chord } from '@/types/chord';
import { UnifiedStaff } from './UnifiedStaff';
import { VoiceLegend } from './VoiceLegend';
import { NoteValueSelector } from './NoteValueSelector';
import { ChordConflictDialog } from './ChordConflictDialog';
import styles from './VoiceLaneEditor.module.css';

interface VoiceLaneEditorProps {
  chords: Chord[];
  zoom: number;
  totalBeats: number;
  isPlaying: boolean;
  playheadPosition: number;
  beatWidth: number;
}

export const VoiceLaneEditor: React.FC<VoiceLaneEditorProps> = ({
  chords,
  zoom,
  totalBeats,
  isPlaying,
  playheadPosition,
  beatWidth,
}) => {
  const voiceLines = useVoiceLineStore((state) => state.voiceLines);
  const analyzeAllNotes = useVoiceLineStore((state) => state.analyzeAllNotes);

  // Initialize keyboard shortcuts for note values and snap resolution
  useNoteValueKeyboardShortcuts();

  // Track previous note count to detect changes (avoiding analyzing on every render)
  const prevNoteCountRef = useRef<number>(0);

  // Run analysis when chords or notes change
  useEffect(() => {
    if (chords.length === 0) return;

    // Count total notes across all voice parts
    const totalNotes = Object.values(voiceLines).reduce(
      (sum, vl) => sum + vl.notes.length, 0
    );

    // Only analyze if note count changed or on initial mount
    if (totalNotes !== prevNoteCountRef.current) {
      prevNoteCountRef.current = totalNotes;
      analyzeAllNotes(chords);
    }
  }, [chords, voiceLines, analyzeAllNotes]);

  // Calculate total width based on beats, beatWidth, and zoom
  const totalWidth = useMemo(() => {
    return totalBeats * beatWidth * zoom;
  }, [totalBeats, beatWidth, zoom]);

  return (
    <div className={styles.container}>
      {/* Chord conflict dialog */}
      <ChordConflictDialog />

      {/* Note value selector - controls note duration and snap resolution */}
      <div className={styles.selectorWrapper}>
        <NoteValueSelector />
      </div>

      {/* Voice legend - shows active voices with colors */}
      <div className={styles.legendWrapper}>
        <VoiceLegend />
      </div>

      {/* Unified staff - all voices on one staff */}
      <div className={styles.staffWrapper}>
        <div className={styles.staffContent} style={{ width: totalWidth }}>
          <UnifiedStaff
            chords={chords}
            zoom={zoom}
            beatWidth={beatWidth}
            totalBeats={totalBeats}
            isPlaying={isPlaying}
            playheadPosition={playheadPosition}
            labelsColumnWidth={0}
          />
        </div>
      </div>
    </div>
  );
};
