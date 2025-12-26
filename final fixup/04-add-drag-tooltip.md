# Add Drag Behavior Tooltip to Chords

## Problem
The QA report noted: "Try to drag chord to new position → Chord creates connections instead of moving." It's unclear whether this is a bug or intended behavior. Users may be confused about how to move chords vs. create connections.

## Expected Behavior
Add a tooltip that clarifies the drag behavior so users understand what will happen when they drag a chord.

## Decision Required

**Choose one approach:**

### Option A: Drag to Move (Recommended)
- Normal drag = move chord
- Alt+Drag = create connection
- Tooltip: "Drag to move • Alt+Drag to connect"

### Option B: Current Behavior (If Intentional)
- Drag = create connection
- Some other method to move (click+hold?)
- Tooltip: "Drag to connect chords"

### Option C: Toggle Mode
- Mode button: "Move Mode" / "Connect Mode"
- Tooltip changes based on mode

**For this prompt, we'll assume Option A (most intuitive).**

---

## Files to Modify

### Primary File: Chord Shape Component
Location: `src/components/Canvas/ChordShape.tsx`

### Secondary File: Tooltip Component (if needed)
Location: `src/components/UI/Tooltip.tsx`

---

## Solution

### Step 1: Add Tooltip Component

Create a reusable tooltip if it doesn't exist:

```typescript
// src/components/UI/Tooltip.tsx

import { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  delay?: number;
}

export const Tooltip = ({ content, children, delay = 500 }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  
  const showTooltip = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };
  
  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsVisible(false);
  };
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded shadow-lg whitespace-nowrap z-50">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};
```

### Step 2: Add Tooltip to Chord Shape

```typescript
// src/components/Canvas/ChordShape.tsx

import { Tooltip } from '@/components/UI/Tooltip';

export const ChordShape = ({ chord, onDrag, onConnect }: ChordShapeProps) => {
  const handleDragStart = (e: React.DragEvent) => {
    // Check if Alt key is pressed
    if (e.altKey) {
      // Connection mode
      e.dataTransfer.effectAllowed = 'link';
      onConnect?.(chord.id);
    } else {
      // Move mode (default)
      e.dataTransfer.effectAllowed = 'move';
      onDrag?.(chord.id);
    }
  };
  
  return (
    <Tooltip content="Drag to move • Alt+Drag to connect">
      <div
        draggable
        onDragStart={handleDragStart}
        className="chord-shape"
      >
        {/* Chord SVG */}
      </div>
    </Tooltip>
  );
};
```

### Step 3: Update Drag Handler Logic

Ensure the drag handler respects Alt key:

```typescript
// In drag handler (likely in Canvas.tsx or useDragDrop.ts)

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  
  const chordId = e.dataTransfer.getData('chordId');
  const newPosition = {
    x: e.clientX,
    y: e.clientY
  };
  
  if (e.altKey || e.dataTransfer.effectAllowed === 'link') {
    // Create connection
    createConnection(chordId, targetChordId);
  } else {
    // Move chord
    updateChordPosition(chordId, newPosition);
  }
};
```

---

## Alternative: Simple Hover Tooltip

If you just want to clarify current behavior without changing logic:

```typescript
// Just add the tooltip wrapper
<Tooltip content="Drag to create connections">
  <ChordShape chord={chord} />
</Tooltip>
```

---

## CSS for Tooltip (if using custom styling)

```css
/* src/components/UI/Tooltip.css */

.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip-content {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  padding: 8px 12px;
  
  background: #1a1a1a;
  color: white;
  font-size: 13px;
  line-height: 1.4;
  
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  
  pointer-events: none;
  z-index: 1000;
  
  /* Fade in animation */
  animation: tooltipFadeIn 200ms ease-out;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Arrow pointing down */
.tooltip-arrow {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: -4px;
  
  border: 4px solid transparent;
  border-top-color: #1a1a1a;
}
```

---

## Keyboard Shortcut Documentation

If using Alt+Drag, add to keyboard shortcuts guide:

```typescript
// In KeyboardShortcutsGuide.tsx

const shortcuts = [
  // ... existing shortcuts
  
  {
    category: 'Canvas',
    shortcuts: [
      { keys: 'Drag', action: 'Move chord' },
      { keys: 'Alt + Drag', action: 'Create connection between chords' },
      // ... other shortcuts
    ]
  }
];
```

---

## Testing

Test the tooltip:

1. **Hover over chord**
   - Wait 500ms
   - Tooltip appears: "Drag to move • Alt+Drag to connect"
   - Move mouse away
   - Tooltip disappears

2. **Drag without Alt**
   - Chord moves to new position
   - No connection created

3. **Drag with Alt held**
   - Connection line created
   - Chord stays in place (or moves, depending on design)

4. **Rapid hover (move away before 500ms)**
   - Tooltip doesn't appear (prevents flashing)

---

## Accessibility

Make tooltip accessible:

```typescript
<div
  role="tooltip"
  aria-label="Drag to move, or hold Alt and drag to connect"
  onMouseEnter={showTooltip}
  onMouseLeave={hideTooltip}
  onFocus={showTooltip}
  onBlur={hideTooltip}
  tabIndex={0}
>
  <ChordShape />
</div>
```

---

## Success Criteria

- [ ] Tooltip appears on hover (500ms delay)
- [ ] Tooltip disappears when mouse leaves
- [ ] Tooltip text is clear and concise
- [ ] Tooltip doesn't block interaction
- [ ] Tooltip styling matches app design
- [ ] Keyboard users can access tooltip (focus state)

---

## Notes

- This is a **NICE-TO-HAVE** before launch - improves clarity
- Small UX improvement
- Estimated time: 15-20 minutes
- Priority: LOW-MEDIUM

---

## Bonus: Visual Cursor Feedback

Add cursor changes to reinforce behavior:

```typescript
const handleMouseDown = (e: React.MouseEvent) => {
  if (e.altKey) {
    e.currentTarget.style.cursor = 'crosshair'; // Connection mode
  } else {
    e.currentTarget.style.cursor = 'move'; // Move mode
  }
};

const handleMouseUp = () => {
  // Reset cursor
  e.currentTarget.style.cursor = 'grab';
};
```

---

**Implementation Guide for Claude Code:**

1. Create Tooltip component if it doesn't exist
2. Import Tooltip in ChordShape.tsx
3. Wrap chord with Tooltip component
4. Add appropriate tooltip text based on behavior
5. Test hovering and drag behavior
6. Optional: Update keyboard shortcuts documentation
7. Commit: "feat: Add drag behavior tooltip to clarify chord interaction"
