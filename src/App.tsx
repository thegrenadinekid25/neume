import { useState, useEffect, useCallback, useMemo } from 'react';
import { DroppableCanvas } from '@/components/Canvas';
import { MetadataBanner } from '@/components/Canvas/MetadataBanner';
import { DeleteConfirmation } from '@/components/UI/DeleteConfirmation';
import { KeyboardShortcutsGuide } from '@/components/UI/KeyboardShortcutsGuide';
import { AnalyzeModal } from '@/components/Modals';
import { WhyThisPanel, BuildFromBonesPanel } from '@/components/Panels';
import { TempoDial } from '@/components/Controls';
import { useHistory } from '@/hooks/useHistory';
import { usePlayback } from '@/hooks/usePlayback';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useAnalysisStore } from '@/store/analysis-store';
import { useBuildFromBonesStore } from '@/store/build-from-bones-store';
import { generateSATBVoicing } from '@/audio/VoiceLeading';
import type { Chord, MusicalKey, Mode, ScaleDegree, ChordQuality, ChordExtensions, Voices } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { CANVAS_CONFIG } from '@/utils/constants';
import './App.css';

function getChordQuality(degree: ScaleDegree, mode: Mode): ChordQuality {
  if (mode === 'major') {
    const qualities: Record<ScaleDegree, ChordQuality> = {
      1: 'major', 2: 'minor', 3: 'minor', 4: 'major', 5: 'major', 6: 'minor', 7: 'diminished',
    };
    return qualities[degree];
  } else {
    const qualities: Record<ScaleDegree, ChordQuality> = {
      1: 'minor', 2: 'diminished', 3: 'major', 4: 'minor', 5: 'major', 6: 'major', 7: 'major',
    };
    return qualities[degree];
  }
}

// Create demo chords - only startBeat matters for positioning now
function createDemoChords(key: MusicalKey, mode: Mode): Chord[] {
  const chordData = [
    { scaleDegree: 1 as ScaleDegree, quality: 'major' as ChordQuality, extensions: {}, startBeat: 0 },
    { scaleDegree: 5 as ScaleDegree, quality: 'major' as ChordQuality, extensions: {}, startBeat: 4 },
    { scaleDegree: 6 as ScaleDegree, quality: 'minor' as ChordQuality, extensions: {}, startBeat: 8 },
    { scaleDegree: 4 as ScaleDegree, quality: 'major' as ChordQuality, extensions: {}, startBeat: 12 },
    { scaleDegree: 2 as ScaleDegree, quality: 'minor' as ChordQuality, extensions: {}, startBeat: 16 },
    { scaleDegree: 3 as ScaleDegree, quality: 'minor' as ChordQuality, extensions: {}, startBeat: 20 },
    { scaleDegree: 7 as ScaleDegree, quality: 'diminished' as ChordQuality, extensions: {}, startBeat: 24 },
    { scaleDegree: 6 as ScaleDegree, quality: 'major' as ChordQuality, extensions: {}, startBeat: 28, isChromatic: true, chromaticType: 'borrowed' as const },
  ];

  let previousVoicing: Voices | undefined;

  return chordData.map((data, index) => {
    // First create chord with temporary voices
    const tempChord: Chord = {
      id: `demo-chord-${index}`,
      scaleDegree: data.scaleDegree,
      quality: data.quality,
      extensions: data.extensions,
      key,
      mode,
      isChromatic: data.isChromatic || false,
      chromaticType: data.chromaticType,
      voices: { soprano: 'C4', alto: 'G3', tenor: 'E3', bass: 'C3' }, // Temporary
      startBeat: data.startBeat,
      duration: 4,
      position: { x: 0, y: 0 }, // Not used anymore - kept for type compatibility
      size: 80,
      selected: false,
      playing: false,
      source: 'user' as const,
      createdAt: new Date().toISOString(),
    };

    // Generate proper SATB voicing with voice leading
    const voices = generateSATBVoicing(tempChord, previousVoicing);
    previousVoicing = voices;

    return { ...tempChord, voices };
  });
}

function App() {
  const [currentKey, setCurrentKey] = useState<MusicalKey>('C');
  const [currentMode, setCurrentMode] = useState<Mode>('major');
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [zoom, setZoom] = useState(1.0);
  const [selectedChordIds, setSelectedChordIds] = useState<string[]>([]);
  const [chords, setChords] = useState<Chord[]>(() => createDemoChords('C', 'major'));

  const { pushState, undo, redo } = useHistory();
  useAudioEngine(); // Hook needed for auto-init on first interaction
  const openAnalyzeModal = useAnalysisStore(state => state.openModal);
  const metadata = useAnalysisStore(state => state.metadata);
  const convertedChords = useAnalysisStore(state => state.convertedChords);
  const phraseBoundaries = useAnalysisStore(state => state.phraseBoundaries);
  const analysisResult = useAnalysisStore(state => state.result);
  const clearAnalyzedProgression = useAnalysisStore(state => state.clearAnalyzedProgression);
  const openBuildFromBonesPanel = useBuildFromBonesStore(state => state.openPanel);

  // Calculate total beats based on chord positions + buffer
  const totalBeats = useMemo(() => {
    if (chords.length === 0) return 16; // Minimum empty timeline
    const maxBeat = Math.max(...chords.map(c => c.startBeat + c.duration));
    return Math.max(16, maxBeat + 8); // Add 8 beats buffer after last chord
  }, [chords]);

  const { isPlaying, playheadPosition, togglePlay, tempo, setTempo } = usePlayback(chords, totalBeats);

  useEffect(() => {
    pushState(chords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally run only on mount to initialize history

  const saveToHistory = useCallback((newChords: Chord[]) => {
    pushState(newChords);
  }, [pushState]);

  // Load converted chords from analysis onto canvas
  useEffect(() => {
    if (convertedChords && convertedChords.length > 0 && analysisResult) {
      // Replace current chords with analyzed chords
      setChords(convertedChords);

      // Update key and mode from analysis result
      if (analysisResult.key) {
        setCurrentKey(analysisResult.key as MusicalKey);
      }
      if (analysisResult.mode) {
        setCurrentMode(analysisResult.mode as Mode);
      }
      // Update tempo from analysis result
      if (analysisResult.tempo) {
        setTempo(Math.round(analysisResult.tempo));
      }
    }
  }, [convertedChords, analysisResult, setTempo]);

  // Update all chords when key or mode changes
  useEffect(() => {
    if (chords.length === 0) return;

    // Check if any chord needs updating
    const needsUpdate = chords.some(c => c.key !== currentKey || c.mode !== currentMode);
    if (!needsUpdate) return;

    // Sort chords by position for proper voice leading
    const sortedChords = [...chords].sort((a, b) => a.startBeat - b.startBeat);
    let previousVoicing: Voices | undefined;

    const updatedChords = sortedChords.map(chord => {
      const newQuality = getChordQuality(chord.scaleDegree, currentMode);
      const updatedChord: Chord = {
        ...chord,
        key: currentKey,
        mode: currentMode,
        quality: newQuality,
      };
      // Regenerate voicing with new key/mode
      const voices = generateSATBVoicing(updatedChord, previousVoicing);
      previousVoicing = voices;
      return { ...updatedChord, voices };
    });

    setChords(updatedChords);
    pushState(updatedChords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey, currentMode]); // Only run when key or mode changes

  const handleUndo = useCallback(() => {
    const previousState = undo();
    if (previousState) {
      setChords(previousState);
      setSelectedChordIds([]);
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      setChords(nextState);
      setSelectedChordIds([]);
    }
  }, [redo]);

  // Selection handlers
  const handleSelectChord = useCallback((id: string) => {
    setSelectedChordIds([id]);
  }, []);

  const handleSelectChords = useCallback((ids: string[]) => {
    setSelectedChordIds(ids);
  }, []);

  const handleToggleChordSelection = useCallback((id: string) => {
    setSelectedChordIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  }, []);

  const handleSelectRange = useCallback((fromId: string, toId: string) => {
    const sortedChords = [...chords].sort((a, b) => a.startBeat - b.startBeat);
    const fromIndex = sortedChords.findIndex((c) => c.id === fromId);
    const toIndex = sortedChords.findIndex((c) => c.id === toId);

    if (fromIndex === -1 || toIndex === -1) return;

    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    const rangeIds = sortedChords.slice(start, end + 1).map((c) => c.id);

    setSelectedChordIds(rangeIds);
  }, [chords]);

  const handleClearSelection = useCallback(() => {
    setSelectedChordIds([]);
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedChordIds(chords.map((c) => c.id));
  }, [chords]);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const performDelete = useCallback(() => {
    const newChords = chords.filter((c) => !selectedChordIds.includes(c.id));
    setChords(newChords);
    saveToHistory(newChords);
    setSelectedChordIds([]);
    setShowDeleteConfirm(false);
  }, [selectedChordIds, chords, saveToHistory]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedChordIds.length === 0) return;
    if (selectedChordIds.length >= 5) {
      setShowDeleteConfirm(true);
    } else {
      performDelete();
    }
  }, [selectedChordIds, performDelete]);

  const handleDuplicateSelected = useCallback(() => {
    if (selectedChordIds.length === 0) return;

    const chordsToDuplicate = chords.filter((c) => selectedChordIds.includes(c.id));
    const duplicates = chordsToDuplicate.map((chord) => ({
      ...chord,
      id: uuidv4(),
      startBeat: chord.startBeat + 4,
      createdAt: new Date().toISOString(),
    }));

    const newChords = [...chords, ...duplicates];
    setChords(newChords);
    saveToHistory(newChords);
    setSelectedChordIds(duplicates.map((c) => c.id));
  }, [selectedChordIds, chords, saveToHistory]);

  // Handle Build From Bones - creates mock steps for demonstration
  const handleBuildFromBones = useCallback(() => {
    // Create mock steps since backend isn't ready yet
    const mockSteps = [
      {
        stepNumber: 0,
        stepName: 'Skeleton',
        description: 'Basic harmonic structure - the fundamental progression',
        chords: chords.map(c => ({
          ...c,
          quality: 'major' as ChordQuality,
          extensions: {} as ChordExtensions,
        })),
      },
      {
        stepNumber: 1,
        stepName: 'Add 7ths',
        description: 'Adding 7th extensions to deepen the harmonic color',
        chords: chords,
      },
    ];

    openBuildFromBonesPanel(mockSteps);
  }, [chords, openBuildFromBonesPanel]);

  const chordsWithPlayState = useMemo(() => {
    return chords.map(chord => ({
      ...chord,
      playing: isPlaying && playheadPosition >= chord.startBeat && playheadPosition < chord.startBeat + chord.duration,
    }));
  }, [chords, isPlaying, playheadPosition]);

  // Add chord - now just needs x position to calculate startBeat
  const handleAddChord = useCallback((
    scaleDegree: ScaleDegree,
    position: { x: number },
    options?: { quality?: ChordQuality; extensions?: ChordExtensions }
  ) => {
    const beatWidth = CANVAS_CONFIG.GRID_BEAT_WIDTH * zoom;
    const startBeat = Math.max(0, Math.round(position.x / beatWidth));

    const newChord: Chord = {
      id: uuidv4(),
      scaleDegree,
      quality: options?.quality || getChordQuality(scaleDegree, currentMode),
      extensions: options?.extensions || {},
      key: currentKey,
      mode: currentMode,
      isChromatic: false,
      voices: { soprano: 'C4', alto: 'G3', tenor: 'E3', bass: 'C3' }, // Temporary
      startBeat,
      duration: 4,
      position: { x: 0, y: 0 }, // Not used
      size: 80,
      selected: false,
      playing: false,
      source: 'user',
      createdAt: new Date().toISOString(),
    };

    // Find previous chord for voice leading
    const sortedChords = [...chords].sort((a, b) => a.startBeat - b.startBeat);
    const previousChord = sortedChords.filter(c => c.startBeat < startBeat).pop();

    // Generate proper SATB voicing
    const voices = generateSATBVoicing(newChord, previousChord?.voices);
    const chordWithVoices = { ...newChord, voices };

    const newChords = [...chords, chordWithVoices];
    setChords(newChords);
    saveToHistory(newChords);
  }, [zoom, currentKey, currentMode, chords, saveToHistory]);

  // Update chord position - now just updates startBeat
  const handleUpdateChordPosition = useCallback((chordId: string, startBeat: number) => {
    setChords((prevChords) =>
      prevChords.map((chord) =>
        chord.id === chordId ? { ...chord, startBeat } : chord
      )
    );
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Neume</h1>
        <p>Right-click to add chords, drag to reorder</p>
      </header>

      <div className="demo-controls">
        <div className="control-group">
          <label>Key:</label>
          <select value={currentKey} onChange={(e) => setCurrentKey(e.target.value as MusicalKey)}>
            <option value="C">C</option>
            <option value="Db">Db</option>
            <option value="D">D</option>
            <option value="Eb">Eb</option>
            <option value="E">E</option>
            <option value="F">F</option>
            <option value="Gb">Gb</option>
            <option value="G">G</option>
            <option value="Ab">Ab</option>
            <option value="A">A</option>
            <option value="Bb">Bb</option>
            <option value="B">B</option>
          </select>

          <label>Mode:</label>
          <select value={currentMode} onChange={(e) => setCurrentMode(e.target.value as Mode)}>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>

          <label>Beats:</label>
          <select value={beatsPerMeasure} onChange={(e) => setBeatsPerMeasure(Number(e.target.value))}>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={6}>6</option>
          </select>
        </div>

        <div className="control-group">
          <label>Zoom:</label>
          <button onClick={() => setZoom(0.5)} className={zoom === 0.5 ? 'active' : ''}>0.5x</button>
          <button onClick={() => setZoom(1.0)} className={zoom === 1.0 ? 'active' : ''}>1x</button>
          <button onClick={() => setZoom(2.0)} className={zoom === 2.0 ? 'active' : ''}>2x</button>
        </div>

        <div className="control-group">
          <button onClick={togglePlay} disabled={chords.length === 0} className="play-button">
            {isPlaying ? 'Stop' : 'Play'}
          </button>
          <button onClick={openAnalyzeModal} disabled={chords.length === 0} className="analyze-button">
            Analyze
          </button>
        </div>
      </div>

      {metadata && (
        <MetadataBanner
          title={metadata.title}
          composer={metadata.composer}
          sourceUrl={metadata.sourceUrl}
          onClear={() => {
            clearAnalyzedProgression();
            setChords([]); // Clear the canvas
          }}
          showBuildFromBones={!!analysisResult}
          onBuildFromBones={handleBuildFromBones}
        />
      )}

      <DroppableCanvas
        chords={chordsWithPlayState}
        phrases={phraseBoundaries || []}
        songContext={metadata ? { title: metadata.title, composer: metadata.composer, sourceUrl: metadata.sourceUrl } : undefined}
        currentKey={currentKey}
        currentMode={currentMode}
        beatsPerMeasure={beatsPerMeasure}
        zoom={zoom}
        isPlaying={isPlaying}
        playheadPosition={playheadPosition}
        totalBeats={totalBeats}
        selectedChordIds={selectedChordIds}
        onUpdateChordPosition={handleUpdateChordPosition}
        onAddChord={handleAddChord}
        onSelectChord={handleSelectChord}
        onSelectChords={handleSelectChords}
        onToggleChordSelection={handleToggleChordSelection}
        onSelectRange={handleSelectRange}
        onClearSelection={handleClearSelection}
        onSelectAll={handleSelectAll}
        onDeleteSelected={handleDeleteSelected}
        onDuplicateSelected={handleDuplicateSelected}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomChange={setZoom}
        onShowHelp={() => setShowShortcuts(true)}
        onTogglePlay={togglePlay}
        onTempoChange={(delta) => setTempo(Math.max(60, Math.min(220, tempo + delta)))}
      />

      <button className="help-button" onClick={() => setShowHelp(!showHelp)} title="Help">
        ?
      </button>

      {showHelp && (
        <div className="help-panel">
          <div className="help-panel-header">
            <h3>Help</h3>
            <button onClick={() => setShowHelp(false)} className="help-close">×</button>
          </div>

          <h4>Chord Shapes</h4>
          <div className="legend-grid">
            <div className="legend-item"><div className="legend-shape circle gold" /><span>I - Tonic</span></div>
            <div className="legend-item"><div className="legend-shape rounded-square sage" /><span>ii - Supertonic</span></div>
            <div className="legend-item"><div className="legend-shape triangle rose" /><span>iii - Mediant</span></div>
            <div className="legend-item"><div className="legend-shape square blue" /><span>IV - Subdominant</span></div>
            <div className="legend-item"><div className="legend-shape pentagon terracotta" /><span>V - Dominant</span></div>
            <div className="legend-item"><div className="legend-shape circle purple" /><span>vi - Submediant</span></div>
            <div className="legend-item"><div className="legend-shape pentagon gray" /><span>vii° - Leading</span></div>
          </div>

          <h4>Shortcuts</h4>
          <div className="shortcuts-grid">
            <div><kbd>Click</kbd> Select</div>
            <div><kbd>⌘+Click</kbd> Multi-select</div>
            <div><kbd>⌘+A</kbd> Select all</div>
            <div><kbd>Delete</kbd> Delete</div>
            <div><kbd>⌘+D</kbd> Duplicate</div>
            <div><kbd>⌘+Z</kbd> Undo</div>
            <div><kbd>Escape</kbd> Deselect</div>
          </div>
        </div>
      )}

      <DeleteConfirmation
        isOpen={showDeleteConfirm}
        chordCount={selectedChordIds.length}
        onConfirm={performDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <KeyboardShortcutsGuide
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      <TempoDial
        tempo={tempo}
        onTempoChange={setTempo}
      />

      <AnalyzeModal />
      <WhyThisPanel />
      <BuildFromBonesPanel />
    </div>
  );
}

export default App;
