# Week 4 Prompt 005: AI Explanation System

## Objective
Integrate Anthropic Claude API to generate intelligent, educational explanations for why specific chords were chosen in a progression.

## Requirements

### Claude API Integration
```typescript
// src/services/ai-service.ts

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY
});

export async function explainChord(
  chord: Chord,
  context: {
    key: string;
    mode: string;
    prevChord?: Chord;
    nextChord?: Chord;
    sourcePiece?: string;
  }
): Promise<ChordExplanation> {
  
  const prompt = `
You are a music theory educator explaining chord choices to choral composers.

Chord: ${chord.scaleDegree} ${chord.quality} in ${context.key} ${context.mode}
Extensions: ${JSON.stringify(chord.extensions)}
Context: Following ${context.prevChord?.scaleDegree || 'start'}, preceding ${context.nextChord?.scaleDegree || 'end'}
${context.sourcePiece ? `From: ${context.sourcePiece}` : ''}

Provide:
1. Why THIS chord HERE? (2 sentences - contextual explanation)
2. Evolution chain from simple to complex (3 steps with descriptions)
3. How does this serve the emotion/text? (1 sentence)
4. Historical/stylistic examples (composers who use this)

Keep language clear, inspiring, and practical for composers.
Format as JSON:
{
  "context": "...",
  "evolutionSteps": [
    { "chord": "D", "quality": "major", "description": "..." },
    { "chord": "Dmaj7", "quality": "maj7", "description": "..." },
    { "chord": "Dmadd9", "quality": "add9", "description": "..." }
  ],
  "emotion": "...",
  "examples": ["Lauridsen", "Whitacre", ...]
}
`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  });

  const response = message.content[0].text;
  return JSON.parse(response);
}
```

### Caching Strategy
- Cache explanations in localStorage
- Key: `explanation_${chord.id}_${key}_${mode}`
- TTL: 7 days
- Reduces API costs and improves speed

### Error Handling
- Network errors → Show cached version if available
- API errors → Graceful fallback message
- Rate limits → Queue requests
- Invalid JSON → Retry with clearer prompt

### Cost Management
- Estimated cost: $0.01-0.02 per explanation
- Typical session: 5-10 explanations = $0.10 max
- Cache hit rate: ~70% after first session

## Environment Setup
```env
# .env.local
VITE_ANTHROPIC_API_KEY=your_key_here
```

**Estimated Time:** 2-3 hours
