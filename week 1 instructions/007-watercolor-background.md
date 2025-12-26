# Prompt 007: Watercolor Background Effect

## Objective
Create a subtle watercolor wash background effect for the canvas that gives Harmonic Canvas its warm, organic aesthetic. The effect should be atmospheric without being distracting, with slight texture and luminosity variance.

## Context
The spec calls for watercolor wash backgrounds that vary by key, with paper grain texture and subtle luminosity variance (±5%). This creates an artistic, hand-crafted feel that distinguishes Harmonic Canvas from typical digital music tools.

**Dependencies:**
- Requires Prompt 004 (Color System - key backgrounds)
- Requires Prompt 005 (Canvas Component)

**Related Components:**
- Applied to Canvas component background
- Works with key-specific colors

**Next Steps:** Complete Week 1 integration demo

## Requirements

1. **Generate watercolor texture** programmatically or use texture image
2. **Apply paper grain** overlay (30-40% opacity)
3. **Add luminosity variance** (±5% random brightness variation)
4. **Support all 12 keys Ã— 2 modes** (24 backgrounds)
5. **Smooth transitions** when key changes
6. **Lightweight implementation** (<100KB total assets)
7. **No performance impact** on canvas interactions
8. **CSS-based** where possible for best performance

## Technical Constraints

- Texture overlay should be subtle (not overwhelming)
- Must work with all key background colors from spec
- GPU-accelerated rendering (CSS filters, transforms)
- Responsive to canvas resize
- No flashing or jarring transitions

## Implementation Approach

### Option 1: CSS-Based (Recommended for Phase 1)

Use CSS gradients and filters to create watercolor-like effect.

### src/components/Canvas/WatercolorBackground.tsx

```typescript
import React, { useMemo } from 'react';
import { getKeyBackground } from '@/styles/colors';
import styles from './WatercolorBackground.module.css';

interface WatercolorBackgroundProps {
  currentKey: string;
  currentMode: 'major' | 'minor';
}

export const WatercolorBackground: React.FC<WatercolorBackgroundProps> = ({
  currentKey,
  currentMode,
}) => {
  const baseColor = getKeyBackground(currentKey, currentMode);
  
  // Generate subtle color variations (±5% luminosity)
  const colorVariants = useMemo(() => {
    return generateColorVariants(baseColor);
  }, [baseColor]);

  return (
    <div className={styles.watercolorBackground}>
      {/* Base layer with key color */}
      <div 
        className={styles.baseLayer}
        style={{ backgroundColor: baseColor }}
      />
      
      {/* Watercolor wash layers */}
      <div 
        className={styles.washLayer1}
        style={{ 
          background: createWashGradient(colorVariants[0], colorVariants[1]) 
        }}
      />
      <div 
        className={styles.washLayer2}
        style={{ 
          background: createWashGradient(colorVariants[2], colorVariants[3]) 
        }}
      />
      
      {/* Paper grain texture */}
      <div className={styles.grainLayer} />
    </div>
  );
};

/**
 * Generate color variants with ±5% luminosity variation
 */
function generateColorVariants(baseHex: string): string[] {
  const rgb = hexToRgb(baseHex);
  if (!rgb) return [baseHex, baseHex, baseHex, baseHex];
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  // Create 4 variants with different luminosity
  const variants = [
    adjustLuminosity(hsl, -0.05), // 5% darker
    adjustLuminosity(hsl, 0.02),  // 2% lighter
    adjustLuminosity(hsl, -0.03), // 3% darker
    adjustLuminosity(hsl, 0.05),  // 5% lighter
  ];
  
  return variants.map(hslToHex);
}

/**
 * Create radial gradient for watercolor wash
 */
function createWashGradient(color1: string, color2: string): string {
  return `radial-gradient(
    ellipse at ${Math.random() * 100}% ${Math.random() * 100}%,
    ${color1} 0%,
    ${color2} 50%,
    transparent 100%
  )`;
}

/**
 * Adjust HSL luminosity
 */
function adjustLuminosity(
  hsl: { h: number; s: number; l: number }, 
  delta: number
): { h: number; s: number; l: number } {
  return {
    h: hsl.h,
    s: hsl.s,
    l: Math.max(0, Math.min(1, hsl.l + delta)),
  };
}

/**
 * Convert HSL to hex
 */
function hslToHex(hsl: { h: number; s: number; l: number }): string {
  const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(Math.round(rgb.r), Math.round(rgb.g), Math.round(rgb.b));
}

// Color conversion utilities (reuse from colors.ts)
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

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
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
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return { r: r * 255, g: g * 255, b: b * 255 };
}
```

### src/components/Canvas/WatercolorBackground.module.css

```css
.watercolorBackground {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.baseLayer {
  position: absolute;
  width: 100%;
  height: 100%;
  transition: background-color var(--duration-slow) var(--ease-apple-smooth);
}

.washLayer1 {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.3;
  mix-blend-mode: multiply;
  transition: background var(--duration-slow) var(--ease-apple-smooth);
}

.washLayer2 {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.2;
  mix-blend-mode: soft-light;
  transition: background var(--duration-slow) var(--ease-apple-smooth);
}

.grainLayer {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.35;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /></filter><rect width="100%" height="100%" filter="url(%23noise)" opacity="0.4"/></svg>');
  background-repeat: repeat;
  background-size: 300px 300px;
  pointer-events: none;
}
```

### Integration with Canvas

Update `Canvas.tsx`:

```typescript
import { WatercolorBackground } from './WatercolorBackground';

export const Canvas: React.FC<CanvasProps> = ({ /* ... */ }) => {
  return (
    <div className={styles.canvasContainer}>
      <TimelineRuler /* ... */ />
      
      <div className={styles.canvas}>
        {/* Add watercolor background */}
        <WatercolorBackground
          currentKey={currentKey}
          currentMode={currentMode}
        />
        
        {/* Rest of canvas content */}
        <Grid /* ... */ />
        {/* ... */}
      </div>
    </div>
  );
};
```

## Option 2: SVG Filter-Based (Advanced)

For more sophisticated effect:

```typescript
export const WatercolorSVGFilter: React.FC = () => {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <filter id="watercolor-filter" x="-50%" y="-50%" width="200%" height="200%">
          {/* Turbulence for organic texture */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02"
            numOctaves="3"
            seed="2"
            result="turbulence"
          />
          
          {/* Displacement for wavy edges */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale="10"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displacement"
          />
          
          {/* Blur for soft edges */}
          <feGaussianBlur in="displacement" stdDeviation="2" result="blur" />
          
          {/* Color matrix for saturation */}
          <feColorMatrix
            in="blur"
            type="saturate"
            values="1.2"
            result="saturate"
          />
          
          {/* Composite */}
          <feComposite in="saturate" in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
    </svg>
  );
};
```

Apply to canvas:

```css
.canvas {
  filter: url(#watercolor-filter);
}
```

## Quality Criteria

- [ ] Background has subtle texture (not flat)
- [ ] Paper grain is visible but not distracting
- [ ] Luminosity variance creates organic feel
- [ ] Smooth transitions when key changes (400ms)
- [ ] No performance impact (60fps maintained)
- [ ] Works with all 24 key/mode combinations
- [ ] Texture doesn't interfere with chord shapes
- [ ] Looks good at different zoom levels

## Implementation Notes

1. **CSS vs SVG:** Start with CSS approach for Phase 1 (simpler, more performant). SVG filters can be added in Phase 2 for more sophistication.

2. **Blend Modes:** Using `mix-blend-mode` creates natural color blending similar to watercolor paints.

3. **Grain Texture:** SVG filter with `feTurbulence` creates procedural noise that looks like paper grain.

4. **Color Variants:** Random luminosity variation (±5%) creates the "not quite uniform" quality of watercolor wash.

5. **Transitions:** 400ms transitions when key changes create smooth, organic color shifts.

6. **Performance:** All layers use GPU-accelerated properties (opacity, background, filter) for smooth rendering.

## Accessibility

- No accessibility concerns (purely decorative)
- Does not interfere with screen readers
- Does not reduce color contrast of functional elements

## Performance Considerations

- **CSS-based approach:** ~0ms render time, GPU-accelerated
- **SVG filter approach:** ~1-2ms per frame, still acceptable
- **Memory:** <1MB for all assets
- **Paint performance:** No layout thrashing, isolated to background layer

## Testing Considerations

Visual tests across keys:
1. **C major** - Soft warm beige background
2. **G major** - Pale blue-green background
3. **D minor** - Gentle cream-yellow background
4. **All 24 combinations** - Verify distinct but subtle differences

Transition tests:
1. Change key from C major to G major
2. Verify smooth 400ms fade
3. No jarring color shifts

Performance tests:
1. 50+ chord shapes on canvas
2. Verify background doesn't impact frame rate
3. Zoom in/out - verify texture scales appropriately

## Alternative: Image-Based Texture

If procedural approach doesn't achieve desired effect:

1. **Create watercolor texture images** (one per key, 2000x600px)
2. **Optimize with TinyPNG** or similar (<50KB per image)
3. **Lazy load** textures as needed
4. **Cache** in browser

```typescript
const textureUrl = `/textures/watercolor-${currentKey}-${currentMode}.png`;

<div 
  className={styles.textureLayer}
  style={{ 
    backgroundImage: `url(${textureUrl})`,
    opacity: 0.4
  }}
/>
```

## Next Steps

After watercolor background is complete:
1. Create integration demo (Prompt 008)
2. Test complete Week 1 visual system
3. Prepare for Week 2 (interactions)

---

**Output Format:** Provide complete WatercolorBackground component with CSS-based approach, including all color conversion utilities and smooth transitions between keys.
