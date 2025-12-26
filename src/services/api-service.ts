import { AnalysisInput, AnalysisResult } from '@/types/analysis';
import { ChordExplanation } from '@/types/explanation';
import { Chord } from '@types';
import { DeconstructionStep } from '../store/build-from-bones-store';
import { Suggestion } from '../store/refine-store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Analyze audio from YouTube URL or uploaded file
 * Calls Python FastAPI backend with Essentia chord extraction
 */
export async function analyzeAudio(input: AnalysisInput): Promise<AnalysisResult> {
  const formData = new FormData();

  if (input.type === 'youtube' && input.youtubeUrl) {
    formData.append('youtube_url', input.youtubeUrl);
  } else if (input.type === 'audio' && input.audioFile) {
    formData.append('audio_file', input.audioFile);
  } else {
    throw new Error('Invalid input: must provide YouTube URL or audio file');
  }

  // Add optional parameters
  if (input.startTime !== undefined) {
    formData.append('start_time', input.startTime.toString());
  }
  if (input.endTime !== undefined) {
    formData.append('end_time', input.endTime.toString());
  }
  if (input.keyHint && input.keyHint !== 'auto') {
    formData.append('key_hint', input.keyHint);
  }
  if (input.modeHint && input.modeHint !== 'auto') {
    formData.append('mode_hint', input.modeHint);
  }

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Analysis failed');
  }

  const data = await response.json();

  // Convert snake_case from Python to camelCase for TypeScript
  return {
    title: data.title,
    composer: data.composer,
    key: data.key,
    mode: data.mode,
    tempo: data.tempo,
    chords: data.chords.map((c: any) => ({
      id: c.id,
      scaleDegree: c.scale_degree,
      quality: c.quality,
      extensions: c.extensions,
      key: c.key,
      mode: c.mode,
      isChromatic: c.is_chromatic,
      voices: c.voices,
      startBeat: c.start_beat,
      duration: c.duration,
      position: c.position,
      size: c.size,
      selected: c.selected,
      playing: c.playing,
      source: c.source,
      createdAt: c.created_at,
    })),
    sourceUrl: data.source_url,
    analyzedAt: data.analyzed_at,
  };
}

/**
 * Get cache key for an explanation
 */
function getExplanationCacheKey(
  chordId: string,
  key: string,
  mode: string
): string {
  return `explanation_${chordId}_${key}_${mode}`;
}

/**
 * Get cached explanation from localStorage
 */
function getCachedExplanation(cacheKey: string): ChordExplanation | null {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const now = Date.now();
    const TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

    if (now - data.timestamp > TTL) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return data.explanation;
  } catch (error) {
    console.error('Error reading cached explanation:', error);
    return null;
  }
}

/**
 * Save explanation to localStorage cache
 */
function cacheExplanation(cacheKey: string, explanation: ChordExplanation): void {
  try {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        explanation,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error('Error caching explanation:', error);
  }
}

/**
 * Get AI explanation for a chord using Anthropic Claude API
 * Calls Python backend which handles the AI interaction
 * Implements 7-day localStorage caching
 */
export async function getChordExplanation(
  chord: Chord,
  previousChord: Chord | null,
  nextChord: Chord | null,
  key: string,
  mode: 'major' | 'minor'
): Promise<ChordExplanation> {
  // Check cache first
  const cacheKey = getExplanationCacheKey(chord.id, key, mode);
  const cached = getCachedExplanation(cacheKey);

  if (cached) {
    console.log('Using cached explanation');
    return cached;
  }

  // Call backend API
  const response = await fetch(`${API_BASE_URL}/api/explain`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chord,
      previous_chord: previousChord,
      next_chord: nextChord,
      key,
      mode,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Explanation failed');
  }

  const data = await response.json();

  // Convert snake_case to camelCase
  const explanation: ChordExplanation = {
    context: data.context,
    evolutionSteps: data.evolutionSteps || data.evolution_steps || [],
    emotion: data.emotion,
    examples: data.examples,
  };

  // Cache the result
  cacheExplanation(cacheKey, explanation);

  return explanation;
}

/**
 * Deconstruct a progression into evolutionary steps
 * Shows how complexity emerged from simple foundation
 */
export async function deconstructProgression(
  chords: Chord[],
  key: string,
  mode: string,
  composerStyle?: string
): Promise<DeconstructionStep[]> {
  const response = await fetch(`${API_BASE_URL}/api/deconstruct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chords,
      key,
      mode,
      composer_style: composerStyle || 'Modern sacred choral',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Deconstruction failed');
  }

  const data = await response.json();

  // Convert snake_case to camelCase
  return data.steps.map((step: any) => ({
    stepNumber: step.step_number,
    stepName: step.step_name,
    description: step.description,
    chords: step.chords,
  }));
}

/**
 * Get AI suggestions based on emotional intent
 * User describes how they want music to feel, AI suggests harmonic techniques
 */
export async function getSuggestions(
  intent: string,
  chords: Chord[],
  key: string,
  mode: string
): Promise<Suggestion[]> {
  const response = await fetch(`${API_BASE_URL}/api/suggest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent,
      chords,
      context: {
        key,
        mode
      }
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get suggestions');
  }

  const data = await response.json();

  // Convert to frontend format
  return data.suggestions.map((s: any, index: number) => ({
    id: `suggestion-${index}`,
    technique: s.technique,
    targetChordId: s.target_chord_id || chords[0]?.id,
    from: s.from,
    to: s.to,
    rationale: s.rationale,
    examples: s.examples || [],
    relevanceScore: s.relevance_score || 1.0,
  }));
}
