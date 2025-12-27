# Week 5.5 Prompt 2: Color & Form - Saturated + Organic

## Objective
Implement saturated chord colors with organic geometric transforms for Bauhaus precision meets Kinfolk warmth.

## Saturated Colors

### Major Key (Vibrant)
```typescript
const majorColors = {
  I:   '#E8A03E',  // Rich golden amber
  ii:  '#5BAF89',  // Vibrant sage
  iii: '#D97298',  // Bold rose
  IV:  '#4E7AC7',  // Bright periwinkle
  V:   '#E85D3D',  // Vivid terracotta
  vi:  '#9D6DB0',  // Saturated purple
  vii: '#4A4A4A'   // Charcoal
};
```

### Minor Key (Deep & Rich)
```typescript
const minorColors = {
  i:   '#A73636',  // Deep burgundy
  ii:  '#6B7A8C',  // Slate blue
  III: '#D4924A',  // Rich amber
  iv:  '#2F4A6B',  // Deep navy
  v:   '#C43A2E',  // Vivid crimson
  VI:  '#6BA870',  // Rich sage
  VII: '#D87028'   // Bright burnt orange
};
```

## Organic Transform

**Wobble Config:**
```typescript
const wobble = {
  vertex: 2.5,      // ±2.5px vertex displacement
  stroke: 0.8,      // ±0.8px stroke variation
  rotation: 1.5,    // ±1.5° rotation
  scale: 0.02       // ±2% scale
};
```

**Implementation:**
```typescript
function organicTransform(shape: SVGElement): void {
  const r = (Math.random() - 0.5) * wobble.rotation;
  const s = 1 + (Math.random() - 0.5) * wobble.scale;
  shape.style.transform = `rotate(${r}deg) scale(${s})`;
}
```

## Success Criteria
- [ ] All chord colors updated to saturated palette
- [ ] Shapes have subtle organic variation
- [ ] Still feels geometric (Bauhaus)
- [ ] Feels hand-made (Kinfolk)

---

**Time:** 1-1.5 hours
