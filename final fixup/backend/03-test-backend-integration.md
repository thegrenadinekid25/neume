# Test Backend Integration End-to-End

## Objective
Verify that your deployed backend works correctly with your frontend in all AI features.

---

## Pre-Test Checklist

Before testing:

- [ ] Backend deployed and running
- [ ] Health check endpoint returns `200 OK`
- [ ] Frontend updated with backend URL
- [ ] Frontend rebuilt and deployed
- [ ] No CORS errors in browser console

---

## Test 1: Analyze Feature (YouTube)

### Step-by-Step

1. **Open Harmonic Canvas in browser**
2. **Click "Analyze" button** (top header)
3. **Enter YouTube URL**
   - Example: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
4. **Click "Analyze" button**
5. **Observe loading state** ✅ Should see spinner: "Analyzing..."
6. **Wait for response** (10-30 seconds)
7. **Verify results**:
   - Chords appear on canvas
   - Key detected (e.g., "A major")
   - Tempo detected
   - No console errors

### Expected Backend Logs

```
POST /api/analyze - 202 Accepted
Downloading audio from YouTube...
Extracting chords with Essentia...
Response sent: {"success": true, ...}
```

### Success Criteria

- [ ] Loading spinner visible during processing
- [ ] Chords load on canvas after analysis
- [ ] Key and tempo detected correctly
- [ ] No errors in browser console
- [ ] Backend logs show successful processing

### If It Fails

**Error: "Failed to analyze"**
- Check backend logs for Python errors
- Verify yt-dlp and ffmpeg installed
- Test YouTube URL manually
- Try different video

**Error: "CORS policy blocked"**
- Add frontend URL to `CORS_ORIGINS`
- Redeploy backend
- Clear browser cache

**Error: "Network error"**
- Verify backend URL in `.env`
- Check backend is running (health check)
- Check firewall/network settings

---

## Test 2: Build From Bones Feature

### Prerequisites

Load a progression on canvas (use analyzed or manual)

### Step-by-Step

1. **With progression on canvas**
2. **Click "Build From Bones 🦴" button**
3. **Observe loading state** ✅ Should see spinner
4. **Wait for response** (5-10 seconds)
5. **Panel slides up from bottom**
6. **Verify steps shown**:
   - Step indicator (e.g., "Step 1 of 4")
   - Step name (e.g., "Skeleton", "Add 7ths")
   - Description (educational explanation)
   - Chords update on canvas
7. **Test navigation**:
   - Click [Next ▶] → Advances to next step
   - Click [◀ Previous] → Goes back
   - Click dots in progress bar → Jumps to step
8. **Test playback**:
   - Click [▶ Play This Step] → Plays current step
   - Click [▶ Play All Steps] → Plays evolution sequence

### Expected Backend Response

```json
{
  "steps": [
    {
      "stepNumber": 0,
      "stepName": "Skeleton",
      "description": "Basic triads - the harmonic foundation.",
      "chords": [...]
    },
    {
      "stepNumber": 1,
      "stepName": "Add 7ths",
      "description": "Adding 7th chords creates warmth...",
      "chords": [...]
    }
  ]
}
```

### Success Criteria

- [ ] Panel loads with 3-5 meaningful steps
- [ ] Each step has name and description
- [ ] Canvas updates to show current step chords
- [ ] Navigation works (prev/next/dots)
- [ ] Playback works for each step
- [ ] Evolution makes musical sense
- [ ] No console errors

### If It Fails

**Error: "Deconstruction failed"**
- Check Claude API key set in backend
- Verify Claude API quota
- Check backend logs for AI errors
- Test with simpler progression

**Error: Only 2 steps returned**
- This is fallback behavior (skeleton + final)
- Claude may not be generating full response
- Check Claude API logs
- Verify prompt in backend code

---

## Test 3: Refine This Feature

### Prerequisites

Select one or more chords on canvas

### Step-by-Step

1. **Click a chord to select it**
2. **Click "✨ Refine This..." button** (appears when chord selected)
3. **Modal opens**
4. **Enter emotional prompt**:
   - Example: "more ethereal and floating"
   - Or click example prompt
5. **Click "Get Suggestions"**
6. **Observe loading state** ✅ Should see spinner
7. **Wait for response** (3-5 seconds)
8. **Verify suggestions**:
   - 2-3 suggestions appear
   - Each has technique, rationale, examples
   - [▶ Preview] button visible
   - [Apply] button visible
9. **Test preview**:
   - Click [▶ Preview] → Hears suggestion
   - Chord plays isolated
10. **Test apply**:
    - Click [Apply] → Chord updates on canvas
    - Modified chord replaces original

### Expected Backend Response

```json
{
  "suggestions": [
    {
      "technique": "add9",
      "rationale": "Adding a 9th creates shimmer...",
      "from_chord": {"root": "C", "quality": "major"},
      "to_chord": {"root": "C", "quality": "major", "extensions": {"add9": true}},
      "relevance_score": 85,
      "examples": ["Lauridsen", "Whitacre"]
    }
  ]
}
```

### Success Criteria

- [ ] Modal opens when chord selected
- [ ] Loading spinner visible during AI processing
- [ ] 2-3 relevant suggestions returned
- [ ] Rationales are educational and clear
- [ ] Preview button plays modified chord
- [ ] Apply button updates canvas
- [ ] Suggestions match emotional intent
- [ ] No console errors

### If It Fails

**Error: "Failed to get suggestions"**
- Check Claude API key
- Verify API quota
- Test with different prompt
- Check backend logs

**Suggestions not relevant**
- AI may need better prompting
- Refine emotional mapping in backend
- Try more specific prompts ("add 9ths" vs "ethereal")

---

## Test 4: Error Handling

### Test Network Errors

1. **Stop backend server**
2. **Try to analyze YouTube URL**
3. **Verify error message**:
   - Should show: "Failed to analyze. Backend may not be running."
   - NOT: Raw error stack trace

4. **Restart backend**
5. **Try again** → Should work

### Test Invalid Inputs

1. **Invalid YouTube URL**
   - Enter: "not a url"
   - Should reject: "Invalid URL"

2. **Empty canvas**
   - Click "Build From Bones" with no chords
   - Should show: "No chords on canvas to deconstruct"

3. **No selection**
   - Click "Refine This" with no chord selected
   - Button should not appear

### Success Criteria

- [ ] Error messages are user-friendly
- [ ] No raw error stack traces shown
- [ ] Can recover from errors (retry works)
- [ ] Loading states clear on error

---

## Test 5: Performance

### Load Testing

1. **Create large progression** (50+ chords)
2. **Click "Build From Bones"**
3. **Measure time** → Should complete in <10 seconds

4. **Analyze long video** (5+ minutes)
5. **Measure time** → Should complete in <60 seconds

### Response Time Goals

| Endpoint | Target | Acceptable |
|----------|--------|------------|
| `/api/analyze` | <20s | <60s |
| `/api/deconstruct` | <5s | <15s |
| `/api/suggest` | <3s | <10s |

### If Too Slow

- Check backend CPU/memory
- Upgrade hosting plan
- Add caching
- Optimize Essentia processing

---

## Test 6: Cross-Feature Integration

### Complete User Journey

1. **Analyze YouTube video** ✅
2. **Chords load on canvas** ✅
3. **Click "Build From Bones"** ✅
4. **Navigate through steps** ✅
5. **Select a chord** ✅
6. **Click "Refine This"** ✅
7. **Apply suggestion** ✅
8. **Save progression** ✅
9. **Load progression** ✅
10. **Everything still works** ✅

### Success Criteria

All features work together seamlessly:
- Analyzed progressions can be deconstructed
- Deconstructed steps can be refined
- Refined chords can be saved
- Loaded progressions maintain all properties

---

## Backend API Testing (Direct)

### Use Postman or cURL

#### Test /api/analyze

```bash
curl -X POST https://your-backend.railway.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
    "key_hint": null,
    "mode_hint": null
  }'
```

Expected:
```json
{
  "success": true,
  "result": {
    "key": "A",
    "mode": "major",
    "tempo": 113,
    "chords": [...]
  }
}
```

#### Test /api/deconstruct

```bash
curl -X POST https://your-backend.railway.app/api/deconstruct \
  -H "Content-Type: application/json" \
  -d '{
    "progression": [
      {"root": "C", "quality": "major", "extensions": {}},
      {"root": "F", "quality": "major", "extensions": {}},
      {"root": "G", "quality": "major", "extensions": {}}
    ],
    "key": "C",
    "mode": "major"
  }'
```

Expected:
```json
{
  "steps": [...]
}
```

#### Test /api/suggest

```bash
curl -X POST https://your-backend.railway.app/api/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "more ethereal",
    "selected_chords": [
      {"root": "C", "quality": "major", "extensions": {}}
    ],
    "key": "C",
    "mode": "major"
  }'
```

Expected:
```json
{
  "suggestions": [...]
}
```

---

## Monitoring Dashboard

### Set Up Basic Monitoring

**Railway:** Built-in metrics
- CPU usage
- Memory usage
- Request count
- Error rate

**Render:** Dashboard → Metrics

**Custom:** Add logging

```python
# app/main.py
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/api/analyze")
async def analyze_audio(request: AnalyzeRequest):
    logger.info(f"Analyze request: url={request.url}")
    # ...
    logger.info(f"Analysis complete: key={result['key']}")
```

---

## Success Checklist

Before considering backend complete:

- [ ] All 3 endpoints work from frontend
- [ ] Loading states show during processing
- [ ] Error handling graceful
- [ ] Performance acceptable (<60s for analyze)
- [ ] CORS configured correctly
- [ ] Claude API key working
- [ ] Can analyze YouTube videos
- [ ] Build From Bones returns meaningful steps
- [ ] Refine This returns relevant suggestions
- [ ] No console errors
- [ ] Backend logs show no errors
- [ ] Can complete full user journey
- [ ] Works in production (not just localhost)

---

## Troubleshooting Guide

| Problem | Solution |
|---------|----------|
| CORS errors | Add frontend URL to `CORS_ORIGINS` env var |
| 404 Not Found | Check frontend `API_BASE_URL` is correct |
| Slow response | Upgrade hosting, optimize processing |
| Claude API errors | Verify API key, check quota |
| YouTube download fails | Ensure yt-dlp and ffmpeg installed |
| Memory errors | Upgrade hosting plan RAM |
| Timeout | Increase request timeout in frontend |

---

## Final Verification

Run this complete test:

```
1. Open fresh browser (incognito)
2. Load Harmonic Canvas
3. Analyze a YouTube video → Works ✅
4. Build From Bones → Works ✅
5. Refine This → Works ✅
6. Save progression → Works ✅
7. Reload page → Works ✅
8. Load saved → Works ✅
9. All features functional ✅
10. No errors ✅
```

**If ALL pass → Backend is PRODUCTION READY! 🚀**

---

## Estimated Testing Time

- Initial tests: 30 minutes
- Error scenarios: 15 minutes  
- Performance tests: 15 minutes
- Integration tests: 30 minutes
- **Total: 1.5-2 hours**

---

**After successful testing, you're ready to LAUNCH! 🎉**
