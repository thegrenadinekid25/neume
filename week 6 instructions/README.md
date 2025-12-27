# Week 6: Cloud Storage + User Accounts

**Duration:** 12-16 hours  
**Focus:** User authentication, cloud database, block library, offline sync

## Overview

Week 6 transforms Neume from a local-only tool into a cloud-connected platform where users can save, organize, and access their harmonic blocks from anywhere. This enables the block library that's central to our architecture.

## Why Now?

**Architecture Rationale:**
- Weeks 1-5 built solid block creation/analysis tools
- Users now have valuable blocks worth saving
- Phase 2 (pieces) will need cloud storage anyway
- Better to validate cloud architecture in Phase 1

**What Changed:**
- Originally Week 6 was "Launch Prep"
- Moved to Week 7 due to architecture shift
- Cloud storage is now critical for blocks-first approach

## Features

### 1. User Authentication - 3-4 hours

**Goal:** Secure user accounts with email/password and OAuth

**Implementation:**
- Signup/login modals
- Email/password authentication
- Google OAuth integration
- GitHub OAuth integration  
- Password reset flow
- Email verification
- Session management

**Technology:**
- Frontend: React Auth hooks
- Backend: Supabase Auth or Firebase Auth
- OAuth: Google/GitHub providers

**Prompts:**
1. Auth UI components (modals, forms) - 1.5 hours
2. Email/password auth integration - 1 hour
3. OAuth integration (Google + GitHub) - 1 hour
4. Password reset flow - 0.5 hour

### 2. Cloud Database Setup - 3-4 hours

**Goal:** PostgreSQL database for user data and blocks

**Schema:**
```sql
-- Users table (managed by auth provider)
users (
  id uuid PRIMARY KEY,
  email text UNIQUE,
  created_at timestamp,
  updated_at timestamp
)

-- Blocks table
blocks (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  name text NOT NULL,
  description text,
  key text,
  mode text,
  tempo integer,
  time_signature text,
  chords jsonb, -- Array of Chord objects
  metadata jsonb, -- { analyzedFrom, tags, etc. }
  is_favorite boolean DEFAULT false,
  created_at timestamp,
  updated_at timestamp
)

-- User preferences
user_preferences (
  user_id uuid PRIMARY KEY REFERENCES users(id),
  default_key text,
  default_mode text,
  default_tempo integer,
  settings jsonb
)
```

**Technology:**
- Database: Supabase (PostgreSQL) or Firebase Firestore
- ORM: Prisma or direct SQL
- Migrations: Managed through platform

**Prompts:**
1. Database schema design & migration - 1 hour
2. Supabase/Firebase setup - 1 hour
3. Database client integration - 1 hour
4. Row-level security policies - 1 hour

### 3. Block Library UI - 3-4 hours

**Goal:** "My Blocks" interface for browsing, searching, organizing

**Features:**
- Grid/list view toggle
- Search by name/description
- Filter by key, mode, tags
- Sort by date, name, favorites
- Favorite/unfavorite
- Tag management
- Duplicate block
- Delete block (with confirmation)
- Load block to canvas

**UI Design:**
```
┌─────────────────────────────────┐
│  My Blocks          [+ New]     │
├─────────────────────────────────┤
│  [Search...] [Filters ▼]        │
├─────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐     │
│  │ Jazz│  │Modal│  │ Pop │     │
│  │ Turn│  │Inter│  │Prog │     │
│  │ ⭐  │  │     │  │  ⭐ │     │
│  └─────┘  └─────┘  └─────┘     │
│  C major  D minor  G major      │
│  4 chords 8 chords 4 chords     │
└─────────────────────────────────┘
```

**Prompts:**
1. Block library UI component - 1.5 hours
2. Search/filter/sort logic - 1 hour
3. Block card component - 0.5 hour
4. CRUD operations integration - 1 hour

### 4. Cloud Sync with Offline Mode - 3-4 hours

**Goal:** Seamless sync between local and cloud with offline support

**Architecture:**
```
localStorage (offline cache)
      ↕ sync
Cloud Database (source of truth)
```

**Sync Strategy:**
- Auto-save to cloud every 30 seconds (debounced)
- Optimistic updates (update UI immediately)
- Conflict resolution (last-write-wins for simplicity)
- Offline queue for pending operations
- Sync on reconnect

**Implementation:**
```typescript
class BlockSyncService {
  private syncInterval: NodeJS.Timer;
  private pendingOps: Operation[] = [];
  
  startAutoSync() {
    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.syncToCloud();
      }
    }, 30000); // 30 seconds
  }
  
  async saveBlock(block: Block) {
    // Optimistic update
    localStorage.setItem(`block-${block.id}`, JSON.stringify(block));
    
    // Queue cloud sync
    this.pendingOps.push({ type: 'save', block });
    
    // Attempt immediate sync if online
    if (navigator.onLine) {
      await this.syncToCloud();
    }
  }
  
  async syncToCloud() {
    for (const op of this.pendingOps) {
      try {
        await this.executeOp(op);
        // Remove from queue on success
        this.pendingOps = this.pendingOps.filter(o => o !== op);
      } catch (error) {
        console.error('Sync failed, will retry:', error);
      }
    }
  }
}
```

**Prompts:**
1. Sync service implementation - 1.5 hours
2. Offline detection & queue - 1 hour
3. Migration from localStorage - 0.5 hour
4. Conflict resolution logic - 1 hour

### 5. Performance Optimization - 1-2 hours

**Goal:** Fast, responsive cloud operations

**Optimizations:**
- Lazy load blocks (paginate library)
- Cache frequently accessed blocks
- Debounce auto-save
- Compress large chord arrays
- Index database properly
- Use CDN for static assets

**Prompts:**
1. Pagination & lazy loading - 1 hour
2. Caching strategy - 0.5 hour
3. Database indexing - 0.5 hour

## Migration Strategy

**From localStorage to Cloud:**

1. **First Login:**
   - Detect existing blocks in localStorage
   - Show migration prompt: "Upload [N] blocks to cloud?"
   - Bulk upload with progress indicator
   - Clear localStorage after successful upload

2. **Ongoing:**
   - New blocks save to cloud first
   - localStorage serves as offline cache only
   - Clear cache on logout (security)

**Code:**
```typescript
async function migrateLocalBlocks(userId: string) {
  const localBlocks = getBlocksFromLocalStorage();
  
  if (localBlocks.length === 0) return;
  
  const confirmed = await showMigrationPrompt(localBlocks.length);
  if (!confirmed) return;
  
  for (const block of localBlocks) {
    await createBlock({ ...block, user_id: userId });
  }
  
  clearLocalStorage();
  showSuccessMessage(`${localBlocks.length} blocks uploaded!`);
}
```

## Security Considerations

**Row-Level Security (RLS):**
```sql
-- Users can only see their own blocks
CREATE POLICY "Users see own blocks"
  ON blocks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own blocks
CREATE POLICY "Users insert own blocks"
  ON blocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own blocks
CREATE POLICY "Users update own blocks"
  ON blocks FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own blocks
CREATE POLICY "Users delete own blocks"
  ON blocks FOR DELETE
  USING (auth.uid() = user_id);
```

**API Security:**
- HTTPS only
- JWT tokens for authentication
- Rate limiting (100 requests/min per user)
- Input validation (block size limits)
- SQL injection prevention (parameterized queries)

## Dependencies

**Required:**
- Weeks 1-5: Core block editing functionality
- Cloud provider account (Supabase recommended)

**Enables:**
- Week 7: Launch prep (deployment)
- Phase 2: Pieces (which reference blocks)

## Success Criteria

- [ ] Users can sign up/login with email or OAuth
- [ ] Blocks save to cloud automatically
- [ ] "My Blocks" library shows all user blocks
- [ ] Search/filter/sort works perfectly
- [ ] Offline mode queues operations for sync
- [ ] Migration from localStorage seamless
- [ ] No data loss during sync
- [ ] Response times < 500ms for typical operations
- [ ] RLS prevents unauthorized access

## Testing Checklist

**Auth:**
- [ ] Signup with email/password
- [ ] Login with email/password
- [ ] OAuth with Google
- [ ] OAuth with GitHub
- [ ] Password reset flow
- [ ] Session persistence

**Cloud Sync:**
- [ ] Create block → saves to cloud
- [ ] Edit block → syncs changes
- [ ] Delete block → removes from cloud
- [ ] Offline mode → queues operations
- [ ] Reconnect → syncs pending ops
- [ ] Conflict resolution works

**Block Library:**
- [ ] Shows all user blocks
- [ ] Search finds blocks
- [ ] Filters work correctly
- [ ] Sort by date/name/favorites
- [ ] Load block to canvas
- [ ] Duplicate block
- [ ] Delete block with confirmation

**Security:**
- [ ] Can't see other users' blocks
- [ ] Can't modify other users' blocks
- [ ] Logout clears session
- [ ] RLS policies enforced

---

**Next:** Week 7 (Launch Prep)
