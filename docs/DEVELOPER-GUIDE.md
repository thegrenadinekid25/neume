# Neume - Developer Guide

A modern web application for interactive chord composition and audio analysis, built with React, TypeScript, and Tone.js.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [State Management](#state-management)
3. [Audio Engine](#audio-engine)
4. [Component Architecture](#component-architecture)
5. [Local Development](#local-development)
6. [Code Style & Patterns](#code-style--patterns)
7. [File Structure](#file-structure)
8. [Common Development Tasks](#common-development-tasks)

---

## Architecture Overview

### Project Structure

Neume is a full-stack web application for music composition with AI-powered chord analysis:

```
neume/
├── src/
│   ├── audio/              # Audio synthesis and playback
│   ├── components/         # React UI components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # External API communication
│   ├── store/              # Zustand state management
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utilities and constants
│   ├── styles/             # Global styles and design tokens
│   ├── App.tsx             # Root component
│   └── main.tsx            # Application entry point
├── backend/                # Python Flask backend (optional)
├── docs/                   # Documentation
└── package.json            # Dependencies and scripts
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | React 18 | UI component library |
| **Language** | TypeScript 5.6 | Type-safe JavaScript |
| **State Management** | Zustand 5 | Lightweight state container |
| **Build Tool** | Vite 6 | Fast module bundler |
| **Audio** | Tone.js 15 | Web Audio API wrapper |
| **Music Theory** | Tonal 6.4 | Music notation & analysis |
| **Drag & Drop** | dnd-kit | Accessible drag-drop system |
| **Animation** | Framer Motion 12 | React animation library |
| **UI Components** | CSS Modules | Component-scoped styling |

### Key Features

- **Interactive Canvas**: Drag-and-drop chord composition on a timeline
- **Audio Synthesis**: SATB voicing with Tone.js polyphonic synth
- **Chord Analysis**: AI-powered chord extraction from YouTube/audio files
- **Voice Leading**: SATB voice leading rules validation
- **Playback**: Real-time MIDI-like progression playback
- **Keyboard Shortcuts**: Full keyboard control support

---

## State Management

### Zustand Stores

Neume uses **Zustand** for global state management. All stores are located in `/src/store/` and follow a consistent pattern.

#### Store Pattern

```typescript
import { create } from 'zustand';

interface StateInterface {
  // State properties
  value: string;
  // Action methods
  setValue: (val: string) => void;
}

export const useMyStore = create<StateInterface>((set, get) => ({
  value: 'initial',
  setValue: (val) => set({ value: val }),
}));
```

### Core Stores

#### 1. `canvas-store.ts` - Canvas & Chord Management

**Purpose**: Core state for chord progression editing and visualization

**Key State**:
- `chords`: Array of Chord objects on the canvas
- `selectedChordIds`: Currently selected chord IDs
- `currentKey`: Musical key (C, D, E, etc.)
- `currentMode`: Major or minor mode
- `tempo`: BPM (beats per minute)
- `zoom`: Canvas zoom level
- `isPlaying`: Playback state
- `playheadPosition`: Current playback beat
- `masterVolume`: Audio output level

**Key Actions**:
```typescript
// Chord management
addChord(chord)          // Add new chord to canvas
removeChord(id)          // Remove single chord
removeChords(ids)        // Remove multiple chords
updateChord(id, updates) // Modify chord properties
clearChords()            // Clear all chords

// Selection
selectChord(id)          // Select single chord
selectChords(ids)        // Select multiple chords
toggleChordSelection(id) // Toggle selection state
selectAll()              // Select all chords
selectRange(fromId, toId)// Select range between two chords

// View
setZoom(zoom)            // Update canvas zoom
setCurrentKey(key)       // Change musical key
setCurrentMode(mode)     // Switch major/minor
setTempo(bpm)           // Update tempo

// Playback
setIsPlaying(bool)       // Start/stop playback
setPlayheadPosition(beat)// Update playhead position

// Load analyzed progression
loadAnalyzedProgression({ chords, key, mode, tempo, phrases })
```

**Usage in Components**:
```typescript
import { useCanvasStore } from '@/store/canvas-store';

function MyComponent() {
  const chords = useCanvasStore(state => state.chords);
  const addChord = useCanvasStore(state => state.addChord);
  const selectedIds = useCanvasStore(state => state.selectedChordIds);

  // Zustand will re-render only when selected properties change
}
```

#### 2. `analysis-store.ts` - Chord Analysis

**Purpose**: Manage AI-powered chord extraction from YouTube/audio

**Key State**:
- `isModalOpen`: Analysis modal visibility
- `activeTab`: 'youtube' or 'audio'
- `isAnalyzing`: Processing in progress
- `progress`: Analysis progress object with stage/message
- `result`: Analyzed chord progression data
- `convertedChords`: Chords in canvas format
- `metadata`: Title, source, timestamp

**Key Actions**:
```typescript
openModal()              // Show analysis modal
closeModal()             // Hide modal
setActiveTab(tab)        // Switch between YouTube/audio
startAnalysis(input)     // Begin analysis (async)
updateProgress(progress) // Update progress indicator
setError(error)          // Set error state
clearAnalyzedProgression()
```

**Analysis Flow**:
1. User opens modal and selects YouTube/audio
2. `startAnalysis()` uploads audio and calls backend API
3. Backend returns `AnalysisResult` with detected chords
4. Chords converted to canvas format via `convertAnalysisResultToChords()`
5. `loadAnalyzedProgression()` called on canvas store
6. Modal closes automatically on success

#### 3. `why-this-store.ts` - Chord Explanation Panel

**Purpose**: AI-powered explanations of why chords work

**Key State**:
- `isOpen`: Panel visibility
- `selectedChord`: Currently explained chord
- `explanation`: AI-generated explanation
- `isPlayingIsolated`: Playing chord alone

#### Other Stores

- **`progressions-store.ts`**: Save/load user progressions
- **`build-from-bones-store.ts`**: Chord suggestion engine
- **`refine-store.ts`**: Progression refinement suggestions

### Store Usage Patterns

#### Selecting State Slices

```typescript
// Good: Only re-render when needed
const chords = useCanvasStore(state => state.chords);

// Avoid: Re-renders on any store change
const state = useCanvasStore();
```

#### Batch Updates

```typescript
// Use set with function form for multiple updates
useCanvasStore.setState((state) => ({
  chords: [...state.chords, newChord],
  selectedChordIds: [newChord.id],
}));
```

#### Cross-Store Communication

```typescript
// From one store, call another
const { loadAnalyzedProgression } = useCanvasStore.getState();
loadAnalyzedProgression({ chords, key, mode, tempo });
```

---

## Audio Engine

The audio engine provides synthesized playback of chord progressions with professional audio processing.

### AudioEngine Class

**Location**: `/src/audio/AudioEngine.ts`

**Core Responsibilities**:
- Web Audio API initialization
- Polyphonic synth voice management
- Signal chain (filters, reverb, compression)
- Master volume control

#### Signal Chain Architecture

```
Synth (PolySynth)
  ↓
Highpass Filter (60 Hz)
  ↓
Lowpass Filter (4000 Hz)
  ↓
Reverb (2.5s decay, 35% wet)
  ↓
Compressor (threshold: -12dB, ratio: 3:1)
  ↓
Master Gain
  ↓
System Audio Output
```

#### Class API

```typescript
class AudioEngine {
  // Initialization
  async initialize(): Promise<void>

  // Playback
  playChord(notes: string[], duration: number): void
  playNote(note: string, duration: number): void
  stopAll(): void

  // Volume
  setMasterVolume(volume: number): void
  getMasterVolume(): number

  // Reverb
  setReverbWet(wetAmount: number): void
  getReverbWet(): number

  // Cleanup
  dispose(): void
  getIsInitialized(): boolean
}

// Singleton instance
export const audioEngine = new AudioEngine();
```

#### Usage Example

```typescript
import { audioEngine } from '@/audio/AudioEngine';

// Initialize (must be called in response to user interaction)
await audioEngine.initialize();

// Play a chord
audioEngine.playChord(['C3', 'E3', 'G3', 'C4'], 2.0);

// Play single note
audioEngine.playNote('C4', 1.0);

// Control volume
audioEngine.setMasterVolume(0.8);
audioEngine.setReverbWet(0.5);

// Cleanup on app exit
audioEngine.dispose();
```

### PlaybackSystem Class

**Location**: `/src/audio/PlaybackSystem.ts`

Manages progression playback with timing and callbacks.

#### Class API

```typescript
class PlaybackSystem {
  // Control
  play(): void
  pause(): void
  stop(): void
  togglePlay(): void

  // Scheduling
  scheduleProgression(chords: Chord[]): void

  // Tempo
  setTempo(bpm: number): void
  getTempo(): number

  // Positioning
  getCurrentBeat(): number

  // Callbacks
  setPlayheadCallback(callback: (beat: number) => void): void
  setChordTriggerCallback(callback: (chordId: string) => void): void
  setPlaybackEndCallback(callback: () => void): void
  setTotalBeats(beats: number): void

  // Cleanup
  dispose(): void
}

export const playbackSystem = new PlaybackSystem();
```

#### Beat to Time Conversion

```typescript
// Tone.js uses "bars:beats:sixteenths" format
private beatToTransportTime(beat: number): string {
  const bars = Math.floor(beat / 4);      // 4 beats per bar
  const beats = beat % 4;
  return `${bars}:${beats}:0`;
}
```

### VoiceLeading Module

**Location**: `/src/audio/VoiceLeading.ts`

Implements SATB (Soprano-Alto-Tenor-Bass) voice leading rules.

#### Voice Ranges

```typescript
const VOICE_RANGES = {
  soprano: { low: 60,  high: 79 }, // C4 to G5
  alto:    { low: 55,  high: 74 }, // G3 to D5
  tenor:   { low: 48,  high: 67 }, // C3 to G4
  bass:    { low: 40,  high: 60 }, // E2 to C4
};
```

#### Key Functions

```typescript
// Generate SATB voicing for a chord
function generateSATBVoicing(chord: Chord, previousVoicing?: Voices): Voices

// Validate voice leading rules
function validateVoiceLeading(
  prevVoicing: Voices,
  currVoicing: Voices,
  currChordNotes: string[],
  key: MusicalKey,
  hasSuspension?: boolean
): VoiceLeadingValidation

// Check if note would cause voice crossing
function wouldCauseVoiceCrossing(
  partialVoicing: Partial<Voices>,
  voice: VoiceType,
  note: string
): boolean
```

#### Validation Rules

The `validateVoiceLeading()` function checks:

1. **Parallel Fifths**: Detects when two voices move in parallel by perfect fifth
2. **Parallel Octaves**: Same motion by octave/unison
3. **Voice Crossing**: Soprano below alto, alto below tenor, etc.
4. **Voice Overlap**: Spacing greater than one octave between adjacent voices
5. **Common Tones**: Tracks how well common tones are retained
6. **Tendency Tones**: Validates resolution of leading tones and sevenths

---

## Component Architecture

### Component Organization

Components are organized by feature area:

```
components/
├── Audio/              # Audio initialization and controls
├── Canvas/             # Main composition canvas and chords
├── Controls/           # Tempo, volume, playback controls
├── Modals/             # Analysis modal, help dialogs
├── Panels/             # Side panels (why this, explanations)
└── UI/                 # Reusable UI elements
```

### Canvas Components

The canvas is the main editing area where users compose chord progressions.

#### Component Hierarchy

```
Canvas (Main container with timeline ruler)
  ├─ TimelineRuler (Beat/measure display)
  ├─ PhraseBackgrounds (Visual grouping)
  ├─ Playhead (Playback position indicator)
  └─ DroppableCanvas (Chord drop zone)
      └─ DraggableChord[] (Individual chord shapes)
          └─ ChordShape (Visual representation)
```

#### Canvas Component Props

```typescript
interface CanvasProps {
  currentKey: MusicalKey;         // Current key
  currentMode: Mode;               // Major/minor
  zoom?: number;                   // Canvas zoom level
  isPlaying?: boolean;             // Playback state
  playheadPosition?: number;       // Current beat
  totalBeats?: number;             // Total timeline length
  phrases?: PhraseBoundary[];      // Grouped sections
  onCanvasClick?: (event) => void; // Click handler
  onAddChord?: (degree) => void;   // Add chord handler
  onZoomChange?: (zoom) => void;   // Zoom change
}
```

### Key Components

#### ChordShape.tsx

Renders individual chord visualization.

```typescript
interface ChordShapeProps {
  chord: Chord;
  isSelected: boolean;
  isPlaying: boolean;
  onClick?: () => void;
  onAltClick?: () => void;
}

// Usage
<ChordShape
  chord={chordData}
  isSelected={selectedIds.includes(chord.id)}
  isPlaying={currentChordId === chord.id}
  onClick={() => selectChord(chord.id)}
/>
```

#### DraggableChord.tsx

Wrapper that makes chords draggable using dnd-kit.

```typescript
interface DraggableChordProps {
  chord: Chord;
  isSelected: boolean;
  onPositionChange: (x: number, y: number) => void;
}
```

#### Canvas.tsx

Main container managing layout, panning, and zooming.

**Features**:
- Horizontal scrolling (panning)
- Mouse wheel zoom (Ctrl/Cmd + scroll)
- Right-click context menu
- Timeline synchronization
- Keyboard shortcuts

#### TimelineRuler.tsx

Displays beat/measure markers and timing.

```typescript
interface TimelineRulerProps {
  zoom: number;
  beatsPerMeasure?: number;
  totalBeats?: number;
}
```

#### Playhead.tsx

Animated playback position indicator.

```typescript
interface PlayheadProps {
  position: number;  // Current beat
  zoom: number;
  totalBeats: number;
}
```

### Analysis Components

#### AnalyzeModal.tsx

Modal for YouTube/audio file analysis.

**Features**:
- Tab switching (YouTube/Audio)
- File upload
- YouTube URL parsing
- Progress indication
- Error handling

### Control Components

#### Controls/TempoDial.tsx

BPM tempo control.

```typescript
interface TempoDialProps {
  value: number;
  onChange: (bpm: number) => void;
  min?: number;
  max?: number;
}
```

---

## Local Development

### Prerequisites

- Node.js 16+ (18 recommended)
- npm or yarn
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd composer

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Development Server

```bash
npm run dev
```

Starts Vite dev server with hot module replacement (HMR). Changes automatically reflect in the browser.

### Building for Production

```bash
npm run build
```

Outputs optimized build to `/dist` directory. Includes:
- TypeScript compilation
- Code minification
- Tree-shaking
- Asset optimization

**Build process**:
1. `tsc -b` - TypeScript compilation with project references
2. `vite build` - Bundling and optimization

### Type Checking

```bash
npm run tsc --noEmit
```

Or configure IDE for real-time type checking.

### Linting

```bash
npm run lint
```

Runs ESLint with React and React Hooks rules.

**Configuration**: `/eslintrc.js` (if present) or package.json eslintConfig

### Preview Production Build

```bash
npm run preview
```

Locally preview the production build before deployment.

### Environment Setup

Create `.env.local` for local overrides:

```env
VITE_API_URL=http://localhost:8000
```

Used in analysis store:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

### Working with Backend API

The app communicates with a Python Flask backend for chord analysis.

**Expected endpoints**:

```
POST /api/analyze
  Request: { type, youtubeUrl, uploadId, startTime, endTime, keyHint, modeHint }
  Response: { success, result: AnalysisResult, error }

POST /api/upload
  Request: FormData with audio file
  Response: { uploadId, expiresAt }
```

See `/backend/main.py` for implementation.

---

## Code Style & Patterns

### TypeScript Strict Mode

Neume uses TypeScript strict mode (`"strict": true` in tsconfig.json):

```typescript
// Always type function parameters and returns
function processChords(chords: Chord[]): Chord[] {
  return chords.filter(c => c.duration > 0);
}

// Use type imports for better tree-shaking
import type { Chord, MusicalKey } from '@/types';

// Avoid `any` - use explicit types
function wrong(data: any) { }
function correct(data: unknown): string { }
```

### Functional Components & Hooks

All React components are functional with hooks:

```typescript
import React, { useState, useEffect, useCallback } from 'react';

interface MyComponentProps {
  title: string;
  onClose?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onClose }) => {
  const [state, setState] = useState(0);

  useEffect(() => {
    // Setup/cleanup
    return () => {
      // Cleanup
    };
  }, []);

  const handleClick = useCallback(() => {
    // Handler
  }, []);

  return <div>{title}</div>;
};
```

### Custom Hooks

Extract reusable logic into custom hooks:

```typescript
// Location: src/hooks/useMyFeature.ts
import { useState, useCallback } from 'react';

export function useMyFeature() {
  const [state, setState] = useState(null);

  const action = useCallback(() => {
    setState(prev => ({ ...prev }));
  }, []);

  return { state, action };
}

// Usage
import { useMyFeature } from '@/hooks/useMyFeature';

export const MyComponent = () => {
  const { state, action } = useMyFeature();
};
```

### CSS Modules

Component styles use CSS Modules for scoping:

```typescript
import styles from './MyComponent.module.css';

export const MyComponent = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>Title</div>
    </div>
  );
};
```

```css
/* MyComponent.module.css */
.container {
  display: flex;
  flex-direction: column;
}

.header {
  font-size: 1.5rem;
  font-weight: bold;
}
```

### Global Styles

Global styles in `/src/styles/`:

- **`colors.ts`** - Color palette as TypeScript constants
- **`variables.css`** - CSS custom properties
- **`globals.css`** - Base styles and resets

### Type Definitions

Type definitions in `/src/types/`:

```typescript
// src/types/chord.ts
export type MusicalKey = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type Mode = 'major' | 'minor';
export type ChordQuality = 'major' | 'minor' | 'diminished' | 'augmented' | 'dom7' | 'maj7' | 'min7' | 'halfdim7' | 'dim7';
export type ScaleDegree = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Voices {
  soprano: string;   // Note name (e.g., 'C4')
  alto: string;
  tenor: string;
  bass: string;
}

export interface ChordExtensions {
  add9?: boolean;
  add11?: boolean;
  add13?: boolean;
  sus2?: boolean;
  sus4?: boolean;
  // ... more extensions
}

export interface Chord {
  id: string;
  scaleDegree: ScaleDegree;
  quality: ChordQuality;
  extensions: ChordExtensions;
  key: MusicalKey;
  mode: Mode;
  isChromatic: boolean;
  voices: Voices;
  startBeat: number;
  duration: number;
  position: { x: number; y: number };
  size: number;
  selected: boolean;
  playing: boolean;
  source: 'user' | 'analysis' | 'suggestion';
  createdAt: string;
}
```

### Import Path Aliases

Use TypeScript path aliases for cleaner imports:

```typescript
// Good
import { useCanvasStore } from '@/store/canvas-store';
import { AudioEngine } from '@/audio/AudioEngine';
import type { Chord } from '@/types';

// Avoid
import { useCanvasStore } from '../../../store/canvas-store';
import { AudioEngine } from '../../../audio/AudioEngine';
```

**Configured in `tsconfig.json`**:
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@components/*": ["./src/components/*"],
    "@utils/*": ["./src/utils/*"],
    "@types/*": ["./src/types/*"],
    "@audio/*": ["./src/audio/*"],
    "@store/*": ["./src/store/*"],
    "@hooks/*": ["./src/hooks/*"]
  }
}
```

### Error Handling

Use try-catch with proper typing:

```typescript
async function analyzeAudio(file: File): Promise<void> {
  try {
    const result = await api.analyzeAudio(file);
    setAnalysis(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    setError(message);
  }
}
```

---

## File Structure

### Type System

**`/src/types/`** - Central location for all type definitions:

```
types/
├── index.ts           # Main type exports
├── chord.ts           # Chord-related types
├── analysis.ts        # Analysis API types
├── audio.ts           # Audio engine types
├── progression.ts     # Progression types
├── ui.ts              # UI component types
├── ai.ts              # AI explanation types
└── audio.ts           # Audio processing types
```

### Services

**`/src/services/`** - External API communication:

- **`api-service.ts`** - Backend API client
- **`explanation-service.ts`** - AI explanation service
- **`progression-storage.ts`** - Local storage management

### Utils

**`/src/utils/`** - Helper functions and constants:

- **`constants.ts`** - Configuration and defaults
- **`chord-converter.ts`** - Analysis result conversion
- **`youtube-parser.ts`** - URL parsing
- **`colors.ts`** - Color palette

### Styles

**`/src/styles/`** - Global styling:

- **`colors.ts`** - Color constants
- **`variables.css`** - CSS custom properties
- **`globals.css`** - Reset and base styles

---

## Common Development Tasks

### Adding a New Store

1. Create store file: `/src/store/my-feature-store.ts`

```typescript
import { create } from 'zustand';

interface MyState {
  // State
  value: string;
  // Actions
  setValue: (val: string) => void;
}

export const useMyStore = create<MyState>((set) => ({
  value: 'initial',
  setValue: (val) => set({ value: val }),
}));
```

2. Export from store index (if using barrel export)
3. Use in components:

```typescript
import { useMyStore } from '@/store/my-feature-store';

function Component() {
  const value = useMyStore(state => state.value);
  const setValue = useMyStore(state => state.setValue);
}
```

### Adding a New Component

1. Create directory: `/src/components/MyFeature/`
2. Create component: `/src/components/MyFeature/MyComponent.tsx`

```typescript
import React from 'react';
import styles from './MyComponent.module.css';

interface MyComponentProps {
  title: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <div className={styles.container}>
      <h1>{title}</h1>
    </div>
  );
};
```

3. Create styles: `/src/components/MyFeature/MyComponent.module.css`
4. Create index (optional): `/src/components/MyFeature/index.ts`

```typescript
export { MyComponent } from './MyComponent';
```

### Adding a Custom Hook

1. Create file: `/src/hooks/useMyHook.ts`

```typescript
import { useState, useCallback } from 'react';

export interface UseMyHookReturn {
  state: string;
  action: () => void;
}

export function useMyHook(): UseMyHookReturn {
  const [state, setState] = useState('initial');

  const action = useCallback(() => {
    setState('updated');
  }, []);

  return { state, action };
}
```

2. Use in components:

```typescript
import { useMyHook } from '@/hooks/useMyHook';

function MyComponent() {
  const { state, action } = useMyHook();
}
```

### Integrating Audio Playback

1. Import hook in component:

```typescript
import { usePlayback } from '@/hooks/usePlayback';
import { useCanvasStore } from '@/store/canvas-store';

function PlaybackComponent() {
  const chords = useCanvasStore(state => state.chords);
  const {
    isPlaying,
    playheadPosition,
    play,
    pause,
    stop,
    setTempo,
  } = usePlayback(chords);
}
```

2. Use playback controls:

```typescript
<button onClick={play}>Play</button>
<button onClick={pause}>Pause</button>
<button onClick={stop}>Stop</button>
<input
  type="range"
  min="60"
  max="180"
  onChange={(e) => setTempo(Number(e.target.value))}
/>
```

### Calling Backend API

1. Use `api-service` for communication:

```typescript
import { analyzeAudio } from '@/services/api-service';

async function handleAnalysis(file: File) {
  try {
    const response = await analyzeAudio({
      type: 'audio',
      audioFile: file,
      keyHint: 'C',
      modeHint: 'major',
    });

    if (response.success) {
      // Handle result
    } else {
      // Handle error
    }
  } catch (error) {
    console.error('Analysis failed:', error);
  }
}
```

### Debugging

#### React Developer Tools

Install React DevTools browser extension for:
- Component tree inspection
- Props/state visualization
- Hook tracking
- Performance profiling

#### Console Logging

```typescript
// Log state changes
import { useCanvasStore } from '@/store/canvas-store';

useCanvasStore.subscribe(
  state => state.chords,
  (chords) => console.log('Chords updated:', chords)
);
```

#### Vite Dev Server Debugging

1. Open DevTools (F12)
2. Sources tab shows original TypeScript files
3. Set breakpoints directly in source files

#### Network Requests

Use DevTools Network tab to monitor API calls:
- Check request/response bodies
- Verify headers
- Monitor timing

---

## Best Practices

### Performance

1. **Memoize Components**: Use `React.memo()` for expensive renders

```typescript
export const ChordShape = React.memo(({ chord, isSelected }: Props) => {
  // Component only re-renders when props change
});
```

2. **Zustand State Slicing**: Only subscribe to needed state

```typescript
// Good - only subscribes to chords
const chords = useCanvasStore(state => state.chords);

// Bad - re-renders on any state change
const { chords, selectedIds, tempo } = useCanvasStore();
```

3. **useCallback for Event Handlers**: Prevent unnecessary function recreation

```typescript
const handleClick = useCallback(() => {
  // Logic
}, [dependency]);
```

### Code Organization

1. **Group Related Code**: Keep related logic together
2. **Extract Custom Hooks**: Reusable logic belongs in hooks
3. **Use Type Aliases**: Define complex types once, reuse everywhere
4. **Consistent Naming**: Follow naming conventions consistently

### Testing

While full test setup isn't configured, consider:
- Unit testing utilities and type guards
- Integration testing stores
- E2E testing critical flows

### Documentation

- Add JSDoc comments to public functions
- Document complex algorithms
- Keep README up-to-date
- Document environment variables

---

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Tone.js Documentation](https://tonejs.org)
- [Tonal.js API](https://github.com/tonaljs/tonal)
- [dnd-kit Documentation](https://docs.dndkit.com)
- [Vite Guide](https://vitejs.dev/guide/)

---

## Contributing

1. Create feature branch from `main`
2. Follow code style guidelines
3. Test changes locally
4. Submit pull request with description
5. Ensure CI checks pass

For questions, consult the codebase comments and architecture decisions documented in commit messages.
