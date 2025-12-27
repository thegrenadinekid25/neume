/**
 * HELP TOOLTIP INTEGRATION EXAMPLES
 *
 * This file demonstrates how to integrate the HelpTooltip system
 * into various Neume components. Use these examples as templates
 * for adding help content to your UI elements.
 *
 * DO NOT DEPLOY THIS FILE - It's for reference only.
 * Delete this file after using the examples.
 */

import { useState } from 'react';
import { HelpTooltip } from '@/components/UI';
import { HELP_CONTENT, getHelpContent, getHelpContentByCategory } from '@/data/help-content';

// ============================================================================
// EXAMPLE 1: Simple Tempo Control with Help
// ============================================================================
export function TempoDialExample() {
  const [tempo, setTempo] = useState(120);
  const help = HELP_CONTENT['tempo-dial'];

  return (
    <HelpTooltip
      title={help.title}
      content={help.content}
      shortcut={help.shortcut}
      position="top"
      delay={200}
    >
      <div>
        <label>
          <span>Tempo: {tempo} BPM</span>
          <input
            type="range"
            min={60}
            max={220}
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
          />
        </label>
      </div>
    </HelpTooltip>
  );
}

// ============================================================================
// EXAMPLE 2: Analyze Button with AI Feature Help
// ============================================================================
export function AnalyzeButtonExample() {
  const help = getHelpContent('analyze-button');

  if (!help) return null;

  return (
    <HelpTooltip
      title={help.title}
      content={help.content}
      shortcut={help.shortcut}
      position="bottom"
    >
      <button type="button">
        <span>📊</span> Analyze Progression
      </button>
    </HelpTooltip>
  );
}

// ============================================================================
// EXAMPLE 3: Chord Shape with Context Menu Options
// ============================================================================
export function ChordShapeExample() {
  const help = HELP_CONTENT['chord-shape'];

  return (
    <HelpTooltip
      title={help.title}
      content={help.content}
      examples={help.examples}
      position="right"
      delay={300}
    >
      <div
        style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#4A90E2',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        C
      </div>
    </HelpTooltip>
  );
}

// ============================================================================
// EXAMPLE 4: Play Button with Keyboard Shortcut
// ============================================================================
export function PlayButtonExample() {
  const [isPlaying, setIsPlaying] = useState(false);
  const help = HELP_CONTENT['play-button'];

  return (
    <HelpTooltip
      title={help.title}
      content={help.content}
      shortcut={help.shortcut}
      position="top"
    >
      <button
        type="button"
        onClick={() => setIsPlaying(!isPlaying)}
        style={{
          padding: '8px 16px',
          backgroundColor: isPlaying ? '#6B9080' : '#4A90E2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        {isPlaying ? '⏸ Pause' : '▶ Play'}
      </button>
    </HelpTooltip>
  );
}

// ============================================================================
// EXAMPLE 5: Key Selector with Examples
// ============================================================================
export function KeySelecterExample() {
  const [key, setKey] = useState('C');
  const help = HELP_CONTENT['key-selector'];

  return (
    <HelpTooltip
      title={help.title}
      content={help.content}
      examples={help.examples}
      position="bottom"
    >
      <select value={key} onChange={(e) => setKey(e.target.value)}>
        <option value="C">C Major</option>
        <option value="G">G Major</option>
        <option value="D">D Major</option>
        <option value="A">A Major</option>
      </select>
    </HelpTooltip>
  );
}

// ============================================================================
// EXAMPLE 6: Mode Selector with Descriptive Help
// ============================================================================
export function ModeSelectorExample() {
  const [mode, setMode] = useState('major');
  const help = HELP_CONTENT['mode-selector'];

  return (
    <HelpTooltip
      title={help.title}
      content={help.content}
      examples={help.examples}
      position="bottom"
    >
      <div>
        <label>
          <input
            type="radio"
            name="mode"
            value="major"
            checked={mode === 'major'}
            onChange={(e) => setMode(e.target.value)}
          />
          Major
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="minor"
            checked={mode === 'minor'}
            onChange={(e) => setMode(e.target.value)}
          />
          Minor
        </label>
      </div>
    </HelpTooltip>
  );
}

// ============================================================================
// EXAMPLE 7: Why This Chord Feature
// ============================================================================
export function WhyThisChordExample() {
  const help = HELP_CONTENT['why-this'];

  return (
    <HelpTooltip
      title={help.title}
      content={help.content}
      examples={help.examples}
      position="left"
    >
      <button type="button">
        <span>💡</span> Why This?
      </button>
    </HelpTooltip>
  );
}

// ============================================================================
// EXAMPLE 8: Build From Bones Feature
// ============================================================================
export function BuildFromBonesExample() {
  const help = HELP_CONTENT['build-from-bones'];

  return (
    <HelpTooltip
      title={help.title}
      content={help.content}
      examples={help.examples}
      position="left"
    >
      <button type="button">
        <span>🦴</span> Build from Bones
      </button>
    </HelpTooltip>
  );
}

// ============================================================================
// EXAMPLE 9: Refine Button
// ============================================================================
export function RefineButtonExample() {
  const help = HELP_CONTENT['refine-button'];

  return (
    <HelpTooltip
      title={help.title}
      content={help.content}
      shortcut={help.shortcut}
      position="bottom"
    >
      <button type="button" disabled>
        <span>✨</span> Refine
      </button>
    </HelpTooltip>
  );
}

// ============================================================================
// EXAMPLE 10: My Progressions
// ============================================================================
export function MyProgressionsExample() {
  const help = HELP_CONTENT['my-progressions'];

  return (
    <HelpTooltip
      title={help.title}
      content={help.content}
      shortcut={help.shortcut}
      position="bottom"
    >
      <button type="button">
        <span>📚</span> My Progressions
      </button>
    </HelpTooltip>
  );
}

// ============================================================================
// EXAMPLE 11: Using Helper Functions
// ============================================================================
export function HelperFunctionsExample() {
  // Get single help content by ID
  const analyzeHelp = getHelpContent('analyze-button');

  // Get all keyboard shortcut help content
  const keyboardShortcuts = getHelpContentByCategory('keyboard');

  return (
    <div>
      <h3>Help Content Example</h3>
      {analyzeHelp && (
        <HelpTooltip
          title={analyzeHelp.title}
          content={analyzeHelp.content}
          shortcut={analyzeHelp.shortcut}
        >
          <button>Analyze</button>
        </HelpTooltip>
      )}

      <h3>Keyboard Shortcuts</h3>
      <ul>
        {keyboardShortcuts.map((id) => {
          const help = getHelpContent(id);
          return help ? <li key={id}>{help.title}</li> : null;
        })}
      </ul>
    </div>
  );
}

// ============================================================================
// EXAMPLE 12: Custom Positioning with Auto-Adjustment
// ============================================================================
export function CustomPositioningExample() {
  const help = HELP_CONTENT['canvas'];

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <HelpTooltip
        title={help.title}
        content={help.content}
        position="top"
      >
        <button>Top Tooltip</button>
      </HelpTooltip>

      <HelpTooltip
        title={help.title}
        content={help.content}
        position="bottom"
      >
        <button>Bottom Tooltip</button>
      </HelpTooltip>

      <HelpTooltip
        title={help.title}
        content={help.content}
        position="left"
      >
        <button>Left Tooltip</button>
      </HelpTooltip>

      <HelpTooltip
        title={help.title}
        content={help.content}
        position="right"
      >
        <button>Right Tooltip</button>
      </HelpTooltip>
    </div>
  );
}

// ============================================================================
// EXAMPLE 13: Delete Confirmation with Help
// ============================================================================
export function DeleteChordExample() {
  const help = HELP_CONTENT['delete-chord'];

  return (
    <HelpTooltip
      title={help.title}
      content={help.content}
      shortcut={help.shortcut}
      position="top"
    >
      <button
        type="button"
        style={{
          backgroundColor: '#C44536',
          color: 'white',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        <span>🗑</span> Delete
      </button>
    </HelpTooltip>
  );
}

// ============================================================================
// EXAMPLE 14: Undo/Redo with Shortcuts
// ============================================================================
export function UndoRedoExample() {
  const undoHelp = HELP_CONTENT['undo'];
  const redoHelp = HELP_CONTENT['redo'];

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <HelpTooltip
        title={undoHelp.title}
        content={undoHelp.content}
        shortcut={undoHelp.shortcut}
        position="top"
      >
        <button type="button">↶ Undo</button>
      </HelpTooltip>

      <HelpTooltip
        title={redoHelp.title}
        content={redoHelp.content}
        shortcut={redoHelp.shortcut}
        position="top"
      >
        <button type="button">↷ Redo</button>
      </HelpTooltip>
    </div>
  );
}

// ============================================================================
// INTEGRATION CHECKLIST
// ============================================================================
/*
STEPS TO INTEGRATE HELP TOOLTIPS:

1. Identify which UI elements need help content
   - Check HELP_CONTENT in src/data/help-content.ts for available entries
   - Look for elements matching the predefined IDs

2. Import required components
   - import { HelpTooltip } from '@/components/UI';
   - import { HELP_CONTENT, getHelpContent } from '@/data/help-content';

3. Wrap your element
   - Get the help content: const help = HELP_CONTENT['element-id'];
   - Or use helper: const help = getHelpContent('element-id');
   - Wrap your UI element with <HelpTooltip>

4. Configure tooltip properties
   - Set title, content, shortcut, examples from help object
   - Choose position: 'top' | 'bottom' | 'left' | 'right'
   - Optional: Set delay (default 300ms)

5. Test
   - Hover over element to see tooltip
   - Verify positioning on different screen sizes
   - Test keyboard focus (Tab key)
   - Check on mobile devices

6. Remove this file when done
   - These examples are for reference only
   - Delete this file from your repository
*/
