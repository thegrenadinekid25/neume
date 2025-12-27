# PROMPT-03: Documentation

## Objective

Create comprehensive documentation including a user guide, keyboard shortcuts reference, in-app help tooltips, and developer documentation for the codebase and API.

## Estimated Time: 2 hours

## Context

Good documentation reduces support burden and helps users discover features. It also enables future developers to contribute effectively.

**Dependencies:**
- All features complete (Weeks 1-6)
- Final UI/UX approved

## Requirements

### 1. User Guide (Help Center)

```markdown
# Neume User Guide

## Getting Started

### Creating Your First Block

1. Sign in to Neume
2. Click "New Block" or right-click on the canvas
3. Select a chord from the menu (start with I - the tonic)
4. Add more chords by right-clicking
5. Press Space to play your progression
6. Your work saves automatically

### Understanding the Interface

**Canvas** - Your workspace. Chords appear as colored shapes.

**Control Bar** - Bottom of screen. Play/pause, tempo dial, export.

**Library** - Access from "My Blocks" in the header.

## Working with Chords

### Adding Chords

Right-click anywhere on the canvas to open the chord menu:
- **I, ii, iii, IV, V, vi, vii** - Diatonic chords
- Select a chord to place it at that position

### Selecting Chords

- **Click** a chord to select it
- **Cmd/Ctrl + Click** to select multiple
- **Cmd/Ctrl + A** to select all
- **Escape** to deselect

### Moving Chords

- **Drag** a chord to reposition it
- Hold **Shift** while dragging to snap to grid
- Chords snap to beat divisions automatically

### Editing Chords

Right-click a selected chord:
- **Edit** - Change chord type or quality
- **Duplicate** - Create a copy
- **Delete** - Remove from canvas

### Deleting Chords

- Select and press **Delete** or **Backspace**
- Or right-click and choose "Delete"

## Playback

### Playing Your Progression

- Press **Space** to play/pause
- Click the play button in the control bar
- Chords pulse as they play

### Adjusting Tempo

- Drag the tempo dial left/right
- Or click on the dial and type a number (40-240 BPM)

## AI Features

### Analyze

Upload a song to extract its chord progression:

1. Click "Analyze" in the header
2. Paste a YouTube URL or upload an audio file
3. Wait for processing (30-60 seconds)
4. View the extracted chords on canvas

### Why This?

Learn why a specific chord was chosen:

1. Right-click any chord
2. Select "Why This?"
3. Read the explanation
4. Listen to the evolution from simple to complex
5. Try replacing with simpler versions

### Build From Bones

See how a complex progression was built:

1. After analyzing a piece, click "Build From Bones"
2. Navigate through the steps (skeleton → final)
3. Listen to each step to hear the transformation
4. Save any step to your library

### Refine This

Get AI suggestions for your progression:

1. Select one or more chords
2. Click "Refine This"
3. Describe how you want it to feel ("more ethereal", "darker")
4. Preview suggestions
5. Apply the ones you like

## Saving & Exporting

### Auto-Save

Your work saves automatically every 30 seconds. Look for the "Saved" indicator.

### Manual Save

Press **Cmd/Ctrl + S** to save immediately.

### Export MIDI

1. Click "Export MIDI" in the control bar
2. A .mid file downloads
3. Import into your DAW or notation software

## Account & Settings

### Profile

- Update your display name in Settings
- Connect Google or GitHub for easier sign-in

### Preferences

- **Default Key** - Starting key for new blocks
- **Default Tempo** - Starting tempo for new blocks
- **Grid Snapping** - Toggle snap-to-grid behavior

## Troubleshooting

### Audio Not Playing

1. Click anywhere on the page first (browser requirement)
2. Check your volume
3. Try refreshing the page

### Changes Not Saving

1. Check your internet connection
2. Look for "Offline" indicator
3. Wait for "Saving..." to complete

### Can't Analyze Video

- Ensure the YouTube URL is valid
- Some videos may not be analyzable
- Try a different video
```

### 2. Keyboard Shortcuts Reference

```typescript
// src/data/keyboard-shortcuts.ts
export const keyboardShortcuts = {
  playback: [
    { keys: ['Space'], action: 'Play/Pause' },
  ],
  editing: [
    { keys: ['Cmd/Ctrl', 'Z'], action: 'Undo' },
    { keys: ['Cmd/Ctrl', 'Shift', 'Z'], action: 'Redo' },
    { keys: ['Cmd/Ctrl', 'Y'], action: 'Redo (alternative)' },
    { keys: ['Delete'], action: 'Delete selected' },
    { keys: ['Backspace'], action: 'Delete selected' },
    { keys: ['Cmd/Ctrl', 'D'], action: 'Duplicate selected' },
    { keys: ['Cmd/Ctrl', 'A'], action: 'Select all' },
    { keys: ['Escape'], action: 'Deselect all' },
  ],
  navigation: [
    { keys: ['Arrow Left'], action: 'Previous chord / step' },
    { keys: ['Arrow Right'], action: 'Next chord / step' },
    { keys: ['Home'], action: 'Go to beginning' },
    { keys: ['End'], action: 'Go to end' },
  ],
  canvas: [
    { keys: ['Cmd/Ctrl', '+'], action: 'Zoom in' },
    { keys: ['Cmd/Ctrl', '-'], action: 'Zoom out' },
    { keys: ['Cmd/Ctrl', '0'], action: 'Reset zoom' },
  ],
  file: [
    { keys: ['Cmd/Ctrl', 'S'], action: 'Save now' },
    { keys: ['Cmd/Ctrl', 'E'], action: 'Export MIDI' },
    { keys: ['Cmd/Ctrl', 'N'], action: 'New block' },
  ],
  panels: [
    { keys: ['Cmd/Ctrl', '/'], action: 'Show keyboard shortcuts' },
    { keys: ['Escape'], action: 'Close panel/modal' },
  ],
};
```

```typescript
// src/components/KeyboardShortcutsModal.tsx
export function KeyboardShortcutsModal({ open, onClose }: ModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="shortcuts-modal">
        <h2>Keyboard Shortcuts</h2>
        
        {Object.entries(keyboardShortcuts).map(([category, shortcuts]) => (
          <section key={category}>
            <h3>{formatCategory(category)}</h3>
            <dl className="shortcuts-list">
              {shortcuts.map(({ keys, action }) => (
                <div key={action} className="shortcut-item">
                  <dt className="shortcut-keys">
                    {keys.map((key) => (
                      <kbd key={key}>{key}</kbd>
                    ))}
                  </dt>
                  <dd className="shortcut-action">{action}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </Modal>
  );
}
```

### 3. In-App Help Tooltips

```typescript
// src/components/HelpTooltip.tsx
interface HelpTooltipProps {
  id: string;
  children: React.ReactNode;
}

const helpContent: Record<string, { title: string; body: string }> = {
  'tempo-dial': {
    title: 'Tempo',
    body: 'Drag left/right to adjust speed. Range: 40-240 BPM.',
  },
  'analyze-button': {
    title: 'Analyze',
    body: 'Extract chord progressions from YouTube videos or audio files.',
  },
  'chord-shape': {
    title: 'Chord',
    body: 'Click to select. Drag to move. Right-click for options.',
  },
  'why-this': {
    title: 'Why This?',
    body: 'Learn why this chord was chosen and hear alternatives.',
  },
  'build-from-bones': {
    title: 'Build From Bones',
    body: 'See how this progression evolved from simple to complex.',
  },
  'refine-this': {
    title: 'Refine This',
    body: 'Get AI suggestions to modify your progression.',
  },
  'sync-status': {
    title: 'Sync Status',
    body: 'Shows whether your changes are saved to the cloud.',
  },
};

export function HelpTooltip({ id, children }: HelpTooltipProps) {
  const content = helpContent[id];
  if (!content) return <>{children}</>;

  return (
    <Tooltip
      content={
        <div className="help-tooltip">
          <strong>{content.title}</strong>
          <p>{content.body}</p>
        </div>
      }
      placement="top"
      delay={500}
    >
      {children}
    </Tooltip>
  );
}
```

### 4. Onboarding Tooltips (First-Time User)

```typescript
// src/hooks/useOnboarding.ts
const onboardingSteps = [
  {
    id: 'welcome',
    target: null,
    content: 'Welcome to Neume! Let\'s create your first chord progression.',
    placement: 'center',
  },
  {
    id: 'add-chord',
    target: '[data-tour="canvas"]',
    content: 'Right-click here to add your first chord.',
    placement: 'center',
  },
  {
    id: 'play',
    target: '[data-tour="play-button"]',
    content: 'Press Space or click here to play your progression.',
    placement: 'top',
  },
  {
    id: 'analyze',
    target: '[data-tour="analyze-button"]',
    content: 'Analyze songs to learn from the masters.',
    placement: 'bottom',
  },
  {
    id: 'library',
    target: '[data-tour="library-button"]',
    content: 'Your saved blocks appear here.',
    placement: 'bottom',
  },
];

export function useOnboarding() {
  const [step, setStep] = useState(0);
  const { hasSeenWelcome, setHasSeenWelcome } = usePreferences();

  const currentStep = onboardingSteps[step];
  const isComplete = step >= onboardingSteps.length;

  const next = () => setStep((s) => s + 1);
  const skip = () => {
    setStep(onboardingSteps.length);
    setHasSeenWelcome(true);
  };

  return {
    currentStep,
    isActive: !hasSeenWelcome && !isComplete,
    next,
    skip,
    step,
    totalSteps: onboardingSteps.length,
  };
}
```

### 5. Developer Documentation

```markdown
# Neume Developer Documentation

## Architecture Overview

```
src/
  components/     # React components
  pages/          # Route pages
  hooks/          # Custom hooks
  store/          # Zustand stores
  lib/            # Utilities, API clients
  ai/             # AI integration
  audio/          # Tone.js audio engine
  types/          # TypeScript types
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Zustand** - State management
- **React Query** - Data fetching
- **Tone.js** - Audio synthesis
- **Tonal.js** - Music theory
- **Supabase** - Backend (auth, database)
- **Framer Motion** - Animations
- **@dnd-kit** - Drag and drop

## State Management

### Canvas Store

```typescript
// src/store/canvas-store.ts
interface CanvasState {
  chords: Chord[];
  selectedIds: string[];
  key: string;
  mode: 'major' | 'minor';
  tempo: number;
  isPlaying: boolean;
  
  // Actions
  addChord: (chord: Chord) => void;
  updateChord: (id: string, updates: Partial<Chord>) => void;
  deleteChord: (id: string) => void;
  selectChord: (id: string, multi?: boolean) => void;
  setKey: (key: string) => void;
  setMode: (mode: 'major' | 'minor') => void;
  setTempo: (tempo: number) => void;
  play: () => void;
  pause: () => void;
}
```

### Using Stores

```typescript
// Subscribe to specific slice
const chords = useCanvasStore((state) => state.chords);

// Get actions
const { addChord, deleteChord } = useCanvasStore();
```

## Audio Engine

### Initialization

```typescript
import { audioEngine } from '@/audio/AudioEngine';

// Must be called on user interaction
await audioEngine.init();
```

### Playing Chords

```typescript
// Play single chord
audioEngine.playChord(chord, duration);

// Play progression
await audioEngine.playProgression(chords, tempo);

// Stop playback
audioEngine.stop();
```

## AI Integration

### Claude API

```typescript
import { analyzeChord, deconstructProgression, refineProgression } from '@/ai';

// Get chord explanation
const explanation = await analyzeChord(chord, context);

// Deconstruct to skeleton
const steps = await deconstructProgression(progression);

// Get refinement suggestions
const suggestions = await refineProgression(chords, intent);
```

## Database Schema

### Tables

- **profiles** - User profiles (extends auth.users)
- **blocks** - Chord progressions
- **user_preferences** - User settings

### Row-Level Security

All tables have RLS enabled. Users can only access their own data.

## API Reference

### Blocks API

```typescript
// Get all blocks
const blocks = await getBlocks({ limit: 20, offset: 0 });

// Get single block
const block = await getBlock(id);

// Create block
const newBlock = await createBlock({ name, chords, key, mode });

// Update block
const updated = await updateBlock(id, { name: 'New Name' });

// Delete block (soft delete)
await deleteBlock(id);
```

## Environment Variables

```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_ANTHROPIC_API_KEY=xxx  # For AI features
```

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Submit a pull request

## Code Style

- Use TypeScript strict mode
- Use functional components with hooks
- Prefer composition over inheritance
- Keep components small and focused
- Write tests for business logic
```

### 6. API Documentation

```typescript
// src/lib/api-docs.ts
// This generates OpenAPI-style documentation

export const apiDocs = {
  blocks: {
    list: {
      method: 'GET',
      path: '/blocks',
      description: 'List all blocks for the current user',
      params: {
        limit: { type: 'number', default: 20 },
        offset: { type: 'number', default: 0 },
        orderBy: { type: 'string', enum: ['created_at', 'updated_at', 'name'] },
        orderDir: { type: 'string', enum: ['asc', 'desc'] },
        search: { type: 'string', optional: true },
        favoritesOnly: { type: 'boolean', optional: true },
      },
      response: {
        blocks: 'Block[]',
        total: 'number',
      },
    },
    get: {
      method: 'GET',
      path: '/blocks/:id',
      description: 'Get a single block by ID',
      params: {
        id: { type: 'string', required: true },
      },
      response: 'Block',
      errors: {
        404: 'Block not found',
      },
    },
    create: {
      method: 'POST',
      path: '/blocks',
      description: 'Create a new block',
      body: {
        name: { type: 'string', required: true },
        chords: { type: 'Chord[]', required: true },
        key: { type: 'string', default: 'C' },
        mode: { type: 'string', default: 'major' },
        tempo: { type: 'number', default: 120 },
      },
      response: 'Block',
    },
    update: {
      method: 'PATCH',
      path: '/blocks/:id',
      description: 'Update an existing block',
      params: {
        id: { type: 'string', required: true },
      },
      body: 'Partial<Block>',
      response: 'Block',
    },
    delete: {
      method: 'DELETE',
      path: '/blocks/:id',
      description: 'Soft delete a block',
      params: {
        id: { type: 'string', required: true },
      },
      response: { success: 'boolean' },
    },
  },
};
```

## File Structure

```
docs/
  user-guide.md
  keyboard-shortcuts.md
  developer-guide.md
  api-reference.md
  changelog.md
src/
  data/
    keyboard-shortcuts.ts
    help-content.ts
    onboarding-steps.ts
  components/
    KeyboardShortcutsModal.tsx
    HelpTooltip.tsx
    OnboardingTour.tsx
```

## Quality Criteria

- [ ] User guide covers all features
- [ ] Keyboard shortcuts complete and accurate
- [ ] Help tooltips on all major elements
- [ ] Onboarding tour guides new users
- [ ] Developer docs explain architecture
- [ ] API docs list all endpoints
- [ ] Changelog tracks versions

## Testing Considerations

1. Verify all links in documentation
2. Test keyboard shortcuts match actual behavior
3. Verify tooltips appear on hover
4. Complete onboarding tour manually
5. Build developer docs locally
