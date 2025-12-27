/**
 * Color System for Neume
 */

/**
 * Scale Degree Colors - Major Keys
 * Saturated, vibrant colors for maximum visual impact
 */
export const SCALE_DEGREE_COLORS_MAJOR = {
  I: '#E8A03E',    // Rich golden amber
  ii: '#5BAF89',   // Vibrant sage
  iii: '#D97298',  // Bold rose
  IV: '#4E7AC7',   // Bright periwinkle
  V: '#E85D3D',    // Vivid terracotta
  vi: '#9D6DB0',   // Saturated purple
  vii: '#4A4A4A',  // Charcoal
} as const;

/**
 * Scale Degree Colors - Minor Keys
 * Deep, rich colors for deep tonality
 */
export const SCALE_DEGREE_COLORS_MINOR = {
  i: '#A73636',    // Deep burgundy
  ii: '#6B7A8C',   // Slate blue
  III: '#D4924A',  // Rich amber
  iv: '#2F4A6B',   // Deep navy
  v: '#C43A2E',    // Vivid crimson
  VI: '#6BA870',   // Rich sage
  VII: '#D87028',  // Bright burnt orange
} as const;

/**
 * Key Background Colors
 */
export const KEY_BACKGROUNDS = {
  'C-major': '#F5F1E8',
  'C-minor': '#F5F1E8',
  'G-major': '#E8F4F0',
  'G-minor': '#E8F4F0',
  'D-major': '#FFF9E5',
  'D-minor': '#FFF9E5',
  'A-major': '#F3EDF7',
  'A-minor': '#F3EDF7',
  'E-major': '#FFF0F0',
  'E-minor': '#FFF0F0',
  'B-major': '#E8F6F8',
  'B-minor': '#E8F6F8',
  'F#-major': '#EEF4E8',
  'F#-minor': '#EEF4E8',
  'Db-major': '#FFEEE0',
  'Db-minor': '#FFEEE0',
  'Ab-major': '#EFF0F8',
  'Ab-minor': '#EFF0F8',
  'Eb-major': '#E8F5EC',
  'Eb-minor': '#E8F5EC',
  'Bb-major': '#FFE9E0',
  'Bb-minor': '#FFE9E0',
  'F-major': '#E5F2F8',
  'F-minor': '#E5F2F8',
} as const;

/**
 * UI Chrome Colors
 */
export const UI_COLORS = {
  primaryAction: '#4A90E2',
  secondaryAction: '#7F8C8D',
  success: '#6B9080',
  warning: '#E8A87C',
  error: '#C44536',
  textPrimary: '#2C3E50',
  textSecondary: '#7F8C8D',
  textTertiary: '#BDC3C7',
  backgroundPrimary: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  borderLight: '#E0E0E0',
  borderMedium: '#CCCCCC',
  borderDark: '#999999',
} as const;

/**
 * Chromatic/Borrowed Chord Indicators
 */
export const CHROMATIC_INDICATORS = {
  shimmerGradientStart: '#9B7EBD',
  shimmerGradientEnd: '#D4AF37',
  edgeGlow: '#9B7EBD',
  shimmerOpacity: 0.3,
  glowOpacity: 0.4,
  glowBlur: 10,
} as const;

/**
 * Animation Colors
 */
export const ANIMATION_COLORS = {
  playbackGlow: '#4A90E2',
  selectionStroke: '#4A90E2',
  hoverStroke: '#7F8C8D',
  dragOverlay: 'rgba(0, 0, 0, 0.15)',
} as const;

/**
 * Get scale degree color based on key mode
 */
export function getScaleDegreeColor(
  degree: number,
  mode: 'major' | 'minor'
): string {
  const romanNumerals: Record<number, string> = mode === 'major'
    ? { 1: 'I', 2: 'ii', 3: 'iii', 4: 'IV', 5: 'V', 6: 'vi', 7: 'vii' }
    : { 1: 'i', 2: 'ii', 3: 'III', 4: 'iv', 5: 'V', 6: 'VI', 7: 'VII' };

  const colors = mode === 'major' ? SCALE_DEGREE_COLORS_MAJOR : SCALE_DEGREE_COLORS_MINOR;
  const key = romanNumerals[degree] as keyof typeof colors;
  return colors[key] || '#888888';
}

/**
 * Get key background color
 */
export function getKeyBackground(
  key: string,
  mode: 'major' | 'minor'
): string {
  const colorKey = `${key}-${mode}` as keyof typeof KEY_BACKGROUNDS;
  return KEY_BACKGROUNDS[colorKey] || KEY_BACKGROUNDS['C-major'];
}

/**
 * Add alpha channel to hex color
 */
export function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

interface RGB { r: number; g: number; b: number; }

function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
