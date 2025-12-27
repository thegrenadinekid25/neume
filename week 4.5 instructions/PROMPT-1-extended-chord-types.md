# Week 4.5 Prompt 1: Extended Chord Types Implementation

## Objective
Expand the right-click chord creation menu to include extended harmonies (7ths, suspensions, extensions, alterations) with proper visual badges and integration into the existing chord system.

## Context
- **Current state:** Right-click menu offers 7 basic chord types (I-vii in major/minor)
- **Why now:** Week 4 Analyzer already recognizes extended chords, Week 5 "Refine This" will suggest them - users need manual control before cloud storage (Week 6)
- **Architecture:** Working with block-based system (4-16 bars, reusable harmonic sections)
- **Integration points:** Existing ChordShape component, voice leading algorithm, audio playback

## Requirements

### 1. Enhanced Right-Click Menu Structure

Update the right-click menu to include two sections:

**Basic Chords (existing):**
- I, ii, iii, IV, V, vi, vii° (no changes to these)

**More Chords (NEW section):**

**7th Chords:**
- dom7 (Dominant 7th: 1-3-5-♭7)
- maj7 (Major 7th: 1-3-5-7)
- min7 (Minor 7th: 1-♭3-5-♭7)
- halfdim7 (Half-diminished 7th: 1-♭3-♭5-♭7)
- dim7 (Diminished 7th: 1-♭3-♭5-♭♭7)

**Suspensions:**
- sus2 (Suspended 2nd: 1-2-5)
- sus4 (Suspended 4th: 1-4-5)

**Extensions:**
- add9 (Added 9th: 1-3-5-9)
- add11 (Added 11th: 1-3-5-11)
- add13 (Added 13th: 1-3-5-13)

**Alterations:**
- ♭9 (Flatted 9th)
- ♯9 (Sharped 9th)
- ♯11 (Sharped 11th)
- ♭13 (Flatted 13th)

### 2. Visual Badge System

Each extended chord must display a badge in the top-right corner of its shape:

**Badge Specifications:**
- Position: Top-right corner, offset 2px from edge
- Size: 18px × 14px
- Background: Semi-transparent white (rgba(255, 255, 255, 0.9))
- Border: 1px solid matching the chord color (40% opacity)
- Border-radius: 3px
- Shadow: 0 1px 3px rgba(0,0,0,0.15)

**Badge Text:**
- Font: DM Sans Medium, 11px
- Color: Dark gray #2C3E50
- Alignment: Center
- Examples: "7", "△7", "sus4", "+9", "♭9"

**Badge Content by Type:**
```typescript
const badgeLabels = {
  dom7: "7",
  maj7: "△7",
  min7: "m7",
  halfdim7: "ø7",
  dim7: "°7",
  sus2: "sus2",
  sus4: "sus4",
  add9: "+9",
  add11: "+11",
  add13: "+13",
  flat9: "♭9",
  sharp9: "♯9",
  sharp11: "♯11",
  flat13: "♭13"
};
```

### 3. Data Structure Updates

Update the Chord interface to support extensions:

```typescript
interface Chord {
  // ... existing fields
  quality: 'major' | 'minor' | 'diminished' | 'augmented' | 
           'dom7' | 'maj7' | 'min7' | 'halfdim7' | 'dim7';
  
  // NEW: Extensions object
  extensions: {
    sus2?: boolean;
    sus4?: boolean;
    add9?: boolean;
    add11?: boolean;
    add13?: boolean;
    flat9?: boolean;
    sharp9?: boolean;
    sharp11?: boolean;
    flat13?: boolean;
  };
  
  // ... rest of fields
}
```

### 4. Menu Organization

**Visual Layout:**
```
┌─────────────────────────┐
│  Add Chord              │
├─────────────────────────┤
│  I   - Tonic            │
│  ii  - Supertonic       │
│  iii - Mediant          │
│  IV  - Subdominant      │
│  V   - Dominant         │
│  vi  - Submediant       │
│  vii°- Leading Tone     │
├─────────────────────────┤
│  More Chords ▼          │  ← Expandable section
├─────────────────────────┤
│  7th Chords    →        │  ← Submenu
│  Suspensions   →        │  ← Submenu
│  Extensions    →        │  ← Submenu
│  Alterations   →        │  ← Submenu
└─────────────────────────┘
```

**Submenu Behavior:**
- Hover "7th Chords →" to reveal submenu to the right
- Clicking creates the chord with that quality applied to current scale degree
- Show tooltip: "Click to add [chord name] to canvas"

### 5. Integration Requirements

**ChordShape Component:**
- Update to render badge when extensions are present
- Badge should animate in (fade + scale from 0.8 to 1.0, 200ms)
- Badge position must not overlap with selection indicator

**Audio Playback:**
- Extended chords must play correctly through existing Tone.js system
- Example: Cmaj7 should play C-E-G-B across SATB voices

**Tooltips:**
- Update hover tooltips to show full chord name
- Example: "I - Tonic - C major 7th (Cmaj7)"

## Technical Constraints

- **Framework:** React + TypeScript
- **Menu Library:** Use existing context menu system
- **State:** Zustand store for chord data
- **Styling:** Tailwind CSS + CSS Modules
- **Icons:** Unicode symbols (△, ø, °, ♭, ♯)

## Code Structure

```
src/
├── components/
│   ├── Canvas/
│   │   ├── ChordShape.tsx          # UPDATE: Add badge rendering
│   │   └── ContextMenu.tsx         # UPDATE: Add "More Chords" section
│   └── UI/
│       └── Badge.tsx               # NEW: Reusable badge component
├── types/
│   └── chord.ts                    # UPDATE: Add extensions interface
└── utils/
    └── chord-helpers.ts            # NEW: Helper functions for chord creation
```

## Implementation Notes

### Creating Extended Chords

When user clicks an extended chord type:

```typescript
function createExtendedChord(
  scaleDegree: number,
  baseQuality: ChordQuality,
  extension: ExtensionType,
  position: { x: number, y: number }
): Chord {
  return {
    id: generateId(),
    scaleDegree,
    quality: baseQuality,
    extensions: {
      [extension]: true
    },
    // ... other chord properties
  };
}
```

### Badge Component

```typescript
interface BadgeProps {
  label: string;
  color: string; // Chord color for border
}

export const Badge: React.FC<BadgeProps> = ({ label, color }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="absolute -top-1 -right-1 badge"
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        border: `1px solid ${color}40`,
        borderRadius: '3px',
        padding: '2px 4px',
        fontSize: '11px',
        fontWeight: 500,
        color: '#2C3E50',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        pointerEvents: 'none'
      }}
    >
      {label}
    </motion.div>
  );
};
```

## Quality Criteria

- [ ] All 17 extended chord types available in menu
- [ ] Badges render correctly on all chord shapes
- [ ] Badges don't overlap with selection indicators
- [ ] Extended chords can be created via right-click
- [ ] Audio playback works for all extended types
- [ ] Tooltips show complete chord names
- [ ] TypeScript types are comprehensive
- [ ] No performance impact (60fps with 50+ chords)

## Testing Considerations

**Manual Tests:**
1. Create each of the 17 extended chord types
2. Verify badge appears with correct label
3. Play each chord to verify audio is correct
4. Hover to verify tooltip shows full name
5. Select chord to ensure badge doesn't interfere
6. Create 50+ extended chords to test performance

**Edge Cases:**
- Multiple extensions on same chord (e.g., add9 + sus4)
- Very long badge labels (e.g., "♯11")
- Badge positioning on different shape types
- Badge visibility on light/dark chord colors

## Success Criteria

After implementation:
1. Right-click menu has "More Chords" section with 4 submenus
2. All 17 extended chord types create successfully
3. Badges render with correct labels and styling
4. Audio playback includes all notes (e.g., 7th, 9th, etc.)
5. Performance remains at 60fps
6. User can discover extended harmonies intuitively

---

**Estimated Time:** 1-1.5 hours
**Dependencies:** Week 2 (right-click menu), Week 3 (audio playback)
**Blocks:** Week 5 AI features (which will suggest these chords)
