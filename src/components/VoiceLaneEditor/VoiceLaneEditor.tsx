import React, { useMemo, useEffect, useRef } from 'react';
import { useVoiceLineStore } from '@/store/voice-line-store';
import { VOICE_ORDER, VOICE_RANGES } from '@/data/voice-ranges';
import type { Chord } from '@/types/chord';
import { VoiceLane } from './VoiceLane';
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

  // Get enabled voices for label rendering
  const enabledVoices = VOICE_ORDER.filter((part) => voiceLines[part].enabled);

  return (
    <div className={styles.container}>
      {/* Labels column - fixed on left */}
      <div className={styles.labelsColumn}>
        {enabledVoices.map((voicePart) => {
          const voiceRange = VOICE_RANGES[voicePart];
          const midiRange = voiceRange.highMidi - voiceRange.lowMidi;
          const laneHeight = Math.max(80, (midiRange / 19) * 120);
          return (
            <div
              key={voicePart}
              className={styles.labelRow}
              style={{ height: laneHeight }}
            >
              <span className={styles.labelText}>{voiceRange.label}</span>
            </div>
          );
        })}
      </div>
      {/* Lanes area - scrollable */}
      <div className={styles.lanesWrapper}>
        <div className={styles.lanesContent} style={{ width: totalWidth }}>
          {enabledVoices.map((voicePart) => {
            const voiceLine = voiceLines[voicePart];
            return (
              <VoiceLane
                key={voicePart}
                voiceLine={voiceLine}
                zoom={zoom}
                beatWidth={beatWidth}
                totalBeats={totalBeats}
                color={voiceLine.color}
                isPlaying={isPlaying}
                playheadPosition={playheadPosition}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
