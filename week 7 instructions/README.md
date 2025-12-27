# Week 7: Launch Preparation

**Duration:** 9 hours  
**Theme:** Quality assurance, optimization, documentation, and controlled beta launch

---

## Overview

Week 7 prepares Neume for real users. This includes comprehensive testing, performance optimization, documentation for users and developers, deployment infrastructure, and a beta onboarding system.

---

## Prompt Inventory

| # | Prompt | Time | Description |
|---|--------|------|-------------|
| 01 | Testing Suite | 2h | UAT scenarios, performance benchmarks, accessibility audit |
| 02 | Optimization | 2h | Bundle splitting, React perf, audio pooling, caching |
| 03 | Documentation | 2h | User guide, keyboard shortcuts, developer docs |
| 04 | Deployment | 2h | Vercel, Sentry, CI/CD pipeline, staging |
| 05 | Beta Onboarding | 1h | Invite codes, feedback widget, analytics |

**Total:** 5 prompts, 9 hours

---

## Execution Order

```
PROMPT-01 (Testing) ─────────────────────────┐
                                             │
PROMPT-02 (Optimization) ────────────────────┼──> PROMPT-04 (Deployment)
                                             │
PROMPT-03 (Documentation) ───────────────────┘
                                             │
                                             └──> PROMPT-05 (Beta Onboarding)
```

Testing, optimization, and documentation can run in parallel. Deployment depends on all three. Beta onboarding is the final step.

---

## Success Criteria

Before shipping to beta users:

### Performance
- [ ] Initial load < 3 seconds on 4G
- [ ] 60fps during drag operations
- [ ] Audio latency < 100ms
- [ ] Memory < 200MB with 50 blocks
- [ ] Bundle size < 500KB gzipped

### Quality
- [ ] All 7 UAT scenarios pass
- [ ] WCAG 2.1 AA compliance
- [ ] Zero critical bugs in Sentry
- [ ] Works in Chrome, Firefox, Safari, Edge

### Infrastructure
- [ ] CI/CD pipeline green
- [ ] Staging environment functional
- [ ] Error monitoring active
- [ ] Invite code system working

### Beta Launch
- [ ] 50 initial beta users invited
- [ ] Feedback widget functional
- [ ] Analytics tracking events
- [ ] Welcome email sent

---

## Key Dependencies

### External Services
- **Vercel**: Hosting and deployments
- **Sentry**: Error monitoring
- **Supabase**: Auth, database, storage (from Week 6)
- **GitHub Actions**: CI/CD

### Testing Tools
- **Playwright**: E2E testing
- **axe-core**: Accessibility auditing
- **web-vitals**: Performance metrics

---

## Launch Checklist

```markdown
## Pre-Launch
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Staging fully tested
- [ ] Sentry configured
- [ ] Analytics verified

## Launch Day
- [ ] Deploy to production
- [ ] Verify health check
- [ ] Send first batch of invites
- [ ] Monitor error rates
- [ ] Watch performance metrics

## Post-Launch
- [ ] Daily Sentry review
- [ ] Weekly feedback synthesis
- [ ] Performance monitoring
- [ ] Plan iteration based on feedback
```

---

## Notes

### Testing Philosophy
Focus on user journeys, not unit test coverage. The 7 UAT scenarios represent the core value of the app. If those work reliably, we're ready.

### Performance Budget
The 500KB bundle limit forces discipline. Use code splitting aggressively. Every feature should justify its bytes.

### Beta Strategy
Start small (50 users) with invite codes. This creates:
- Controlled feedback volume
- Sense of exclusivity
- Ability to iterate before public launch

### Error Monitoring
Sentry should be configured before any real users touch the app. Errors in production are opportunities to improve, but only if we see them.

---

## Completion Milestone

Week 7 is complete when:

1. **Beta is live** with 50 invited users
2. **Feedback is flowing** through the widget
3. **Errors are visible** in Sentry (hopefully few)
4. **Metrics are tracking** user behavior

At this point, Neume transitions from "building" to "learning from real users."
