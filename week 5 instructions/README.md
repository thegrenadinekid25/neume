# Week 5: AI Composition Features

**Duration:** 12-16 hours  
**Focus:** AI-powered analysis, suggestions, and explanations for harmonic blocks

## Overview

Week 5 adds intelligence to Neume through four AI-powered features that help composers understand, refine, and learn from chord progressions. All features work within the block-based architecture (4-16 bars, reusable harmonic sections).

## Architecture Context

**Blocks-First Approach:**
- Users create harmonic blocks (not full pieces yet - that's Phase 2)
- Each block is 4-16 bars of cohesive harmonic ideas
- Blocks are reusable, analyzable, and refinable
- AI features operate on individual blocks

**Week 5 Capabilities:**
1. Analyze uploaded audio to extract chord progressions → create blocks
2. Explain WHY specific chords were chosen (educational)
3. Show how complex harmonies evolved from simple foundations
4. Suggest refinements based on emotional intent

## Features

### 1. Analyze (Upload & Extract) - 4-5 hours

**Goal:** Extract chord progressions from audio/YouTube and create blocks

**Implementation:**
- Upload modal (YouTube URL or audio file)
- Server-side chord recognition (Essentia Python)
- AI analysis via Claude API
- Create block from analyzed progression
- Display metadata (title, composer, source)

**Prompts:**
1. Frontend modal & file upload (1.5 hours)
2. Backend integration with Essentia (2 hours)
3. Claude API for chord quality enhancement (1 hour)

**Output:** Users can upload "O Magnum Mysterium" → get a block with Lauridsen's progression

### 2. Why This? (Chord Education) - 3-4 hours

**Goal:** Educational panel explaining chord choices with evolution chains

**Implementation:**
- Right-click chord → "Why This?" in context menu
- Panel slides in from right
- Shows evolution: Simple → Sophisticated
- Play isolated chord, in context, evolution chain

**Prompts:**
1. Panel UI component (1.5 hours)
2. Claude API integration for explanations (1.5 hours)
3. Audio playback for evolution demonstration (1 hour)

**Output:** Click Dmadd9 → see "Lauridsen uses this for ethereal quality" + hear D → Dmaj7 → Dmadd9 evolution

### 3. Build From Bones (Deconstruction) - 3-4 hours

**Goal:** Show how complex blocks evolved from simple foundations

**Implementation:**
- Appears after analyzing a piece
- AI identifies meaningful conceptual leaps (not arbitrary divisions)
- Step-by-step reconstruction
- Play each step to hear evolution

**Prompts:**
1. Panel UI with step navigation (1.5 hours)
2. Claude API for progression deconstruction (1.5 hours)
3. Step-by-step playback system (1 hour)

**Output:** "O Magnum Mysterium" breaks down into:
- Step 0: I-V-IV-vi skeleton
- Step 1: Add 7ths
- Step 2: Add suspensions
- Step 3: Add 9ths
- Step 4: Final masterpiece

### 4. Refine This (Emotional Prompting) - 2-3 hours

**Goal:** AI suggests refinements based on emotional intent

**Implementation:**
- Select chord(s) → "Refine This" button appears
- Modal: "How should this feel?"
- User types intent ("more ethereal")
- AI returns 2-3 specific suggestions with explanations

**Prompts:**
1. Modal UI with intent input (1 hour)
2. Claude API for suggestion generation (1-1.5 hours)
3. Preview/apply suggestion system (0.5 hour)

**Output:**
- Input: "More ethereal"
- Suggestions: (1) Add 9th, (2) Use sus4, (3) Borrow ♭VI
- Each with: preview audio + apply button + explanation

## Key Architectural Notes

**Block Context:**
- All AI features operate on blocks (not full pieces)
- Blocks are self-contained harmonic sections
- Users can save analyzed blocks to "My Blocks" library
- Blocks can be combined into pieces in Phase 2

**AI Integration:**
- Use Claude API (Anthropic SDK)
- Prompts are pre-engineered for music theory accuracy
- Include temperature=0.7 for creativity with consistency
- Cache common explanations for performance

**Data Flow:**
```
User Action → Frontend Request → Claude API
             ↓
         Response → Frontend Display → User Learns
```

## Dependencies

**Required:**
- Week 3: Audio playback system
- Week 4: AI Analysis infrastructure
- Week 4.5: Extended chord types

**Enables:**
- Week 5.5: Visual polish
- Week 6: Cloud storage (save analyzed blocks)

## Success Criteria

- [ ] Can upload audio and extract progression to block
- [ ] "Why This?" explains chords educationally
- [ ] "Build From Bones" deconstructs progressions
- [ ] "Refine This" suggests improvements from emotional prompts
- [ ] All AI responses are musically accurate
- [ ] Response times < 3 seconds for typical requests
- [ ] Users say "this taught me something"

## Prompts to Create

1. **Analyze Modal & Upload** (1.5 hours)
2. **Backend Chord Recognition** (2 hours)
3. **Claude API Integration Base** (1 hour)
4. **Why This Panel** (1.5 hours)
5. **Why This AI Logic** (1.5 hours)
6. **Evolution Playback** (1 hour)
7. **Build From Bones Panel** (1.5 hours)
8. **Build From Bones AI Logic** (1.5 hours)
9. **Step Navigation & Playback** (1 hour)
10. **Refine This Modal** (1 hour)
11. **Refine This AI Logic** (1-1.5 hours)
12. **Suggestion Preview/Apply** (0.5 hour)

**Total:** 12 prompts, 12-16 hours

---

**Next:** Week 5.5 (Visual Polish) and Week 6 (Cloud Storage)
