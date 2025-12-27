# Week 4.5 Day 1 Implementation Plan: Extended Chord Types

## Executive Summary

This plan implements 17 new extended chord types (7th chords, suspensions, extensions, alterations) accessible via an enhanced right-click context menu with submenus, visual badges on chord shapes, and proper audio playback through the existing Tone.js system.

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/utils/chord-helpers.ts` | NEW | Badge labels, intervals, display names |
| `src/components/UI/ContextMenu.tsx` | MODIFY | Add submenu support |
| `src/components/UI/ContextMenu.module.css` | MODIFY | Add submenu styles |
| `src/components/Canvas/ChordContextMenu.tsx` | MODIFY | Add More Chords section |
| `src/components/Canvas/ChordShape.tsx` | MODIFY | Update badge logic |
| `src/components/Canvas/ChordShape.module.css` | MODIFY | Update badge styles |
| `src/audio/VoiceLeading.ts` | MODIFY | Support 7ths and extensions |

## Implementation Steps

### Step 1: Create chord-helpers.ts
Create `/src/utils/chord-helpers.ts` with:
- BADGE_LABELS constant mapping chord types to display labels
- CHORD_TYPE_NAMES for human-readable names
- CHORD_TYPE_CATEGORIES for menu organization
- isSeventhChord(), getChordBadgeText(), hasChordModifications()
- getChordIntervals() for building chord notes
- getChordDisplayName() for tooltips

### Step 2: Update ContextMenu with submenu support
Modify `/src/components/UI/ContextMenu.tsx`:
- Add `submenu?: ContextMenuItem[]` to interface
- Track openSubmenuId state
- Position submenus to right (or left if near edge)
- Handle hover to open/close submenus

### Step 3: Update ChordContextMenu
Modify `/src/components/Canvas/ChordContextMenu.tsx`:
- Add "More Chords" section after basic chords
- Four submenus: 7th Chords, Suspensions, Extensions, Alterations
- Each submenu item calls onAddChord with quality/extensions

### Step 4: Update ChordShape badge
Modify `/src/components/Canvas/ChordShape.tsx`:
- Import helpers
- Update getBadgeText to use getChordBadgeText()
- Add Framer Motion animation to badge
- Style badge border with chord color at 40% opacity

### Step 5: Update VoiceLeading
Modify `/src/audio/VoiceLeading.ts`:
- Handle 7th chord qualities in chord symbol building
- Support extensions by adding intervals
- Generate proper 4-voice SATB for 7th chords

## Success Criteria

- [ ] All 17 extended chord types in menu
- [ ] Submenus work correctly
- [ ] Badges display with correct labels
- [ ] Badge animation works
- [ ] 7th chords play correctly
- [ ] Extensions add correct notes
- [ ] 60fps performance maintained
