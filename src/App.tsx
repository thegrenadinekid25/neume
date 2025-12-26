import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import styles from './App.module.css'
import { DroppableCanvas } from './components/Canvas/DroppableCanvas'
import { AudioInitButton } from './components/Audio/AudioInitButton'
import { TempoControl } from './components/Controls/TempoControl'
import { Spinner } from './components/UI/Spinner'

// Lazy load modals and panels for better performance
const AnalyzeModal = lazy(() => import('./components/Modals/AnalyzeModal').then(m => ({ default: m.AnalyzeModal })))
const RefineThisModal = lazy(() => import('./components/Modals/RefineThisModal').then(m => ({ default: m.RefineThisModal })))
const MyProgressionsModal = lazy(() => import('./components/Modals/MyProgressionsModal').then(m => ({ default: m.MyProgressionsModal })))
const KeyboardShortcutsGuide = lazy(() => import('./components/Modals/KeyboardShortcutsGuide').then(m => ({ default: m.KeyboardShortcutsGuide })))
const BuildFromBonesPanel = lazy(() => import('./components/Panels/BuildFromBonesPanel').then(m => ({ default: m.BuildFromBonesPanel })))
const WelcomeTutorial = lazy(() => import('./components/Tutorial/WelcomeTutorial').then(m => ({ default: m.WelcomeTutorial })))
import { useCanvasStore } from './store/canvas-store'
import { useAnalysisStore } from './store/analysis-store'
import { useBuildFromBonesStore } from './store/build-from-bones-store'
import { useRefineStore } from './store/refine-store'
import { useProgressionsStore } from './store/progressions-store'
import { useTutorialStore, checkTutorialStatus } from './store/tutorial-store'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { deconstructProgression } from './services/api-service'
import { playbackSystem } from './audio/PlaybackSystem'
import { audioEngine } from './audio/AudioEngine'
import { normalizeVolume } from './utils/audioUtils'
import { Chord } from '@types'
import { v4 as uuidv4 } from 'uuid'

// Create example chords to test all 7 shapes
const createExampleChords = (key: string, mode: 'major' | 'minor'): Chord[] => {
  const baseVoices = {
    soprano: 'E4',
    alto: 'C4',
    tenor: 'G3',
    bass: 'C3',
  }

  return [
    // I - Circle (gold)
    {
      id: uuidv4(),
      scaleDegree: 1,
      quality: 'major',
      extensions: {},
      key,
      mode,
      isChromatic: false,
      voices: baseVoices,
      startBeat: 0,
      duration: 4,
      position: { x: 100, y: 200 },
      size: 60,
      selected: false,
      playing: false,
      source: 'user',
      createdAt: new Date().toISOString(),
    },
    // ii - Rounded square (sage green)
    {
      id: uuidv4(),
      scaleDegree: 2,
      quality: 'minor',
      extensions: { add9: true },
      key,
      mode,
      isChromatic: false,
      voices: baseVoices,
      startBeat: 4,
      duration: 4,
      position: { x: 420, y: 200 },
      size: 60,
      selected: false,
      playing: false,
      source: 'user',
      createdAt: new Date().toISOString(),
    },
    // iii - Triangle (dusty rose)
    {
      id: uuidv4(),
      scaleDegree: 3,
      quality: 'minor',
      extensions: {},
      key,
      mode,
      isChromatic: false,
      voices: baseVoices,
      startBeat: 8,
      duration: 4,
      position: { x: 740, y: 200 },
      size: 60,
      selected: false,
      playing: false,
      source: 'user',
      createdAt: new Date().toISOString(),
    },
    // IV - Square (periwinkle blue)
    {
      id: uuidv4(),
      scaleDegree: 4,
      quality: 'major',
      extensions: { sus4: true },
      key,
      mode,
      isChromatic: false,
      voices: baseVoices,
      startBeat: 12,
      duration: 4,
      position: { x: 1060, y: 200 },
      size: 60,
      selected: false,
      playing: false,
      source: 'user',
      createdAt: new Date().toISOString(),
    },
    // V - Pentagon (terracotta)
    {
      id: uuidv4(),
      scaleDegree: 5,
      quality: 'major',
      extensions: {},
      key,
      mode,
      isChromatic: false,
      voices: baseVoices,
      startBeat: 16,
      duration: 4,
      position: { x: 1380, y: 200 },
      size: 60,
      selected: false,
      playing: false,
      source: 'user',
      createdAt: new Date().toISOString(),
    },
    // vi - Circle (purple)
    {
      id: uuidv4(),
      scaleDegree: 6,
      quality: 'minor',
      extensions: {},
      key,
      mode,
      isChromatic: false,
      voices: baseVoices,
      startBeat: 20,
      duration: 4,
      position: { x: 1700, y: 200 },
      size: 60,
      selected: false,
      playing: false,
      source: 'user',
      createdAt: new Date().toISOString(),
    },
    // vii° - Pentagon (gray)
    {
      id: uuidv4(),
      scaleDegree: 7,
      quality: 'diminished',
      extensions: {},
      key,
      mode,
      isChromatic: false,
      voices: baseVoices,
      startBeat: 24,
      duration: 4,
      position: { x: 2020, y: 200 },
      size: 60,
      selected: false,
      playing: false,
      source: 'user',
      createdAt: new Date().toISOString(),
    },
    // Chromatic example (borrowed chord with shimmer)
    {
      id: uuidv4(),
      scaleDegree: 4,
      quality: 'major',
      extensions: { add9: true },
      key,
      mode,
      isChromatic: true,
      chromaticType: 'borrowed',
      voices: baseVoices,
      startBeat: 28,
      duration: 4,
      position: { x: 2340, y: 200 },
      size: 60,
      selected: false,
      playing: false,
      source: 'user',
      createdAt: new Date().toISOString(),
    },
  ] as Chord[]
}

function App() {
  const {
    chords,
    selectedChordIds,
    showConnectionLines,
    addChord,
    updateChordPosition,
    setChords,
    selectChord,
    clearSelection,
    selectChords,
    toggleChordSelection,
    selectAll,
    toggleConnectionLines,
    deleteSelected,
    duplicateSelected,
    undo,
    redo,
  } = useCanvasStore()

  const openAnalyzeModal = useAnalysisStore(state => state.openModal)
  const openBuildFromBones = useBuildFromBonesStore(state => state.openPanel)
  const openRefineModal = useRefineStore(state => state.openModal)
  const { openModal: openProgressionsModal, openSaveDialog } = useProgressionsStore()
  const { startTutorial, currentStep: tutorialStep, isActive: tutorialActive, nextStep: tutorialNextStep } = useTutorialStore()

  const [currentKey, setCurrentKey] = useState('C')
  const [currentMode, setCurrentMode] = useState<'major' | 'minor'>('major')
  const [zoom, setZoom] = useState(1.0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playheadPosition, setPlayheadPosition] = useState(0)
  const [isBuildFromBonesLoading, setIsBuildFromBonesLoading] = useState(false)

  // Initialize with example chords
  useEffect(() => {
    const exampleChords = createExampleChords(currentKey, currentMode)
    setChords(exampleChords)
  }, []) // Only run once on mount

  // Auto-start tutorial for first-time users
  useEffect(() => {
    if (checkTutorialStatus()) {
      // Small delay to ensure app is fully loaded
      setTimeout(() => {
        startTutorial()
      }, 500)
    }
  }, [])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onDelete: deleteSelected,
    onSelectAll: selectAll,
    onUndo: undo,
    onRedo: redo,
    onDuplicate: duplicateSelected,
    onToggleConnectionLines: toggleConnectionLines,
    onClearSelection: clearSelection,
    onSave: () => {
      if (chords.length > 0) {
        openSaveDialog();
      }
    },
    onExport: () => {
      // TODO: Implement MIDI export shortcut
      console.log('Export MIDI shortcut pressed');
    },
    onNew: () => {
      if (confirm('Clear the canvas? This will remove all chords.')) {
        setChords([]);
      }
    },
    onZoomIn: () => setZoom((z) => Math.min(z + 0.25, 3.0)),
    onZoomOut: () => setZoom((z) => Math.max(z - 0.25, 0.25)),
    onResetZoom: () => setZoom(1.0),
  })

  // Handle chord selection (supports Cmd/Ctrl multi-select)
  const handleSelectChord = useCallback((chordId: string, event?: React.MouseEvent) => {
    const isMultiSelect = event?.metaKey || event?.ctrlKey

    if (isMultiSelect) {
      toggleChordSelection(chordId)
    } else {
      clearSelection()
      selectChord(chordId)
    }
  }, [toggleChordSelection, clearSelection, selectChord])

  // Handle multiple chord selection (from rectangular selection)
  const handleSelectMultiple = useCallback((chordIds: string[]) => {
    selectChords(chordIds)
  }, [selectChords])

  // Setup playback callbacks and cleanup
  useEffect(() => {
    playbackSystem.setPlayheadCallback((beat) => {
      setPlayheadPosition(beat)
    })

    return () => {
      playbackSystem.dispose()
      audioEngine.dispose()
    }
  }, [])

  // Update playback schedule when chords change
  useEffect(() => {
    if (chords.length > 0) {
      playbackSystem.scheduleProgression(chords)
    }
  }, [chords])

  // Auto-adjust volume based on chord count (prevent clipping)
  useEffect(() => {
    const normalizedVolume = normalizeVolume(chords.length)
    audioEngine.setMasterVolume(normalizedVolume)
  }, [chords.length])

  // Handle play/pause
  const handlePlayback = useCallback(() => {
    if (playbackSystem.isPlaying) {
      playbackSystem.pause()
      setIsPlaying(false)
    } else {
      playbackSystem.play()
      setIsPlaying(true)

      // Advance tutorial if on step 1 (Play Your First Progression)
      if (tutorialActive && tutorialStep === 1) {
        tutorialNextStep()
      }
    }
  }, [tutorialActive, tutorialStep, tutorialNextStep])

  // Handle stop
  const handleStop = useCallback(() => {
    playbackSystem.stop()
    setIsPlaying(false)
    setPlayheadPosition(0)
  }, [])

  // Space bar for play/pause
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        handlePlayback()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handlePlayback])

  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <div>
          <h1>Harmonic Canvas</h1>
          <p>Week 6: Polish & Launch Prep</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={openAnalyzeModal}
            style={{
              padding: '8px 16px',
              background: '#4A90E2',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🔍 Analyze
          </button>
          <button
            onClick={async () => {
              if (chords.length === 0) {
                alert('Please add some chords to the canvas first!');
                return;
              }

              setIsBuildFromBonesLoading(true);

              try {
                // Call real API to deconstruct progression
                const steps = await deconstructProgression(
                  chords,
                  currentKey,
                  currentMode,
                  'Modern sacred choral'
                );
                openBuildFromBones(steps);
              } catch (error) {
                console.error('Deconstruction failed:', error);
                alert('Failed to deconstruct progression. Using sample data instead.');

                // Fallback to sample steps if API fails
                const sampleSteps = [
                  {
                    stepNumber: 0,
                    stepName: 'Skeleton',
                    description: 'The harmonic foundation - simple diatonic progression with basic triads.',
                    chords: chords.map(c => ({ ...c, extensions: {} }))
                  },
                  {
                    stepNumber: 1,
                    stepName: 'Final Version',
                    description: 'The complete progression with all extensions.',
                    chords
                  }
                ];
                openBuildFromBones(sampleSteps);
              } finally {
                setIsBuildFromBonesLoading(false);
              }
            }}
            disabled={isBuildFromBonesLoading}
            style={{
              padding: '8px 16px',
              background: '#9b59b6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isBuildFromBonesLoading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              opacity: isBuildFromBonesLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isBuildFromBonesLoading ? (
              <>
                <Spinner size="sm" />
                Deconstructing...
              </>
            ) : (
              <>🦴 Build From Bones</>
            )}
          </button>
          <button
            onClick={() => {
              if (selectedChordIds.length === 0) {
                alert('Please select a chord first!');
                return;
              }
              openRefineModal(selectedChordIds);
            }}
            style={{
              padding: '8px 16px',
              background: '#e67e22',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            ✨ Refine This
          </button>
          <button
            onClick={() => {
              if (chords.length === 0) {
                alert('Please add some chords first!');
                return;
              }
              openSaveDialog();
            }}
            style={{
              padding: '8px 16px',
              background: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            💾 Save
          </button>
          <button
            onClick={openProgressionsModal}
            style={{
              padding: '8px 16px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            📂 My Progressions
          </button>
          <AudioInitButton />
        </div>
      </header>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label>Key:</label>
          <select
            value={currentKey}
            onChange={(e) => setCurrentKey(e.target.value)}
            style={{ marginLeft: '8px', padding: '4px 8px' }}
          >
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
            <option value="F">F</option>
            <option value="G">G</option>
            <option value="A">A</option>
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label>Mode:</label>
          <select
            value={currentMode}
            onChange={(e) => setCurrentMode(e.target.value as 'major' | 'minor')}
            style={{ marginLeft: '8px', padding: '4px 8px' }}
          >
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label>Zoom:</label>
          <button onClick={() => setZoom(0.5)} style={{ marginLeft: '8px', padding: '4px 12px' }}>
            0.5x
          </button>
          <button onClick={() => setZoom(1.0)} style={{ padding: '4px 12px' }}>
            1x
          </button>
          <button onClick={() => setZoom(2.0)} style={{ padding: '4px 12px' }}>
            2x
          </button>
        </div>

        <TempoControl defaultTempo={120} />

        <div className={styles.controlGroup}>
          <button
            onClick={handlePlayback}
            disabled={chords.length === 0}
            style={{ padding: '4px 16px', fontWeight: 'bold' }}
            title={chords.length === 0 ? 'Add chords to play' : ''}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            onClick={handleStop}
            disabled={!isPlaying && playheadPosition === 0}
            style={{ padding: '4px 16px' }}
          >
            ⏹ Stop
          </button>
        </div>
      </div>

      {/* Canvas */}
      <DroppableCanvas
        chords={chords}
        currentKey={currentKey}
        currentMode={currentMode}
        zoom={zoom}
        isPlaying={isPlaying}
        playheadPosition={playheadPosition}
        selectedChordIds={selectedChordIds}
        showConnectionLines={showConnectionLines}
        onUpdateChordPosition={updateChordPosition}
        onAddChord={addChord}
        onSelectChord={handleSelectChord}
        onSelectMultiple={handleSelectMultiple}
        onClearSelection={clearSelection}
      />

      {/* Modals */}
      <Suspense fallback={<div />}>
        <AnalyzeModal />
        <RefineThisModal />
        <MyProgressionsModal />
        <KeyboardShortcutsGuide />
      </Suspense>

      {/* Build From Bones Panel */}
      <Suspense fallback={<div />}>
        <BuildFromBonesPanel />
      </Suspense>

      {/* Welcome Tutorial */}
      <Suspense fallback={<div />}>
        <WelcomeTutorial />
      </Suspense>
    </div>
  )
}

export default App
