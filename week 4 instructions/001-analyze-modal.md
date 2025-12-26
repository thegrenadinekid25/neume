# Week 4 Prompt 001: Analyze Modal

**Learn from the masters by extracting chord progressions from real music**

---

## Objective

Create a modal interface that allows users to upload music (YouTube URLs or audio files) for AI-powered chord progression extraction. This is the entry point for one of Harmonic Canvas's most powerful features: learning from real pieces.

---

## Context

**Where This Fits:**
- User clicks "Analyze" in header → This modal opens
- User provides YouTube URL or audio file
- Modal sends to backend API (created in Prompt 002)
- Extracted progression loads onto canvas (Prompt 003)

**Dependencies:**
- ✅ Week 1: React project, TypeScript setup
- ✅ Week 2: Modal component patterns
- ✅ Week 3: Audio playback (will play analyzed pieces)

**Blocks:**
- Prompt 002: Backend needs this modal's data format
- Prompt 003: Canvas display needs uploaded file reference

**Related Files:**
- `src/components/Modals/AnalyzeModal.tsx` (new)
- `src/components/Header.tsx` (add "Analyze" button)
- `src/types/analysis.ts` (new types)
- `src/store/analysis-store.ts` (new Zustand store)

---

## Requirements

### Modal UI Components

1. **Trigger Button (in Header)**
   - Label: "Analyze"
   - Position: Left side of header
   - Icon: 🔍 or musical note
   - Keyboard shortcut: Cmd/Ctrl+Shift+A

2. **Modal Layout**
   - Size: 600px wide, auto height
   - Centered on screen
   - Semi-transparent backdrop (80% opacity)
   - Close button (×) top-right
   - Escape key to close

3. **Upload Options (Two Tabs)**

   **Tab 1: YouTube URL**
   - Text input field
   - Placeholder: "https://youtube.com/watch?v=..."
   - Paste detection (auto-validate)
   - Example links below input (3 curated examples)
   - Format validation (must be valid YouTube URL)

   **Tab 2: Audio File**
   - Drag-and-drop zone
   - File picker button
   - Supported formats: .mp3, .wav, .m4a
   - File size limit: 50MB
   - Visual feedback on drag-over
   - File name display after selection

4. **Advanced Options (Collapsible)**
   - Start time: MM:SS input (default: 00:00)
   - End time: MM:SS input (default: auto/full file)
   - Key hint: Dropdown (Auto-detect, C, D, E, F, G, A, B, C#, etc.)
   - Mode hint: Dropdown (Auto-detect, Major, Minor)

5. **Analyze Button**
   - Primary blue style (#4A90E2)
   - Label: "Analyze"
   - Disabled until valid input provided
   - Loading spinner when analyzing

6. **Processing State**
   - Progress bar (0-100%)
   - Status message: "Extracting chords from [title]..."
   - Estimated time remaining
   - Cancel button

7. **Error Handling**
   - Invalid URL: "Please enter a valid YouTube URL"
   - File too large: "File must be under 50MB"
   - Upload failed: "Upload failed. Please try again."
   - Analysis failed: "Couldn't analyze this piece. Try another one."

### Visual Design

**Modal Background:**
- White background
- Border-radius: 12px
- Box-shadow: `0 8px 32px rgba(0,0,0,0.15)`
- Padding: 32px

**Typography:**
- Title: 24px, Inter Semibold
- Labels: 13px, Inter Medium
- Input text: 15px, Inter Regular
- Help text: 11px, Inter Regular, gray

**Colors:**
- Primary action: #4A90E2
- Secondary text: #7F8C8D
- Error: #C44536
- Success: #6B9080
- Border: #E0E0E0

**Spacing:**
- Section gaps: 24px
- Input vertical spacing: 16px
- Button padding: 12px 24px

**Animations:**
- Modal enter: Fade + scale (0.95 → 1.0, 300ms)
- Modal exit: Fade + scale (1.0 → 0.95, 200ms)
- Tab switch: Cross-fade (200ms)
- Progress bar: Smooth fill (linear)

---

## Technical Constraints

**Libraries:**
- React 18+ with TypeScript
- Framer Motion (for modal animations)
- React Hook Form (for form validation)
- Zustand (for analysis state)

**File Upload:**
- Use HTML5 File API
- Drag-and-drop with `onDrop` event
- File validation before upload
- Base64 encoding for small files OR multipart upload for large files

**YouTube URL Parsing:**
- Support formats:
  - `https://youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
  - `https://www.youtube.com/watch?v=VIDEO_ID&t=30s`
- Extract video ID using regex
- Validate ID exists (basic format check)

**State Management:**
- Zustand store for analysis state
- Track: uploadType, url, file, startTime, endTime, keyHint, modeHint
- Track: isAnalyzing, progress, error, result

**Browser Compatibility:**
- File API support (Chrome 90+, Firefox 88+, Safari 14+)
- FormData for uploads
- Graceful degradation for drag-and-drop

---

## Code Structure

### File Structure
```
src/
├── components/
│   ├── Modals/
│   │   ├── AnalyzeModal.tsx (MAIN FILE)
│   │   └── Modal.tsx (base modal, if not from Week 2)
│   └── Header.tsx (UPDATE: add Analyze button)
├── store/
│   └── analysis-store.ts (NEW)
├── types/
│   └── analysis.ts (NEW)
└── utils/
    └── youtube-parser.ts (NEW)
```

### TypeScript Types

```typescript
// src/types/analysis.ts

export type UploadType = 'youtube' | 'audio';

export interface AnalysisInput {
  type: UploadType;
  
  // YouTube
  youtubeUrl?: string;
  videoId?: string;
  
  // Audio file
  audioFile?: File;
  
  // Advanced options
  startTime?: number; // seconds
  endTime?: number;   // seconds
  keyHint?: string;   // 'auto' | 'C' | 'D' | etc.
  modeHint?: 'auto' | 'major' | 'minor';
}

export interface AnalysisProgress {
  stage: 'uploading' | 'processing' | 'analyzing' | 'complete';
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number; // seconds
}

export interface AnalysisResult {
  title: string;
  composer?: string;
  key: string;
  mode: 'major' | 'minor';
  tempo: number;
  chords: Chord[]; // From existing Chord type
  sourceUrl?: string;
  analyzedAt: string; // ISO timestamp
}

export interface AnalysisError {
  code: string;
  message: string;
  retryable: boolean;
}
```

### Zustand Store

```typescript
// src/store/analysis-store.ts

import { create } from 'zustand';
import { AnalysisInput, AnalysisProgress, AnalysisResult, AnalysisError } from '@/types/analysis';

interface AnalysisState {
  // Modal state
  isModalOpen: boolean;
  
  // Input state
  input: AnalysisInput | null;
  
  // Process state
  isAnalyzing: boolean;
  progress: AnalysisProgress | null;
  error: AnalysisError | null;
  result: AnalysisResult | null;
  
  // Actions
  openModal: () => void;
  closeModal: () => void;
  setInput: (input: AnalysisInput) => void;
  startAnalysis: (input: AnalysisInput) => Promise<void>;
  updateProgress: (progress: AnalysisProgress) => void;
  setError: (error: AnalysisError) => void;
  setResult: (result: AnalysisResult) => void;
  cancelAnalysis: () => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  isModalOpen: false,
  input: null,
  isAnalyzing: false,
  progress: null,
  error: null,
  result: null,
  
  openModal: () => set({ isModalOpen: true, error: null }),
  closeModal: () => set({ isModalOpen: false }),
  
  setInput: (input) => set({ input, error: null }),
  
  startAnalysis: async (input) => {
    // Implementation in Prompt 002 (backend integration)
    set({ 
      isAnalyzing: true, 
      input, 
      error: null,
      progress: { 
        stage: 'uploading', 
        progress: 0, 
        message: 'Preparing upload...' 
      }
    });
  },
  
  updateProgress: (progress) => set({ progress }),
  setError: (error) => set({ error, isAnalyzing: false }),
  setResult: (result) => set({ result, isAnalyzing: false, isModalOpen: false }),
  
  cancelAnalysis: () => set({ 
    isAnalyzing: false, 
    progress: null 
  }),
  
  reset: () => set({ 
    input: null, 
    error: null, 
    progress: null, 
    result: null 
  })
}));
```

---

## Integration Points

### Imports
```typescript
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAnalysisStore } from '@/store/analysis-store';
import { parseYoutubeUrl } from '@/utils/youtube-parser';
```

### Exports
```typescript
export const AnalyzeModal: React.FC = () => { /* ... */ };
```

### State Management
- Uses `useAnalysisStore` for global state
- Local state for tab selection, validation
- Form state via React Hook Form

### Events
- Modal open: `useAnalysisStore.getState().openModal()`
- Modal close: Escape key, backdrop click, × button
- Form submit: Calls `startAnalysis()` with input

---

## Styling Requirements

### Modal Container
```css
.analyze-modal {
  width: 600px;
  max-width: 90vw;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  padding: 32px;
  position: relative;
}

.modal-backdrop {
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
}
```

### Tab Navigation
```css
.tab-nav {
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #E0E0E0;
  margin-bottom: 24px;
}

.tab-button {
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 500;
  color: #7F8C8D;
  border: none;
  background: transparent;
  cursor: pointer;
  position: relative;
  transition: color 200ms;
}

.tab-button.active {
  color: #4A90E2;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #4A90E2;
}
```

### File Drop Zone
```css
.drop-zone {
  border: 2px dashed #BDC3C7;
  border-radius: 8px;
  padding: 48px 24px;
  text-align: center;
  transition: all 200ms;
  cursor: pointer;
}

.drop-zone:hover,
.drop-zone.drag-over {
  border-color: #4A90E2;
  background: rgba(74, 144, 226, 0.05);
}

.drop-zone-icon {
  font-size: 48px;
  color: #BDC3C7;
  margin-bottom: 16px;
}

.drop-zone-text {
  font-size: 15px;
  color: #7F8C8D;
}
```

### Progress Bar
```css
.progress-container {
  margin-top: 24px;
}

.progress-bar {
  height: 8px;
  background: #E0E0E0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4A90E2, #6B9080);
  transition: width 300ms ease-out;
}

.progress-message {
  margin-top: 8px;
  font-size: 13px;
  color: #7F8C8D;
  text-align: center;
}
```

---

## Example Usage

### Opening the Modal

```typescript
// In Header.tsx
import { useAnalysisStore } from '@/store/analysis-store';

function Header() {
  const openAnalyzeModal = useAnalysisStore(state => state.openModal);
  
  return (
    <header>
      <button onClick={openAnalyzeModal}>
        Analyze
      </button>
      {/* ... other header content */}
    </header>
  );
}
```

### Using the Modal

```typescript
// In App.tsx or main component
import { AnalyzeModal } from '@/components/Modals/AnalyzeModal';
import { useAnalysisStore } from '@/store/analysis-store';

function App() {
  const isModalOpen = useAnalysisStore(state => state.isModalOpen);
  
  return (
    <>
      {/* Main app */}
      <Canvas />
      
      {/* Modals */}
      {isModalOpen && <AnalyzeModal />}
    </>
  );
}
```

---

## Quality Criteria

- [ ] **Modal animations smooth** - Fade + scale feels professional
- [ ] **Tab switching instant** - No lag between YouTube/Audio tabs
- [ ] **Drag-and-drop works** - File drop zone highlights on drag-over
- [ ] **File validation works** - Rejects invalid formats/sizes immediately
- [ ] **YouTube URL parsing** - Extracts ID from all common formats
- [ ] **Form validation clear** - Helpful error messages
- [ ] **Progress updates** - Bar moves smoothly, messages update
- [ ] **Keyboard accessible** - Tab navigation, Escape to close
- [ ] **Mobile responsive** - Works on smaller screens (90vw width)
- [ ] **Zero TypeScript errors** - Full type coverage
- [ ] **Clean code** - Well-commented, readable

---

## Implementation Notes

### YouTube URL Parsing

```typescript
// src/utils/youtube-parser.ts

export function parseYoutubeUrl(url: string): string | null {
  // Support formats:
  // - https://youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/watch?v=VIDEO_ID&t=30s
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

export function isValidYoutubeUrl(url: string): boolean {
  return parseYoutubeUrl(url) !== null;
}
```

### File Size Validation

```typescript
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function validateFile(file: File): string | null {
  // Check size
  if (file.size > MAX_FILE_SIZE) {
    return 'File must be under 50MB';
  }
  
  // Check format
  const validFormats = ['.mp3', '.wav', '.m4a'];
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  if (!validFormats.includes(ext)) {
    return `File must be ${validFormats.join(', ')}`;
  }
  
  return null; // Valid
}
```

### Drag-and-Drop Implementation

```typescript
function DropZone({ onFileDrop }: { onFileDrop: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      const error = validateFile(file);
      if (!error) {
        onFileDrop(file);
      } else {
        // Show error
      }
    }
  };
  
  return (
    <div
      className={`drop-zone ${isDragging ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop zone content */}
    </div>
  );
}
```

---

## Testing Considerations

### Manual Tests

1. **Modal open/close**
   - Click "Analyze" → Modal appears
   - Click backdrop → Modal closes
   - Press Escape → Modal closes
   - Click × button → Modal closes

2. **Tab switching**
   - Click "YouTube" tab → YouTube input visible
   - Click "Audio File" tab → File uploader visible
   - Switch rapidly → No visual glitches

3. **YouTube URL validation**
   - Enter valid URL → Analyze button enabled
   - Enter invalid URL → Error message shown
   - Paste URL → Auto-validates

4. **File upload**
   - Drag .mp3 file → Highlights, accepts
   - Drag .txt file → Rejects with error
   - Drag 60MB file → Rejects with error
   - Click "Choose File" → File picker opens

5. **Advanced options**
   - Expand "Advanced" → Options visible
   - Set start/end times → Values validated
   - Select key hint → Dropdown works

6. **Form submission**
   - Fill valid inputs → Click Analyze
   - Progress bar appears
   - Status message updates
   - (Integration with backend in Prompt 002)

### Edge Cases

- Empty URL field → Analyze button disabled
- Invalid time format (e.g., "99:99") → Validation error
- File selected then removed → Analyze button disabled
- Network error during upload → Error message shown
- User closes modal during analysis → Cancels gracefully

---

## Success Criteria

This prompt is complete when:

- [ ] Modal renders with beautiful design
- [ ] Both tabs (YouTube/Audio) work perfectly
- [ ] File drag-and-drop functional
- [ ] YouTube URL parsing works for all formats
- [ ] Form validation provides helpful errors
- [ ] Advanced options collapsible and functional
- [ ] Analyze button triggers startAnalysis()
- [ ] Progress UI updates smoothly
- [ ] Keyboard shortcuts work (Escape, Cmd+Shift+A)
- [ ] Mobile responsive (90vw max width)
- [ ] Zero TypeScript errors
- [ ] Code is clean and well-commented

---

## Next Steps

After completing this prompt:

1. **Test modal thoroughly** - All interactions smooth
2. **Move to Prompt 002** - Backend chord extraction API
3. **Integration** - Wire up startAnalysis() to backend

---

**Output Format:** Complete TypeScript React components with full styling, validation, and state management.

**Estimated Time:** 2-3 hours
