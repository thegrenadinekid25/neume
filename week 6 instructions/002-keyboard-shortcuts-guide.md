# Week 6 Prompt 002: Keyboard Shortcuts Guide

## Objective
Create comprehensive keyboard shortcuts system with visual guide modal for power users.

## Complete Shortcuts List

### Playback
- `Space` - Play/Pause
- `Shift + Space` - Stop (return to start)

### Editing
- `Cmd/Ctrl + Z` - Undo
- `Cmd/Ctrl + Shift + Z` - Redo
- `Cmd/Ctrl + D` - Duplicate selected
- `Delete` / `Backspace` - Delete selected
- `Cmd/Ctrl + A` - Select all
- `Escape` - Clear selection

### Navigation
- `Arrow Keys` - Move selected 1px
- `Shift + Arrow Keys` - Move selected 10px (fast)
- `Tab` - Next chord
- `Shift + Tab` - Previous chord

### Canvas
- `Cmd/Ctrl + +` - Zoom in
- `Cmd/Ctrl + -` - Zoom out
- `Cmd/Ctrl + 0` - Reset zoom
- `Cmd/Ctrl + L` - Toggle connection lines

### File
- `Cmd/Ctrl + S` - Save progression
- `Cmd/Ctrl + E` - Export MIDI
- `Cmd/Ctrl + N` - New (clear canvas)

### Help
- `?` - Show this guide
- `Cmd/Ctrl + K` - Search commands (future)

## Shortcuts Guide Modal

```
┌────────────────────────────────────────────────┐
│  Keyboard Shortcuts                       [×]  │
├────────────────────────────────────────────────┤
│                                                │
│  Playback                                      │
│  ┌──────────────────────────────────────────┐ │
│  │  Space          Play/Pause               │ │
│  │  Shift + Space  Stop                     │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  Editing                                       │
│  ┌──────────────────────────────────────────┐ │
│  │  ⌘ Z            Undo                     │ │
│  │  ⌘ Shift Z      Redo                     │ │
│  │  ⌘ D            Duplicate                │ │
│  │  Delete         Delete selected          │ │
│  │  ⌘ A            Select all               │ │
│  │  Esc            Clear selection          │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ... (scrollable)                              │
│                                                │
│  [Download Printable Reference]                │
│                                                │
└────────────────────────────────────────────────┘
```

## Implementation

```typescript
// useKeyboardShortcuts.ts
export function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.includes('Mac');
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      
      // Playback
      if (e.key === ' ' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        playbackStore.togglePlay();
      }
      
      // Undo/Redo
      if (modifier && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          undoStore.redo();
        } else {
          undoStore.undo();
        }
      }
      
      // Save
      if (modifier && e.key === 's') {
        e.preventDefault();
        progressionsStore.saveCurrentProgression();
      }
      
      // Show guide
      if (e.key === '?') {
        e.preventDefault();
        shortcutsStore.openGuide();
      }
      
      // ... more shortcuts
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```

## Platform Detection

```typescript
const platform = navigator.platform.includes('Mac') ? 'mac' : 'windows';

const modifierKey = platform === 'mac' ? '⌘' : 'Ctrl';
const optionKey = platform === 'mac' ? '⌥' : 'Alt';
```

## Quality Criteria
- [ ] All shortcuts work as specified
- [ ] Modal triggered by `?` key
- [ ] Shows correct symbols (⌘ vs Ctrl)
- [ ] Organized by category
- [ ] Can print reference sheet
- [ ] Doesn't interfere with input fields

**Estimated Time:** 1-2 hours
