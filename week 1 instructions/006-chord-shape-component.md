# Prompt 006: ChordShape Component

## Objective
Create the ChordShape component that renders all 7 chord types (I-vii) as SVG shapes with hand-drawn aesthetic, proper colors, extended harmony badges, and interactive states (hover, selected, playing).

## Context
The ChordShape is the primary visual element in Neume. Each shape represents a chord's function (tonic, subdominant, dominant) through its geometry, and its scale degree through color. The shapes must have a warm, hand-drawn quality while remaining precise and readable.

**Dependencies:**
- Requires Prompt 003 (Project Structure & Types)
- Requires Prompt 004 (Color System)
- Requires Prompt 005 (Canvas Component)

**Related Components:**
- Rendered as children of Canvas component
- Will be draggable (Week 3)
- Will show tooltips on hover (Week 9)

**Next Steps:** After this, shapes will be placed on canvas and made interactive

## Requirements

### Core Requirements
1. **Render 7 distinct shapes** (I, ii, iii, IV, V, vi, vii°)
2. **Apply correct colors** based on scale degree and mode
3. **Create hand-drawn wobble effect** (±0.5-2px variation)
4. **Support quality modifiers** (major, minor, diminished, augmented)
5. **Display extension badges** (7, add9, sus4, etc.)
6. **Handle chromatic chords** (shimmer overlay)
7. **Show interactive states** (hover, selected, playing)
8. **Scale with zoom** level
9. **Maintain accessibility** (ARIA labels, semantic markup)
10. **Optimize performance** (memoization, no unnecessary re-renders)

### Visual States
- **Default:** Normal appearance
- **Hover:** Slight scale increase (1.05x), subtle glow
- **Selected:** Blue stroke (3.5px), scale 1.03x
- **Playing:** Breathing pulse animation (1.0 → 1.12 → 1.0)
- **Chromatic:** Iridescent shimmer overlay

## Technical Constraints

- SVG-based rendering for crisp scaling
- 60px default size (from spec)
- Hand-drawn wobble: ±0.5px circles, ±1.5px polygons
- Stroke width: 2.5px (default), 3.5px (selected)
- All animations use spec easing curves
- TypeScript strict mode compliance

## Code Structure

### src/components/Canvas/ChordShape.tsx

```typescript
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Chord } from '@types';
import { getScaleDegreeColor, CHROMATIC_INDICATORS, UI_COLORS } from '@/styles/colors';
import styles from './ChordShape.module.css';

interface ChordShapeProps {
  chord: Chord;
  isSelected?: boolean;
  isPlaying?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  zoom?: number;
}

export const ChordShape: React.FC<ChordShapeProps> = React.memo(({
  chord,
  isSelected = false,
  isPlaying = false,
  onSelect,
  onHover,
  zoom = 1.0,
}) => {
  const size = chord.size * zoom;
  const baseColor = getScaleDegreeColor(chord.scaleDegree, chord.mode);
  
  // Get shape path based on scale degree
  const shapePath = useMemo(() => {
    return generateShapePath(chord.scaleDegree, size);
  }, [chord.scaleDegree, size]);

  // Determine stroke color and width
  const strokeColor = isSelected ? UI_COLORS.selectionStroke : 'none';
  const strokeWidth = isSelected ? 3.5 : 2.5;

  // Animation variants
  const variants = {
    default: {
      scale: 1.0,
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
    },
    hover: {
      scale: 1.05,
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
    },
    selected: {
      scale: 1.03,
      filter: 'drop-shadow(0 4px 8px rgba(74,144,226,0.3))',
    },
    playing: {
      scale: [1.0, 1.12, 1.0],
      filter: [
        'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        'drop-shadow(0 6px 12px rgba(74,144,226,0.4))',
        'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
      ],
    },
  };

  // Determine current state
  const currentState = isPlaying 
    ? 'playing' 
    : isSelected 
    ? 'selected' 
    : 'default';

  return (
    <motion.div
      className={styles.chordShapeContainer}
      style={{
        left: `${chord.position.x}px`,
        top: `${chord.position.y}px`,
      }}
      initial="default"
      animate={currentState}
      whileHover="hover"
      variants={variants}
      transition={{
        duration: isPlaying ? chord.duration : 0.3,
        ease: isPlaying ? [0.45, 0.05, 0.55, 0.95] : [0.4, 0.0, 0.2, 1],
        repeat: isPlaying ? Infinity : 0,
      }}
      onClick={onSelect}
      onMouseEnter={onHover}
      role="button"
      aria-label={`${chord.quality} chord on scale degree ${chord.scaleDegree}`}
      tabIndex={0}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Chromatic shimmer (if applicable) */}
        {chord.isChromatic && (
          <defs>
            <linearGradient id={`shimmer-${chord.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={CHROMATIC_INDICATORS.shimmerGradientStart} stopOpacity={CHROMATIC_INDICATORS.shimmerOpacity} />
              <stop offset="100%" stopColor={CHROMATIC_INDICATORS.shimmerGradientEnd} stopOpacity={CHROMATIC_INDICATORS.shimmerOpacity} />
            </linearGradient>
          </defs>
        )}

        {/* Main shape */}
        <path
          d={shapePath}
          fill={baseColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          className={styles.chordShape}
        />

        {/* Chromatic overlay */}
        {chord.isChromatic && (
          <>
            <path
              d={shapePath}
              fill={`url(#shimmer-${chord.id})`}
              className={styles.chromaticShimmer}
            />
            <path
              d={shapePath}
              fill="none"
              stroke={CHROMATIC_INDICATORS.edgeGlow}
              strokeWidth={1}
              opacity={CHROMATIC_INDICATORS.glowOpacity}
              filter={`blur(${CHROMATIC_INDICATORS.glowBlur}px)`}
            />
          </>
        )}
      </svg>

      {/* Extension badges */}
      {hasExtensions(chord.extensions) && (
        <div className={styles.badge}>
          {getBadgeText(chord.extensions)}
        </div>
      )}
    </motion.div>
  );
});

ChordShape.displayName = 'ChordShape';

/**
 * Generate SVG path for each shape type with hand-drawn wobble
 */
function generateShapePath(scaleDegree: number, size: number): string {
  const center = size / 2;
  const radius = (size - 10) / 2; // Leave 5px margin

  // Random wobble for hand-drawn feel
  const wobble = (base: number, amount: number) => base + (Math.random() - 0.5) * amount;

  switch (scaleDegree) {
    case 1: // I - Solid circle (Tonic)
      return generateWobblyCircle(center, center, radius);
    
    case 2: // ii - Rounded square (Supertonic, Subdominant function)
      return generateRoundedSquare(center, radius);
    
    case 3: // iii - Triangle (Mediant)
      return generateTriangle(center, radius);
    
    case 4: // IV - Solid square (Subdominant)
      return generateSquare(center, radius);
    
    case 5: // V - Pentagon (Dominant)
      return generatePentagon(center, radius);
    
    case 6: // vi - Dotted circle (Submediant, relative minor)
      return generateWobblyCircle(center, center, radius);
    
    case 7: // vii° - Outlined pentagon (Leading tone)
      return generatePentagon(center, radius);
    
    default:
      return generateWobblyCircle(center, center, radius);
  }
}

/**
 * Generate wobbly circle path
 */
function generateWobblyCircle(cx: number, cy: number, r: number): string {
  const points = 32; // More points = smoother circle
  const wobbleAmount = 0.5;
  
  let path = '';
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const wobbledR = r + (Math.random() - 0.5) * wobbleAmount;
    const x = cx + Math.cos(angle) * wobbledR;
    const y = cy + Math.sin(angle) * wobbledR;
    
    if (i === 0) {
      path += `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  }
  
  return path + ' Z';
}

/**
 * Generate square with wobble
 */
function generateSquare(center: number, radius: number): string {
  const wobble = 1.5;
  const half = radius * 0.8;
  
  const points = [
    [center - half + (Math.random() - 0.5) * wobble, center - half + (Math.random() - 0.5) * wobble],
    [center + half + (Math.random() - 0.5) * wobble, center - half + (Math.random() - 0.5) * wobble],
    [center + half + (Math.random() - 0.5) * wobble, center + half + (Math.random() - 0.5) * wobble],
    [center - half + (Math.random() - 0.5) * wobble, center + half + (Math.random() - 0.5) * wobble],
  ];
  
  return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]} L ${points[2][0]} ${points[2][1]} L ${points[3][0]} ${points[3][1]} Z`;
}

/**
 * Generate rounded square
 */
function generateRoundedSquare(center: number, radius: number): string {
  const half = radius * 0.8;
  const cornerRadius = 8;
  const wobble = 1.5;
  
  const w = (Math.random() - 0.5) * wobble;
  
  // Use SVG arc commands for rounded corners
  return `
    M ${center - half + cornerRadius + w} ${center - half + w}
    L ${center + half - cornerRadius + w} ${center - half + w}
    Q ${center + half + w} ${center - half + w} ${center + half + w} ${center - half + cornerRadius + w}
    L ${center + half + w} ${center + half - cornerRadius + w}
    Q ${center + half + w} ${center + half + w} ${center + half - cornerRadius + w} ${center + half + w}
    L ${center - half + cornerRadius + w} ${center + half + w}
    Q ${center - half + w} ${center + half + w} ${center - half + w} ${center + half - cornerRadius + w}
    L ${center - half + w} ${center - half + cornerRadius + w}
    Q ${center - half + w} ${center - half + w} ${center - half + cornerRadius + w} ${center - half + w}
    Z
  `;
}

/**
 * Generate triangle
 */
function generateTriangle(center: number, radius: number): string {
  const wobble = 1.5;
  const height = radius * 1.5;
  
  const points = [
    [center + (Math.random() - 0.5) * wobble, center - height * 0.6],
    [center + radius * 0.9 + (Math.random() - 0.5) * wobble, center + height * 0.4],
    [center - radius * 0.9 + (Math.random() - 0.5) * wobble, center + height * 0.4],
  ];
  
  return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]} L ${points[2][0]} ${points[2][1]} Z`;
}

/**
 * Generate pentagon (pointing right for forward motion)
 */
function generatePentagon(center: number, radius: number): string {
  const wobble = 1.5;
  const points = [];
  
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * 2 * Math.PI - Math.PI / 2; // Start at top, rotate for right-pointing
    const x = center + Math.cos(angle) * radius + (Math.random() - 0.5) * wobble;
    const y = center + Math.sin(angle) * radius + (Math.random() - 0.5) * wobble;
    points.push([x, y]);
  }
  
  return `M ${points[0][0]} ${points[0][1]} ${points.map(p => `L ${p[0]} ${p[1]}`).join(' ')} Z`;
}

/**
 * Check if chord has any extensions
 */
function hasExtensions(extensions: Chord['extensions']): boolean {
  return Object.values(extensions).some(val => val === true);
}

/**
 * Get badge text for extensions
 */
function getBadgeText(extensions: Chord['extensions']): string {
  if (extensions.add9) return '+9';
  if (extensions.add11) return '+11';
  if (extensions.add13) return '+13';
  if (extensions.sus2) return 'sus2';
  if (extensions.sus4) return 'sus4';
  if (extensions.sharp11) return '#11';
  if (extensions.flat9) return '♭9';
  if (extensions.sharp9) return '#9';
  return '7';
}
```

### src/components/Canvas/ChordShape.module.css

```css
.chordShapeContainer {
  position: absolute;
  cursor: pointer;
  user-select: none;
}

.chordShapeContainer:focus-visible {
  outline: 2px solid var(--primary-action);
  outline-offset: 4px;
  border-radius: 4px;
}

.chordShape {
  transition: stroke var(--duration-fast) var(--ease-apple-smooth);
}

.chromaticShimmer {
  pointer-events: none;
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--border-medium);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: 500;
  font-family: var(--font-notation);
  color: var(--text-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  pointer-events: none;
}
```

## Example Usage

```typescript
import { ChordShape } from '@/components/Canvas/ChordShape';
import { Chord } from '@types';

const exampleChord: Chord = {
  id: '123',
  scaleDegree: 1,
  quality: 'major',
  extensions: { add9: true },
  key: 'C',
  mode: 'major',
  isChromatic: false,
  voices: {
    soprano: 'E4',
    alto: 'C4',
    tenor: 'G3',
    bass: 'C3',
  },
  startBeat: 0,
  duration: 4,
  position: { x: 100, y: 200 },
  size: 60,
  selected: false,
  playing: false,
  source: 'user',
  createdAt: new Date().toISOString(),
};

// In Canvas component
<ChordShape
  chord={exampleChord}
  isSelected={false}
  isPlaying={false}
  onSelect={() => console.log('Selected')}
  zoom={1.0}
/>
```

## Quality Criteria

- [ ] All 7 shapes render distinctly
- [ ] Colors match spec exactly
- [ ] Hand-drawn wobble is visible but subtle
- [ ] Extension badges display correctly
- [ ] Chromatic shimmer appears on borrowed chords
- [ ] Hover state works (scale + glow)
- [ ] Selected state shows blue stroke
- [ ] Playing animation pulses smoothly
- [ ] Performance: 50+ shapes render at 60fps
- [ ] Accessibility: ARIA labels present, keyboard navigable

## Implementation Notes

1. **React.memo:** The component is memoized to prevent unnecessary re-renders when parent updates.

2. **Hand-Drawn Wobble:** Random variation is applied to path points to create organic, hand-drawn feel. The randomness is consistent within each render.

3. **Framer Motion:** Used for smooth animations (hover, selected, playing states).

4. **SVG Paths:** Shapes are generated as SVG paths for crisp scaling and precise rendering.

5. **Badge Positioning:** Extension badges use absolute positioning to sit in top-right corner.

6. **Chromatic Shimmer:** Uses SVG gradients and filters for iridescent effect.

## Accessibility

- ARIA labels describe chord function
- Tab-navigable (tabIndex={0})
- Focus indicators visible
- Click and keyboard activation supported

## Performance Optimization

- Memoized component (React.memo)
- useMemo for shape path generation
- GPU-accelerated animations (scale, filter)
- No layout thrashing

## Testing Considerations

Test each shape type:
1. I (circle) - solid, tonic gold
2. ii (rounded square) - sage green
3. iii (triangle) - dusty rose
4. IV (square) - periwinkle blue
5. V (pentagon) - terracotta
6. vi (dotted circle) - purple
7. vii° (outlined pentagon) - gray

Test states:
- Default rendering
- Hover (scale + glow)
- Selected (blue stroke)
- Playing (pulse animation)
- Chromatic (shimmer overlay)

Test extensions:
- add9 badge shows "+9"
- sus4 badge shows "sus4"
- Multiple extensions show highest priority

## Next Steps

After ChordShape is complete:
1. Add watercolor background (Prompt 007)
2. Create integration demo (Prompt 008)
3. Test complete visual system

---

**Output Format:** Provide complete ChordShape component with all shape generators, styling, and proper TypeScript types. Include helper functions for badge text and extension checking.
