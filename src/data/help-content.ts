/**
 * Help Tooltip Content System for Neume
 *
 * This file defines help and tooltip content for key UI elements throughout the application.
 * Each entry includes a unique ID, title, and description for display in tooltips.
 */

export interface HelpContent {
  id: string;
  title: string;
  content: string;
  shortcut?: string; // Optional keyboard shortcut info
  examples?: string[]; // Optional examples
}

/**
 * Central repository of help content for all UI elements
 */
export const HELP_CONTENT: Record<string, HelpContent> = {
  // Controls
  'tempo-dial': {
    id: 'tempo-dial',
    title: 'Tempo Control',
    content: 'Drag left/right to adjust playback speed. Range: 60-220 BPM.',
    shortcut: 'No keyboard shortcut',
  },

  'key-selector': {
    id: 'key-selector',
    title: 'Key Selector',
    content: 'Change the musical key of the progression. All chords transpose automatically.',
    examples: ['C Major', 'G Major', 'D Minor'],
  },

  'mode-selector': {
    id: 'mode-selector',
    title: 'Mode Selector',
    content: 'Switch between major and minor mode. Changes the harmonic character of the progression.',
    examples: ['Major', 'Minor', 'Dorian', 'Phrygian'],
  },

  'play-button': {
    id: 'play-button',
    title: 'Play/Pause',
    content: 'Play or pause the progression. Or press Space.',
    shortcut: 'Space',
  },

  // Chord interactions
  'chord-shape': {
    id: 'chord-shape',
    title: 'Chord Shape',
    content: 'Click to select. Drag to move. Right-click for options.',
    examples: ['Delete', 'Edit', 'Copy progression'],
  },

  // Analysis and AI features
  'analyze-button': {
    id: 'analyze-button',
    title: 'Analyze Progression',
    content: 'Extract chord progressions from YouTube videos. Paste a YouTube URL or link.',
    shortcut: 'Ctrl+Shift+A (Windows) / Cmd+Shift+A (Mac)',
  },

  'why-this': {
    id: 'why-this',
    title: 'Why This Chord?',
    content: 'Learn why this chord was chosen and hear alternatives. Explore harmonic context and music theory explanations.',
    examples: [
      'Harmonic function explained',
      'Listen to alternatives',
      'See harmonic analysis',
    ],
  },

  'build-from-bones': {
    id: 'build-from-bones',
    title: 'Build from Bones',
    content: 'See how this progression evolved from simple to complex. Trace the harmonic skeleton through each step.',
    examples: ['Root motion', 'Voice leading', 'Harmonic reduction'],
  },

  'refine-button': {
    id: 'refine-button',
    title: 'Refine Selection',
    content: 'Get AI suggestions to modify your selected chords. Explore variations and improvements based on music theory.',
    shortcut: 'Select chord(s) first',
  },

  // Saved progressions
  'my-progressions': {
    id: 'my-progressions',
    title: 'My Progressions',
    content: 'Access your saved chord progressions. Load, edit, or delete previously created progressions.',
    shortcut: 'Ctrl+Shift+P (Windows) / Cmd+Shift+P (Mac)',
  },

  // Canvas and selection
  'canvas': {
    id: 'canvas',
    title: 'Canvas',
    content: 'Click to place chords. Select multiple chords by dragging a box. Use Shift+Click to add/remove from selection.',
  },

  'selection-box': {
    id: 'selection-box',
    title: 'Selection Box',
    content: 'Drag to select multiple chords at once. Hold Shift while dragging to add to existing selection.',
  },

  'playhead': {
    id: 'playhead',
    title: 'Playhead',
    content: 'Shows the current playback position. Drag to scrub through the progression.',
  },

  'timeline-ruler': {
    id: 'timeline-ruler',
    title: 'Timeline Ruler',
    content: 'Visual timeline showing the progression duration. Click to jump to a specific time.',
  },

  // Keyboard shortcuts
  'delete-chord': {
    id: 'delete-chord',
    title: 'Delete Chord',
    content: 'Remove the selected chord(s) from the progression.',
    shortcut: 'Delete or Backspace',
  },

  'copy-chord': {
    id: 'copy-chord',
    title: 'Copy Chord',
    content: 'Create a duplicate of the selected chord(s).',
    shortcut: 'Ctrl+C / Cmd+C',
  },

  'paste-chord': {
    id: 'paste-chord',
    title: 'Paste Chord',
    content: 'Paste previously copied chords.',
    shortcut: 'Ctrl+V / Cmd+V',
  },

  'undo': {
    id: 'undo',
    title: 'Undo',
    content: 'Undo the last action.',
    shortcut: 'Ctrl+Z / Cmd+Z',
  },

  'redo': {
    id: 'redo',
    title: 'Redo',
    content: 'Redo the last undone action.',
    shortcut: 'Ctrl+Shift+Z / Cmd+Shift+Z',
  },

  'select-all': {
    id: 'select-all',
    title: 'Select All',
    content: 'Select all chords in the progression.',
    shortcut: 'Ctrl+A / Cmd+A',
  },

  'deselect-all': {
    id: 'deselect-all',
    title: 'Deselect All',
    content: 'Clear all selections.',
    shortcut: 'Escape',
  },
};

/**
 * Get help content by ID
 * Returns undefined if the ID is not found
 */
export function getHelpContent(id: string): HelpContent | undefined {
  return HELP_CONTENT[id];
}

/**
 * Get all help content IDs for a specific category
 */
export function getHelpContentByCategory(category: 'controls' | 'chords' | 'analysis' | 'keyboard'): string[] {
  const categories: Record<string, string[]> = {
    controls: ['tempo-dial', 'key-selector', 'mode-selector', 'play-button'],
    chords: ['chord-shape', 'canvas', 'selection-box', 'playhead', 'timeline-ruler'],
    analysis: ['analyze-button', 'why-this', 'build-from-bones', 'refine-button', 'my-progressions'],
    keyboard: ['delete-chord', 'copy-chord', 'paste-chord', 'undo', 'redo', 'select-all', 'deselect-all'],
  };
  return categories[category] || [];
}

/**
 * Type for accessing help content safely
 */
export type HelpContentKey = keyof typeof HELP_CONTENT;
