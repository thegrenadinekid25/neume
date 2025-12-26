# Week 4 Execution Guide

## Day-by-Day Plan

### Day 1: Upload & Backend (5-7 hours)
**Morning (3-4 hours):**
- Execute Prompt 001: Analyze Modal
- Create upload UI, validation, progress indicator
- Test: Modal opens, accepts YouTube URLs and files

**Afternoon (2-3 hours):**
- Execute Prompt 002: Backend Setup
- Install Python, FastAPI, Essentia
- Create /api/analyze endpoint
- Test: Can extract chords from sample audio

**Checkpoint:** Upload works, backend responds

---

### Day 2: Display Results (1.5-2 hours)
**Morning:**
- Execute Prompt 003: Display Analyzed Progression
- Convert backend response to frontend chords
- Display on canvas with metadata
- Test: Analyzed progressions appear correctly

**Checkpoint:** Complete upload → display workflow

---

### Day 3: Educational Features (4-6 hours)
**Morning (2-3 hours):**
- Execute Prompt 004: Why This? Panel
- Create side panel UI
- Implement play controls
- Test: Panel slides in, buttons work

**Afternoon (2-3 hours):**
- Execute Prompt 005: AI Explanation System
- Set up Anthropic API
- Integrate with Why This? panel
- Test: Explanations generate and display

**Checkpoint:** Right-click → Why This? → AI explanation

---

### Day 4: Integration & Polish (2 hours)
**Full Day:**
- Execute Prompt 006: Integration Testing
- Run complete workflow tests
- Fix bugs
- Performance optimization
- Documentation

**Checkpoint:** Complete, polished AI feature set

---

## Quick Start Commands

### Backend
```bash
cd backend/
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
# Server on http://localhost:8000
```

### Frontend
```bash
# Add .env.local
echo "VITE_ANTHROPIC_API_KEY=sk-ant-..." > .env.local

npm install @anthropic-ai/sdk
npm run dev
```

## Critical Success Factors
1. Essentia installs correctly (hardest part)
2. YouTube downloader works (test early)
3. Claude API key configured
4. CORS set up properly
5. File upload size limits appropriate

**Total Time:** 15-19 hours over 4-5 days
