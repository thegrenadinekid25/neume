import type { Voices } from '@/types/chord';

export type VoiceType = 'soprano' | 'alto' | 'tenor' | 'bass';

export interface VoiceLeadingIssue {
  type: 'parallel5ths' | 'parallel8ves' | 'voiceCrossing' | 'largeLeap';
  severity: 'error' | 'warning' | 'info';
  voicePair?: [VoiceType, VoiceType];
  voice?: VoiceType;
  description: string;
}

export interface VoiceLeadingAnalysisResult {
  issues: VoiceLeadingIssue[];
  isValid: boolean;
  score: number; // 0-100, 100 being perfect
}

// Note name to MIDI conversion
const NOTE_SEMITONES: Record<string, number> = {
  'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11,
};

function noteToMidi(note: string): number {
  if (!note) return 60;
  const match = note.match(/^([A-Ga-g])([#b]?)(-?\d+)$/);
  if (!match) return 60;
  const [, baseName, accidental, octaveStr] = match;
  let semitone = NOTE_SEMITONES[baseName.toUpperCase()] ?? 0;
  if (accidental === '#') semitone += 1;
  if (accidental === 'b') semitone -= 1;
  return (parseInt(octaveStr, 10) + 1) * 12 + semitone;
}

function getMotionDirection(prevMidi: number, currMidi: number): 'up' | 'down' | 'static' {
  if (currMidi > prevMidi) return 'up';
  if (currMidi < prevMidi) return 'down';
  return 'static';
}

function isPerfectFifth(interval: number): boolean {
  const normalized = Math.abs(interval) % 12;
  return normalized === 7 || normalized === 5; // P5 or inverted (P4)
}

function isPerfectOctaveOrUnison(interval: number): boolean {
  return Math.abs(interval) % 12 === 0;
}

/**
 * Detect parallel 5ths between two voicings
 */
export function detectParallel5ths(prev: Voices, curr: Voices): VoiceLeadingIssue[] {
  const issues: VoiceLeadingIssue[] = [];
  const voices: VoiceType[] = ['soprano', 'alto', 'tenor', 'bass'];

  for (let i = 0; i < voices.length; i++) {
    for (let j = i + 1; j < voices.length; j++) {
      const v1 = voices[i];
      const v2 = voices[j];

      if (!prev[v1] || !prev[v2] || !curr[v1] || !curr[v2]) continue;

      const prevMidi1 = noteToMidi(prev[v1]);
      const prevMidi2 = noteToMidi(prev[v2]);
      const currMidi1 = noteToMidi(curr[v1]);
      const currMidi2 = noteToMidi(curr[v2]);

      const prevInterval = prevMidi1 - prevMidi2;
      const currInterval = currMidi1 - currMidi2;

      const motion1 = getMotionDirection(prevMidi1, currMidi1);
      const motion2 = getMotionDirection(prevMidi2, currMidi2);

      if (
        isPerfectFifth(prevInterval) &&
        isPerfectFifth(currInterval) &&
        motion1 === motion2 &&
        motion1 !== 'static'
      ) {
        issues.push({
          type: 'parallel5ths',
          severity: 'error',
          voicePair: [v1, v2],
          description: `Parallel 5ths between ${v1} and ${v2}`,
        });
      }
    }
  }

  return issues;
}

/**
 * Detect parallel octaves between two voicings
 */
export function detectParallel8ves(prev: Voices, curr: Voices): VoiceLeadingIssue[] {
  const issues: VoiceLeadingIssue[] = [];
  const voices: VoiceType[] = ['soprano', 'alto', 'tenor', 'bass'];

  for (let i = 0; i < voices.length; i++) {
    for (let j = i + 1; j < voices.length; j++) {
      const v1 = voices[i];
      const v2 = voices[j];

      if (!prev[v1] || !prev[v2] || !curr[v1] || !curr[v2]) continue;

      const prevMidi1 = noteToMidi(prev[v1]);
      const prevMidi2 = noteToMidi(prev[v2]);
      const currMidi1 = noteToMidi(curr[v1]);
      const currMidi2 = noteToMidi(curr[v2]);

      const prevInterval = prevMidi1 - prevMidi2;
      const currInterval = currMidi1 - currMidi2;

      const motion1 = getMotionDirection(prevMidi1, currMidi1);
      const motion2 = getMotionDirection(prevMidi2, currMidi2);

      if (
        isPerfectOctaveOrUnison(prevInterval) &&
        isPerfectOctaveOrUnison(currInterval) &&
        motion1 === motion2 &&
        motion1 !== 'static'
      ) {
        issues.push({
          type: 'parallel8ves',
          severity: 'error',
          voicePair: [v1, v2],
          description: `Parallel octaves between ${v1} and ${v2}`,
        });
      }
    }
  }

  return issues;
}

/**
 * Detect voice crossing within a single voicing
 */
export function detectVoiceCrossing(voicing: Voices): VoiceLeadingIssue[] {
  const issues: VoiceLeadingIssue[] = [];

  const sopranoMidi = voicing.soprano ? noteToMidi(voicing.soprano) : null;
  const altoMidi = voicing.alto ? noteToMidi(voicing.alto) : null;
  const tenorMidi = voicing.tenor ? noteToMidi(voicing.tenor) : null;
  const bassMidi = voicing.bass ? noteToMidi(voicing.bass) : null;

  if (sopranoMidi && altoMidi && sopranoMidi < altoMidi) {
    issues.push({
      type: 'voiceCrossing',
      severity: 'warning',
      voicePair: ['soprano', 'alto'],
      description: 'Soprano crosses below alto',
    });
  }

  if (altoMidi && tenorMidi && altoMidi < tenorMidi) {
    issues.push({
      type: 'voiceCrossing',
      severity: 'warning',
      voicePair: ['alto', 'tenor'],
      description: 'Alto crosses below tenor',
    });
  }

  if (tenorMidi && bassMidi && tenorMidi < bassMidi) {
    issues.push({
      type: 'voiceCrossing',
      severity: 'warning',
      voicePair: ['tenor', 'bass'],
      description: 'Tenor crosses below bass',
    });
  }

  return issues;
}

/**
 * Detect large leaps (greater than an octave)
 */
export function detectLargeLeaps(prev: Voices, curr: Voices, threshold = 12): VoiceLeadingIssue[] {
  const issues: VoiceLeadingIssue[] = [];
  const voices: VoiceType[] = ['soprano', 'alto', 'tenor', 'bass'];

  for (const voice of voices) {
    if (!prev[voice] || !curr[voice]) continue;

    const prevMidi = noteToMidi(prev[voice]);
    const currMidi = noteToMidi(curr[voice]);
    const interval = Math.abs(currMidi - prevMidi);

    if (interval > threshold) {
      issues.push({
        type: 'largeLeap',
        severity: 'warning',
        voice,
        description: `Large leap (${interval} semitones) in ${voice}`,
      });
    }
  }

  return issues;
}

/**
 * Analyze voice leading between two voicings
 */
export function analyzeVoiceLeading(prev: Voices | null, curr: Voices): VoiceLeadingAnalysisResult {
  const issues: VoiceLeadingIssue[] = [];

  // Always check for voice crossing in current voicing
  issues.push(...detectVoiceCrossing(curr));

  // If we have a previous chord, check motion-based issues
  if (prev) {
    issues.push(...detectParallel5ths(prev, curr));
    issues.push(...detectParallel8ves(prev, curr));
    issues.push(...detectLargeLeaps(prev, curr));
  }

  // Calculate score
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const score = Math.max(0, 100 - (errorCount * 25) - (warningCount * 10));

  return {
    issues,
    isValid: errorCount === 0,
    score,
  };
}
