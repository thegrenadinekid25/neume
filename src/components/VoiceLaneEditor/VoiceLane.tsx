import React, { useMemo, useState, useCallback } from 'react';
import type { VoiceLine as VoiceLineType, VoicePart, Chord } from '@/types';
import { VOICE_RANGES } from '@/data/voice-ranges';
import { useVoiceLineStore } from '@/store/voice-line-store';
import { useCanvasStore } from '@/store/canvas-store';
import { Note, Scale } from 'tonal';
import { useVoiceChordConflict } from '@/hooks/useVoiceChordConflict';
import { NoteDot } from './NoteDot';
import { ThreadConnector } from './ThreadConnector';
import { RestCloud } from './RestCloud';
import { StaffGuides } from './StaffGuides';
import { ChordToneHighlights } from './ChordToneHighlights';
import styles from './VoiceLane.module.css';

interface VoiceLaneProps {
  voiceLine: VoiceLineType;
  chords: Chord[];
  zoom: number;
  beatWidth: number;
  totalBeats: number;
  color: string;
  isPlaying: boolean;
  playheadPosition: number;
  labelsColumnWidth?: number;
}

export const VoiceLane: React.FC<VoiceLaneProps> = ({
  voiceLine,
  chords,
  zoom,
  beatWidth,
  totalBeats,
  color,
  isPlaying,
  playheadPosition,
  labelsColumnWidth = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverX, setHoverX] = useState<number | null>(null);

  // Store actions
  const selectNote = useVoiceLineStore((state) => state.selectNote);
  const updateNote = useVoiceLineStore((state) => state.updateNote);
  const addNote = useVoiceLineStore((state) => state.addNote);
  const selectedNoteIds = useVoiceLineStore((state) => state.selectedNoteIds);
  const playingNoteIds = useVoiceLineStore((state) => state.playingNoteIds);

  // Get current key/mode for diatonic snapping
  const currentKey = useCanvasStore((state) => state.currentKey);
  const currentMode = useCanvasStore((state) => state.currentMode);

  // Get current time signature (default to 4/4, which is most common)
  const currentTimeSignature = '4/4' as const;

  const voicePart = voiceLine.voicePart as VoicePart;
  const voiceRange = VOICE_RANGES[voicePart];

  // Initialize voice-chord conflict detection hook
  const { handleDragStart: hookHandleDragStart, handleDragEnd: hookHandleDragEnd } = useVoiceChordConflict(
    voicePart,
    currentTimeSignature,
    {
      enabled: true,
      minSeverity: 'warning',
      onNoteUpdate: (noteId, newMidi) => {
        const note = voiceLine.notes.find(n => n.id === noteId);
        if (note) {
          const newPitch = Note.fromMidi(newMidi) || 'C4';
          updateNote(voicePart, noteId, { midi: newMidi, pitch: newPitch });
        }
      },
      onChordChange: (newChordKey) => {
        // Note: Chord changing would require parent component coordination
        // For now, this is a placeholder for future implementation
        console.log('User requested chord change to:', newChordKey);
      },
      onCancel: () => {
        // Note already reverted in hook via onNoteUpdate with originalMidi
      },
    }
  );

  // Get all diatonic MIDI values within voice range for snapping
  const diatonicMidiValues = useMemo(() => {
    const scaleName = currentMode === 'major' ? 'major' : 'minor';
    const scale = Scale.get(`${currentKey} ${scaleName}`);
    if (!scale.notes || scale.notes.length === 0) {
      // Fallback to chromatic if scale not found
      return Array.from({ length: voiceRange.highMidi - voiceRange.lowMidi + 1 }, (_, i) => voiceRange.lowMidi + i);
    }

    // Get pitch classes from scale (without octave)
    const scalePitchClasses = scale.notes.map(n => Note.pitchClass(n));

    // Generate all diatonic MIDI values within voice range
    const midiValues: number[] = [];
    for (let midi = voiceRange.lowMidi; midi <= voiceRange.highMidi; midi++) {
      const pitchClass = Note.pitchClass(Note.fromMidi(midi) || '');
      // Check if this pitch class is in the scale (using enharmonic equivalence)
      const midiOfPitchClass = Note.midi(pitchClass + '4') || 0;
      const isInScale = scalePitchClasses.some(scalePc => {
        const scaleMidi = Note.midi(scalePc + '4') || 0;
        return (midiOfPitchClass % 12) === (scaleMidi % 12);
      });
      if (isInScale) {
        midiValues.push(midi);
      }
    }
    return midiValues;
  }, [currentKey, currentMode, voiceRange.lowMidi, voiceRange.highMidi]);

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

  // Handle mouse move for chord tone highlights
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverX(e.clientX - rect.left);
  }, []);

  // Helper to convert Y position back to MIDI (inverse of getY)
  // Snaps to nearest diatonic scale degree
  const yToMidi = useCallback((y: number) => {
    const midiRange = voiceRange.highMidi - voiceRange.lowMidi;
    const usableHeight = laneHeight - (lanePadding * 2);
    const normalizedPosition = (y - lanePadding) / usableHeight;
    const rawMidi = voiceRange.highMidi - (normalizedPosition * midiRange);

    // Clamp to voice range
    const clampedMidi = Math.max(voiceRange.lowMidi, Math.min(voiceRange.highMidi, rawMidi));

    // Snap to nearest diatonic MIDI value
    if (diatonicMidiValues.length === 0) {
      return Math.round(clampedMidi);
    }

    // Find the closest diatonic MIDI value
    let closestMidi = diatonicMidiValues[0];
    let closestDistance = Math.abs(clampedMidi - closestMidi);

    for (const midi of diatonicMidiValues) {
      const distance = Math.abs(clampedMidi - midi);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestMidi = midi;
      }
    }

    return closestMidi;
  }, [voiceRange.highMidi, voiceRange.lowMidi, laneHeight, diatonicMidiValues]);

  // Handle note drag (update Y position)
  const handleNoteDrag = useCallback((noteId: string, newY: number) => {
    const newMidi = yToMidi(newY);
    const newPitch = Note.fromMidi(newMidi) || 'C4';
    updateNote(voicePart, noteId, { midi: newMidi, pitch: newPitch });
  }, [yToMidi, updateNote, voicePart]);

  // Handle note drag end (finalize position with conflict detection)
  const handleNoteDragEnd = useCallback((noteId: string, finalY: number) => {
    const note = voiceLine.notes.find(n => n.id === noteId);
    if (!note) return;

    const newMidi = yToMidi(finalY);
    const newPitch = Note.fromMidi(newMidi) || 'C4';

    // Find the current chord for this note
    const noteChord = chords.find(c => c.startBeat <= note.startBeat && c.startBeat + c.duration > note.startBeat);
    if (!noteChord) {
      // No chord found, just update the note
      updateNote(voicePart, noteId, { midi: newMidi, pitch: newPitch });
      return;
    }

    // Get adjacent notes
    const noteIndex = voiceLine.notes.findIndex(n => n.id === noteId);
    const prevNote = noteIndex > 0 ? voiceLine.notes[noteIndex - 1] : undefined;
    const nextNote = noteIndex < voiceLine.notes.length - 1 ? voiceLine.notes[noteIndex + 1] : undefined;

    // Call the conflict detection hook with all necessary parameters
    hookHandleDragEnd(note, newMidi, noteChord, prevNote, nextNote, note.startBeat);
  }, [yToMidi, updateNote, voicePart, voiceLine.notes, chords, hookHandleDragEnd]);

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
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoverX(null);
      }}
      onDoubleClick={handleLaneDoubleClick}
    >
      {/* Chord tone highlights (fade in on hover) */}
      <ChordToneHighlights
        laneHeight={laneHeight}
        width={laneWidth}
        visible={isHovered}
        hoverX={hoverX}
        chords={chords}
        beatWidth={beatWidth}
        zoom={zoom}
        voiceRange={{ lowMidi: voiceRange.lowMidi, highMidi: voiceRange.highMidi }}
        voiceColor={color}
        labelsColumnWidth={labelsColumnWidth}
      />

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
          onConflictDragStart={hookHandleDragStart}
        />
      ))}
    </div>
  );
};
