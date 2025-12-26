# Fix Tutorial Step 2 - Play Button Detection

## Problem
Tutorial Step 2 instructs user to "Click Play to hear it" but when the Play button is clicked, the tutorial doesn't advance. It stays stuck on Step 2 saying "Waiting for you to click Play..."

## Root Cause
The Play button onClick handler doesn't notify the tutorial system that the action was completed.

## Files to Modify

### Primary File: Play/Pause Button Component
Location: Likely in `src/components/Controls/BottomBar.tsx` or `src/components/Controls/PlayButton.tsx`

### Secondary File: Tutorial Store/State
Location: Likely `src/store/tutorial-store.ts` or similar

## Solution

### Step 1: Add Tutorial Progress Hook to Play Button

Find the Play button's onClick handler and add tutorial progression logic:

```typescript
// In PlayButton.tsx or BottomBar.tsx

import { useTutorialStore } from '@/store/tutorial-store';

const PlayButton = () => {
  const tutorialStore = useTutorialStore();
  const audioStore = useAudioStore();
  
  const handlePlay = () => {
    // Existing audio logic
    audioStore.togglePlay();
    
    // NEW: Check if tutorial is waiting for this action
    if (tutorialStore.isActive && tutorialStore.currentStep === 2) {
      // Step 2 is "Click Play to hear it"
      tutorialStore.nextStep();
    }
  };
  
  return (
    <button onClick={handlePlay}>
      {audioStore.isPlaying ? '⏸' : '▶'}
    </button>
  );
};
```

### Step 2: Verify Tutorial Store Has nextStep Method

Ensure the tutorial store has a `nextStep()` method:

```typescript
// In tutorial-store.ts

interface TutorialState {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
}

export const useTutorialStore = create<TutorialState>((set) => ({
  isActive: false,
  currentStep: 0,
  totalSteps: 5,
  
  nextStep: () => set((state) => ({
    currentStep: Math.min(state.currentStep + 1, state.totalSteps)
  })),
  
  prevStep: () => set((state) => ({
    currentStep: Math.max(state.currentStep - 1, 0)
  })),
  
  skipTutorial: () => set({
    isActive: false,
    currentStep: 0
  }),
}));
```

### Step 3: Alternative - Event-Based Approach

If you prefer a cleaner separation of concerns, use events:

```typescript
// In PlayButton.tsx
const handlePlay = () => {
  audioStore.togglePlay();
  
  // Emit custom event for tutorial to listen
  window.dispatchEvent(new CustomEvent('tutorial:playClicked'));
};

// In WelcomeOverlay.tsx (Tutorial component)
useEffect(() => {
  if (currentStep === 2) {
    const handlePlayClick = () => {
      nextStep();
    };
    
    window.addEventListener('tutorial:playClicked', handlePlayClick);
    return () => window.removeEventListener('tutorial:playClicked', handlePlayClick);
  }
}, [currentStep]);
```

## Testing

After the fix, test this scenario:

1. Clear localStorage: `localStorage.clear()`
2. Refresh the page
3. Welcome overlay appears
4. Click "Start Tutorial"
5. Tutorial shows Step 1 (welcome)
6. Click "Next" or it auto-advances
7. Tutorial shows Step 2: "Click Play to hear it"
8. **Click the Play button**
9. ✅ Tutorial should advance to Step 3
10. Verify audio plays (chords pulse)

## Expected Behavior After Fix

- User sees Step 2: "Click Play to hear it"
- User clicks Play button
- Audio starts playing (existing behavior)
- Tutorial advances to Step 3 (NEW behavior)
- User continues through tutorial smoothly

## Success Criteria

- [ ] Play button click advances tutorial from Step 2 to Step 3
- [ ] Audio still plays normally (no regression)
- [ ] Tutorial flow is smooth (no stuck states)
- [ ] Works on fresh page load (cleared localStorage)

## Notes

- This is a **BLOCKER** for launch - new users will be confused if tutorial gets stuck
- The fix is small (5-10 lines of code)
- Estimated time: 15-30 minutes
- Priority: HIGH

---

**Implementation Guide for Claude Code:**

1. Search for the Play button component (likely `PlayButton.tsx` or `BottomBar.tsx`)
2. Find the `onClick` handler or `handlePlay` function
3. Import the tutorial store
4. Add the conditional check and `nextStep()` call
5. Test the tutorial flow
6. Commit with message: "fix: Tutorial Step 2 now advances on Play button click"
