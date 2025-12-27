/**
 * Syllable Parser Service
 *
 * Parses text into syllables using common English hyphenation rules.
 * Handles special markers for melismas and word boundaries.
 */

import type { Syllable, SyllableParseResult, MelismaMarker } from '@/types/text-setting';

// Vowel patterns
const VOWELS = 'aeiouyAEIOUY';

// Consonant clusters that shouldn't be split
const CONSONANT_CLUSTERS = [
  'bl', 'br', 'ch', 'ck', 'cl', 'cr', 'dr', 'fl', 'fr', 'gh', 'gl',
  'gr', 'ng', 'ph', 'pl', 'pr', 'qu', 'sc', 'sh', 'sk', 'sl', 'sm',
  'sn', 'sp', 'st', 'sw', 'th', 'tr', 'tw', 'wh', 'wr', 'sch', 'scr',
  'shr', 'spl', 'spr', 'squ', 'str', 'thr',
];

/**
 * Check if a character is a vowel
 */
function isVowel(char: string): boolean {
  return VOWELS.includes(char);
}

/**
 * Check if a character is a consonant
 */
function isConsonant(char: string): boolean {
  return /[a-zA-Z]/.test(char) && !isVowel(char);
}

/**
 * Find syllable boundaries in a word
 */
function findSyllableBoundaries(word: string): number[] {
  const boundaries: number[] = [];
  const lower = word.toLowerCase();

  if (word.length <= 2) {
    return boundaries;
  }

  let i = 1;
  while (i < word.length - 1) {
    const prev = lower[i - 1];
    const curr = lower[i];
    const next = lower[i + 1];

    // Rule 1: VCV pattern - split before consonant (V-CV)
    if (isVowel(prev) && isConsonant(curr) && isVowel(next)) {
      const potentialCluster = lower.slice(i, i + 3);
      const isClusterStart = CONSONANT_CLUSTERS.some((c) =>
        potentialCluster.startsWith(c)
      );

      if (!isClusterStart) {
        boundaries.push(i);
      }
    }

    // Rule 2: VCCV pattern - split between consonants (VC-CV)
    if (
      i < word.length - 2 &&
      isVowel(prev) &&
      isConsonant(curr) &&
      isConsonant(next) &&
      isVowel(lower[i + 2])
    ) {
      const cluster = curr + next;
      if (!CONSONANT_CLUSTERS.includes(cluster)) {
        boundaries.push(i + 1);
        i++;
      }
    }

    i++;
  }

  return [...new Set(boundaries)].sort((a, b) => a - b);
}

/**
 * Split a single word into syllables
 */
export function syllabifyWord(word: string): string[] {
  if (!word || word.length === 0) {
    return [];
  }

  if (word.length <= 2) {
    return [word];
  }

  // Handle hyphenated words (already syllabified by user)
  if (word.includes('-')) {
    return word.split('-').filter((s) => s.length > 0);
  }

  const boundaries = findSyllableBoundaries(word);

  if (boundaries.length === 0) {
    return [word];
  }

  const syllables: string[] = [];
  let start = 0;

  for (const boundary of boundaries) {
    if (boundary > start) {
      syllables.push(word.slice(start, boundary));
      start = boundary;
    }
  }

  if (start < word.length) {
    syllables.push(word.slice(start));
  }

  return syllables.filter((s) => s.length > 0);
}

/**
 * Check if text contains a melisma marker
 */
export function isMelismaMarker(text: string): boolean {
  const markers: MelismaMarker[] = ['_', '-', '~'];
  return markers.includes(text.trim() as MelismaMarker);
}

/**
 * Parse input text into syllables
 */
export function parseSyllables(text: string): SyllableParseResult {
  const warnings: string[] = [];
  const syllables: Syllable[] = [];

  if (!text || text.trim().length === 0) {
    return { syllables: [], originalText: text, warnings: [] };
  }

  const normalized = text.replace(/\s+/g, ' ').trim();
  const words = normalized.split(' ').filter((w) => w.length > 0);

  for (const word of words) {
    if (isMelismaMarker(word)) {
      syllables.push({
        text: word,
        syllableIndex: 0,
        totalInWord: 1,
        isWordStart: true,
        isWordEnd: true,
        originalWord: word,
      });
      continue;
    }

    // Extract punctuation
    const leadingPunct = word.match(/^[^\w]*/)?.[0] || '';
    const trailingPunct = word.match(/[^\w]*$/)?.[0] || '';
    const cleanWord = word.slice(
      leadingPunct.length,
      word.length - trailingPunct.length
    );

    if (!cleanWord) {
      continue;
    }

    const wordSyllables = syllabifyWord(cleanWord);

    if (wordSyllables.length === 0) {
      warnings.push(`Could not syllabify word: "${word}"`);
      continue;
    }

    wordSyllables.forEach((syllable, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === wordSyllables.length - 1;

      let displayText = syllable;
      if (isFirst && leadingPunct) {
        displayText = leadingPunct + displayText;
      }
      if (isLast && trailingPunct) {
        displayText = displayText + trailingPunct;
      }

      syllables.push({
        text: displayText,
        syllableIndex: idx,
        totalInWord: wordSyllables.length,
        isWordStart: isFirst,
        isWordEnd: isLast,
        originalWord: word,
      });
    });
  }

  return {
    syllables,
    originalText: text,
    warnings,
  };
}

/**
 * Format syllables for display (with hyphens between syllables of same word)
 */
export function formatSyllablesForDisplay(syllables: Syllable[]): string {
  let result = '';

  for (let i = 0; i < syllables.length; i++) {
    const syllable = syllables[i];
    const nextSyllable = syllables[i + 1];

    result += syllable.text;

    if (nextSyllable && !syllable.isWordEnd && !nextSyllable.isWordStart) {
      result += '-';
    } else if (nextSyllable) {
      result += ' ';
    }
  }

  return result;
}

/**
 * Get syllable display text with continuation markers
 */
export function getSyllableDisplayText(
  syllable: Syllable,
  isMelisma: boolean
): string {
  if (isMelisma) {
    return '~';
  }

  let text = syllable.text;
  if (!syllable.isWordStart) {
    text = '-' + text;
  }
  if (!syllable.isWordEnd) {
    text = text + '-';
  }

  return text;
}

/**
 * Validate syllable count against note count
 */
export function validateSyllableNoteRatio(
  syllableCount: number,
  noteCount: number
): { isValid: boolean; message: string } {
  if (syllableCount === 0) {
    return { isValid: true, message: 'No syllables to assign' };
  }

  if (noteCount === 0) {
    return { isValid: false, message: 'No notes available for text setting' };
  }

  if (syllableCount > noteCount) {
    return {
      isValid: false,
      message: `Too many syllables (${syllableCount}) for available notes (${noteCount})`,
    };
  }

  if (syllableCount < noteCount) {
    return {
      isValid: true,
      message: `${noteCount - syllableCount} note(s) will be melismatic`,
    };
  }

  return { isValid: true, message: 'Perfect syllable-to-note ratio' };
}
