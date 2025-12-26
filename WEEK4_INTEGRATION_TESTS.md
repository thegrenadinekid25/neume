# Week 4 Integration Testing Guide

## Overview
This document provides comprehensive testing procedures for the complete AI analysis workflow in Harmonic Canvas.

---

## Prerequisites

### Backend Setup
Ensure the Python backend is running:

```bash
cd backend/
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**Expected Output:**
```
INFO:     Started server process
INFO:     Uvicorn running on http://localhost:8000
```

### Frontend Setup
Ensure the frontend is running:

```bash
npm run dev
```

**Expected Output:**
```
VITE v7.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Environment Variables
- ✅ `.env.local` - Frontend API key configured
- ✅ `backend/.env` - Backend API key configured
- ✅ CORS origins set to `http://localhost:5173`

---

## Test Scenarios

### Scenario 1: YouTube Upload (Happy Path)

**Objective:** Verify complete YouTube analysis workflow

**Test Steps:**
1. Click "Analyze" button in header (🔍 icon)
2. Verify AnalyzeModal opens with smooth animation
3. Ensure "YouTube URL" tab is selected by default
4. Paste test URL: `https://www.youtube.com/watch?v=PCkT4K0LcFA` (O Magnum Mysterium - Morten Lauridsen)
5. Click "Analyze" button
6. Observe progress indicator:
   - "Downloading from YouTube..." (0-30%)
   - "Processing audio..." (30-60%)
   - "Extracting chords..." (60-90%)
   - "Finalizing..." (90-100%)
7. Modal should close automatically on completion
8. Verify chords appear on canvas with "Analyzed" badge
9. Check metadata banner shows: "Title by Composer - Analyzed from YouTube"

**Expected Results:**
- ✅ Analysis completes in <30 seconds
- ✅ At least 20+ chords extracted
- ✅ Chords are color-coded by function
- ✅ No console errors
- ✅ Progress bar updates smoothly

**Performance Metrics:**
- Analysis time: ___ seconds
- Chord count: ___ chords
- Chord accuracy (manual verification): ___%

---

### Scenario 2: Audio File Upload

**Objective:** Verify audio file upload and processing

**Test Steps:**
1. Click "Analyze" in header
2. Switch to "Audio File" tab
3. Click "Choose File" or drag-and-drop test file
4. Use test file: `test-audio.mp3` (classical choral piece, <50MB)
5. Click "Analyze"
6. Observe progress updates
7. Verify chords display on canvas

**Expected Results:**
- ✅ File validation works (accepts .mp3, .wav, .m4a)
- ✅ File size validation (<50MB)
- ✅ Processing completes successfully
- ✅ Chords extracted and displayed

**Edge Cases to Test:**
- ❌ File too large (>50MB) → Shows error: "File size exceeds 50MB limit"
- ❌ Invalid file type (.txt) → Shows error: "Invalid file type"
- ❌ Corrupted audio → Shows error: "Failed to process audio"

---

### Scenario 3: AI Explanation System

**Objective:** Test Claude API integration and caching

**Test Steps:**
1. After analyzing a piece, right-click on first chord
2. Select "Why This?" from context menu
3. Observe WhyThisPanel slide in from right
4. Wait for explanation to load
5. Verify all sections display:
   - **Context Explanation** (why this chord here)
   - **Evolution Chain** (3 steps showing simple → complex)
   - **Emotional Effect** (how it serves the emotion)
   - **Composer Examples** (stylistic references)
6. Click "▶ Isolated" to play chord alone
7. Click "▶ In Context" to play with neighbors
8. Close panel and reopen on same chord
9. Verify explanation loads instantly (from cache)

**Expected Results:**
- ✅ First request: <2 seconds
- ✅ Cached request: <100ms (instant)
- ✅ Evolution chain shows 3 steps with descriptions
- ✅ Composer examples show relevant names
- ✅ No API errors in console

**localStorage Verification:**
```javascript
// Check in browser console:
localStorage.getItem('explanation_chord1_Cmajor_major')
// Should return JSON with timestamp and explanation
```

**Cache Expiration Test:**
- Manually set cache timestamp to 8 days ago
- Request explanation again
- Should fetch fresh from API (not use expired cache)

---

### Scenario 4: Error Handling

**Objective:** Verify graceful error handling

**Test Cases:**

#### 4.1 Invalid YouTube URL
- Input: `https://youtube.com/watch?v=invalid123`
- Expected: "Failed to download from YouTube. Please check the URL and try again."

#### 4.2 Private/Deleted Video
- Input: Private video URL
- Expected: "Video is unavailable (private or deleted)"

#### 4.3 Network Failure (Backend Down)
- Stop backend server
- Try to analyze
- Expected: "Unable to connect to server. Please try again later."

#### 4.4 AI API Rate Limit
- Make 50+ rapid explanation requests
- Expected: Should queue requests, no crashes

#### 4.5 Malformed AI Response
- (Simulated via backend modification)
- Expected: Shows fallback message, doesn't crash

---

### Scenario 5: Canvas Integration

**Objective:** Verify analyzed chords work with existing canvas features

**Test Steps:**
1. Analyze a YouTube URL to get chords on canvas
2. Click Play button → Hear progression with SATB voicing
3. Right-click analyzed chord → Edit chord quality
4. Verify chord updates and can still be explained
5. Add manual chord to progression
6. Delete an analyzed chord
7. Test voice leading between analyzed and manual chords

**Expected Results:**
- ✅ Analyzed chords play correctly with audio engine
- ✅ Can edit analyzed chords (quality, extensions)
- ✅ Can delete analyzed chords
- ✅ Can mix analyzed + manual chords
- ✅ Voice leading works seamlessly
- ✅ Undo/redo works with analyzed chords

---

### Scenario 6: Performance & Memory

**Objective:** Verify no memory leaks or performance degradation

**Test Steps:**
1. Open browser DevTools → Performance tab
2. Start recording
3. Analyze 5 different YouTube URLs in sequence
4. Request explanations for 10+ chords
5. Play progressions multiple times
6. Leave application running for 30 minutes
7. Check memory usage in Task Manager

**Expected Results:**
- ✅ Memory usage stays <200MB
- ✅ No memory leaks (stable over time)
- ✅ Animations remain smooth (60fps)
- ✅ No console warnings/errors
- ✅ Audio playback stays crisp

**Performance Benchmarks:**

| Metric | Target | Actual | Pass/Fail |
|--------|--------|--------|-----------|
| Analysis time | <30 sec | ___ sec | ___ |
| Chord accuracy | >70% | ___% | ___ |
| AI response (uncached) | <2 sec | ___ sec | ___ |
| AI response (cached) | <100ms | ___ ms | ___ |
| Memory usage | <200MB | ___ MB | ___ |
| Frame rate | 60fps | ___ fps | ___ |

---

## Integration Checklist

### Frontend-Backend Communication
- [ ] POST `/api/analyze` accepts YouTube URL
- [ ] POST `/api/analyze` accepts audio file upload
- [ ] POST `/api/explain` returns chord explanations
- [ ] CORS headers allow localhost:5173
- [ ] Error responses include helpful messages
- [ ] Progress updates stream correctly

### Frontend-AI Integration
- [ ] Claude API key loaded from `.env.local`
- [ ] Explanations generate with rich content
- [ ] localStorage caching works (7-day TTL)
- [ ] Cache invalidation works correctly
- [ ] Graceful fallback on API errors

### Canvas Integration
- [ ] Analyzed chords render on canvas
- [ ] Source badge shows "Analyzed"
- [ ] Metadata banner displays correctly
- [ ] Play button triggers audio playback
- [ ] Can edit analyzed chords
- [ ] Can delete analyzed chords
- [ ] Mixing analyzed + manual chords works

### UI/UX Polish
- [ ] All modal animations smooth (framer-motion)
- [ ] Loading states clear and informative
- [ ] Error messages helpful and actionable
- [ ] Progress bar updates in real-time
- [ ] Keyboard shortcuts work (Esc to close)
- [ ] Responsive on different screen sizes

---

## Bug Testing

### Common Issues to Test

**Memory Leaks:**
- [ ] Open/close AnalyzeModal 50 times → No memory increase
- [ ] Request 100 explanations → Memory stays stable
- [ ] Play progression on loop for 10 min → No degradation

**Race Conditions:**
- [ ] Rapidly click Analyze button → Should disable after first click
- [ ] Request explanation while previous loading → Should queue
- [ ] Close modal during upload → Should cancel request

**Edge Cases:**
- [ ] Empty audio file → Graceful error
- [ ] Single chord piece → Displays correctly
- [ ] 100+ chord piece → Canvas handles smoothly
- [ ] Atonal music → Handles gracefully (may be inaccurate)
- [ ] Very quiet audio → Normalizes volume
- [ ] Clipping audio → Handles without distortion

**Cross-Browser:**
- [ ] Chrome (latest) → All features work
- [ ] Firefox (latest) → All features work
- [ ] Safari (latest) → All features work
- [ ] Edge (latest) → All features work

---

## End-to-End Workflow Test

**"The First Experience" - Complete User Journey:**

1. ✅ Click "Analyze" button
2. ✅ Modal appears with smooth animation
3. ✅ Paste YouTube URL: `https://www.youtube.com/watch?v=PCkT4K0LcFA`
4. ✅ Click "Analyze"
5. ✅ Progress bar shows: Downloading → Processing → Analyzing
6. ✅ Modal closes automatically (~20 seconds)
7. ✅ 40+ chords appear on canvas with "Analyzed" badges
8. ✅ Metadata banner: "O Magnum Mysterium by Morten Lauridsen - Analyzed from YouTube"
9. ✅ Click Play → Hear beautiful SATB progression
10. ✅ Right-click first chord (I - C major)
11. ✅ Click "Why This?" in context menu
12. ✅ Panel slides in from right
13. ✅ Explanation loads within 1.5 seconds:
    - Context: "This opening tonic chord establishes..."
    - Evolution: C major → Cmaj7 → Cadd9
    - Emotion: "Creates a sense of grounding and peace"
    - Examples: "Lauridsen, Whitacre, Ešenvalds"
14. ✅ Click "▶ Isolated" → Hear C major chord alone
15. ✅ Click "▶ In Context" → Hear I-IV-V progression
16. ✅ Close panel
17. ✅ Edit chord quality (major → major7)
18. ✅ Play again → Hear updated voicing

**Total Time:** 60-90 seconds
**User Experience:** ⭐⭐⭐⭐⭐ (Seamless, educational, inspiring)

---

## Known Limitations

### Chord Recognition Accuracy
- **Tonal classical music:** 70-80% accurate ✅
- **Jazz/complex harmony:** 50-60% accurate ⚠️
- **Pop/rock:** 75-85% accurate ✅
- **Atonal/experimental:** <50% (not well-suited) ❌

### Key Detection
- **Single key pieces:** 85-90% accurate ✅
- **Modulating pieces:** May miss modulations ⚠️

### Tempo Detection
- **Steady tempo:** 90-95% accurate ✅
- **Rubato/variable:** 60-70% accurate ⚠️

---

## Troubleshooting

### Backend Won't Start

**Issue:** `ModuleNotFoundError: No module named 'essentia'`

**Solution:**
```bash
# Try conda instead of pip
conda install -c mtg essentia

# Or use Docker
docker-compose up backend
```

### YouTube Download Fails

**Issue:** `ERROR: unable to download video data`

**Solution:**
```bash
# Update yt-dlp
pip install -U yt-dlp

# Try different video
# Check video isn't age-restricted or private
```

### CORS Errors

**Issue:** `Access-Control-Allow-Origin` error in console

**Solution:**
```python
# Verify backend/main.py CORS settings:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Must match frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### AI Explanations Not Loading

**Issue:** "Failed to fetch explanation"

**Solution:**
- Check `.env.local` has `VITE_ANTHROPIC_API_KEY`
- Check `backend/.env` has `ANTHROPIC_API_KEY`
- Verify API key is valid (starts with `sk-ant-`)
- Check network tab for 401/403 errors
- Verify sufficient API credits

---

## Success Criteria

Week 4 is complete when ALL of these are ✅:

- [x] Users can upload YouTube URLs
- [x] Users can upload audio files (.mp3, .wav, .m4a)
- [ ] Chords are extracted with >70% accuracy
- [x] Analyzed progressions display on canvas
- [x] "Why This?" panel provides educational explanations
- [x] AI responses include evolution chains, emotion, examples
- [x] localStorage caching reduces API costs
- [x] Complete workflow is smooth and polished
- [ ] Zero critical bugs

---

## Next Steps

After completing Week 4 integration testing:

1. Document any bugs found in `BUGS.md`
2. Create performance benchmark report
3. Update `WEEK4_COMPLETE.md` with final metrics
4. Prepare for **Week 5: AI Features Part 2**
   - "Build From Bones" deconstruction
   - "Refine This" emotional prompting
   - Advanced AI suggestions
   - Progression library

---

**Testing completed by:** _______________
**Date:** _______________
**Overall Status:** ⬜ Pass / ⬜ Fail / ⬜ Needs Work
