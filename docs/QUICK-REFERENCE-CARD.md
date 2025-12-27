# Neume Quick Reference Card

One-page visual reference guide for essential features and controls.

---

## Keyboard Shortcuts (Mac/Windows)

### Playback Control
| Shortcut | Action |
|----------|--------|
| **Space** | Play / Pause |
| **Shift + Space** | Stop (return to start) |

### Editing
| Shortcut | Action |
|----------|--------|
| **Cmd/Ctrl + Z** | Undo |
| **Cmd/Ctrl + Shift + Z** | Redo |
| **Cmd/Ctrl + D** | Duplicate selected chord(s) |
| **Delete / Backspace** | Delete selected chord(s) |
| **Cmd/Ctrl + A** | Select all chords |
| **Escape** | Clear selection |

### Navigation & Adjustment
| Shortcut | Action |
|----------|--------|
| **← →** | Move selected 0.25 beats |
| **Shift + ← →** | Move selected 1 beat |
| **↑ ↓** | Adjust tempo ±1 BPM |
| **Shift + ↑ ↓** | Adjust tempo ±10 BPM |

### Analysis
| Shortcut | Action |
|----------|--------|
| **Cmd/Ctrl + Shift + A** | Open Analyze modal |

### Help
| Shortcut | Action |
|----------|--------|
| **? / Shift + /** | Show keyboard shortcuts guide |

---

## Mouse Actions

### Canvas Interactions
| Action | Result |
|--------|--------|
| **Right-click** | Add a new chord at position |
| **Click** | Select single chord |
| **Cmd/Ctrl + Click** | Multi-select / Toggle selection |
| **Drag chord** | Move chord horizontally |
| **Drag-select box** | Select multiple chords |
| **Shift + Drag-select** | Add to existing selection |

### Chord Operations
| Action | Result |
|--------|--------|
| **Right-click on chord** | Context menu (delete, copy, edit) |
| **Hover on chord** | Show chord details |

---

## Key Features Overview

### Controls Panel

#### Play / Pause Button
- Start or stop playback of the progression
- Use **Space** key as shortcut
- Visual feedback shows current playback state

#### Tempo Dial (Lower left)
- **Drag left/right** to adjust speed (60-220 BPM)
- Display shows current BPM
- Use **↑ ↓** arrow keys for fine adjustment
- Hold **Shift** for larger adjustments (±10 BPM)

#### Key Selector
- Change the musical key (C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B)
- All chords transpose automatically
- Examples: C Major, G Major, D Minor

#### Mode Selector
- Switch between Major and Minor
- Changes the harmonic character
- Works with all chord progressions

### Chord Shapes & Visual Guide

Each scale degree has a unique shape and color:
- **I (Tonic)** - Circle (Gold)
- **ii (Supertonic)** - Rounded Square (Sage)
- **iii (Mediant)** - Triangle (Rose)
- **IV (Subdominant)** - Square (Blue)
- **V (Dominant)** - Pentagon (Terracotta)
- **vi (Submediant)** - Circle (Purple)
- **vii° (Leading Tone)** - Pentagon (Gray)

### Timeline & Playback

- **Playhead** - Shows current position during playback (vertical line)
- **Timeline Ruler** - Click to jump to specific time
- **Grid Lines** - Visual reference for beat timing

### Buttons & Actions

#### Analyze Button
- Extract chord progressions from YouTube videos
- Paste a YouTube URL to analyze
- Shortcut: **Cmd/Ctrl + Shift + A**
- Auto-detects key, mode, and tempo

#### My Progressions Button
- Save and load your chord progressions
- Manage your progression library
- Load previously created progressions

#### Refine Button
- Get AI suggestions for selected chords
- Explore harmonic variations
- Based on music theory principles
- Requires at least one chord selected

---

## Selection & Editing Workflow

### Creating a Progression
1. **Right-click** on canvas to add chords
2. **Drag chords** to reorder them on the timeline
3. Use **Key/Mode selectors** to change tonality

### Editing Chords
1. **Click** a chord to select it (highlighted in blue)
2. **Drag** to move it left/right on timeline
3. **Right-click** for context menu options
4. **Delete** to remove it

### Multi-Chord Editing
1. **Click** to select first chord
2. **Cmd/Ctrl + Click** to add more to selection
3. Or **drag-select** to select a range
4. Use **Cmd/Ctrl + D** to duplicate all selected
5. Press **Delete** to remove all selected

### Playback & Listening
1. Click **Play** button (or press **Space**)
2. Use **Tempo Dial** to adjust speed
3. Press **Shift + Space** to stop and return to start
4. Use **↑ ↓** arrows for fine tempo adjustments

---

## Tips & Tricks

- **Quick Selection**: Use **Shift + Drag** to select multiple chords while keeping existing selection
- **Fast Tempo**: Hold **Shift** while using arrows to adjust tempo by 10 BPM increments
- **Undo Everything**: Use **Cmd/Ctrl + Z** repeatedly to undo multiple actions
- **Analyze First**: When learning, try the Analyze button to see how progressions are structured
- **Refine Suggestions**: Select chords and use Refine to get music theory-based suggestions

---

## Context Menu (Right-Click)

When you right-click on a chord, you'll see options to:
- **Delete** - Remove the chord
- **Edit** - Modify chord properties
- **Copy** - Copy the chord for pasting elsewhere

---

## Need More Help?

- Press **?** (or **Shift + /**) to open the full Keyboard Shortcuts Guide
- Hover over any control for help tooltips
- Check the User Guide for detailed explanations: `docs/USER-GUIDE.md`
- See the Developer Guide for technical info: `docs/DEVELOPER-GUIDE.md`

---

## Chord Duration Notes

Each chord in Neume spans **4 beats** by default. This allows for:
- Clear timing on 4/4 time signatures
- Easy synchronization with most music
- Flexible positioning along the timeline
- Simple beat-based editing

To move chords by different amounts:
- **Arrow keys** = 0.25 beat increments
- **Shift + Arrow keys** = 1 beat increments
