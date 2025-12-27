# Week 6 Prompt 001: Welcome Tutorial

## Objective
Create a beautiful, non-intrusive first-time user onboarding experience that teaches core features in 60 seconds.

## Requirements

### Tutorial Flow

**Step 1: Welcome Screen**
```
┌─────────────────────────────────────────────┐
│                                             │
│         🎵 Welcome to Neume        │
│                                             │
│   Explore chord progressions through        │
│   shapes, colors, and intelligent AI        │
│                                             │
│         [Start Tutorial] [Skip]             │
│                                             │
└─────────────────────────────────────────────┘
```

**Step 2: First Chord Progression**
- Auto-loads Pop Progression (I-V-vi-IV in C major)
- Tooltip appears: "This is a chord progression. Click Play to hear it!"
- Arrow points to Play button
- Waiting for user click...

**Step 3: Play Success**
- User clicks Play
- Chords pulse, playback starts
- Tooltip: "Great! Each shape represents a chord. Colors show function."
- [Next]

**Step 4: Add Chord**
- Tooltip: "Right-click anywhere to add more chords"
- Arrow points to canvas
- Waiting for right-click...

**Step 5: Analyze Feature**
- Tooltip: "Upload real music to learn from masters"
- Arrow points to "Analyze" button
- [Next]

**Step 6: Complete**
- Confetti animation 🎉
- "You're ready to create! Explore and discover."
- [Start Creating]

### Visual Design

**Overlay Style:**
- Semi-transparent dark backdrop (85% opacity)
- White tooltip with subtle shadow
- Animated arrow (gentle pulse)
- Progress indicator: "Step 2 of 5"

**Animations:**
- Fade in backdrop (300ms)
- Slide in tooltip (400ms from bottom)
- Arrow pulse (800ms loop)
- Confetti on completion

### Technical Implementation

```typescript
// tutorial-store.ts
interface TutorialState {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  hasCompletedTutorial: boolean;
  
  startTutorial: () => void;
  nextStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
}

// Check on app load
useEffect(() => {
  const completed = localStorage.getItem('tutorial-completed');
  if (!completed) {
    tutorialStore.startTutorial();
  }
}, []);
```

**Storage:**
```typescript
localStorage.setItem('tutorial-completed', 'true');
```

## Quality Criteria
- [ ] Tutorial starts automatically for first-time users
- [ ] Steps flow logically
- [ ] Tooltips are clear and concise
- [ ] Animations smooth
- [ ] Can skip at any time
- [ ] Never shows again after completion
- [ ] Mobile responsive

**Estimated Time:** 2-3 hours
