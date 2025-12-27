# Week 4 Success Criteria

## Core Functionality ⭐ CRITICAL

### 1. Upload & Analysis
- [ ] YouTube URLs parse correctly (all formats)
- [ ] Audio files upload successfully (<50MB)
- [ ] Analysis completes in <30 seconds (typical song)
- [ ] Progress indicator updates accurately
- [ ] Error messages are helpful and actionable

**Test:**
```
1. Paste https://youtube.com/watch?v=dQw4w9WgXcQ
2. Click Analyze
3. Progress bar animates
4. Chords appear within 30 seconds
```
**Pass:** Works smoothly, no errors

---

### 2. Chord Accuracy
- [ ] Key detection correct >80% of time
- [ ] Chord recognition >70% accurate
- [ ] Tempo within ±5 BPM
- [ ] Chords align with beats
- [ ] Extensions detected (7ths, 9ths, sus)

**Test:**
```
Analyze "O Magnum Mysterium" by Lauridsen
Expected key: D major (or relative)
Expected tempo: ~60-70 BPM
Verify: First chord is tonic (I)
```
**Pass:** >70% of chords match expected progression

---

### 3. Display Quality
- [ ] Chords render correctly on canvas
- [ ] Metadata banner shows title/composer/source
- [ ] "Analyzed" badge visible
- [ ] Can play analyzed progression
- [ ] Can edit analyzed chords
- [ ] Save to My Progressions works

**Test:**
```
After analysis:
1. Chords visible on canvas
2. Metadata banner: "[Title] by [Composer]"
3. Click Play → Hear progression
4. Drag a chord → Moves normally
5. Click Save → Saves successfully
```
**Pass:** All features work seamlessly

---

### 4. AI Explanations ⭐ CRITICAL
- [ ] "Why This?" appears in context menu
- [ ] Panel slides in smoothly (<300ms)
- [ ] Explanation loads in <2 sec (first time)
- [ ] Explanation is educational and insightful
- [ ] Evolution chain makes sense (simple → complex)
- [ ] Play buttons work (isolated, in context, chain)
- [ ] Caching works (instant on second request)

**Test:**
```
1. Right-click chord → "Why This?"
2. Click → Panel appears
3. Wait for explanation
4. Verify: Context, evolution, historical examples
5. Click [▶ Isolated] → Hear chord
6. Close and reopen → Instant (cached)
```
**Pass:** Smooth, fast, educational

---

## Performance Benchmarks

| Metric | Target | Must Pass |
|--------|--------|-----------|
| Analysis time | <30 sec | Yes |
| Chord accuracy | >70% | Yes |
| AI response (uncached) | <2 sec | Yes |
| AI response (cached) | <100ms | Yes |
| Memory usage | <200MB | Yes |
| No memory leaks | Stable 30 min | Yes |

---

## Quality Standards

### User Experience
- [ ] Workflow feels natural and intuitive
- [ ] Loading states clearly communicate progress
- [ ] Errors are helpful, not technical
- [ ] Can complete analysis without confusion
- [ ] Educational value is clear

### Technical Quality
- [ ] Zero TypeScript errors
- [ ] Zero console errors
- [ ] Clean code (commented, readable)
- [ ] CORS properly configured
- [ ] Environment variables used for secrets
- [ ] Temp files cleaned up (backend)

### AI Quality
- [ ] Explanations are accurate
- [ ] Language is clear and inspiring
- [ ] Examples are relevant
- [ ] Evolution chain is logical
- [ ] No hallucinations or errors

---

## Regression Testing
Verify Weeks 1-3 still work:
- [ ] Canvas renders
- [ ] Shapes display
- [ ] Drag-and-drop
- [ ] Audio playback
- [ ] Tempo control
- [ ] All existing features intact

---

## The "First Impression" Test

**Give to a fresh user:**
1. Show them Analyze button
2. Give them a YouTube URL (test video)
3. Watch them use the feature
4. Ask: "Did this teach you something?"

**Pass Criteria:**
- User successfully analyzes piece
- User understands "Why This?" explanations
- User feels they learned about harmony
- User is excited to try more pieces

---

## Sign-Off Checklist

Before Week 5:
- [ ] All ⭐ CRITICAL criteria pass
- [ ] Performance benchmarks met
- [ ] No major bugs
- [ ] Backend runs reliably
- [ ] AI integration stable
- [ ] Proud to demo feature

**If all checked: Proceed to Week 5! 🚀**

**If not: Keep iterating. Quality > Speed.**

---

**Week 4 transforms Neume from a tool into a teacher. This feature set must be exceptional.**
