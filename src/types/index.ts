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
