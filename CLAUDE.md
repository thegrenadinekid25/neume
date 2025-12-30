# Neume - Project Context for Claude Code

## Overview
Neume is a chord progression composition tool for musicians. It features a timeline-based canvas for building harmonies, SATB voice leading, music theory analysis, and AI-powered feedback.

## Tech Stack

**Frontend:**
- React 18 + TypeScript + Vite
- Zustand for state management
- Framer Motion for animations
- Tone.js for audio playback
- Tonal.js for music theory
- CSS Modules with warm Kinfolk design system

**Backend:**
- Python FastAPI
- Claude API for AI features (explanations, critique, suggestions)

**Infrastructure:**
- Frontend: Vercel (auto-deploys from main)
- Backend: Railway (auto-deploys from main)
- Auth/Database: Supabase

## Local Development

```bash
# Frontend (runs on localhost:3000)
npm run dev

# Backend (runs on localhost:8000)
cd backend
source venv/bin/activate  # or: python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

## Environment Variables

**Frontend (.env.local):**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- `VITE_API_URL` - Backend URL (defaults to localhost:8000 in dev)

**Backend (backend/.env):**
- `CLAUDE_API_KEY` - Anthropic API key for AI features
- `CORS_ORIGINS` - Allowed frontend origins (comma-separated)

## Production URLs
- Frontend: https://neume-five.vercel.app
- Backend: https://neume-production.up.railway.app

## Deployment
Push to `main` branch auto-deploys both:
- Vercel watches the repo and rebuilds frontend
- Railway watches the repo and rebuilds backend

## Key Directories

```
src/
├── components/       # React components
│   ├── Canvas/       # Timeline and chord visualization
│   ├── Dashboard/    # User's saved progressions
│   ├── LandingPage/  # Public landing page
│   ├── Auth/         # Authentication modals
│   ├── Panels/       # Side panels (WhyThis, Critique, etc.)
│   └── Modals/       # Various modal dialogs
├── store/            # Zustand stores
├── services/         # API calls, storage, audio
├── styles/           # Global CSS, variables, typography
├── types/            # TypeScript types
└── utils/            # Helpers and utilities

backend/
├── main.py           # FastAPI app entry point
├── routes/           # API endpoints
└── requirements.txt  # Python dependencies
```

## Design System
- Font Display: Fraunces (serif)
- Font UI: Space Grotesk (sans-serif)
- Font Technical: DM Mono (monospace)
- Primary colors: warm-cream (#FAF8F5), warm-gold (#E8A03E), warm-terracotta (#E85D3D)
- See `src/styles/variables.css` for full palette

## Common Tasks

**Add a new component:**
1. Create in `src/components/[Category]/`
2. Use CSS Modules (`ComponentName.module.css`)
3. Follow existing patterns for design system variables

**Add a new API endpoint:**
1. Add route in `backend/routes/`
2. Register in `backend/main.py`
3. Add frontend service in `src/services/`

**Test production locally:**
```bash
npm run build
npm run preview
```

## Big Changes Workflow

For significant features or refactors, use this Claude Code workflow:

1. **Plan with Opus** - Enter plan mode and use an Opus subagent to:
   - Explore the codebase thoroughly
   - Design the implementation approach
   - Identify all files to create/modify/delete
   - Consider edge cases and testing strategy

2. **Review the plan** - Get user approval before implementing

3. **Execute with Haiku** - Use Haiku subagents for grunt work:
   - File parsing and exploration
   - Repetitive code changes
   - Running tests and builds
   - Cleanup tasks

This maximizes quality (Opus planning) while minimizing cost (Haiku execution).

## Notes
- Auth modal uses flexbox wrapper for centering (Framer Motion conflicts with transform)
- Landing page shown to unauthenticated users on dashboard view
- AI features require backend running with valid CLAUDE_API_KEY
