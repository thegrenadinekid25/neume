import React, { useMemo, useCallback } from 'react';
import type { VoiceLine as VoiceLineType, VoicePart } from '@/types';
import { VOICE_RANGES } from '@/data/voice-ranges';
import { midiToY, getGuideLinePositions, type PitchPositioningConfig, PITCH_CONFIG } from '@/utils/pitch-positioning';
import { PitchDot } from './PitchDot';
import { RestCloud } from './RestCloud';
import { MelismaConnector } from './MelismaConnector';
import styles from './VoiceLine.module.css';

interface VoiceLineComponentProps {
  voiceLine: VoiceLineType;
  canvasWidth: number;
  canvasHeight: number;
  beatWidth: number;
  zoom: number;
  pitchConfig?: PitchPositioningConfig;
  showGuides: boolean;
  showNonChordToneBadges: boolean;
  selectedNoteIds: Set<string>;
  playingNoteIds: Set<string>;
  onNoteSelect: (noteId: string, multiSelect: boolean) => void;
  onNoteDrag: (noteId: string, newMidi: number) => void;
  onNoteDragEnd: (noteId: string) => void;
  onNoteHover: (noteId: string | null) => void;
}

interface MelismaConnection {
  fromIndex: number;
  toIndex: number;
}

export const VoiceLine: React.FC<VoiceLineComponentProps> = ({
  voiceLine,
  canvasWidth,
  canvasHeight,
  beatWidth,
  zoom,
  pitchConfig = PITCH_CONFIG,
  showGuides,
  showNonChordToneBadges,
  selectedNoteIds,
  playingNoteIds,
  onNoteSelect,
  onNoteDrag,
  onNoteDragEnd,
  onNoteHover,
}) => {
  if (!voiceLine.enabled) {
    return null;
  }

  const voicePart = voiceLine.voicePart as VoicePart;
  const voiceColor = VOICE_RANGES[voicePart].color;

  // Calculate note positions
  const notePositions = useMemo(() => {
    return voiceLine.notes.map((note) => ({
      note,
      x: note.startBeat * beatWidth * zoom,
      y: note.midi ? midiToY(note.midi, pitchConfig) : canvasHeight / 2,
    }));
  }, [voiceLine.notes, beatWidth, zoom, pitchConfig, canvasHeight]);

  // Get guide lines for this voice's range
  const guideLines = useMemo(() => {
    const voiceRange = VOICE_RANGES[voicePart];
    return getGuideLinePositions(voiceRange.lowMidi, voiceRange.highMidi, pitchConfig);
  }, [voicePart, pitchConfig]);

  // Find melisma connections (consecutive notes with same non-empty text)
  const melismaConnections = useMemo(() => {
    const connections: MelismaConnection[] = [];
    for (let i = 0; i < voiceLine.notes.length - 1; i++) {
      const current = voiceLine.notes[i];
      const next = voiceLine.notes[i + 1];
      if (current.text && current.text === next.text && current.text.trim() !== '') {
        connections.push({
          fromIndex: i,
          toIndex: i + 1,
        });
      }
    }
    return connections;
  }, [voiceLine.notes]);

  // Handle note click
  const handleNoteClick = useCallback(
    (noteId: string, event: React.MouseEvent) => {
      const multiSelect = event.metaKey || event.ctrlKey;
      onNoteSelect(noteId, multiSelect);
    },
    [onNoteSelect]
  );

  return (
    <svg
      className={styles.voiceLine}
      width={canvasWidth}
      height={canvasHeight}
      style={{ opacity: voiceLine.opacity }}
    >
      {/* Guide lines */}
      {showGuides &&
        guideLines.map((line, index) => (
          <line
            key={`guide-${index}`}
            className={`${styles.guideLine} ${line.isMiddleC ? styles.middleC : ''}`}
            x1={0}
            y1={line.y}
            x2={canvasWidth}
            y2={line.y}
          />
        ))}

      {/* Melisma connectors */}
      {melismaConnections.map((connection, index) => {
        const fromPos = notePositions[connection.fromIndex];
        const toPos = notePositions[connection.toIndex];
        return (
          <MelismaConnector
            key={`melisma-${index}`}
            startX={fromPos.x}
            startY={fromPos.y}
            endX={toPos.x}
            endY={toPos.y}
            color={voiceColor}
          />
        );
      })}

      {/* Notes layer */}
      <g className={styles.notesLayer}>
        {notePositions.map(({ note, x, y }) => {
          const isRest = !note.pitch || note.midi === 0;

          if (isRest) {
            return (
              <RestCloud
                key={note.id}
                note={note}
                voicePart={voicePart}
                x={x}
                y={y}
                width={note.duration * beatWidth * zoom}
                isSelected={selectedNoteIds.has(note.id)}
                onClick={(noteId: string, e: React.MouseEvent) => handleNoteClick(noteId, e)}
              />
            );
          }

          return (
            <PitchDot
              key={note.id}
              note={note}
              voicePart={voicePart}
              x={x}
              y={y}
              isSelected={selectedNoteIds.has(note.id)}
              isPlaying={playingNoteIds.has(note.id)}
              showNonChordToneBadge={showNonChordToneBadges && note.analysis.nonChordToneType !== null}
              onClick={(noteId: string, e: React.MouseEvent) => handleNoteClick(noteId, e)}
              onDrag={(noteId: string, newMidi: number) => onNoteDrag(noteId, newMidi)}
              onDragEnd={(noteId: string) => onNoteDragEnd(noteId)}
              onHover={(noteId: string | null) => onNoteHover(noteId)}
            />
          );
        })}
      </g>
    </svg>
  );
};
