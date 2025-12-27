# Week 5.5 Prompt 4: Animation System - Organic Easing

## Objective
Implement 600-800ms animations with organic easing curves that feel musical, not mechanical.

## Timing

**Duration Scale:**
```typescript
const duration = {
  instant: 0,
  fast: 200,
  normal: 400,
  slow: 600,
  deliberate: 800,
  glacial: 1200
};
```

**Default:** 600-800ms (Bauhaus deliberation)

## Easing Curves

**Organic Easings:**
```typescript
const easing = {
  // Breathing (gentle in-out)
  breathe: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)',
  
  // Elastic (musical bounce)
  elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  
  // Smooth (natural acceleration)
  smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  
  // Anticipate (wind-up before action)
  anticipate: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
};
```

## Animation Patterns

**Chord Pulse (Playing):**
```typescript
<motion.div
  animate={{
    scale: [1.0, 1.08, 1.0],
    opacity: [0.9, 1.0, 0.9]
  }}
  transition={{
    duration: 0.8,
    ease: 'breathe',
    repeat: Infinity
  }}
/>
```

**Hover State:**
```typescript
<motion.div
  whileHover={{
    scale: 1.05,
    rotate: 1.5 // Subtle organic tilt
  }}
  transition={{
    duration: 0.6,
    ease: 'smooth'
  }}
/>
```

**Enter/Exit:**
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{
    duration: 0.6,
    ease: 'breathe'
  }}
/>
```

## Success Criteria
- [ ] All animations 600-800ms (except micro-interactions)
- [ ] Organic easing curves used throughout
- [ ] Animations feel musical, not mechanical
- [ ] No jarring transitions

---

**Time:** 1.5-2 hours
