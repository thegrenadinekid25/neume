# PROMPT-05: Beta Onboarding

## Objective

Create systems for beta user management including invite codes, feedback collection, onboarding emails, and analytics tracking to gather insights and improve the product.

## Estimated Time: 1 hour

## Context

Beta launch is about learning. We need to gather feedback, understand usage patterns, and identify issues before public launch. A smooth onboarding experience converts invited users into engaged testers.

**Dependencies:**
- PROMPT-04: Deployment (production environment ready)
- Auth system (Week 6)

## Requirements

### 1. Invite Code System

```typescript
// src/lib/db/invites.ts
interface InviteCode {
  code: string;
  email?: string; // Optional: specific email
  usedBy?: string; // User ID who used it
  usedAt?: string;
  expiresAt?: string;
  maxUses: number;
  useCount: number;
  createdAt: string;
}

// Supabase table
/*
CREATE TABLE public.invite_codes (
  code TEXT PRIMARY KEY,
  email TEXT,
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER DEFAULT 1,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Only admins can manage invites
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can validate invite codes"
  ON public.invite_codes FOR SELECT
  USING (true);
*/

export async function validateInviteCode(code: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  const { data, error } = await supabase
    .from('invite_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (error || !data) {
    return { valid: false, error: 'Invalid invite code' };
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, error: 'Invite code expired' };
  }

  if (data.use_count >= data.max_uses) {
    return { valid: false, error: 'Invite code already used' };
  }

  return { valid: true };
}

export async function useInviteCode(code: string, userId: string): Promise<void> {
  await supabase
    .from('invite_codes')
    .update({
      used_by: userId,
      used_at: new Date().toISOString(),
      use_count: supabase.rpc('increment'),
    })
    .eq('code', code.toUpperCase());
}

export function generateInviteCode(): string {
  // Format: XXXX-XXXX (easy to type)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing chars
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

### 2. Signup with Invite Code

```typescript
// src/components/auth/SignupWithInvite.tsx
export function SignupWithInvite() {
  const [inviteCode, setInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'invite' | 'signup'>('invite');
  const [error, setError] = useState('');

  const handleValidateInvite = async () => {
    const result = await validateInviteCode(inviteCode);
    if (result.valid) {
      setStep('signup');
    } else {
      setError(result.error || 'Invalid code');
    }
  };

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { invite_code: inviteCode },
      },
    });

    if (error) {
      setError(error.message);
      return;
    }

    if (data.user) {
      await useInviteCode(inviteCode, data.user.id);
      // Redirect to onboarding
    }
  };

  if (step === 'invite') {
    return (
      <div className="invite-form">
        <h2>Enter your invite code</h2>
        <p>Neume is in private beta. Enter your invite code to continue.</p>
        
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          placeholder="XXXX-XXXX"
          maxLength={9}
          className="invite-input"
        />
        
        {error && <p className="error">{error}</p>}
        
        <button onClick={handleValidateInvite} disabled={inviteCode.length !== 9}>
          Continue
        </button>
        
        <p className="request-invite">
          Don't have a code? <a href="/request-invite">Request an invite</a>
        </p>
      </div>
    );
  }

  return (
    <div className="signup-form">
      {/* Regular signup form */}
    </div>
  );
}
```

### 3. Request Invite Page

```typescript
// src/pages/RequestInvite.tsx
export function RequestInvite() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await supabase.from('invite_requests').insert({
      email,
      reason,
      status: 'pending',
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="request-success">
        <h2>Thanks for your interest!</h2>
        <p>We'll review your request and send an invite code if approved.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="request-form">
      <h2>Request an Invite</h2>
      <p>Tell us a bit about yourself and why you're interested in Neume.</p>

      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label>
        Why are you interested in Neume? (Optional)
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="I'm a choral composer looking to..."
        />
      </label>

      <button type="submit">Submit Request</button>
    </form>
  );
}
```

### 4. In-App Feedback Widget

```typescript
// src/components/FeedbackWidget.tsx
interface FeedbackData {
  type: 'bug' | 'feature' | 'general';
  message: string;
  email?: string;
  screenshot?: string;
  metadata: {
    url: string;
    userAgent: string;
    timestamp: string;
  };
}

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackData['type']>('general');
  const [message, setMessage] = useState('');
  const [includeScreenshot, setIncludeScreenshot] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    const feedback: FeedbackData = {
      type,
      message,
      email: user?.email,
      metadata: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
    };

    if (includeScreenshot) {
      // Capture screenshot using html2canvas
      const canvas = await html2canvas(document.body);
      feedback.screenshot = canvas.toDataURL('image/png');
    }

    await supabase.from('feedback').insert(feedback);
    
    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
      setMessage('');
    }, 2000);
  };

  return (
    <>
      {/* Floating button */}
      <button 
        className="feedback-button"
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
      >
        <MessageIcon />
      </button>

      {/* Feedback modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        {submitted ? (
          <div className="feedback-success">
            <CheckIcon />
            <p>Thanks for your feedback!</p>
          </div>
        ) : (
          <div className="feedback-form">
            <h3>Send Feedback</h3>
            
            <div className="feedback-types">
              <button 
                className={type === 'bug' ? 'active' : ''}
                onClick={() => setType('bug')}
              >
                Bug Report
              </button>
              <button 
                className={type === 'feature' ? 'active' : ''}
                onClick={() => setType('feature')}
              >
                Feature Request
              </button>
              <button 
                className={type === 'general' ? 'active' : ''}
                onClick={() => setType('general')}
              >
                General
              </button>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                type === 'bug' 
                  ? "Describe what happened and what you expected..."
                  : type === 'feature'
                  ? "Describe the feature you'd like to see..."
                  : "Share your thoughts..."
              }
              rows={5}
            />

            <label className="screenshot-toggle">
              <input
                type="checkbox"
                checked={includeScreenshot}
                onChange={(e) => setIncludeScreenshot(e.target.checked)}
              />
              Include screenshot
            </label>

            <button 
              onClick={handleSubmit}
              disabled={!message.trim()}
              className="submit-button"
            >
              Send Feedback
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}
```

### 5. Onboarding Emails

```typescript
// Email templates (for Supabase Edge Functions or external email service)

const emailTemplates = {
  welcome: {
    subject: 'Welcome to Neume Beta!',
    body: `
Hi {{name}},

Welcome to Neume! You're one of our early beta testers, and we're excited to have you.

Here are a few things to get you started:

1. Create your first block
   Right-click on the canvas to add chords and build a progression.

2. Try the Analyze feature
   Upload a song to extract its chord progression and learn from the masters.

3. Explore with AI
   Use "Why This?" to understand chord choices and "Refine This" to get suggestions.

Your feedback shapes the product. Use the feedback button (bottom right) anytime.

Happy composing!
The Neume Team
    `,
  },
  
  feedbackRequest: {
    subject: 'How's your Neume experience?',
    body: `
Hi {{name}},

You've been using Neume for a week now. We'd love to hear how it's going!

A few quick questions:
- What do you like most about Neume?
- What's frustrating or confusing?
- What feature would make Neume more useful for you?

Just reply to this email with your thoughts. Every response is read by a human.

Thanks for being part of the beta!
The Neume Team
    `,
  },

  tipOfTheWeek: {
    subject: 'Neume Tip: {{tip_title}}',
    body: `
Hi {{name}},

Here's a quick tip to get more out of Neume:

**{{tip_title}}**

{{tip_content}}

Try it out and let us know what you think!

The Neume Team
    `,
  },
};

// Send emails via Supabase Edge Function or Resend/SendGrid
async function sendWelcomeEmail(user: User) {
  await fetch('/api/send-email', {
    method: 'POST',
    body: JSON.stringify({
      template: 'welcome',
      to: user.email,
      data: { name: user.user_metadata.display_name || 'there' },
    }),
  });
}
```

### 6. Analytics Tracking

```typescript
// src/lib/analytics.ts
type EventName =
  | 'signup'
  | 'login'
  | 'block_created'
  | 'chord_added'
  | 'playback_started'
  | 'analyze_started'
  | 'analyze_completed'
  | 'why_this_opened'
  | 'build_from_bones_opened'
  | 'refine_submitted'
  | 'midi_exported'
  | 'feedback_submitted';

interface AnalyticsEvent {
  name: EventName;
  properties?: Record<string, unknown>;
  timestamp: string;
  userId?: string;
  sessionId: string;
}

const sessionId = crypto.randomUUID();

export function track(name: EventName, properties?: Record<string, unknown>) {
  const event: AnalyticsEvent = {
    name,
    properties,
    timestamp: new Date().toISOString(),
    userId: getCurrentUserId(),
    sessionId,
  };

  // Log locally in development
  if (import.meta.env.DEV) {
    console.log('[Analytics]', event);
    return;
  }

  // Send to Supabase
  supabase.from('analytics_events').insert(event);

  // Or send to external service
  // mixpanel.track(name, properties);
  // posthog.capture(name, properties);
}

// Usage
track('block_created', { chordCount: 4, key: 'C', mode: 'major' });
track('analyze_completed', { source: 'youtube', chordCount: 16 });
```

### 7. Beta Dashboard (Admin)

```typescript
// src/pages/admin/BetaDashboard.tsx
export function BetaDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['beta-stats'],
    queryFn: fetchBetaStats,
  });

  return (
    <div className="beta-dashboard">
      <h1>Beta Dashboard</h1>

      <div className="stats-grid">
        <StatCard title="Total Users" value={stats?.totalUsers} />
        <StatCard title="Active (7 days)" value={stats?.activeUsers} />
        <StatCard title="Blocks Created" value={stats?.blocksCreated} />
        <StatCard title="Feedback Items" value={stats?.feedbackCount} />
      </div>

      <section className="recent-signups">
        <h2>Recent Signups</h2>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Signed Up</th>
              <th>Blocks</th>
              <th>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {stats?.recentSignups.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{formatDate(user.created_at)}</td>
                <td>{user.block_count}</td>
                <td>{formatRelativeTime(user.last_active)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="recent-feedback">
        <h2>Recent Feedback</h2>
        {stats?.recentFeedback.map((item) => (
          <FeedbackCard key={item.id} feedback={item} />
        ))}
      </section>

      <section className="invite-codes">
        <h2>Invite Codes</h2>
        <button onClick={generateAndShowCode}>Generate New Code</button>
        <InviteCodeList codes={stats?.inviteCodes} />
      </section>
    </div>
  );
}
```

### 8. Success Metrics Tracking

```typescript
// src/lib/metrics.ts

// Key beta metrics
interface BetaMetrics {
  // Acquisition
  signups: number;
  inviteConversion: number; // % who use invite code
  
  // Activation
  createdFirstBlock: number; // % who create a block
  usedAnalyze: number; // % who try analyze
  
  // Engagement
  dau: number; // Daily active users
  blocksPerUser: number;
  averageSessionLength: number;
  
  // Retention
  day1Retention: number;
  day7Retention: number;
  day30Retention: number;
  
  // Feedback
  nps: number; // Net Promoter Score
  feedbackCount: number;
}

// Track activation milestones
export function trackMilestone(milestone: string) {
  track('milestone_reached', { milestone });
  
  // Update user metadata
  supabase.from('profiles').update({
    milestones: supabase.rpc('array_append', [milestone]),
  });
}

// Milestones to track
const MILESTONES = [
  'first_login',
  'first_block_created',
  'first_chord_added',
  'first_playback',
  'first_analyze',
  'first_midi_export',
  'created_5_blocks',
  'used_why_this',
  'used_refine',
];
```

## File Structure

```
src/
  lib/
    db/
      invites.ts
      feedback.ts
    analytics.ts
    metrics.ts
  pages/
    RequestInvite.tsx
    admin/
      BetaDashboard.tsx
  components/
    auth/
      SignupWithInvite.tsx
    FeedbackWidget.tsx
```

## Quality Criteria

- [ ] Invite codes work correctly
- [ ] Signup requires valid code
- [ ] Request invite form submits
- [ ] Feedback widget sends data
- [ ] Analytics events fire correctly
- [ ] Admin dashboard shows stats
- [ ] Onboarding emails send

## Success Metrics (Beta Goals)

- 50+ beta users in first month
- 70%+ create at least one block
- 50%+ return within 7 days
- 20+ feedback items collected
- NPS score tracked
- 99.5% uptime

## Testing Considerations

1. Generate and use invite code
2. Request invite as new user
3. Submit all feedback types
4. Verify analytics in database
5. Test email delivery
6. Check admin dashboard data
