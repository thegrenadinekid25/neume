/**
 * VoiceLinesLayer - Renders all SATB voice lines on the canvas
 * This layer displays individual pitch dots that can be dragged to edit
 */

import React, { useCallback, useMemo } from 'react';
import { VoiceLine } from '@/components/VoiceLines/VoiceLine';
import { useVoiceLineStore } from '@/store/voice-line-store';
import type { VoicePart } from '@/types';
import { CANVAS_CONFIG } from '@/utils/constants';
import styles from './VoiceLinesLayer.module.css';

interface VoiceLinesLayerProps {
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  isVisible: boolean;
}

const VOICE_ORDER: VoicePart[] = ['bass', 'tenor', 'alto', 'soprano'];

export const VoiceLinesLayer: React.FC<VoiceLinesLayerProps> = ({
  canvasWidth,
  canvasHeight,
  zoom,
  isVisible,
}) => {
  const voiceLines = useVoiceLineStore((state) => state.voiceLines);
  const compositionMode = useVoiceLineStore((state) => state.compositionMode);
  const selectedNoteIds = useVoiceLineStore((state) => state.selectedNoteIds);
  const playingNoteIds = useVoiceLineStore((state) => state.playingNoteIds);
  const { selectNote, updateNote, setNoteHovered } = useVoiceLineStore();

  const beatWidth = CANVAS_CONFIG.GRID_BEAT_WIDTH;

  // Memoize sets for performance
  const selectedSet = useMemo(() => new Set(selectedNoteIds), [selectedNoteIds]);
  const playingSet = useMemo(() => new Set(playingNoteIds), [playingNoteIds]);

  const handleNoteSelect = useCallback(
    (noteId: string, multiSelect: boolean) => {
      selectNote(noteId, multiSelect);
    },
    [selectNote]
  );

  const handleNoteDrag = useCallback(
    (noteId: string, newMidi: number) => {
      // Find which voice part this note belongs to
      for (const part of VOICE_ORDER) {
        const note = voiceLines[part].notes.find((n) => n.id === noteId);
        if (note) {
          updateNote(part, noteId, { midi: newMidi });
          break;
        }
      }
    },
    [voiceLines, updateNote]
  );

  const handleNoteDragEnd = useCallback(
    (noteId: string) => {
      // Could trigger counterpoint analysis here
      console.log('Note drag ended:', noteId);
    },
    []
  );

  const handleNoteHover = useCallback(
    (noteId: string | null) => {
      setNoteHovered(noteId);
    },
    [setNoteHovered]
  );

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.container}>
      {VOICE_ORDER.map((part) => (
        <VoiceLine
          key={part}
          voiceLine={voiceLines[part]}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          beatWidth={beatWidth}
          zoom={zoom}
          showGuides={compositionMode.showVoiceLeadingGuides}
          showNonChordToneBadges={compositionMode.showNonChordToneLabels}
          selectedNoteIds={selectedSet}
          playingNoteIds={playingSet}
          onNoteSelect={handleNoteSelect}
          onNoteDrag={handleNoteDrag}
          onNoteDragEnd={handleNoteDragEnd}
          onNoteHover={handleNoteHover}
        />
      ))}
    </div>
  );
};
