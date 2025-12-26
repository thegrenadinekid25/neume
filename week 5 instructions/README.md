# Week 5: AI Features Part 2

**Complete the AI transformation with advanced features: deconstruction, emotional prompting, and intelligent suggestions**

---

## Overview

Week 5 adds the most sophisticated AI features that make Harmonic Canvas a genuine composition assistant. You'll build tools that help composers understand how complex harmonies evolved from simple foundations and get intelligent suggestions based on emotional intent.

**What You'll Build:**
- "Build From Bones" - See complexity emerge step-by-step
- "Refine This" - AI suggestions from emotional descriptions
- "My Progressions" - Save/load/organize your work
- Progression library - Curated examples with explanations
- Advanced AI integration - Claude as composition coach

---

## Package Contents

### Prompts (5 total)

1. **001-build-from-bones-panel.md** - Deconstruction UI (3-4 hours)
2. **002-ai-deconstruction-system.md** - Backend deconstruction logic (2-3 hours)
3. **003-refine-this-modal.md** - Emotional prompting UI (2-3 hours)
4. **004-my-progressions-system.md** - Save/load/organize (3-4 hours)
5. **005-integration-polish.md** - Complete AI system integration (2-3 hours)

### Supporting Documentation

- **README.md** - This file
- **EXECUTION-GUIDE.md** - Day-by-day plan
- **DEPENDENCY-GRAPH.md** - Task relationships
- **SUCCESS-CRITERIA.md** - Completion standards

---

## Timeline

**Total Time:** 14-19 hours over 4-5 days

**Recommended Schedule:**
- Day 1: Prompts 001-002 (5-7 hours) - Build From Bones
- Day 2: Prompt 003 (2-3 hours) - Refine This
- Day 3: Prompt 004 (3-4 hours) - My Progressions
- Day 4: Prompt 005 (2-3 hours) - Integration & polish
- Day 5: Buffer for testing/refinement

---

## Key Features

### 1. Build From Bones

**The Problem:** Users see complex chords but don't understand how they evolved.

**The Solution:** AI deconstructs progressions into evolutionary steps.

**Example:**
```
Lauridsen's "O Magnum Mysterium"

Step 0: Skeleton (I-V-IV-vi-ii-V-I)
  "The harmonic foundation - simple diatonic progression"

Step 1: Add 7ths (Imaj7-V7-IVmaj7-vi7-ii7-V7-Imaj7)
  "7ths add warmth and sophistication"

Step 2: Suspensions (Isus4→Imaj7-Vsus4→V7-...)
  "Suspensions create yearning, delay resolution"

Step 3: Added 9ths (Iadd9-V9-IVmaj7add9-...)
  "Shimmer and space - Lauridsen's signature"

Step 4: Final Version (with all extensions)
  "The complete masterpiece"
```

**Features:**
- 3-6 meaningful steps (not arbitrary)
- Play each step individually
- Play all steps in sequence
- Compare Step 0 vs Final
- Save build-up for teaching

---

### 2. Refine This (Emotional Prompting)

**The Problem:** Composers know how they want music to *feel* but not the technical means.

**The Solution:** Natural language → harmonic suggestions.

**Example Prompts:**
- "More ethereal and floating"
- "Darker and more grounded"
- "Like Arvo Pärt but less sparse"
- "Renaissance on outside, Romantic inside"

**AI Response:**
```
For "More ethereal":

1. Add 9th to I chord (I → Iadd9)
   "The added E creates shimmer, signature of 
    Lauridsen, Whitacre, Pärt"
   [▶ Preview] [Apply]

2. Suspend V chord (V → Vsus4)
   "Creates floating anticipation, common in 
    sacred music"
   [▶ Preview] [Apply]

3. Modal mixture (vi → ♭VI)
   "Unexpected dreamlike shift - Romantic harmony"
   [▶ Preview] [Apply]
```

**Features:**
- Free-form text input
- 2-3 ranked suggestions
- Preview before applying
- Iterative refinement ("too subtle, more dramatic")
- "Surprise me" option

---

### 3. My Progressions

**The Problem:** Users create progressions but can't save/organize them.

**The Solution:** Complete progression management system.

**Features:**
- Save with metadata (title, key, tempo, tags)
- Organize by favorites, recent, tags
- Search/filter
- Duplicate/edit
- Export to MIDI
- Share via link (future)

**Storage:**
- localStorage for Phase 1
- Cloud sync in Phase 2

---

### 4. Progression Library

**The Problem:** Blank canvas is intimidating for beginners.

**The Solution:** 12 curated progressions with explanations.

**Examples:**
- Pop Progression (I-V-vi-IV)
- Pachelbel Canon (I-V-vi-iii-IV-I-IV-V)
- Lauridsen-style (extended harmony)
- Deceptive Cadence
- Modal Mixture
- Circle of Fifths

**Each includes:**
- Audio preview
- "Why This Works" explanation
- One-click load to canvas
- Difficulty rating

---

## Technology Stack

### Frontend
- React 18+ with TypeScript
- Zustand (state management)
- IndexedDB (local storage)
- Framer Motion (animations)

### Backend (Python)
- FastAPI (from Week 4)
- Claude API (AI suggestions)
- Progression analysis logic

### AI
- Anthropic Claude API
- Sophisticated prompt engineering
- Context-aware suggestions

---

## Prerequisites

### Completed Weeks
- ✅ Week 1: Visual foundation
- ✅ Week 2: Core interactions
- ✅ Week 3: Audio playback
- ✅ Week 4: AI analysis & Why This?

### Required Setup
- Backend running (from Week 4)
- Claude API key configured
- localStorage available (all modern browsers)

---

## File Structure

```
src/
├── components/
│   ├── Panels/
│   │   └── BuildFromBonesPanel.tsx (NEW - Prompt 001)
│   ├── Modals/
│   │   ├── RefineThisModal.tsx (NEW - Prompt 003)
│   │   └── MyProgressionsModal.tsx (NEW - Prompt 004)
│   └── ProgressionLibrary/
│       ├── LibraryCard.tsx (NEW)
│       └── LibraryModal.tsx (NEW)
├── services/
│   ├── ai-deconstruction.ts (NEW - Prompt 002)
│   ├── ai-suggestions.ts (NEW - Prompt 003)
│   └── progression-storage.ts (NEW - Prompt 004)
├── store/
│   ├── build-from-bones-store.ts (NEW)
│   ├── refine-store.ts (NEW)
│   └── progressions-store.ts (NEW)
└── data/
    └── progression-library.ts (NEW - 12 curated progressions)
```

---

## Key Concepts

### Build From Bones Algorithm

**Input:** Complex progression (e.g., analyzed from real piece)

**Process:**
1. Extract skeleton (remove all extensions)
2. Identify layers (7ths, suspensions, 9ths, etc.)
3. Create intermediate steps (progressively add layers)
4. Generate explanations for each step
5. Return 3-6 meaningful steps

**Output:** Step-by-step evolution with explanations

---

### Emotional → Technical Mapping

AI maintains knowledge base:

```javascript
const emotionalMappings = {
  "ethereal": {
    techniques: ["add9", "sus4", "open_voicing", "maj7"],
    composers: ["Lauridsen", "Whitacre", "Pärt"],
    avoid: ["tritones", "chromaticism", "dense_voicing"]
  },
  "dark": {
    techniques: ["minor_mode", "diminished", "low_register"],
    composers: ["Brahms", "Penderecki"],
    avoid: ["major_mode", "high_register"]
  },
  // ... more mappings
}
```

AI combines mappings for complex requests:
- "Ethereal but grounded" → add9s + low register
- "Like Pärt but warmer" → tintinnabuli + maj7 chords

---

## Expected Quality

### Build From Bones
- **Accuracy:** Steps should be musically meaningful
- **Clarity:** Each step clearly different from previous
- **Education:** Explanations teach harmonic theory
- **Playback:** Audio clearly demonstrates evolution

### Refine This
- **Relevance:** Suggestions match emotional intent 80%+ of time
- **Practicality:** Can actually apply suggestions
- **Discovery:** Introduces new techniques appropriately
- **Iteration:** "Not quite right" refinement works

### My Progressions
- **Reliability:** Never lose data (robust saving)
- **Speed:** Load <100ms from localStorage
- **Organization:** Easy to find progressions
- **Flexibility:** Can edit saved progressions

---

## Installation

### No new dependencies for prompts 001, 003-005

### Prompt 002 (AI Deconstruction) backend updates:

```bash
# Backend is already running from Week 4
# Just add new endpoints

cd backend/
# No new packages needed
python main.py
```

---

## Common Challenges

### Challenge 1: Build From Bones Quality

**Problem:** Steps aren't meaningful, just arbitrary divisions

**Solution:**
- Use music theory rules (don't add 9ths before 7ths)
- Group related extensions (all suspensions = one step)
- Limit to 3-6 steps (more = overwhelming)
- Test with real pieces (Lauridsen, Whitacre)

---

### Challenge 2: Refine This Accuracy

**Problem:** AI suggestions don't match emotional intent

**Solution:**
- Iterative refinement system ("not quite right?")
- Show 2-3 options (let user choose)
- Preview before applying (hear difference)
- Learn from user selections (future: ML)

---

### Challenge 3: localStorage Limits

**Problem:** localStorage has ~5-10MB limit

**Solution:**
- Store only metadata + chord IDs (not full audio)
- Compress data (JSON.stringify + LZ compression)
- Warn at 80% capacity
- Future: Move to IndexedDB (larger limits)

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Build From Bones | <3 sec | First time (AI generation) |
| Build From Bones | <100ms | Cached |
| Refine This | <2 sec | AI suggestions |
| Save progression | <50ms | localStorage write |
| Load progression | <100ms | localStorage read |
| Library load | <200ms | 12 progressions |

---

## Testing Strategy

### Unit Tests
- Deconstruction algorithm (skeleton extraction)
- Emotional mapping logic
- localStorage save/load
- Library data integrity

### Integration Tests
- Complete Build From Bones flow
- Refine This → Apply → Hear difference
- Save → Reload → Edit → Save again
- Export MIDI from saved progression

### User Acceptance
- "Can I understand how complexity evolved?" (Build From Bones)
- "Can I express what I want and get useful suggestions?" (Refine This)
- "Can I save and find my work easily?" (My Progressions)

---

## Success Metrics

Week 5 is complete when:

- [ ] Build From Bones shows meaningful evolution (3-6 steps)
- [ ] Refine This gives relevant suggestions (>80% useful)
- [ ] My Progressions never loses data
- [ ] All features feel polished and professional
- [ ] Users can learn AND create with AI assistance

---

## Next Steps After Week 5

**Week 6: Polish & Launch**
- Export to MIDI (complete)
- Welcome tutorial
- Keyboard shortcuts guide
- Performance optimization
- Cross-browser testing
- Final bug fixes
- Beta launch prep

---

## Philosophy

> "The AI is not replacing the composer's creativity—it's amplifying their understanding. Every suggestion teaches. Every explanation clarifies. Every feature empowers."

Week 5 completes the transformation of Harmonic Canvas from a tool into an intelligent composition partner.

---

**Ready to build the most sophisticated AI music features you've ever created!** 🎵🤖✨
