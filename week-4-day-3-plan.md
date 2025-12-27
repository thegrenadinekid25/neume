# Week 4 Day 3 Implementation Plan

## Goal: Build the "Why This?" Panel and AI Explanation System

This plan covers Prompts 004 (WhyThisPanel) and 005 (AI Explanation System), broken into parallelizable tasks for Haiku agents.

---

## Architecture Overview

### Component Structure
```
src/
├── components/
│   └── Panels/
│       ├── WhyThisPanel.tsx          (Task 1)
│       └── WhyThisPanel.module.css   (Task 1)
├── store/
│   └── why-this-store.ts             (Task 2)
├── services/
│   └── explanation-service.ts        (Task 3)
└── types/
    └── explanation.ts                (Task 4 - may need updates)
```

### Data Flow
```
User Right-Click Chord → Context Menu "Why This?" → Store Opens Panel →
Panel Fetches Explanation → AI Service (with cache check) →
Claude API → Parse Response → Display in Panel
```

---

## Phase 1: Parallel Foundation Tasks (Can run simultaneously)

### Task 1: WhyThisPanel Component + CSS
**File:** `/Users/connorspencer/Documents/1. Projects/composer/src/components/Panels/WhyThisPanel.tsx`
**File:** `/Users/connorspencer/Documents/1. Projects/composer/src/components/Panels/WhyThisPanel.module.css`

**Dependencies:** None (can start immediately)

**Instructions:**
1. Create panel component that slides in from right (380px wide, matches `--panel-width` in variables.css)
2. Use framer-motion for slide animation (pattern from AnalyzeModal)
3. Use createPortal for DOM rendering (pattern from ContextMenu.tsx)

**Component Structure:**
```tsx
interface WhyThisPanelProps {
  // Props will come from store via hook
}

// Sections to implement:
// 1. Header with close button and chord name
// 2. Context Explanation section (2-3 sentences)
// 3. Evolution Chain section (3-4 steps with play buttons)
// 4. Play Controls section (Isolated, In Progression, Evolution Chain)
// 5. Try It Yourself section (replacement options)
// 6. Loading skeleton state
// 7. Error state with retry button
```

**CSS Requirements:**
- Follow patterns from `/Users/connorspencer/Documents/1. Projects/composer/src/components/Modals/AnalyzeModal.module.css`
- Use CSS variables from `/Users/connorspencer/Documents/1. Projects/composer/src/styles/variables.css`
- Panel slides from right edge with backdrop overlay
- Typography: 13px Inter Regular body, 15px headings
- Colors: Use `--primary-action` (#4A90E2), `--text-primary`, `--text-secondary`
- Animation: 300ms slide, use `--ease-apple-smooth`

**Key CSS Classes:**
```css
.overlay - semi-transparent backdrop (rgba(0,0,0,0.5))
.panel - fixed position, right: 0, width: 380px, height: 100vh
.header - title + close button
.section - each content block
.evolutionStep - step container with chord preview + description
.playButton - styled play control
.replaceButton - "Try it yourself" action buttons
.loading - skeleton/spinner state
.error - error message with retry
```

---

### Task 2: WhyThis Store (Zustand)
**File:** `/Users/connorspencer/Documents/1. Projects/composer/src/store/why-this-store.ts`

**Dependencies:** None (can start immediately)

**Pattern to Follow:** `/Users/connorspencer/Documents/1. Projects/composer/src/store/analysis-store.ts`

**Instructions:**
```typescript
import { create } from 'zustand';
import type { Chord } from '@/types/chord';
import type { ChordExplanation } from '@/types/ai';

interface WhyThisState {
  // Panel visibility
  isOpen: boolean;
  
  // Selected chord for explanation
  selectedChord: Chord | null;
  
  // Context chords (for "in progression" playback)
  previousChord: Chord | null;
  nextChord: Chord | null;
  
  // Explanation data
  explanation: ChordExplanation | null;
  isLoading: boolean;
  error: string | null;
  
  // Currently playing state
  isPlayingIsolated: boolean;
  isPlayingInProgression: boolean;
  isPlayingEvolution: boolean;
  currentEvolutionStep: number;
  
  // Actions
  openPanel: (chord: Chord, prevChord?: Chord, nextChord?: Chord) => void;
  closePanel: () => void;
  setExplanation: (explanation: ChordExplanation) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Playback actions
  playIsolated: () => void;
  playInProgression: () => void;
  playEvolutionChain: () => void;
  stopPlayback: () => void;
  
  // Replace actions
  replaceWithEvolutionStep: (stepIndex: number) => void;
  
  reset: () => void;
}

export const useWhyThisStore = create<WhyThisState>((set, get) => ({
  // Initial state
  isOpen: false,
  selectedChord: null,
  previousChord: null,
  nextChord: null,
  explanation: null,
  isLoading: false,
  error: null,
  isPlayingIsolated: false,
  isPlayingInProgression: false,
  isPlayingEvolution: false,
  currentEvolutionStep: -1,
  
  // Implement all actions...
}));
```

**Key Considerations:**
- Store should not directly call audio - instead expose state that components can use with useAudioEngine hook
- The `openPanel` action should trigger the explanation fetch (call the service)
- Include source piece info if chord has `analyzedFrom` property

---

### Task 3: AI Explanation Service
**File:** `/Users/connorspencer/Documents/1. Projects/composer/src/services/explanation-service.ts`

**Dependencies:** None (can start immediately)

**Pattern to Follow:** `/Users/connorspencer/Documents/1. Projects/composer/src/services/api-service.ts`

**Instructions:**
```typescript
import type { Chord } from '@/types/chord';
import type { ChordExplanation } from '@/types/ai';

// Cache configuration
const CACHE_PREFIX = 'neume_explanation_';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface ExplanationContext {
  key: string;
  mode: string;
  prevChord?: Chord;
  nextChord?: Chord;
  sourcePiece?: string;
}

interface CachedExplanation {
  explanation: ChordExplanation;
  timestamp: number;
}

// Generate cache key
function getCacheKey(chord: Chord, context: ExplanationContext): string {
  return `${CACHE_PREFIX}${chord.id}_${context.key}_${context.mode}`;
}

// Check localStorage cache
function getCachedExplanation(key: string): ChordExplanation | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const parsed: CachedExplanation = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > CACHE_TTL_MS;
    
    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }
    
    return parsed.explanation;
  } catch {
    return null;
  }
}

// Save to cache
function setCachedExplanation(key: string, explanation: ChordExplanation): void {
  try {
    const cached: CachedExplanation = {
      explanation,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cached));
  } catch (error) {
    console.warn('Failed to cache explanation:', error);
  }
}

// Mock/fallback explanations for when API unavailable
function getMockExplanation(chord: Chord, context: ExplanationContext): ChordExplanation {
  // Implement intelligent fallback based on chord theory
  // See detailed fallback logic below
}

// Main export function
export async function explainChord(
  chord: Chord,
  context: ExplanationContext
): Promise<ChordExplanation> {
  const cacheKey = getCacheKey(chord, context);
  
  // 1. Check cache first
  const cached = getCachedExplanation(cacheKey);
  if (cached) return cached;
  
  // 2. Try API call
  try {
    const explanation = await fetchExplanationFromAPI(chord, context);
    setCachedExplanation(cacheKey, explanation);
    return explanation;
  } catch (error) {
    console.warn('API call failed, using fallback:', error);
    return getMockExplanation(chord, context);
  }
}

// API call implementation
async function fetchExplanationFromAPI(
  chord: Chord,
  context: ExplanationContext
): Promise<ChordExplanation> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error('Anthropic API key not configured');
  }
  
  // NOTE: In production, this should go through a backend proxy
  // to avoid exposing API key in client. For now, direct call.
  const prompt = buildPrompt(chord, context);
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json();
  const text = data.content[0].text;
  
  // Parse JSON from response
  return parseExplanationResponse(text);
}
```

**Mock Explanation Logic:**
```typescript
function getMockExplanation(chord: Chord, context: ExplanationContext): ChordExplanation {
  const { scaleDegree, quality, extensions } = chord;
  
  // Generate contextual explanation based on music theory
  const contextual = getContextualDescription(scaleDegree, quality, context);
  const technical = getTechnicalDescription(scaleDegree, quality, extensions);
  const historical = getHistoricalContext(scaleDegree, quality);
  
  // Generate evolution steps (simple → complex)
  const evolutionSteps = generateEvolutionSteps(chord);
  
  return {
    contextual,
    technical,
    historical,
    evolutionSteps,
  };
}

// Helper: Scale degree descriptions
const SCALE_DEGREE_CONTEXT: Record<number, string> = {
  1: 'The tonic chord provides stability and resolution, serving as the home base of the key.',
  2: 'The supertonic creates gentle tension that often leads to the dominant or tonic.',
  3: 'The mediant provides color and can substitute for the tonic, adding variety.',
  4: 'The subdominant creates gentle movement away from tonic, often preceding dominant.',
  5: 'The dominant creates strong tension that demands resolution to the tonic.',
  6: 'The submediant offers a softer, more introspective quality as a tonic substitute.',
  7: 'The leading tone chord creates maximum tension, strongly pulling toward resolution.',
};
```

---

### Task 4: Update ChordExplanation Type
**File:** `/Users/connorspencer/Documents/1. Projects/composer/src/types/ai.ts`

**Dependencies:** None (can start immediately)

**Instructions:**
The existing `ChordExplanation` type needs verification/update:

```typescript
// Current definition in ai.ts (line 52-61):
export interface ChordExplanation {
  contextual: string;
  technical: string;
  historical: string;
  evolutionSteps: {
    name: string;
    description: string;
    chord: Chord;
  }[];
}

// Verify this matches what we need. If updates needed:
// - Add examples?: string[] for composer examples
// - Add emotion?: string for emotional context
// - Ensure evolutionSteps have playable chord data
```

**Also add new type for API response parsing:**
```typescript
export interface AIExplanationResponse {
  context: string;
  evolutionSteps: {
    chord: string;
    quality: string;
    description: string;
  }[];
  emotion: string;
  examples: string[];
}
```

---

## Phase 2: Integration Tasks (After Phase 1 completes)

### Task 5: Context Menu Integration
**File:** `/Users/connorspencer/Documents/1. Projects/composer/src/components/Canvas/ChordContextMenu.tsx` (or create new chord-specific context menu)

**Dependencies:** Task 2 (store must exist)

**Current State Analysis:**
The existing `ChordContextMenu.tsx` is for adding NEW chords to the canvas (right-click on empty space). We need a SEPARATE context menu for right-clicking on EXISTING chords.

**Options:**
1. Create new `ChordActionContextMenu.tsx` for chord actions
2. Modify DraggableChord to show different menu on right-click

**Recommended Approach:** Create new component

**File:** `/Users/connorspencer/Documents/1. Projects/composer/src/components/Canvas/ChordActionContextMenu.tsx`

```tsx
import React from 'react';
import { ContextMenu, ContextMenuItem } from '@/components/UI/ContextMenu';
import { useWhyThisStore } from '@/store/why-this-store';
import type { Chord } from '@/types';

interface ChordActionContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  chord: Chord;
  previousChord?: Chord;
  nextChord?: Chord;
  onClose: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export const ChordActionContextMenu: React.FC<ChordActionContextMenuProps> = ({
  isOpen,
  position,
  chord,
  previousChord,
  nextChord,
  onClose,
  onDelete,
  onDuplicate,
}) => {
  const openWhyThisPanel = useWhyThisStore((state) => state.openPanel);
  
  const menuItems: ContextMenuItem[] = [
    {
      id: 'why-this',
      label: 'Why This? 🤔',
      action: () => {
        openWhyThisPanel(chord, previousChord, nextChord);
        onClose();
      },
    },
    { id: 'divider-1', label: '', action: () => {}, divider: true },
    {
      id: 'duplicate',
      label: 'Duplicate',
      action: () => {
        onDuplicate?.();
        onClose();
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      action: () => {
        onDelete?.();
        onClose();
      },
    },
  ];
  
  return (
    <ContextMenu
      isOpen={isOpen}
      position={position}
      items={menuItems}
      onClose={onClose}
    />
  );
};
```

**Also update DraggableChord.tsx to use this menu on right-click:**
- Add state for context menu visibility and position
- Handle right-click event to show ChordActionContextMenu
- Pass chord and adjacent chords as props

---

### Task 6: Panel Integration in App.tsx
**File:** `/Users/connorspencer/Documents/1. Projects/composer/src/App.tsx`

**Dependencies:** Task 1, Task 2

**Instructions:**
1. Import WhyThisPanel component
2. Import useWhyThisStore
3. Add WhyThisPanel to render tree (after AnalyzeModal)

```tsx
// Add imports
import { WhyThisPanel } from '@/components/Panels/WhyThisPanel';

// In App component render:
function App() {
  // ... existing code ...
  
  return (
    <div className="app">
      {/* ... existing components ... */}
      
      <AnalyzeModal />
      <WhyThisPanel />  {/* Add this */}
    </div>
  );
}
```

---

### Task 7: Play Controls Integration
**File:** Part of `/Users/connorspencer/Documents/1. Projects/composer/src/components/Panels/WhyThisPanel.tsx`

**Dependencies:** Task 1, Task 2, useAudioEngine hook

**Instructions:**
Implement the three play modes in the panel:

```tsx
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useWhyThisStore } from '@/store/why-this-store';

// Inside WhyThisPanel component:
const { playChord, stopAll, isReady } = useAudioEngine();
const { 
  selectedChord, 
  previousChord, 
  nextChord, 
  explanation,
  isPlayingIsolated,
  isPlayingInProgression,
  isPlayingEvolution,
} = useWhyThisStore();

// Play Isolated - play chord alone for 3 seconds
const handlePlayIsolated = () => {
  if (!selectedChord || !isReady) return;
  stopAll();
  const notes = Object.values(selectedChord.voices);
  playChord(notes, 3);
};

// Play In Progression - play prev → this → next
const handlePlayInProgression = async () => {
  if (!selectedChord || !isReady) return;
  stopAll();
  
  const playSequence = async () => {
    if (previousChord) {
      playChord(Object.values(previousChord.voices), 2);
      await delay(2000);
    }
    playChord(Object.values(selectedChord.voices), 2);
    await delay(2000);
    if (nextChord) {
      playChord(Object.values(nextChord.voices), 2);
    }
  };
  
  playSequence();
};

// Play Evolution Chain - play all variations
const handlePlayEvolutionChain = async () => {
  if (!explanation?.evolutionSteps || !isReady) return;
  stopAll();
  
  for (const step of explanation.evolutionSteps) {
    const notes = Object.values(step.chord.voices);
    playChord(notes, 2);
    await delay(2500);
  }
};

// Utility
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
```

---

### Task 8: Evolution Chain Visualization
**File:** Part of `/Users/connorspencer/Documents/1. Projects/composer/src/components/Panels/WhyThisPanel.tsx`

**Dependencies:** Task 1

**Instructions:**
Create visual representation of chord evolution:

```tsx
// EvolutionChain sub-component
interface EvolutionStepProps {
  step: {
    name: string;
    description: string;
    chord: Chord;
  };
  index: number;
  isLast: boolean;
  onPlay: () => void;
  onAddToCanvas: () => void;
}

const EvolutionStep: React.FC<EvolutionStepProps> = ({
  step,
  index,
  isLast,
  onPlay,
  onAddToCanvas,
}) => {
  return (
    <div className={styles.evolutionStep}>
      <div className={styles.stepNumber}>{index + 1}</div>
      
      <div className={styles.stepContent}>
        <div className={styles.stepHeader}>
          <span className={styles.chordName}>{step.name}</span>
          <div className={styles.stepActions}>
            <button 
              className={styles.playStepButton}
              onClick={onPlay}
              title="Play this variation"
            >
              ▶
            </button>
            <button
              className={styles.addButton}
              onClick={onAddToCanvas}
              title="Add to canvas"
            >
              +
            </button>
          </div>
        </div>
        <p className={styles.stepDescription}>{step.description}</p>
      </div>
      
      {!isLast && <div className={styles.stepConnector} />}
    </div>
  );
};

// CSS for evolution visualization
/*
.evolutionStep {
  display: flex;
  gap: 12px;
  position: relative;
}

.stepNumber {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary-action);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.stepConnector {
  position: absolute;
  left: 11px;
  top: 28px;
  width: 2px;
  height: calc(100% - 24px);
  background: var(--border-light);
}

.stepContent {
  flex: 1;
  padding-bottom: 16px;
}
*/
```

---

## Phase 3: Polish & Error Handling

### Task 9: Loading and Error States
**File:** Part of WhyThisPanel.tsx and explanation-service.ts

**Instructions:**

**Loading State:**
```tsx
// In WhyThisPanel
{isLoading && (
  <div className={styles.loadingContainer}>
    <div className={styles.skeleton}>
      <div className={styles.skeletonLine} style={{ width: '80%' }} />
      <div className={styles.skeletonLine} style={{ width: '60%' }} />
      <div className={styles.skeletonLine} style={{ width: '90%' }} />
    </div>
    <p className={styles.loadingText}>Analyzing chord context...</p>
  </div>
)}
```

**Error State with Retry:**
```tsx
{error && (
  <div className={styles.errorContainer}>
    <span className={styles.errorIcon}>⚠️</span>
    <p className={styles.errorMessage}>{error}</p>
    <button 
      className={styles.retryButton}
      onClick={handleRetry}
    >
      Try Again
    </button>
    <button
      className={styles.useFallbackButton}
      onClick={handleUseFallback}
    >
      Use Basic Explanation
    </button>
  </div>
)}
```

---

### Task 10: Index File Updates
**File:** `/Users/connorspencer/Documents/1. Projects/composer/src/components/Panels/index.ts`

**Instructions:**
Create barrel export file:
```typescript
export { WhyThisPanel } from './WhyThisPanel';
```

---

## Dependency Graph

```
Phase 1 (Parallel):
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Task 1     │  │   Task 2     │  │   Task 3     │  │   Task 4     │
│ WhyThisPanel │  │ why-this-    │  │ explanation- │  │ Type Updates │
│ Component    │  │ store.ts     │  │ service.ts   │  │              │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
       │                 │                 │                 │
       └─────────────────┴─────────────────┴─────────────────┘
                                   │
                            Phase 1 Complete
                                   │
Phase 2 (Sequential after Phase 1):
       ┌───────────────────────────┼───────────────────────────┐
       ▼                           ▼                           ▼
┌──────────────┐           ┌──────────────┐           ┌──────────────┐
│   Task 5     │           │   Task 6     │           │   Task 7     │
│ Context Menu │           │ App.tsx      │           │ Play Controls│
│ Integration  │           │ Integration  │           │              │
└──────────────┘           └──────────────┘           └──────────────┘
       │                           │                           │
       └───────────────────────────┴───────────────────────────┘
                                   │
                             Phase 2 Complete
                                   │
Phase 3 (After Phase 2):
       ┌───────────────────────────┴───────────────────────────┐
       ▼                                                       ▼
┌──────────────┐                                       ┌──────────────┐
│   Task 8     │                                       │   Task 9     │
│ Evolution    │                                       │ Loading/Error│
│ Visualization│                                       │ States       │
└──────────────┘                                       └──────────────┘
```

---

## Files Summary

### New Files to Create:
1. `/Users/connorspencer/Documents/1. Projects/composer/src/components/Panels/WhyThisPanel.tsx`
2. `/Users/connorspencer/Documents/1. Projects/composer/src/components/Panels/WhyThisPanel.module.css`
3. `/Users/connorspencer/Documents/1. Projects/composer/src/components/Panels/index.ts`
4. `/Users/connorspencer/Documents/1. Projects/composer/src/store/why-this-store.ts`
5. `/Users/connorspencer/Documents/1. Projects/composer/src/services/explanation-service.ts`
6. `/Users/connorspencer/Documents/1. Projects/composer/src/components/Canvas/ChordActionContextMenu.tsx`

### Files to Modify:
1. `/Users/connorspencer/Documents/1. Projects/composer/src/types/ai.ts` - Add AIExplanationResponse type
2. `/Users/connorspencer/Documents/1. Projects/composer/src/App.tsx` - Add WhyThisPanel
3. `/Users/connorspencer/Documents/1. Projects/composer/src/components/Canvas/DraggableChord.tsx` - Add right-click menu

### Environment Setup Required:
```bash
# Add to .env.local
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

---

## Critical Files for Implementation

1. **`/Users/connorspencer/Documents/1. Projects/composer/src/components/Panels/WhyThisPanel.tsx`** - Main panel component with all UI sections
2. **`/Users/connorspencer/Documents/1. Projects/composer/src/store/why-this-store.ts`** - State management following analysis-store pattern
3. **`/Users/connorspencer/Documents/1. Projects/composer/src/services/explanation-service.ts`** - AI integration with caching
4. **`/Users/connorspencer/Documents/1. Projects/composer/src/components/Canvas/DraggableChord.tsx`** - Integration point for context menu trigger
5. **`/Users/connorspencer/Documents/1. Projects/composer/src/types/ai.ts`** - Type definitions (ChordExplanation already exists)

---

## Testing Checklist

After implementation, verify:

- [ ] Right-click on chord shows "Why This?" option
- [ ] Panel slides in smoothly from right
- [ ] Loading state displays while fetching
- [ ] Explanation renders with all sections
- [ ] Evolution chain shows progression from simple to complex
- [ ] Play Isolated plays chord for 3 seconds
- [ ] Play In Progression plays prev → chord → next
- [ ] Play Evolution Chain plays all variations
- [ ] Add to Canvas works for evolution steps
- [ ] Replace buttons swap chord on canvas
- [ ] Error state shows with retry option
- [ ] Cached explanations load instantly
- [ ] Panel closes on backdrop click or X button
- [ ] Escape key closes panel
- [ ] Mock fallback works when API unavailable

---

## Estimated Time

| Task | Estimated Time |
|------|----------------|
| Task 1: WhyThisPanel + CSS | 1.5-2 hours |
| Task 2: why-this-store | 45 min |
| Task 3: explanation-service | 1-1.5 hours |
| Task 4: Type updates | 15 min |
| Task 5: Context Menu Integration | 45 min |
| Task 6: App.tsx Integration | 15 min |
| Task 7: Play Controls | 45 min |
| Task 8: Evolution Visualization | 30 min |
| Task 9: Loading/Error States | 30 min |
| Task 10: Index files | 5 min |
| **Total** | **6-7 hours** |

With parallel execution of Phase 1 tasks, total time can be reduced to approximately 4-5 hours.
