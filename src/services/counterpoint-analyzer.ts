import { v4 as uuidv4 } from 'uuid';
import type { VoicePart, MelodicNote, VoiceLine } from '@/types/voice-line';
import type {
  CounterpointViolation,
  CounterpointAnalysisResult,
  CounterpointAnalyzerConfig,
  CounterpointSummary,
  CounterpointSeverity,
  BeatSnapshot,
  RangeViolationSubtype,
} from '@/types/counterpoint';
import { DEFAULT_COUNTERPOINT_CONFIG } from '@/types/counterpoint';
import { VOICE_RANGES, VOICE_ORDER } from '@/data/voice-ranges';

// ============================================================================
// Constants
// ============================================================================

const PERFECT_FIFTH = 7;
const PERFECT_FOURTH = 5;
const PERFECT_OCTAVE = 0;

const ADJACENT_VOICE_PAIRS: [VoicePart, VoicePart][] = [
  ['soprano', 'alto'],
  ['alto', 'tenor'],
  ['tenor', 'bass'],
];

const ALL_VOICE_PAIRS: [VoicePart, VoicePart][] = [
  ['soprano', 'alto'],
  ['soprano', 'tenor'],
  ['soprano', 'bass'],
  ['alto', 'tenor'],
  ['alto', 'bass'],
  ['tenor', 'bass'],
];

// ============================================================================
// Interval Analysis Helpers
// ============================================================================

function isPerfectFifth(interval: number): boolean {
  const normalized = Math.abs(interval) % 12;
  return normalized === PERFECT_FIFTH || normalized === PERFECT_FOURTH;
}

function isPerfectOctaveOrUnison(interval: number): boolean {
  return Math.abs(interval) % 12 === PERFECT_OCTAVE;
}

function getMotionDirection(fromMidi: number, toMidi: number): 'up' | 'down' | 'static' {
  if (toMidi > fromMidi) return 'up';
  if (toMidi < fromMidi) return 'down';
  return 'static';
}

function isSimilarMotion(
  voice1From: number,
  voice1To: number,
  voice2From: number,
  voice2To: number
): boolean {
  const motion1 = getMotionDirection(voice1From, voice1To);
  const motion2 = getMotionDirection(voice2From, voice2To);
  return motion1 === motion2 && motion1 !== 'static';
}

// ============================================================================
// Beat Snapshot Helpers
// ============================================================================

function collectBeatPositions(voiceLines: Record<VoicePart, VoiceLine>): number[] {
  const beats = new Set<number>();

  for (const part of VOICE_ORDER) {
    const voiceLine = voiceLines[part];
    if (!voiceLine?.enabled) continue;

    for (const note of voiceLine.notes) {
      beats.add(note.startBeat);
      beats.add(note.startBeat + note.duration);
    }
  }

  return Array.from(beats).sort((a, b) => a - b);
}

function findNoteAtBeat(notes: MelodicNote[], beat: number): MelodicNote | null {
  for (const note of notes) {
    if (beat >= note.startBeat && beat < note.startBeat + note.duration) {
      return note;
    }
  }
  return null;
}

function buildBeatSnapshots(voiceLines: Record<VoicePart, VoiceLine>): BeatSnapshot[] {
  const beats = collectBeatPositions(voiceLines);
  const snapshots: BeatSnapshot[] = [];

  for (const beat of beats) {
    const snapshot: BeatSnapshot = {
      beat,
      notes: {},
    };

    for (const part of VOICE_ORDER) {
      const voiceLine = voiceLines[part];
      if (!voiceLine?.enabled) continue;

      const note = findNoteAtBeat(voiceLine.notes, beat);
      if (note) {
        snapshot.notes[part] = {
          noteId: note.id,
          midi: note.midi,
          pitch: note.pitch,
        };
      }
    }

    snapshots.push(snapshot);
  }

  return snapshots;
}

// ============================================================================
// Violation Creation Helper
// ============================================================================

function createViolation(
  type: CounterpointViolation['type'],
  severity: CounterpointSeverity,
  description: string,
  location: CounterpointViolation['location'],
  options?: Partial<CounterpointViolation>
): CounterpointViolation {
  return {
    id: uuidv4(),
    type,
    severity,
    description,
    location,
    ...options,
  };
}

// ============================================================================
// Detection Functions
// ============================================================================

function detectParallelFifths(
  prevSnapshot: BeatSnapshot,
  currSnapshot: BeatSnapshot,
  config: CounterpointAnalyzerConfig
): CounterpointViolation[] {
  if (!config.checkParallelFifths) return [];

  const violations: CounterpointViolation[] = [];

  for (const [voice1, voice2] of ALL_VOICE_PAIRS) {
    const prev1 = prevSnapshot.notes[voice1];
    const prev2 = prevSnapshot.notes[voice2];
    const curr1 = currSnapshot.notes[voice1];
    const curr2 = currSnapshot.notes[voice2];

    if (!prev1 || !prev2 || !curr1 || !curr2) continue;

    const prevInterval = prev1.midi - prev2.midi;
    const currInterval = curr1.midi - curr2.midi;

    if (
      isPerfectFifth(prevInterval) &&
      isPerfectFifth(currInterval) &&
      isSimilarMotion(prev1.midi, curr1.midi, prev2.midi, curr2.midi)
    ) {
      violations.push(createViolation(
        'parallelFifths',
        'error',
        `Parallel fifths between ${voice1} and ${voice2}`,
        {
          beat: currSnapshot.beat,
          noteIds: [curr1.noteId, curr2.noteId],
        },
        {
          voicePair: [voice1, voice2],
          interval: Math.abs(currInterval),
          suggestion: `Move ${voice2} in contrary or oblique motion to ${voice1}`,
        }
      ));
    }
  }

  return violations;
}

function detectParallelOctaves(
  prevSnapshot: BeatSnapshot,
  currSnapshot: BeatSnapshot,
  config: CounterpointAnalyzerConfig
): CounterpointViolation[] {
  if (!config.checkParallelOctaves) return [];

  const violations: CounterpointViolation[] = [];

  for (const [voice1, voice2] of ALL_VOICE_PAIRS) {
    const prev1 = prevSnapshot.notes[voice1];
    const prev2 = prevSnapshot.notes[voice2];
    const curr1 = currSnapshot.notes[voice1];
    const curr2 = currSnapshot.notes[voice2];

    if (!prev1 || !prev2 || !curr1 || !curr2) continue;

    const prevInterval = prev1.midi - prev2.midi;
    const currInterval = curr1.midi - curr2.midi;

    if (
      isPerfectOctaveOrUnison(prevInterval) &&
      isPerfectOctaveOrUnison(currInterval) &&
      isSimilarMotion(prev1.midi, curr1.midi, prev2.midi, curr2.midi)
    ) {
      violations.push(createViolation(
        'parallelOctaves',
        'error',
        `Parallel octaves between ${voice1} and ${voice2}`,
        {
          beat: currSnapshot.beat,
          noteIds: [curr1.noteId, curr2.noteId],
        },
        {
          voicePair: [voice1, voice2],
          interval: Math.abs(currInterval),
          suggestion: `Move ${voice2} in contrary or oblique motion to ${voice1}`,
        }
      ));
    }
  }

  return violations;
}

function detectHiddenFifths(
  prevSnapshot: BeatSnapshot,
  currSnapshot: BeatSnapshot,
  config: CounterpointAnalyzerConfig
): CounterpointViolation[] {
  if (!config.checkHiddenFifths) return [];

  const violations: CounterpointViolation[] = [];
  const severity: CounterpointSeverity = config.strictness === 'strict' ? 'error' : 'warning';

  for (const [voice1, voice2] of ALL_VOICE_PAIRS) {
    const prev1 = prevSnapshot.notes[voice1];
    const prev2 = prevSnapshot.notes[voice2];
    const curr1 = currSnapshot.notes[voice1];
    const curr2 = currSnapshot.notes[voice2];

    if (!prev1 || !prev2 || !curr1 || !curr2) continue;

    const prevInterval = prev1.midi - prev2.midi;
    const currInterval = curr1.midi - curr2.midi;

    if (
      !isPerfectFifth(prevInterval) &&
      isPerfectFifth(currInterval) &&
      isSimilarMotion(prev1.midi, curr1.midi, prev2.midi, curr2.midi)
    ) {
      const isOuterVoices = voice1 === 'soprano' && voice2 === 'bass';
      const actualSeverity = isOuterVoices ? severity : 'info';

      violations.push(createViolation(
        'hiddenFifths',
        actualSeverity,
        `Hidden fifth between ${voice1} and ${voice2}${isOuterVoices ? ' (outer voices)' : ''}`,
        {
          beat: currSnapshot.beat,
          noteIds: [curr1.noteId, curr2.noteId],
        },
        {
          voicePair: [voice1, voice2],
          interval: Math.abs(currInterval),
          suggestion: `Approach the fifth with contrary motion or move soprano by step`,
        }
      ));
    }
  }

  return violations;
}

function detectHiddenOctaves(
  prevSnapshot: BeatSnapshot,
  currSnapshot: BeatSnapshot,
  config: CounterpointAnalyzerConfig
): CounterpointViolation[] {
  if (!config.checkHiddenOctaves) return [];

  const violations: CounterpointViolation[] = [];
  const severity: CounterpointSeverity = config.strictness === 'strict' ? 'error' : 'warning';

  for (const [voice1, voice2] of ALL_VOICE_PAIRS) {
    const prev1 = prevSnapshot.notes[voice1];
    const prev2 = prevSnapshot.notes[voice2];
    const curr1 = currSnapshot.notes[voice1];
    const curr2 = currSnapshot.notes[voice2];

    if (!prev1 || !prev2 || !curr1 || !curr2) continue;

    const prevInterval = prev1.midi - prev2.midi;
    const currInterval = curr1.midi - curr2.midi;

    if (
      !isPerfectOctaveOrUnison(prevInterval) &&
      isPerfectOctaveOrUnison(currInterval) &&
      isSimilarMotion(prev1.midi, curr1.midi, prev2.midi, curr2.midi)
    ) {
      const isOuterVoices = voice1 === 'soprano' && voice2 === 'bass';
      const actualSeverity = isOuterVoices ? severity : 'info';

      violations.push(createViolation(
        'hiddenOctaves',
        actualSeverity,
        `Hidden octave between ${voice1} and ${voice2}${isOuterVoices ? ' (outer voices)' : ''}`,
        {
          beat: currSnapshot.beat,
          noteIds: [curr1.noteId, curr2.noteId],
        },
        {
          voicePair: [voice1, voice2],
          interval: Math.abs(currInterval),
          suggestion: `Approach the octave with contrary motion or move soprano by step`,
        }
      ));
    }
  }

  return violations;
}

function detectVoiceCrossing(
  snapshot: BeatSnapshot,
  config: CounterpointAnalyzerConfig
): CounterpointViolation[] {
  if (!config.checkVoiceCrossing) return [];

  const violations: CounterpointViolation[] = [];

  for (const [upperVoice, lowerVoice] of ADJACENT_VOICE_PAIRS) {
    const upper = snapshot.notes[upperVoice];
    const lower = snapshot.notes[lowerVoice];

    if (!upper || !lower) continue;

    if (lower.midi > upper.midi) {
      violations.push(createViolation(
        'voiceCrossing',
        'warning',
        `${lowerVoice} crosses above ${upperVoice}`,
        {
          beat: snapshot.beat,
          noteIds: [upper.noteId, lower.noteId],
        },
        {
          voicePair: [upperVoice, lowerVoice],
          suggestion: `Move ${lowerVoice} below ${upper.pitch} or ${upperVoice} above ${lower.pitch}`,
        }
      ));
    }
  }

  return violations;
}

function detectVoiceOverlap(
  prevSnapshot: BeatSnapshot,
  currSnapshot: BeatSnapshot,
  config: CounterpointAnalyzerConfig
): CounterpointViolation[] {
  if (!config.checkVoiceOverlap) return [];

  const violations: CounterpointViolation[] = [];

  for (const [upperVoice, lowerVoice] of ADJACENT_VOICE_PAIRS) {
    const prevUpper = prevSnapshot.notes[upperVoice];
    const prevLower = prevSnapshot.notes[lowerVoice];
    const currUpper = currSnapshot.notes[upperVoice];
    const currLower = currSnapshot.notes[lowerVoice];

    if (prevUpper && currLower && currLower.midi > prevUpper.midi) {
      violations.push(createViolation(
        'voiceOverlap',
        'info',
        `${lowerVoice} overlaps above ${upperVoice}'s previous note`,
        {
          beat: currSnapshot.beat,
          noteIds: [currLower.noteId],
        },
        {
          voicePair: [upperVoice, lowerVoice],
          suggestion: `Keep ${lowerVoice} below ${prevUpper.pitch}`,
        }
      ));
    }

    if (prevLower && currUpper && currUpper.midi < prevLower.midi) {
      violations.push(createViolation(
        'voiceOverlap',
        'info',
        `${upperVoice} overlaps below ${lowerVoice}'s previous note`,
        {
          beat: currSnapshot.beat,
          noteIds: [currUpper.noteId],
        },
        {
          voicePair: [upperVoice, lowerVoice],
          suggestion: `Keep ${upperVoice} above ${prevLower.pitch}`,
        }
      ));
    }
  }

  return violations;
}

function detectSpacingViolations(
  snapshot: BeatSnapshot,
  config: CounterpointAnalyzerConfig
): CounterpointViolation[] {
  if (!config.checkSpacing) return [];

  const violations: CounterpointViolation[] = [];

  const soprano = snapshot.notes.soprano;
  const alto = snapshot.notes.alto;
  if (soprano && alto) {
    const spacing = soprano.midi - alto.midi;
    if (spacing > config.maxSopranoAltoSpacing) {
      violations.push(createViolation(
        'spacingViolation',
        'warning',
        `Soprano-alto spacing too wide (${spacing} semitones)`,
        {
          beat: snapshot.beat,
          noteIds: [soprano.noteId, alto.noteId],
        },
        {
          voicePair: ['soprano', 'alto'],
          interval: spacing,
          suggestion: `Keep soprano and alto within an octave (12 semitones)`,
        }
      ));
    }
  }

  const tenor = snapshot.notes.tenor;
  if (alto && tenor) {
    const spacing = alto.midi - tenor.midi;
    if (spacing > config.maxAltoTenorSpacing) {
      violations.push(createViolation(
        'spacingViolation',
        'warning',
        `Alto-tenor spacing too wide (${spacing} semitones)`,
        {
          beat: snapshot.beat,
          noteIds: [alto.noteId, tenor.noteId],
        },
        {
          voicePair: ['alto', 'tenor'],
          interval: spacing,
          suggestion: `Keep alto and tenor within an octave (12 semitones)`,
        }
      ));
    }
  }

  return violations;
}

function detectRangeViolations(
  voiceLines: Record<VoicePart, VoiceLine>,
  config: CounterpointAnalyzerConfig
): CounterpointViolation[] {
  if (!config.checkRange) return [];

  const violations: CounterpointViolation[] = [];

  for (const part of VOICE_ORDER) {
    const voiceLine = voiceLines[part];
    if (!voiceLine?.enabled) continue;

    const range = VOICE_RANGES[part];

    for (const note of voiceLine.notes) {
      let subtype: RangeViolationSubtype | undefined;
      let severity: CounterpointSeverity = 'info';
      let description = '';

      if (note.midi < range.lowMidi) {
        subtype = 'belowAbsolute';
        severity = 'error';
        description = `${part} note ${note.pitch} below absolute range (${range.low})`;
      } else if (note.midi > range.highMidi) {
        subtype = 'aboveAbsolute';
        severity = 'error';
        description = `${part} note ${note.pitch} above absolute range (${range.high})`;
      } else if (config.warnOnExtendedRange) {
        if (note.midi < range.comfortableLowMidi) {
          subtype = 'belowComfortable';
          severity = 'warning';
          description = `${part} note ${note.pitch} below comfortable range (${range.comfortableLow})`;
        } else if (note.midi > range.comfortableHighMidi) {
          subtype = 'aboveComfortable';
          severity = 'warning';
          description = `${part} note ${note.pitch} above comfortable range (${range.comfortableHigh})`;
        }
      }

      if (subtype) {
        violations.push(createViolation(
          'rangeViolation',
          severity,
          description,
          {
            beat: note.startBeat,
            noteIds: [note.id],
          },
          {
            voice: part,
            rangeSubtype: subtype,
            suggestion: `Move note to within ${part}'s range (${range.comfortableLow}-${range.comfortableHigh})`,
          }
        ));
      }
    }
  }

  return violations;
}

// ============================================================================
// Summary Generation
// ============================================================================

function generateSummary(
  violations: CounterpointViolation[]
): CounterpointSummary {
  const bySeverity = {
    error: 0,
    warning: 0,
    info: 0,
  };

  const byType: Partial<Record<CounterpointViolation['type'], number>> = {};

  for (const violation of violations) {
    bySeverity[violation.severity]++;
    byType[violation.type] = (byType[violation.type] || 0) + 1;
  }

  const score = Math.max(
    0,
    100 - (bySeverity.error * 20) - (bySeverity.warning * 5) - (bySeverity.info * 1)
  );

  return {
    totalViolations: violations.length,
    bySeverity,
    byType,
    isValid: bySeverity.error === 0,
    score,
  };
}

// ============================================================================
// Main Analysis Functions
// ============================================================================

/**
 * Analyze counterpoint in voice lines
 */
export function analyzeCounterpoint(
  voiceLines: Record<VoicePart, VoiceLine>,
  config: Partial<CounterpointAnalyzerConfig> = {}
): CounterpointAnalysisResult {
  const fullConfig: CounterpointAnalyzerConfig = {
    ...DEFAULT_COUNTERPOINT_CONFIG,
    ...config,
  };

  const violations: CounterpointViolation[] = [];
  const snapshots = buildBeatSnapshots(voiceLines);

  // Instantaneous violations
  for (const snapshot of snapshots) {
    violations.push(...detectVoiceCrossing(snapshot, fullConfig));
    violations.push(...detectSpacingViolations(snapshot, fullConfig));
  }

  // Motion-based violations
  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1];
    const curr = snapshots[i];

    violations.push(...detectParallelFifths(prev, curr, fullConfig));
    violations.push(...detectParallelOctaves(prev, curr, fullConfig));
    violations.push(...detectHiddenFifths(prev, curr, fullConfig));
    violations.push(...detectHiddenOctaves(prev, curr, fullConfig));
    violations.push(...detectVoiceOverlap(prev, curr, fullConfig));
  }

  // Range violations
  violations.push(...detectRangeViolations(voiceLines, fullConfig));

  violations.sort((a, b) => a.location.beat - b.location.beat);

  return {
    violations,
    summary: generateSummary(violations),
    analyzedAt: new Date().toISOString(),
    config: fullConfig,
  };
}

/**
 * Analyze counterpoint for a specific beat range
 */
export function analyzeCounterpointRange(
  voiceLines: Record<VoicePart, VoiceLine>,
  startBeat: number,
  endBeat: number,
  config: Partial<CounterpointAnalyzerConfig> = {}
): CounterpointAnalysisResult {
  const filteredLines: Record<VoicePart, VoiceLine> = {} as Record<VoicePart, VoiceLine>;

  for (const part of VOICE_ORDER) {
    const original = voiceLines[part];
    if (!original) continue;

    filteredLines[part] = {
      ...original,
      notes: original.notes.filter(note =>
        note.startBeat >= startBeat && note.startBeat < endBeat
      ),
    };
  }

  return analyzeCounterpoint(filteredLines, config);
}

/**
 * Quick check for counterpoint errors
 */
export function hasCounterpointErrors(
  voiceLines: Record<VoicePart, VoiceLine>,
  config: Partial<CounterpointAnalyzerConfig> = {}
): boolean {
  const result = analyzeCounterpoint(voiceLines, config);
  return !result.summary.isValid;
}

/**
 * Get violations for a specific note
 */
export function getViolationsForNote(
  violations: CounterpointViolation[],
  noteId: string
): CounterpointViolation[] {
  return violations.filter(v => v.location.noteIds.includes(noteId));
}

/**
 * Get the most severe violation from a list
 */
export function getMostSevereViolation(
  violations: CounterpointViolation[]
): CounterpointViolation | null {
  if (violations.length === 0) return null;

  const severityOrder: CounterpointSeverity[] = ['error', 'warning', 'info'];

  for (const severity of severityOrder) {
    const found = violations.find(v => v.severity === severity);
    if (found) return found;
  }

  return violations[0];
}
