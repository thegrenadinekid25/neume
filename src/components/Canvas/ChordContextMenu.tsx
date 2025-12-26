import React from 'react';
import { ContextMenu } from '@/components/UI/ContextMenu';
import { ContextMenuItem, Chord, ScaleDegree, ChordQuality } from '@types';
import { getScaleDegreeColor } from '@/styles/colors';
import { generateSATBVoicing } from '@/audio/VoiceLeading';
import { v4 as uuidv4 } from 'uuid';

interface ChordContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  currentKey: string;
  currentMode: 'major' | 'minor';
  onClose: () => void;
  onAddChord: (chord: Chord) => void;
  canvasScrollLeft: number;
  beatWidth: number;
}

export const ChordContextMenu: React.FC<ChordContextMenuProps> = ({
  isOpen,
  position,
  currentKey,
  currentMode,
  onClose,
  onAddChord,
  canvasScrollLeft,
  beatWidth,
}) => {
  // Calculate canvas-relative position
  const createChordAtPosition = (scaleDegree: ScaleDegree) => {
    // Convert screen position to canvas position
    const canvasX = position.x + canvasScrollLeft;

    // Snap to nearest beat
    const beatPosition = Math.round(canvasX / beatWidth);
    const snappedX = beatPosition * beatWidth;

    // Create chord with placeholder voices first
    const tempChord: Chord = {
      id: uuidv4(),
      scaleDegree,
      quality: getChordQuality(scaleDegree, currentMode),
      extensions: {},
      key: currentKey as any,
      mode: currentMode,
      isChromatic: false,
      voices: { soprano: 'C4', alto: 'C4', tenor: 'C4', bass: 'C4' }, // Placeholder
      startBeat: beatPosition,
      duration: 4, // Default to whole note
      position: { x: snappedX, y: 300 }, // Fixed y position on canvas
      size: 60,
      selected: false,
      playing: false,
      source: 'user',
      createdAt: new Date().toISOString(),
    };

    // Generate proper SATB voicing
    const voicing = generateSATBVoicing(tempChord);
    const newChord = { ...tempChord, voices: voicing };

    onAddChord(newChord);
  };

  // Generate menu items for all 7 scale degrees
  const menuItems: ContextMenuItem[] = [
    {
      id: 'chord-I',
      label: `I (${currentMode === 'major' ? 'Tonic' : 'Tonic'})`,
      icon: renderColorDot(1, currentMode),
      action: () => createChordAtPosition(1),
    },
    {
      id: 'chord-ii',
      label: `ii (${currentMode === 'major' ? 'Supertonic' : 'Supertonic°'})`,
      icon: renderColorDot(2, currentMode),
      action: () => createChordAtPosition(2),
    },
    {
      id: 'chord-iii',
      label: `iii (${currentMode === 'major' ? 'Mediant' : 'Mediant'})`,
      icon: renderColorDot(3, currentMode),
      action: () => createChordAtPosition(3),
    },
    {
      id: 'chord-IV',
      label: `IV (${currentMode === 'major' ? 'Subdominant' : 'Subdominant'})`,
      icon: renderColorDot(4, currentMode),
      action: () => createChordAtPosition(4),
    },
    {
      id: 'chord-V',
      label: `V (Dominant)`,
      icon: renderColorDot(5, currentMode),
      action: () => createChordAtPosition(5),
    },
    {
      id: 'chord-vi',
      label: `vi (${currentMode === 'major' ? 'Submediant' : 'Submediant'})`,
      icon: renderColorDot(6, currentMode),
      action: () => createChordAtPosition(6),
    },
    {
      id: 'chord-vii',
      label: `vii° (Leading Tone)`,
      icon: renderColorDot(7, currentMode),
      action: () => createChordAtPosition(7),
    },
  ];

  return (
    <ContextMenu
      isOpen={isOpen}
      position={position}
      items={menuItems}
      onClose={onClose}
    />
  );
};

/**
 * Render colored dot preview
 */
function renderColorDot(degree: ScaleDegree, mode: 'major' | 'minor') {
  const color = getScaleDegreeColor(degree, mode);
  return (
    <span
      style={{
        display: 'inline-block',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: color,
        marginRight: '8px',
      }}
    />
  );
}

/**
 * Get chord quality based on scale degree and mode
 */
function getChordQuality(
  degree: ScaleDegree,
  mode: 'major' | 'minor'
): ChordQuality {
  if (mode === 'major') {
    const qualities: Record<ScaleDegree, ChordQuality> = {
      1: 'major',
      2: 'minor',
      3: 'minor',
      4: 'major',
      5: 'major',
      6: 'minor',
      7: 'diminished',
    };
    return qualities[degree];
  } else {
    const qualities: Record<ScaleDegree, ChordQuality> = {
      1: 'minor',
      2: 'diminished',
      3: 'major',
      4: 'minor',
      5: 'major', // or minor, but we'll default to major V
      6: 'major',
      7: 'major',
    };
    return qualities[degree];
  }
}