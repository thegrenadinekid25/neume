/**
 * Text Coaching Service
 *
 * Provides feedback and suggestions for improving text setting in choral compositions.
 * Analyzes syllable-to-note assignments and offers coaching based on best practices.
 */

import type { MelodicNote, VoiceLine } from '@/types/voice-line';
import type {
  SyllableAssignment,
  Syllable,
  TextSettingMode,
} from '@/types/text-setting';

// ============================================================================
// Types
// ============================================================================

export type TextCoachingCategory =
  | 'melisma'
  | 'syllable-stress'
  | 'word-painting'
  | 'breath-marks'
  | 'rhythm'
  | 'clarity';

export type TextCoachingSeverity = 'suggestion' | 'warning' | 'error';

export interface TextCoachingIssue {
  id: string;
  category: TextCoachingCategory;
  severity: TextCoachingSeverity;
  description: string;
  suggestion: string;
  noteIds: string[];
  syllableIndices?: number[];
}

export interface TextCoachingResult {
  issues: TextCoachingIssue[];
  summary: {
    totalIssues: number;
    byCategory: Partial<Record<TextCoachingCategory, number>>;
    bySeverity: Record<TextCoachingSeverity, number>;
  };
  score: number; // 0-100
}

// ============================================================================
// Constants
// ============================================================================

// Common stressed syllable patterns (simplified English stress rules)
const UNSTRESSED_SUFFIXES = [
  'ing', 'ed', 'es', 'er', 'est', 'ly', 'ness', 'ment', 'ful', 'less',
  'tion', 'sion', 'ous', 'ious', 'eous', 'al', 'ial', 'ical',
];

const STRESSED_WORDS = [
  'god', 'lord', 'king', 'praise', 'love', 'joy', 'peace', 'light',
  'life', 'hope', 'faith', 'grace', 'truth', 'glory', 'power',
];

// Melisma guidelines
const MAX_REASONABLE_MELISMA_LENGTH = 8; // notes per syllable
const MIN_MELISMA_FOR_WARNING = 4;

// ============================================================================
// Analysis Functions
// ============================================================================

let issueIdCounter = 0;

function createIssue(
  category: TextCoachingCategory,
  severity: TextCoachingSeverity,
  description: string,
  suggestion: string,
  noteIds: string[],
  syllableIndices?: number[]
): TextCoachingIssue {
  return {
    id: `coaching-${++issueIdCounter}`,
    category,
    severity,
    description,
    suggestion,
    noteIds,
    syllableIndices,
  };
}

/**
 * Check for overly long melismas
 */
function analyzeMelismas(
  assignments: SyllableAssignment[]
): TextCoachingIssue[] {
  const issues: TextCoachingIssue[] = [];

  // Group consecutive melisma notes
  let melismaStart = -1;
  let melismaText = '';
  const melismaNotes: string[] = [];

  for (let i = 0; i < assignments.length; i++) {
    const assignment = assignments[i];

    if (assignment.isMelisma) {
      if (melismaStart === -1) {
        melismaStart = i - 1; // Previous note was the syllable
        melismaText = assignment.text;
      }
      melismaNotes.push(assignment.noteId);
    } else {
      // End of melisma
      if (melismaNotes.length > 0) {
        const melismaLength = melismaNotes.length + 1;

        if (melismaLength > MAX_REASONABLE_MELISMA_LENGTH) {
          issues.push(createIssue(
            'melisma',
            'warning',
            `Long melisma on "${melismaText}" spans ${melismaLength} notes`,
            'Consider breaking this melisma into shorter phrases or adding more text',
            melismaNotes
          ));
        } else if (melismaLength >= MIN_MELISMA_FOR_WARNING) {
          issues.push(createIssue(
            'melisma',
            'suggestion',
            `Melisma on "${melismaText}" spans ${melismaLength} notes`,
            'This is a moderately long melisma - ensure it falls on a stressed or meaningful syllable',
            melismaNotes
          ));
        }

        melismaNotes.length = 0;
        melismaStart = -1;
      }
    }
  }

  return issues;
}

/**
 * Check syllable stress alignment with musical emphasis
 */
function analyzeSyllableStress(
  assignments: SyllableAssignment[],
  notes: MelodicNote[],
  syllables: Syllable[]
): TextCoachingIssue[] {
  const issues: TextCoachingIssue[] = [];

  for (let i = 0; i < assignments.length; i++) {
    const assignment = assignments[i];
    if (assignment.isMelisma || !assignment.text) continue;

    const note = notes.find((n) => n.id === assignment.noteId);
    if (!note) continue;

    const syllable = syllables[assignment.syllableIndex];
    if (!syllable) continue;

    // Check if this might be an unstressed syllable on a strong beat
    const isStrongBeat = note.startBeat % 1 === 0; // On the beat
    const isVeryStrongBeat = note.startBeat % 2 === 0; // Downbeat

    const lowerText = syllable.text.toLowerCase().replace(/[^a-z]/g, '');
    const isUnstressed = UNSTRESSED_SUFFIXES.some((suffix) =>
      lowerText.endsWith(suffix)
    );

    if (isUnstressed && isVeryStrongBeat) {
      issues.push(createIssue(
        'syllable-stress',
        'suggestion',
        `Unstressed syllable "${syllable.text}" falls on a strong beat`,
        'Consider adjusting rhythm so stressed syllables align with strong beats',
        [assignment.noteId],
        [assignment.syllableIndex]
      ));
    }

    // Check for important words on weak beats
    const wordLower = syllable.originalWord.toLowerCase();
    const isImportantWord = STRESSED_WORDS.some((w) => wordLower.includes(w));

    if (isImportantWord && syllable.isWordStart && !isStrongBeat) {
      issues.push(createIssue(
        'syllable-stress',
        'suggestion',
        `Important word "${syllable.originalWord}" begins on a weak beat`,
        'Consider placing important words on stronger beats for emphasis',
        [assignment.noteId],
        [assignment.syllableIndex]
      ));
    }
  }

  return issues;
}

/**
 * Check for potential breath mark locations
 */
function analyzeBreathMarks(
  assignments: SyllableAssignment[],
  notes: MelodicNote[],
  syllables: Syllable[]
): TextCoachingIssue[] {
  const issues: TextCoachingIssue[] = [];

  // Find phrase endings (word ends followed by gaps or long notes)
  let consecutiveNotes = 0;

  for (let i = 0; i < assignments.length; i++) {
    const assignment = assignments[i];
    const syllable = syllables[assignment.syllableIndex];
    const note = notes.find((n) => n.id === assignment.noteId);

    if (!note) continue;

    consecutiveNotes++;

    // Check for natural breath points (end of word, followed by rest or long note)
    if (syllable?.isWordEnd) {
      const nextNote = notes.find(
        (n) => n.startBeat > note.startBeat + note.duration
      );

      if (nextNote) {
        const gap = nextNote.startBeat - (note.startBeat + note.duration);

        // No gap and many consecutive notes - might need a breath
        if (gap < 0.5 && consecutiveNotes > 8) {
          issues.push(createIssue(
            'breath-marks',
            'suggestion',
            `Long phrase without clear breath point after "${syllable.originalWord}"`,
            'Consider adding a rest or shortening the previous note for a breath',
            [assignment.noteId]
          ));
          consecutiveNotes = 0;
        }
      }
    }

    // Reset counter on rests (gaps in notes)
    if (i < assignments.length - 1) {
      const nextAssignment = assignments[i + 1];
      const nextNote = notes.find((n) => n.id === nextAssignment.noteId);

      if (nextNote && nextNote.startBeat > note.startBeat + note.duration + 0.5) {
        consecutiveNotes = 0;
      }
    }
  }

  return issues;
}

/**
 * Check for text clarity issues
 */
function analyzeClarity(
  assignments: SyllableAssignment[],
  notes: MelodicNote[]
): TextCoachingIssue[] {
  const issues: TextCoachingIssue[] = [];

  // Check for very short notes with text
  for (const assignment of assignments) {
    if (assignment.isMelisma || !assignment.text) continue;

    const note = notes.find((n) => n.id === assignment.noteId);
    if (!note) continue;

    // Very fast text setting can be unclear
    if (note.duration < 0.25) { // Less than a 16th note
      issues.push(createIssue(
        'clarity',
        'warning',
        `Syllable "${assignment.text}" on very short note may be unclear`,
        'Consider lengthening this note or using a melisma to improve text clarity',
        [assignment.noteId]
      ));
    }
  }

  // Check for multiple syllables on same beat in quick succession
  const notesByBeat = new Map<number, SyllableAssignment[]>();

  for (const assignment of assignments) {
    const note = notes.find((n) => n.id === assignment.noteId);
    if (!note) continue;

    const beat = Math.floor(note.startBeat * 4) / 4; // Round to 16th
    if (!notesByBeat.has(beat)) {
      notesByBeat.set(beat, []);
    }
    notesByBeat.get(beat)!.push(assignment);
  }

  // (Further clarity checks could be added here)

  return issues;
}

/**
 * Analyze rhythm patterns for text setting
 */
function analyzeRhythm(
  assignments: SyllableAssignment[],
  mode: TextSettingMode
): TextCoachingIssue[] {
  const issues: TextCoachingIssue[] = [];

  // Check if mode matches actual setting
  let melismaCount = 0;
  let syllabicCount = 0;

  for (const assignment of assignments) {
    if (assignment.isMelisma) {
      melismaCount++;
    } else if (assignment.text) {
      syllabicCount++;
    }
  }

  const melismaRatio = melismaCount / (melismaCount + syllabicCount);

  if (mode === 'syllabic' && melismaRatio > 0.3) {
    issues.push(createIssue(
      'rhythm',
      'suggestion',
      'Mode is set to syllabic but contains significant melismatic passages',
      'Consider changing to melismatic mode or adding more text',
      []
    ));
  }

  if (mode === 'melismatic' && melismaRatio < 0.1) {
    issues.push(createIssue(
      'rhythm',
      'suggestion',
      'Mode is set to melismatic but text setting is mostly syllabic',
      'Consider changing to syllabic mode or extending syllables across more notes',
      []
    ));
  }

  return issues;
}

// ============================================================================
// Main Analysis Function
// ============================================================================

/**
 * Analyze text setting and provide coaching feedback
 */
export function analyzeTextSetting(
  voiceLine: VoiceLine,
  assignments: SyllableAssignment[],
  syllables: Syllable[],
  mode: TextSettingMode
): TextCoachingResult {
  issueIdCounter = 0;
  const issues: TextCoachingIssue[] = [];

  if (assignments.length === 0 || voiceLine.notes.length === 0) {
    return {
      issues: [],
      summary: {
        totalIssues: 0,
        byCategory: {},
        bySeverity: { suggestion: 0, warning: 0, error: 0 },
      },
      score: 100,
    };
  }

  // Run all analyses
  issues.push(...analyzeMelismas(assignments));
  issues.push(...analyzeSyllableStress(assignments, voiceLine.notes, syllables));
  issues.push(...analyzeBreathMarks(assignments, voiceLine.notes, syllables));
  issues.push(...analyzeClarity(assignments, voiceLine.notes));
  issues.push(...analyzeRhythm(assignments, mode));

  // Calculate summary
  const byCategory: Partial<Record<TextCoachingCategory, number>> = {};
  const bySeverity: Record<TextCoachingSeverity, number> = {
    suggestion: 0,
    warning: 0,
    error: 0,
  };

  for (const issue of issues) {
    byCategory[issue.category] = (byCategory[issue.category] || 0) + 1;
    bySeverity[issue.severity]++;
  }

  // Calculate score
  const score = Math.max(
    0,
    100 - (bySeverity.error * 15) - (bySeverity.warning * 5) - (bySeverity.suggestion * 1)
  );

  return {
    issues,
    summary: {
      totalIssues: issues.length,
      byCategory,
      bySeverity,
    },
    score,
  };
}

/**
 * Get coaching for a specific note
 */
export function getCoachingForNote(
  result: TextCoachingResult,
  noteId: string
): TextCoachingIssue[] {
  return result.issues.filter((issue) => issue.noteIds.includes(noteId));
}

/**
 * Get all issues of a specific category
 */
export function getIssuesByCategory(
  result: TextCoachingResult,
  category: TextCoachingCategory
): TextCoachingIssue[] {
  return result.issues.filter((issue) => issue.category === category);
}

/**
 * Generate a summary message for the coaching result
 */
export function getCoachingSummary(result: TextCoachingResult): string {
  if (result.issues.length === 0) {
    return 'Text setting looks good! No issues found.';
  }

  const parts: string[] = [];

  if (result.summary.bySeverity.error > 0) {
    parts.push(`${result.summary.bySeverity.error} error(s)`);
  }
  if (result.summary.bySeverity.warning > 0) {
    parts.push(`${result.summary.bySeverity.warning} warning(s)`);
  }
  if (result.summary.bySeverity.suggestion > 0) {
    parts.push(`${result.summary.bySeverity.suggestion} suggestion(s)`);
  }

  return `Text coaching found ${parts.join(', ')}. Score: ${result.score}/100`;
}
