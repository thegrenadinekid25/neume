# Neume Design Pass Guide

This document provides guidelines for future Claude Code sessions to maintain design consistency across the Neume codebase. Run a design pass after implementing new features to ensure they match the established aesthetic.

## Design Philosophy

Neume uses a **Warm Kinfolk** design aesthetic - organic, editorial, and approachable. Think Kinfolk magazine meets a thoughtful music app. The design should feel:

- **Warm** - Not cold/clinical. Soft edges, warm colors
- **Editorial** - Clean typography hierarchy, thoughtful spacing
- **Organic** - Natural transitions, breathable layouts
- **Intentional** - Every element has purpose, no visual noise

## Color Palette

All new components MUST use these CSS variables (defined in `src/styles/variables.css`):

### Primary Colors
```css
--warm-cream: #FAF8F5;       /* Primary background */
--warm-sand: #F5F1E8;        /* Secondary background, hover states */
--warm-linen: #EDE8E0;       /* Tertiary background */
```

### Accent Colors
```css
--warm-gold: #E8A03E;        /* Primary action, focus states, success */
--warm-terracotta: #E85D3D;  /* Secondary action, destructive actions */
--warm-amber: #D4924A;       /* Hover state for gold */
```

### Text Colors
```css
--warm-text-primary: #3D3530;    /* Primary text, headings */
--warm-text-secondary: #7A7067;  /* Secondary text, labels */
--warm-text-tertiary: #9A9189;   /* Placeholder text, hints */
```

### Common Replacements
When reviewing code, replace these generic colors:

| Generic Color | Replace With |
|--------------|--------------|
| `#3b82f6` (blue) | `var(--warm-gold, #E8A03E)` |
| `#10b981` (green) | `var(--warm-gold, #E8A03E)` |
| `#ef4444` (red) | `var(--warm-terracotta, #E85D3D)` |
| `#dc3545` (Bootstrap red) | `var(--warm-terracotta, #E85D3D)` |
| `#ffc107` (Bootstrap yellow) | `var(--warm-gold, #E8A03E)` |
| `#3a7bc8`, `#2b5aa5` (blues) | `var(--warm-amber, #D4924A)` |
| `rgba(59, 130, 246, 0.x)` | `rgba(232, 160, 62, 0.x)` |
| `rgba(239, 68, 68, 0.x)` | `rgba(232, 93, 61, 0.x)` |

## Typography

### Font Families
```css
--font-display: Georgia, serif;     /* Headings, titles */
--font-ui: system-ui, sans-serif;   /* UI elements, body text */
```

### Size Hierarchy
- Modal titles: `18px`, weight `600`, display font
- Section labels: `11-12px`, weight `600`, uppercase, letter-spacing `0.5px`
- Body text: `13-15px`, weight normal
- Buttons: `13-14px`, weight `500`

### Guidelines
- Bold differences should be noticeable (600+ weight for emphasis)
- Keep font sizes consistent within component categories
- Use CSS variable fonts when available

## No Emojis Policy

**NEVER use emojis in the UI.** Replace emojis with:

1. **SVG icons** - Inline or from a consistent icon set
2. **Text labels** - When icons aren't necessary
3. **CSS visual indicators** - Colored dots, borders, shadows

### Example Replacements
```tsx
// BAD
<span>Loading piano samples...</span>

// GOOD
<span>
  <svg className={styles.icon} viewBox="0 0 24 24">
    <path d="M20 6L9 17l-5-5" />
  </svg>
  Piano ready
</span>
```

## Running a Design Pass

### Step 1: Identify New CSS Files
```bash
git status | grep ".css"
```

### Step 2: Search for Generic Colors
Use grep to find non-palette colors:
```bash
grep -r "#3b82f6\|#ef4444\|#10b981\|#dc3545\|#ffc107" src/
grep -r "rgba(59, 130, 246\|rgba(239, 68, 68" src/
```

### Step 3: Search for Emojis in TSX
```bash
grep -rP "[\x{1F300}-\x{1F9FF}]|[\x{2600}-\x{26FF}]" src/
```

### Step 4: Verify Variables Are Used
Check that CSS files reference warm palette variables:
```bash
grep -L "warm-gold\|warm-terracotta\|warm-sand" src/components/**/*.module.css
```

### Step 5: Test Visually
- Open the app in browser
- Check all new components match existing aesthetic
- Verify hover/focus states use warm colors
- Confirm no jarring color differences

## Component Patterns

### Buttons
```css
/* Primary Action */
.primaryButton {
  background: var(--warm-gold, #E8A03E);
  color: white;
}
.primaryButton:hover {
  background: var(--warm-amber, #D4924A);
}

/* Destructive Action */
.deleteButton:hover {
  background: rgba(232, 93, 61, 0.1);
  color: var(--warm-terracotta, #E85D3D);
}
```

### Focus States
```css
.input:focus {
  border-color: var(--warm-gold, #E8A03E);
  box-shadow: 0 0 0 2px rgba(232, 160, 62, 0.15);
}
```

### Transitions
Use organic easing:
```css
transition: all 0.2s var(--ease-smooth, ease);
/* or */
transition: all var(--duration-fast) var(--ease-breathe);
```

## Checklist for New Components

- [ ] Uses CSS variables for all colors (no hardcoded hex)
- [ ] No emojis - uses SVG icons instead
- [ ] Font sizes match hierarchy
- [ ] Transitions use organic easing
- [ ] Focus states use warm-gold
- [ ] Delete/destructive actions use warm-terracotta
- [ ] Background colors use warm-cream/sand/linen
- [ ] Shadows use warm palette rgba values

## Common Issues to Check

### Undefined CSS Variables
Watch for CSS variables that are used but never defined (causing invisible/broken styling):

```bash
# Find all CSS variable usages
grep -r "var(--" src/ --include="*.css" | grep -oP "var\(--[\w-]+" | sort | uniq

# Check if variable is defined in variables.css
grep "variableName:" src/styles/variables.css
```

**Known problematic variables found and replaced:**
- `--color-sage` - Was undefined, replaced with `--warm-gold`
- `--color-cream` - Sometimes undefined, use `--warm-cream` instead
- `--color-charcoal` - Sometimes undefined, use `--warm-text-primary` instead

## Files Modified in Design Passes

Keep this list updated when running design passes:

### Phase 2 Design Pass (December 2024)
- `src/components/Modals/NarrativeComposerModal.module.css`
- `src/components/Canvas/ChordAnnotationPopover.module.css`
- `src/components/Panels/ProgressionNotesPanel.module.css`
- `src/components/VoiceEditor/VoiceHandle.module.css`
- `src/components/VoiceEditor/VoiceHandleGroup.module.css`
- `src/components/Audio/AudioLoadingIndicator.module.css`
- `src/components/Audio/AudioLoadingIndicator.tsx` (removed emoji)
- `src/components/UI/ExpertModeProgress.module.css` (fixed undefined --color-sage)
- `src/components/UI/ExpertModeToggle.module.css` (fixed undefined --color-sage)
- `src/components/UI/NecklaceToggle.module.css` (fixed undefined --color-sage)
