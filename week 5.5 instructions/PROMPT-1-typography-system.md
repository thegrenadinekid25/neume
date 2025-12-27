# Week 5.5 Prompt 1: Typography System - Bauhaus Kinfolk

## Objective
Implement the complete typography system that balances Bauhaus precision with Kinfolk warmth, using Fraunces (display), Space Grotesk (UI), and DM Mono (technical) to create a sophisticated, musical, and approachable aesthetic.

## Design Philosophy

**Dual-Mode Personality:**
- **Precision (Bauhaus):** Clean geometric forms, rational structure, systematic organization
- **Musical (Kinfolk):** Warm approachability, organic variation, human touch

**Typography achieves this by:**
- Fraunces: Soft serifs with character (warmth)
- Space Grotesk: Geometric sans with quirks (precision + personality)
- DM Mono: Technical clarity (musician-grade precision)

## Font Stack

### Display Font: Fraunces
**Use:** Headings, welcome messages, section titles, empty states
**Character:** Soft serifs, high contrast, slightly wonky (organic Bauhaus)
**Weights:** 
- Light (300): Subtle headings
- Regular (400): Standard headings
- SemiBold (600): Emphasized headings
- Bold (700): Hero text

**Why Fraunces:** Creates warmth and approachability while maintaining sophistication. The soft serifs feel musical and elegant without being stuffy.

### UI Font: Space Grotesk
**Use:** All UI text (buttons, labels, menus, tooltips, body text)
**Character:** Geometric sans-serif with optical quirks, readable at all sizes
**Weights:**
- Regular (400): Body text, labels
- Medium (500): Buttons, emphasized labels
- Bold (700): Strong emphasis

**Why Space Grotesk:** Perfect balance of Bauhaus geometry and Kinfolk approachability. Slightly quirky letterforms prevent sterility while maintaining clarity.

### Technical Font: DM Mono
**Use:** Roman numerals (I, ii, V7), chord symbols, musical notation, code-like elements
**Character:** Monospaced, clear distinction between characters (I vs l)
**Weights:**
- Regular (400): All musical notation
- Medium (500): Emphasized notation

**Why DM Mono:** Musicians need crystal-clear differentiation. Monospace ensures perfect alignment of Roman numerals and chord symbols.

## Type Scale (10:1 Ratio)

Using a **10:1 major tenth ratio** for Bauhaus-inspired dramatic scale jumps:

```typescript
const typeScale = {
  // Display sizes (Fraunces)
  display1: 60,   // Hero text
  display2: 48,   // Page titles
  display3: 36,   // Section titles
  
  // Heading sizes (Fraunces or Space Grotesk)
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  
  // Body sizes (Space Grotesk)
  bodyLarge: 16,
  body: 14,
  bodySmall: 13,
  caption: 12,
  
  // Technical sizes (DM Mono)
  chordLarge: 20,  // Large chord symbols
  chord: 16,       // Standard chord symbols
  chordSmall: 14,  // Compact notation
  
  // Micro (Space Grotesk)
  micro: 11
};
```

**Ratio Justification:** 10:1 creates dramatic visual hierarchy (Bauhaus) while maintaining readability. Each jump feels intentional and musical.

## Line Heights

```typescript
const lineHeights = {
  tight: 1.2,    // Display text, headings
  normal: 1.5,   // Body text, UI labels
  relaxed: 1.7,  // Comfortable reading
  loose: 2.0     // Spacious layouts
};
```

**Rhythm:** Line heights create vertical rhythm that feels musical. Use `tight` for headings (Bauhaus compression), `normal` for UI, `relaxed` for reading.

## Implementation

### 1. Font Loading

**Add to `index.html` head:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@300;400;600;700&family=Space+Grotesk:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### 2. CSS Variables

**Create `src/styles/typography.css`:**
```css
:root {
  /* Font Families */
  --font-display: 'Fraunces', serif;
  --font-ui: 'Space Grotesk', sans-serif;
  --font-technical: 'DM Mono', monospace;
  
  /* Display Scale (Fraunces) */
  --text-display-1: 60px;
  --text-display-2: 48px;
  --text-display-3: 36px;
  
  /* Heading Scale */
  --text-h1: 32px;
  --text-h2: 24px;
  --text-h3: 20px;
  --text-h4: 18px;
  
  /* Body Scale (Space Grotesk) */
  --text-body-large: 16px;
  --text-body: 14px;
  --text-body-small: 13px;
  --text-caption: 12px;
  
  /* Technical Scale (DM Mono) */
  --text-chord-large: 20px;
  --text-chord: 16px;
  --text-chord-small: 14px;
  
  /* Micro */
  --text-micro: 11px;
  
  /* Line Heights */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.7;
  --leading-loose: 2.0;
  
  /* Font Weights */
  --weight-light: 300;
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
}
```

### 3. Typography Utility Classes

```css
/* Display Text (Fraunces) */
.text-display-1 {
  font-family: var(--font-display);
  font-size: var(--text-display-1);
  font-weight: var(--weight-light);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em; /* Slight tightening for large sizes */
}

.text-display-2 {
  font-family: var(--font-display);
  font-size: var(--text-display-2);
  font-weight: var(--weight-regular);
  line-height: var(--leading-tight);
  letter-spacing: -0.01em;
}

/* Headings (Fraunces or Space Grotesk) */
.text-h1 {
  font-family: var(--font-display);
  font-size: var(--text-h1);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-tight);
}

.text-h2 {
  font-family: var(--font-ui);
  font-size: var(--text-h2);
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
}

.text-h3 {
  font-family: var(--font-ui);
  font-size: var(--text-h3);
  font-weight: var(--weight-medium);
  line-height: var(--leading-normal);
}

/* Body Text (Space Grotesk) */
.text-body {
  font-family: var(--font-ui);
  font-size: var(--text-body);
  font-weight: var(--weight-regular);
  line-height: var(--leading-normal);
}

.text-body-large {
  font-family: var(--font-ui);
  font-size: var(--text-body-large);
  font-weight: var(--weight-regular);
  line-height: var(--leading-relaxed);
}

/* Technical Text (DM Mono) */
.text-chord {
  font-family: var(--font-technical);
  font-size: var(--text-chord);
  font-weight: var(--weight-regular);
  line-height: var(--leading-normal);
  font-variant-numeric: tabular-nums; /* Align numbers */
}

.text-chord-large {
  font-family: var(--font-technical);
  font-size: var(--text-chord-large);
  font-weight: var(--weight-medium);
  line-height: var(--leading-tight);
}

/* UI Elements */
.text-button {
  font-family: var(--font-ui);
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
  line-height: var(--leading-tight);
  letter-spacing: 0.01em; /* Slight spacing for readability */
}

.text-label {
  font-family: var(--font-ui);
  font-size: var(--text-body-small);
  font-weight: var(--weight-medium);
  line-height: var(--leading-normal);
  text-transform: uppercase;
  letter-spacing: 0.05em; /* Bauhaus-inspired spacing */
}

.text-caption {
  font-family: var(--font-ui);
  font-size: var(--text-caption);
  font-weight: var(--weight-regular);
  line-height: var(--leading-normal);
  color: var(--color-text-secondary);
}
```

### 4. Component Updates

**Update these components to use new typography:**

**Header.tsx:**
```typescript
<header className="header">
  <h1 className="text-h2" style={{ fontFamily: 'var(--font-display)' }}>
    Neume
  </h1>
</header>
```

**Button.tsx:**
```typescript
<button className="text-button">
  {children}
</button>
```

**ChordShape.tsx (Roman numerals):**
```typescript
<text 
  className="text-chord"
  style={{
    fontFamily: 'var(--font-technical)',
    fontSize: '16px'
  }}
>
  {romanNumeral}
</text>
```

**WelcomeOverlay.tsx:**
```typescript
<div className="welcome-overlay">
  <h1 className="text-display-2">
    Welcome to Neume
  </h1>
  <p className="text-body-large">
    Your harmonic sketch pad with built-in theory teacher
  </p>
</div>
```

**Tooltips:**
```typescript
<div className="tooltip">
  <span className="text-chord-small">{romanNumeral}</span>
  <span className="text-caption">{chordName}</span>
</div>
```

## Usage Guidelines

### When to Use Each Font

**Fraunces (Display):**
- ✓ App title "Neume"
- ✓ Welcome message
- ✓ Section headers ("My Blocks", "Analyze a Piece")
- ✓ Empty state messages
- ✓ Large headings
- ✗ UI labels (too decorative)
- ✗ Buttons (too soft)
- ✗ Body text (too high-contrast for reading)

**Space Grotesk (UI):**
- ✓ All buttons
- ✓ All labels
- ✓ Menus
- ✓ Tooltips (except chord symbols)
- ✓ Body text
- ✓ Form inputs
- ✓ Modal content
- ✗ Roman numerals (use DM Mono)
- ✗ Hero text (use Fraunces)

**DM Mono (Technical):**
- ✓ Roman numerals (I, ii, V7)
- ✓ Chord symbols (Cmaj7, Dm, G7)
- ✓ Scale degrees
- ✓ Tempo numbers (120 BPM)
- ✓ Beat markers
- ✗ UI labels (too technical)
- ✗ Headings (too monotone)
- ✗ Body text (too hard to read)

### Type Pairing Examples

**Card Header:**
```html
<div class="card">
  <h3 class="text-h3" style="font-family: var(--font-display)">
    Jazz Turnaround
  </h3>
  <p class="text-caption">
    Classic Imaj7 - vi7 - ii7 - V7 progression
  </p>
</div>
```

**Chord Tooltip:**
```html
<div class="tooltip">
  <span class="text-chord">I</span>
  <span class="text-caption">C major - Tonic</span>
</div>
```

**Empty State:**
```html
<div class="empty-state">
  <h2 class="text-display-3">
    Your canvas awaits
  </h2>
  <p class="text-body-large">
    Right-click anywhere to add your first chord
  </p>
</div>
```

## Testing & Quality

**Visual Regression:**
- Take screenshots of all components before/after
- Verify hierarchy feels intentional
- Verify readability at all sizes

**Accessibility:**
- Minimum 14px for body text (✓ we use 14px)
- Contrast ratios meet WCAG AA
- Fallback fonts specified

**Performance:**
- Font files < 100KB total
- Preload critical fonts
- Use `font-display: swap` for graceful degradation

## Success Criteria

- [ ] All three fonts loaded correctly
- [ ] Type scale creates clear hierarchy
- [ ] Fraunces used for display/headings
- [ ] Space Grotesk used for UI
- [ ] DM Mono used for musical notation
- [ ] Line heights create vertical rhythm
- [ ] All components updated
- [ ] Readability excellent at all sizes
- [ ] Bauhaus precision + Kinfolk warmth achieved

---

**Estimated Time:** 1.5-2 hours
**Output:** Complete typography system with CSS variables and utility classes
**Next:** Prompt 2 - Color & Form System
