# Week 4 Day 1 Implementation Plan: Analyze Modal + Backend Chord Extraction

## Overview

**Goal**: Build the Analyze Modal (frontend) and Backend chord extraction API.

**Day 1 Tasks**:
1. Frontend: Analyze Modal component with YouTube URL and audio file upload
2. Frontend: Analysis types, Zustand store, and YouTube parser utility
3. Backend: FastAPI server with chord extraction using Essentia

---

## Codebase Conventions Discovered

### Component Patterns
- Components use CSS Modules (`.module.css` files)
- Modals use `framer-motion` for animations (`AnimatePresence`, `motion.div`)
- Modals use `createPortal` for rendering outside the React tree
- Props interfaces defined inline in component files
- Functional components with `React.FC` typing

### Store Patterns
- Zustand stores in `/src/store/`
- Use `create` from `zustand`
- Interface defines state + actions together
- Actions modify state via `set()` function

### Type Patterns
- Types in `/src/types/` as separate files
- Exported via `/src/types/index.ts` barrel file
- Use `type` keyword for type aliases, `interface` for objects

### Styling
- CSS variables defined in `/src/styles/variables.css`
- Primary action color: `var(--primary-action)` = `#4A90E2`
- Standard border radius: `var(--border-radius-lg)` = `12px`
- Modal z-index pattern: backdrop `2000`, modal `2001`

---

## Task Breakdown

### Phase 1: Parallelizable Foundation Tasks (No Dependencies)

#### Task 1.1: Create Analysis Types
**File to create**: `src/types/analysis.ts`

#### Task 1.2: Create YouTube Parser Utility
**File to create**: `src/utils/youtube-parser.ts`

#### Task 1.3: Create Analysis Store
**File to create**: `src/store/analysis-store.ts`

#### Task 1.4: Create API Service
**File to create**: `src/services/api-service.ts`

### Phase 2: Component Tasks (Depend on Phase 1)

#### Task 2.1: Create AnalyzeModal CSS Module
**File to create**: `src/components/Modals/AnalyzeModal.module.css`

#### Task 2.2: Create AnalyzeModal Component
**File to create**: `src/components/Modals/AnalyzeModal.tsx`
**Dependencies**: Task 1.1, 1.2, 1.3, 2.1

#### Task 2.3: Create Modals Index
**File to create**: `src/components/Modals/index.ts`

### Phase 3: Backend Tasks (Parallel with Phase 2)

#### Task 3.1: Create Backend Directory Structure
**Directory**: `backend/`

#### Task 3.2: Create Backend Requirements
**File to create**: `backend/requirements.txt`

#### Task 3.3: Create Backend Pydantic Schemas
**File to create**: `backend/models/schemas.py`

#### Task 3.4: Create YouTube Downloader Service
**File to create**: `backend/services/youtube_downloader.py`

#### Task 3.5: Create Chord Extractor Service
**File to create**: `backend/services/chord_extractor.py`

#### Task 3.6: Create FastAPI Main Application
**File to create**: `backend/main.py`
**Dependencies**: Task 3.3, 3.4, 3.5

#### Task 3.7: Create Backend README
**File to create**: `backend/README.md`

### Phase 4: Integration Tasks (Depend on Phase 2 and 3)

#### Task 4.1: Update App.tsx to Include AnalyzeModal
**File to modify**: `src/App.tsx`

#### Task 4.2: Add Analyze Button Styles
**File to modify**: `src/App.css` or `src/App.module.css`

#### Task 4.3: Add Keyboard Shortcut for Analyze Modal
**File to modify**: `src/hooks/useKeyboardShortcuts.ts`

---

## Execution Order for Haiku Agents

### Parallel Batch 1 (Can all run simultaneously):
- Agent A: Task 1.1 (Analysis Types)
- Agent B: Task 1.2 (YouTube Parser)
- Agent C: Task 3.1 + 3.2 (Backend Directory + Requirements)
- Agent D: Task 3.3 (Pydantic Schemas)

### Parallel Batch 2 (After Batch 1 completes):
- Agent A: Task 1.3 (Analysis Store) - needs Task 1.1
- Agent B: Task 1.4 (API Service) - needs Task 1.1
- Agent C: Task 3.4 (YouTube Downloader)
- Agent D: Task 3.5 (Chord Extractor)

### Parallel Batch 3 (After Batch 2 completes):
- Agent A: Task 2.1 (AnalyzeModal CSS)
- Agent B: Task 3.6 (FastAPI Main) - needs 3.3, 3.4, 3.5
- Agent C: Task 3.7 (Backend README)

### Parallel Batch 4 (After Batch 3 completes):
- Agent A: Task 2.2 (AnalyzeModal Component) - needs 1.1, 1.2, 1.3, 2.1
- Agent B: Task 4.3 (Keyboard Shortcut) - needs 1.3

### Sequential Batch 5 (After Batch 4 completes):
- Agent A: Task 2.3 (Modals Index) - needs 2.2
- Agent B: Task 4.1 (Update App.tsx) - needs 2.2, 2.3
- Then: Task 4.2 (Update App.css) - needs 4.1
