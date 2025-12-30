/**
 * Evolution Generator
 *
 * Generates evolution steps showing how a complex chord builds from simpler foundations.
 * For example, a Imaj7 evolves: I (triad) → Imaj7
 * A V13 evolves: V (triad) → V7 → V9 → V13
 */

import type { Chord, ChordQuality, Voices } from '@/types';
import { generateSmartVoicing, type Voices4 } from '@/services/smart-voicing';

export interface EvolutionStep {
  name: string;
  description: string;
  quality: ChordQuality;
  chord: Chord;
}

/**
 * Evolution paths from base triad to target quality
 * Each path shows the harmonic journey to reach the final chord
 */
const EVOLUTION_PATHS: Record<string, ChordQuality[]> = {
  // Dominant family
  'dom7': ['major', 'dom7'],
  'dom9': ['major', 'dom7', 'dom9'],
  'dom11': ['major', 'dom7', 'dom11'],
  'dom13': ['major', 'dom7', 'dom13'],
  'dom7b9': ['major', 'dom7', 'dom7b9'],
  'dom7sharp9': ['major', 'dom7', 'dom7sharp9'],
  'dom7sharp11': ['major', 'dom7', 'dom7sharp11'],
  'alt': ['major', 'dom7', 'alt'],

  // Major 7th family
  'maj7': ['major', 'maj7'],
  'maj9': ['major', 'maj7', 'maj9'],
  'maj13': ['major', 'maj7', 'maj13'],

  // Minor 7th family
  'min7': ['minor', 'min7'],
  'min9': ['minor', 'min7', 'min9'],
  'min11': ['minor', 'min7', 'min11'],
  'min13': ['minor', 'min7', 'min13'],

  // Diminished family
  'diminished': ['minor', 'diminished'],
  'halfdim7': ['minor', 'diminished', 'halfdim7'],
  'dim7': ['minor', 'diminished', 'dim7'],

  // Augmented
  'augmented': ['major', 'augmented'],
};

/**
 * Human-readable descriptions for each chord quality in evolution context
 */
const STEP_DESCRIPTIONS: Record<string, string> = {
  'major': 'The bright, stable major triad foundation',
  'minor': 'The darker, melancholic minor triad foundation',
  'dom7': 'Add the minor 7th for bluesy tension that wants to resolve',
  'maj7': 'Add the major 7th for sophisticated, dreamy color',
  'min7': 'Add the minor 7th for warm, jazzy depth',
  'dom9': 'Add the 9th for lush harmonic richness',
  'maj9': 'Add the 9th for floating, impressionistic color',
  'min9': 'Add the 9th for emotional complexity',
  'dom11': 'Add the 11th for suspended, modal tension',
  'min11': 'Add the 11th for ethereal, open quality',
  'dom13': 'Add the 13th - the complete dominant sound',
  'maj13': 'Add the 13th - maximum harmonic richness',
  'min13': 'Add the 13th for the full minor color palette',
  'diminished': 'Flatten the 5th for unstable, tense quality',
  'halfdim7': 'Add minor 7th to diminished - the "half-diminished"',
  'dim7': 'Add diminished 7th - fully symmetrical and tense',
  'augmented': 'Raise the 5th for mysterious, floating quality',
  'alt': 'Alter chord tones for maximum tension before resolution',
  'dom7b9': 'Add flat 9th for darker dominant color',
  'dom7sharp9': 'Add sharp 9th - the "Hendrix chord" sound',
  'dom7sharp11': 'Add sharp 11th for Lydian dominant flavor',
};

/**
 * Get a display name for an evolution step
 */
function getStepName(_quality: ChordQuality, index: number, total: number): string {
  if (index === 0) return 'Foundation';
  if (index === total - 1) return 'Final Form';
  return `Step ${index}`;
}

/**
 * Convert Voices4 to Voices type
 */
function voices4ToVoices(v4: Voices4): Voices {
  return {
    soprano: v4.soprano,
    alto: v4.alto,
    tenor: v4.tenor,
    bass: v4.bass,
  };
}

/**
 * Create an evolution step chord based on the original chord but with different quality
 */
function createEvolutionChord(baseChord: Chord, newQuality: ChordQuality): Chord {
  const stepChord: Chord = {
    ...baseChord,
    id: `evolution-${baseChord.id}-${newQuality}`,
    quality: newQuality,
    extensions: {}, // Evolution steps show base qualities without extensions
    voices: { soprano: '', alto: '', tenor: '', bass: '' },
  };

  // Generate proper voicing for this quality
  try {
    const voicing = generateSmartVoicing(stepChord);
    stepChord.voices = voices4ToVoices(voicing as Voices4);
  } catch (e) {
    // If voicing fails, leave empty voices (playback will skip)
    console.warn('Failed to generate voicing for evolution step:', newQuality);
  }

  return stepChord;
}

/**
 * Generate evolution steps for a chord
 * Returns an array of steps showing how the chord builds from simpler foundations
 */
export function generateEvolutionSteps(chord: Chord): EvolutionStep[] {
  const path = EVOLUTION_PATHS[chord.quality];

  // If no evolution path defined, return empty
  if (!path || path.length <= 1) {
    return [];
  }

  return path.map((stepQuality, index) => {
    const stepChord = createEvolutionChord(chord, stepQuality);

    return {
      name: getStepName(stepQuality, index, path.length),
      description: STEP_DESCRIPTIONS[stepQuality] || 'Harmonic development',
      quality: stepQuality,
      chord: stepChord,
    };
  });
}

/**
 * Get just the quality names for display (without generating full chords)
 * Lighter weight for UI display before audio is needed
 */
export function getEvolutionQualityPath(quality: ChordQuality): ChordQuality[] {
  return EVOLUTION_PATHS[quality] || [quality];
}
