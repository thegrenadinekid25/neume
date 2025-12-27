# Refine Modal Integration Guide

## Quick Start

### 1. Render the Modal in Your App

Add the RefineModal component to your main App or layout:

```typescript
import { RefineModal } from '@/components/Modals';

export function App() {
  return (
    <>
      {/* Your existing content */}
      <RefineModal />
    </>
  );
}
```

### 2. Open Modal from Context Menu or Button

When user selects chords and wants to refine them:

```typescript
import { useRefineStore } from '@/store/refine-store';

export function ChordContextMenu() {
  const { openModal } = useRefineStore();
  const { selectedChordIds } = useCanvasStore();

  return (
    <button onClick={() => openModal(selectedChordIds)}>
      ✨ Refine This...
    </button>
  );
}
```

## Store Usage Examples

### Check Modal State

```typescript
import { useRefineStore } from '@/store/refine-store';

function MyComponent() {
  const isOpen = useRefineStore((state) => state.isModalOpen);
  const suggestions = useRefineStore((state) => state.suggestions);

  return isOpen ? <div>Modal is open with {suggestions.length} suggestions</div> : null;
}
```

### Listen to Store Changes

```typescript
import { useRefineStore } from '@/store/refine-store';
import { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    // Subscribe to any store changes
    const unsubscribe = useRefineStore.subscribe(
      (state) => state.suggestions,
      (suggestions) => {
        console.log('Suggestions updated:', suggestions);
      }
    );

    return unsubscribe;
  }, []);
}
```

### Manual Suggestion Generation

```typescript
import { getSuggestions } from '@/store/refine-store';
import { useCanvasStore } from '@/store/canvas-store';

async function generateSuggestionsManually() {
  const { chords } = useCanvasStore.getState();
  const selectedChords = chords.filter(c => selectedChordIds.includes(c.id));

  try {
    const suggestions = await getSuggestions(
      "More ethereal and floating",
      selectedChords
    );
    console.log('Generated suggestions:', suggestions);
  } catch (error) {
    console.error('Failed to generate suggestions:', error);
  }
}
```

## Component Integration Examples

### Example 1: Add Refine Button to Chord Context Menu

In `/src/components/Canvas/ChordContextMenu.tsx`:

```typescript
import { useRefineStore } from '@/store/refine-store';
import { useCanvasStore } from '@/store/canvas-store';

export function ChordContextMenu({ chordId, onClose }: Props) {
  const { openModal } = useRefineStore();
  const { selectedChordIds } = useCanvasStore();

  const handleRefine = () => {
    if (selectedChordIds.length === 0) {
      alert('Please select at least one chord to refine');
      return;
    }
    openModal(selectedChordIds);
    onClose();
  };

  return (
    <div className={styles.contextMenu}>
      {/* Existing menu items */}

      {selectedChordIds.length > 0 && (
        <>
          <hr />
          <button onClick={handleRefine} className={styles.refineButton}>
            ✨ Refine This...
          </button>
        </>
      )}
    </div>
  );
}
```

### Example 2: Refine Button in Top Toolbar

```typescript
import { useRefineStore } from '@/store/refine-store';
import { useCanvasStore } from '@/store/canvas-store';

export function Toolbar() {
  const { openModal } = useRefineStore();
  const { selectedChordIds } = useCanvasStore();

  return (
    <div className={styles.toolbar}>
      {/* Other toolbar items */}

      <button
        onClick={() => openModal(selectedChordIds)}
        disabled={selectedChordIds.length === 0}
        title="Refine selected chords with AI suggestions"
      >
        ✨ Refine
      </button>
    </div>
  );
}
```

### Example 3: Handle Applied Suggestions in Canvas

When user clicks "Apply" on a suggestion, the modal automatically updates the canvas store. If you need custom handling:

```typescript
import { useRefineStore } from '@/store/refine-store';
import { useEffect } from 'react';

export function Canvas() {
  const suggestions = useRefineStore((state) => state.suggestions);

  useEffect(() => {
    // This runs whenever suggestions change
    // You could use this to highlight suggested chords, etc.
    if (suggestions.length > 0) {
      console.log('New suggestions available');
      // Custom handling here
    }
  }, [suggestions]);

  return <div>Canvas content</div>;
}
```

## Backend Integration

### When Backend `/api/suggest` is Ready

Update the `getSuggestions()` function in `/src/store/refine-store.ts`:

```typescript
/**
 * Get suggestions from backend API
 */
export async function getSuggestions(
  intent: string,
  chords: Chord[]
): Promise<Suggestion[]> {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  try {
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
          key: 'C', // TODO: get from canvas store
          mode: 'major' // TODO: get from canvas store
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error('Failed to get suggestions:', error);
    throw error;
  }
}
```

### Backend Endpoint Specification

Expected request/response format:

```python
# POST /api/suggest
# Request body:
{
  "intent": "More ethereal and floating",
  "chords": [
    {
      "scaleDegree": 1,
      "quality": "major",
      "extensions": {}
    }
  ],
  "context": {
    "key": "C",
    "mode": "major"
  }
}

# Response:
{
  "suggestions": [
    {
      "id": "uuid-here",
      "technique": "add9",
      "targetChordId": "chord-uuid",
      "from": { /* original chord */ },
      "to": { /* refined chord */ },
      "rationale": "The added 9th creates shimmer...",
      "examples": ["Lauridsen", "Whitacre"],
      "relevanceScore": 0.95
    }
  ]
}
```

## Styling Integration

The RefineModal uses CSS variables from your design system:

```css
/* From src/styles/variables.css */
--primary-action: #4A90E2;
--background-primary: #ffffff;
--background-secondary: #f5f5f5;
--text-primary: #333333;
--text-secondary: #666666;
--border-light: #ddd;
--shadow-lg: 0 10px 40px rgba(0,0,0,0.15);
```

No additional CSS setup needed - modal will match your app theme.

## Accessibility Features

The modal includes:
- ARIA labels and roles (`role="dialog"`, `aria-modal="true"`)
- Keyboard shortcuts (Escape to close)
- Focus management (close button focused)
- Semantic HTML (proper heading hierarchy)
- Color contrast compliance
- Disabled state handling

## Testing

### Unit Test Example

```typescript
import { useRefineStore } from '@/store/refine-store';
import { renderHook, act } from '@testing-library/react';

test('refine store opens modal with selected chords', () => {
  const { result } = renderHook(() => useRefineStore());

  act(() => {
    result.current.openModal(['chord-1', 'chord-2']);
  });

  expect(result.current.isModalOpen).toBe(true);
  expect(result.current.selectedChordIds).toEqual(['chord-1', 'chord-2']);
});

test('setting intent updates state', () => {
  const { result } = renderHook(() => useRefineStore());

  act(() => {
    result.current.setUserIntent('More ethereal');
  });

  expect(result.current.userIntent).toBe('More ethereal');
});

test('applySuggestion clears suggestions', () => {
  const { result } = renderHook(() => useRefineStore());

  const mockSuggestions = [/* ... */];

  act(() => {
    result.current.setSuggestions(mockSuggestions);
    result.current.applySuggestion(mockSuggestions[0].id);
  });

  expect(result.current.suggestions).toEqual([]);
  expect(result.current.userIntent).toBe('');
});
```

### Component Test Example

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RefineModal } from '@/components/Modals/RefineModal';
import { useRefineStore } from '@/store/refine-store';

test('modal renders when isModalOpen is true', () => {
  const { rerender } = render(<RefineModal />);

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  // Open modal
  act(() => {
    useRefineStore.getState().openModal(['chord-1']);
  });

  rerender(<RefineModal />);

  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

test('example prompt fills textarea', async () => {
  // Setup
  act(() => {
    useRefineStore.getState().openModal(['chord-1']);
  });

  render(<RefineModal />);

  // Click example prompt
  const exampleButton = screen.getByText('More ethereal and floating');
  fireEvent.click(exampleButton);

  // Check textarea
  const textarea = screen.getByRole('textbox');
  expect(textarea).toHaveValue('More ethereal and floating');
});
```

## Troubleshooting

### Modal won't open
- Ensure RefineModal is rendered in your app
- Check that selectedChordIds are passed to openModal()
- Verify store state with React DevTools

### Suggestions not showing
- Check browser console for getSuggestions() errors
- Verify chords array is not empty
- Check that userIntent is not empty before submit

### Audio preview not working
- Ensure useAudioEngine is initialized
- Check browser console for audio errors
- Verify audio permissions are granted

### Styling looks wrong
- Clear CSS cache (hard refresh Ctrl+Shift+R)
- Check that CSS variables are defined in globals.css
- Inspect element to verify CSS module is loaded

## Files Modified

- `/src/components/Modals/index.ts` - Added RefineModal export
- `/src/store/refine-store.ts` - Created (new file)
- `/src/components/Modals/RefineModal.tsx` - Created (new file)
- `/src/components/Modals/RefineModal.module.css` - Created (new file)
