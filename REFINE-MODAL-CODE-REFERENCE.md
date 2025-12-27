# Refine Modal - Code Reference

## Quick Reference: Store Setup

### Using the Store in a Component

```typescript
import { useRefineStore } from '@/store/refine-store';

// In your component:
const {
  isModalOpen,
  userIntent,
  suggestions,
  isLoading,
  error,
  openModal,
  closeModal,
  setUserIntent,
  setSuggestions,
  setLoading,
  setError,
  applySuggestion,
  clearSuggestions,
} = useRefineStore();
```

## Quick Reference: Component Usage

### Rendering the Modal

```typescript
import { RefineModal } from '@/components/Modals';

export function App() {
  return (
    <>
      <YourAppContent />
      <RefineModal />
    </>
  );
}
```

### Opening the Modal

```typescript
import { useRefineStore } from '@/store/refine-store';
import { useCanvasStore } from '@/store/canvas-store';

function MyComponent() {
  const { openModal } = useRefineStore();
  const { selectedChordIds } = useCanvasStore();

  const handleRefineClick = () => {
    openModal(selectedChordIds); // Opens with selected chords
  };

  return (
    <button onClick={handleRefineClick}>
      ✨ Refine This...
    </button>
  );
}
```

## Store Type Definitions

### Suggestion Interface

```typescript
export interface Suggestion {
  id: string;                    // Unique identifier
  technique: string;            // "add9", "sus4", etc.
  targetChordId: string;       // ID of chord being refined
  from: Chord;                 // Original chord
  to: Chord;                   // Refined chord
  rationale: string;           // Educational explanation
  examples: string[];          // Composers/artists
  relevanceScore: number;      // 0-1 confidence
}
```

### RefineState Interface

```typescript
interface RefineState {
  isModalOpen: boolean;
  selectedChordIds: string[];
  userIntent: string;
  suggestions: Suggestion[];
  isLoading: boolean;
  error: string | null;
  previousIntents: string[];
  surpriseCount: number;

  // Actions
  openModal: (selectedChordIds: string[]) => void;
  closeModal: () => void;
  setUserIntent: (intent: string) => void;
  setSuggestions: (suggestions: Suggestion[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  applySuggestion: (suggestionId: string) => void;
  clearSuggestions: () => void;
  reset: () => void;
}
```

## Mock Suggestion Data Structure

### Example Suggestion Object

```typescript
const mockSuggestion: Suggestion = {
  id: 'uuid-here',
  technique: 'add9',
  targetChordId: 'chord-uuid',
  from: {
    id: 'chord-uuid',
    scaleDegree: 1,
    quality: 'major',
    extensions: {},
    key: 'C',
    mode: 'major',
    isChromatic: false,
    voices: {
      soprano: 'C5',
      alto: 'G4',
      tenor: 'E4',
      bass: 'C3',
    },
    startBeat: 0,
    duration: 4,
    position: { x: 0, y: 100 },
    size: 80,
    selected: false,
    playing: false,
    source: 'user',
    createdAt: '2025-12-27T00:00:00Z',
  },
  to: {
    // Same as from, but with extensions updated
    // extensions: { add9: true }
  },
  rationale: 'The added 9th creates shimmer and ethereal quality.',
  examples: ['Lauridsen', 'Whitacre', 'Pärt'],
  relevanceScore: 0.95,
};
```

## CSS Classes Reference

### Modal Structure

```css
.overlay              /* Backdrop with blur */
.modal                /* Main modal container */
  .header             /* Title + close button */
    .closeButton      /* X button */
  .content            /* Scrollable content area */
    .inputGroup       /* Form section */
      .textarea       /* Intent input */
      .inputLabel     /* Label text */
    .examplesSection  /* Example prompts */
      .examplesList   /* Grid of prompts */
      .examplePrompt  /* Individual prompt button */
    .errorBox         /* Error message display */
    .suggestionsContainer /* Suggestions section */
      .suggestionsList    /* List of suggestion cards */
      .suggestionCard     /* Individual suggestion */
        .suggestionHeader /* Title + score */
        .suggestionRationale /* Explanation text */
        .suggestionExamples  /* Composers list */
        .suggestionActions   /* Preview/Apply buttons */
  .footer             /* Submit/Cancel buttons */
    .submitButton     /* Get Suggestions button */
    .cancelButton     /* Cancel button */
```

### Loading & State Classes

```css
.loadingContainer     /* Centered spinner */
  .spinner           /* Animated spinner */
  .miniSpinner       /* Small spinner in button */
  .loadingText       /* "Generating..." text */
```

### Button States

```css
/* All buttons have: */
button:hover:not(:disabled)    /* Hover state */
button:focus-visible           /* Keyboard focus */
button:active:not(:disabled)   /* Press state */
button:disabled                /* Disabled state */
```

## Animation Classes

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Used in various elements via animation or transition */
```

## Responsive Breakpoints

```css
@media (max-width: 640px) {
  /* Tablet layout adjustments */
  .modal {
    width: 95%;
    max-width: 100%;
    max-height: 90vh;
  }
}

@media (max-width: 480px) {
  /* Mobile layout adjustments */
  .modal {
    border-radius: var(--border-radius-md);
  }
  .suggestionActions {
    flex-direction: column;
  }
}
```

## API Integration Template

### Current Mock Implementation

```typescript
export async function getSuggestions(
  intent: string,
  chords: Chord[]
): Promise<Suggestion[]> {
  // Currently returns mock suggestions
  return generateMockSuggestions(intent, chords);
}
```

### Future Backend Implementation

```typescript
export async function getSuggestions(
  intent: string,
  chords: Chord[]
): Promise<Suggestion[]> {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const response = await fetch(`${API_BASE_URL}/api/suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent,
      chords: chords.map(c => ({
        scaleDegree: c.scaleDegree,
        quality: c.quality,
        extensions: c.extensions,
      })),
      context: {
        key: 'C',
        mode: 'major'
      }
    }),
  });

  const data = await response.json();
  return data.suggestions || [];
}
```

## Common Patterns

### Pattern 1: Check if Modal is Open

```typescript
const isOpen = useRefineStore((state) => state.isModalOpen);
const suggestions = useRefineStore((state) => state.suggestions);

return isOpen && suggestions.length > 0 ? (
  <div>Showing {suggestions.length} suggestions</div>
) : null;
```

### Pattern 2: Respond to Suggestions

```typescript
const suggestions = useRefineStore((state) => state.suggestions);

useEffect(() => {
  if (suggestions.length > 0) {
    console.log('New suggestions received');
    // Custom handling
  }
}, [suggestions]);
```

### Pattern 3: Apply Suggestion Programmatically

```typescript
const suggestions = useRefineStore((state) => state.suggestions);
const { applySuggestion } = useRefineStore();

const handleApplyFirst = () => {
  if (suggestions.length > 0) {
    applySuggestion(suggestions[0].id);
  }
};
```

### Pattern 4: Get Current State

```typescript
const state = useRefineStore.getState();
console.log('Current intent:', state.userIntent);
console.log('Current suggestions:', state.suggestions);
console.log('Is loading:', state.isLoading);
console.log('Error:', state.error);
```

### Pattern 5: Listen to Specific Changes

```typescript
useEffect(() => {
  const unsubscribe = useRefineStore.subscribe(
    (state) => state.isModalOpen,
    (isOpen) => {
      console.log('Modal is now:', isOpen ? 'open' : 'closed');
    }
  );

  return unsubscribe;
}, []);
```

## Keyboard Shortcuts

```typescript
// Escape key closes modal (when not loading)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !isLoading) {
    closeModal();
  }
});

// Enter key in textarea could submit (optional enhancement)
// Tab key navigates between buttons naturally
```

## Color Variables Used

```css
--primary-action: #4A90E2;           /* Blue buttons */
--background-primary: #ffffff;        /* White backgrounds */
--background-secondary: #f5f5f5;     /* Light gray backgrounds */
--text-primary: #333333;             /* Dark text */
--text-secondary: #666666;           /* Medium gray text */
--text-tertiary: #999999;            /* Light gray text */
--border-light: #ddd;                /* Light borders */
--border-medium: #ccc;               /* Medium borders */
--border-dark: #999;                 /* Dark borders */
--error: #c44536;                    /* Red for errors */
--shadow-lg: 0 10px 40px rgba(0,0,0,0.15);
```

## Spacing Variables Used

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 24px;
--space-2xl: 32px;
```

## Duration & Easing Variables

```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--ease-apple-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-smooth-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

## Files & Line Counts

```
src/store/refine-store.ts              303 lines
src/components/Modals/RefineModal.tsx   406 lines
src/components/Modals/RefineModal.module.css  607 lines
src/components/Modals/index.ts         3 lines (updated)
───────────────────────────────────────────────
Total new code                          1,319 lines
```

## Import Statements Needed

For RefineModal.tsx:
```typescript
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRefineStore, getSuggestions } from '@/store/refine-store';
import { useCanvasStore } from '@/store/canvas-store';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import styles from './RefineModal.module.css';
```

For refine-store.ts:
```typescript
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Chord } from '@/types/chord';
```

For index.ts:
```typescript
export { RefineModal } from './RefineModal';
```
