# Neume User Guide

Welcome to **Neume**, a visual chord progression editor that lets you compose, analyze, and learn music harmony all in your browser. This guide covers Phase 1, where all your work is saved locally to your device.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Working with Chords](#working-with-chords)
4. [Playback & Tempo](#playback--tempo)
5. [AI Features](#ai-features)
6. [Saving & Loading Progressions](#saving--loading-progressions)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Your First Progression

When you open Neume, you'll see a demo progression already loaded with 8 chords in C Major. Here's what to do:

1. **Click the Play button** (top toolbar) or press **Spacebar** to hear your first progression
2. **Right-click on the canvas** to add new chords at any point
3. **Drag chords** along the timeline to reorder them
4. **Select chords** to modify them or learn more about them

### Important: Browser Storage

All your work in Neume is stored in your **browser's localStorage**. This means:
- Your progressions persist even after closing the browser
- Each browser/device has its own separate storage (Safari on iPhone won't have your Mac data)
- Clearing browser data will erase your progressions (so save important ones regularly!)
- No account login is needed—you own your data locally

---

## Interface Overview

### Top Toolbar

The top bar gives you control over your composition environment:

- **Key selector** (C, C#, D, etc.): Changes the musical key of all chords
- **Mode selector** (Major/Minor): Toggles between major and minor scale families
- **Beats per measure** (2, 3, 4, 6): Sets your time signature
- **Zoom buttons** (0.5x, 1x, 2x): Zoom in/out for detail or overview
- **Play button**: Start/stop playback
- **Analyze button**: Analyze a YouTube video or audio file for its chords
- **My Progressions button**: Open your saved progressions library
- **Refine button** (if chords selected): Get AI suggestions to improve selected chords

### The Canvas

The main working area in the middle is your **timeline canvas**:
- **Timeline ruler** at the top shows beat numbers
- **Grid lines** help you align chords visually
- **Chord shapes** represent different scale degrees (see legend below)
- **Playhead** (vertical line) shows current playback position during play
- **Phrase backgrounds** (subtle shading) group chords into musical phrases

#### Chord Shape Legend

Each chord is displayed with a unique shape and color based on its scale degree:

| Shape | Degree | Name | Typical Use |
|-------|--------|------|-------------|
| Gold Circle | I (1) | Tonic | The "home" chord, most stable |
| Sage Rounded Square | ii (2) | Supertonic | Approach chord, softer movement |
| Rose Triangle | iii (3) | Mediant | Relative to I, gentle color |
| Blue Square | IV (4) | Subdominant | Emotional tension, strong character |
| Terracotta Pentagon | V (5) | Dominant | Pull toward I, creates anticipation |
| Purple Circle | vi (6) | Submediant | Relative to IV, melancholic |
| Gray Pentagon | vii° (7) | Leading Tone Diminished | Rare, needs resolution to I |

**Note**: The shape remains the same whether the chord is major or minor—the scale degree is what matters in Neume's harmonic thinking.

### Tempo Dial

The circular dial in the bottom-right controls playback speed:
- Drag the dial or use arrow keys to adjust BPM (60–220)
- Shows current tempo in beats per minute
- Changes apply immediately

### Help Button (?)

Click the **?** button in the bottom-left to toggle the help panel and keyboard shortcuts reference.

---

## Working with Chords

### Adding Chords

**Method 1: Right-Click**
1. Right-click anywhere on the canvas
2. A context menu appears showing Roman numerals (I–vii°)
3. Click a Roman numeral to add that chord at that position

**Method 2: Keyboard Shortcut** (Future)
- This feature is planned but not yet implemented in Phase 1

### Selecting Chords

| Action | How |
|--------|-----|
| Single select | Click on a chord |
| Multi-select | Cmd/Ctrl + Click on multiple chords |
| Range select | Click first chord, Shift + Click last chord to select all in between |
| Select all | Cmd/Ctrl + A |
| Deselect | Press Escape or click empty canvas |

When chords are selected, they appear highlighted and handles appear on the selection box.

### Moving Chords

Chords can only move horizontally along the timeline (time dimension):

1. **Drag and drop**: Click and drag a selected chord left/right
2. **Arrow keys**: Select a chord, then use arrow keys to move it:
   - Arrow Left/Right: Move 0.25 beats per press
   - Shift + Arrow Left/Right: Move 1 beat per press
3. **Automatic snapping**: Chords snap to beat boundaries as you drag

### Editing Chord Properties

After clicking a chord once to select it:
- **Quality** (Major/Minor/Diminished): Automatically determined by scale degree and mode, but can be customized
- **Duration**: How many beats the chord sustains (default: 4 beats)
- **Voicing**: The specific notes (soprano, alto, tenor, bass) generated automatically for smooth voice leading

Chord properties are visible when you use the "Why This?" feature (see AI Features).

### Deleting Chords

**Delete selected chords:**
1. Select one or more chords
2. Press **Delete** or **Backspace**
3. If deleting 5+ chords, confirm the deletion in the popup

### Duplicating Chords

**Create copies of selected chords:**
1. Select one or more chords
2. Press **Cmd/Ctrl + D**
3. Duplicates appear 4 beats after the originals, with identical properties

---

## Playback & Tempo

### Play/Pause

- **Press Spacebar** or click the **Play button**
- The playhead moves across the timeline, highlighting chords as they play
- Click again to pause (playhead stays at current position)
- Press **Shift + Spacebar** to stop and return to the start

### Tempo Control

The tempo (speed) is shown in the **Tempo Dial** (bottom-right):

**Adjust tempo:**
- **Mouse**: Click and drag the dial clockwise (faster) or counter-clockwise (slower)
- **Keyboard**: Select any chord, then use:
  - Arrow Up: Increase tempo by 1 BPM
  - Shift + Arrow Up: Increase tempo by 10 BPM
  - Arrow Down: Decrease tempo by 1 BPM
  - Shift + Arrow Down: Decrease tempo by 10 BPM
- **Range**: 60–220 BPM

Tempo persists during your session and is stored with saved progressions.

### Audio Initialization

On first use, click **Play** to initialize the audio engine. Most modern browsers require user interaction before playing sound. After the first click, audio works normally.

---

## AI Features

Neume includes several AI-powered features to help you learn and compose better progressions.

### 1. Analyze (YouTube or Audio Upload)

Extract chords from any song:

**Step 1: Open Analyze Modal**
- Click the **Analyze** button in the top toolbar, or press **Cmd/Ctrl + Shift + A**

**Step 2: Choose Input Source**

**YouTube Tab:**
- Paste any YouTube URL into the text field
- Or click an example link to try a well-known song
- Optionally set start/end times to analyze just part of a song
- Advanced options (key/mode hints) help guide the analysis

**Audio Tab:**
- Drag and drop an audio file (mp3, wav, m4a, ogg, flac) onto the upload area
- Or click to browse and select a file
- Maximum file size: 50 MB

**Step 3: Wait for Analysis**
- A progress bar shows extraction progress
- Once complete, the detected key, mode, and tempo appear
- The extracted chords load onto your canvas

**Step 4: Review Results**
- A metadata banner shows the analyzed song title and any detected composer
- Click "Build From Bones" to see how the progression was deconstructed
- Click the X to clear the analyzed chords and return to a blank canvas

**Important Notes:**
- Analysis works best with clear harmonic content (classical, jazz, pop music)
- Some audio may take longer to analyze depending on length and quality
- The AI extracts Roman numeral chords relative to the detected key

---

### 2. Why This? (Chord Explanations)

Learn why each chord was chosen in the context of music theory:

**Step 1: Open Why This?**
1. Click on any chord to select it
2. A panel should slide in from the right with explanation content
3. Or use right-click > "Why This?" (if available)

**Step 2: Read the Explanation**
The panel shows:
- **Chord name**: Roman numeral + quality (e.g., "V7" = Dominant 7th)
- **Role**: What function this chord plays (tonic, dominant, subdominant, etc.)
- **Voice leading**: Notes in soprano, alto, tenor, bass
- **Evolution chain**: How the chord evolved from the previous one
- **Context**: Why it works in your specific progression

**Step 3: Listen to Contexts**
The panel includes playback buttons:
- **Play isolated**: Hear just this one chord in the current key/voicing
- **Play in progression**: Hear how it sounds in context with surrounding chords
- **Play evolution**: Hear the chord evolution chain (previous → current → next)

**Uses:**
- Learn music theory by exploring real progressions
- Understand voice leading and voice movement
- Discover why certain chords sound "right" together

---

### 3. Build From Bones (Deconstruction)

See how a progression was built step-by-step:

**When Available:**
- After analyzing a YouTube video or audio file, a **"Build From Bones"** button appears
- This is only available for analyzed progressions (not user-created ones)

**What It Shows:**
A series of steps showing how the chords evolved from basic harmonic skeleton to full realization:
- **Step 0 (Skeleton)**: The fundamental harmonic structure (usually I-V-vi-IV pattern)
- **Step 1 (Add 7ths)**: Adding chord extensions and embellishments
- Additional steps showing voice leading refinements and color additions

**Navigate Steps:**
- Click numbered dots to jump to any step
- Each step displays the chord progression in Roman numerals
- Preview the chord voicings at each stage

**Uses:**
- Understand compositional techniques
- See progression "underneath" complex analyzed results
- Learn how to layer complexity onto simple harmonic structures

---

### 4. Refine This (AI Suggestions)

Get AI suggestions to improve selected chords:

**Step 1: Select Chords**
1. Click to select one or more chords you want to improve
2. Click the **Refine** button (only enabled when chords are selected)

**Step 2: View Suggestions**
A modal shows:
- Current chords highlighted
- Suggested alternatives with explanation
- How each suggestion changes the harmonic color or tension

**Step 3: Apply or Dismiss**
- Click a suggestion to replace the current chords
- Close the modal to keep your original chords

**Uses:**
- Break out of harmonic ruts
- Discover more interesting chord substitutions
- Learn about modal interchange and borrowed chords

---

## Saving & Loading Progressions

Your progressions are automatically saved to browser localStorage. You can also explicitly save and organize them.

### Quick Save (Auto-Save)

Neume automatically saves the current canvas state:
- Changes are saved immediately as you edit
- Refreshing the page restores your progression
- **However**, clearing browser cache/data will erase all progressions

### Save Progression (Named, with Metadata)

To explicitly save a progression with a name and tags:

**Step 1: Click My Progressions**
- Opens your saved progressions library

**Step 2: Click "Save Current"**
- A dialog appears asking for progression details
- **Title**: Name your progression (e.g., "Melancholic Waltz")
- **Tags**: Add searchable labels (e.g., "minor", "jazz", "sad")
- **Note**: Optional description or composer credit

**Step 3: Confirm**
- Click Save to store the progression
- It now appears in your library with a timestamp

### Load a Progression

**Step 1: Click My Progressions**

**Step 2: Browse Your Library**
- **Search**: Type to find progressions by title or tag
- **Filter**: View by All, Recent, or Favorites
- **Favorite**: Click the heart icon to mark progressions as favorites

**Step 3: Select and Load**
- Click "Load" on any progression
- It replaces your current canvas (no undo after closing the modal)
- The modal closes and your progression is ready to edit

### Edit a Saved Progression

**Step 1: Click My Progressions

**Step 2: Find the Progression**

**Step 3: Click "Edit"**
- Opens a dialog with title, tags, and notes
- Make changes and click "Save"
- The progression in your library updates

### Delete a Saved Progression

**Step 1: Click My Progressions**

**Step 2: Find the Progression**

**Step 3: Click "Delete"**
- A confirmation popup appears
- Click again to confirm deletion
- The progression is permanently removed from localStorage

### Storage Limits

- **Browser storage limit**: Typically 5–50 MB depending on browser
- **Current usage**: Check the storage gauge in My Progressions modal
- **If you hit the limit**: Delete old progressions or export important ones as MIDI

### Export as MIDI (Planned)

A future feature will let you export progressions as MIDI files for use in DAWs. For now, JSON export is available via development tools.

---

## Keyboard Shortcuts

Master these shortcuts to work faster:

### Playback

| Shortcut | Action |
|----------|--------|
| **Space** | Play / Pause |
| **Shift + Space** | Stop (return to start) |

### Editing

| Shortcut | Action |
|----------|--------|
| **Cmd/Ctrl + Z** | Undo |
| **Cmd/Ctrl + Shift + Z** | Redo |
| **Cmd/Ctrl + D** | Duplicate selected chords |
| **Delete** or **Backspace** | Delete selected chords |
| **Cmd/Ctrl + A** | Select all chords |
| **Escape** | Clear selection |

### Navigation

| Shortcut | Action |
|----------|--------|
| **Arrow Left / Right** | Move selected chord 0.25 beats |
| **Shift + Arrow Left / Right** | Move selected chord 1 beat |
| **Tab** | Select next chord |
| **Shift + Tab** | Select previous chord |

### Canvas

| Shortcut | Action |
|----------|--------|
| **Cmd/Ctrl + +** | Zoom in |
| **Cmd/Ctrl + -** | Zoom out |
| **Cmd/Ctrl + 0** | Reset zoom to 1x |

### Features

| Shortcut | Action |
|----------|--------|
| **Cmd/Ctrl + Shift + A** | Open Analyze modal |
| **Cmd/Ctrl + S** | Save current progression |
| **?** or **Shift + /** | Show keyboard shortcuts guide |

### Platform Variations

- **Mac**: Use **Cmd** (⌘) instead of Ctrl
- **Windows/Linux**: Use **Ctrl**

---

## Troubleshooting

### General Issues

**Q: I don't hear any sound when I click Play**
- A: Some browsers require user interaction before audio can play. Click the Play button once to initialize audio, then try again.
- Check your system volume and browser audio permissions.

**Q: My progressions disappeared after closing the browser**
- A: They should persist in localStorage. Try refreshing the page.
- If they're gone, your browser cache may have been cleared. Try using a different browser profile.

**Q: The Analyze feature isn't working**
- A: Check that you're using a valid YouTube URL or supported audio format (mp3, wav, m4a, ogg, flac).
- The audio may be copy-protected. Try a different song.
- Audio larger than 50 MB must be trimmed before upload.

### Chord & Editing Issues

**Q: Why did all my chords change when I switched keys?**
- A: Changing the musical key reinterprets all chords relative to the new key. For example, a "V" in C Major becomes "V" in G Major (D instead of G). This is intentional—Neume thinks in scale degrees, not absolute pitches.
- If you want to keep absolute pitches, manually recreate your chord voicings.

**Q: Can I change a chord's quality (major/minor)?**
- A: The quality is determined by the scale degree and mode (major/minor).
- In Phase 1, custom voicings can't be directly edited, but future versions will allow this.

**Q: Why can't I move chords vertically?**
- A: Neume is a timeline-based editor, not a pitch-based editor. Chords exist only on the horizontal time axis.
- Vertical position doesn't matter for the harmony.

### Storage & Performance

**Q: I'm running out of browser storage**
- A: Delete old progressions you don't need, or export them as MIDI first.
- Use the storage gauge in My Progressions to see current usage.

**Q: The app feels slow or glitchy with many chords**
- A: Neume runs in your browser and processes audio in real-time. Large progressions (50+ chords) may be slower.
- Try zooming out to see the full progression without detailed rendering.
- Close other browser tabs to free up memory.

**Q: Will my progressions work on another device?**
- A: No. Each device/browser has its own localStorage. To transfer progressions:
  1. Save an important progression to a JSON file (development export)
  2. On the other device, import the JSON file
  - Or use MIDI export/import (when available)

### AI Features

**Q: Why is "Build From Bones" not available?**
- A: This feature only appears after analyzing a YouTube video or audio file.
- It's not available for user-created progressions.

**Q: The "Why This?" explanation doesn't make sense**
- A: Explanations are AI-generated and may occasionally be inaccurate or vague.
- Try selecting different chords in the progression to see if another explanation is clearer.
- This is a learning tool—trust your ear and music theory knowledge!

**Q: Refine suggestions don't match my musical style**
- A: AI suggestions are based on harmonic patterns in a training dataset.
- They may not suit your specific genre or artistic vision.
- Use them as inspiration, not rules!

---

## Tips & Best Practices

### Composition Workflow

1. **Start with a macro-structure**: Begin with 2–4 foundational chords (I-IV-V-I, for example)
2. **Build in layers**: Add passing chords, extensions, and voice leading refinements
3. **Use Analyze for inspiration**: Study progressions from songs you love
4. **Save frequently**: Use "Save Current" to store iterations of your work

### Learning Music Theory

1. **Use Why This?** to understand why chords work together
2. **Study Build From Bones** deconstructions to see composition techniques
3. **Switch keys**: Change the key of a progression to hear how modal relationships work
4. **Compare inversions**: Use SATB voicing info to understand voice leading

### Audio Quality

- Use high-quality audio files (128 kbps or better) for more accurate analysis
- Analyze isolated instruments (like solo piano) for clearer chord detection
- Avoid music with heavy effects or distortion

---

## Feature Roadmap (Phase 1 Limitations)

**Currently Available:**
- Visual chord progression editor
- Playback with tempo control
- Analyze YouTube & audio files
- Why This? explanations
- Build From Bones deconstruction
- Refine suggestions
- Save/Load with localStorage
- Keyboard shortcuts

**Coming Soon (Phase 2+):**
- User accounts & cloud sync
- MIDI import/export
- Direct chord voicing editing
- Harmony suggestions based on melody
- Chord progressions library
- Collaboration features
- Mobile app

---

## Support & Feedback

Neume is in active development. If you encounter bugs or have feature requests:
1. Check this guide and Troubleshooting section first
2. Try the example progressions to verify the app works
3. Contact the development team with detailed steps to reproduce issues

**Happy composing!** 🎵

---

## Glossary

- **Scale degree**: Position in a musical scale (I=1st, V=5th, etc.), represented as Roman numerals
- **Mode**: Major or minor tonality determining chord qualities
- **Voice leading**: How individual notes move smoothly between chords (SATB = Soprano, Alto, Tenor, Bass)
- **SATB voicing**: The four-part harmony standard in classical music (soprano on top, bass on bottom)
- **Phrase**: A group of chords forming a musical thought (like a sentence)
- **Playhead**: The moving indicator showing current playback position
- **Borrowed chord**: A chord from a parallel key (e.g., VI from C minor used in C major)
- **Dominant**: The V chord, which pulls toward resolution to the I chord
- **Tonic**: The I chord, the harmonic home base
- **Voicing**: The specific pitches and octaves of a chord's notes
