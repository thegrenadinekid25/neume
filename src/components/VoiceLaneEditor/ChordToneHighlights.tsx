import React, { useMemo } from 'react';
import { Note } from 'tonal';
import type { Chord } from '@/types/chord';
import { getChordPitchClasses, findChordAtBeat } from '@/services/non-chord-tone-analyzer';
import styles from './ChordToneHighlights.module.css';

interface ChordToneHighlightsProps {
  laneHeight: number;
  width: number;
  visible: boolean;
  hoverX: number | null;
  chords: Chord[];
  beatWidth: number;
  zoom: number;
  voiceRange: { lowMidi: number; highMidi: number };
  voiceColor: string;
  labelsColumnWidth?: number;
}

/**
 * Get all MIDI values within a range that are chord tones
 */
function getChordToneMidiValues(
  chord: Chord,
  lowMidi: number,
  highMidi: number
): number[] {
  const chordPitchClasses = getChordPitchClasses(chord);
  const chordToneMidis: number[] = [];

  for (let midi = lowMidi; midi <= highMidi; midi++) {
    const noteName = Note.fromMidi(midi);
    if (!noteName) continue;

    const pitchClass = Note.pitchClass(noteName);
    // Check if this pitch class matches any chord pitch class (using enharmonic equivalence)
    const midiPc = (Note.midi(pitchClass + '4') ?? 0) % 12;

    const isMatch = chordPitchClasses.some(pc => {
      const chordPcMidi = (Note.midi(pc + '4') ?? 0) % 12;
      return midiPc === chordPcMidi;
    });

    if (isMatch) {
      chordToneMidis.push(midi);
    }
  }

  return chordToneMidis;
}

export const ChordToneHighlights: React.FC<ChordToneHighlightsProps> = ({
  laneHeight,
  width,
  visible,
  hoverX,
  chords,
  beatWidth,
  zoom,
  voiceRange,
  voiceColor,
  labelsColumnWidth = 0,
}) => {
  const lanePadding = 8;
  const spotlightWidth = 80; // Width of visible highlight area
  const fadeWidth = 30; // Fade zone on each edge

  // Convert X position to beat, accounting for labels column offset
  // The voice lane content is offset from the chord shapes by labelsColumnWidth
  const hoverBeat = useMemo(() => {
    if (hoverX === null) return null;
    // Add the labels offset to align with chord positions
    const adjustedX = hoverX + labelsColumnWidth;
    return adjustedX / (beatWidth * zoom);
  }, [hoverX, labelsColumnWidth, beatWidth, zoom]);

  // Find chord at hover position
  const sortedChords = useMemo(() => {
    return [...chords].sort((a, b) => a.startBeat - b.startBeat);
  }, [chords]);

  const activeChord = useMemo(() => {
    if (hoverBeat === null) return null;
    // Find chord at the current beat position (changes at beat boundaries)
    return findChordAtBeat(hoverBeat, sortedChords);
  }, [hoverBeat, sortedChords]);

  // Calculate chord tone MIDI values
  const chordToneMidis = useMemo(() => {
    if (!activeChord) return [];
    return getChordToneMidiValues(activeChord, voiceRange.lowMidi, voiceRange.highMidi);
  }, [activeChord, voiceRange.lowMidi, voiceRange.highMidi]);


  // Helper to convert MIDI to Y position
  const getY = (midi: number) => {
    const midiRange = voiceRange.highMidi - voiceRange.lowMidi;
    const usableHeight = laneHeight - (lanePadding * 2);
    const normalizedPosition = (voiceRange.highMidi - midi) / (midiRange || 1);
    return lanePadding + (normalizedPosition * usableHeight);
  };

  // Calculate band height (approximately 1 semitone of vertical space)
  const bandHeight = useMemo(() => {
    const midiRange = voiceRange.highMidi - voiceRange.lowMidi;
    if (midiRange === 0) return laneHeight;
    const usableHeight = laneHeight - (lanePadding * 2);
    return usableHeight / midiRange;
  }, [voiceRange.highMidi, voiceRange.lowMidi, laneHeight]);

  if (chords.length === 0 || hoverX === null) return null;

  // Calculate spotlight bounds
  const spotlightLeft = Math.max(0, hoverX - spotlightWidth / 2);
  const spotlightRight = Math.min(width, hoverX + spotlightWidth / 2);
  const actualSpotlightWidth = spotlightRight - spotlightLeft;
  const gradientId = `spotlight-fade-${voiceColor.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg
      className={`${styles.highlights} ${visible && activeChord ? styles.visible : ''}`}
      width={width}
      height={laneHeight}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={voiceColor} stopOpacity="0" />
          <stop offset={`${(fadeWidth / actualSpotlightWidth) * 100}%`} stopColor={voiceColor} stopOpacity="0.3" />
          <stop offset={`${100 - (fadeWidth / actualSpotlightWidth) * 100}%`} stopColor={voiceColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={voiceColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {chordToneMidis.map((midi) => {
        const y = getY(midi);
        return (
          <rect
            key={midi}
            x={spotlightLeft}
            y={y - bandHeight / 2}
            width={actualSpotlightWidth}
            height={bandHeight}
            fill={`url(#${gradientId})`}
          />
        );
      })}
    </svg>
  );
};
