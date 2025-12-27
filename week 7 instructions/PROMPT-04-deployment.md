# PROMPT-04: Deployment

## Objective

Set up production deployment infrastructure including Vercel hosting, environment configuration, error monitoring with Sentry, CI/CD pipeline, and staging environment.

## Estimated Time: 2 hours

## Context

A solid deployment pipeline ensures consistent, reliable releases. We use Vercel for its excellent React/Vite support and Sentry for error tracking.

**Dependencies:**
- All features complete
- PROMPT-01: Testing Suite passes
- PROMPT-02: Optimization complete

## Requirements

### 1. Vercel Project Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Link project
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 2. Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "VITE_SENTRY_DSN": "@sentry_dsn"
  }
}
```

### 3. Environment Variables

```bash
# Vercel environment variables (set in dashboard or CLI)

# Production
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_SENTRY_DSN production
vercel env add VITE_ANTHROPIC_API_KEY production

# Preview (staging)
vercel env add VITE_SUPABASE_URL preview
vercel env add VITE_SUPABASE_ANON_KEY preview
vercel env add VITE_SENTRY_DSN preview

# Development
vercel env add VITE_SUPABASE_URL development
vercel env add VITE_SUPABASE_ANON_KEY development
```

### 4. Sentry Error Monitoring

```bash
npm install @sentry/react @sentry/vite-plugin
```

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/react';

export function initSentry() {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      
      // Performance monitoring
      tracesSampleRate: 0.1, // 10% of transactions
      
      // Session replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0, // 100% of errors
      
      // Filter out noise
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error exception captured',
        /^Network request failed/,
      ],
      
      beforeSend(event) {
        // Don't send errors in development
        if (import.meta.env.DEV) return null;
        return event;
      },
    });
  }
}
```

```typescript
// vite.config.ts
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: 'your-org',
      project: 'neume',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: './dist/**',
      },
    }),
  ],
  build: {
    sourcemap: true, // Required for Sentry
  },
});
```

### 5. Error Boundary

```typescript
// src/components/ErrorBoundary.tsx
import * as Sentry from '@sentry/react';

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="error-page">
          <h1>Something went wrong</h1>
          <p>We've been notified and are working on a fix.</p>
          <button onClick={resetError}>Try again</button>
        </div>
      )}
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo);
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
```

### 6. CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  deploy-preview:
    runs-on: ubuntu-latest
    needs: build
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 7. Staging Environment

```bash
# Create staging branch
git checkout -b staging

# Vercel auto-creates preview deployments for branches
# Configure staging-specific env vars in Vercel dashboard
```

```typescript
// src/lib/config.ts
export const config = {
  isProduction: import.meta.env.PROD,
  isStaging: import.meta.env.VITE_ENVIRONMENT === 'staging',
  isDevelopment: import.meta.env.DEV,
  
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  
  features: {
    // Feature flags for staging testing
    experimentalFeatures: import.meta.env.VITE_ENVIRONMENT === 'staging',
  },
};
```

### 8. Health Check Endpoint

```typescript
// For monitoring uptime
// Add to index.html or create a simple API route

// Option 1: Client-side health check
// src/pages/health.tsx
export function Health() {
  return (
    <div>
      <h1>OK</h1>
      <p>Version: {import.meta.env.VITE_VERSION || 'dev'}</p>
      <p>Build: {import.meta.env.VITE_BUILD_ID || 'local'}</p>
    </div>
  );
}
```

### 9. Performance Monitoring Dashboard

```typescript
// src/lib/analytics.ts
export function trackPageView(path: string) {
  if (import.meta.env.PROD) {
    // Vercel Analytics (built-in)
    // Or custom analytics
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ event: 'pageview', path }),
    });
  }
}

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (import.meta.env.PROD) {
    Sentry.addBreadcrumb({
      category: 'user-action',
      message: name,
      data: properties,
    });
  }
}
```

### 10. Build Optimization for Production

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor bundles
          vendor: ['react', 'react-dom'],
          audio: ['tone'],
          music: ['tonal'],
        },
      },
    },
  },
  define: {
    'import.meta.env.VITE_VERSION': JSON.stringify(process.env.npm_package_version),
    'import.meta.env.VITE_BUILD_ID': JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7)),
  },
});
```

### 11. Domain Configuration

```bash
# In Vercel dashboard or CLI
vercel domains add neume.app
vercel domains add www.neume.app

# Configure DNS at your registrar:
# A record: @ -> 76.76.21.21
# CNAME: www -> cname.vercel-dns.com
```

### 12. Rollback Procedure

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]

# Or promote a specific deployment
vercel promote [deployment-url]
```

## Deployment Checklist

```markdown
## Pre-Deployment
- [ ] All tests pass
- [ ] Build completes without errors
- [ ] Bundle size under 500KB
- [ ] Environment variables configured
- [ ] Sentry project created

## Deploy to Staging
- [ ] Push to staging branch
- [ ] Verify preview deployment
- [ ] Run smoke tests
- [ ] Check error monitoring
- [ ] Test critical user flows

## Deploy to Production
- [ ] Merge to main
- [ ] Verify production deployment
- [ ] Check health endpoint
- [ ] Monitor error rates
- [ ] Verify analytics working

## Post-Deployment
- [ ] Announce to team
- [ ] Monitor for 24 hours
- [ ] Check performance metrics
- [ ] Review Sentry for new errors
```

## Technical Constraints

- Vercel for hosting
- GitHub for CI/CD
- Sentry for error tracking
- HTTPS only
- CDN for static assets

## Quality Criteria

- [ ] CI/CD pipeline passes
- [ ] Staging environment functional
- [ ] Production deployment works
- [ ] Error monitoring configured
- [ ] Health check returns 200
- [ ] Rollback procedure documented

## Testing Considerations

1. Deploy to staging first
2. Run full UAT on staging
3. Monitor for 24h before prod
4. Test rollback procedure
5. Verify all env vars set
