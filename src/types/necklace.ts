// Voice types for necklace visualization
export type VoicePart = 'soprano' | 'alto' | 'tenor' | 'bass';

// Configuration for a single voice necklace
export interface VoiceNecklaceConfig {
  enabled: boolean;
  color: string;
  opacity: number;
}

// Complete necklace settings
export interface NecklaceSettings {
  visible: boolean;
  voices: Record<VoicePart, VoiceNecklaceConfig>;
  showDots: boolean;
  showLines: boolean;
  dotSize: number;
  lineWidth: number;
  animateOnChange: boolean;
}

// Default colors for each voice (warm Kinfolk palette)
export const VOICE_COLORS: Record<VoicePart, string> = {
  soprano: '#E8A03E',  // Golden amber
  alto: '#6B8FAD',     // Muted steel blue
  tenor: '#7A9E87',    // Muted sage
  bass: '#8B7355',     // Warm taupe
};

// Default necklace settings
export const DEFAULT_NECKLACE_SETTINGS: NecklaceSettings = {
  visible: false,
  voices: {
    soprano: { enabled: true, color: VOICE_COLORS.soprano, opacity: 0.8 },
    alto: { enabled: true, color: VOICE_COLORS.alto, opacity: 0.8 },
    tenor: { enabled: true, color: VOICE_COLORS.tenor, opacity: 0.8 },
    bass: { enabled: true, color: VOICE_COLORS.bass, opacity: 0.8 },
  },
  showDots: true,
  showLines: true,
  dotSize: 6,
  lineWidth: 2,
  animateOnChange: true,
};
