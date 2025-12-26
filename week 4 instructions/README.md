# Week 4: AI Features Part 1

**Transform Harmonic Canvas into an intelligent learning tool by adding AI-powered analysis and educational features**

---

## Overview

Week 4 adds the first set of AI features that make Harmonic Canvas unique: the ability to learn from real music by analyzing pieces you love and understanding WHY specific chords were chosen.

**What You'll Build:**
- Upload music (YouTube + audio files)
- Extract chord progressions automatically
- Display analyzed pieces on canvas
- "Why This?" educational explanations
- AI-powered harmonic analysis

---

## Package Contents

### Prompts (6 total)

1. **001-analyze-modal.md** - Upload interface (2-3 hours)
2. **002-backend-chord-extraction.md** - Server-side API with Essentia (3-4 hours)
3. **003-display-analyzed-progression.md** - Render on canvas (1.5-2 hours)
4. **004-why-this-panel.md** - Educational side panel (2-3 hours)
5. **005-ai-explanation-system.md** - Claude API integration (2-3 hours)
6. **006-integration-testing.md** - Complete workflow testing (2 hours)

### Supporting Documentation

- **README.md** - This file
- **EXECUTION-GUIDE.md** - Day-by-day implementation plan
- **DEPENDENCY-GRAPH.md** - Task relationships and critical path
- **SUCCESS-CRITERIA.md** - Measurable completion standards

---

## Timeline

**Total Time:** 15-19 hours over 4-5 days

**Recommended Schedule:**
- Day 1: Prompts 001-002 (5-7 hours) - Upload UI + Backend
- Day 2: Prompt 003 (1.5-2 hours) - Display on canvas
- Day 3: Prompts 004-005 (4-6 hours) - Why This? + AI
- Day 4: Prompt 006 (2 hours) - Integration testing
- Day 5: Buffer for debugging/polish

---

## Key Features

### 1. Analyze Modal
- YouTube URL input with auto-parsing
- Audio file upload (.mp3, .wav, .m4a)
- Advanced options (start/end time, key hint)
- Beautiful progress indicator
- Error handling and validation

### 2. Backend Chord Extraction
- Python FastAPI server
- Essentia chord recognition library
- YouTube audio extraction with yt-dlp
- Key and tempo detection
- Roman numeral conversion

### 3. Analyzed Progression Display
- Chords appear on canvas automatically
- Metadata banner (title, composer, source)
- Special "analyzed" badge on chords
- Color-coded by function
- Connection lines showing voice leading

### 4. Why This? Panel
- Right-click any chord → "Why This?"
- Context explanation (why HERE in progression)
- Evolution chain (simple → complex)
- Play isolated / in context
- Historical examples

### 5. AI Explanation System
- Claude API integration
- Chord-level explanations
- Progression analysis
- Voice leading insights
- Composer style identification

---

## Technology Stack

### Frontend (React/TypeScript)
- React Hook Form (form validation)
- Framer Motion (animations)
- Zustand (state management)
- Fetch API (backend communication)

### Backend (Python)
- FastAPI (web framework)
- Essentia 2.1+ (chord recognition)
- yt-dlp (YouTube downloader)
- librosa (audio processing)
- uvicorn (ASGI server)

### AI
- Anthropic Claude API
- GPT-4 (optional alternative)

---

## Prerequisites

### Completed Weeks
- âœ… Week 1: Visual foundation
- âœ… Week 2: Core interactions
- âœ… Week 3: Audio playback

### System Requirements
- Node.js 18+ (for frontend)
- Python 3.9+ (for backend)
- FFmpeg (for audio processing)
- 8GB RAM minimum (Essentia is memory-intensive)

### API Keys
- Anthropic API key (for AI explanations)
- Optional: YouTube Data API key (for metadata)

---

## Installation

### Backend Setup

```bash
# Navigate to backend directory
cd backend/

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install system dependencies
# macOS:
brew install ffmpeg essentia

# Linux:
sudo apt-get install ffmpeg libessentia-dev

# Windows:
# Download FFmpeg from https://ffmpeg.org/download.html
# Install Essentia from source or conda
```

### Environment Variables

```bash
# Create .env file in backend/
ANTHROPIC_API_KEY=your_key_here
CORS_ORIGINS=http://localhost:5173
TEMP_DIR=./temp
MAX_FILE_SIZE_MB=50
```

### Running Backend

```bash
# From backend/
python main.py

# Server runs on http://localhost:8000
# API docs: http://localhost:8000/docs
```

### Frontend Integration

```typescript
// Update src/config.ts
export const API_BASE_URL = 
  process.env.NODE_ENV === 'production'
    ? 'https://your-backend.com'
    : 'http://localhost:8000';
```

---

## Key Concepts

### Chord Recognition Pipeline

```
Audio Input
    ↓
Download/Upload
    ↓
Convert to 44.1kHz Mono WAV
    ↓
Extract Features (HPCP)
    ↓
Detect Key & Tempo
    ↓
Identify Chords (Essentia)
    ↓
Quantize to Beats
    ↓
Convert to Roman Numerals
    ↓
Enrich with Extensions
    ↓
Return to Frontend
```

### AI Explanation Pipeline

```
User Right-Clicks Chord
    ↓
"Why This?" Selected
    ↓
Gather Context:
  - Current chord
  - Previous/next chords
  - Key/mode
  - Source piece
    ↓
Send to Claude API
    ↓
Claude Analyzes:
  - Harmonic function
  - Voice leading
  - Historical context
  - Composer style
    ↓
Return Explanation
    ↓
Display in Panel
```

---

## Expected Accuracy

### Chord Recognition
- **Tonal classical music:** 70-80% accurate
- **Jazz/complex harmony:** 50-60% accurate
- **Pop/rock:** 75-85% accurate
- **Atonal/experimental:** <50% (not well-suited)

### Key Detection
- **Single key pieces:** 85-90% accurate
- **Modulating pieces:** 60-70% (may miss modulations)

### Tempo Detection
- **Steady tempo:** 90-95% accurate (±3 BPM)
- **Rubato/variable:** 60-70% accurate

**Note:** Phase 1 focuses on tonal classical choral music where accuracy is highest.

---

## File Structure

```
project/
├── frontend/  (Vite React app from Weeks 1-3)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Modals/
│   │   │   │   └── AnalyzeModal.tsx (NEW - Prompt 001)
│   │   │   └── Panels/
│   │   │       └── WhyThisPanel.tsx (NEW - Prompt 004)
│   │   ├── store/
│   │   │   └── analysis-store.ts (NEW - Prompt 001)
│   │   ├── services/
│   │   │   └── ai-service.ts (NEW - Prompt 005)
│   │   └── types/
│   │       └── analysis.ts (NEW - Prompt 001)
│   
├── backend/  (NEW - Created in Week 4)
│   ├── main.py (FastAPI app - Prompt 002)
│   ├── services/
│   │   ├── youtube_downloader.py
│   │   ├── chord_extractor.py
│   │   └── audio_processor.py
│   ├── models/
│   │   └── schemas.py
│   ├── utils/
│   │   └── roman_numeral.py
│   ├── requirements.txt
│   └── .env (not in git)
```

---

## Common Issues & Solutions

### Essentia Installation Issues

**Problem:** Essentia won't install via pip
**Solution:** 
```bash
# Try conda instead
conda install -c mtg essentia

# Or build from source (advanced)
```

### YouTube Download Fails

**Problem:** yt-dlp can't download video
**Solution:**
- Update yt-dlp: `pip install -U yt-dlp`
- Check video isn't age-restricted
- Try different video quality settings

### CORS Errors

**Problem:** Frontend can't connect to backend
**Solution:**
```python
# In main.py, verify CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### AI API Rate Limits

**Problem:** Too many Claude API requests
**Solution:**
- Cache explanations in localStorage
- Implement request debouncing
- Add rate limiting on backend

---

## Testing Strategy

### Unit Tests (Backend)
```bash
# Test chord extraction
pytest tests/test_chord_extractor.py

# Test YouTube downloader
pytest tests/test_youtube_downloader.py
```

### Integration Tests
1. Upload YouTube URL → Verify chords extracted
2. Upload audio file → Verify processing works
3. Right-click chord → Verify explanation appears
4. Test full workflow end-to-end

### Test Pieces (Curated)

Good test cases:
- "O Magnum Mysterium" - Morten Lauridsen
- "Ave Maria" - Franz Biebl
- "Lux Aurumque" - Eric Whitacre

Why these work well:
- Tonal harmony (not atonal)
- Clear chord progressions
- SATB voicing
- Available on YouTube

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Analysis time | <30 sec | For 3-5 min piece |
| Upload size | <50MB | Audio file limit |
| API response | <500ms | Cached explanations |
| Accuracy | >70% | Chord detection |
| Memory usage | <500MB | Backend processing |

---

## Security Considerations

### Backend
- Validate all file uploads (type, size)
- Sanitize YouTube URLs
- Rate limit API endpoints
- Clean up temp files
- Use environment variables for secrets

### Frontend
- Never expose API keys client-side
- Validate user inputs
- Handle errors gracefully
- Implement CSRF protection (if auth added later)

---

## Next Steps After Week 4

**Week 5: AI Features Part 2**
- "Build From Bones" deconstruction
- "Refine This" emotional prompting
- Advanced AI suggestions
- Progression library

**Week 6: Polish & Launch**
- MIDI export
- Save/load progressions
- Welcome tutorial
- Final testing

---

## Success Metrics

Week 4 is complete when:

- [ ] Users can upload YouTube URLs
- [ ] Users can upload audio files
- [ ] Chords are extracted accurately (>70%)
- [ ] Analyzed progressions display on canvas
- [ ] "Why This?" provides helpful explanations
- [ ] AI responses are insightful and educational
- [ ] Complete workflow is smooth and polished
- [ ] Zero critical bugs

---

## Support & Resources

### Documentation
- Essentia docs: https://essentia.upf.edu/documentation/
- FastAPI docs: https://fastapi.tiangolo.com/
- Anthropic docs: https://docs.anthropic.com/

### Example Code
- Essentia tutorials: https://essentia.upf.edu/tutorials/
- FastAPI examples: https://github.com/tiangolo/fastapi

### Community
- Essentia forum: https://groups.google.com/g/essentia-users
- Music IR community: https://ismir.net/

---

**Ready to make Harmonic Canvas intelligent! Let's teach users about harmony by learning from the masters.** 🎵🤖✨
