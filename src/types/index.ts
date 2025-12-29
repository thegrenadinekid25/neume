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
  SoundType,
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
  VoicePart8,
  AnyVoicePart,
  VoiceCount,
  VoiceNecklaceConfig,
  NecklaceSettings,
} from './necklace';

export {
  VOICE_COLORS,
  VOICE_COLORS_8,
  VOICE_PART_BASE,
  VOICE_PART_LABELS,
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
  VoiceLines4,
  VoiceLines8,
  CompositionModeType,
  CompositionMode,
  NoteValue,
  SnapResolution,
} from './voice-line';

export {
  DEFAULT_MELODIC_NOTE_VISUAL_STATE,
  DEFAULT_COMPOSITION_MODE,
  NOTE_VALUE_TO_BEATS,
} from './voice-line';

export type {
  CounterpointViolationType,
  CounterpointSeverity,
  CounterpointStyle,
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
  COUNTERPOINT_STYLE_PRESETS,
} from './counterpoint';

export type {
  Syllable,
  SyllableParseResult,
  SyllableAssignment,
  TextSettingMode,
  VoiceTextSetting,
  MelismaMarker,
} from './text-setting';

export {
  DEFAULT_TEXT_SETTING,
} from './text-setting';

export type {
  VoicingMode,
  VoicingStyle,
  VoiceCount as VoicingVoiceCount,
} from './voicing';

export type {
  Snapshot,
  SnapshotInput,
  SnapshotChord,
  SnapshotSource,
} from './snapshot';
