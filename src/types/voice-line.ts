import type { VoicePart, VoicePart8, AnyVoicePart } from './necklace';

export type { VoicePart, VoicePart8, AnyVoicePart };

/**
 * Accidental modifiers for pitches
 * - 'sharp': One semitone up
 * - 'flat': One semitone down
 * - 'natural': No modification
 * - 'doubleSharp': Two semitones up
 * - 'doubleFlat': Two semitones down
 * - null: No accidental
 */
export type Accidental = 'sharp' | 'flat' | 'natural' | 'doubleSharp' | 'doubleFlat' | null;

/**
 * Types of non-chord tones (passing tones, neighbor tones, etc.)
 * Used for harmonic analysis and composition guidance
 */
export type NonChordToneType =
  | 'passing'      // Moves between two chord tones by step
  | 'neighbor'     // Returns to original pitch after stepping away
  | 'suspension'   // Held from previous harmony, resolves down
  | 'anticipation' // Previews upcoming chord tone
  | 'escape'       // Leaves by leap, returns by step
  | 'appoggiatura' // Stressed non-chord tone resolving by step
  | 'pedal'        // Held note while harmony changes
  | 'retardation'  // Like suspension but resolves up
  | null;

/**
 * Visual state tracking for individual melodic notes
 * Used for UI interactions (selection, dragging, playback highlighting)
 */
export interface MelodicNoteVisualState {
  /** Note is selected by the user */
  selected: boolean;
  /** Mouse is hovering over the note */
  hovered: boolean;
  /** Note is being dragged */
  dragging: boolean;
  /** Note is currently playing */
  playing: boolean;
  /** Note is highlighted by composition guidance */
  highlighted: boolean;
}

/**
 * Harmonic and melodic analysis data for a note
 * Provides context for composition guidance and voice leading rules
 */
export interface MelodicNoteAnalysis {
  /** Whether this note is part of the current chord */
  isChordTone: boolean;
  /** Type of non-chord tone (if applicable) */
  nonChordToneType: NonChordToneType;
  /** Scale degree (1-7, relative to key) */
  scaleDegree: number | null;
  /** Interval description relative to previous note */
  interval: string | null;
  /** Tendency tone direction: up/down/static resolution */
  tendency: 'up' | 'down' | 'static' | null;
}

/**
 * A single note in a voice line
 * Represents pitch, timing, analysis, and visual state
 */
export interface MelodicNote {
  /** Unique identifier for the note */
  id: string;
  /** Pitch class (e.g., 'C4', 'D#5', 'Bb3') */
  pitch: string;
  /** MIDI note number (0-127) */
  midi: number;
  /** Accidental modifier */
  accidental: Accidental;
  /** Whether this note is a rest (silence) */
  isRest: boolean;
  /** Beat position in the measure */
  startBeat: number;
  /** Duration in beats */
  duration: number;
  /** Harmonic and melodic analysis */
  analysis: MelodicNoteAnalysis;
  /** Optional annotation or label */
  text: string | null;
  /** Current visual state (selection, interaction, playback) */
  visualState: MelodicNoteVisualState;
}

/**
 * A complete voice line (melody) in the composition
 * Can represent 4-voice SATB or 8-voice SSAATTBB parts
 */
export interface VoiceLine<T extends AnyVoicePart = VoicePart> {
  /** Unique identifier for the voice line */
  id: string;
  /** Voice part assignment */
  voicePart: T;
  /** Array of melodic notes in the voice line */
  notes: MelodicNote[];
  /** Whether this voice line is actively used in composition */
  enabled: boolean;
  /** Whether audio playback is muted */
  muted: boolean;
  /** Whether this voice is soloing (others muted) */
  solo: boolean;
  /** Display color for the voice line */
  color: string;
  /** Opacity for the voice line display (0-1) */
  opacity: number;
  /** Whether the voice line details are collapsed in UI */
  collapsed: boolean;
}

/** Voice line record for 4-voice SATB */
export type VoiceLines4 = Record<VoicePart, VoiceLine<VoicePart>>;

/** Voice line record for 8-voice SSAATTBB */
export type VoiceLines8 = Record<VoicePart8, VoiceLine<VoicePart8>>;

/**
 * Composition mode types
 * Different approaches to composing the voice lines
 */
export type CompositionModeType = 'harmonic' | 'melodic' | 'counterpoint';

/**
 * Composition mode configuration
 * Controls behavior and guidance for the composition process
 */
export interface CompositionMode {
  /** Current composition approach */
  type: CompositionModeType;
  /** Show voice leading guide lines between notes */
  showVoiceLeadingGuides: boolean;
  /** Display non-chord tone type labels */
  showNonChordToneLabels: boolean;
  /** Snap notes to scale degrees */
  snapToScale: boolean;
  /** Snap notes to chord tones */
  snapToChord: boolean;
  /** Enforce voice range limits */
  enforceRanges: boolean;
  /** Highlight range violations visually */
  highlightRangeViolations: boolean;
  /** Prevent voices from crossing */
  preventVoiceCrossing: boolean;
}

/**
 * Default visual state for a new melodic note
 * All properties are false initially
 */
export const DEFAULT_MELODIC_NOTE_VISUAL_STATE: MelodicNoteVisualState = {
  selected: false,
  hovered: false,
  dragging: false,
  playing: false,
  highlighted: false,
};

/**
 * Default composition mode settings
 * Conservative approach with full guidance enabled
 */
export const DEFAULT_COMPOSITION_MODE: CompositionMode = {
  type: 'harmonic',
  showVoiceLeadingGuides: true,
  showNonChordToneLabels: true,
  snapToScale: true,
  snapToChord: false,
  enforceRanges: true,
  highlightRangeViolations: true,
  preventVoiceCrossing: true,
};

/**
 * Note value enum for UI selection
 * Represents standard musical note durations
 */
export type NoteValue = 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth' | 'thirtysecond';

/**
 * Mapping note values to beat fractions
 * Based on 4/4 time signature where quarter note = 1 beat
 */
export const NOTE_VALUE_TO_BEATS: Record<NoteValue, number> = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  sixteenth: 0.25,
  thirtysecond: 0.125,
};

/**
 * Snap resolution options for note placement
 * 1 = whole beat, 0.5 = half beat, 0.25 = quarter beat, etc.
 * 0 = no snapping (free positioning)
 */
export type SnapResolution = 1 | 0.5 | 0.25 | 0.125 | 0;
