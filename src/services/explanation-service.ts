import { Chord } from '../types/chord';
import { ChordExplanation } from '../types/ai';
import { useExpertModeStore } from '../store/expert-mode-store';

/**
 * Scale degree contexts for mock explanations
 */
const SCALE_DEGREE_CONTEXTS: Record<number, string> = {
  1: 'The tonic chord provides stability and resolution, serving as home base.',
  2: 'The supertonic creates gentle tension, often leading to dominant.',
  3: 'The mediant provides color and variety as a tonic substitute.',
  4: 'The subdominant creates gentle movement, often preceding dominant.',
  5: 'The dominant creates strong tension demanding resolution to tonic.',
  6: 'The submediant offers introspective quality as tonic substitute.',
  7: 'The leading tone creates maximum tension, pulling toward resolution.',
};

/**
 * Scale degree names for reference
 */
const SCALE_DEGREE_NAMES: Record<number, string> = {
  1: 'Tonic',
  2: 'Supertonic',
  3: 'Mediant',
  4: 'Subdominant',
  5: 'Dominant',
  6: 'Submediant',
  7: 'Leading Tone',
};

/**
 * Chord quality descriptions for mock explanations
 */
const CHORD_QUALITY_DESCRIPTIONS: Record<string, string> = {
  major: 'bright and stable',
  minor: 'dark and introspective',
  diminished: 'tense and unstable, seeking resolution',
  augmented: 'mysterious and floating, lacking clear direction',
  dom7: 'dominant with blues character, demanding resolution',
  maj7: 'sophisticated and elegant, providing color',
  min7: 'moody and jazz-like, creating gentle tension',
  halfdim7: 'unstable and questioning, often resolving down',
  dim7: 'extremely tense and symmetrical, needing resolution',
};

/**
 * Cache entry structure
 */
interface CacheEntry {
  explanation: ChordExplanation;
  timestamp: number;
}

/**
 * TTL for cache entries (7 days in milliseconds)
 */
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

/**
 * Generate cache key for a chord explanation
 */
export function getCacheKey(
  chord: Chord,
  key: string,
  mode: string
): string {
  return `neume_explanation_${chord.id}_${key}_${mode}`;
}

/**
 * Get explanation from localStorage cache
 */
export function getCachedExplanation(
  cacheKey: string
): ChordExplanation | null {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    const age = Date.now() - entry.timestamp;

    // Check if cache is still valid
    if (age > CACHE_TTL) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return entry.explanation;
  } catch (error) {
    console.warn('Error reading from cache:', error);
    return null;
  }
}

/**
 * Store explanation in localStorage cache
 */
export function setCachedExplanation(
  cacheKey: string,
  explanation: ChordExplanation
): void {
  try {
    const entry: CacheEntry = {
      explanation,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.warn('Error writing to cache:', error);
  }
}

/**
 * Get quality description for a chord
 */
function getQualityDescription(quality: string): string {
  return CHORD_QUALITY_DESCRIPTIONS[quality] || 'unique and colorful';
}

/**
 * Generate mock explanation based on chord properties
 */
export function getMockExplanation(
  chord: Chord,
  context: {
    key: string;
    mode: string;
    prevChord?: Chord;
    nextChord?: Chord;
    sourcePiece?: string;
  }
): ChordExplanation {
  const degreeNum = chord.scaleDegree;
  const degreeName = SCALE_DEGREE_NAMES[degreeNum] || `Degree ${degreeNum}`;
  const degreeContext = SCALE_DEGREE_CONTEXTS[degreeNum];
  const qualityDesc = getQualityDescription(chord.quality);

  // Build contextual explanation with harmonic function analysis
  let contextual = `${degreeName} (${chord.scaleDegree}): ${degreeContext} `;
  contextual += `In ${context.key} ${context.mode}, this ${qualityDesc} chord `;

  if (chord.isChromatic && chord.chromaticType) {
    contextual += `adds a chromatic flavor as a ${chord.chromaticType} chord, `;
    contextual += `creating unexpected harmonic color. `;
  }

  // Explain harmonic relationships with surrounding chords
  if (context.prevChord && context.nextChord) {
    const prevDegree = context.prevChord.scaleDegree;
    const nextDegree = context.nextChord.scaleDegree;
    const prevName = SCALE_DEGREE_NAMES[prevDegree];
    const nextName = SCALE_DEGREE_NAMES[nextDegree];

    contextual += `It follows the ${prevName} (${prevDegree}) and leads to the ${nextName} (${nextDegree}). `;

    // Explain common progressions
    if (prevDegree === 5 && degreeNum === 1) {
      contextual += `This V→I movement is the strongest resolution in tonal music (authentic cadence). `;
      // Track cadence for Expert Mode
      useExpertModeStore.getState().trackCadenceCompleted();
    } else if (prevDegree === 4 && degreeNum === 1) {
      contextual += `This IV→I movement creates a plagal cadence, often heard as "Amen" in hymns. `;
      // Track cadence for Expert Mode
      useExpertModeStore.getState().trackCadenceCompleted();
    } else if (degreeNum === 5 && nextDegree === 1) {
      contextual += `The dominant naturally wants to resolve to the tonic that follows. `;
    } else if (degreeNum === 4 && nextDegree === 5) {
      contextual += `The subdominant prepares the dominant - a classic pre-dominant function. `;
    } else if (degreeNum === 2 && nextDegree === 5) {
      contextual += `The supertonic (ii) often leads to the dominant (V) in the common ii-V-I progression. `;
    }
  } else if (context.prevChord) {
    const prevDegree = context.prevChord.scaleDegree;
    contextual += `It follows the ${SCALE_DEGREE_NAMES[prevDegree]} (${prevDegree}) chord. `;

    if (prevDegree === 5 && degreeNum === 1) {
      contextual += `This V→I resolution provides harmonic closure. `;
      // Track cadence for Expert Mode
      useExpertModeStore.getState().trackCadenceCompleted();
    } else if (prevDegree === 4 && degreeNum === 5) {
      contextual += `The subdominant naturally leads to dominant. `;
    }
  } else if (context.nextChord) {
    const nextDegree = context.nextChord.scaleDegree;
    contextual += `It leads to the ${SCALE_DEGREE_NAMES[nextDegree]} (${nextDegree}) chord. `;
  }

  contextual += 'This creates a sense of harmonic purpose and forward motion.';

  // Build technical explanation
  let technical = `This ${chord.quality} chord on scale degree ${chord.scaleDegree} `;
  technical += `includes the voices: `;
  technical += `Soprano (${chord.voices.soprano}), `;
  technical += `Alto (${chord.voices.alto}), `;
  technical += `Tenor (${chord.voices.tenor}), `;
  technical += `Bass (${chord.voices.bass}). `;

  if (Object.keys(chord.extensions).some((key) => chord.extensions[key as keyof typeof chord.extensions])) {
    technical += 'This voicing includes extended tones that add sophistication.';
  } else {
    technical += 'The voicing maintains voice leading clarity.';
  }

  // Build historical explanation
  let historical = `The ${degreeName} chord has been a fundamental harmonic element `;
  historical += `in music since the Baroque period. `;

  if (degreeNum === 5) {
    historical += 'Its dominant function became codified during the Classical era.';
  } else if (degreeNum === 1) {
    historical += 'Its tonal center provides the foundation for tonal harmony.';
  } else if (degreeNum === 4) {
    historical += 'Its subdominant function bridges tonic and dominant in classical progressions.';
  } else {
    historical += 'Its use evolved through various harmonic systems and musical periods.';
  }

  // Build evolution steps
  const evolutionSteps = [
    {
      name: 'Foundation',
      description: `The ${SCALE_DEGREE_NAMES[1]} (I) chord establishes the tonal center in ${context.key} ${context.mode}.`,
      chord: { ...chord, scaleDegree: 1 as const },
    },
    {
      name: 'Movement',
      description: `Moving to the ${degreeName} (${chord.scaleDegree}) creates harmonic interest and momentum.`,
      chord,
    },
    {
      name: 'Resolution',
      description: `Returning to the ${SCALE_DEGREE_NAMES[1]} (I) provides harmonic closure and satisfaction.`,
      chord: { ...chord, scaleDegree: 1 as const },
    },
  ];

  return {
    contextual,
    technical,
    historical,
    evolutionSteps,
  };
}

/**
 * Convert a chord to Roman numeral notation
 */
function toRomanNumeral(degree: number, quality: string, mode: string): string {
  const majorNumerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
  const minorNumerals = ['i', 'ii°', 'III', 'iv', 'V', 'VI', 'VII'];
  const numerals = mode === 'minor' ? minorNumerals : majorNumerals;
  let numeral = numerals[degree - 1] || `${degree}`;

  // Adjust for quality overrides
  if (quality === 'major' && numeral === numeral.toLowerCase()) {
    numeral = numeral.toUpperCase();
  } else if (quality === 'minor' && numeral === numeral.toUpperCase()) {
    numeral = numeral.toLowerCase();
  }
  if (quality === 'dom7') numeral += '7';
  if (quality === 'maj7') numeral += 'maj7';
  if (quality === 'min7') numeral += 'm7';

  return numeral;
}

/**
 * Summarize a full progression as Roman numerals
 */
function summarizeProgression(chords: Chord[], mode: string): string {
  if (chords.length === 0) return '';
  return chords.map(c => toRomanNumeral(c.scaleDegree, c.quality, mode)).join(' → ');
}

/**
 * Build prompt for Claude API
 * @internal Reserved for future direct Claude API integration
 */
export function buildExplanationPrompt(
  chord: Chord,
  context: {
    key: string;
    mode: string;
    prevChord?: Chord;
    nextChord?: Chord;
    fullProgression?: Chord[];
    songTitle?: string;
    composer?: string;
  }
): string {
  let prompt = `You are an expert music theorist and musicologist. Analyze the following chord in its full musical context.\n\n`;

  // Song context if available
  if (context.songTitle || context.composer) {
    prompt += `## Song Information\n`;
    if (context.songTitle) prompt += `Title: "${context.songTitle}"\n`;
    if (context.composer) prompt += `Artist/Composer: ${context.composer}\n`;
    prompt += `\n`;
  }

  // Key and mode
  prompt += `## Musical Context\n`;
  prompt += `Key: ${context.key} ${context.mode}\n`;

  // Full progression summary
  if (context.fullProgression && context.fullProgression.length > 0) {
    const progressionSummary = summarizeProgression(context.fullProgression, context.mode);
    const chordPosition = context.fullProgression.findIndex(c => c.id === chord.id) + 1;
    prompt += `Full Progression: ${progressionSummary}\n`;
    prompt += `This chord is #${chordPosition} of ${context.fullProgression.length} in the sequence.\n`;
  }
  prompt += `\n`;

  // Current chord details
  const romanNumeral = toRomanNumeral(chord.scaleDegree, chord.quality, context.mode);
  prompt += `## Chord Being Analyzed\n`;
  prompt += `Chord: ${romanNumeral} (Scale Degree ${chord.scaleDegree}, Quality: ${chord.quality})\n`;
  prompt += `Voicing: Soprano-${chord.voices.soprano}, Alto-${chord.voices.alto}, Tenor-${chord.voices.tenor}, Bass-${chord.voices.bass}\n`;

  if (chord.isChromatic) {
    prompt += `Chromatic Type: ${chord.chromaticType}\n`;
  }
  prompt += `\n`;

  // Immediate harmonic context
  if (context.prevChord || context.nextChord) {
    prompt += `## Immediate Harmonic Context\n`;
    if (context.prevChord) {
      const prevNumeral = toRomanNumeral(context.prevChord.scaleDegree, context.prevChord.quality, context.mode);
      prompt += `Previous: ${prevNumeral} (${SCALE_DEGREE_NAMES[context.prevChord.scaleDegree]})\n`;
    }
    prompt += `Current: ${romanNumeral} (${SCALE_DEGREE_NAMES[chord.scaleDegree]})\n`;
    if (context.nextChord) {
      const nextNumeral = toRomanNumeral(context.nextChord.scaleDegree, context.nextChord.quality, context.mode);
      prompt += `Next: ${nextNumeral} (${SCALE_DEGREE_NAMES[context.nextChord.scaleDegree]})\n`;
    }
    prompt += `\n`;
  }

  // Analysis request
  prompt += `## Analysis Request\n`;
  prompt += `Provide a comprehensive analysis covering:\n`;
  prompt += `1. CONTEXTUAL: How does this chord function within this specific progression? `;
  if (context.songTitle) {
    prompt += `Consider the style and era of "${context.songTitle}" if you recognize it. `;
  }
  prompt += `Explain the harmonic function (tonic, dominant, subdominant, etc.) and why this chord works here.\n`;
  prompt += `2. TECHNICAL: Analyze the voice leading, any notable intervals, and the quality choice.\n`;
  prompt += `3. HISTORICAL: If this is a recognized song, mention its significance. Otherwise, describe the historical/stylistic context of this harmonic technique.\n`;
  prompt += `4. MACRO PATTERNS: If you can identify patterns across the whole progression (like repeated harmonic motions, tension/release cycles, or common chord sequences), mention them.\n`;
  prompt += `\n`;

  prompt += `Respond with valid JSON:\n`;
  prompt += `{\n`;
  prompt += `  "contextual": "detailed explanation of harmonic function and why it works here",\n`;
  prompt += `  "technical": "voice leading and technical analysis",\n`;
  prompt += `  "historical": "historical/stylistic context or song-specific information",\n`;
  prompt += `  "evolutionSteps": [\n`;
  prompt += `    { "name": "step name", "description": "description" }\n`;
  prompt += `  ]\n`;
  prompt += `}\n`;
  prompt += `\nReturn only the JSON object.`;

  return prompt;
}

/**
 * Convert chord to API format
 */
function chordToApiFormat(chord: Chord) {
  return {
    id: chord.id,
    scaleDegree: chord.scaleDegree,
    quality: chord.quality,
    key: chord.key,
    mode: chord.mode,
    voices: chord.voices,
    isChromatic: chord.isChromatic || false,
    chromaticType: chord.chromaticType || null,
  };
}

/**
 * Call backend proxy to get chord explanation from Claude
 */
async function getAPIExplanation(
  chord: Chord,
  context: {
    key: string;
    mode: string;
    prevChord?: Chord;
    nextChord?: Chord;
    fullProgression?: Chord[];
    songTitle?: string;
    composer?: string;
  }
): Promise<ChordExplanation | null> {
  // Use backend proxy to avoid CORS issues
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  try {
    const requestBody = {
      chord: chordToApiFormat(chord),
      prevChord: context.prevChord ? chordToApiFormat(context.prevChord) : null,
      nextChord: context.nextChord ? chordToApiFormat(context.nextChord) : null,
      fullProgression: context.fullProgression?.map(chordToApiFormat) || null,
      songContext: context.songTitle || context.composer
        ? { title: context.songTitle, composer: context.composer }
        : null,
    };

    const response = await fetch(`${backendUrl}/api/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error(
        'Backend API error:',
        response.status,
        response.statusText
      );
      return null;
    }

    const data = await response.json() as {
      success: boolean;
      contextual?: string;
      technical?: string;
      historical?: string;
      evolutionSteps?: Array<{ name: string; description: string }>;
      error?: string;
    };

    if (!data.success) {
      console.error('Explanation failed:', data.error);
      return null;
    }

    return {
      contextual: data.contextual || '',
      technical: data.technical || '',
      historical: data.historical || '',
      evolutionSteps: (data.evolutionSteps || []).map((step: { name: string; description: string }) => ({
        name: step.name,
        description: step.description,
        chord: chord,
      })),
    };
  } catch (error) {
    console.error('Error fetching explanation from backend:', error);
    return null;
  }
}

/**
 * Main function to get chord explanation with caching and fallback
 */
export async function explainChord(
  chord: Chord,
  context: {
    key: string;
    mode: string;
    prevChord?: Chord;
    nextChord?: Chord;
    fullProgression?: Chord[];
    songTitle?: string;
    composer?: string;
  }
): Promise<ChordExplanation> {
  // Generate cache key (include song title for song-specific explanations)
  const cacheKey = getCacheKey(chord, context.key, context.mode) + (context.songTitle ? `_${context.songTitle}` : '');

  // Check cache first
  const cached = getCachedExplanation(cacheKey);
  if (cached) {
    return cached;
  }

  // Try to get explanation from API
  const apiExplanation = await getAPIExplanation(chord, context);
  if (apiExplanation) {
    setCachedExplanation(cacheKey, apiExplanation);
    return apiExplanation;
  }

  // Fall back to mock explanation
  const mockExplanation = getMockExplanation(chord, context);
  setCachedExplanation(cacheKey, mockExplanation);
  return mockExplanation;
}

/**
 * Get chord explanation - convenience wrapper for WhyThisPanel
 */
export async function getChordExplanation(
  chord: Chord,
  prevChord?: Chord,
  nextChord?: Chord,
  fullProgression?: Chord[],
  songContext?: { title?: string; composer?: string }
): Promise<ChordExplanation> {
  return explainChord(chord, {
    key: chord.key,
    mode: chord.mode,
    prevChord,
    nextChord,
    fullProgression,
    songTitle: songContext?.title,
    composer: songContext?.composer,
  });
}
