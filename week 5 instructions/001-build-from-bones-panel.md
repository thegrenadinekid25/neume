# Week 5 Prompt 001: Build From Bones Panel

## Objective
Create a panel that displays step-by-step deconstruction of complex progressions, showing how they evolved from simple foundations with playback at each stage.

## Requirements

### Panel Trigger
- After analyzing a piece (Week 4), button appears: [Build From Bones 🦴]
- Click → Panel slides up from bottom (or overlays canvas)
- Size: Full width, ~400px height
- Close button (×) to dismiss

### Panel Layout

**Step Progress Indicator (Visual Timeline)**
```
Step 0: Skeleton    ●━━━━○━━━━○━━━━○
Step 1: Add 7ths    ○━━━━●━━━━○━━━━○  
Step 2: Suspensions ○━━━━○━━━━●━━━━○
Step 3: Added 9ths  ○━━━━○━━━━○━━━━●
```
- Dots clickable to jump to step
- Current step highlighted (filled circle)
- Progress line connects dots

**Step Content Section**
```
Currently Showing: Step 2 - Suspensions

"Lauridsen adds sus4 chords before each resolution to create
 anticipation and delay harmonic arrival. This is a signature 
 move in sacred choral music, evoking the 'yearning' quality 
 of Renaissance polyphony (Byrd, Palestrina)."

Progression at this step:
Dsus4→D - Asus4→A - Gsus4→G - Bmsus4→Bm

[◄ Previous]  [▶ Play This Step]  [Next ►]
```

**Global Playback Controls**
```
[▶ Play All Steps In Sequence]
  Auto-plays Steps 0→1→2→3 with 10 sec each

[▶ Compare Step 0 vs Final]
  Plays skeleton (10 sec) → [gap] → final (10 sec)

[💾 Save This Build-Up]
  Saves all steps to My Progressions
```

### Visual Design
- Background: White with subtle shadow
- Typography: 13px Inter Regular, 18px for step title
- Step indicator: Custom SVG circles (20px diameter)
- Progress line: 3px solid #4A90E2
- Animations: Smooth transitions between steps (300ms)

### State Management
```typescript
// build-from-bones-store.ts
interface BuildFromBonesState {
  isPanelOpen: boolean;
  currentStep: number;
  totalSteps: number;
  steps: DeconstructionStep[];
  isPlaying: boolean;
  playbackMode: 'single' | 'sequence' | 'compare';
}

interface DeconstructionStep {
  stepNumber: number;
  stepName: string;
  description: string;
  chords: Chord[];
}
```

### Integration with Canvas
- When step changes, canvas updates to show that step's chords
- Previous steps' chords fade to 50% opacity
- Current step's chords at 100% opacity
- Smooth morph animation between steps

### Playback Features

**[▶ Play This Step]**
- Plays current step's progression
- Chords pulse during playback
- Stops at end

**[▶ Play All Steps In Sequence]**
- Auto-advances through steps
- 10 seconds per step
- Brief text overlay: "Step 2: Suspensions"
- Can pause/resume
- Returns to Step 0 when complete

**[▶ Compare Step 0 vs Final]**
- Plays Step 0 (skeleton) for 10 sec
- 2 second silence gap
- Plays Step N (final) for 10 sec
- Shows "Before/After" labels during playback

### Navigation
- [◄ Previous] / [Next ►] buttons
- Keyboard: Left/Right arrow keys
- Click step indicator dots to jump
- Wrap around (Step 3 → Next → Step 0)

## Technical Implementation

```typescript
// BuildFromBonesPanel.tsx
import { motion } from 'framer-motion';
import { useBuildFromBonesStore } from '@/store/build-from-bones-store';
import { usePlayback } from '@/hooks/usePlayback';

export const BuildFromBonesPanel: React.FC = () => {
  const { 
    isPanelOpen, 
    currentStep, 
    steps, 
    nextStep, 
    prevStep, 
    jumpToStep 
  } = useBuildFromBonesStore();
  
  const { playProgression } = usePlayback();
  
  const handlePlayStep = () => {
    const step = steps[currentStep];
    playProgression(step.chords);
  };
  
  const handlePlaySequence = async () => {
    for (let i = 0; i < steps.length; i++) {
      jumpToStep(i);
      await playProgression(steps[i].chords);
      await delay(2000); // Gap between steps
    }
  };
  
  return (
    <AnimatePresence>
      {isPanelOpen && (
        <motion.div
          className="build-from-bones-panel"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.3 }}
        >
          {/* Step indicator */}
          <StepIndicator 
            steps={steps} 
            currentStep={currentStep}
            onStepClick={jumpToStep}
          />
          
          {/* Step content */}
          <StepContent step={steps[currentStep]} />
          
          {/* Navigation */}
          <div className="nav-controls">
            <button onClick={prevStep}>◄ Previous</button>
            <button onClick={handlePlayStep}>▶ Play This Step</button>
            <button onClick={nextStep}>Next ►</button>
          </div>
          
          {/* Global controls */}
          <div className="global-controls">
            <button onClick={handlePlaySequence}>
              ▶ Play All Steps In Sequence
            </button>
            <button onClick={handleCompare}>
              ▶ Compare Step 0 vs Final
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

## Data Flow

1. User clicks [Build From Bones] after analyzing piece
2. Frontend calls backend API: `POST /api/deconstruct`
3. Backend (Prompt 002) analyzes progression, returns steps
4. Frontend stores in `useBuildFromBonesStore`
5. Panel opens, shows Step 0
6. User navigates, canvas updates to show each step
7. Playback synchronized with visual state

## Quality Criteria
- [ ] Panel slides smoothly (300ms animation)
- [ ] Step indicator is intuitive and clickable
- [ ] Canvas updates when steps change
- [ ] Playback works for all modes (single, sequence, compare)
- [ ] Descriptions are educational and clear
- [ ] Navigation feels natural (keyboard + mouse)
- [ ] Can save build-up to My Progressions

**Estimated Time:** 3-4 hours
