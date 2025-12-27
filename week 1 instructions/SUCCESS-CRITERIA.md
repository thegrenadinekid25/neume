# Week 1 Success Criteria

**Objective:** Establish a complete, working visual foundation for Neume

This document defines the measurable criteria that determine when Week 1 is successfully complete.

---

## Critical Success Criteria

These **must** be achieved to consider Week 1 complete:

### 1. Technical Functionality

âœ… **Project Runs Successfully**
- `npm run dev` starts dev server without errors
- Browser opens to localhost:3000
- Application loads and displays

âœ… **Zero TypeScript Errors**
- `npx tsc --noEmit` completes with no errors
- No type warnings in editor
- All imports resolve correctly

âœ… **All Dependencies Installed**
- package.json contains all required dependencies
- package-lock.json generated
- node_modules/ populated
- No peer dependency warnings

âœ… **Clean Console**
- No red errors in browser console
- No React warnings
- No "Failed to compile" messages

---

### 2. Visual Components

âœ… **Canvas Displays Correctly**
- Grid with beat lines visible
- Measure markers show 1, 2, 3...
- Timeline ruler displays at top
- Canvas is scrollable horizontally
- Background color matches current key

âœ… **All 7 Chord Shapes Render**
- I: Solid circle (gold #D4AF37)
- ii: Rounded square (sage #6B9080)
- iii: Triangle (dusty rose #B98B8B)
- IV: Solid square (periwinkle #4A6FA5)
- V: Pentagon (terracotta #E07A5F)
- vi: Circle variant (purple #9B7EBD)
- vii°: Pentagon outline (gray #6C6C6C)

âœ… **Hand-Drawn Aesthetic**
- Shapes have visible wobble (±0.5-2px)
- Edges are not perfectly smooth
- Organic, warm feeling
- Not computer-generated look

âœ… **Color System Accurate**
- All colors match spec hex values exactly
- Major mode colors different from minor mode
- Key backgrounds change correctly
- UI chrome colors match spec

âœ… **Watercolor Background**
- Subtle texture visible
- Paper grain overlay present (30-40% opacity)
- Not flat/solid color
- Atmospheric quality
- Luminosity variance (±5%)

---

### 3. Interactive Functionality

âœ… **Hover States Work**
- Chord scales to 1.05x on hover
- Subtle glow appears
- Smooth animation (300ms)
- Cursor shows pointer

âœ… **Selection Works**
- Click chord → blue stroke appears
- Stroke width: 3.5px
- Only one chord selected at a time
- Click again → deselects

âœ… **Playback Animation**
- Play button starts animation
- Playhead moves across canvas
- Chords pulse when playhead passes (1.0 → 1.12 → 1.0)
- Animation timing matches chord duration
- Breathing easing curve (cubic-bezier(0.45, 0.05, 0.55, 0.95))

âœ… **Key Changes**
- Dropdown changes current key
- Background color transitions smoothly (400ms)
- No jarring flashes
- All keys (C, D, E, F, G, A) work
- Major/minor mode toggle works

âœ… **Zoom Controls**
- 0.5x: Shapes smaller, grid compressed
- 1x: Default view
- 2x: Shapes larger, grid expanded
- Smooth transitions
- No visual glitches

---

### 4. Extension Features

âœ… **Extension Badges Display**
- "+9" badge on add9 chords
- "sus4" badge on sus4 chords
- Badge positioned top-right
- White background, readable text
- 12px font size

âœ… **Chromatic Chord Shimmer**
- Borrowed chords show iridescent overlay
- Gradient from purple to gold
- Edge glow effect (purple, 10px blur)
- 30-40% opacity
- Visible but not overwhelming

---

## Performance Criteria

âœ… **Frame Rate**
- Maintains 60fps during playback
- Maintains 60fps during zoom changes
- Maintains 60fps during key changes
- No dropped frames
- Smooth animations throughout

âœ… **Render Performance**
- Initial load < 2 seconds
- Canvas renders immediately
- No visible lag when adding shapes
- 50+ chords render smoothly

âœ… **Memory Usage**
- No memory leaks over 5 minutes
- Stable memory after key changes
- Garbage collection works
- No runaway processes

---

## Code Quality Criteria

âœ… **TypeScript Compliance**
- Strict mode enabled
- No `any` types used
- All interfaces documented
- Proper type inference

âœ… **Component Structure**
- Follows React best practices
- Proper use of hooks
- Memoization where appropriate
- Clean component hierarchy

âœ… **Code Organization**
- Logical folder structure
- Consistent naming conventions
- Path aliases working (@/, @components, @types, etc.)
- Barrel exports functional

âœ… **Styling**
- CSS modules used correctly
- No inline styles (except dynamic values)
- CSS variables utilized
- No style conflicts

---

## Accessibility Criteria

âœ… **Keyboard Navigation**
- Tab through controls works
- Focus indicators visible
- Enter/Space activate buttons
- Escape closes modals (future)

âœ… **Screen Reader Support**
- ARIA labels on interactive elements
- Semantic HTML
- Chord shapes announced correctly
- Controls properly labeled

âœ… **Color Contrast**
- Text meets WCAG AA (4.5:1 minimum)
- Interactive elements distinguishable
- Focus indicators visible

---

## Integration Criteria

âœ… **Demo Completeness**
- App.tsx shows all 7 chord types
- Interactive controls present
- Legend explains shape system
- Example progression makes sense musically

âœ... **Component Integration**
- Canvas contains ChordShape children
- WatercolorBackground applies to Canvas
- Grid overlays correctly
- Playhead moves over chords

âœ… **State Management**
- Current key/mode stored
- Selected chord tracked
- Playing state managed
- Zoom level controlled

---

## Documentation Criteria

âœ… **Code Comments**
- Complex logic explained
- TypeScript interfaces documented (JSDoc)
- Component props described
- Utility functions documented

âœ… **README Updated**
- Setup instructions clear
- Tech stack listed
- Development commands documented
- Project status noted

---

## Testing Criteria

âœ… **Visual Regression**
- Screenshot of each chord type
- Screenshot of key backgrounds
- Screenshot of hover/selected states
- Screenshot of playing animation

âœ… **Cross-Browser**
- Chrome: Works perfectly
- Firefox: Works perfectly
- Safari: Works perfectly
- Edge: Works perfectly

âœ… **Functionality Tests**
- All controls functional
- No broken interactions
- Edge cases handled (empty canvas, single chord, 100+ chords)

---

## Nice-to-Have (Not Required for Week 1)

These are bonus achievements but NOT required:

- ⭐ Connection lines between chords
- ⭐ Tooltip on hover
- ⭐ Keyboard shortcuts
- ⭐ Mobile responsive (Week 10+)
- ⭐ Export to image
- ⭐ Save progression

---

## Measurement Methods

### How to Verify Each Criterion

**Technical Functionality:**
```bash
# Run these commands, all should succeed
npm run dev
npx tsc --noEmit
npm run build
```

**Visual Components:**
- Open http://localhost:3000
- Visually inspect all elements
- Compare with spec screenshots
- Use browser DevTools color picker to verify hex values

**Interactive Functionality:**
- Manually test each interaction
- Record screen to review animations
- Use browser performance tools (Chrome DevTools → Performance tab)

**Performance:**
- Chrome DevTools → Performance tab → Record during playback
- Check FPS counter (should stay at 60)
- Monitor memory tab over 5 minutes

**Code Quality:**
- ESLint output clean
- TypeScript compilation clean
- Code review against best practices

**Accessibility:**
- Tab through interface with keyboard only
- Test with screen reader (VoiceOver on Mac, NVDA on Windows)
- Use browser accessibility inspector

---

## Acceptance Test

**The 5-Minute Demo:**

Someone unfamiliar with the project should be able to:

1. Clone repo
2. Run `npm install && npm run dev`
3. See canvas with 8 chords
4. Click Play → Watch chords pulse
5. Change key → See background fade
6. Zoom in/out → See shapes scale
7. Hover over chord → See it glow
8. Click chord → See it select

If all these work smoothly, Week 1 is complete! ✅

---

## Sign-Off Checklist

Before moving to Week 2, verify:

- [ ] All **Critical Success Criteria** achieved
- [ ] All **Performance Criteria** met
- [ ] All **Code Quality Criteria** satisfied
- [ ] All **Accessibility Criteria** implemented
- [ ] All **Integration Criteria** working
- [ ] **Acceptance Test** passes
- [ ] Git committed with message "Week 1 Complete: Visual Foundation"
- [ ] Screenshots saved for documentation
- [ ] Ready to start Week 2 development

---

## Failure Criteria

Week 1 is **NOT** complete if:

- âŒ TypeScript errors exist
- âŒ Any chord shape doesn't render
- âŒ Colors don't match spec
- âŒ Performance below 60fps
- âŒ Console has errors
- âŒ Play button doesn't work
- âŒ Key changes don't update background
- âŒ Zoom doesn't work

These must be fixed before proceeding to Week 2.

---

## Completion Certificate

When all criteria are met:

```
✅ WEEK 1 COMPLETE - VISUAL FOUNDATION

Date: _______________
Developer: _______________
Verified by: _______________

All 8 prompts executed successfully
All success criteria achieved
Ready for Week 2: Interactions

Next milestone: Drag-and-drop (Week 3)
```

---

**Remember:** Quality over speed. It's better to have a solid Week 1 that takes 8 days than a rushed Week 1 that requires rework in Week 2.

Take pride in your work! This is the foundation everything else builds on. 🎵✨
