# Week 4 Day 2 Implementation Plan: Display Analyzed Progression

## Overview
Display extracted chord progressions on the canvas with special "analyzed" styling, metadata banner, and integration with existing chord system.

## Task Breakdown

### Phase 1: Parallelizable Tasks (No Dependencies)

#### Task 1.1: Create Chord Conversion Utility
**File to create**: `src/utils/chord-converter.ts`
- Convert AnalyzedChord (backend) to Chord (frontend)
- Generate unique IDs
- Set `source: 'analyzed'`
- Map quality strings to ChordQuality type
- Calculate positions based on beat numbers

#### Task 1.2: Create MetadataBanner Component
**Files to create**:
- `src/components/Canvas/MetadataBanner.tsx`
- `src/components/Canvas/MetadataBanner.module.css`
- Shows: "[Title] by [Composer] - Analyzed from [source]"
- Includes "Clear" button to remove analyzed progression
- Styled to appear at top of canvas

#### Task 1.3: Add Analyzed Badge Styling
**File to modify**: `src/components/Canvas/ChordShape.module.css`
- Add `.analyzedBadge` class for the "📊" indicator
- Position in top-right corner of chord shape
- Subtle but visible styling

### Phase 2: Integration Tasks (Depend on Phase 1)

#### Task 2.1: Update ChordShape for Analyzed Badge
**File to modify**: `src/components/Canvas/ChordShape.tsx`
- Check if `chord.source === 'analyzed'`
- Render analyzed badge when true
- Show confidence indicator if available

#### Task 2.2: Update Analysis Store with Canvas Integration
**File to modify**: `src/store/analysis-store.ts`
- Import chord converter utility
- On successful analysis, convert chords and update App state
- Close modal after loading chords
- Store metadata for banner display

#### Task 2.3: Update App.tsx for Metadata Banner
**File to modify**: `src/App.tsx`
- Import MetadataBanner component
- Subscribe to analysis result metadata
- Render banner when analyzed progression is loaded
- Add handler to clear analyzed progression

### Phase 3: Polish

#### Task 3.1: Update Canvas index exports
**File to modify**: `src/components/Canvas/index.ts`
- Export MetadataBanner

## Execution Order

### Batch 1 (Parallel):
- Task 1.1: Chord converter utility
- Task 1.2: MetadataBanner component + CSS
- Task 1.3: Analyzed badge CSS

### Batch 2 (Parallel, after Batch 1):
- Task 2.1: ChordShape update
- Task 2.2: Analysis store integration
- Task 2.3: App.tsx integration

### Batch 3 (Sequential):
- Task 3.1: Export updates
