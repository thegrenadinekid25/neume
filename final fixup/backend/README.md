# Backend Deployment Package

**Get your AI features working in production!**

---

## 🎯 What This Package Does

Your frontend is 100% polished and working. But 3 critical features need a backend:

1. **Analyze** - YouTube chord extraction
2. **Build From Bones** - Progression deconstruction  
3. **Refine This** - Emotional prompting suggestions

This package gives you **everything** to deploy a production-ready backend API.

---

## 📦 Package Contents

### 1. **01-setup-backend-server.md** (Complete Code)
**What:** Full FastAPI backend with all 3 endpoints  
**Time:** 2-3 hours to build  
**Result:** Working local server

**Includes:**
- FastAPI app structure
- 3 API endpoints (/analyze, /deconstruct, /suggest)
- Essentia chord extraction
- Claude API integration
- CORS configuration
- Error handling

### 2. **02-deploy-backend.md** (Deployment Guide)
**What:** Deploy to Railway, Render, or DigitalOcean  
**Time:** 30-90 minutes  
**Result:** Live production backend

**Covers:**
- Railway deployment (recommended - easiest)
- Render deployment (free tier available)
- DigitalOcean deployment
- Environment variables
- CORS setup
- Health monitoring

### 3. **03-test-backend-integration.md** (Testing)
**What:** End-to-end testing procedures  
**Time:** 1.5-2 hours  
**Result:** Verified working integration

**Tests:**
- Analyze feature (YouTube)
- Build From Bones feature
- Refine This feature
- Error handling
- Performance
- Cross-feature integration

---

## 🚀 Quick Start

### Path A: Build & Deploy (Fastest - 3-4 hours)

```bash
# Step 1: Build backend (2-3 hours)
Follow: 01-setup-backend-server.md

# Step 2: Deploy to Railway (30 min)
Follow: 02-deploy-backend.md → Railway section

# Step 3: Test integration (1 hour)
Follow: 03-test-backend-integration.md

# Step 4: Update frontend
VITE_API_URL=https://your-backend.railway.app
```

### Path B: Use Claude Code (Recommended)

```bash
# Open Claude Code
claude-code

# Paste entire 01-setup-backend-server.md
# Claude builds the complete backend for you

# Then follow 02-deploy-backend.md to go live
```

---

## 📊 Time Breakdown

| Task | Time | Status |
|------|------|--------|
| Build backend | 2-3h | ⬜ |
| Deploy to Railway | 30m | ⬜ |
| Configure env vars | 10m | ⬜ |
| Update frontend | 10m | ⬜ |
| Test integration | 1-2h | ⬜ |
| **TOTAL** | **4-6h** | ⬜ |

---

## 🎯 What You'll Build

### Backend Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app
│   ├── config.py            # Environment settings
│   ├── models.py            # Pydantic models
│   ├── services/
│   │   ├── chord_extraction.py   # Essentia
│   │   ├── deconstruction.py     # Build From Bones
│   │   ├── suggestions.py        # Refine This
│   │   └── claude_client.py      # AI integration
│   └── routes/
│       ├── analyze.py        # POST /api/analyze
│       ├── deconstruct.py    # POST /api/deconstruct
│       └── suggest.py        # POST /api/suggest
├── requirements.txt
└── .env
```

### API Endpoints

**1. POST /api/analyze**
```json
Request: {"url": "https://youtube.com/..."}
Response: {
  "success": true,
  "result": {
    "key": "C",
    "mode": "major",
    "tempo": 120,
    "chords": [...]
  }
}
```

**2. POST /api/deconstruct**
```json
Request: {
  "progression": [...],
  "key": "C",
  "mode": "major"
}
Response: {
  "steps": [
    {"stepNumber": 0, "stepName": "Skeleton", ...},
    {"stepNumber": 1, "stepName": "Add 7ths", ...}
  ]
}
```

**3. POST /api/suggest**
```json
Request: {
  "prompt": "more ethereal",
  "selected_chords": [...],
  "key": "C",
  "mode": "major"
}
Response: {
  "suggestions": [
    {"technique": "add9", "rationale": "...", ...}
  ]
}
```

---

## ⚙️ Technology Used

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | FastAPI | REST API server |
| **Audio Analysis** | Essentia 2.1+ | Chord extraction |
| **YouTube Download** | yt-dlp | Audio from videos |
| **AI** | Claude Sonnet 4 | Explanations & suggestions |
| **Music Theory** | music21 | Chord logic |
| **Deployment** | Railway/Render | Hosting |

---

## 🔑 Requirements

### Before You Start

**Local Development:**
- Python 3.10+
- pip
- ffmpeg (for audio processing)

**For Deployment:**
- Railway account (free)
- OR Render account (free tier)
- Anthropic API key (Claude)

**Get Claude API Key:**
1. Go to https://console.anthropic.com
2. Create account / sign in
3. Go to "API Keys"
4. Create new key
5. Copy and save securely

---

## 💰 Cost Estimates

### Hosting

| Platform | Free Tier | Paid |
|----------|-----------|------|
| Railway | 500 hours/month | $5-10/month |
| Render | 750 hours/month (sleeps) | $7/month |
| DigitalOcean | None | $5/month |

**Recommendation:** Railway (best balance of free + easy)

### Claude API

| Usage | Cost |
|-------|------|
| Per request | ~$0.01-0.05 |
| 100 requests | ~$1-5 |
| 1000 requests | ~$10-50 |

**For beta (100 users, 10 requests each):** ~$10-50/month

---

## ✅ Success Criteria

Backend is production-ready when:

- [ ] Deployed to hosting platform
- [ ] Health check returns `200 OK`
- [ ] All 3 endpoints responding
- [ ] Frontend can connect (no CORS errors)
- [ ] Analyze works with YouTube URLs
- [ ] Build From Bones returns meaningful steps
- [ ] Refine This gives relevant suggestions
- [ ] Response times <60s for analyze
- [ ] No errors in logs
- [ ] You've tested end-to-end

---

## 🚨 Common Issues & Fixes

### Issue 1: CORS Errors
**Symptom:** "Access-Control-Allow-Origin" error in browser  
**Fix:** Add frontend URL to `CORS_ORIGINS` environment variable

```bash
railway variables set CORS_ORIGINS='["https://your-frontend.vercel.app"]'
```

### Issue 2: Claude API Errors
**Symptom:** "Failed to get suggestions" / "API key invalid"  
**Fix:** Verify API key set correctly

```bash
railway variables set ANTHROPIC_API_KEY=sk-ant-...
```

### Issue 3: YouTube Download Fails
**Symptom:** "Failed to download YouTube audio"  
**Fix:** Ensure yt-dlp and ffmpeg installed

In `nixpacks.toml`:
```toml
nixPkgs = ["python310", "ffmpeg"]
```

### Issue 4: Import Errors (Essentia)
**Symptom:** "ModuleNotFoundError: No module named 'essentia'"  
**Fix:** Install with system packages flag

```bash
pip install essentia==2.1b6.dev1110 --break-system-packages
```

---

## 📈 Deployment Checklist

### Pre-Deployment
- [ ] Backend code complete
- [ ] Tested locally (`uvicorn app.main:app --reload`)
- [ ] Health check works (`/health`)
- [ ] requirements.txt includes all dependencies
- [ ] .env.example created (no actual keys!)
- [ ] .gitignore includes .env

### Deployment
- [ ] Chose platform (Railway recommended)
- [ ] Created account
- [ ] Connected GitHub repo OR deployed directly
- [ ] Set environment variables (ANTHROPIC_API_KEY, etc.)
- [ ] Deployment successful
- [ ] Got public URL

### Post-Deployment
- [ ] Health check returns `200` from public URL
- [ ] Tested all 3 endpoints with cURL/Postman
- [ ] Updated frontend .env with backend URL
- [ ] Rebuilt and redeployed frontend
- [ ] Tested end-to-end from browser
- [ ] No CORS errors
- [ ] All features work

---

## 🎓 Learning Resources

**FastAPI:**
- https://fastapi.tiangolo.com/tutorial/

**Essentia:**
- https://essentia.upf.edu/documentation/

**Railway:**
- https://docs.railway.app/

**Claude API:**
- https://docs.anthropic.com/en/api

---

## 🔄 Development Workflow

### Local Development Loop

```bash
# Terminal 1: Run backend
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2: Run frontend
cd frontend
npm run dev

# Frontend .env
VITE_API_URL=http://localhost:8000

# Test in browser: http://localhost:5173
```

### Production Deployment Loop

```bash
# 1. Make changes to backend
# 2. Test locally
# 3. Git commit and push

git add .
git commit -m "Improved chord extraction accuracy"
git push

# 4. Railway auto-deploys
# 5. Test on production URL
# 6. Monitor logs for errors
```

---

## 📝 Next Steps

### Right Now (4-6 hours)

1. **Read 01-setup-backend-server.md** (15 min)
2. **Build backend** (2-3 hours)
3. **Read 02-deploy-backend.md** (10 min)
4. **Deploy to Railway** (30 min)
5. **Read 03-test-backend-integration.md** (10 min)
6. **Test all features** (1-2 hours)

### After Backend Works

1. **Final frontend polish** (if needed)
2. **Beta testing** (invite 10-20 users)
3. **Monitor usage and errors**
4. **Iterate based on feedback**
5. **Public launch!** 🚀

---

## 🎉 When You're Done

After successful backend deployment:

- ✅ Analyze works (YouTube chord extraction)
- ✅ Build From Bones works (progression steps)
- ✅ Refine This works (AI suggestions)
- ✅ All features end-to-end tested
- ✅ Production-ready backend deployed
- ✅ Frontend connected and working

**YOU'RE READY TO LAUNCH! 🚀**

---

## 💬 Final Thoughts

The backend is the last major piece. It's:
- Well-architected (FastAPI best practices)
- Production-ready (error handling, CORS, monitoring)
- Easy to deploy (Railway is ~30 minutes)
- Cost-effective (free tier sufficient for beta)

**You've got complete, executable prompts for everything.**

**Estimated total time: 4-6 hours from start to deployed backend.**

**Then you launch! 🎵✨🚀**

---

## 📁 Files in This Package

```
backend-deployment/
├── README.md (this file)
├── 01-setup-backend-server.md     [2-3h] 🔧
├── 02-deploy-backend.md           [30m] 🚀
└── 03-test-backend-integration.md [1-2h] ✅
```

---

**Start with: 01-setup-backend-server.md**

**You're 4-6 hours away from a fully working app! 💪**
