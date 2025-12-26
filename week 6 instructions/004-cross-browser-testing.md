# Week 6 Prompt 004: Cross-Browser Testing

## Objective
Ensure Harmonic Canvas works perfectly across Chrome, Firefox, Safari, and Edge.

## Test Matrix

| Feature | Chrome 90+ | Firefox 88+ | Safari 14+ | Edge 90+ |
|---------|-----------|-------------|-----------|----------|
| Visual rendering | ___ | ___ | ___ | ___ |
| Audio playback | ___ | ___ | ___ | ___ |
| Drag-and-drop | ___ | ___ | ___ | ___ |
| Modals | ___ | ___ | ___ | ___ |
| File upload | ___ | ___ | ___ | ___ |
| YouTube analysis | ___ | ___ | ___ | ___ |
| MIDI export | ___ | ___ | ___ | ___ |
| localStorage | ___ | ___ | ___ | ___ |

## Browser-Specific Issues

### Safari

**Issue 1: Audio Context**
```typescript
// Safari requires user gesture to start audio
const startAudio = async () => {
  await Tone.start();
  if (Tone.context.state === 'suspended') {
    await Tone.context.resume();
  }
};
```

**Issue 2: Drag-and-drop**
```typescript
// Safari needs explicit dataTransfer type
e.dataTransfer.effectAllowed = 'move';
e.dataTransfer.setData('text/plain', chord.id);
```

### Firefox

**Issue 1: CSS Grid**
```css
/* Firefox older versions need -moz prefix */
display: -moz-grid;
display: grid;
```

**Issue 2: Audio timing**
```typescript
// Firefox may have slight timing differences
// Test and adjust if needed
const firefoxOffset = isFirefox ? 0.01 : 0;
```

### Edge

**Generally compatible with Chrome** (Chromium-based)
- Test to ensure no edge cases
- Verify all Chromium features work

## Testing Checklist

### Visual Rendering
- [ ] Shapes render correctly (circles, squares, pentagons)
- [ ] Colors match spec
- [ ] Fonts load (Inter, DM Sans)
- [ ] Watercolor background appears
- [ ] Grid lines visible
- [ ] Connection lines smooth

### Audio System
- [ ] Audio initializes on user click
- [ ] Playback starts/stops correctly
- [ ] Tempo changes work
- [ ] Reverb audible
- [ ] No audio glitches
- [ ] Volume control works

### Interactions
- [ ] Drag-and-drop smooth
- [ ] Right-click menu appears
- [ ] Selection works (single, multi, range)
- [ ] Undo/redo functional
- [ ] Keyboard shortcuts work

### Modals
- [ ] Modals open/close
- [ ] Animations smooth
- [ ] Backdrop darkens
- [ ] Focus management correct
- [ ] Can close with Escape

### File Operations
- [ ] File upload works
- [ ] YouTube URL parsing correct
- [ ] MIDI export downloads
- [ ] localStorage saves/loads

## Testing Procedure

### For Each Browser:

1. **Fresh install test**
   - Clear cache, cookies
   - Load app for first time
   - Complete tutorial
   - Create progression
   - Test all features

2. **Regression test**
   - Load existing progression
   - Edit and save
   - Test AI features
   - Verify no data loss

3. **Performance test**
   - Load 50+ chords
   - Play progression
   - Check FPS (should be 60)
   - Monitor memory usage

## Browser Detection

```typescript
// Detect browser
const isChrome = /Chrome/.test(navigator.userAgent);
const isFirefox = /Firefox/.test(navigator.userAgent);
const isSafari = /Safari/.test(navigator.userAgent) && !isChrome;
const isEdge = /Edg/.test(navigator.userAgent);

// Use for conditional fixes
if (isSafari) {
  // Apply Safari-specific code
}
```

## Quality Criteria
- [ ] Works in all 4 browsers
- [ ] No visual glitches
- [ ] Audio works everywhere
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Known issues documented

**Estimated Time:** 2-3 hours
