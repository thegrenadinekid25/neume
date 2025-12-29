import React, { useMemo, useState, useCallback } from 'react';
import { Note, Scale } from 'tonal';
import type { VoicePart, Chord, MelodicNote } from '@/types';
import { NOTE_VALUE_TO_BEATS } from '@/types/voice-line';
import { VOICE_ORDER, VOICE_RANGES } from '@/data/voice-ranges';
import { useVoiceLineStore } from '@/store/voice-line-store';
import { useCanvasStore } from '@/store/canvas-store';
import { useVoiceChordConflict } from '@/hooks/useVoiceChordConflict';
import { NoteDot } from './NoteDot';
import { ThreadConnector } from './ThreadConnector';
import { RestCloud } from './RestCloud';
import { StaffGuides } from './StaffGuides';
import { ChordToneHighlights } from './ChordToneHighlights';
import styles from './UnifiedStaff.module.css';

interface UnifiedStaffProps {
  chords: Chord[];
  zoom: number;
  beatWidth: number;
  totalBeats: number;
  isPlaying: boolean;
  playheadPosition: number;
  labelsColumnWidth?: number;
}

// Horizontal offsets for overlapping notes at same beat (per voice index)
const VOICE_OFFSETS = [-6, -2, 2, 6];

export const UnifiedStaff: React.FC<UnifiedStaffProps> = ({
  chords,
  zoom,
  beatWidth,
  totalBeats,
  isPlaying,
  playheadPosition,
  labelsColumnWidth = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverX, setHoverX] = useState<number | null>(null);

  // Store state
  const voiceLines = useVoiceLineStore((state) => state.voiceLines);
  const selectNote = useVoiceLineStore((state) => state.selectNote);
  const updateNote = useVoiceLineStore((state) => state.updateNote);
  const addNote = useVoiceLineStore((state) => state.addNote);
  const selectedNoteIds = useVoiceLineStore((state) => state.selectedNoteIds);
  const playingNoteIds = useVoiceLineStore((state) => state.playingNoteIds);
  const activeVoicePart = useVoiceLineStore((state) => state.activeVoicePart);
  const selectedNoteValue = useVoiceLineStore((state) => state.selectedNoteValue);
  const snapResolution = useVoiceLineStore((state) => state.snapResolution);

  // Get current key/mode for diatonic snapping
  const currentKey = useCanvasStore((state) => state.currentKey);
  const currentMode = useCanvasStore((state) => state.currentMode);

  // Get current time signature
  const currentTimeSignature = '4/4' as const;

  // Get enabled voice parts
  const enabledVoices = useMemo(() => {
    return VOICE_ORDER.filter((part) => voiceLines[part].enabled);
  }, [voiceLines]);

  // Get effective active voice part (default to first enabled or soprano)
  const effectiveActiveVoice: VoicePart = useMemo(() => {
    if (activeVoicePart && VOICE_ORDER.includes(activeVoicePart as VoicePart)) {
      return activeVoicePart as VoicePart;
    }
    return enabledVoices[0] || 'soprano';
  }, [activeVoicePart, enabledVoices]);

  // Calculate unified range spanning all enabled voices
  const unifiedRange = useMemo(() => {
    if (enabledVoices.length === 0) {
      return { lowMidi: 40, highMidi: 79 }; // Default full SATB range
    }
    const lowMidi = Math.min(...enabledVoices.map(p => VOICE_RANGES[p].lowMidi));
    const highMidi = Math.max(...enabledVoices.map(p => VOICE_RANGES[p].highMidi));
    return { lowMidi, highMidi };
  }, [enabledVoices]);

  // Calculate lane dimensions
  const midiRange = unifiedRange.highMidi - unifiedRange.lowMidi;
  const laneHeight = useMemo(() => {
    // Scale height based on range - minimum 150px, scaled by semitones
    return Math.max(150, (midiRange / 19) * 200);
  }, [midiRange]);

  const laneWidth = useMemo(() => {
    return totalBeats * beatWidth * zoom;
  }, [totalBeats, beatWidth, zoom]);

  const lanePadding = 8;

  // Get all diatonic MIDI values within unified range for snapping
  const diatonicMidiValues = useMemo(() => {
    const scaleName = currentMode === 'major' ? 'major' : 'minor';
    const scale = Scale.get(`${currentKey} ${scaleName}`);
    if (!scale.notes || scale.notes.length === 0) {
      return Array.from({ length: midiRange + 1 }, (_, i) => unifiedRange.lowMidi + i);
    }

    const scalePitchClasses = scale.notes.map(n => Note.pitchClass(n));
    const midiValues: number[] = [];

    for (let midi = unifiedRange.lowMidi; midi <= unifiedRange.highMidi; midi++) {
      const pitchClass = Note.pitchClass(Note.fromMidi(midi) || '');
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
  }, [currentKey, currentMode, unifiedRange.lowMidi, unifiedRange.highMidi, midiRange]);

  // Helper to convert beat to X position
  const getX = useCallback((beat: number) => {
    return beat * beatWidth * zoom;
  }, [beatWidth, zoom]);

  // Helper to convert X position back to beat with snap resolution
  const xToBeat = useCallback((x: number) => {
    const beat = x / (beatWidth * zoom);
    // If snapResolution is 0, return exact beat without snapping
    if (snapResolution === 0) return beat;
    // Otherwise, snap to the nearest resolution increment
    return Math.round(beat / snapResolution) * snapResolution;
  }, [beatWidth, zoom, snapResolution]);

  // Helper to convert MIDI to Y position within unified staff
  const getY = useCallback((midi: number) => {
    const usableHeight = laneHeight - (lanePadding * 2);
    const normalizedPosition = (unifiedRange.highMidi - midi) / (midiRange || 1);
    return lanePadding + (normalizedPosition * usableHeight);
  }, [unifiedRange.highMidi, midiRange, laneHeight]);

  // Helper to convert Y position back to MIDI with diatonic snapping
  const yToMidi = useCallback((y: number) => {
    const usableHeight = laneHeight - (lanePadding * 2);
    const normalizedPosition = (y - lanePadding) / usableHeight;
    const rawMidi = unifiedRange.highMidi - (normalizedPosition * midiRange);

    const clampedMidi = Math.max(unifiedRange.lowMidi, Math.min(unifiedRange.highMidi, rawMidi));

    if (diatonicMidiValues.length === 0) {
      return Math.round(clampedMidi);
    }

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
  }, [unifiedRange.highMidi, unifiedRange.lowMidi, midiRange, laneHeight, diatonicMidiValues]);

  // Conflict detection hook for active voice
  const { handleDragStart: hookHandleDragStart, handleDragEnd: hookHandleDragEnd } = useVoiceChordConflict(
    effectiveActiveVoice,
    currentTimeSignature,
    {
      enabled: true,
      minSeverity: 'warning',
      onNoteUpdate: (noteId, newMidi) => {
        const voiceLine = voiceLines[effectiveActiveVoice];
        const note = voiceLine.notes.find((n: MelodicNote) => n.id === noteId);
        if (note) {
          const newPitch = Note.fromMidi(newMidi) || 'C4';
          updateNote(effectiveActiveVoice, noteId, { midi: newMidi, pitch: newPitch });
        }
      },
      onChordChange: (newChordKey) => {
        console.log('User requested chord change to:', newChordKey);
      },
      onCancel: () => {},
    }
  );

  // Handle mouse move for chord tone highlights
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverX(e.clientX - rect.left);
  }, []);

  // Handle note selection
  const handleNoteSelect = useCallback((noteId: string, multiSelect: boolean) => {
    selectNote(noteId, multiSelect);
  }, [selectNote]);

  // Handle note drag (for any voice)
  const handleNoteDrag = useCallback((voicePart: VoicePart, noteId: string, newY: number) => {
    const newMidi = yToMidi(newY);
    const voiceRange = VOICE_RANGES[voicePart];

    // Clamp to voice's specific range
    const clampedMidi = Math.max(voiceRange.lowMidi, Math.min(voiceRange.highMidi, newMidi));
    const newPitch = Note.fromMidi(clampedMidi) || 'C4';
    updateNote(voicePart, noteId, { midi: clampedMidi, pitch: newPitch });
  }, [yToMidi, updateNote]);

  // Handle note drag end with conflict detection
  const handleNoteDragEnd = useCallback((voicePart: VoicePart, noteId: string, finalY: number) => {
    const voiceLine = voiceLines[voicePart];
    const note = voiceLine.notes.find(n => n.id === noteId);
    if (!note) return;

    const newMidi = yToMidi(finalY);
    const voiceRange = VOICE_RANGES[voicePart];
    const clampedMidi = Math.max(voiceRange.lowMidi, Math.min(voiceRange.highMidi, newMidi));
    const newPitch = Note.fromMidi(clampedMidi) || 'C4';

    const noteChord = chords.find(c => c.startBeat <= note.startBeat && c.startBeat + c.duration > note.startBeat);
    if (!noteChord) {
      updateNote(voicePart, noteId, { midi: clampedMidi, pitch: newPitch });
      return;
    }

    const noteIndex = voiceLine.notes.findIndex(n => n.id === noteId);
    const prevNote = noteIndex > 0 ? voiceLine.notes[noteIndex - 1] : undefined;
    const nextNote = noteIndex < voiceLine.notes.length - 1 ? voiceLine.notes[noteIndex + 1] : undefined;

    // Only use conflict detection for active voice
    if (voicePart === effectiveActiveVoice) {
      hookHandleDragEnd(note, clampedMidi, noteChord, prevNote, nextNote, note.startBeat);
    } else {
      updateNote(voicePart, noteId, { midi: clampedMidi, pitch: newPitch });
    }
  }, [yToMidi, updateNote, voiceLines, chords, effectiveActiveVoice, hookHandleDragEnd]);

  // Handle double-click to add note to active voice
  const handleLaneDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const beat = xToBeat(x);
    const midi = yToMidi(y);

    // Validate MIDI is within active voice's range
    const voiceRange = VOICE_RANGES[effectiveActiveVoice];
    if (midi < voiceRange.lowMidi || midi > voiceRange.highMidi) {
      // Outside active voice range - could show a toast or indicator
      return;
    }

    // Check if there's already a note at this beat for active voice
    const voiceLine = voiceLines[effectiveActiveVoice];
    const existingNote = voiceLine.notes.find((n: MelodicNote) => n.startBeat === beat);
    if (existingNote) return;

    const pitch = Note.fromMidi(midi) || 'C4';
    const duration = NOTE_VALUE_TO_BEATS[selectedNoteValue];

    addNote(effectiveActiveVoice, {
      pitch,
      midi,
      startBeat: beat,
      duration,
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
  }, [xToBeat, yToMidi, effectiveActiveVoice, voiceLines, addNote, selectedNoteValue]);

  // Determine if a note is playing
  const isNotePlaying = useCallback((note: MelodicNote) => {
    if (!isPlaying) return false;
    if (playingNoteIds.includes(note.id)) return true;
    if (!note.isRest) {
      return playheadPosition >= note.startBeat &&
             playheadPosition < note.startBeat + note.duration;
    }
    return false;
  }, [isPlaying, playingNoteIds, playheadPosition]);

  // Collect all notes with voice info for rendering
  const allNotesWithVoice = useMemo(() => {
    const result: Array<{
      note: MelodicNote;
      voicePart: VoicePart;
      voiceIndex: number;
      color: string;
    }> = [];

    enabledVoices.forEach((voicePart, voiceIndex) => {
      const voiceLine = voiceLines[voicePart];
      voiceLine.notes.forEach(note => {
        result.push({
          note,
          voicePart,
          voiceIndex,
          color: voiceLine.color,
        });
      });
    });

    return result;
  }, [enabledVoices, voiceLines]);

  // Separate regular notes and rests
  const regularNotes = allNotesWithVoice.filter(n => !n.note.isRest);
  const restNotes = allNotesWithVoice.filter(n => n.note.isRest);

  // Group notes by beat to detect overlaps
  const notesByBeat = useMemo(() => {
    const map = new Map<number, typeof regularNotes>();
    regularNotes.forEach(noteData => {
      const beat = noteData.note.startBeat;
      if (!map.has(beat)) {
        map.set(beat, []);
      }
      map.get(beat)!.push(noteData);
    });
    return map;
  }, [regularNotes]);

  // Calculate X offset for a note (to handle overlaps)
  const getXOffset = useCallback((noteData: typeof regularNotes[0]) => {
    const beat = noteData.note.startBeat;
    const notesAtBeat = notesByBeat.get(beat) || [];
    if (notesAtBeat.length <= 1) return 0;

    // Apply voice-based offset
    return VOICE_OFFSETS[noteData.voiceIndex] || 0;
  }, [notesByBeat]);

  return (
    <div
      className={styles.unifiedStaff}
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
      {/* Chord tone highlights (shared, uses active voice color) */}
      <ChordToneHighlights
        laneHeight={laneHeight}
        width={laneWidth}
        visible={isHovered}
        hoverX={hoverX}
        chords={chords}
        beatWidth={beatWidth}
        zoom={zoom}
        voiceRange={unifiedRange}
        voiceColor={voiceLines[effectiveActiveVoice].color}
        labelsColumnWidth={labelsColumnWidth}
      />

      {/* Staff guide lines (shared) */}
      <StaffGuides
        laneHeight={laneHeight}
        width={laneWidth}
        visible={isHovered}
      />

      {/* Thread connectors - one per enabled voice */}
      {enabledVoices.map((voicePart) => {
        const voiceLine = voiceLines[voicePart];
        const voiceNotes = voiceLine.notes.filter(n => !n.isRest);
        return (
          <ThreadConnector
            key={`thread-${voicePart}`}
            notes={voiceNotes}
            getX={getX}
            getY={getY}
            color={voiceLine.color}
            svgWidth={laneWidth}
            svgHeight={laneHeight}
          />
        );
      })}

      {/* Rest clouds */}
      {restNotes.map(({ note, color }) => (
        <RestCloud
          key={note.id}
          x={getX(note.startBeat)}
          color={color}
          laneHeight={laneHeight}
        />
      ))}

      {/* Note dots - all voices, color-coded */}
      {regularNotes.map((noteData) => {
        const { note, voicePart, color } = noteData;
        const xOffset = getXOffset(noteData);
        return (
          <NoteDot
            key={note.id}
            note={note}
            x={getX(note.startBeat) + xOffset}
            y={getY(note.midi)}
            color={color}
            isSelected={selectedNoteIds.includes(note.id)}
            isPlaying={isNotePlaying(note)}
            voicePart={voicePart}
            laneHeight={laneHeight}
            onSelect={handleNoteSelect}
            onDrag={(noteId, newY) => handleNoteDrag(voicePart, noteId, newY)}
            onDragEnd={(noteId, finalY) => handleNoteDragEnd(voicePart, noteId, finalY)}
            onConflictDragStart={voicePart === effectiveActiveVoice ? hookHandleDragStart : undefined}
          />
        );
      })}
    </div>
  );
};
