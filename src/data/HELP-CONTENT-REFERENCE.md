# Help Content Reference

Quick reference for all available help content IDs in Neume.

## All Help Content IDs

### Controls (4 items)
- `tempo-dial` - Tempo Control
- `key-selector` - Key Selector
- `mode-selector` - Mode Selector
- `play-button` - Play/Pause

### Chord Interactions (5 items)
- `chord-shape` - Chord Shape
- `canvas` - Canvas
- `selection-box` - Selection Box
- `playhead` - Playhead
- `timeline-ruler` - Timeline Ruler

### Analysis & AI Features (5 items)
- `analyze-button` - Analyze Progression
- `why-this` - Why This Chord?
- `build-from-bones` - Build from Bones
- `refine-button` - Refine Selection
- `my-progressions` - My Progressions

### Keyboard Shortcuts (7 items)
- `delete-chord` - Delete Chord
- `copy-chord` - Copy Chord
- `paste-chord` - Paste Chord
- `undo` - Undo
- `redo` - Redo
- `select-all` - Select All
- `deselect-all` - Deselect All

## Total: 21 help content entries

## Import Examples

```typescript
// Import the entire HELP_CONTENT object
import { HELP_CONTENT } from '@/data/help-content';

// Import types
import { HelpContent, HelpContentKey } from '@/data/help-content';

// Import helper functions
import { getHelpContent, getHelpContentByCategory } from '@/data/help-content';
```

## Usage in Components

```typescript
import { HelpTooltip } from '@/components/UI';
import { HELP_CONTENT } from '@/data/help-content';

// Get specific help content
const help = HELP_CONTENT['tempo-dial'];

// Use in component
<HelpTooltip
  title={help.title}
  content={help.content}
  shortcut={help.shortcut}
>
  <button>Tempo</button>
</HelpTooltip>
```

## Adding New Help Content

To add help for a new UI element:

1. Edit `src/data/help-content.ts`
2. Add entry to `HELP_CONTENT` object:

```typescript
'my-feature': {
  id: 'my-feature',
  title: 'My Feature Title',
  content: 'Help text description...',
  shortcut: 'Ctrl+M', // optional
  examples: ['Example 1'], // optional
}
```

3. Optionally add ID to category in `getHelpContentByCategory()`
4. Use in component: `HELP_CONTENT['my-feature']`

## Keyboard Shortcuts Included

- **Tempo Control**: No shortcut
- **Play/Pause**: Space
- **Analyze**: Ctrl+Shift+A / Cmd+Shift+A
- **My Progressions**: Ctrl+Shift+P / Cmd+Shift+P
- **Delete**: Delete or Backspace
- **Copy**: Ctrl+C / Cmd+C
- **Paste**: Ctrl+V / Cmd+V
- **Undo**: Ctrl+Z / Cmd+Z
- **Redo**: Ctrl+Shift+Z / Cmd+Shift+Z
- **Select All**: Ctrl+A / Cmd+A
- **Deselect All**: Escape
