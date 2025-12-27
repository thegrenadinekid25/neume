# Week 5 Prompt 01: Analyze Modal UI

## Objective
Create the upload modal for analyzing audio files and YouTube URLs to extract chord progressions and create harmonic blocks.

## Context
- **Current state:** Users create blocks manually via right-click menu
- **Why now:** This is the gateway feature for AI-powered analysis - users need to upload before we can analyze
- **Architecture:** Block-based system (4-16 bars, reusable harmonic sections)
- **Integration points:** Header "Analyze" button, Canvas for displaying results, Backend API for processing

## Requirements

### 1. Modal Trigger
- "Analyze" button in header bar (left side)
- Click opens modal with smooth fade-in (300ms, ease-out)
- Modal overlays canvas with semi-transparent backdrop (rgba(0,0,0,0.5))
- ESC key or backdrop click closes modal

### 2. Modal Layout
```
┌───────────────────────────────────────────┐
│  Analyze a Piece                     [×]  │
├───────────────────────────────────────────┤
│                                           │
│  Upload or paste:                         │
│                                           │
│  [YouTube URL                        ]    │
│  https://youtube.com/watch?v=...          │
│                                           │
│  ─────────── OR ───────────               │
│                                           │
│  ┌─────────────────────────────────┐      │
│  │                                 │      │
│  │    Drop audio file here         │      │
│  │    .mp3, .wav, .m4a             │      │
│  │                                 │      │
│  └─────────────────────────────────┘      │
│                                           │
│  ▼ Advanced (optional)                    │
│  ┌─────────────────────────────────┐      │
│  │ Start time: [0:00]              │      │
│  │ End time: [auto]                │      │
│  │ Key hint: [Auto-detect ▼]       │      │
│  └─────────────────────────────────┘      │
│                                           │
│                        [Analyze]          │
│                                           │
└───────────────────────────────────────────┘
```

### 3. Input Types

**YouTube URL Input:**
- Text field with placeholder "Paste YouTube URL..."
- Validate URL format on blur
- Show green checkmark when valid
- Show red error for invalid URLs

**Audio File Upload:**
- Drag-and-drop zone
- Click to open file picker
- Accept: .mp3, .wav, .m4a, .flac, .ogg
- Show file name after selection
- Max file size: 50MB
- Show progress bar during upload

### 4. Advanced Options (Collapsible)
- Default: collapsed
- Click "Advanced" to expand
- **Start time:** Time input (MM:SS format)
- **End time:** Time input or "auto" 
- **Key hint:** Dropdown with all keys + "Auto-detect"

### 5. States

**Empty State:**
- Both inputs empty
- "Analyze" button disabled (grayed out)

**YouTube Selected:**
- URL field has valid URL
- "Analyze" button enabled
- Drop zone shows "or upload a file instead"

**File Selected:**
- File name displayed with file icon
- "Remove" button to clear
- "Analyze" button enabled

**Loading State:**
```
┌───────────────────────────────────────────┐
│  Analyzing...                        [×]  │
├───────────────────────────────────────────┤
│                                           │
│  [████████████████░░░░░░░░] 65%           │
│                                           │
│  Extracting chord progressions from       │
│  "O Magnum Mysterium"...                  │
│                                           │
└───────────────────────────────────────────┘
```

**Error State:**
- Red error message below input
- "Try again" button
- Common errors: invalid URL, file too large, unsupported format

## Technical Constraints
- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **File handling:** Native File API + FormData for upload
- **State:** Local component state (not Zustand - modal is transient)

## Code Structure
```
src/
├── components/
│   └── Modals/
│       ├── AnalyzeModal.tsx       # Main modal component
│       ├── YouTubeInput.tsx       # URL input with validation
│       ├── FileDropZone.tsx       # Drag-and-drop file upload
│       └── AnalysisProgress.tsx   # Loading state display
```

## Component Interface
```typescript
interface AnalyzeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (input: AnalyzeInput) => Promise<void>;
}

interface AnalyzeInput {
  type: 'youtube' | 'file';
  youtubeUrl?: string;
  file?: File;
  options?: {
    startTime?: number;  // seconds
    endTime?: number;    // seconds
    keyHint?: string;    // e.g., "C major"
  };
}

interface AnalysisProgress {
  status: 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';
  progress: number;  // 0-100
  message: string;
  error?: string;
}
```

## Styling Specifications
- Modal width: 480px
- Modal background: white
- Border-radius: 12px
- Shadow: 0 20px 60px rgba(0,0,0,0.2)
- Header: 18px Inter Semibold, #2C3E50
- Body text: 14px Inter Regular, #5A6A7A
- Input fields: 40px height, 1px border #E0E0E0
- Primary button: #4A90E2 background, white text
- Drop zone: Dashed 2px border, #E0E0E0, hover #4A90E2

## Quality Criteria
- [ ] Modal opens/closes smoothly with animation
- [ ] YouTube URL validation works correctly
- [ ] File drag-and-drop works on all browsers
- [ ] File type validation prevents invalid uploads
- [ ] Progress indicator shows during analysis
- [ ] Error states display helpful messages
- [ ] Keyboard accessible (Tab navigation, ESC to close)
- [ ] Screen reader announces modal state changes

## Testing Considerations
**Manual Tests:**
1. Open modal from header button
2. Close modal via X, ESC, and backdrop click
3. Enter valid/invalid YouTube URLs
4. Drag-and-drop various file types
5. Try uploading files over 50MB
6. Test keyboard navigation
7. Verify progress updates during mock analysis

**Edge Cases:**
- Very long YouTube URLs
- Files with special characters in name
- Network failure during upload
- User closes modal during analysis

## Success Criteria
After implementation:
1. Modal matches the design specification exactly
2. Both input methods (YouTube + file) work correctly
3. Validation prevents invalid submissions
4. Progress feedback keeps user informed
5. Errors are clear and actionable
6. Modal is fully accessible

---
**Estimated Time:** 1.5 hours
**Dependencies:** Header component with "Analyze" button
**Blocks:** Backend integration (Prompt 02), Claude API (Prompt 03)
