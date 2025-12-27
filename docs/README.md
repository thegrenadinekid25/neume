# Neume Documentation

Welcome to Neume documentation. Choose the guide that fits your needs:

## For Users

### **Quick Start** (5 minutes)
Start here if you just want to get composing quickly.
- Read: [`QUICK-START.md`](./QUICK-START.md)
- Covers: Basic controls, chord shapes, keyboard shortcuts, AI features overview
- Best for: First-time users, quick reference

### **Full User Guide** (30 minutes)
Comprehensive guide to all Neume features.
- Read: [`USER-GUIDE.md`](./USER-GUIDE.md)
- Covers:
  - Getting started and browser storage
  - Complete interface overview with chord shape legend
  - Working with chords (add, select, move, edit, delete, duplicate)
  - Playback and tempo control
  - All AI features (Analyze, Why This, Build From Bones, Refine)
  - Saving, loading, and organizing progressions
  - Complete keyboard shortcuts reference
  - Troubleshooting common issues
  - Tips, best practices, and glossary
- Best for: Learning all features, detailed explanations, troubleshooting

## For Developers

### **Developer Guide** (Technical Reference)
Architecture, implementation details, and development workflows.
- Read: [`DEVELOPER-GUIDE.md`](./DEVELOPER-GUIDE.md)
- Covers: Project structure, component architecture, state management, API integration, development workflows
- Best for: Contributing code, understanding internals, feature development

---

## Quick Navigation

| I want to... | Read this |
|--------------|-----------|
| Start composing right now | [QUICK-START.md](./QUICK-START.md) |
| Understand all the features | [USER-GUIDE.md](./USER-GUIDE.md) |
| Learn keyboard shortcuts | [USER-GUIDE.md](./USER-GUIDE.md#keyboard-shortcuts) |
| Understand chord shapes | [USER-GUIDE.md](./USER-GUIDE.md#chord-shape-legend) |
| Save & load progressions | [USER-GUIDE.md](./USER-GUIDE.md#saving--loading-progressions) |
| Use AI features | [USER-GUIDE.md](./USER-GUIDE.md#ai-features) |
| Troubleshoot issues | [USER-GUIDE.md](./USER-GUIDE.md#troubleshooting) |
| Understand the codebase | [DEVELOPER-GUIDE.md](./DEVELOPER-GUIDE.md) |
| Learn about components | [DEVELOPER-GUIDE.md](./DEVELOPER-GUIDE.md#component-architecture) |
| Understand state management | [DEVELOPER-GUIDE.md](./DEVELOPER-GUIDE.md#state-management) |

---

## Current Features

### Phase 2 (Current Release)

See full details: [`PHASE-2-RELEASE-NOTES.md`](./PHASE-2-RELEASE-NOTES.md)

**New in Phase 2:**
- **Salamander Grand Piano** - Professional sampled piano audio
- **Melodic Necklaces** - Visual voice leading curves between chords
- **Expert Mode** - Unlockable 9th/11th/13th chords + altered dominants
- **Manual Voicing Controls** - Drag handles to adjust SATB voices
- **Text Annotations** - Per-chord notes (theory, performance, reference)
- **AI Narrative Composer** - Describe emotions, AI generates chords
- **Cloud Storage** - Supabase-powered sync across devices

### Phase 1 Foundation

- **Visual chord progression editor** with timeline-based interface
- **Audio playback** with tempo control (60-220 BPM)
- **Chord analysis** from YouTube videos and audio files
- **AI explanations** ("Why This?") for music theory learning
- **Progression deconstruction** ("Build From Bones")
- **AI suggestions** ("Refine This") for chord improvements
- **Keyboard shortcuts** for efficient workflow
- **SATB voicing** with voice leading algorithms
- **Modal switching** (Major/Minor key changes)

---

## Key Concepts

### Scale Degrees (Roman Numerals)
Neume uses Roman numerals to represent chords relative to a musical key:
- **I** = Tonic (1st scale degree) - home chord
- **ii** = Supertonic (2nd) - minor quality
- **iii** = Mediant (3rd) - minor quality
- **IV** = Subdominant (4th) - major quality
- **V** = Dominant (5th) - major quality, resolves to I
- **vi** = Submediant (6th) - minor quality
- **vii°** = Leading tone diminished (7th) - rare, unstable

### SATB Voicing
Four-part vocal harmony:
- **Soprano** = Highest voice
- **Alto** = Second voice
- **Tenor** = Third voice
- **Bass** = Lowest voice

Neume automatically generates smooth voice leading between chords.

### localStorage (Phase 1 Storage)
All progressions are stored in your browser's localStorage:
- No login or account needed
- No cloud sync (data stays on your device)
- ~5-50 MB storage limit depending on browser
- Data persists until browser cache is cleared
- Each browser/device has separate storage

---

## Coming Soon (Phase 2.5+)

- MIDI import/export
- Melody-based harmony suggestions
- Collaboration features
- Mobile responsive improvements

---

## Support

For issues or feature requests, refer to the [Troubleshooting section](./USER-GUIDE.md#troubleshooting) in the User Guide.

---

**Version**: Phase 2.0
**Last Updated**: December 2024
