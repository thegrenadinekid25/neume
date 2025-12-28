import React, { useMemo, useState, useCallback } from 'react';
import type { VoiceLine as VoiceLineType, VoicePart } from '@/types';
import { VOICE_RANGES } from '@/data/voice-ranges';
import { useVoiceLineStore } from '@/store/voice-line-store';
import { Note } from 'tonal';
import { NoteDot } from './NoteDot';
import { ThreadConnector } from './ThreadConnector';
import { RestCloud } from './RestCloud';
import { StaffGuides } from './StaffGuides';
import styles from './VoiceLane.module.css';

interface VoiceLaneProps {
  voiceLine: VoiceLineType;
  zoom: number;
  beatWidth: number;
  totalBeats: number;
  color: string;
  isPlaying: boolean;
  playheadPosition: number;
}

export const VoiceLane: React.FC<VoiceLaneProps> = ({
  voiceLine,
  zoom,
  beatWidth,
  totalBeats,
  color,
  isPlaying,
  playheadPosition,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Store actions
  const selectNote = useVoiceLineStore((state) => state.selectNote);
  const updateNote = useVoiceLineStore((state) => state.updateNote);
  const addNote = useVoiceLineStore((state) => state.addNote);
  const cycleNoteState = useVoiceLineStore((state) => state.cycleNoteState);
  const selectedNoteIds = useVoiceLineStore((state) => state.selectedNoteIds);
  const playingNoteIds = useVoiceLineStore((state) => state.playingNoteIds);

  const voicePart = voiceLine.voicePart as VoicePart;
  const voiceRange = VOICE_RANGES[voicePart];

  // Calculate lane height based on voice range
  const midiRange = voiceRange.highMidi - voiceRange.lowMidi;
  const laneHeight = useMemo(() => {
    return Math.max(80, (midiRange / 19) * 120);
  }, [midiRange]);

  // Calculate width
  const laneWidth = useMemo(() => {
    return totalBeats * beatWidth * zoom;
  }, [totalBeats, beatWidth, zoom]);

  // Padding at top and bottom of lane
  const lanePadding = 8;

  // Helper to convert beat to X position
  const getX = useCallback((beat: number) => {
    return beat * beatWidth * zoom;
  }, [beatWidth, zoom]);

  // Helper to convert X position back to beat
  const xToBeat = useCallback((x: number) => {
    const beat = x / (beatWidth * zoom);
    // Snap to nearest beat
    return Math.round(beat);
  }, [beatWidth, zoom]);

  // Helper to convert MIDI to Y position within this lane
  // Higher MIDI = lower Y (inverted axis), scaled to fit within lane
  const getY = useCallback((midi: number) => {
    const midiRange = voiceRange.highMidi - voiceRange.lowMidi;
    const usableHeight = laneHeight - (lanePadding * 2);
    // Normalize midi to 0-1 range within voice range, then invert
    const normalizedPosition = (voiceRange.highMidi - midi) / (midiRange || 1);
    return lanePadding + (normalizedPosition * usableHeight);
  }, [voiceRange.highMidi, voiceRange.lowMidi, laneHeight]);

  // Handle note selection
  const handleNoteSelect = useCallback((noteId: string, multiSelect: boolean) => {
    selectNote(noteId, multiSelect);
  }, [selectNote]);

  // Helper to convert Y position back to MIDI (inverse of getY)
  const yToMidi = useCallback((y: number) => {
    const midiRange = voiceRange.highMidi - voiceRange.lowMidi;
    const usableHeight = laneHeight - (lanePadding * 2);
    const normalizedPosition = (y - lanePadding) / usableHeight;
    const midi = voiceRange.highMidi - (normalizedPosition * midiRange);
    // Clamp to voice range and round to nearest semitone
    return Math.round(Math.max(voiceRange.lowMidi, Math.min(voiceRange.highMidi, midi)));
  }, [voiceRange.highMidi, voiceRange.lowMidi, laneHeight]);

  // Handle note drag (update Y position)
  const handleNoteDrag = useCallback((noteId: string, newY: number) => {
    const newMidi = yToMidi(newY);
    const newPitch = Note.fromMidi(newMidi) || 'C4';
    updateNote(voicePart, noteId, { midi: newMidi, pitch: newPitch });
  }, [yToMidi, updateNote, voicePart]);

  // Handle note drag end (finalize position)
  const handleNoteDragEnd = useCallback((noteId: string, finalY: number) => {
    const newMidi = yToMidi(finalY);
    const newPitch = Note.fromMidi(newMidi) || 'C4';
    updateNote(voicePart, noteId, { midi: newMidi, pitch: newPitch });
  }, [yToMidi, updateNote, voicePart]);

  // Handle right-click to cycle note state
  const handleNoteContextMenu = useCallback((noteId: string, _e: React.MouseEvent) => {
    cycleNoteState(voicePart, noteId);
  }, [cycleNoteState, voicePart]);

  // Handle double-click on lane to create a new note
  const handleLaneDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const beat = xToBeat(x);
    const midi = yToMidi(y);
    const pitch = Note.fromMidi(midi) || 'C4';

    // Check if there's already a note at this beat
    const existingNote = voiceLine.notes.find(n => n.startBeat === beat);
    if (existingNote) return; // Don't create duplicate notes at same beat

    addNote(voicePart, {
      pitch,
      midi,
      startBeat: beat,
      duration: 4,
      accidental: null,
      isRest: false,
      visualState: {
        selected: false,
        hovered: false,
        dragging: false,
        playing: false,
        highlighted: false,
      },
      text: null,
      analysis: {
        isChordTone: false,
        nonChordToneType: null,
        scaleDegree: null,
        interval: null,
        tendency: null,
      },
    });
  }, [xToBeat, yToMidi, voiceLine.notes, addNote, voicePart]);

  // Determine which notes are currently playing
  const isNotePlaying = useCallback((noteId: string) => {
    if (!isPlaying) return false;
    // Check if note is in playingNoteIds, or check by beat position
    if (playingNoteIds.includes(noteId)) return true;

    // Also check by playhead position
    const note = voiceLine.notes.find(n => n.id === noteId);
    if (note && !note.isRest) {
      return playheadPosition >= note.startBeat &&
             playheadPosition < note.startBeat + note.duration;
    }
    return false;
  }, [isPlaying, playingNoteIds, playheadPosition, voiceLine.notes]);

  // Filter notes for rendering
  const regularNotes = voiceLine.notes.filter(n => !n.isRest);
  const restNotes = voiceLine.notes.filter(n => n.isRest);

  return (
    <div
      className={styles.lane}
      data-voice={voicePart}
      style={{
        height: `${laneHeight}px`,
        width: `${laneWidth}px`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleLaneDoubleClick}
    >
      {/* Staff guide lines (fade in on hover) */}
      <StaffGuides
        laneHeight={laneHeight}
        width={laneWidth}
        visible={isHovered}
      />

      {/* Thread connectors between notes */}
      <ThreadConnector
        notes={regularNotes}
        getX={getX}
        getY={getY}
        color={color}
        svgWidth={laneWidth}
        svgHeight={laneHeight}
      />

      {/* Rest clouds */}
      {restNotes.map((note) => (
        <RestCloud
          key={note.id}
          x={getX(note.startBeat)}
          color={color}
          laneHeight={laneHeight}
        />
      ))}

      {/* Note dots */}
      {regularNotes.map((note) => (
        <NoteDot
          key={note.id}
          note={note}
          x={getX(note.startBeat)}
          y={getY(note.midi)}
          color={color}
          isSelected={selectedNoteIds.includes(note.id)}
          isPlaying={isNotePlaying(note.id)}
          voicePart={voicePart}
          laneHeight={laneHeight}
          onSelect={handleNoteSelect}
          onDrag={handleNoteDrag}
          onDragEnd={handleNoteDragEnd}
          onContextMenu={handleNoteContextMenu}
        />
      ))}
    </div>
  );
};
