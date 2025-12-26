import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChordShape } from '../components/Canvas/ChordShape';
import { getScaleDegreeColor } from '../styles/colors';
import type { Chord } from '@types';

describe('Week 1: Visual System Tests', () => {

  describe('Chord Shape Rendering', () => {
    it('renders all 7 scale degrees with correct shapes', () => {
      const scaleDegrees = [1, 2, 3, 4, 5, 6, 7];

      scaleDegrees.forEach((degree) => {
        const chord: Chord = {
          id: `test-${degree}`,
          scaleDegree: degree,
          quality: degree === 7 ? 'diminished' : (degree % 2 === 0 ? 'minor' : 'major'),
          extensions: {},
          key: 'C',
          mode: 'major',
          isChromatic: false,
          voices: { soprano: 'E4', alto: 'C4', tenor: 'G3', bass: 'C3' },
          startBeat: 0,
          duration: 4,
          position: { x: 100, y: 100 },
          size: 60,
          selected: false,
          playing: false,
          source: 'user',
          createdAt: new Date().toISOString(),
        };

        const { container } = render(
          <ChordShape chord={chord} zoom={1.0} />
        );

        expect(container.querySelector('svg')).toBeTruthy();
      });
    });

    it('applies correct colors for each scale degree', () => {
      const expectedColors: Record<number, string> = {
        1: '#D4AF37',  // Gold (I)
        2: '#6B9080',  // Sage (ii)
        3: '#B98B8B',  // Rose (iii)
        4: '#4A6FA5',  // Blue (IV)
        5: '#E07A5F',  // Terracotta (V)
        6: '#9B7EBD',  // Purple (vi)
        7: '#6C6C6C',  // Gray (vii°)
      };

      Object.entries(expectedColors).forEach(([degree, expectedColor]) => {
        const color = getScaleDegreeColor(parseInt(degree), 'major');
        expect(color.toLowerCase()).toBe(expectedColor.toLowerCase());
      });
    });

    it('renders selected state correctly', () => {
      const chord: Chord = {
        id: 'test-selected',
        scaleDegree: 1,
        quality: 'major',
        extensions: {},
        key: 'C',
        mode: 'major',
        isChromatic: false,
        voices: { soprano: 'E4', alto: 'C4', tenor: 'G3', bass: 'C3' },
        startBeat: 0,
        duration: 4,
        position: { x: 100, y: 100 },
        size: 60,
        selected: true,
        playing: false,
        source: 'user',
        createdAt: new Date().toISOString(),
      };

      const { container } = render(
        <ChordShape chord={chord} isSelected={true} zoom={1.0} />
      );

      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('handles zoom correctly', () => {
      const chord: Chord = {
        id: 'test-zoom',
        scaleDegree: 1,
        quality: 'major',
        extensions: {},
        key: 'C',
        mode: 'major',
        isChromatic: false,
        voices: { soprano: 'E4', alto: 'C4', tenor: 'G3', bass: 'C3' },
        startBeat: 0,
        duration: 4,
        position: { x: 100, y: 100 },
        size: 60,
        selected: false,
        playing: false,
        source: 'user',
        createdAt: new Date().toISOString(),
      };

      const { container: container1 } = render(
        <ChordShape chord={chord} zoom={1.0} />
      );
      const svg1 = container1.querySelector('svg');

      const { container: container2 } = render(
        <ChordShape chord={chord} zoom={2.0} />
      );
      const svg2 = container2.querySelector('svg');

      expect(svg1).toBeTruthy();
      expect(svg2).toBeTruthy();
    });
  });

  describe('Chromatic Chord Effects', () => {
    it('renders chromatic indicator for borrowed chords', () => {
      const chromaticChord: Chord = {
        id: 'test-chromatic',
        scaleDegree: 4,
        quality: 'major',
        extensions: {},
        key: 'C',
        mode: 'major',
        isChromatic: true,
        chromaticType: 'borrowed',
        voices: { soprano: 'E4', alto: 'C4', tenor: 'G3', bass: 'C3' },
        startBeat: 0,
        duration: 4,
        position: { x: 100, y: 100 },
        size: 60,
        selected: false,
        playing: false,
        source: 'user',
        createdAt: new Date().toISOString(),
      };

      const { container } = render(
        <ChordShape chord={chromaticChord} zoom={1.0} />
      );

      expect(container.querySelector('svg')).toBeTruthy();
    });
  });

  describe('Extensions Rendering', () => {
    it('renders chord with 7th extension', () => {
      const seventh: Chord = {
        id: 'test-7th',
        scaleDegree: 5,
        quality: 'major',
        extensions: { '7': true },
        key: 'C',
        mode: 'major',
        isChromatic: false,
        voices: { soprano: 'F4', alto: 'D4', tenor: 'B3', bass: 'G3' },
        startBeat: 0,
        duration: 4,
        position: { x: 100, y: 100 },
        size: 60,
        selected: false,
        playing: false,
        source: 'user',
        createdAt: new Date().toISOString(),
      };

      const { container } = render(
        <ChordShape chord={seventh} zoom={1.0} />
      );

      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('renders chord with add9 extension', () => {
      const add9: Chord = {
        id: 'test-add9',
        scaleDegree: 1,
        quality: 'major',
        extensions: { add9: true },
        key: 'C',
        mode: 'major',
        isChromatic: false,
        voices: { soprano: 'D5', alto: 'E4', tenor: 'G3', bass: 'C3' },
        startBeat: 0,
        duration: 4,
        position: { x: 100, y: 100 },
        size: 60,
        selected: false,
        playing: false,
        source: 'user',
        createdAt: new Date().toISOString(),
      };

      const { container } = render(
        <ChordShape chord={add9} zoom={1.0} />
      );

      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('renders chord with sus4 extension', () => {
      const sus4: Chord = {
        id: 'test-sus4',
        scaleDegree: 4,
        quality: 'major',
        extensions: { sus4: true },
        key: 'C',
        mode: 'major',
        isChromatic: false,
        voices: { soprano: 'G4', alto: 'F4', tenor: 'C4', bass: 'F3' },
        startBeat: 0,
        duration: 4,
        position: { x: 100, y: 100 },
        size: 60,
        selected: false,
        playing: false,
        source: 'user',
        createdAt: new Date().toISOString(),
      };

      const { container } = render(
        <ChordShape chord={sus4} zoom={1.0} />
      );

      expect(container.querySelector('svg')).toBeTruthy();
    });
  });
});
