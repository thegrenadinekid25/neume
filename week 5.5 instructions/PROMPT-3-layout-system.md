# Week 5.5 Prompt 3: Layout System - Asymmetric Bauhaus

## Objective
Implement asymmetric, grid-breaking layouts with 10:1 ratio spacing for dramatic Bauhaus-inspired visual hierarchy.

## Spacing Scale (10:1 Ratio)

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 32,
  xl: 64,
  xxl: 128
};
```

## Asymmetric Principles

**Break the grid:**
- Offset elements slightly from perfect alignment
- Use odd numbers (3, 5, 7) for columns
- Intentional imbalance creates tension

**Example Layout:**
```
┌─────────────────────────────────┐
│  [Logo]                  [CTA]  │  ← Asymmetric header
├─────────────────────────────────┤
│                                 │
│     [Large Canvas]              │  ← Off-center
│                                 │
│  [Small    [Medium              │  ← Different sizes
│   Panel]    Panel]              │
│                                 │
└─────────────────────────────────┘
```

## Implementation

**CSS Grid with Asymmetry:**
```css
.layout-main {
  display: grid;
  grid-template-columns: 1fr 3fr 1fr; /* Asymmetric 1:3:1 */
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
}

.layout-sidebar {
  width: 280px; /* Not 300 - odd number */
  padding: var(--spacing-md);
  margin-left: var(--spacing-sm); /* Slight offset */
}
```

## Success Criteria
- [ ] Spacing uses 10:1 scale
- [ ] Layouts feel asymmetric yet balanced
- [ ] White space is dramatic and intentional

---

**Time:** 1-1.5 hours
