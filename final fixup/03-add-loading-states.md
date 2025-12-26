# Add Loading States to API Calls

## Problem
When AI features make API calls (Analyze, Build From Bones, Refine This), there's no loading feedback. Users just see an instant error if the API is down, with no indication that the app tried to do something.

## Expected Behavior
Users should see loading states:
- "Analyzing..." when uploading YouTube URL
- "Deconstructing..." when generating Build From Bones steps
- "Getting suggestions..." when requesting Refine This ideas

## Files to Modify

### 1. Analyze Modal
Location: `src/components/Modals/AnalyzeModal.tsx`

### 2. Build From Bones Panel
Location: `src/components/Panels/BuildFromBonesPanel.tsx`

### 3. Refine This Modal
Location: `src/components/Modals/RefineThisModal.tsx`

## Solution Pattern

Each component should follow this pattern:

```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    const result = await apiCall(data);
    // Handle success
  } catch (err) {
    setError(err.message || 'Something went wrong');
  } finally {
    setIsLoading(false);
  }
};
```

---

## 1. Analyze Modal - Loading State

### Current State
```typescript
// src/components/Modals/AnalyzeModal.tsx

const handleAnalyze = async () => {
  try {
    const result = await analyzeYouTube(url);
    // Show results
  } catch (error) {
    // Show error
  }
};
```

### Add Loading State
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleAnalyze = async () => {
  if (!url) {
    setError('Please enter a YouTube URL');
    return;
  }
  
  setIsLoading(true);
  setError(null);
  
  try {
    const result = await analyzeYouTube(url);
    
    // Success - load progression
    canvasStore.loadProgression(result.chords);
    
    // Show success message
    toast.success('Analysis complete!');
    
    // Close modal
    onClose();
  } catch (err) {
    setError(
      err.message || 
      'Failed to analyze. Check your URL or try again later.'
    );
  } finally {
    setIsLoading(false);
  }
};

// UI Updates
return (
  <Modal>
    <input 
      type="text" 
      value={url}
      onChange={(e) => setUrl(e.target.value)}
      disabled={isLoading}
      placeholder="https://youtube.com/watch?v=..."
    />
    
    {error && (
      <div className="error-message">
        {error}
      </div>
    )}
    
    <Button 
      onClick={handleAnalyze}
      disabled={isLoading || !url}
    >
      {isLoading ? (
        <>
          <Spinner />
          Analyzing...
        </>
      ) : (
        'Analyze'
      )}
    </Button>
  </Modal>
);
```

---

## 2. Build From Bones Panel - Loading State

### Add Loading State
```typescript
// src/components/Panels/BuildFromBonesPanel.tsx

const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [buildUp, setBuildUp] = useState<BuildUpSteps | null>(null);

const loadBuildFromBones = async () => {
  const chords = canvasStore.chords;
  
  if (chords.length === 0) {
    setError('No chords on canvas to deconstruct');
    return;
  }
  
  setIsLoading(true);
  setError(null);
  
  try {
    const result = await api.deconstruct({
      progression: chords,
      key: canvasStore.key,
      mode: canvasStore.mode
    });
    
    setBuildUp(result);
  } catch (err) {
    setError(
      err.message || 
      'Failed to deconstruct. Backend may not be running.'
    );
  } finally {
    setIsLoading(false);
  }
};

// Trigger on panel open
useEffect(() => {
  if (isOpen) {
    loadBuildFromBones();
  }
}, [isOpen]);

// UI
return (
  <Panel>
    {isLoading && (
      <div className="loading-state">
        <Spinner />
        <p>Deconstructing progression...</p>
      </div>
    )}
    
    {error && (
      <div className="error-state">
        <p>{error}</p>
        <Button onClick={loadBuildFromBones}>Try Again</Button>
      </div>
    )}
    
    {buildUp && (
      <StepsDisplay steps={buildUp.steps} />
    )}
  </Panel>
);
```

---

## 3. Refine This Modal - Loading State

### Add Loading State
```typescript
// src/components/Modals/RefineThisModal.tsx

const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

const handleGetSuggestions = async () => {
  const prompt = inputRef.current?.value;
  
  if (!prompt) {
    setError('Please describe how you want the chord to feel');
    return;
  }
  
  setIsLoading(true);
  setError(null);
  setSuggestions([]);
  
  try {
    const result = await api.suggest({
      prompt,
      selectedChords: canvasStore.selectedChords,
      key: canvasStore.key,
      mode: canvasStore.mode
    });
    
    setSuggestions(result.suggestions);
  } catch (err) {
    setError(
      err.message || 
      'Failed to get suggestions. Try a different prompt.'
    );
  } finally {
    setIsLoading(false);
  }
};

// UI
return (
  <Modal>
    <textarea
      ref={inputRef}
      placeholder="How should this feel?"
      disabled={isLoading}
    />
    
    {error && (
      <div className="error-message">
        {error}
      </div>
    )}
    
    <Button 
      onClick={handleGetSuggestions}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Spinner />
          Getting suggestions...
        </>
      ) : (
        'Get Suggestions'
      )}
    </Button>
    
    {suggestions.length > 0 && (
      <SuggestionsList suggestions={suggestions} />
    )}
  </Modal>
);
```

---

## Shared Spinner Component

Create a reusable spinner:

```typescript
// src/components/UI/Spinner.tsx

export const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  return (
    <div 
      className={`
        inline-block animate-spin rounded-full border-2 
        border-solid border-current border-r-transparent
        ${sizeClasses[size]}
      `}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
```

CSS (if needed):
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

---

## Error Message Styling

Consistent error display:

```typescript
// src/components/UI/ErrorMessage.tsx

export const ErrorMessage = ({ 
  message, 
  onRetry 
}: { 
  message: string;
  onRetry?: () => void;
}) => {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <p className="error-text">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
```

---

## Testing

Test each loading state:

### Analyze Modal
1. Open Analyze modal
2. Enter YouTube URL
3. Click "Analyze"
4. **Should see:** "Analyzing..." with spinner
5. **After response:** Either results or error
6. Button should be disabled during loading

### Build From Bones
1. Load a progression
2. Click "Build From Bones"
3. **Should see:** "Deconstructing..." with spinner
4. **After response:** Steps or error with "Try Again"

### Refine This
1. Select a chord
2. Click "Refine This"
3. Enter prompt: "more ethereal"
4. Click "Get Suggestions"
5. **Should see:** "Getting suggestions..." with spinner
6. **After response:** Suggestions or error

---

## Success Criteria

- [ ] All three modals show loading states
- [ ] Buttons disabled during loading (prevent double-submit)
- [ ] Spinner visible and animating
- [ ] Error messages clear and actionable
- [ ] Loading states clear when complete
- [ ] Can retry after errors

---

## Notes

- This is a **SHOULD-FIX** before launch - improves UX significantly
- Users need feedback that something is happening
- Prevents confusion when API is slow or down
- Estimated time: 30-40 minutes total
- Priority: MEDIUM-HIGH

---

**Implementation Guide for Claude Code:**

1. Start with AnalyzeModal.tsx
2. Add `isLoading` and `error` state
3. Wrap API call in try/catch/finally with state updates
4. Update UI to show loading/error states
5. Repeat for BuildFromBonesPanel.tsx
6. Repeat for RefineThisModal.tsx
7. Create Spinner component if doesn't exist
8. Test all three features
9. Commit: "feat: Add loading states to all AI features"
