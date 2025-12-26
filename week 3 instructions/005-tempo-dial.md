# Prompt 005: Tempo Dial Control

## Objective
Create a beautiful, interactive tempo dial inspired by speedometers and analog controls. Users can adjust playback tempo from 60-180 BPM with smooth visual feedback and precise control.

## Context
Playback is working (Prompt 003) but tempo is fixed at 120 BPM. A visual tempo control makes it easy to adjust playback speed with tactile, satisfying interaction.

**Dependencies:**
- Requires Week 3 Prompts 001-004 (audio engine through reverb)
- PlaybackSystem (set tempo method)

**Related Components:**
- PlaybackSystem (Tone.Transport.bpm)
- Bottom control bar (placement)

**Next Steps:** Integration & polish (Prompt 006) will complete Week 3

## Requirements

### Core Requirements
1. **Dial visualization** - 180° arc (half-circle speedometer)
2. **Range:** 60-180 BPM
3. **Current tempo** displayed in center (large, readable)
4. **Needle indicator** showing current BPM on arc
5. **Click-drag to rotate** OR click arc to jump
6. **Smooth easing** when released (momentum feel)
7. **Tick marks** every 10 BPM
8. **Hand-drawn aesthetic** matching design system
9. **Keyboard control** (arrow keys for fine-tuning)
10. **Immediate feedback** (updates Tone.Transport.bpm)

### Visual Design
- Arc: 180° semicircle
- Outer radius: 60px
- Stroke: 3px, hand-drawn style
- Needle: Hand-drawn line from center
- Tick marks: Small radial lines
- Colors: Primary blue for needle, gray for arc

### Interaction Feel
- Smooth rotation during drag
- Momentum easing on release (200-300ms)
- Haptic-like feedback (visual pulse on change)
- Precise control (1 BPM increments)

## Technical Constraints

- SVG for scalable graphics
- Transform-based rotation (GPU-accelerated)
- Real-time tempo updates (no lag)
- TypeScript strict mode
- Accessible (keyboard + screen reader)

## Code Structure

### src/components/Controls/TempoDial.tsx

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { playbackSystem } from '@/audio/PlaybackSystem';
import styles from './TempoDial.module.css';

interface TempoDialProps {
  minTempo?: number;
  maxTempo?: number;
  defaultTempo?: number;
  onChange?: (tempo: number) => void;
}

export const TempoDial: React.FC<TempoDialProps> = ({
  minTempo = 60,
  maxTempo = 180,
  defaultTempo = 120,
  onChange,
}) => {
  const [tempo, setTempo] = useState(defaultTempo);
  const [isDragging, setIsDragging] = useState(false);
  const dialRef = useRef<SVGSVGElement>(null);

  // Motion values for smooth rotation
  const rotation = useMotionValue(tempoToRotation(defaultTempo, minTempo, maxTempo));

  // Update tempo when rotation changes
  useEffect(() => {
    const unsubscribe = rotation.on('change', (value) => {
      const newTempo = rotationToTempo(value, minTempo, maxTempo);
      setTempo(newTempo);
      playbackSystem.setTempo(newTempo);
      onChange?.(newTempo);
    });

    return unsubscribe;
  }, [rotation, minTempo, maxTempo, onChange]);

  // Handle click-drag rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    const dial = dialRef.current;
    if (!dial) return;

    const rect = dial.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const handleMove = (e: PointerEvent) => {
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      
      // Convert to 0-180 range (semicircle)
      const normalizedAngle = ((angle + 90) % 360 + 360) % 360;
      
      if (normalizedAngle <= 180) {
        rotation.set(normalizedAngle);
      }
    };

    const handleUp = () => {
      setIsDragging(false);
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
  };

  // Handle arc click (jump to position)
  const handleArcClick = (e: React.MouseEvent<SVGPathElement>) => {
    const dial = dialRef.current;
    if (!dial) return;

    const rect = dial.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    const normalizedAngle = ((angle + 90) % 360 + 360) % 360;
    
    if (normalizedAngle <= 180) {
      // Animate to new position
      rotation.set(normalizedAngle, {
        transition: { duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }
      } as any);
    }
  };

  // Keyboard control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      let delta = 0;
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        delta = 1;
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        delta = -1;
      }

      if (delta !== 0) {
        e.preventDefault();
        const newTempo = Math.max(minTempo, Math.min(maxTempo, tempo + delta));
        const newRotation = tempoToRotation(newTempo, minTempo, maxTempo);
        rotation.set(newRotation);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tempo, minTempo, maxTempo, rotation]);

  return (
    <div className={styles.tempoDialContainer}>
      <svg
        ref={dialRef}
        width="140"
        height="100"
        viewBox="0 0 140 100"
        className={styles.dial}
      >
        {/* Background arc */}
        <path
          d="M 20 80 A 50 50 0 0 1 120 80"
          fill="none"
          stroke="#E0E0E0"
          strokeWidth="3"
          strokeLinecap="round"
          onClick={handleArcClick}
          className={styles.arc}
        />

        {/* Tick marks */}
        {generateTickMarks(minTempo, maxTempo).map((tick, i) => (
          <line
            key={i}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="#BDC3C7"
            strokeWidth="1.5"
          />
        ))}

        {/* Needle */}
        <motion.line
          x1="70"
          y1="80"
          x2="70"
          y2="35"
          stroke="#4A90E2"
          strokeWidth="3"
          strokeLinecap="round"
          style={{
            originX: '70px',
            originY: '80px',
            rotate: useTransform(rotation, [0, 180], [-90, 90]),
          }}
          onPointerDown={handlePointerDown}
          className={styles.needle}
        />

        {/* Center dot */}
        <circle
          cx="70"
          cy="80"
          r="6"
          fill="#4A90E2"
        />
      </svg>

      {/* Tempo display */}
      <div className={styles.tempoDisplay}>
        <span className={styles.tempoValue}>{tempo}</span>
        <span className={styles.tempoLabel}>BPM</span>
      </div>
    </div>
  );
};

/**
 * Convert tempo to rotation angle (0-180)
 */
function tempoToRotation(
  tempo: number,
  minTempo: number,
  maxTempo: number
): number {
  const normalized = (tempo - minTempo) / (maxTempo - minTempo);
  return normalized * 180;
}

/**
 * Convert rotation angle to tempo
 */
function rotationToTempo(
  rotation: number,
  minTempo: number,
  maxTempo: number
): number {
  const normalized = rotation / 180;
  const tempo = minTempo + normalized * (maxTempo - minTempo);
  return Math.round(tempo);
}

/**
 * Generate tick mark positions
 */
function generateTickMarks(minTempo: number, maxTempo: number) {
  const ticks = [];
  const centerX = 70;
  const centerY = 80;
  const outerRadius = 50;
  const innerRadius = 44;

  for (let tempo = minTempo; tempo <= maxTempo; tempo += 10) {
    const rotation = tempoToRotation(tempo, minTempo, maxTempo);
    const angleRad = ((rotation - 90) * Math.PI) / 180;

    const x1 = centerX + outerRadius * Math.cos(angleRad);
    const y1 = centerY + outerRadius * Math.sin(angleRad);
    const x2 = centerX + innerRadius * Math.cos(angleRad);
    const y2 = centerY + innerRadius * Math.sin(angleRad);

    ticks.push({ x1, y1, x2, y2 });
  }

  return ticks;
}
```

### src/components/Controls/TempoDial.module.css

```css
.tempoDialContainer {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
}

.dial {
  cursor: pointer;
}

.arc {
  cursor: pointer;
  transition: stroke var(--duration-fast);
}

.arc:hover {
  stroke: #BDC3C7;
}

.needle {
  cursor: grab;
  filter: drop-shadow(0 2px 4px rgba(74, 144, 226, 0.3));
}

.needle:active {
  cursor: grabbing;
}

.tempoDisplay {
  margin-top: -10px;
  text-align: center;
}

.tempoValue {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: var(--font-notation);
}

.tempoLabel {
  display: block;
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
}
```

### Update src/components/Layout/BottomControls.tsx

Add tempo dial:

```typescript
import { TempoDial } from '@/components/Controls/TempoDial';

export const BottomControls: React.FC<BottomControlsProps> = ({
  // ... existing props
}) => {
  return (
    <footer className={styles.controls}>
      {/* Left: Stats (existing) */}
      <div className={styles.left}>
        {/* ... */}
      </div>

      {/* Center: Tempo Dial */}
      <div className={styles.center}>
        <TempoDial />
      </div>

      {/* Right: Play button */}
      <div className={styles.right}>
        <PlayButton />
      </div>
    </footer>
  );
};
```

## Quality Criteria

- [ ] TempoDial compiles without errors
- [ ] Dial displays correctly (semicircle)
- [ ] Current tempo shown in center
- [ ] Click-drag rotates needle smoothly
- [ ] Click arc jumps to position
- [ ] Tempo updates immediately (no lag)
- [ ] Range 60-180 BPM enforced
- [ ] Tick marks visible every 10 BPM
- [ ] Arrow keys adjust tempo (±1 BPM)
- [ ] Smooth easing on release
- [ ] Hand-drawn aesthetic matches design
- [ ] Accessible (keyboard control)

## Implementation Notes

1. **SVG Arc:** Path element with `A` (arc) command creates semicircle.

2. **Rotation Transform:** Framer Motion's useTransform maps rotation (0-180) to needle angle (-90 to +90).

3. **Drag Interaction:** Calculates angle from mouse position relative to dial center.

4. **Click to Jump:** Clicking arc sets rotation with smooth animation.

5. **Keyboard:** Arrow keys increment/decrement by 1 BPM.

## Accessibility

- Dial has role="slider"
- Current value announced to screen readers
- Keyboard accessible (arrow keys)
- Visual focus indicator
- aria-label describes control

## Performance

- GPU-accelerated transforms (rotation)
- Efficient SVG rendering
- No layout thrashing
- Smooth 60fps interaction

## Testing Scenarios

1. **Initial state:** Dial shows 120 BPM, needle at center
2. **Drag left:** Tempo decreases to 60 BPM minimum
3. **Drag right:** Tempo increases to 180 BPM maximum
4. **Click arc:** Needle jumps to clicked position
5. **Arrow keys:** Up increases, down decreases
6. **Playback:** Changing tempo affects playback speed immediately

## Visual Enhancement (Optional)

Add momentum easing:

```typescript
const handleUp = () => {
  setIsDragging(false);
  
  // Add slight momentum
  const velocity = calculateVelocity(); // Based on last few drag positions
  
  if (Math.abs(velocity) > 0.1) {
    rotation.set(rotation.get() + velocity * 10, {
      transition: { duration: 0.3, ease: 'easeOut' }
    } as any);
  }
  
  // ... cleanup
};
```

## Next Steps

After tempo dial is working:
1. Final integration & polish (Prompt 006)
2. Complete Week 3
3. Test entire audio system

---

**Output Format:** Provide complete TempoDial component with SVG visualization, drag interaction, click-to-jump, keyboard control, and smooth animations. Verify tempo changes affect playback immediately and dial feels responsive and satisfying to use.
