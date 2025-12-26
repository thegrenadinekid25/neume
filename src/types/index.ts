/**
 * Central export for all types
 * Allows: import { Chord, Progression } from '@types'
 */

// Chord types
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
} from './chord';

// Progression types
export type {
  Progression,
  ProgressionInput,
  TimeSignature,
  AnalysisSource,
  AnalyzedFrom,
  BuildUpStep,
  BuildUp,
} from './progression';

// AI types
export type {
  AISuggestion,
  SuggestionTechnique,
  SuggestionDifficulty,
  ProposedChange,
  ChordExplanation,
  AnalysisResult,
} from './ai';

// Audio types
export type {
  AudioEngineState,
  VoiceRange,
  SATBRanges,
  AudioSettings,
  PlaybackState,
} from './audio';

// UI types
export type {
  ModalType,
  PanelType,
  ToastType,
  Toast,
  ContextMenuItem,
  UserSettings,
} from './ui';
