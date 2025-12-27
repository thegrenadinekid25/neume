# Week 1 Prompt Package - README

## 🎵 Neume - Foundation Complete

**Version:** 1.0  
**Week:** 1 of 10  
**Status:** Ready for Execution  
**Date:** December 1, 2024

---

## 📦 What's In This Package

This package contains everything needed to build Week 1 of Neume - the complete visual foundation.

### Files Included

1. **8 Executable Prompts** (001-008)
   - Detailed, copy-paste-ready instructions for Claude
   - Complete code generation for each component
   - TypeScript, React, and styling

2. **EXECUTION-GUIDE.md**
   - Step-by-step day-by-day plan
   - How to use each prompt
   - Troubleshooting guide
   - Time estimates

3. **DEPENDENCY-GRAPH.md**
   - Visual task dependencies
   - Critical path analysis
   - Parallel work opportunities
   - Risk assessment

4. **SUCCESS-CRITERIA.md**
   - Measurable completion criteria
   - Quality gates
   - Acceptance test
   - Failure conditions

5. **This README**
   - Package overview
   - Quick start guide
   - What you'll build

---

## 🎯 What You'll Build

By the end of Week 1, you'll have:

✅ **A working React + TypeScript application**
- Modern Vite build system
- Full type safety
- ESLint configured
- Path aliases set up

✅ **Complete visual foundation**
- Canvas with timeline grid
- 7 distinct chord shape types (I-vii)
- Hand-drawn aesthetic with organic wobble
- Full color system (major/minor modes)
- Watercolor background effect

✅ **Interactive demo**
- Playback animation with pulsing chords
- Key selection (C, D, E, F, G, A)
- Major/minor mode toggle
- Zoom controls (0.5x, 1x, 2x)
- Hover and selection states

✅ **Professional code quality**
- Strict TypeScript types
- React best practices
- Modular component structure
- CSS modules for styling
- 60fps performance

---

## ⚡ Quick Start

### Prerequisites

```bash
# Ensure you have:
- Node.js 18+ installed
- Modern code editor (VS Code recommended)
- Terminal/command line access
- 2-3 hours per day for 7 days
```

### Execution Steps

1. **Read EXECUTION-GUIDE.md** (10 minutes)
   - Understand the day-by-day plan
   - Review troubleshooting tips

2. **Execute prompts in order** (7 days)
   ```
   Day 1: 001 → 002 (Project setup + Dependencies)
   Day 2: 003 (Structure & Types)
   Day 3: 004 (Color system)
   Day 4: 005 (Canvas grid)
   Day 5: 006 (Chord shapes)  ← Most time here
   Day 6: 007 (Watercolor background)
   Day 7: 008 (Integration demo)
   ```

3. **Verify success criteria** (SUCC ESS-CRITERIA.md)
   - All visual components render
   - Interactive controls work
   - 60fps performance
   - No TypeScript errors

4. **Celebrate!** 🎉
   - Week 1 complete
   - Ready for Week 2 (interactions)

---

## 📋 Prompt Overview

### 001: Project Setup (30 min)
- Creates Vite + React + TypeScript project
- Configures ESLint, TypeScript, path aliases
- Sets up build system

### 002: Install Dependencies (15 min)
- Installs Tonal.js (music theory)
- Installs Tone.js (audio synthesis)
- Installs @dnd-kit, Framer Motion, Zustand
- Installs utilities (uuid, date-fns, file-saver)

### 003: Project Structure & Types (45 min)
- Creates complete folder structure
- Defines all TypeScript interfaces
- Sets up barrel exports
- Creates constants file

### 004: Color System (30 min)
- Implements all colors from spec
- Scale degree colors (major/minor)
- Key background colors (24 combinations)
- UI chrome colors
- Color manipulation utilities

### 005: Canvas Grid (1 hour)
- Main canvas component
- Timeline grid with beat markers
- Measure numbers
- Playhead component
- Scrollable horizontal layout

### 006: ChordShape Component (2-3 hours) ⭐ Most Complex
- All 7 SVG shape types (I-vii)
- Hand-drawn wobble effect
- Extension badges (7, add9, sus4, etc.)
- Interactive states (hover, selected, playing)
- Chromatic shimmer for borrowed chords

### 007: Watercolor Background (45 min)
- Watercolor wash effect
- Paper grain texture
- Luminosity variance (±5%)
- Smooth key transitions
- Blend modes for organic feel

### 008: Integration Demo (2 hours)
- Complete working demo
- 8 example chords (all types)
- Interactive controls
- Visual legend
- Comprehensive testing

---

## 🎨 Visual Design System

### Chord Shapes (Function + Color)

**Tonic Function:**
- I: ● Circle - Rich gold (#D4AF37)
- vi: ● Circle - Purple (#9B7EBD)

**Subdominant Function:**
- ii: â—» Rounded Square - Sage green (#6B9080)
- IV: â– Square - Periwinkle blue (#4A6FA5)

**Dominant Function:**
- V: â¬  Pentagon - Terracotta (#E07A5F)
- vii°: â¬ Pentagon - Gray (#6C6C6C)

**Mediant:**
- iii: â–² Triangle - Dusty rose (#B98B8B)

### Key Backgrounds

Subtle watercolor washes:
- C major/minor: Soft warm beige
- G major/minor: Pale blue-green
- D major/minor: Gentle cream-yellow
- (+ 9 more keys, each with unique background)

### Animations

- **Hover:** Scale 1.05x, subtle glow (300ms)
- **Selected:** Blue stroke, scale 1.03x
- **Playing:** Breathing pulse 1.0 → 1.12 → 1.0
- **Chromatic:** Iridescent shimmer overlay

---

## 🛠️ Technology Stack

### Core
- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool

### Music
- **Tonal.js** - Music theory (scales, chords, intervals)
- **Tone.js** - Audio synthesis (used in Week 5-6)

### UI/Interaction
- **@dnd-kit** - Drag-and-drop (used in Week 3-4)
- **Framer Motion** - Animations
- **Zustand** - State management

### Utilities
- **uuid** - Unique IDs
- **date-fns** - Date handling
- **FileSaver.js** - File exports
- **MidiWriterJS** - MIDI generation (used in Week 9)

---

## 📊 Success Metrics

Week 1 is complete when:

âœ… **Visual:** All 7 chord types render correctly with proper colors  
âœ… **Interactive:** Hover, select, play animations work smoothly  
âœ… **Performance:** Maintains 60fps with 50+ chords  
âœ… **Technical:** Zero TypeScript errors, clean console  
âœ… **Quality:** Code follows React best practices  

---

## 🚀 Estimated Timeline

**Serial Execution (Recommended):**
- Day 1: Setup + Dependencies
- Day 2: Structure + Types
- Day 3: Colors
- Day 4: Canvas
- Day 5: Shapes (longest day)
- Day 6: Watercolor
- Day 7: Integration

**Total:** 7 days, 2-3 hours/day

**Parallel Execution (Advanced):**
- Combine Days 3-4 (Colors + Canvas in parallel)
- **Total:** 6 days

---

## 📖 Documentation Structure

```
week1-prompts/
├── 001-project-setup.md           ← Start here
├── 002-install-dependencies.md
├── 003-project-structure-types.md
├── 004-color-system-constants.md
├── 005-canvas-grid-component.md
├── 006-chord-shape-component.md   ← Most complex
├── 007-watercolor-background.md
├── 008-integration-demo.md        ← Finish here
├── EXECUTION-GUIDE.md              ← Read first
├── DEPENDENCY-GRAPH.md             ← Task relationships
├── SUCCESS-CRITERIA.md             ← Completion checklist
└── README.md                       ← You are here
```

---

## ⚠️ Important Notes

### Before Starting

1. **Read EXECUTION-GUIDE.md completely** - Don't skip this!
2. **Follow prompts in order** - Dependencies matter
3. **Test after each prompt** - Catch issues early
4. **Commit to Git frequently** - After each working prompt

### While Executing

1. **Don't skip ahead** - Each prompt builds on previous
2. **Verify TypeScript compiles** - Run `npx tsc --noEmit` after each
3. **Check console** - Should be clean (no errors)
4. **Take screenshots** - Document your progress

### Common Pitfalls

- âŒ Skipping Prompt 003 (types are critical!)
- âŒ Not verifying colors match spec
- âŒ Rushing through Prompt 006 (shapes are complex)
- âŒ Not testing playback before finishing

---

## 🆘 Getting Help

If you encounter issues:

1. **Check prompt's troubleshooting section**
2. **Review EXECUTION-GUIDE.md troubleshooting**
3. **Ask Claude in new conversation** (paste error + context)
4. **Verify dependencies installed** (`npm list`)
5. **Restart dev server** (`npm run dev`)

---

## 🎯 What's Next

### Week 2: Interactions

After Week 1 is complete, Week 2 will add:
- Right-click context menu
- Drag-and-drop chord placement
- Selection system (multi-select)
- Delete functionality
- Undo/redo
- Keyboard shortcuts

### Week 3-4: Core Interaction

- Chord editing
- Connection lines
- Voice leading visualization
- Timeline navigation

### Week 5-6: Audio & Playback

- Audio engine (Tone.js)
- SATB voicing
- Playback system
- Tempo control
- Beautiful cathedral reverb

---

## 📝 Notes

### Design Philosophy

**"Every feature is a failure to simplify."**

Week 1 focuses on:
- ✅ Core visual language (shapes, colors)
- ✅ Beautiful, organic aesthetic
- ✅ Smooth interactions
- ❌ Not: complex features (those come later)

### Code Quality Standards

- Strict TypeScript (no `any`)
- React best practices
- Memoization for performance
- CSS modules for styling
- Comprehensive comments

### Performance Targets

- 60fps animations
- <2s initial load
- Smooth with 100+ chords
- No memory leaks

---

## ✅ Ready to Begin!

You have everything you need to build Week 1:

1. âœ… 8 executable prompts
2. âœ… Day-by-day execution guide
3. âœ… Dependency graph
4. âœ… Success criteria
5. âœ… Complete specification

**Next step:** Open `EXECUTION-GUIDE.md` and start Day 1!

---

## 🎵 Let's Build Something Extraordinary!

This is the foundation of Neume - a tool that will help composers explore and understand harmony in new ways.

Every shape, color, and interaction has been carefully designed to teach through experience. You're building something that combines:
- 🎨 Beautiful visual design
- 🎵 Deep musical theory
- 💻 Modern web technology
- ✨ Organic, human-centered aesthetics

Take your time. Test thoroughly. Enjoy the process.

**Week 1 starts now.** 🚀

---

*For questions or issues, refer to EXECUTION-GUIDE.md or start a new Claude conversation with your specific question.*

**Version:** 1.0  
**Last Updated:** December 1, 2024  
**Status:** ✅ Ready for Execution
