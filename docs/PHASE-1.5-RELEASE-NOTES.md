# Phase 1.5: AI Context & Annotations

**Release Date:** December 27, 2025
**Version:** 1.5.0

---

## Overview

Phase 1.5 introduces three interconnected features that enrich the AI-powered learning experience in Neume by providing better context to AI and enabling users to annotate their progressions.

### Key Features

1. **Build From Bones AI Context** - AI now receives song/composer metadata for richer, contextual explanations
2. **Per-Chord Annotations** - Users can add personal notes to individual chords on the timeline
3. **Progression Notes** - Users can save progressions with overall notes and view/edit them in the library
4. **Chord AI Insight Endpoint** - Backend support for future "Get AI Insight" feature

---

## Feature Details

### 1. Build From Bones AI Context

**What Changed:**
- The `/api/deconstruct` endpoint now accepts optional `songTitle` and `composer` parameters
- AI-generated step descriptions are now contextual to the analyzed song
- When analyzing a song by a known artist, explanations reference the composer's style and choices

**User Impact:**
- When using "Build From Bones" on an analyzed song, the AI provides more relevant, personalized educational content
- Example: Instead of generic "This adds tension," users see "In 'O Magnum Mysterium,' Lauridsen uses this suspended 4th to create the characteristic floating quality of his choral writing."

**Technical Details:**
- Updated `DeconstructRequest` schema in `/backend/models/schemas.py`
- Enhanced `generate_explanation()` in `/backend/services/deconstructor.py`
- Prompts dynamically adapt based on available song context

---

### 2. Per-Chord Annotations

**What Changed:**
- Double-click any chord on the timeline to open the annotation popover
- Add/edit personal notes for individual chords
- Visual indicator (pencil icon) appears on chords with annotations
- Annotations stored in canvas state and persist with saved progressions

**User Impact:**
- Students can mark specific moments in a progression with personal insights
- Notes like "This is where the emotional climax happens" or "Try substituting with a secondary dominant"
- Visual indicators make annotated chords easy to find

**How to Use:**
1. Double-click any chord on the timeline
2. Type your note in the annotation popover
3. Click "Save" or press Cmd+Enter
4. Look for the pencil icon to identify annotated chords

**Technical Details:**
- New `ChordAnnotationPopover` component at `/src/components/Canvas/ChordAnnotationPopover.tsx`
- Annotations state managed in `/src/store/canvas-store.ts`
- Visual indicator added to `/src/components/Canvas/ChordShape.tsx`
- Context menu integration in `/src/components/Canvas/DraggableChord.tsx`

---

### 3. Progression Notes

**What Changed:**
- Save Progression dialog now includes a "Notes" textarea
- My Progressions library displays saved notes inline
- Click notes in library to edit them in-place
- Composer information displayed for analyzed songs

**User Impact:**
- Add context like "Inspired by Pärt's Spiegel im Spiegel" or "Good for verse sections"
- Notes help organize and recall progressions later
- Composer attribution preserved from song analysis

**How to Use:**
1. Open the FAB menu and click "Save Progression"
2. Fill in Title, Tags, and the new Notes field
3. In My Progressions, click on a progression's notes to edit inline
4. Analyzed songs show "From: [Song Title] by [Composer]"

**Technical Details:**
- Updated `SavedProgression` type with `notes` and `annotations` fields
- Database migration added `notes TEXT` and `annotations JSONB` columns
- Updated `/src/services/progression-storage.ts` for cloud sync
- Enhanced `/src/components/Modals/SaveProgressionDialog.tsx`
- Enhanced `/src/components/Modals/MyProgressionsModal.tsx`

---

### 4. Chord AI Insight Endpoint (Backend Only)

**What Changed:**
- New `/api/chord-insight` endpoint ready for future UI integration
- Accepts selected chord indices, full progression context, and user annotations
- Returns AI-generated insight about harmonic function and suggestions

**User Impact:**
- Backend infrastructure ready for "Get AI Insight" context menu feature
- Future releases will expose this in the UI

**Technical Details:**
- New endpoint in `/backend/main.py` at lines 732-865
- Request schema: `ChordInsightRequest` with chords, selectedIndices, key, mode, annotations
- Response schema: `ChordInsightResponse` with insight, harmonicFunction, suggestions

---

## Database Changes

### Migration Required

```sql
-- Add notes and annotations columns to progressions table
ALTER TABLE progressions
ADD COLUMN notes TEXT,
ADD COLUMN annotations JSONB DEFAULT '[]';
```

**Note:** The migration has been applied via Supabase MCP. Existing progressions will have `notes` as NULL and `annotations` as empty array.

---

## Files Modified

### Frontend
| File | Change |
|------|--------|
| `/src/types/progression.ts` | Added `notes`, `annotations`, `ChordAnnotation` interface |
| `/src/types/chord.ts` | Added `annotation` field |
| `/src/store/canvas-store.ts` | Added annotation state management |
| `/src/services/progression-storage.ts` | Handle notes/annotations in save/load |
| `/src/components/Modals/SaveProgressionDialog.tsx` | Added notes textarea |
| `/src/components/Modals/SaveProgressionDialog.module.css` | Textarea and analyzed info styles |
| `/src/components/Modals/MyProgressionsModal.tsx` | Notes display/edit, composer info |
| `/src/components/Modals/MyProgressionsModal.module.css` | Notes and composer styles |
| `/src/components/Canvas/ChordAnnotationPopover.tsx` | **NEW** - Annotation popover |
| `/src/components/Canvas/ChordAnnotationPopover.module.css` | **NEW** - Popover styles |
| `/src/components/Canvas/DraggableChord.tsx` | Double-click handler, context menu |
| `/src/components/Canvas/ChordShape.tsx` | Annotation indicator (pencil icon) |

### Backend
| File | Change |
|------|--------|
| `/backend/models/schemas.py` | Added `ChordInsightRequest/Response`, updated `DeconstructRequest` |
| `/backend/main.py` | Added `/api/chord-insight` endpoint |
| `/backend/services/deconstructor.py` | Context-aware prompts with song/composer |

---

## Testing Summary

### Regression Tests Performed
- [x] Save progression with notes - Notes textarea visible and functional
- [x] My Progressions modal - Notes display correctly, inline editing works
- [x] Per-chord annotation popover - Double-click opens popover
- [x] Annotation save/cancel - Both buttons work correctly
- [x] Visual indicator - Pencil icon appears on annotated chords
- [x] Build passes - No TypeScript errors
- [x] Console errors - No Phase 1.5 related errors

### Known Issues
- None identified

---

## Future Work (Phase 2.0)

1. **UI for Chord AI Insight** - Add "Get AI Insight" to chord context menu
2. **Annotation sync** - Sync per-chord annotations to cloud storage
3. **Annotation search** - Search progressions by annotation content
4. **AI annotation suggestions** - AI suggests annotations for educational moments

---

## Deployment Notes

1. Ensure Supabase migration is applied before deploying frontend
2. Backend requires `ANTHROPIC_API_KEY` environment variable for AI features
3. No breaking changes - fully backward compatible with existing saved progressions
