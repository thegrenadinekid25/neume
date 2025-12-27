# Week 5.5 Prompt 5: Component Library Updates

## Objective
Update all UI components to use Bauhaus Kinfolk design system (typography, colors, animations, spacing).

## Components to Update

### 1. ChordShape
- **Colors:** Use saturated palette
- **Transform:** Apply organic wobble
- **Texture:** Add subtle SVG filter
- **Badge:** Updated styling with new typography

### 2. Header
- **Typography:** Fraunces for "Neume" title
- **Layout:** Asymmetric positioning
- **Spacing:** Use 10:1 scale

### 3. Buttons
- **Typography:** Space Grotesk Medium, 14px
- **Animation:** 600ms organic hover
- **Colors:** Primary action colors

### 4. ContextMenu
- **Typography:** Space Grotesk for items, DM Mono for chord symbols
- **Spacing:** 16px padding, 8px gaps
- **Animation:** 400ms breathe easing

### 5. Tooltips
- **Typography:** DM Mono for roman numerals, Space Grotesk for labels
- **Animation:** 600ms fade-in
- **Positioning:** Asymmetric offset

### 6. Modals
- **Typography:** Fraunces for headings, Space Grotesk for body
- **Layout:** Asymmetric content placement
- **Animation:** 800ms deliberate entrance

## Implementation Checklist

For each component:
- [ ] Update typography to new system
- [ ] Apply saturated colors
- [ ] Add organic animations (600-800ms)
- [ ] Use 10:1 spacing scale
- [ ] Implement asymmetric layouts where appropriate
- [ ] Test visual cohesion

## Code Pattern

```typescript
const StyledButton = styled.button`
  font-family: var(--font-ui);
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-primary);
  transition: all 600ms cubic-bezier(0.45, 0.05, 0.55, 0.95);
  
  &:hover {
    transform: scale(1.05) rotate(0.5deg);
  }
`;
```

## Success Criteria
- [ ] All components use new typography
- [ ] All components use saturated colors
- [ ] All animations 600-800ms with organic easing
- [ ] Visual cohesion across entire app
- [ ] No remnants of old design system

---

**Time:** 2-3 hours
