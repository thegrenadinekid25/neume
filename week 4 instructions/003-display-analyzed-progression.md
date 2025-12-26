# Week 4 Prompt 003: Display Analyzed Progression

## Objective
Display extracted chord progressions on the canvas with special "analyzed" styling, metadata banner, and seamless integration with existing chord system.

## Requirements
- Receive progression from backend API (Prompt 002)
- Convert backend format to frontend Chord objects
- Display chords on canvas with "analyzed" badge
- Add metadata banner: "[Title] by [Composer] - Analyzed from [source]"
- Support "Save to My Progressions" button
- Maintain all existing canvas features (drag, select, play, etc.)

## Technical Implementation
```typescript
// In analysis-store.ts
setResult: (result) => {
  const chords = result.chords.map(convertToCanvasChord);
  
  // Load onto canvas
  const canvasStore = useCanvasStore.getState();
  canvasStore.setChords(chords);
  canvasStore.setKey(result.key, result.mode);
  
  // Add metadata
  canvasStore.setMetadata({
    title: result.title,
    composer: result.composer,
    source: result.sourceUrl,
    analyzedAt: result.analyzedAt
  });
  
  set({ result, isModalOpen: false });
}
```

## Visual Requirements
- Analyzed chords have small badge: "📊 Analyzed"
- Metadata banner at top of canvas
- Special highlight on first view
- "Build From Bones" and "Save" buttons appear

**Estimated Time:** 1.5-2 hours
