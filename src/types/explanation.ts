/**
 * Types for AI-generated chord explanations
 */

export interface EvolutionStep {
  chord: string;
  quality: string;
  description: string;
}

export interface ChordExplanation {
  context: string;
  evolutionSteps: EvolutionStep[];
  emotion: string;
  examples: string[];
}
