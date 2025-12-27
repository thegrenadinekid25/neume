/**
 * Central export for all types
 */

export type {
  Chord,
  ChordInput,
  ChordQuality,
  ScaleDegree,
  MusicalKey,
  Mode,
  ChordExtensions,
  ChromaticType,
  Voices,
  Position,
  ChordSource,
  ChordAnnotationType,
  ChordAnnotation,
} from './chord';

export type {
  Progression,
  ProgressionInput,
  TimeSignature,
  AnalysisSource,
  AnalyzedFrom,
  BuildUpStep,
  BuildUp,
  SavedProgression,
  ProgressionAnnotationType,
  ProgressionAnnotation,
} from './progression';

export type {
  AISuggestion,
  SuggestionTechnique,
  SuggestionDifficulty,
  ProposedChange,
  ChordExplanation,
} from './ai';

export type {
  AudioEngineState,
  VoiceRange,
  SATBRanges,
  AudioSettings,
  PlaybackState,
} from './audio';

export type {
  ModalType,
  PanelType,
  ToastType,
  Toast,
  ContextMenuItem,
  UserSettings,
} from './ui';

export type {
  UploadType,
  AnalysisInput,
  AnalysisStage,
  AnalysisProgress,
  AnalysisError,
  AnalysisResult,
  AnalyzedChord,
} from './analysis';

export type {
  VoicePart,
  VoiceNecklaceConfig,
  NecklaceSettings,
} from './necklace';

export {
  VOICE_COLORS,
  DEFAULT_NECKLACE_SETTINGS,
} from './necklace';

export type {
  StyleReference,
  NarrativePhase,
  GeneratedChordData,
  NarrativeResult,
  ComposerOptions,
  NarrativeComposerError,
  NarrativeConversionResult,
} from './narrative';

export type {
  Accidental,
  NonChordToneType,
  MelodicNoteVisualState,
  MelodicNoteAnalysis,
  MelodicNote,
  VoiceLine,
  CompositionModeType,
  CompositionMode,
} from './voice-line';

export {
  DEFAULT_MELODIC_NOTE_VISUAL_STATE,
  DEFAULT_COMPOSITION_MODE,
} from './voice-line';

export type {
  CounterpointViolationType,
  CounterpointSeverity,
  RangeViolationSubtype,
  ViolationLocation,
  CounterpointViolation,
  CounterpointAnalyzerConfig,
  CounterpointSummary,
  CounterpointAnalysisResult,
  BeatSnapshot,
} from './counterpoint';

export {
  DEFAULT_COUNTERPOINT_CONFIG,
} from './counterpoint';
