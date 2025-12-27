import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { DroppableCanvas } from '@/components/Canvas';
import { MetadataBanner } from '@/components/Canvas/MetadataBanner';
import { DeleteConfirmation } from '@/components/UI/DeleteConfirmation';
import { HelpTooltip } from '@/components/UI/HelpTooltip';
import { KeySelector, ModeToggle, BeatsSelector } from '@/components/UI/MusicalSelector';
import { SegmentedControl } from '@/components/UI/SegmentedControl';
import { HELP_CONTENT } from '@/data/help-content';
import { WhyThisPanel, BuildFromBonesPanel } from '@/components/Panels';
import { PulseRingTempo } from '@/components/Controls';
import { WelcomeTutorial } from '@/components/Tutorial/WelcomeTutorial';
import { Sidebar, SidebarSection, SidebarDivider, SidebarSpacer } from '@/components/Sidebar';
import { AuthModal, UserMenu } from '@/components/Auth';

// Lazy load modals for code splitting
const KeyboardShortcutsGuide = lazy(() => import('@/components/UI/KeyboardShortcutsGuide').then(m => ({ default: m.KeyboardShortcutsGuide })));
const AnalyzeModal = lazy(() => import('@/components/Modals/AnalyzeModal').then(m => ({ default: m.AnalyzeModal })));
const MyProgressionsModal = lazy(() => import('@/components/Modals/MyProgressionsModal').then(m => ({ default: m.MyProgressionsModal })));
const RefineModal = lazy(() => import('@/components/Modals/RefineModal').then(m => ({ default: m.RefineModal })));
import { useHistory } from '@/hooks/useHistory';
import { usePlayback } from '@/hooks/usePlayback';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useAnalysisStore } from '@/store/analysis-store';
import { useAuthStore } from '@/store/auth-store';
import { useBuildFromBonesStore } from '@/store/build-from-bones-store';
import { useProgressionsStore } from '@/store/progressions-store';
import { useRefineStore } from '@/store/refine-store';
import { useTutorialStore } from '@/store/tutorial-store';
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

  // Tutorial initialization
  const { startTutorial, checkCompletion } = useTutorialStore();
  useEffect(() => {
    checkCompletion();
    const hasCompleted = localStorage.getItem('tutorial-completed') === 'true';
    if (!hasCompleted) {
      startTutorial();
    }
  }, [startTutorial, checkCompletion]);

  // Auth state
  const { user, initialize: initializeAuth } = useAuthStore();
  const { migrateLocalData, loadProgressions } = useProgressionsStore();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Migrate local data when user signs in
  useEffect(() => {
    if (user) {
      migrateLocalData(user.id).then(({ migrated }) => {
        if (migrated > 0) {
          console.log(`Migrated ${migrated} progressions to cloud`);
        }
        loadProgressions();
      });
    }
  }, [user, migrateLocalData, loadProgressions]);

  const openAnalyzeModal = useAnalysisStore(state => state.openModal);
  const metadata = useAnalysisStore(state => state.metadata);
  const convertedChords = useAnalysisStore(state => state.convertedChords);
  const phraseBoundaries = useAnalysisStore(state => state.phraseBoundaries);
  const analysisResult = useAnalysisStore(state => state.result);
  const clearAnalyzedProgression = useAnalysisStore(state => state.clearAnalyzedProgression);
  const openBuildFromBonesPanel = useBuildFromBonesStore(state => state.openPanel);
  const openProgressionsModal = useProgressionsStore(state => state.openModal);
  const openRefineModal = useRefineStore(state => state.openModal);

  // Calculate total beats based on chord positions + buffer
  const totalBeats = useMemo(() => {
    if (chords.length === 0) return 16; // Minimum empty timeline
    const maxBeat = Math.max(...chords.map(c => c.startBeat + c.duration));
    return Math.max(16, maxBeat + 8); // Add 8 beats buffer after last chord
  }, [chords]);

  const { isPlaying, playheadPosition, togglePlay, stop, tempo, setTempo } = usePlayback(chords, totalBeats);

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
        <div className="header-brand">
          <span className="header-accent" aria-hidden="true" />
          <h1>Neume</h1>
        </div>
        <p className="header-hint">Right-click to add chords</p>
        <div className="header-right">
          <UserMenu onSignInClick={() => setShowAuthModal(true)} />
        </div>
      </header>

      <Sidebar>
        {/* Musical Settings */}
        <SidebarSection>
          <HelpTooltip
            content={HELP_CONTENT['key-selector'].content}
            title={HELP_CONTENT['key-selector'].title}
            examples={HELP_CONTENT['key-selector'].examples}
            position="right"
          >
            <KeySelector
              value={currentKey}
              onChange={setCurrentKey}
              mode={currentMode}
            />
          </HelpTooltip>

          <HelpTooltip
            content={HELP_CONTENT['mode-selector'].content}
            title={HELP_CONTENT['mode-selector'].title}
            examples={HELP_CONTENT['mode-selector'].examples}
            position="right"
          >
            <ModeToggle
              value={currentMode}
              onChange={setCurrentMode}
            />
          </HelpTooltip>

          <BeatsSelector
            value={beatsPerMeasure}
            onChange={setBeatsPerMeasure}
          />
        </SidebarSection>

        <SidebarDivider />

        {/* Zoom */}
        <SidebarSection>
          <SegmentedControl
            options={[
              { value: 0.5, label: '\u2212' },
              { value: 1.0, label: '1:1' },
              { value: 2.0, label: '+' },
            ]}
            value={zoom}
            onChange={(v) => setZoom(v as number)}
          />
        </SidebarSection>

        <SidebarDivider />

        {/* Tempo */}
        <SidebarSection className="tempo-section">
          <HelpTooltip
            content={HELP_CONTENT['tempo-dial'].content}
            title={HELP_CONTENT['tempo-dial'].title}
            shortcut={HELP_CONTENT['tempo-dial'].shortcut}
            position="right"
          >
            <PulseRingTempo
              tempo={tempo}
              onTempoChange={setTempo}
              minTempo={60}
              maxTempo={220}
              isPlaying={isPlaying}
            />
          </HelpTooltip>
        </SidebarSection>

        <SidebarDivider />

        {/* Action Buttons */}
        <SidebarSection className="actions-section">
          <HelpTooltip
            content={HELP_CONTENT['play-button'].content}
            title={HELP_CONTENT['play-button'].title}
            shortcut={HELP_CONTENT['play-button'].shortcut}
            position="right"
          >
            <button
              onClick={togglePlay}
              disabled={chords.length === 0}
              className={`action-button play-button ${isPlaying ? 'is-playing' : ''}`}
              aria-label={isPlaying ? 'Stop playback' : 'Play progression'}
            >
              {isPlaying ? (
                <>
                  <svg className="stop-icon" viewBox="0 0 16 16" fill="currentColor" stroke="none">
                    <rect x="3" y="3" width="10" height="10" rx="1" />
                  </svg>
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <svg className="play-icon" viewBox="0 0 16 16" fill="currentColor" stroke="none">
                    <path d="M4 2.5v11l9-5.5-9-5.5z" />
                  </svg>
                  <span>Play</span>
                </>
              )}
            </button>
          </HelpTooltip>
          <HelpTooltip
            content={HELP_CONTENT['analyze-button'].content}
            title={HELP_CONTENT['analyze-button'].title}
            shortcut={HELP_CONTENT['analyze-button'].shortcut}
            position="right"
          >
            <button
              onClick={openAnalyzeModal}
              disabled={chords.length === 0}
              className="action-button analyze-button"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6.5" cy="6.5" r="4.5" />
                <line x1="10" y1="10" x2="14" y2="14" />
              </svg>
              <span>Analyze</span>
            </button>
          </HelpTooltip>
          <button
            onClick={openProgressionsModal}
            className="action-button progressions-button"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path className="folder-top" d="M2 4h4l2 2h6v1H2V4z" />
              <path d="M2 7h12v6H2z" />
            </svg>
            <span>My Progressions</span>
          </button>
          <HelpTooltip
            content={HELP_CONTENT['refine-button'].content}
            title={HELP_CONTENT['refine-button'].title}
            shortcut={HELP_CONTENT['refine-button'].shortcut}
            position="right"
          >
            <button
              onClick={() => {
                if (selectedChordIds.length > 0) {
                  openRefineModal(selectedChordIds);
                }
              }}
              disabled={selectedChordIds.length === 0}
              className="action-button refine-button"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2v2M8 12v2M2 8h2M12 8h2" />
                <path d="M4.5 4.5l1 1M10.5 10.5l1 1M4.5 11.5l1-1M10.5 5.5l1-1" />
                <circle cx="8" cy="8" r="1.5" fill="currentColor" />
              </svg>
              <span>Refine</span>
            </button>
          </HelpTooltip>
        </SidebarSection>

        <SidebarSpacer />

        {/* Help at bottom */}
        <Suspense fallback={null}>
          <KeyboardShortcutsGuide
            isOpen={showShortcuts}
            onClose={() => setShowShortcuts(false)}
          />
        </Suspense>
      </Sidebar>

      <div className="canvas-area">
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
        onStop={stop}
        onTempoChange={(delta) => setTempo(Math.max(60, Math.min(220, tempo + delta)))}
      />
      </div>

      <DeleteConfirmation
        isOpen={showDeleteConfirm}
        chordCount={selectedChordIds.length}
        onConfirm={performDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <Suspense fallback={null}>
        <AnalyzeModal />
        <MyProgressionsModal />
        <RefineModal />
      </Suspense>

      <WhyThisPanel />
      <BuildFromBonesPanel />

      <WelcomeTutorial />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

export default App;
