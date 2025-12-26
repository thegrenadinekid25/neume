# Week 1 Execution Guide

**Welcome to Harmonic Canvas development!** 🎵

This guide will walk you through executing the 8 Week 1 prompts in order. By the end of Week 1, you'll have a beautiful, functional visual foundation for Harmonic Canvas.

---

## Overview

**Timeline:** 7 days (Week 1)  
**Prompts:** 8 executable code generation prompts  
**Goal:** Complete visual system with canvas, shapes, and colors  
**Outcome:** Working demo with all 7 chord types visible and interactive

---

## Prerequisites

Before starting:
- [ ] Modern code editor (VS Code recommended)
- [ ] Node.js 18+ installed
- [ ] Terminal/command line access
- [ ] Git for version control
- [ ] 2-3 hours per day for development

---

## Execution Process

### How to Use These Prompts

Each prompt is a **complete, self-contained instruction** that you paste into a new Claude conversation to generate code.

**Steps:**
1. Open a new conversation with Claude (claude.ai)
2. Upload/paste the entire prompt file
3. Claude will generate complete, working code
4. Copy the code into your project
5. Test and verify it works
6. Move to the next prompt

**Important:** Execute prompts in order (001 → 008). Each builds on the previous.

---

## Day-by-Day Plan

### Day 1: Project Foundation

**Morning (2 hours):**
1. **Execute Prompt 001:** Project Setup
   - Creates Vite + React + TypeScript project
   - Configures ESLint, TypeScript, path aliases
   - Run `npm run dev` to verify

2. **Execute Prompt 002:** Install Dependencies
   - Installs Tonal.js, Tone.js, @dnd-kit, Framer Motion, Zustand, etc.
   - Verifies all packages installed correctly
   - Check `package.json` for all dependencies

**Expected Output:** 
- Working dev server at localhost:3000
- All dependencies installed
- No TypeScript errors

**Checkpoint:** Run `npm run dev` → See "Harmonic Canvas" header

---

### Day 2: Structure & Types

**Morning (2 hours):**
3. **Execute Prompt 003:** Project Structure & Types
   - Creates complete folder structure
   - Defines all TypeScript interfaces (Chord, Progression, etc.)
   - Sets up barrel exports

**Expected Output:**
- Organized src/ folder with all subfolders
- Complete type definitions in src/types/
- Can import types: `import { Chord } from '@types'`

**Checkpoint:** Run `npx tsc --noEmit` → No errors

---

### Day 3: Color System

**Afternoon (1.5 hours):**
4. **Execute Prompt 004:** Color System Constants
   - Creates all color constants (scale degrees, keys, UI)
   - Sets up CSS variables
   - Utility functions for color manipulation

**Expected Output:**
- src/styles/colors.ts with all constants
- Updated variables.css with CSS custom properties
- Can call `getScaleDegreeColor(1, 'major')`

**Checkpoint:** Import and log a color → See hex value

---

### Day 4: Canvas & Grid

**Full Day (3 hours):**
5. **Execute Prompt 005:** Canvas Grid Component
   - Creates Canvas, Grid, TimelineRuler, Playhead components
   - Implements scrollable timeline
   - Key-specific backgrounds

**Expected Output:**
- Working Canvas component with grid
- Measure markers visible
- Background color changes with key

**Checkpoint:** Import Canvas in App.tsx → See grid and ruler

---

### Day 5: Chord Shapes

**Full Day (3-4 hours):**
6. **Execute Prompt 006:** ChordShape Component
   - Creates all 7 shape types (I-vii)
   - Hand-drawn wobble effect
   - Extension badges
   - Interactive states (hover, selected, playing)

**Expected Output:**
- ChordShape component renders all 7 types
- Colors from scale degree system
- Hover/select/playing animations work

**Checkpoint:** Place one chord on canvas → See shape with correct color

---

### Day 6: Visual Polish

**Morning (2 hours):**
7. **Execute Prompt 007:** Watercolor Background
   - Creates watercolor wash effect
   - Paper grain texture
   - Smooth key transitions

**Expected Output:**
- Canvas has subtle texture
- Background not flat
- Smooth transition when key changes

**Checkpoint:** Change key → See smooth background fade

---

### Day 7: Integration & Testing

**Full Day (3-4 hours):**
8. **Execute Prompt 008:** Integration Demo
   - Complete demo with all features
   - Interactive controls (key, mode, zoom, playback)
   - Visual legend
   - Comprehensive testing

**Expected Output:**
- Working demo with 8 chords visible
- Play button starts playback animation
- All 7 chord types + chromatic example
- Zoom controls work
- Key changes work

**Checkpoint:** Click Play → See playhead move and chords pulse

---

## Prompt Execution Details

### Prompt 001: Project Setup

**What you'll paste to Claude:**
```
[Entire contents of 001-project-setup.md]
```

**What Claude will give you:**
- Complete file structure
- All configuration files (tsconfig.json, vite.config.ts, .eslintrc.cjs)
- Initial App.tsx and main.tsx
- Installation commands

**What you do:**
1. Run the installation commands
2. Copy all generated files to your project
3. Run `npm run dev` to verify

**Estimated time:** 30 minutes

---

### Prompt 002: Install Dependencies

**What you'll paste to Claude:**
```
[Entire contents of 002-install-dependencies.md]
```

**What Claude will give you:**
- Complete dependency installation command
- Verification steps
- Expected package.json dependencies section

**What you do:**
1. Run the installation command
2. Verify all packages installed
3. Check package.json matches expected output

**Estimated time:** 15 minutes

---

### Prompt 003: Project Structure & Types

**What you'll paste to Claude:**
```
[Entire contents of 003-project-structure-types.md]
```

**What Claude will give you:**
- Complete folder structure creation commands
- All TypeScript type files (chord.ts, progression.ts, ai.ts, audio.ts, ui.ts)
- Constants file
- Style files (globals.css, variables.css)

**What you do:**
1. Create folder structure
2. Copy all type definition files
3. Copy constants and style files
4. Run `npx tsc --noEmit` to verify

**Estimated time:** 30 minutes

---

### Prompt 004: Color System

**What you'll paste to Claude:**
```
[Entire contents of 004-color-system-constants.md]
```

**What Claude will give you:**
- Complete colors.ts file with all constants
- Updated variables.css with CSS custom properties
- Color conversion utilities

**What you do:**
1. Copy colors.ts to src/styles/
2. Update variables.css
3. Test color functions in console

**Estimated time:** 20 minutes

---

### Prompt 005: Canvas Grid

**What you'll paste to Claude:**
```
[Entire contents of 005-canvas-grid-component.md]
```

**What Claude will give you:**
- Canvas.tsx component
- Grid.tsx component
- TimelineRuler.tsx component
- Playhead.tsx component
- All CSS modules

**What you do:**
1. Create components/Canvas/ folder
2. Copy all component files
3. Copy all CSS modules
4. Import Canvas in App.tsx
5. Verify grid displays

**Estimated time:** 45 minutes

---

### Prompt 006: ChordShape Component

**What you'll paste to Claude:**
```
[Entire contents of 006-chord-shape-component.md]
```

**What Claude will give you:**
- Complete ChordShape.tsx component
- All shape generation functions
- ChordShape.module.css
- Badge and extension handling

**What you do:**
1. Copy ChordShape.tsx to components/Canvas/
2. Copy CSS module
3. Create test chord object
4. Render in Canvas
5. Verify all 7 shapes work

**Estimated time:** 1.5 hours

---

### Prompt 007: Watercolor Background

**What you'll paste to Claude:**
```
[Entire contents of 007-watercolor-background.md]
```

**What Claude will give you:**
- WatercolorBackground.tsx component
- CSS module with blend modes
- Color variant generation
- Integration code for Canvas

**What you do:**
1. Copy WatercolorBackground.tsx to components/Canvas/
2. Copy CSS module
3. Update Canvas.tsx to include background
4. Test key changes

**Estimated time:** 30 minutes

---

### Prompt 008: Integration Demo

**What you'll paste to Claude:**
```
[Entire contents of 008-integration-demo.md]
```

**What Claude will give you:**
- Complete App.tsx integration
- Demo controls (key, mode, zoom, play)
- 8 example chords
- Visual legend
- App.css styling

**What you do:**
1. Replace App.tsx with generated code
2. Copy App.css
3. Test all controls
4. Run through testing checklist
5. Celebrate! 🎉

**Estimated time:** 2 hours

---

## Troubleshooting

### Common Issues

**Issue:** TypeScript errors about missing modules

**Solution:**
```bash
# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

**Issue:** CSS modules not working

**Solution:**
- Ensure files end in `.module.css`
- Import as: `import styles from './Component.module.css'`
- Check vite.config.ts has no CSS conflicts

**Issue:** Colors not showing correctly

**Solution:**
- Verify colors.ts is in src/styles/
- Check imports: `import { getScaleDegreeColor } from '@/styles/colors'`
- Ensure CSS variables are loaded (variables.css imported in main.tsx)

**Issue:** Shapes not rendering

**Solution:**
- Check SVG paths in console
- Verify chord object has all required fields
- Check position.x and position.y are within canvas bounds

**Issue:** Animations not smooth

**Solution:**
- Ensure Framer Motion is installed: `npm list framer-motion`
- Check browser hardware acceleration enabled
- Reduce number of chords for testing

---

## Quality Checkpoints

After each prompt, verify:

âœ… **No TypeScript errors**
```bash
npx tsc --noEmit
```

âœ… **No console warnings**
- Open browser DevTools
- Check Console tab
- Should be clean (no red errors)

âœ… **Code follows spec**
- Colors match hex values from spec
- Animations use correct easing curves
- Typography uses specified fonts

âœ… **Visual quality**
- Take screenshot
- Compare with spec visuals
- Ensure hand-drawn wobble visible

---

## Week 1 Completion Checklist

By end of Day 7, you should have:

- [ ] Project runs with `npm run dev`
- [ ] All dependencies installed
- [ ] Complete folder structure
- [ ] All TypeScript types defined
- [ ] Color system working
- [ ] Canvas with grid visible
- [ ] All 7 chord shapes render correctly
- [ ] Watercolor background effect
- [ ] Integration demo functional
- [ ] Play button animates chords
- [ ] Zoom controls work
- [ ] Key changes update background
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] 60fps performance
- [ ] Ready for Week 2!

---

## Tips for Success

1. **Execute in order** - Don't skip ahead
2. **Test after each prompt** - Catch issues early
3. **Commit to Git frequently** - After each working prompt
4. **Take breaks** - This is 7 days of focused work
5. **Ask Claude for help** - If stuck, start new conversation with specific question
6. **Screenshot progress** - Visual record of your journey
7. **Celebrate milestones** - Day 5 (shapes working) is a big one!

---

## What's Next (Week 2)

After Week 1 is complete, Week 2 will add:
- Right-click context menu
- Drag-and-drop chord placement
- Selection system
- Delete functionality
- Undo/redo
- Keyboard shortcuts

But first: **Complete Week 1!**

---

## Getting Help

If you encounter issues:

1. **Check the prompt's troubleshooting section** - Most common issues covered
2. **Review the spec** - Ensure understanding the visual requirements
3. **Ask Claude in new conversation** - Paste error message and context
4. **Check dependencies** - Run `npm list` to verify installations
5. **Restart dev server** - Sometimes fixes mysterious issues

---

## Success Metrics

You'll know Week 1 is complete when:

âœ… You can click Play and watch 8 chords pulse in sequence  
âœ… You can change key and see background smoothly transition  
âœ… You can zoom and see shapes scale correctly  
âœ… All 7 chord types are visually distinct  
âœ… Colors match the spec exactly  
âœ… Performance is smooth (60fps)  
âœ… No errors in console  
âœ… Code is clean and well-typed

---

## Let's Build! 🚀

You're ready to start. Open the first prompt (001-project-setup.md), start a new Claude conversation, and paste it in.

**Remember:** This is a marathon, not a sprint. Take your time, test thoroughly, and enjoy watching Harmonic Canvas come to life!

Good luck! 🎵✨
