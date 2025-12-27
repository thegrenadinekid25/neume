# Prompt 003: Project Structure & TypeScript Types

## Objective
Establish the complete folder structure for Neume and define all core TypeScript interfaces and types. This creates the organizational foundation and type system that all future code will build upon.

## Context
With the project initialized (Prompt 001) and dependencies installed (Prompt 002), we now need to create a logical folder structure and define the TypeScript types that will ensure type safety throughout the application.

**Dependencies:** 
- Requires Prompt 001 (Project Setup)
- Requires Prompt 002 (Dependencies Installed)

**Related Components:** All future components will use these types
**Next Steps:** Begin implementing visual components (Colors, Canvas, Shapes)

## Requirements

1. **Create complete folder structure** matching the spec
2. **Define all TypeScript interfaces** from the spec's Data Structures section
3. **Create type utility helpers** for common operations
4. **Set up barrel exports** for clean imports
5. **Add JSDoc comments** for better IDE support
6. **Ensure type safety** with no `any` types
7. **Create constants** for enums and literal types

## Folder Structure

Create the following structure:

```
src/
├── components/
│   ├── Canvas/
│   │   └── (empty - Week 3)
│   ├── Controls/
│   │   └── (empty - Week 5)
│   ├── Modals/
│   │   └── (empty - Week 7-8)
│   ├── Panels/
│   │   └── (empty - Week 7-8)
│   └── UI/
│       └── (empty - Week 3)
├── audio/
│   └── (empty - Week 5-6)
├── ai/
│   └── (empty - Week 7-8)
├── utils/
│   └── (empty - Week 3)
├── data/
│   └── (empty - Week 9)
├── store/
│   └── (empty - Week 3)
├── hooks/
│   └── (empty - Week 3)
├── types/
│   ├── chord.ts          ← Create in this prompt
│   ├── progression.ts    ← Create in this prompt
│   ├── ai.ts             ← Create in this prompt
│   ├── audio.ts          ← Create in this prompt
│   ├── ui.ts             ← Create in this prompt
│   └── index.ts          ← Barrel export
├── styles/
│   ├── globals.css       ← Create in this prompt
│   └── variables.css     ← Create in this prompt (will be populated in Prompt 004)
├── App.tsx
├── App.module.css
├── main.tsx
└── vite-env.d.ts
```

## TypeScript Type Definitions

### src/types/chord.ts

```typescript
/**
 * Chord quality types
 */
export type ChordQuality =
  | 'major'
  | 'minor'
  | 'diminished'
  | 'augmented'
  | 'dom7'
  | 'maj7'
  | 'min7'
  | 'halfdim7'
  | 'dim7';

/**
 * Scale degree (1-7 for I-vii)
 */
export type ScaleDegree = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Musical keys
 */
export type MusicalKey =
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'A'
  | 'B'
  | 'Db'
  | 'Eb'
  | 'Gb'
  | 'Ab'
  | 'Bb';

/**
 * Mode (major or minor)
 */
export type Mode = 'major' | 'minor';

/**
 * Chord extensions and alterations
 */
export interface ChordExtensions {
  add9?: boolean;
  add11?: boolean;
  add13?: boolean;
  sus2?: boolean;
  sus4?: boolean;
  sharp11?: boolean;
  flat9?: boolean;
  sharp9?: boolean;
  flat13?: boolean;
}

/**
 * Chromatic chord types
 */
export type ChromaticType = 'borrowed' | 'secondary' | 'neapolitan' | 'aug6th';

/**
 * SATB voicing
 */
export interface Voices {
  soprano: string; // e.g., "C5"
  alto: string; // e.g., "E4"
  tenor: string; // e.g., "G3"
  bass: string; // e.g., "C3"
}

/**
 * Position on canvas (pixels)
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Chord source type
 */
export type ChordSource = 'user' | 'analyzed' | 'library';

/**
 * Complete chord object (from spec)
 */
export interface Chord {
  // Identity
  id: string; // UUID

  // Musical Properties
  scaleDegree: ScaleDegree;
  quality: ChordQuality;

  // Extensions
  extensions: ChordExtensions;

  // Key Context
  key: MusicalKey;
  mode: Mode;

  // Chromatic
  isChromatic: boolean;
  chromaticType?: ChromaticType;

  // Voicing (auto-generated)
  voices: Voices;

  // Timeline Position
  startBeat: number; // 0-indexed
  duration: number; // In beats

  // Visual
  position: Position;
  size: number; // Base size in pixels

  // State
  selected: boolean;
  playing: boolean;

  // Metadata
  source: ChordSource;
  analyzedFrom?: string; // Piece name if from analysis
  createdAt: string; // ISO timestamp
}

/**
 * Helper type for creating a new chord (with optional fields)
 */
export type ChordInput = Partial<Chord> &
  Pick<Chord, 'scaleDegree' | 'quality' | 'key' | 'mode'>;
```

### src/types/progression.ts

```typescript
import { Chord, MusicalKey, Mode } from './chord';

/**
 * Time signature options
 */
export type TimeSignature = '4/4' | '3/4' | '6/8' | '2/2';

/**
 * Source of analyzed progression
 */
export type AnalysisSource = 'youtube' | 'audio' | 'pdf';

/**
 * Analyzed piece metadata
 */
export interface AnalyzedFrom {
  title: string;
  composer?: string;
  source: AnalysisSource;
  sourceUrl?: string;
}

/**
 * Build-up step (for "Build From Bones" feature)
 */
export interface BuildUpStep {
  stepNumber: number;
  stepName: string;
  description: string;
  chords: Chord[];
}

/**
 * Build-up progression data
 */
export interface BuildUp {
  steps: BuildUpStep[];
}

/**
 * Complete progression object (from spec)
 */
export interface Progression {
  id: string;

  // Metadata
  name: string;
  description?: string;

  // Musical Context
  key: MusicalKey;
  mode: Mode;
  timeSignature: TimeSignature;
  tempo: number; // BPM

  // Content
  chords: Chord[];

  // Analysis (if from "Analyze")
  analyzedFrom?: AnalyzedFrom;

  // Build-Up (if "Build From Bones" was saved)
  buildUp?: BuildUp;

  // User Data
  isFavorite: boolean;
  tags: string[];

  // Timestamps
  createdAt: string; // ISO format
  updatedAt: string; // ISO format
}

/**
 * Helper type for creating a new progression
 */
export type ProgressionInput = Partial<Progression> &
  Pick<Progression, 'name' | 'key' | 'mode' | 'tempo'>;
```

### src/types/ai.ts

```typescript
import { Chord } from './chord';

/**
 * Suggestion technique types
 */
export type SuggestionTechnique =
  | 'add9'
  | 'add11'
  | 'add13'
  | 'sus2'
  | 'sus4'
  | 'seventh'
  | 'modalMixture'
  | 'secondaryDominant'
  | 'neapolitan'
  | 'chromaticMediant'
  | 'alteredChord';

/**
 * Difficulty level of a suggestion
 */
export type SuggestionDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Proposed chord change
 */
export interface ProposedChange {
  from: Chord;
  to: Chord;
}

/**
 * AI suggestion object (from spec)
 */
export interface AISuggestion {
  id: string;

  // Original Request
  userIntent: string; // e.g., "more ethereal"
  selectedChords: string[]; // Chord IDs

  // Suggestion Details
  technique: SuggestionTechnique;
  targetChord: string; // Chord ID to modify
  proposedChange: ProposedChange;

  // Explanation
  rationale: string; // "The added 9th creates shimmer..."
  examples: string[]; // ["Lauridsen", "Whitacre"]
  difficulty: SuggestionDifficulty;

  // Ranking
  relevanceScore: number; // 0-100
  impactScore: number; // 0-100 (how much it changes sound)
}

/**
 * Chord explanation (for "Why This?" feature)
 */
export interface ChordExplanation {
  // Context
  contextual: string; // Why this chord here?
  technical: string; // What is it doing?
  historical: string; // Who else uses this?

  // Evolution chain
  evolutionSteps: {
    name: string;
    description: string;
    chord: Chord;
  }[];
}

/**
 * Analysis result from "Analyze" feature
 */
export interface AnalysisResult {
  title: string;
  composer?: string;
  key: string;
  mode: 'major' | 'minor';
  tempo: number;
  chords: Chord[];
  confidence: number; // 0-1
}
```

### src/types/audio.ts

```typescript
/**
 * Audio engine state
 */
export type AudioEngineState = 'uninitialized' | 'ready' | 'playing' | 'error';

/**
 * Voice range (SATB)
 */
export interface VoiceRange {
  low: string; // e.g., "C3"
  high: string; // e.g., "C5"
}

/**
 * SATB ranges (from spec)
 */
export interface SATBRanges {
  soprano: VoiceRange;
  alto: VoiceRange;
  tenor: VoiceRange;
  bass: VoiceRange;
}

/**
 * Audio settings
 */
export interface AudioSettings {
  masterVolume: number; // 0.0-1.0
  tempo: number; // BPM
  reverbWetness: number; // 0.0-1.0
  compressionThreshold: number; // dB
}

/**
 * Playback state
 */
export interface PlaybackState {
  isPlaying: boolean;
  currentBeat: number;
  loopEnabled: boolean;
  loopStart?: number;
  loopEnd?: number;
}
```

### src/types/ui.ts

```typescript
/**
 * Modal types
 */
export type ModalType =
  | 'analyze'
  | 'refine'
  | 'welcome'
  | 'settings'
  | 'progressions'
  | null;

/**
 * Panel types
 */
export type PanelType = 'whyThis' | 'buildFromBones' | null;

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast notification
 */
export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // ms, undefined = persistent
}

/**
 * Context menu item
 */
export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
  divider?: boolean; // Show divider after this item
}

/**
 * User settings (from spec)
 */
export interface UserSettings {
  // Audio
  masterVolume: number; // 0.0-1.0
  tempo: number; // BPM

  // Display
  showConnectionLines: boolean;
  gridSnapping: boolean;
  snapResolution: number; // Fraction of beat (0.25 = sixteenth)

  // Interface
  hasSeenWelcome: boolean;
  keyboardShortcutsEnabled: boolean;

  // Preferences
  defaultKey: string;
  defaultMode: 'major' | 'minor';
  defaultTempo: number;
}
```

### src/types/index.ts (Barrel Export)

```typescript
/**
 * Central export for all types
 * Allows: import { Chord, Progression } from '@types'
 */

// Chord types
export type {
  Chord,
  ChordInput,
  ChordQuality,
  ScaleDegree,
  MusicalKey,
  Mode,
  ChordExtensions,
  ChromaticType,
  Voices,
  Position,
  ChordSource,
} from './chord';

// Progression types
export type {
  Progression,
  ProgressionInput,
  TimeSignature,
  AnalysisSource,
  AnalyzedFrom,
  BuildUpStep,
  BuildUp,
} from './progression';

// AI types
export type {
  AISuggestion,
  SuggestionTechnique,
  SuggestionDifficulty,
  ProposedChange,
  ChordExplanation,
  AnalysisResult,
} from './ai';

// Audio types
export type {
  AudioEngineState,
  VoiceRange,
  SATBRanges,
  AudioSettings,
  PlaybackState,
} from './audio';

// UI types
export type {
  ModalType,
  PanelType,
  ToastType,
  Toast,
  ContextMenuItem,
  UserSettings,
} from './ui';
```

## Style Files

### src/styles/globals.css

```css
/**
 * Global styles for Neume
 * Follows design system from spec
 */

/* CSS Reset */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Root variables (will be populated in Prompt 004) */
:root {
  /* Colors will be added in color system prompt */
  
  /* Typography */
  --font-ui: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-notation: 'DM Sans', 'Space Grotesk', monospace;
  --font-display: 'Recoleta', Georgia, serif;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
  --space-2xl: 32px;
  
  /* Borders */
  --border-radius-sm: 4px;
  --border-radius-md: 6px;
  --border-radius-lg: 8px;
  
  /* Shadows */
  --shadow-sm: 0 1px 4px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.16);
  
  /* Z-index layers */
  --z-canvas: 1;
  --z-controls: 10;
  --z-panel: 100;
  --z-modal: 1000;
  --z-toast: 10000;
}

/* Base styles */
html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  font-family: var(--font-ui);
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-primary, #2C3E50);
  background-color: var(--background, #FFFFFF);
  overflow-x: hidden;
}

/* Typography defaults */
h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-weight: 600;
  line-height: 1.2;
}

h1 {
  font-size: 24px;
}

h2 {
  font-size: 18px;
}

h3 {
  font-size: 15px;
}

p {
  margin: 0;
}

/* Buttons reset */
button {
  font-family: inherit;
  font-size: inherit;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Links */
a {
  color: var(--primary-action, #4A90E2);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* Focus styles */
*:focus-visible {
  outline: 2px solid var(--primary-action, #4A90E2);
  outline-offset: 2px;
}

/* Scrollbar styling (WebKit) */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Selection */
::selection {
  background-color: var(--primary-action, #4A90E2);
  color: white;
}

/* Utility classes */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### src/styles/variables.css

```css
/**
 * CSS Variables for Neume
 * Color values will be populated in Prompt 004 (Color System)
 */

:root {
  /* Color system will be added in next prompt */
  /* Typography, spacing, etc. are in globals.css */
  
  /* Animation easing (from spec) */
  --ease-apple-smooth: cubic-bezier(0.4, 0.0, 0.2, 1);
  --ease-breathe: cubic-bezier(0.45, 0.05, 0.55, 0.95);
  --ease-smooth-in: cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-smooth-out: cubic-bezier(0.4, 0.0, 1, 1);
  
  /* Timing */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 400ms;
  
  /* Layout dimensions (from spec) */
  --header-height: 50px;
  --controls-height: 60px;
  --panel-width: 380px;
}
```

## Constants Files

Create constants that will be used throughout the app:

### src/utils/constants.ts

```typescript
import type { SATBRanges } from '@types';

/**
 * SATB vocal ranges (from spec)
 */
export const SATB_RANGES: SATBRanges = {
  soprano: { low: 'C4', high: 'G5' },
  alto: { low: 'G3', high: 'D5' },
  tenor: { low: 'C3', high: 'G4' },
  bass: { low: 'E2', high: 'C4' },
};

/**
 * Default chord size (pixels)
 */
export const DEFAULT_CHORD_SIZE = 60;

/**
 * Default tempo (BPM)
 */
export const DEFAULT_TEMPO = 120;

/**
 * Grid snap resolution (beats)
 */
export const DEFAULT_SNAP_RESOLUTION = 0.25; // Sixteenth note

/**
 * Canvas viewport settings
 */
export const CANVAS_CONFIG = {
  DEFAULT_ZOOM: 1.0,
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 2.0,
  GRID_BEAT_WIDTH: 80, // pixels per beat
  MEASURES_VISIBLE: 8,
};

/**
 * Audio settings defaults (from spec)
 */
export const AUDIO_DEFAULTS = {
  MASTER_VOLUME: 0.7,
  REVERB_DECAY: 2.5,
  REVERB_WET: 0.35,
  COMPRESSION_THRESHOLD: -12,
  COMPRESSION_RATIO: 3,
};

/**
 * Animation durations (ms)
 */
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 400,
  PULSE: 600,
};
```

## Quality Criteria

- [ ] All folders created in correct structure
- [ ] All TypeScript types compile without errors
- [ ] No `any` types used (strict type safety)
- [ ] JSDoc comments on all interfaces
- [ ] Barrel exports work correctly (can import from '@types')
- [ ] Constants file has all defaults from spec
- [ ] CSS variables structure is ready for colors
- [ ] All types match spec exactly

## Implementation Notes

1. **Path Aliases:** The `@types` alias was configured in Prompt 001, so you can import like:
   ```typescript
   import { Chord, Progression } from '@types';
   ```

2. **Barrel Exports:** The `index.ts` file allows importing multiple types from one location.

3. **Helper Types:** `ChordInput` and `ProgressionInput` make it easier to create new objects without specifying every field.

4. **Constants:** The constants file provides single source of truth for values used throughout the app.

5. **CSS Variables:** We're setting up the structure now, but color values will be populated in Prompt 004.

## Testing Considerations

After creating this structure, test that:

1. **Imports work:**
   ```typescript
   import { Chord, Progression, AISuggestion } from '@types';
   import { DEFAULT_TEMPO, SATB_RANGES } from '@utils/constants';
   ```

2. **TypeScript compilation:**
   ```bash
   npx tsc --noEmit
   # Should complete with no errors
   ```

3. **Type checking works:**
   ```typescript
   const chord: Chord = {
     id: '123',
     scaleDegree: 1,
     quality: 'major',
     // TypeScript will require all required fields
   };
   ```

## Next Steps

After structure and types are complete:
1. Create color system constants (Prompt 004)
2. Build canvas grid component (Prompt 005)
3. Create chord shape component (Prompt 006)
4. Add watercolor background (Prompt 007)

---

**Output Format:** Provide complete folder structure creation commands and all TypeScript type definition files with full JSDoc comments.
