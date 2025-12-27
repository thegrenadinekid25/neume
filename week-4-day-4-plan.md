# Week 4 Day 4: Integration Testing Plan

## Overview

This test plan provides structured test cases for integration testing of Week 4 AI features in Neume. Tests are categorized by what can be tested locally without the backend vs what requires backend integration.

**App URL:** http://localhost:5173

**Key Components Tested:**
- AnalyzeModal (`/src/components/Modals/AnalyzeModal.tsx`)
- WhyThisPanel (`/src/components/Panels/WhyThisPanel.tsx`)
- MetadataBanner (`/src/components/Canvas/MetadataBanner.tsx`)
- DraggableChord context menu (`/src/components/Canvas/DraggableChord.tsx`)
- Explanation Service (`/src/services/explanation-service.ts`)

---

## Section 1: Frontend-Only Tests (No Backend Required)

These tests verify UI components, interactions, and mock fallback behavior.

### Test 1.1: Analyze Modal - Open and Close

**Objective:** Verify the Analyze modal opens and closes correctly

**Steps:**
1. Navigate to http://localhost:5173
2. Take a snapshot to identify the Analyze button
3. Click the "Analyze" button in the header controls
4. Verify the modal appears with overlay
5. Verify modal has two tabs: "YouTube URL" and "Audio File"
6. Verify YouTube tab is active by default
7. Click the close button (X)
8. Verify modal closes and overlay disappears
9. Reopen modal
10. Press Escape key
11. Verify modal closes

### Test 1.2: Analyze Modal - YouTube URL Tab

**Objective:** Verify YouTube URL input validation and example links

**Steps:**
1. Open Analyze modal
2. Take snapshot to find input field
3. Verify placeholder text shows "https://youtube.com/watch?v=..."
4. Enter invalid text: "not a url"
5. Verify error message appears: "Please enter a valid YouTube URL"
6. Clear input
7. Enter valid URL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
8. Verify error message disappears
9. Verify Analyze button becomes enabled

### Test 1.3: Analyze Modal - Audio File Tab

**Objective:** Verify audio file upload UI and validation

**Steps:**
1. Open Analyze modal
2. Click "Audio File" tab
3. Verify drop zone appears with "Drop audio file here" message
4. Verify "Choose File" button is present
5. Verify supported formats text

### Test 1.4: Analyze Modal - Advanced Options

**Objective:** Verify advanced options toggle and form fields

**Steps:**
1. Open Analyze modal
2. Click "Advanced Options" toggle
3. Verify panel expands
4. Verify Start Time, End Time inputs appear
5. Verify Key Hint and Mode Hint dropdowns appear
6. Click toggle again to collapse

### Test 1.5: Canvas - Right-Click Context Menu on Chord

**Objective:** Verify right-click menu appears on chords with "Why This?" option

**Steps:**
1. Take snapshot to identify chord shapes
2. Right-click on a chord shape
3. Verify context menu appears with "Why This?" option
4. Verify "Delete" option also present
5. Click outside the menu to close

### Test 1.6: Why This Panel - Open and Display Mock Explanation

**Objective:** Verify Why This panel opens and shows mock explanation

**Steps:**
1. Right-click on a chord
2. Click "Why This?" in context menu
3. Verify panel slides in from right
4. Verify panel header shows "Why This [chord]?"
5. Verify sections: Context, Technical Analysis, Historical Context, Evolution Chain, Listen
6. Verify close button works
7. Verify Escape closes panel

### Test 1.7: Keyboard Shortcuts

**Objective:** Verify keyboard shortcuts work alongside new features

**Steps:**
1. Press Space to toggle playback
2. Press Cmd+A to select all chords
3. Press Escape to deselect
4. Press "?" to open shortcuts guide

### Test 1.8: Demo Chords and Canvas Functionality

**Objective:** Verify core canvas features work with Week 4 additions

**Steps:**
1. Verify demo chords are displayed
2. Click on a chord to select it
3. Delete and Undo functionality

---

## Section 2: Backend-Required Tests (Skip if backend unavailable)

These tests require the backend API to be running.

### Test 2.1: YouTube Analysis - Full Flow
### Test 2.2: Audio File Upload Analysis
### Test 2.3: AI Explanation - Claude API

---

## Test Execution Summary

Focus on Section 1 tests which can be executed without backend.
