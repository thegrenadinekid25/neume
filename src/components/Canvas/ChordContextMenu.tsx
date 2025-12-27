import React from 'react';
import { ContextMenu, ContextMenuItem } from '@/components/UI/ContextMenu';
import type { ScaleDegree, Mode, ChordQuality, ChordExtensions } from '@/types';
import { getScaleDegreeColor } from '@/styles/colors';

interface ChordContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  currentMode: Mode;
  onClose: () => void;
  onAddChord: (
    scaleDegree: ScaleDegree,
    position: { x: number; y: number },
    options?: {
      quality?: ChordQuality;
      extensions?: ChordExtensions;
    }
  ) => void;
}

export const ChordContextMenu: React.FC<ChordContextMenuProps> = ({
  isOpen,
  position,
  currentMode,
  onClose,
  onAddChord,
}) => {
  // Render colored dot preview
  const renderColorDot = (degree: ScaleDegree) => {
    const color = getScaleDegreeColor(degree, currentMode);
    return (
      <span
        style={{
          display: 'inline-block',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: color,
        }}
      />
    );
  };

  // Get chord label with Roman numeral and function name
  const getChordLabel = (degree: ScaleDegree): string => {
    const numerals: Record<ScaleDegree, { major: string; minor: string }> = {
      1: { major: 'I', minor: 'i' },
      2: { major: 'ii', minor: 'ii°' },
      3: { major: 'iii', minor: 'III' },
      4: { major: 'IV', minor: 'iv' },
      5: { major: 'V', minor: 'V' },
      6: { major: 'vi', minor: 'VI' },
      7: { major: 'vii°', minor: 'VII' },
    };

    const functions: Record<ScaleDegree, string> = {
      1: 'Tonic',
      2: 'Supertonic',
      3: 'Mediant',
      4: 'Subdominant',
      5: 'Dominant',
      6: 'Submediant',
      7: 'Leading Tone',
    };

    const numeral = numerals[degree][currentMode];
    return `${numeral} (${functions[degree]})`;
  };

  // Generate menu items for all 7 scale degrees
  const basicChordItems: ContextMenuItem[] = ([1, 2, 3, 4, 5, 6, 7] as ScaleDegree[]).map((degree) => ({
    id: `chord-${degree}`,
    label: getChordLabel(degree),
    icon: renderColorDot(degree),
    action: () => onAddChord(degree, position),
  }));

  // Extended chord items with submenus
  const menuItems: ContextMenuItem[] = [
    ...basicChordItems,

    // Divider before extended chords
    { id: 'divider-more', label: '', divider: true },

    // 7th Chords submenu
    {
      id: 'seventh-chords',
      label: '7th Chords',
      submenu: [
        { id: 'dom7', label: '7 - Dominant 7th', action: () => onAddChord(5, position, { quality: 'dom7' }) },
        { id: 'maj7', label: '△7 - Major 7th', action: () => onAddChord(1, position, { quality: 'maj7' }) },
        { id: 'min7', label: 'm7 - Minor 7th', action: () => onAddChord(2, position, { quality: 'min7' }) },
        { id: 'halfdim7', label: 'ø7 - Half-dim 7th', action: () => onAddChord(7, position, { quality: 'halfdim7' }) },
        { id: 'dim7', label: '°7 - Diminished 7th', action: () => onAddChord(7, position, { quality: 'dim7' }) },
      ],
    },

    // Suspensions submenu
    {
      id: 'suspensions',
      label: 'Suspensions',
      submenu: [
        { id: 'sus2', label: 'sus2 - Suspended 2nd', action: () => onAddChord(1, position, { extensions: { sus2: true } }) },
        { id: 'sus4', label: 'sus4 - Suspended 4th', action: () => onAddChord(1, position, { extensions: { sus4: true } }) },
      ],
    },

    // Extensions submenu
    {
      id: 'extensions',
      label: 'Extensions',
      submenu: [
        { id: 'add9', label: '+9 - Added 9th', action: () => onAddChord(1, position, { extensions: { add9: true } }) },
        { id: 'add11', label: '+11 - Added 11th', action: () => onAddChord(1, position, { extensions: { add11: true } }) },
        { id: 'add13', label: '+13 - Added 13th', action: () => onAddChord(1, position, { extensions: { add13: true } }) },
      ],
    },

    // Alterations submenu
    {
      id: 'alterations',
      label: 'Alterations',
      submenu: [
        { id: 'flat9', label: '♭9 - Flat 9th', action: () => onAddChord(5, position, { quality: 'dom7', extensions: { flat9: true } }) },
        { id: 'sharp9', label: '♯9 - Sharp 9th', action: () => onAddChord(5, position, { quality: 'dom7', extensions: { sharp9: true } }) },
        { id: 'sharp11', label: '♯11 - Sharp 11th', action: () => onAddChord(5, position, { quality: 'dom7', extensions: { sharp11: true } }) },
        { id: 'flat13', label: '♭13 - Flat 13th', action: () => onAddChord(5, position, { quality: 'dom7', extensions: { flat13: true } }) },
      ],
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
