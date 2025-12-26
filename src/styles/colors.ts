/**
 * Color System for Harmonic Canvas
 * All values from the design specification
 */

/**
 * Scale Degree Colors - Major Keys
 * Each Roman numeral has its own color representing its function
 */
export const SCALE_DEGREE_COLORS_MAJOR = {
  I: '#D4AF37', // Rich gold (Tonic)
  ii: '#6B9080', // Soft sage green (Supertonic)
  iii: '#B98B8B', // Muted dusty rose (Mediant)
  IV: '#4A6FA5', // Deep periwinkle blue (Subdominant)
  V: '#E07A5F', // Bright terracotta (Dominant)
  vi: '#9B7EBD', // Purple/violet (Submediant)
  vii: '#6C6C6C', // Charcoal gray (Leading Tone)
} as const;

/**
 * Scale Degree Colors - Minor Keys
 * Different palette to distinguish minor mode
 */
export const SCALE_DEGREE_COLORS_MINOR = {
  i: '#8B4545', // Deep burgundy (Tonic)
  ii: '#708090', // Slate gray (Supertonic diminished)
  III: '#D4A76A', // Warm amber (Relative Major)
  iv: '#2D4563', // Navy blue (Subdominant)
  v: '#C44536', // Crimson red (Dominant minor)
  V: '#C44536', // Crimson red (Dominant major)
  VI: '#7A9B76', // Sage green (Submediant)
  VII: '#CC7722', // Burnt orange (Subtonic)
} as const;

/**
 * Key Background Colors
 * Subtle atmospheric washes for each key
 */
export const KEY_BACKGROUNDS = {
  'C-major': '#F5F1E8', // Soft warm beige
  'C-minor': '#F5F1E8',
  'G-major': '#E8F4F0', // Pale blue-green
  'G-minor': '#E8F4F0',
  'D-major': '#FFF9E5', // Gentle cream-yellow
  'D-minor': '#FFF9E5',
  'A-major': '#F3EDF7', // Light lavender
  'A-minor': '#F3EDF7',
  'E-major': '#FFF0F0', // Soft rose
  'E-minor': '#FFF0F0',
  'B-major': '#E8F6F8', // Pale aqua
  'B-minor': '#E8F6F8',
  'F#-major': '#EEF4E8', // Light sage
  'F#-minor': '#EEF4E8',
  'Db-major': '#FFEEE0', // Warm peach
  'Db-minor': '#FFEEE0',
  'Ab-major': '#EFF0F8', // Soft periwinkle
  'Ab-minor': '#EFF0F8',
  'Eb-major': '#E8F5EC', // Pale mint
  'Eb-minor': '#E8F5EC',
  'Bb-major': '#FFE9E0', // Light coral
  'Bb-minor': '#FFE9E0',
  'F-major': '#E5F2F8', // Soft sky blue
  'F-minor': '#E5F2F8',
} as const;

/**
 * UI Chrome Colors
 * Interface elements, buttons, text, states
 */
export const UI_COLORS = {
  // Actions
  primaryAction: '#4A90E2', // Confident blue
  secondaryAction: '#7F8C8D', // Neutral gray

  // States
  success: '#6B9080', // Soft green
  warning: '#E8A87C', // Warm peach
  error: '#C44536', // Crimson

  // Text
  textPrimary: '#2C3E50', // Dark blue-gray
  textSecondary: '#7F8C8D', // Medium gray
  textTertiary: '#BDC3C7', // Light gray

  // Backgrounds
  backgroundPrimary: '#FFFFFF', // White
  backgroundSecondary: '#F5F5F5', // Light gray

  // Borders
  borderLight: '#E0E0E0', // Light border
  borderMedium: '#CCCCCC', // Medium border
  borderDark: '#999999', // Dark border
} as const;

/**
 * Chromatic/Borrowed Chord Indicators
 * Iridescent shimmer overlay for non-diatonic chords
 */
export const CHROMATIC_INDICATORS = {
  shimmerGradientStart: '#9B7EBD', // Purple
  shimmerGradientEnd: '#D4AF37', // Gold
  edgeGlow: '#9B7EBD', // Purple
  shimmerOpacity: 0.3,
  glowOpacity: 0.4,
  glowBlur: 10, // pixels
} as const;

/**
 * Quality Modifiers
 * Brightness/saturation adjustments based on chord quality
 */
export const QUALITY_MODIFIERS = {
  major: {
    saturation: 1.0,
    brightness: 1.0,
  },
  minor: {
    saturation: 0.7,
    brightness: 0.9,
  },
  diminished: {
    saturation: 0.5,
    brightness: 0.7,
  },
  augmented: {
    saturation: 1.2,
    brightness: 1.1,
    glow: true,
  },
  seventh: {
    gradient: true, // Use gradient fill (base → 15% darker)
  },
} as const;

/**
 * Animation Colors
 * Colors used during interactions and playback
 */
export const ANIMATION_COLORS = {
  playbackGlow: '#4A90E2', // Blue glow when chord is playing
  selectionStroke: '#4A90E2', // Blue stroke when selected
  hoverStroke: '#7F8C8D', // Gray stroke on hover
  dragOverlay: 'rgba(0, 0, 0, 0.15)', // Shadow during drag
} as const;

/**
 * Get scale degree color based on key mode
 */
export function getScaleDegreeColor(
  degree: number,
  mode: 'major' | 'minor'
): string {
  const colors = mode === 'major'
    ? SCALE_DEGREE_COLORS_MAJOR
    : SCALE_DEGREE_COLORS_MINOR;

  // Map degree number to Roman numeral
  const romanNumerals: { [key: number]: string } = {
    1: mode === 'major' ? 'I' : 'i',
    2: mode === 'major' ? 'ii' : 'ii',
    3: mode === 'major' ? 'iii' : 'III',
    4: mode === 'major' ? 'IV' : 'iv',
    5: mode === 'major' ? 'V' : 'V', // Both modes can have major V
    6: mode === 'major' ? 'vi' : 'VI',
    7: mode === 'major' ? 'vii' : 'VII',
  };

  const key = romanNumerals[degree] as keyof typeof colors;
  return colors[key];
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
 * Adjust color saturation (0-1 multiplier)
 */
export function adjustSaturation(hex: string, multiplier: number): string {
  // Convert hex to HSL, adjust saturation, convert back
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.s *= multiplier;
  hsl.s = Math.max(0, Math.min(1, hsl.s)); // Clamp to 0-1

  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Adjust color brightness (0-1 multiplier)
 */
export function adjustBrightness(hex: string, multiplier: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l *= multiplier;
  hsl.l = Math.max(0, Math.min(1, hsl.l)); // Clamp to 0-1

  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Add alpha channel to hex color
 */
export function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

// ============================================
// Color Conversion Utilities
// ============================================

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

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

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: r * 255,
    g: g * 255,
    b: b * 255,
  };
}
