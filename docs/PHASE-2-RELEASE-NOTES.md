# Phase 2 Release Notes

**Release Date:** December 2024
**Version:** 2.0.0

Phase 2 transforms Neume from a functional chord progression tool into a professional-grade composition environment with high-fidelity audio, advanced harmony, and AI-powered creativity tools.

---

## New Features

### 1. Salamander Grand Piano Audio
**Commit:** `db8feae`

Replaced synthetic oscillator sounds with the Salamander Grand Piano sample library for authentic, expressive playback.

**Technical Details:**
- Integration with Tone.js Sampler
- Lazy-loaded samples (~25MB) with loading indicator
- Velocity-sensitive playback
- Proper ADSR envelope handling
- Graceful fallback if samples fail to load

**Files:**
- `src/audio/AudioEngine.ts` - Core sampler integration
- `src/audio/PlaybackSystem.ts` - Updated for sampler compatibility
- `src/hooks/useAudioEngine.ts` - React hook for audio state
- `src/components/Audio/AudioLoadingIndicator.tsx` - Loading UI

---

### 2. Melodic Necklaces (Voice Leading Visualization)
**Commit:** `6865d3c`

Visual curves connecting voice parts between adjacent chords, showing how each SATB voice moves through the progression.

**Features:**
- Bezier curves for each voice (Soprano, Alto, Tenor, Bass)
- Color-coded by voice part
- Toggle visibility per voice
- Smooth animations during playback
- Respects chord selection state

**Files:**
- `src/components/Canvas/MelodicNecklace.tsx` - SVG curve rendering
- `src/components/Canvas/MelodicNecklaceLayer.tsx` - Canvas integration
- `src/components/UI/NecklaceToggle.tsx` - Visibility controls
- `src/store/necklace-store.ts` - State management

---

### 3. Extended Harmony + Expert Mode
**Commit:** `b49dba5`

Unlockable advanced chord types for users who demonstrate proficiency with basic harmony.

**Extended Chords:**
- 9th chords (major 9, minor 9, dominant 9)
- 11th chords (major 11, minor 11, dominant 11)
- 13th chords (major 13, minor 13, dominant 13)

**Altered Dominants:**
- Flat 9 (b9)
- Sharp 9 (#9)
- Sharp 11 (#11)
- Flat 13 (b13)

**Unlock Criteria:**
- Create 3+ progressions
- Use 5+ unique chord types
- Include 2+ cadential patterns

**Files:**
- `src/store/expert-mode-store.ts` - Unlock tracking
- `src/components/UI/ExpertModeProgress.tsx` - Progress display
- `src/components/UI/ExpertModeToggle.tsx` - Feature toggles
- `src/data/extended-chords.ts` - Chord definitions
- `src/components/Palette/ExtendedChordPalette.tsx` - Extended palette

---

### 4. Manual Voicing Controls
**Commit:** `ad3107a`

Drag handles on each chord to manually adjust individual voice positions, overriding automatic voice leading.

**Features:**
- Draggable handles for S/A/T/B voices
- Real-time pitch preview while dragging
- Voice leading validation (parallel 5ths/8ves warnings)
- Range validation (voice too high/low)
- Visual feedback for valid/invalid positions
- Reset to automatic voicing option

**Files:**
- `src/components/VoiceEditor/VoiceHandle.tsx` - Individual handle
- `src/components/VoiceEditor/VoiceHandleGroup.tsx` - Handle container
- `src/components/VoiceEditor/VoiceEditorOverlay.tsx` - Canvas overlay
- `src/utils/voice-editor-utils.ts` - Pitch calculations

---

### 5. Text Notes & Annotations
**Commit:** `8a74ccb`

Per-chord annotation system for adding theory notes, performance instructions, and reference links.

**Annotation Types:**
- **Note** - General observations
- **Performance** - Playing instructions
- **Theory** - Harmonic analysis notes
- **Reference** - Links to external resources

**Features:**
- Double-click chord to open annotation popover
- Multiple annotations per chord
- Edit/delete existing annotations
- Badge indicator on annotated chords
- Progression-level notes panel
- Filter by annotation type

**Files:**
- `src/store/annotations-store.ts` - Annotation state
- `src/components/Canvas/ChordAnnotationPopover.tsx` - Popover UI
- `src/components/Canvas/ChordNoteBadge.tsx` - Badge indicator
- `src/components/Panels/ProgressionNotesPanel.tsx` - Notes panel
- `src/types/annotations.ts` - Type definitions

---

### 6. AI Narrative Composer
**Commit:** `f4d5d44`

Describe the emotional journey of your progression in natural language, and AI generates matching chords.

**Example Prompts:**
- "Dawn breaking slowly over a quiet lake, mist rising, then birds beginning to sing"
- "Uncertainty and searching, finding a path, growing confidence, triumphant arrival"
- "Deep melancholy that gradually finds a glimmer of hope and ends peacefully"

**Style References:**
- General (default)
- Lauridsen (lush, suspended harmonies)
- Arvo Pärt (minimalist, tintinnabuli)
- Eric Whitacre (cluster voicings, added tones)
- Bach (functional harmony, counterpoint)
- Debussy (parallel motion, whole tone)

**Features:**
- Natural language input
- Configurable length (4/8/16/32 bars)
- AI explanation of harmonic choices
- Emotional phase breakdown
- Preview generated chords before applying
- Integrates with existing canvas

**Files:**
- `src/services/narrative-composer.ts` - Claude API integration
- `src/store/narrative-composer-store.ts` - State management
- `src/components/Modals/NarrativeComposerModal.tsx` - Modal UI
- `src/types/narrative.ts` - Type definitions
- `vite.config.js` - API proxy configuration

**API Setup:**
Requires `VITE_ANTHROPIC_API_KEY` environment variable for Claude API access.

---

### 7. Design Consistency Pass
**Commit:** `55c7476`

Applied consistent Warm Kinfolk design palette across all new components.

**Palette:**
```css
--warm-cream: #FAF8F5;      /* Primary background */
--warm-sand: #F5F1E8;       /* Secondary background */
--warm-gold: #E8A03E;       /* Primary action */
--warm-terracotta: #E85D3D; /* Secondary action */
--warm-amber: #D4924A;      /* Hover states */
--warm-text-primary: #3D3530;
--warm-text-secondary: #7A7067;
```

**Changes:**
- Replaced generic blues/greens with warm palette
- Fixed undefined CSS variables (--color-sage)
- Removed emojis, replaced with SVG icons
- Consistent typography hierarchy
- Created `DESIGN-PASS-GUIDE.md` for future reference

---

## Technical Improvements

### Audio System
- Lazy-loaded Salamander samples with progress indicator
- Improved envelope handling for natural decay
- Better error handling for audio context initialization

### State Management
- New Zustand stores for expert mode, necklaces, annotations
- Optimized re-renders with selective subscriptions
- Persistent state for user preferences

### Build & Performance
- Code-split modals for faster initial load
- Optimized CSS with consistent variable usage
- Production build verified (~91KB gzipped main bundle)

---

## File Summary

**New Files Created:** 25+
**Files Modified:** 40+
**Total Lines Changed:** ~3,500

### New Components
```
src/components/
├── Audio/
│   ├── AudioLoadingIndicator.tsx
│   └── AudioLoadingIndicator.module.css
├── Canvas/
│   ├── ChordAnnotationPopover.tsx
│   ├── ChordNoteBadge.tsx
│   ├── MelodicNecklace.tsx
│   └── MelodicNecklaceLayer.tsx
├── Modals/
│   └── NarrativeComposerModal.tsx
├── Panels/
│   └── ProgressionNotesPanel.tsx
├── Palette/
│   └── ExtendedChordPalette.tsx
├── UI/
│   ├── ExpertModeProgress.tsx
│   ├── ExpertModeToggle.tsx
│   ├── FloatingActionButton.tsx
│   └── NecklaceToggle.tsx
└── VoiceEditor/
    ├── VoiceHandle.tsx
    ├── VoiceHandleGroup.tsx
    └── VoiceEditorOverlay.tsx
```

### New Stores
```
src/store/
├── annotations-store.ts
├── expert-mode-store.ts
├── narrative-composer-store.ts
└── necklace-store.ts
```

### New Services
```
src/services/
└── narrative-composer.ts
```

---

## Migration Notes

### For Developers
1. Install new dependencies: `npm install`
2. Set up Anthropic API key for AI features: `VITE_ANTHROPIC_API_KEY`
3. Run `npm run build` to verify production build

### For Users
- Expert Mode unlocks automatically based on usage
- Existing progressions are compatible
- Double-click any chord to add annotations
- Access AI Composer via floating action button (+)

---

## Known Limitations

1. **AI Narrative Composer** requires API key and internet connection
2. **Salamander samples** require ~25MB download on first use
3. **Manual voicing** changes are not persisted to cloud yet
4. **Annotations** are stored locally, cloud sync planned for Phase 2.5

---

## What's Next (Phase 2.5+)

- Cloud sync for annotations and manual voicings
- MIDI export
- Collaboration features
- Mobile responsive improvements

---

## Credits

Built with Claude Code (Anthropic)

**Commits:**
- `db8feae` - Salamander Piano
- `6865d3c` - Melodic Necklaces
- `b49dba5` - Expert Mode
- `ad3107a` - Manual Voicing
- `8a74ccb` - Annotations
- `f4d5d44` - AI Narrative Composer
- `55c7476` - Design Consistency Pass
