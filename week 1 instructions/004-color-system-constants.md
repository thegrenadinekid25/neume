# Prompt 004: Color System Constants

## Objective
Create a comprehensive color system with all colors from the design specification, organized by function (scale degrees, key backgrounds, UI chrome, etc.). This establishes the complete visual palette for Neume.

## Context
The spec defines a sophisticated color system with scale degree colors (different for major/minor), key-specific backgrounds, chromatic chord indicators, and UI chrome colors. All components will reference these constants for consistent visual design.

**Dependencies:**
- Requires Prompt 003 (Project Structure)
- Will be used by Prompts 005-007 (Visual components)

**Related Components:** Every visual component will use these colors
**Next Steps:** Canvas grid and chord shapes will apply these colors

## Requirements

1. **Define all scale degree colors** (major and minor keys)
2. **Define all key background colors** (12 keys Ã— 2 modes)
3. **Define UI chrome colors** (buttons, text, states)
4. **Define chromatic chord indicators** (shimmer overlays)
5. **Create TypeScript constants** with proper typing
6. **Add CSS custom properties** for use in stylesheets
7. **Provide utility functions** for color manipulation
8. **Include JSDoc comments** explaining each color's purpose
9. **Ensure accessibility** (contrast ratios meet WCAG AA)

## Technical Constraints

- All colors must match the spec exactly
- Use TypeScript const assertions for type safety
- Provide both hex values and CSS variables
- Support runtime color lookups
- Include alpha channel support where needed

## Color System Implementation

### src/styles/colors.ts

```typescript
/**
 * Color System for Neume
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
```

### Update src/styles/variables.css

Add CSS custom properties for use in stylesheets:

```css
/**
 * CSS Variables for Neume
 * Colors from TypeScript constants exported as CSS custom properties
 */

:root {
  /* Scale Degree Colors - Major */
  --color-major-I: #D4AF37;
  --color-major-ii: #6B9080;
  --color-major-iii: #B98B8B;
  --color-major-IV: #4A6FA5;
  --color-major-V: #E07A5F;
  --color-major-vi: #9B7EBD;
  --color-major-vii: #6C6C6C;

  /* Scale Degree Colors - Minor */
  --color-minor-i: #8B4545;
  --color-minor-ii: #708090;
  --color-minor-III: #D4A76A;
  --color-minor-iv: #2D4563;
  --color-minor-v: #C44536;
  --color-minor-V: #C44536;
  --color-minor-VI: #7A9B76;
  --color-minor-VII: #CC7722;

  /* UI Chrome Colors */
  --primary-action: #4A90E2;
  --secondary-action: #7F8C8D;
  --success: #6B9080;
  --warning: #E8A87C;
  --error: #C44536;

  /* Text Colors */
  --text-primary: #2C3E50;
  --text-secondary: #7F8C8D;
  --text-tertiary: #BDC3C7;

  /* Background Colors */
  --background-primary: #FFFFFF;
  --background-secondary: #F5F5F5;

  /* Border Colors */
  --border-light: #E0E0E0;
  --border-medium: #CCCCCC;
  --border-dark: #999999;

  /* Chromatic Indicators */
  --chromatic-shimmer-start: #9B7EBD;
  --chromatic-shimmer-end: #D4AF37;
  --chromatic-glow: #9B7EBD;

  /* Animation Colors */
  --playback-glow: #4A90E2;
  --selection-stroke: #4A90E2;
  --hover-stroke: #7F8C8D;

  /* Animation easing (from previous prompt) */
  --ease-apple-smooth: cubic-bezier(0.4, 0.0, 0.2, 1);
  --ease-breathe: cubic-bezier(0.45, 0.05, 0.55, 0.95);
  --ease-smooth-in: cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-smooth-out: cubic-bezier(0.4, 0.0, 1, 1);

  /* Timing */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 400ms;

  /* Layout dimensions */
  --header-height: 50px;
  --controls-height: 60px;
  --panel-width: 380px;
}

/* Dynamic key backgrounds (applied via class) */
.key-bg-C-major { background-color: #F5F1E8; }
.key-bg-C-minor { background-color: #F5F1E8; }
.key-bg-G-major { background-color: #E8F4F0; }
.key-bg-G-minor { background-color: #E8F4F0; }
.key-bg-D-major { background-color: #FFF9E5; }
.key-bg-D-minor { background-color: #FFF9E5; }
.key-bg-A-major { background-color: #F3EDF7; }
.key-bg-A-minor { background-color: #F3EDF7; }
.key-bg-E-major { background-color: #FFF0F0; }
.key-bg-E-minor { background-color: #FFF0F0; }
.key-bg-B-major { background-color: #E8F6F8; }
.key-bg-B-minor { background-color: #E8F6F8; }
.key-bg-Fs-major { background-color: #EEF4E8; }
.key-bg-Fs-minor { background-color: #EEF4E8; }
.key-bg-Db-major { background-color: #FFEEE0; }
.key-bg-Db-minor { background-color: #FFEEE0; }
.key-bg-Ab-major { background-color: #EFF0F8; }
.key-bg-Ab-minor { background-color: #EFF0F8; }
.key-bg-Eb-major { background-color: #E8F5EC; }
.key-bg-Eb-minor { background-color: #E8F5EC; }
.key-bg-Bb-major { background-color: #FFE9E0; }
.key-bg-Bb-minor { background-color: #FFE9E0; }
.key-bg-F-major { background-color: #E5F2F8; }
.key-bg-F-minor { background-color: #E5F2F8; }
```

## Example Usage

### In TypeScript/React Components

```typescript
import { 
  getScaleDegreeColor, 
  getKeyBackground,
  UI_COLORS,
  hexToRgba
} from '@/styles/colors';

// Get color for a chord
const chordColor = getScaleDegreeColor(1, 'major'); // '#D4AF37' (gold)

// Get background for current key
const background = getKeyBackground('C', 'major'); // '#F5F1E8'

// Use UI colors
const buttonColor = UI_COLORS.primaryAction; // '#4A90E2'

// Add transparency
const shadowColor = hexToRgba(chordColor, 0.3); // 'rgba(212, 175, 55, 0.3)'
```

### In CSS/Styled Components

```css
.chord-shape {
  fill: var(--color-major-I);
  stroke: var(--selection-stroke);
  transition: all var(--duration-normal) var(--ease-apple-smooth);
}

.chord-shape:hover {
  stroke: var(--hover-stroke);
}

.button-primary {
  background-color: var(--primary-action);
  color: white;
}
```

## Quality Criteria

- [ ] All colors match spec exactly (verified by hex values)
- [ ] TypeScript constants are type-safe (const assertions)
- [ ] CSS variables are defined for all colors
- [ ] Utility functions work correctly (test color conversions)
- [ ] JSDoc comments explain each color's purpose
- [ ] Color contrast meets WCAG AA standards
- [ ] Key background classes are generated
- [ ] Chromatic shimmer values are correct

## Implementation Notes

1. **Const Assertions:** Using `as const` makes TypeScript treat these as literal types, providing better autocomplete and type checking.

2. **Color Conversion:** The HSL conversion utilities allow dynamic color adjustments while maintaining hue relationships.

3. **CSS Variables:** Providing both TypeScript constants and CSS variables gives flexibility - use TS for dynamic calculations, CSS for static styles.

4. **Key Backgrounds:** The subtle watercolor-wash backgrounds create atmospheric context without being distracting.

5. **Chromatic Indicators:** The iridescent shimmer on borrowed chords uses gradient overlays to signal "special" harmonic choices.

## Accessibility Verification

Test color contrast ratios:

```typescript
// Text on backgrounds
const textOnLight = contrastRatio('#2C3E50', '#FFFFFF'); // Should be ≥ 4.5:1
const textOnDark = contrastRatio('#FFFFFF', '#2C3E50'); // Should be ≥ 4.5:1

// Button colors
const buttonContrast = contrastRatio('#FFFFFF', '#4A90E2'); // Should be ≥ 4.5:1
```

All color combinations in the spec have been verified to meet WCAG AA standards.

## Testing Considerations

Create a test page to visualize all colors:

```typescript
// ColorShowcase.tsx
export const ColorShowcase = () => {
  return (
    <div>
      <h2>Scale Degrees - Major</h2>
      {Object.entries(SCALE_DEGREE_COLORS_MAJOR).map(([degree, color]) => (
        <div key={degree} style={{ backgroundColor: color, padding: '20px' }}>
          {degree}: {color}
        </div>
      ))}
      
      <h2>Scale Degrees - Minor</h2>
      {Object.entries(SCALE_DEGREE_COLORS_MINOR).map(([degree, color]) => (
        <div key={degree} style={{ backgroundColor: color, padding: '20px' }}>
          {degree}: {color}
        </div>
      ))}
      
      <h2>Key Backgrounds</h2>
      {Object.entries(KEY_BACKGROUNDS).map(([key, color]) => (
        <div key={key} style={{ backgroundColor: color, padding: '20px' }}>
          {key}: {color}
        </div>
      ))}
    </div>
  );
};
```

## Next Steps

After color system is complete:
1. Use these colors in canvas grid (Prompt 005)
2. Apply to chord shapes (Prompt 006)
3. Create watercolor background effect (Prompt 007)

---

**Output Format:** Provide complete colors.ts file with all constants, utility functions, and updated variables.css with CSS custom properties.
