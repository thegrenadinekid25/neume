import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { DroppableCanvas } from '@/components/Canvas';
import { MetadataBanner } from '@/components/Canvas/MetadataBanner';
import { DeleteConfirmation } from '@/components/UI/DeleteConfirmation';
import { HelpTooltip } from '@/components/UI/HelpTooltip';
import { KeySelector, ModeToggle, BeatsSelector } from '@/components/UI/MusicalSelector';
import { VoicingModeToggle } from '@/components/UI/VoicingModeToggle';
import { HELP_CONTENT } from '@/data/help-content';
import { WhyThisPanel, BuildFromBonesPanel, CompositionToolsPanel } from '@/components/Panels';
import { PulseRingTempo, SoundToggle } from '@/components/Controls';
import { WelcomeTutorial } from '@/components/Tutorial/WelcomeTutorial';
import { Sidebar, SidebarSection, SidebarDivider, SidebarSpacer } from '@/components/Sidebar';
import { AuthModal, UserMenu } from '@/components/Auth';
import { AudioLoadingIndicator } from '@/components/Audio';
import { VoiceToggleBar } from '@/components/VoiceLaneEditor';
import { ToastContainer, ConfirmationDialog } from '@/components/UI';
import { useAppViewStore } from '@/store/app-view-store';
import { showConfirmation, showDestructiveConfirm } from '@/store/confirmation-store';
import { Dashboard } from '@/components/Dashboard';

// Lazy load modals for code splitting
const KeyboardShortcutsGuide = lazy(() => import('@/components/UI/KeyboardShortcutsGuide').then(m => ({ default: m.KeyboardShortcutsGuide })));
const AnalyzeModal = lazy(() => import('@/components/Modals/AnalyzeModal').then(m => ({ default: m.AnalyzeModal })));
const MyProgressionsModal = lazy(() => import('@/components/Modals/MyProgressionsModal').then(m => ({ default: m.MyProgressionsModal })));
const RefineModal = lazy(() => import('@/components/Modals/RefineModal').then(m => ({ default: m.RefineModal })));
const SaveProgressionDialog = lazy(() => import('@/components/Modals/SaveProgressionDialog').then(m => ({ default: m.SaveProgressionDialog })));
const NarrativeComposerModal = lazy(() => import('@/components/Modals/NarrativeComposerModal').then(m => ({ default: m.NarrativeComposerModal })));
const SettingsModal = lazy(() => import('@/components/Modals/SettingsModal').then(m => ({ default: m.SettingsModal })));
import { useHistory } from '@/hooks/useHistory';
import { usePlayback } from '@/hooks/usePlayback';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useAudioStore } from '@/store/audio-store';
import { useAnalysisStore } from '@/store/analysis-store';
import { useAuthStore } from '@/store/auth-store';
import { useCounterpointWarningsStore } from '@/store/counterpoint-warnings-store';
import { useBuildFromBonesStore } from '@/store/build-from-bones-store';
import { useProgressionsStore } from '@/store/progressions-store';
import { useRefineStore } from '@/store/refine-store';
import { useTutorialStore } from '@/store/tutorial-store';
import { useVoiceLineStore } from '@/store/voice-line-store';
import { useCompositionToolsStore } from '@/store/composition-tools-store';
import { useVoicingStore } from '@/store/voicing-store';
import { analyzeCounterpoint } from '@/services/counterpoint-analyzer';
import { downloadMusicXML } from '@/services/musicxml-exporter';
import { generateSATBVoicing } from '@/audio/VoiceLeading';
import { deconstructProgression } from '@/services/api-service';
import { optimizeProgressionVoicing } from '@/services/voice-leading-optimizer';
import { audioEngine } from '@/audio/AudioEngine';
import type { Chord, MusicalKey, Mode, ScaleDegree, ChordQuality, ChordExtensions, Voices, SavedProgression } from '@/types';
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
  const [showVoiceLanes, setShowVoiceLanes] = useState(false);
  const [pieceTitle, setPieceTitle] = useState('Untitled');

  // View state
  const currentView = useAppViewStore((s) => s.currentView);
  const navigateToDashboard = useAppViewStore((s) => s.navigateToDashboard);

  // Audio settings
  const { soundType, setSoundType } = useAudioStore();

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
  const { migrateLocalData, loadProgressions, saveProgression } = useProgressionsStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Sync sound type with audio engine when it changes
  useEffect(() => {
    audioEngine.setSoundType(soundType);
  }, [soundType]);

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

  // Listen for loadProgression events from MyProgressionsModal
  useEffect(() => {
    const handleLoadProgression = (e: CustomEvent<SavedProgression>) => {
      const progression = e.detail;
      setChords(progression.chords);
      setCurrentKey(progression.key as MusicalKey);
      setCurrentMode(progression.mode as Mode);
      setPieceTitle(progression.title);
      setSelectedChordIds([]);
      // Convert time signature to beats per measure
      const beatsMap: Record<string, number> = { '2/2': 2, '3/4': 3, '4/4': 4, '6/8': 6 };
      setBeatsPerMeasure(beatsMap[progression.timeSignature] || 4);
    };

    window.addEventListener('loadProgression', handleLoadProgression as EventListener);
    return () => window.removeEventListener('loadProgression', handleLoadProgression as EventListener);
  }, []);

  const openAnalyzeModal = useAnalysisStore(state => state.openModal);

  // Listen for openAnalyzeModal events from Dashboard
  useEffect(() => {
    const handleOpenAnalyze = () => openAnalyzeModal();
    window.addEventListener('openAnalyzeModal', handleOpenAnalyze);
    return () => window.removeEventListener('openAnalyzeModal', handleOpenAnalyze);
  }, [openAnalyzeModal]);
  const metadata = useAnalysisStore(state => state.metadata);
  const convertedChords = useAnalysisStore(state => state.convertedChords);
  const phraseBoundaries = useAnalysisStore(state => state.phraseBoundaries);
  const analysisResult = useAnalysisStore(state => state.result);
  const clearAnalyzedProgression = useAnalysisStore(state => state.clearAnalyzedProgression);
  const openBuildFromBonesPanel = useBuildFromBonesStore(state => state.openPanel);
  const setBuildFromBonesLoading = useBuildFromBonesStore(state => state.setLoading);
  const setBuildFromBonesError = useBuildFromBonesStore(state => state.setError);
  const openCompositionToolsPanel = useCompositionToolsStore(state => state.openPanel);
  const openProgressionsModal = useProgressionsStore(state => state.openModal);
  const openRefineModal = useRefineStore(state => state.openModal);

  // Voice lines
  const initializeVoiceLines = useVoiceLineStore(state => state.initializeFromChords);
  const voiceLines = useVoiceLineStore(state => state.voiceLines);

  // Voicing mode
  const { mode: voicingMode, setMode: setVoicingMode } = useVoicingStore();

  // Sync voice lines when chords change and voice lanes are visible
  useEffect(() => {
    if (showVoiceLanes && chords.length > 0) {
      initializeVoiceLines(chords);
    }
  }, [chords, showVoiceLanes, initializeVoiceLines]);

  // Counterpoint analysis
  const setCounterpointResult = useCounterpointWarningsStore(state => state.setAnalysisResult);
  const isCounterpointVisible = useCounterpointWarningsStore(state => state.isOverlayVisible);
  const toggleCounterpointOverlay = useCounterpointWarningsStore(state => state.toggleOverlay);
  const counterpointViolations = useCounterpointWarningsStore(state => state.violations);

  // Calculate total beats based on chord positions + buffer
  const totalBeats = useMemo(() => {
    if (chords.length === 0) return 16; // Minimum empty timeline
    const maxBeat = Math.max(...chords.map(c => c.startBeat + c.duration));
    return Math.max(16, maxBeat + 8); // Add 8 beats buffer after last chord
  }, [chords]);

  const { isPlaying, playheadPosition, togglePlay, stop, tempo, setTempo } = usePlayback(chords, totalBeats, {
    voiceLinesActive: showVoiceLanes,
    voiceLines: voiceLines,
  });

  // Run counterpoint analysis
  const handleAnalyzeCounterpoint = useCallback(() => {
    // Initialize voice lines from current chords for analysis
    const voiceLineStore = useVoiceLineStore.getState();
    if (!voiceLineStore.isInitialized) {
      voiceLineStore.initializeFromChords(chords);
    }
    // Get fresh voiceLines after initialization
    const currentVoiceLines = useVoiceLineStore.getState().voiceLines;
    const result = analyzeCounterpoint(currentVoiceLines);
    setCounterpointResult(result);
    if (!isCounterpointVisible) {
      toggleCounterpointOverlay();
    }
  }, [chords, setCounterpointResult, isCounterpointVisible, toggleCounterpointOverlay]);

  // Handle MusicXML export
  const handleExportMusicXML = useCallback(() => {
    // Create a progression object for export
    const timeSignatureMap: Record<number, SavedProgression['timeSignature']> = {
      2: '2/2',
      3: '3/4',
      4: '4/4',
      6: '6/8',
    };
    const progression: SavedProgression = {
      id: uuidv4(),
      title: metadata?.title || 'Untitled Progression',
      key: currentKey,
      mode: currentMode,
      tempo,
      timeSignature: timeSignatureMap[beatsPerMeasure] || '4/4',
      chords,
      tags: [],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // Get voice lines from store if initialized
    const voiceLineStore = useVoiceLineStore.getState();
    downloadMusicXML(progression, voiceLineStore.isInitialized ? voiceLineStore.voiceLines : undefined);
  }, [chords, currentKey, currentMode, tempo, beatsPerMeasure, metadata]);

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

  // Re-voice progression when voicing mode changes
  useEffect(() => {
    if (chords.length === 0) return;
    if (voicingMode === 'voice-led') {
      // Apply voice-leading optimization
      const revoiced = optimizeProgressionVoicing(chords, currentKey, currentMode);
      setChords(revoiced);
      pushState(revoiced);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voicingMode]); // Only run when voicing mode changes

  // Voice line undo/redo from store
  const voiceLineUndo = useVoiceLineStore((state) => state.undo);
  const voiceLineRedo = useVoiceLineStore((state) => state.redo);
  const canUndoVoiceLines = useVoiceLineStore((state) => state.canUndo);
  const canRedoVoiceLines = useVoiceLineStore((state) => state.canRedo);

  const handleUndo = useCallback(() => {
    // If voice lanes are visible and there's voice line history, undo voice lines first
    if (showVoiceLanes && canUndoVoiceLines()) {
      voiceLineUndo();
      return;
    }
    // Otherwise undo chords
    const previousState = undo();
    if (previousState) {
      setChords(previousState);
      setSelectedChordIds([]);
    }
  }, [undo, showVoiceLanes, canUndoVoiceLines, voiceLineUndo]);

  const handleRedo = useCallback(() => {
    // If voice lanes are visible and there's voice line redo history, redo voice lines first
    if (showVoiceLanes && canRedoVoiceLines()) {
      voiceLineRedo();
      return;
    }
    // Otherwise redo chords
    const nextState = redo();
    if (nextState) {
      setChords(nextState);
      setSelectedChordIds([]);
    }
  }, [redo, showVoiceLanes, canRedoVoiceLines, voiceLineRedo]);

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

  const handleSave = useCallback(() => {
    if (chords.length > 0) {
      setShowSaveDialog(true);
    }
  }, [chords.length]);

  // Helper to convert scale degree to root note for API communication
  const scaleDegreeToRoot = useCallback((scaleDegree: number, key: string): string => {
    const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const keyToSemitone: Record<string, number> = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
      'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };
    const keySemitone = keyToSemitone[key] ?? 0;
    const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11];
    const noteIndex = (keySemitone + majorScaleIntervals[scaleDegree - 1]) % 12;
    return chromaticScale[noteIndex];
  }, []);

  // Handle Build From Bones - calls backend API for AI-generated step explanations
  const handleBuildFromBones = useCallback(async () => {
    if (chords.length === 0) {
      setBuildFromBonesError('No chords to deconstruct. Add some chords first.');
      return;
    }

    // Set loading state and open panel to show spinner
    setBuildFromBonesLoading(true);
    openBuildFromBonesPanel([]);

    try {
      // Convert chords to API format (SimpleChord)
      const simpleChords = chords.map(c => ({
        root: scaleDegreeToRoot(c.scaleDegree, c.key),
        quality: c.quality,
        extensions: c.extensions ? { ...c.extensions } as Record<string, boolean> : undefined,
      }));

      // Get song context from analysis metadata if available
      const songTitle = metadata?.title;
      const composer = metadata?.composer;

      // Call the backend API
      const response = await deconstructProgression(
        simpleChords,
        currentKey,
        currentMode,
        songTitle,
        composer
      );

      if (!response.success || !response.steps) {
        throw new Error(response.error || 'Deconstruction failed');
      }

      // Convert API response steps to include full chord data with IDs
      const stepsWithFullChords = response.steps.map(step => ({
        ...step,
        chords: step.chords.map((simpleChord, idx) => {
          // Match with original chord to preserve IDs and other data
          const originalChord = chords[idx];
          return {
            ...originalChord,
            quality: simpleChord.quality as ChordQuality,
            extensions: (simpleChord.extensions || {}) as ChordExtensions,
          };
        }),
      }));

      openBuildFromBonesPanel(stepsWithFullChords);
    } catch (error) {
      console.error('Build From Bones error:', error);
      setBuildFromBonesError(
        error instanceof Error ? error.message : 'Failed to deconstruct progression'
      );
    } finally {
      setBuildFromBonesLoading(false);
    }
  }, [chords, currentKey, currentMode, metadata, scaleDegreeToRoot, openBuildFromBonesPanel, setBuildFromBonesLoading, setBuildFromBonesError]);

  const chordsWithPlayState = useMemo(() => {
    return chords.map(chord => ({
      ...chord,
      playing: isPlaying && playheadPosition >= chord.startBeat && playheadPosition < chord.startBeat + chord.duration,
    }));
  }, [chords, isPlaying, playheadPosition]);

  // Create current progression for saving
  const currentProgression = useMemo((): SavedProgression => {
    // Map beats per measure to time signature
    const timeSignatureMap: Record<number, SavedProgression['timeSignature']> = {
      2: '2/2',
      3: '3/4',
      4: '4/4',
      6: '6/8',
    };
    const timeSignature = timeSignatureMap[beatsPerMeasure] || '4/4';

    return {
      id: uuidv4(),
      title: pieceTitle || 'Untitled',
      key: currentKey,
      mode: currentMode,
      tempo,
      timeSignature,
      chords,
      tags: [],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analyzedFrom: metadata ? {
        source: 'youtube' as const,
        title: metadata.title,
        url: metadata.sourceUrl,
      } : undefined,
    };
  }, [currentKey, currentMode, tempo, beatsPerMeasure, chords, metadata, pieceTitle]);

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

  // Update chord voices - for manual voice line editing
  const handleUpdateChordVoices = useCallback((chordId: string, voices: Voices) => {
    setChords((prevChords) =>
      prevChords.map((chord) =>
        chord.id === chordId ? { ...chord, voices } : chord
      )
    );
  }, []);

  // Update chord properties (quality, extensions, etc.)
  // Regenerates voices when quality or extensions change to update audio
  const handleUpdateChord = useCallback((chordId: string, updates: Partial<Chord>) => {
    setChords((prevChords) => {
      // Check if we need to regenerate voices (quality or extensions changed)
      const needsVoiceRegeneration = 'quality' in updates || 'extensions' in updates;

      // Find the chord index and get previous chord for voice leading
      const chordIndex = prevChords.findIndex(c => c.id === chordId);
      if (chordIndex === -1) return prevChords;

      // Sort by startBeat to find the actual previous chord
      const sortedChords = [...prevChords].sort((a, b) => a.startBeat - b.startBeat);
      const sortedIndex = sortedChords.findIndex(c => c.id === chordId);
      const previousChord = sortedIndex > 0 ? sortedChords[sortedIndex - 1] : undefined;

      return prevChords.map((chord) => {
        if (chord.id !== chordId) return chord;

        const updatedChord = { ...chord, ...updates };

        // Regenerate voices if quality or extensions changed
        if (needsVoiceRegeneration) {
          updatedChord.voices = generateSATBVoicing(updatedChord, previousChord?.voices);
        }

        return updatedChord;
      });
    });
  }, []);

  // Handle new piece - reset canvas and state
  const handleNewPiece = useCallback(() => {
    if (chords.length > 0) {
      showConfirmation({
        title: 'Start New Piece',
        message: 'Any unsaved changes will be lost. Continue?',
        confirmLabel: 'Start New',
        onConfirm: () => {
          setChords([]);
          setSelectedChordIds([]);
          setCurrentKey('C');
          setCurrentMode('major');
          setBeatsPerMeasure(4);
          setShowVoiceLanes(false);
          setPieceTitle('Untitled');
          clearAnalyzedProgression();
          useVoiceLineStore.getState().initializeFromChords([]);
        },
      });
    } else {
      setPieceTitle('Untitled');
    }
  }, [chords.length, clearAnalyzedProgression]);

  // Handle back to dashboard - check for unsaved changes
  const handleBackToDashboard = useCallback(() => {
    if (chords.length > 0) {
      showDestructiveConfirm(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.',
        () => {
          // Clear state and navigate
          setChords([]);
          setSelectedChordIds([]);
          navigateToDashboard();
        },
        () => {
          // Cancel - do nothing
        }
      );
    } else {
      navigateToDashboard();
    }
  }, [chords.length, navigateToDashboard]);

  // Early return for dashboard view
  if (currentView === 'dashboard') {
    return (
      <>
        <Dashboard />
        {/* Keep modals available */}
        <Suspense fallback={null}>
          <SettingsModal
            isOpen={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            onExportMusicXML={handleExportMusicXML}
            canExport={chords.length > 0}
          />
          <SaveProgressionDialog
            progression={currentProgression}
            isOpen={showSaveDialog}
            onClose={() => setShowSaveDialog(false)}
            onSave={saveProgression}
          />
          <MyProgressionsModal />
          <AnalyzeModal />
        </Suspense>
        <WelcomeTutorial />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
        <ToastContainer />
        <ConfirmationDialog />
      </>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <button
            className="back-to-dashboard"
            onClick={handleBackToDashboard}
            title="Back to Dashboard"
          >
            ←
          </button>
          <h1>NEUME</h1>
        </div>
        <input
          type="text"
          className="piece-title-input"
          value={pieceTitle}
          onChange={(e) => setPieceTitle(e.target.value)}
          placeholder="Untitled"
          aria-label="Piece title"
        />
        <div className="header-right">
          <button
            className="library-button"
            onClick={() => openProgressionsModal()}
            aria-label="My Library"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </button>
          <button
            className="new-piece-button"
            onClick={handleNewPiece}
            aria-label="New piece"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </button>
          <button
            className="save-button"
            onClick={() => setShowSaveDialog(true)}
            disabled={chords.length === 0}
            aria-label="Save progression"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          </button>
          <button
            className="settings-button"
            onClick={() => setShowSettingsModal(true)}
            aria-label="Settings"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
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

        {/* Voice Lines */}
        <SidebarSection>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => {
                const newShowState = !showVoiceLanes;
                if (newShowState && chords.length > 0) {
                  initializeVoiceLines(chords);
                }
                setShowVoiceLanes(newShowState);
              }}
              className="action-button analyze-button"
              style={{
                background: showVoiceLanes ? 'var(--warm-gold)' : 'transparent',
                color: showVoiceLanes ? 'white' : 'var(--warm-text-primary)',
                borderColor: 'var(--warm-gold)',
                flex: 1,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 4h12M2 8h12M2 12h12" />
                <circle cx="5" cy="4" r="1.5" fill="currentColor" />
                <circle cx="10" cy="8" r="1.5" fill="currentColor" />
                <circle cx="7" cy="12" r="1.5" fill="currentColor" />
              </svg>
              <span>Voice Lines</span>
            </button>
          </div>

          <VoicingModeToggle
            value={voicingMode}
            onChange={setVoicingMode}
          />

          {showVoiceLanes && <VoiceToggleBar />}
          {showVoiceLanes && (
            <button
              onClick={() => openCompositionToolsPanel('lyrics')}
              className="action-button"
              style={{
                marginTop: '8px',
                background: 'transparent',
                color: 'var(--warm-text-primary)',
                borderColor: 'var(--warm-sage)',
                width: '100%',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18" />
                <rect x="4" y="6" width="16" height="12" rx="2" />
                <path d="M8 10h8" />
                <path d="M8 14h5" />
              </svg>
              <span>Lyrics</span>
            </button>
          )}
        </SidebarSection>

        <SidebarDivider />

        {/* Analysis */}
        <SidebarSection>
          <button
            onClick={handleAnalyzeCounterpoint}
            disabled={chords.length < 2}
            className="action-button analyze-button"
            style={{
              background: counterpointViolations.length > 0 ? 'var(--warm-terracotta)' : 'transparent',
              color: counterpointViolations.length > 0 ? 'white' : 'var(--warm-text-primary)',
              borderColor: 'var(--warm-terracotta)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 1v14M1 8h14" />
              <circle cx="4" cy="4" r="1.5" fill="currentColor" />
              <circle cx="12" cy="4" r="1.5" fill="currentColor" />
              <circle cx="4" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
            <span>Check Rules{counterpointViolations.length > 0 ? ` (${counterpointViolations.length})` : ''}</span>
          </button>
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

        {/* Sound Type Toggle */}
        <SidebarSection>
          <SoundToggle
            value={soundType}
            onChange={setSoundType}
          />
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
        showVoiceLanes={showVoiceLanes}
        onUpdateChordPosition={handleUpdateChordPosition}
        onUpdateChord={handleUpdateChord}
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
        onSave={handleSave}
        onAnalyze={openAnalyzeModal}
        onRefine={() => {
          if (selectedChordIds.length > 0) {
            openRefineModal(selectedChordIds);
          }
        }}
        onBuildFromBones={handleBuildFromBones}
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
        <NarrativeComposerModal />
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          onExportMusicXML={handleExportMusicXML}
          canExport={chords.length > 0}
        />
      </Suspense>

      <WhyThisPanel />
      <BuildFromBonesPanel />
      <CompositionToolsPanel
        chords={chords}
        onUpdateChordVoices={handleUpdateChordVoices}
      />

      <WelcomeTutorial />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <AudioLoadingIndicator />

      <Suspense fallback={null}>
        <SaveProgressionDialog
          progression={currentProgression}
          isOpen={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          onSave={saveProgression}
        />
      </Suspense>

      <ToastContainer />
      <ConfirmationDialog />
    </div>
  );
}

export default App;
