# Deploy Backend to Production

## Objective
Deploy your FastAPI backend to a production hosting service so your frontend can access the AI features.

**Options covered:**
1. Railway (Recommended - easiest)
2. Render (Free tier available)
3. DigitalOcean App Platform

---

## Option 1: Railway (Recommended)

### Why Railway?
- Easiest deployment
- Automatic HTTPS
- Good free tier
- Git-based deploys
- Built-in environment variables

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
# or
brew install railway
```

### Step 2: Initialize Project

```bash
cd backend/
railway login
railway init
# Follow prompts, select "Create new project"
```

### Step 3: Configure railway.json

Create `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Step 4: Create nixpacks.toml

Railway uses Nixpacks for Python. Create `nixpacks.toml`:

```toml
[phases.setup]
nixPkgs = ["python310", "ffmpeg"]

[phases.install]
cmds = ["pip install -r requirements.txt --break-system-packages"]

[start]
cmd = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
```

### Step 5: Set Environment Variables

```bash
railway variables set ANTHROPIC_API_KEY=your_api_key_here
railway variables set ENVIRONMENT=production
railway variables set CORS_ORIGINS='["https://your-frontend.vercel.app"]'
```

Or use Railway dashboard:
1. Go to https://railway.app/dashboard
2. Select your project
3. Go to "Variables" tab
4. Add variables

### Step 6: Deploy

```bash
railway up
```

Railway will:
- Build your app
- Install dependencies
- Start the server
- Assign a public URL

### Step 7: Get Your URL

```bash
railway domain
# Returns: https://your-app.railway.app
```

Or in dashboard: Go to "Settings" → "Domains" → Copy URL

### Step 8: Test Deployment

```bash
curl https://your-app.railway.app/health
# Should return: {"status": "ok"}
```

### Step 9: Update Frontend

Update frontend `.env`:

```env
VITE_API_URL=https://your-app.railway.app
```

Rebuild and redeploy frontend.

---

## Option 2: Render

### Why Render?
- Free tier available
- Easy deployment
- Good documentation

### Step 1: Create render.yaml

Create `render.yaml` in backend root:

```yaml
services:
  - type: web
    name: harmonic-canvas-api
    env: python
    region: oregon
    buildCommand: pip install -r requirements.txt --break-system-packages
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: ANTHROPIC_API_KEY
        sync: false
      - key: ENVIRONMENT
        value: production
      - key: CORS_ORIGINS
        value: '["https://your-frontend.vercel.app"]'
```

### Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Backend ready for deployment"
git remote add origin https://github.com/yourusername/harmonic-canvas-backend
git push -u origin main
```

### Step 3: Deploy on Render

1. Go to https://render.com
2. Click "New +"
3. Select "Web Service"
4. Connect your GitHub repo
5. Render auto-detects `render.yaml`
6. Add environment variables in dashboard
7. Click "Create Web Service"

### Step 4: Get Your URL

Render provides: `https://harmonic-canvas-api.onrender.com`

### Step 5: Test & Update Frontend

```bash
curl https://harmonic-canvas-api.onrender.com/health
```

Update frontend `.env` with Render URL.

---

## Option 3: DigitalOcean App Platform

### Step 1: Create app.yaml

```yaml
name: harmonic-canvas-api
region: nyc
services:
  - name: api
    github:
      repo: yourusername/harmonic-canvas-backend
      branch: main
      deploy_on_push: true
    run_command: uvicorn app.main:app --host 0.0.0.0 --port 8080
    environment_slug: python
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: ANTHROPIC_API_KEY
        scope: RUN_TIME
        value: your_api_key
      - key: ENVIRONMENT
        scope: RUN_TIME
        value: production
    http_port: 8080
```

### Step 2: Deploy with doctl

```bash
doctl apps create --spec app.yaml
```

Or use DigitalOcean web dashboard.

---

## Environment Variables Summary

**Required for all deployments:**

| Variable | Value | Description |
|----------|-------|-------------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Claude API key |
| `ENVIRONMENT` | `production` | Environment flag |
| `CORS_ORIGINS` | `["https://..."]` | Allowed origins (frontend URL) |

**Optional:**

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8000` | Server port (set by platform) |
| `TEMP_AUDIO_DIR` | `/tmp/harmonic-canvas` | Temp file storage |

---

## CORS Configuration

**CRITICAL:** Update CORS origins to match your frontend URL.

If frontend is on Vercel: `https://harmonic-canvas.vercel.app`

Update in deployment:
```python
# app/main.py
allow_origins=[
    "https://harmonic-canvas.vercel.app",  # Production
    "http://localhost:3000",               # Local dev
    "http://localhost:5173"                # Vite dev
]
```

Or use environment variable:
```bash
CORS_ORIGINS='["https://harmonic-canvas.vercel.app","http://localhost:3000"]'
```

---

## Health Check Endpoint

All platforms should monitor: `GET /health`

Returns:
```json
{
  "status": "ok",
  "service": "harmonic-canvas-api"
}
```

Configure health check in platform dashboard:
- Path: `/health`
- Expected status: `200`
- Timeout: `5s`

---

## Post-Deployment Checklist

After deployment:

- [ ] Health check returns `200 OK`
- [ ] Test `/api/analyze` with YouTube URL
- [ ] Test `/api/deconstruct` with sample progression
- [ ] Test `/api/suggest` with emotional prompt
- [ ] Frontend can reach backend (no CORS errors)
- [ ] Claude API key is set correctly
- [ ] Logs show no errors
- [ ] HTTPS is enabled

---

## Troubleshooting

### Issue: CORS errors in frontend

**Solution:** Add frontend URL to `CORS_ORIGINS` environment variable

```bash
railway variables set CORS_ORIGINS='["https://your-frontend.vercel.app"]'
```

### Issue: Import errors (Essentia not found)

**Solution:** Add system dependencies

Railway (`nixpacks.toml`):
```toml
[phases.setup]
nixPkgs = ["python310", "ffmpeg", "libsndfile"]
```

Render (`render.yaml`):
```yaml
buildCommand: |
  apt-get update
  apt-get install -y ffmpeg libsndfile1
  pip install -r requirements.txt
```

### Issue: YouTube download fails

**Solution:** Ensure yt-dlp and ffmpeg installed

Check logs, should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
```

### Issue: Claude API errors

**Solution:** Verify API key

```bash
# Test locally
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'
```

---

## Monitoring

### Railway

View logs:
```bash
railway logs
```

Or in dashboard: "Deployments" → "View Logs"

### Render

Dashboard → "Logs" tab (real-time)

### Set Up Alerts

Configure email/Slack alerts for:
- Service down
- Error rate >5%
- Response time >2s

---

## Scaling

### Railway
- Free tier: 500 hours/month
- Upgrade: $5/month for more resources

### Render
- Free tier: 750 hours/month (sleeps after 15min inactive)
- Paid: $7/month for always-on

### Load Testing

Before launch, test with:
```bash
# Install Apache Bench
apt-get install apache2-utils

# Test analyze endpoint
ab -n 100 -c 10 https://your-api.railway.app/health
```

Aim for:
- <200ms average response time
- <2s p95 response time
- 0% error rate

---

## Cost Estimates

### Railway
- Free tier: Sufficient for 1000-5000 requests/month
- Paid: ~$5-10/month for 10,000+ requests

### Render
- Free tier: Adequate for development/beta
- Paid: $7/month for production

### DigitalOcean
- Basic: $5/month
- Includes 1GB RAM, 1 vCPU

---

## Security

### API Key Protection
- Never commit `.env` files
- Use platform's secret management
- Rotate keys every 90 days

### HTTPS Only
All platforms provide free HTTPS - ensure enabled.

### Rate Limiting (Future)

Add to `app/main.py`:
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/analyze")
@limiter.limit("10/minute")
async def analyze_audio(request: Request, ...):
    ...
```

---

## Success Criteria

Backend is production-ready when:

- [ ] Deployed to hosting platform
- [ ] Public URL accessible
- [ ] Health check passes
- [ ] All 3 endpoints work
- [ ] Frontend can connect
- [ ] CORS configured correctly
- [ ] Claude API key set
- [ ] Logs show no errors
- [ ] Response time <2s
- [ ] You've tested end-to-end

---

## Estimated Time

- Railway deployment: 30-60 minutes
- Render deployment: 45-90 minutes
- DigitalOcean: 60-120 minutes

**Recommended: Start with Railway** (fastest, easiest)

---

**Next:** `03-test-backend-integration.md` for end-to-end testing procedures.
