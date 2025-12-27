# Help Tooltip System for Neume

## Overview

The help tooltip system provides a centralized way to manage and display help content throughout the Neume application. It consists of three main components:

1. **Help Content Data** (`src/data/help-content.ts`) - Centralized repository of all help text
2. **HelpTooltip Component** (`src/components/UI/HelpTooltip.tsx`) - Reusable tooltip component
3. **Styling** (`src/components/UI/HelpTooltip.module.css`) - Professional tooltip styling

## Quick Start

### 1. Import the Help Content

```typescript
import { HELP_CONTENT, getHelpContent, HelpContentKey } from '@/data/help-content';
```

### 2. Import the HelpTooltip Component

```typescript
import { HelpTooltip } from '@/components/UI';
```

### 3. Use in Your Component

```typescript
import React from 'react';
import { HelpTooltip } from '@/components/UI';
import { HELP_CONTENT } from '@/data/help-content';

export function MyComponent() {
  const helpContent = HELP_CONTENT['tempo-dial'];

  return (
    <HelpTooltip
      title={helpContent.title}
      content={helpContent.content}
      shortcut={helpContent.shortcut}
      position="top"
    >
      <button>⏱ Tempo</button>
    </HelpTooltip>
  );
}
```

## Available Help Content

All help content is defined in `src/data/help-content.ts` with the following IDs:

### Controls
- `tempo-dial` - Tempo Control
- `key-selector` - Key Selector
- `mode-selector` - Mode Selector
- `play-button` - Play/Pause

### Chord Interactions
- `chord-shape` - Chord Shape
- `canvas` - Canvas
- `selection-box` - Selection Box
- `playhead` - Playhead
- `timeline-ruler` - Timeline Ruler

### Analysis & AI Features
- `analyze-button` - Analyze Progression
- `why-this` - Why This Chord?
- `build-from-bones` - Build from Bones
- `refine-button` - Refine Selection
- `my-progressions` - My Progressions

### Keyboard Shortcuts
- `delete-chord` - Delete Chord
- `copy-chord` - Copy Chord
- `paste-chord` - Paste Chord
- `undo` - Undo
- `redo` - Redo
- `select-all` - Select All
- `deselect-all` - Deselect All

## HelpTooltip Component Props

```typescript
interface HelpTooltipProps {
  // The help content to display (required)
  content: string;

  // Optional title for the tooltip
  title?: string;

  // Position of the tooltip: 'top' | 'bottom' | 'left' | 'right'
  // Default: 'top'
  position?: 'top' | 'bottom' | 'left' | 'right';

  // Delay before showing tooltip in milliseconds
  // Default: 300
  delay?: number;

  // Optional className for custom styling
  className?: string;

  // The element that triggers the tooltip (required)
  children: React.ReactNode;

  // Optional keyboard shortcut to display
  shortcut?: string;

  // Optional examples to display
  examples?: string[];
}
```

## Usage Examples

### Basic Usage

```typescript
<HelpTooltip content="This is a helpful tip">
  <button>Info</button>
</HelpTooltip>
```

### With Title and Shortcut

```typescript
<HelpTooltip
  title="Save Progress"
  content="Save your current progression to your library"
  shortcut="Ctrl+S"
>
  <button>Save</button>
</HelpTooltip>
```

### With Examples

```typescript
<HelpTooltip
  title="Key Selector"
  content="Change the musical key of the progression"
  examples={['C Major', 'G Major', 'D Minor']}
  position="bottom"
>
  <select>
    <option>Select Key...</option>
  </select>
</HelpTooltip>
```

### Using Help Content Data

```typescript
import { HELP_CONTENT } from '@/data/help-content';

function TempoControl() {
  const help = HELP_CONTENT['tempo-dial'];

  return (
    <HelpTooltip
      title={help.title}
      content={help.content}
      shortcut={help.shortcut}
      position="top"
      delay={200}
    >
      <input type="range" min={60} max={220} />
    </HelpTooltip>
  );
}
```

## Helper Functions

### getHelpContent(id: string)

Retrieve help content by ID:

```typescript
const content = getHelpContent('tempo-dial');
if (content) {
  console.log(content.title); // "Tempo Control"
  console.log(content.content); // "Drag left/right..."
}
```

### getHelpContentByCategory(category: 'controls' | 'chords' | 'analysis' | 'keyboard')

Get all help content IDs in a specific category:

```typescript
const controlIds = getHelpContentByCategory('controls');
// ['tempo-dial', 'key-selector', 'mode-selector', 'play-button']
```

## Styling

The HelpTooltip component comes with built-in styling that:

- **Positioning**: Automatically adjusts position to stay within viewport
- **Appearance**: Dark background with light text for high contrast
- **Animation**: Smooth fade and scale entrance/exit animations
- **Accessibility**: Respects `prefers-reduced-motion` and `prefers-contrast` media queries
- **Responsive**: Adjusts size and padding on smaller screens

### Custom Styling

To customize the tooltip appearance, you can:

1. Modify `HelpTooltip.module.css` directly
2. Pass a custom className prop:

```typescript
<HelpTooltip
  content="Help text"
  className="my-custom-tooltip"
>
  <button>Help</button>
</HelpTooltip>
```

## Accessibility

The HelpTooltip component includes:

- **ARIA Attributes**: `role="tooltip"` for screen readers
- **Keyboard Support**: Can be triggered with focus (Tab key)
- **Motion Preferences**: Respects `prefers-reduced-motion` setting
- **Contrast**: Meets WCAG AA standards for color contrast

## Adding New Help Content

To add help content for a new UI element:

1. Open `src/data/help-content.ts`
2. Add a new entry to the `HELP_CONTENT` object:

```typescript
'my-new-element': {
  id: 'my-new-element',
  title: 'My New Element',
  content: 'This is help text for my new element',
  shortcut: 'Ctrl+Alt+M', // optional
  examples: ['Example 1', 'Example 2'], // optional
}
```

3. Optionally add the ID to the appropriate category in `getHelpContentByCategory()`
4. Use the help content in your component with `HELP_CONTENT['my-new-element']`

## Best Practices

1. **Keep content concise**: Aim for 1-2 sentences maximum
2. **Use clear language**: Avoid technical jargon when possible
3. **Include shortcuts**: Add keyboard shortcuts when available
4. **Provide examples**: Use examples for complex features
5. **Test positioning**: Verify tooltips stay visible on all screen sizes
6. **Consistent delays**: Use the default 300ms delay for consistency

## Troubleshooting

### Tooltip not showing
- Check that content is passed and not empty
- Verify the trigger element is interactive
- Ensure z-index (3000) doesn't conflict with other elements

### Tooltip appears cut off
- Try changing the `position` prop to 'bottom' or 'left'
- Component automatically adjusts if it would be off-screen
- Check that parent has `position: relative` if needed

### Styling issues
- Clear CSS cache if changes don't appear
- Check for CSS specificity conflicts
- Verify CSS modules are properly imported

## Future Enhancements

Potential improvements for the help tooltip system:

- [ ] Localization/i18n support
- [ ] Rich text formatting (bold, links, etc.)
- [ ] Video/animation support
- [ ] Help content versioning
- [ ] Analytics tracking for help requests
- [ ] Help content search/discovery
