# Week 4 Status Report: AI-Powered Chord Explanation System

**Date:** December 27, 2024
**Status:** Complete
**Sprint Focus:** "Why This?" Panel with Claude API Integration

---

## Executive Summary

Week 4 deliverables are complete. The "Why This?" panel now provides AI-powered chord explanations using Claude 3.5 Sonnet, with full song context awareness and macro-level harmonic analysis. A backend proxy endpoint was added to handle Claude API calls, resolving browser CORS restrictions.

---

## Features Implemented

### 1. "Why This?" Panel (`src/components/Panels/WhyThisPanel.tsx`)

A slide-in side panel that explains chord choices with:

- **Contextual Analysis**: Harmonic function explanation (tonic, dominant, subdominant)
- **Technical Details**: Voice leading analysis, interval relationships
- **Historical Context**: Song-specific information when analyzing known tracks
- **Evolution Chain**: Step-by-step harmonic progression visualization
- **Playback Controls**: Listen to chord isolated, in context, or evolution chain

**UI Features:**
- Animated slide-in from right (Framer Motion)
- Semi-transparent overlay backdrop
- Loading spinner during API calls
- Error state with retry button
- Escape key to close

### 2. Harmonic Context Passing

The panel now receives full harmonic context:

| Context | Description |
|---------|-------------|
| `selectedChord` | The chord being analyzed |
| `previousChord` | Chord immediately before (sorted by beat position) |
| `nextChord` | Chord immediately after |
| `fullProgression` | All chords in the progression as Roman numerals |
| `songContext` | Title, composer, source URL from YouTube analysis |

**Files Modified:**
- `src/store/why-this-store.ts` - Added `fullProgression` and `songContext` fields
- `src/components/Canvas/DraggableChord.tsx` - Passes `allChords` and `songContext` to panel
- `src/components/Canvas/DroppableCanvas.tsx` - Accepts and forwards `songContext` prop
- `src/App.tsx` - Passes metadata to DroppableCanvas

### 3. Backend Claude API Proxy (`/api/explain`)

**Problem:** Browser CORS policy blocks direct calls to `api.anthropic.com`

**Solution:** Added backend proxy endpoint that:
1. Receives chord data from frontend
2. Builds comprehensive Claude prompt
3. Calls Claude API server-side
4. Returns structured explanation JSON

**Files Added/Modified:**

| File | Changes |
|------|---------|
| `backend/requirements.txt` | Added `anthropic==0.39.0` |
| `backend/.env` | Created with `CLAUDE_API_KEY` |
| `backend/models/schemas.py` | Added `ExplainRequest`, `ExplainResponse`, chord models |
| `backend/main.py` | Added `/api/explain` endpoint, prompt builder, Roman numeral converter |

**Endpoint Specification:**

```
POST /api/explain
Content-Type: application/json

Request Body:
{
  "chord": { id, scaleDegree, quality, key, mode, voices, isChromatic, chromaticType },
  "prevChord": { ... } | null,
  "nextChord": { ... } | null,
  "fullProgression": [ { ... }, ... ] | null,
  "songContext": { title, composer } | null
}

Response:
{
  "success": true,
  "contextual": "...",
  "technical": "...",
  "historical": "...",
  "evolutionSteps": [ { "name": "...", "description": "..." } ]
}
```

### 4. Frontend API Service Update

`src/services/explanation-service.ts` now:
- Calls `http://localhost:8000/api/explain` (backend proxy)
- Converts chord objects to API format
- Falls back to mock explanations if API fails
- Caches responses in localStorage (7-day TTL)

---

## Claude Prompt Engineering

The prompt sent to Claude includes:

1. **Song Information** (if from YouTube analysis)
   - Title: "Never Gonna Give You Up"
   - Artist/Composer: Rick Astley

2. **Musical Context**
   - Key: Ab major
   - Full Progression: I → vi → IV → V → I → vi → IV → V...
   - Chord Position: #5 of 16

3. **Chord Being Analyzed**
   - Roman Numeral: IV (Scale Degree 4, Quality: major)
   - Voicing: Soprano-Db5, Alto-Ab4, Tenor-F4, Bass-Db3

4. **Immediate Harmonic Context**
   - Previous: vi (Submediant)
   - Current: IV (Subdominant)
   - Next: V (Dominant)

5. **Analysis Request**
   - Contextual function explanation
   - Technical voice leading analysis
   - Historical/stylistic context
   - Macro pattern identification

---

## Bug Fixes

### Harmonic Context Bug

**Issue:** Previous/next chord context was empty in explanations

**Root Cause:** `DraggableChord` was reading from Zustand store (`useCanvasStore`) which was empty. App.tsx stores chords in local `useState`, not in the global store.

**Fix:** Added `allChords` prop to DraggableChord, passed from DroppableCanvas. Chords are now sorted by `startBeat` before finding neighbors.

### CORS Error

**Issue:** Browser blocked direct calls to Anthropic API
```
Access to fetch at 'https://api.anthropic.com/v1/messages' from origin
'http://localhost:3001' has been blocked by CORS policy
```

**Fix:** Added backend proxy endpoint. Frontend now calls `localhost:8000/api/explain` which proxies to Claude.

---

## Testing Verification

### Manual Testing Checklist

- [x] Right-click chord → "Why This?" opens panel
- [x] Panel shows loading spinner while fetching
- [x] Explanation displays with contextual, technical, historical sections
- [x] Previous/next chord context appears in explanation
- [x] Song title/artist appears when analyzing YouTube track
- [x] Full progression shown as Roman numerals
- [x] Escape key closes panel
- [x] Retry button works on error
- [x] Mock fallback works when API unavailable

### API Testing

```bash
# Test backend health
curl http://localhost:8000/
# Response: {"status":"ok","service":"Neume Chord Extraction API"}

# Test explain endpoint
curl -X POST http://localhost:8000/api/explain \
  -H "Content-Type: application/json" \
  -d '{"chord":{"id":"1","scaleDegree":4,"quality":"major","key":"C","mode":"major","voices":{"soprano":"F5","alto":"C5","tenor":"A4","bass":"F3"}}}'
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   App.tsx                                                        │
│     └── DroppableCanvas (songContext prop)                       │
│           └── DraggableChord (allChords, songContext props)      │
│                 └── Context Menu → "Why This?"                   │
│                       └── openWhyThisPanel(chord, prev, next,    │
│                                            progression, context) │
│                                                                  │
│   WhyThisPanel.tsx                                               │
│     └── useWhyThisStore() ← Zustand                              │
│           └── getChordExplanation()                              │
│                 └── explanation-service.ts                       │
│                       └── fetch('/api/explain')                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   POST /api/explain                                              │
│     └── build_explanation_prompt()                               │
│           └── to_roman_numeral()                                 │
│           └── summarize_progression()                            │
│     └── anthropic.Anthropic().messages.create()                  │
│     └── Parse JSON response                                      │
│     └── Return ExplainResponse                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Claude 3.5 Sonnet API                         │
│                  (api.anthropic.com)                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files Changed Summary

| File | Type | Lines Changed |
|------|------|---------------|
| `backend/main.py` | Modified | +200 |
| `backend/models/schemas.py` | Modified | +55 |
| `backend/requirements.txt` | Modified | +3 |
| `backend/.env` | Created | +1 |
| `src/services/explanation-service.ts` | Modified | +45, -35 |
| `src/store/why-this-store.ts` | Modified | +15 |
| `src/components/Canvas/DraggableChord.tsx` | Modified | +20 |
| `src/components/Canvas/DroppableCanvas.tsx` | Modified | +5 |
| `src/App.tsx` | Modified | +3 |

---

## Dependencies Added

### Backend
- `anthropic==0.39.0` - Official Anthropic Python SDK

### Frontend
- None (using existing fetch API)

---

## Environment Variables

| Variable | Location | Purpose |
|----------|----------|---------|
| `CLAUDE_API_KEY` | `backend/.env` | Anthropic API authentication |
| `VITE_API_URL` | `frontend/.env` | Backend URL (default: http://localhost:8000) |

---

## Known Limitations

1. **API Rate Limits**: Claude API has rate limits; caching helps mitigate
2. **Response Time**: Claude API calls take 2-5 seconds; loading state shown
3. **Cost**: Each explanation costs API tokens; caching reduces repeat calls
4. **Fallback**: If API fails, falls back to rule-based mock explanations

---

## Next Steps (Week 5)

1. Implement "Refine This" modal for chord alternatives
2. Add "Build From Bones" panel for skeleton-based composition
3. Integrate saved progressions system
4. Performance optimization for large progressions

---

## Demo Script

1. Open app at `http://localhost:3001`
2. Click "Analyze a Song" → paste YouTube URL (e.g., Rick Astley)
3. Wait for analysis to complete
4. Right-click any chord on canvas
5. Select "Why This?" from context menu
6. Observe AI explanation with:
   - Song-specific context ("Never Gonna Give You Up")
   - Full progression shown as Roman numerals
   - Harmonic function explanation
   - Voice leading analysis

---

**Report Prepared By:** Claude Code
**Backend Status:** Running on port 8000
**Frontend Status:** Running on port 3001
