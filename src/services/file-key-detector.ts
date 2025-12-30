import type { AnalyzedChord } from '@/types/analysis';

export interface FileKeyDetectionResult {
  key: string;
  mode: 'major' | 'minor';
}

export interface FileKeySignature {
  key: string;
  mode: 'major' | 'minor';
}

/**
 * Helper function to find the most common root note from a list of roots
 * @param roots Array of root note names
 * @returns The most frequently occurring root note
 */
function mostCommonRoot(roots: string[]): string {
  if (roots.length === 0) {
    return 'C';
  }

  const rootCounts = new Map<string, number>();

  for (const root of roots) {
    const currentCount = rootCounts.get(root) || 0;
    rootCounts.set(root, currentCount + 1);
  }

  let maxCount = 0;
  let mostCommon = 'C';

  for (const [root, count] of rootCounts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = root;
    }
  }

  return mostCommon;
}

/**
 * Detects the musical key from a chord progression with multiple priority levels
 *
 * Priority 1: Uses provided file key signature if available
 * Priority 2: Analyzes chord roots to find the most common root as tonic
 * Priority 3: Determines mode based on first/last chord quality
 *
 * @param chords Array of analyzed chords
 * @param fileKeySignature Optional file key signature with key and mode
 * @returns Detected key and mode
 */
export function detectKeyFromChords(
  chords: AnalyzedChord[],
  fileKeySignature?: FileKeySignature
): FileKeyDetectionResult {
  // Priority 1: Return file key signature if provided and has a key
  if (fileKeySignature && fileKeySignature.key) {
    return {
      key: fileKeySignature.key,
      mode: fileKeySignature.mode,
    };
  }

  // Priority 2: Analyze chord roots to find most common root
  const roots = chords
    .map((chord) => chord.root)
    .filter((root): root is string => root !== null && root !== undefined);

  const tonic = mostCommonRoot(roots);

  // Priority 3: Determine mode based on first/last chord quality
  let mode: 'major' | 'minor' = 'major';

  // Check first chord quality
  if (chords.length > 0) {
    const firstChord = chords[0];
    if (firstChord.quality === 'minor' || firstChord.quality === 'minormajor7') {
      mode = 'minor';
    }
  }

  // Check last chord quality (can override first chord)
  if (chords.length > 0) {
    const lastChord = chords[chords.length - 1];
    if (lastChord.quality === 'minor' || lastChord.quality === 'minormajor7') {
      mode = 'minor';
    }
  }

  return {
    key: tonic,
    mode,
  };
}
