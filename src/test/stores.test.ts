import { describe, it, expect, beforeEach } from 'vitest';
import { useCanvasStore } from '../store/canvas-store';
import { useTutorialStore } from '../store/tutorial-store';
import { useShortcutsStore } from '../store/shortcuts-store';
import { useProgressionsStore } from '../store/progressions-store';
import type { Chord } from '@types';

describe('Store Tests', () => {

  beforeEach(() => {
    // Reset stores before each test
    useCanvasStore.setState({ chords: [], selectedChordIds: [], history: [], historyIndex: -1 });
    useTutorialStore.setState({ isActive: false, currentStep: 0, hasCompletedTutorial: false });
    useShortcutsStore.setState({ isGuideOpen: false });
    localStorage.clear();
  });

  describe('Canvas Store', () => {
    it('adds chord to canvas', () => {
      const { addChord, chords } = useCanvasStore.getState();

      const newChord: Chord = {
        id: 'test-1',
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

      addChord(newChord);

      expect(useCanvasStore.getState().chords).toHaveLength(1);
      expect(useCanvasStore.getState().chords[0].id).toBe('test-1');
    });

    it('selects chord', () => {
      const { addChord, selectChord, selectedChordIds } = useCanvasStore.getState();

      const chord: Chord = {
        id: 'test-1',
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

      addChord(chord);
      selectChord('test-1');

      expect(useCanvasStore.getState().selectedChordIds).toContain('test-1');
    });

    it('deletes selected chords', () => {
      const { addChord, selectChord, deleteSelected } = useCanvasStore.getState();

      const chord: Chord = {
        id: 'test-1',
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

      addChord(chord);
      selectChord('test-1');
      deleteSelected();

      expect(useCanvasStore.getState().chords).toHaveLength(0);
      expect(useCanvasStore.getState().selectedChordIds).toHaveLength(0);
    });

    it('handles undo/redo', () => {
      const { addChord, undo, redo } = useCanvasStore.getState();

      const chord1: Chord = {
        id: 'test-1',
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

      addChord(chord1);
      expect(useCanvasStore.getState().chords).toHaveLength(1);

      undo();
      expect(useCanvasStore.getState().chords).toHaveLength(0);

      redo();
      expect(useCanvasStore.getState().chords).toHaveLength(1);
    });

    it('selects all chords', () => {
      const { addChord, selectAll } = useCanvasStore.getState();

      for (let i = 0; i < 5; i++) {
        const chord: Chord = {
          id: `test-${i}`,
          scaleDegree: (i % 7) + 1,
          quality: 'major',
          extensions: {},
          key: 'C',
          mode: 'major',
          isChromatic: false,
          voices: { soprano: 'E4', alto: 'C4', tenor: 'G3', bass: 'C3' },
          startBeat: i * 4,
          duration: 4,
          position: { x: 100 + i * 80, y: 100 },
          size: 60,
          selected: false,
          playing: false,
          source: 'user',
          createdAt: new Date().toISOString(),
        };
        addChord(chord);
      }

      selectAll();

      expect(useCanvasStore.getState().selectedChordIds).toHaveLength(5);
    });
  });

  describe('Tutorial Store', () => {
    it('starts tutorial', () => {
      const { startTutorial, isActive } = useTutorialStore.getState();

      startTutorial();

      expect(useTutorialStore.getState().isActive).toBe(true);
      expect(useTutorialStore.getState().currentStep).toBe(0);
    });

    it('advances through steps', () => {
      const { startTutorial, nextStep } = useTutorialStore.getState();

      startTutorial();
      expect(useTutorialStore.getState().currentStep).toBe(0);

      nextStep();
      expect(useTutorialStore.getState().currentStep).toBe(1);

      nextStep();
      expect(useTutorialStore.getState().currentStep).toBe(2);
    });

    it('completes tutorial and saves to localStorage', () => {
      const { startTutorial, completeTutorial } = useTutorialStore.getState();

      startTutorial();
      completeTutorial();

      expect(useTutorialStore.getState().isActive).toBe(false);
      expect(useTutorialStore.getState().hasCompletedTutorial).toBe(true);
      expect(localStorage.getItem('tutorial-completed')).toBe('true');
    });

    it('skips tutorial', () => {
      const { startTutorial, skipTutorial } = useTutorialStore.getState();

      startTutorial();
      skipTutorial();

      expect(useTutorialStore.getState().isActive).toBe(false);
      expect(localStorage.getItem('tutorial-completed')).toBe('true');
    });
  });

  describe('Shortcuts Store', () => {
    it('opens shortcuts guide', () => {
      const { openGuide } = useShortcutsStore.getState();

      openGuide();

      expect(useShortcutsStore.getState().isGuideOpen).toBe(true);
    });

    it('closes shortcuts guide', () => {
      const { openGuide, closeGuide } = useShortcutsStore.getState();

      openGuide();
      closeGuide();

      expect(useShortcutsStore.getState().isGuideOpen).toBe(false);
    });
  });

  describe('Progressions Store', () => {
    it('saves progression to localStorage', () => {
      const { saveProgression } = useProgressionsStore.getState();

      const progression = {
        title: 'Test Progression',
        key: 'C',
        mode: 'major' as const,
        tempo: 120,
        chords: [],
        tags: ['test'],
      };

      saveProgression(progression);

      const saved = localStorage.getItem('harmonic-canvas-progressions');
      expect(saved).toBeTruthy();
    });

    it('loads progressions from localStorage', () => {
      const { saveProgression, progressions } = useProgressionsStore.getState();

      const progression1 = {
        title: 'Test 1',
        key: 'C',
        mode: 'major' as const,
        tempo: 120,
        chords: [],
        tags: [],
      };

      const progression2 = {
        title: 'Test 2',
        key: 'D',
        mode: 'minor' as const,
        tempo: 90,
        chords: [],
        tags: [],
      };

      saveProgression(progression1);
      saveProgression(progression2);

      expect(useProgressionsStore.getState().progressions.length).toBeGreaterThanOrEqual(2);
    });
  });
});
