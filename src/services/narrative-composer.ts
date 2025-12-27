import type { NarrativeResult, ComposerOptions, StyleReference } from '@/types';

const ANTHROPIC_API_URL = '/api/anthropic/v1/messages';

const STYLE_DESCRIPTIONS: Record<StyleReference, string> = {
  lauridsen: 'Morten Lauridsen style: lush add9 chords, sus4 resolutions, parallel motion, warm and expansive',
  part: 'Arvo Pärt style: minimal motion, diatonic simplicity, tintinnabuli technique, sparse and meditative',
  whitacre: 'Eric Whitacre style: dense voicings, major 7ths, cluster chords, shimmering and ethereal',
  bach: 'J.S. Bach style: strong functional harmony, clear voice leading, sequences, contrapuntal clarity',
  debussy: 'Claude Debussy style: modal mixture, whole-tone elements, parallel chords, impressionistic colors',
  general: 'General Western harmony: balanced use of tonic, subdominant, and dominant functions',
};

const SYSTEM_PROMPT = `You are an expert music theorist and composer specializing in harmonic analysis and emotional narrative through chord progressions.

HARMONIC LANGUAGE:
- Use scale degrees 1-7 as integers
- Quality options: major, minor, diminished, augmented, dom7, maj7, min7, halfdim7, dim7
- Extensions: add9, add11, add13, sus2, sus4, flat9, sharp9, sharp11, flat13

EMOTIONAL MAPPINGS:
- Mysterious/Uncertain: Minor chords, chromatic mediants, diminished
- Tension/Anticipation: Dominant functions, suspensions, altered chords
- Resolution/Peace: Tonic function, plagal cadences
- Darkness/Melancholy: Minor mode, flat-side borrowings
- Triumph/Joy: Major mode, bright cadences, raised extensions

OUTPUT: Return ONLY valid JSON with this exact structure:
{
  "key": "C",
  "mode": "major",
  "chords": [
    {
      "scaleDegree": 1,
      "quality": "major",
      "extensions": {},
      "duration": 4,
      "phase": "opening"
    }
  ],
  "explanation": "Brief explanation of harmonic choices",
  "emotionalMapping": [
    { "phase": "opening", "description": "why these chords evoke this emotion" }
  ]
}`;

function buildUserPrompt(narrative: string, options: ComposerOptions): string {
  const styleDesc = STYLE_DESCRIPTIONS[options.styleReference];
  const totalBeats = options.barCount * options.beatsPerBar;

  return `Create a chord progression for this emotional narrative:

NARRATIVE: "${narrative}"

STYLE: ${styleDesc}
LENGTH: ${options.barCount} bars (${totalBeats} beats total, ${options.beatsPerBar} beats per bar)

Generate chords that tell this story harmonically. Each chord should have a duration in beats that fits the emotional pacing. Map each emotional phase to specific harmonic choices.

Return ONLY the JSON object, no other text.`;
}

export async function generateNarrativeProgression(
  narrative: string,
  options: ComposerOptions
): Promise<NarrativeResult> {
  if (!narrative.trim()) {
    throw new Error('empty_narrative');
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(narrative, options),
        },
      ],
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('rate_limit');
    }
    throw new Error('api_error');
  }

  const data = await response.json();

  // Extract text content from Claude response
  const textContent = data.content?.find((c: { type: string }) => c.type === 'text');
  if (!textContent?.text) {
    throw new Error('invalid_response');
  }

  try {
    // Parse JSON from response (may be wrapped in markdown code blocks)
    let jsonStr = textContent.text.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    const result = JSON.parse(jsonStr) as NarrativeResult;

    // Validate required fields
    if (!result.key || !result.mode || !Array.isArray(result.chords)) {
      throw new Error('validation_error');
    }

    // Validate each chord
    for (const chord of result.chords) {
      if (
        typeof chord.scaleDegree !== 'number' ||
        chord.scaleDegree < 1 ||
        chord.scaleDegree > 7 ||
        !chord.quality ||
        typeof chord.duration !== 'number'
      ) {
        throw new Error('validation_error');
      }
    }

    return result;
  } catch (e) {
    if (e instanceof Error && ['validation_error', 'invalid_response'].includes(e.message)) {
      throw e;
    }
    throw new Error('invalid_response');
  }
}

// Example narratives for UI suggestions
export const EXAMPLE_NARRATIVES = [
  'Dawn breaking slowly over a quiet lake, mist rising, then birds beginning to sing',
  'Uncertainty and searching, finding a path, growing confidence, triumphant arrival',
  'Deep melancholy that gradually finds a glimmer of hope and ends peacefully',
  'Playful and light, then suddenly dark and serious, returning to joy',
  'Ancient mystery, revelation, wonder, acceptance',
  'Longing and loss, acceptance, bittersweet resolution',
];
