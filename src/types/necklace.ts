// Voice types for necklace visualization
// Standard 4-voice SATB
export type VoicePart = 'soprano' | 'alto' | 'tenor' | 'bass';

// Extended 8-voice SSAATTBB (double choir)
export type VoicePart8 =
  | 'sopranoI' | 'sopranoII'
  | 'altoI' | 'altoII'
  | 'tenorI' | 'tenorII'
  | 'bassI' | 'bassII';

// Union type for any voice part
export type AnyVoicePart = VoicePart | VoicePart8;

// Voice count modes
export type VoiceCount = 4 | 8;

// Mapping from 8-voice parts to their base 4-voice part
export const VOICE_PART_BASE: Record<VoicePart8, VoicePart> = {
  sopranoI: 'soprano',
  sopranoII: 'soprano',
  altoI: 'alto',
  altoII: 'alto',
  tenorI: 'tenor',
  tenorII: 'tenor',
  bassI: 'bass',
  bassII: 'bass',
};

// Display labels for voice parts
export const VOICE_PART_LABELS: Record<AnyVoicePart, string> = {
  soprano: 'Soprano',
  alto: 'Alto',
  tenor: 'Tenor',
  bass: 'Bass',
  sopranoI: 'Soprano I',
  sopranoII: 'Soprano II',
  altoI: 'Alto I',
  altoII: 'Alto II',
  tenorI: 'Tenor I',
  tenorII: 'Tenor II',
  bassI: 'Bass I',
  bassII: 'Bass II',
};

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
// Base colors for 4-voice SATB
export const VOICE_COLORS: Record<VoicePart, string> = {
  soprano: '#E8A03E',  // Golden amber
  alto: '#6B8FAD',     // Muted steel blue
  tenor: '#7A9E87',    // Muted sage
  bass: '#8B7355',     // Warm taupe
};

// Extended colors for 8-voice SSAATTBB
// Part I = darker shade, Part II = lighter shade
export const VOICE_COLORS_8: Record<VoicePart8, string> = {
  sopranoI: '#D4891F',   // Darker golden amber
  sopranoII: '#F2B861',  // Lighter golden amber
  altoI: '#527A94',      // Darker steel blue
  altoII: '#8BA8BE',     // Lighter steel blue
  tenorI: '#5E8369',     // Darker sage
  tenorII: '#96B8A5',    // Lighter sage
  bassI: '#6B5940',      // Darker warm taupe
  bassII: '#A8906E',     // Lighter warm taupe
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
