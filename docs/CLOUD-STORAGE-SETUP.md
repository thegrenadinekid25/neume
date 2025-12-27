# Cloud Storage & User Accounts Setup

This document describes how to set up Supabase for cloud storage and user authentication in Neume.

## Overview

Neume supports cloud storage for chord progressions, allowing users to:
- Sign up / log in with email or Google OAuth
- Save progressions to the cloud
- Access progressions from any device
- Work offline with automatic migration when signing in

When Supabase is not configured, the app falls back to localStorage.

## Prerequisites

- A Supabase account (free tier available at https://supabase.com)
- Node.js 18+ installed

## Setup Steps

### 1. Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Note your project URL and anon key from Settings > API

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Set Up Database Schema

Run the following SQL in your Supabase SQL Editor (Dashboard > SQL Editor):

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users profile table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progressions table
CREATE TABLE public.progressions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  key TEXT NOT NULL DEFAULT 'C',
  mode TEXT NOT NULL DEFAULT 'major',
  tempo INTEGER NOT NULL DEFAULT 120,
  time_signature TEXT NOT NULL DEFAULT '4/4',
  chords JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_favorite BOOLEAN DEFAULT FALSE,
  analyzed_from JSONB,
  build_up_steps JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_progressions_user_id ON public.progressions(user_id);
CREATE INDEX idx_progressions_updated_at ON public.progressions(updated_at DESC);
CREATE INDEX idx_progressions_is_favorite ON public.progressions(is_favorite) WHERE is_favorite = TRUE;

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progressions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Progressions policies
CREATE POLICY "Users can view own progressions"
  ON public.progressions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progressions"
  ON public.progressions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progressions"
  ON public.progressions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progressions"
  ON public.progressions FOR DELETE
  USING (auth.uid() = user_id);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for progressions updated_at
CREATE TRIGGER update_progressions_updated_at
  BEFORE UPDATE ON public.progressions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

### 4. Configure Authentication Providers

In Supabase Dashboard > Authentication > Providers:

#### Email (enabled by default)
- Enable "Confirm email" for production
- Disable for development to skip email confirmation

#### Google OAuth (optional)
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Set authorized redirect URI: `https://[YOUR_PROJECT].supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase

### 5. Production Deployment

For production (e.g., Vercel):

1. Add environment variables in your hosting platform:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. Update Supabase Auth settings:
   - Add your production URL to "Site URL"
   - Add production URL to "Redirect URLs"

3. Update Google OAuth (if used):
   - Add production domain to authorized origins
   - Add production callback URL

## Architecture

### Files Created/Modified

```
src/
├── lib/
│   └── supabase.ts          # Supabase client initialization
├── types/
│   └── database.ts          # Database TypeScript types
├── store/
│   └── auth-store.ts        # Zustand auth state management
├── services/
│   └── progression-storage.ts  # Cloud + localStorage storage
└── components/
    └── Auth/
        ├── AuthModal.tsx     # Sign in/sign up modal
        ├── AuthModal.module.css
        ├── UserMenu.tsx      # User dropdown in header
        ├── UserMenu.module.css
        └── index.ts
```

### How It Works

1. **Initialization**: On app mount, `useAuthStore.initialize()` checks for existing session
2. **Sign In**: Users can sign in via email/password or Google OAuth
3. **Storage**: When authenticated, progressions save to Supabase; otherwise localStorage
4. **Migration**: On first sign-in, localStorage progressions migrate to cloud
5. **Sync**: All CRUD operations automatically use the appropriate storage

### Fallback Behavior

When Supabase is not configured (missing env vars):
- App works fully in localStorage-only mode
- Console warning is shown about missing configuration
- Sign-in button still appears but shows configuration warning
- All existing functionality continues to work

## Security

- Row Level Security (RLS) ensures users can only access their own data
- Anon key is safe to expose (only allows authenticated operations)
- Service role key should NEVER be in frontend code

## Troubleshooting

### "Cloud features not configured"
- Check `.env.local` exists with correct values
- Restart dev server after adding env vars

### Google OAuth not working
- Verify redirect URI matches exactly
- Check Google Console for any errors
- Ensure OAuth consent screen is configured

### Data not syncing
- Check browser console for Supabase errors
- Verify RLS policies are correctly set
- Ensure user is properly authenticated
