# Week 4 Prompt 006: Integration & Testing

## Objective
Comprehensive testing of the complete AI analysis workflow from upload to explanation display.

## Complete Workflow Test

### End-to-End Test (The "First Experience")
1. Click "Analyze" in header
2. Modal appears
3. Paste YouTube URL: https://youtube.com/watch?v=[test_video]
4. Click "Analyze"
5. Progress bar updates (uploading → processing → analyzing → complete)
6. Modal closes
7. Chords appear on canvas with "Analyzed" badges
8. Metadata banner shows: "O Magnum Mysterium by Morten Lauridsen - Analyzed from YouTube"
9. Click Play → Hear analyzed progression
10. Right-click first chord → "Why This?" appears
11. Click "Why This?" → Panel slides in from right
12. Explanation appears within 2 seconds
13. Click [▶ Isolated] → Hear chord alone
14. Click [▶ Evolution Chain] → Hear progression of variations
15. Click [Replace with D major] → Chord updates on canvas
16. Close panel
17. Click "Save to My Progressions" → Saves successfully

**Expected Time:** 60-90 seconds for complete workflow

## Test Scenarios

### Scenario 1: YouTube Upload (Happy Path)
- Valid YouTube URL
- Publicly available video
- Clear audio quality
- Expected: Chords extracted in <30 sec

### Scenario 2: Audio File Upload
- Upload .mp3 file (<50MB)
- Expected: Processing succeeds, chords displayed

### Scenario 3: Error Handling
- Invalid YouTube URL → Clear error message
- Private/deleted video → Helpful error
- File too large → Size limit error
- Network failure → Retry option

### Scenario 4: AI Explanations
- Request explanation → Loads within 2 sec (first time)
- Request same chord again → Instant (cached)
- Network error → Shows cached or fallback

### Scenario 5: Complex Progressions
- Upload piece with 50+ chords
- Expected: Canvas handles smoothly
- Expected: Can play, edit, save

## Performance Benchmarks

| Metric | Target | Actual |
|--------|--------|--------|
| Analysis time | <30 sec | ___ sec |
| Chord accuracy | >70% | ___% |
| AI response | <2 sec (uncached) | ___ sec |
| AI response | <100ms (cached) | ___ ms |
| Memory usage | <200MB | ___ MB |
| No memory leaks | Stable over 10 min | Pass/Fail |

## Integration Checklist

### Frontend-Backend Communication
- [ ] POST /api/analyze works
- [ ] POST /api/upload works
- [ ] CORS configured correctly
- [ ] Error responses handled
- [ ] Progress updates received

### Frontend-AI Integration
- [ ] Claude API key configured
- [ ] Explanations generate successfully
- [ ] Caching works (localStorage)
- [ ] Rate limiting implemented
- [ ] Error handling graceful

### Canvas Integration
- [ ] Analyzed chords display correctly
- [ ] Metadata banner appears
- [ ] Play button works with analyzed progressions
- [ ] Can edit analyzed chords
- [ ] Save/load functionality works

### UI/UX Polish
- [ ] All animations smooth
- [ ] Loading states clear
- [ ] Error messages helpful
- [ ] Keyboard shortcuts work
- [ ] Mobile responsive

## Bug Testing

Test for common issues:
- Memory leaks (leave running 30 min)
- Race conditions (rapid clicks)
- Edge cases (empty progressions, single chord)
- Cross-browser (Chrome, Firefox, Safari)
- Large files (45MB audio)
- Long videos (10+ min)
- Atonal music (should handle gracefully)

**Estimated Time:** 2 hours
