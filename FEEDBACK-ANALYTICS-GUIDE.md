# Feedback & Analytics System Documentation

## Overview

This document describes the feedback widget and analytics system implemented for the Neume beta onboarding program. Both systems use localStorage only, with no cloud dependencies, making them suitable for development and early-stage user testing.

## Components

### 1. FeedbackWidget Component

**Location:** `/src/components/FeedbackWidget.tsx`

A React component that provides a floating feedback button in the bottom-right corner of the application. Users can submit feedback by clicking the button, selecting a feedback type, and entering their message.

#### Features

- **Floating Button**: Chat bubble icon in the bottom-right corner (position: fixed, z-index: 999)
- **Modal Dialog**: Opens when feedback button is clicked
- **Feedback Types**: Bug, Feature Request, or General
- **Message Input**: Textarea with 500 character limit and live character count
- **Success Notification**: Toast message appears after successful submission
- **localStorage Storage**: All feedback is stored locally without server communication
- **Accessibility**: ARIA labels, keyboard navigation, focus management

#### Usage

The FeedbackWidget is already integrated into the main App component. It renders automatically when the app loads:

```tsx
<FeedbackWidget />
```

Optional callback when feedback is submitted:

```tsx
<FeedbackWidget
  onFeedbackSubmitted={(feedback) => {
    console.log('Feedback received:', feedback);
  }}
/>
```

#### Accessing Stored Feedback

The component exports utility functions to access feedback data:

```tsx
import { getFeedbackItems, saveFeedbackItem } from '@/components/FeedbackWidget';

// Get all stored feedback
const allFeedback = getFeedbackItems();

// Access feedback in browser console
console.log(JSON.stringify(allFeedback, null, 2));

// Clear feedback (optional)
localStorage.removeItem('neume_feedback_items');
```

#### CSS Customization

Styling is defined in `FeedbackWidget.module.css`. CSS variables used:

- `--primary-action`: Main button color (default: #1a73e8)
- `--error`: Delete/error button color
- `--shadow-lg`: Box shadow for elevation
- `--border-radius-*`: Border radius variants
- `--space-*`: Spacing tokens
- `--font-ui`, `--font-display`: Font families
- `--text-primary`, `--text-secondary`: Text colors

### 2. Analytics Utility

**Location:** `/src/utils/analytics.ts`

A lightweight analytics tracking system that logs events to localStorage for development insights. No external dependencies or cloud services required.

#### Features

- **Event Tracking**: `track()` function to log user actions
- **Console Logging**: Events logged to console in development mode
- **localStorage Storage**: Events stored in browser storage
- **Event Limit**: Keeps most recent 500 events (configurable)
- **Query Functions**: Helper functions to retrieve and analyze event data
- **Export**: Export all events as JSON for analysis

#### Event Types

The system supports the following event types:

```typescript
type AnalyticsEventType =
  | 'block_created'
  | 'chord_added'
  | 'chord_deleted'
  | 'chord_duplicated'
  | 'playback_started'
  | 'playback_stopped'
  | 'analyze_started'
  | 'analyze_completed'
  | 'feedback_submitted'
  | 'feedback_type_selected'
  | 'key_changed'
  | 'mode_changed'
  | 'undo_performed'
  | 'redo_performed'
  | 'progression_saved'
  | 'progression_loaded';
```

#### Usage

Tracking an event:

```typescript
import { track } from '@/utils/analytics';

// Simple event
track('chord_added');

// Event with data
track('feedback_submitted', {
  type: 'bug',
  messageLength: 150
});

// Playback started with tempo
track('playback_started', {
  tempo: 120,
  chordCount: 8
});
```

#### Accessing Analytics

```typescript
import {
  getAnalytics,
  getAnalyticsByType,
  getEventCounts,
  exportAnalytics,
  clearAnalytics
} from '@/utils/analytics';

// Get all events
const events = getAnalytics();

// Get events of specific type
const chordEvents = getAnalyticsByType('chord_added');

// Get event counts by type
const counts = getEventCounts();
console.log('User added chords:', counts.chord_added);

// Export as JSON for external analysis
const jsonData = exportAnalytics();
console.log(jsonData);

// Clear all events
clearAnalytics();
```

#### Storage Details

- **Storage Key**: `neume_analytics_events`
- **Format**: JSON array of events
- **Max Events**: 500 (oldest events removed first)
- **Each Event**:
  ```typescript
  {
    type: 'event_name',
    timestamp: '2025-12-27T12:34:56.789Z',
    data?: { /* arbitrary event data */ }
  }
  ```

#### Browser Console Access

In the browser developer console:

```javascript
// Get all analytics
JSON.parse(localStorage.getItem('neume_analytics_events'))

// Get feedback
JSON.parse(localStorage.getItem('neume_feedback_items'))

// Download events as file
const data = JSON.stringify(JSON.parse(localStorage.getItem('neume_analytics_events')), null, 2);
const blob = new Blob([data], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'analytics-export.json';
a.click();
```

## Integration with Existing Code

### FeedbackWidget Integration

The FeedbackWidget is imported and rendered in `App.tsx`:

```tsx
import { FeedbackWidget } from '@/components/FeedbackWidget';

// In App component JSX (before closing div):
<FeedbackWidget />
```

### Analytics Tracking Examples

The analytics system can be integrated throughout the app:

```tsx
// In components that add chords
import { track } from '@/utils/analytics';

const handleAddChord = () => {
  // ... add chord logic
  track('chord_added', {
    scaleDegree: scaleDegree,
    quality: quality,
    key: currentKey
  });
};

// In playback hooks
const togglePlay = () => {
  track(isPlaying ? 'playback_stopped' : 'playback_started', {
    tempo: tempo,
    chordCount: chords.length
  });
};

// In modals
const handleAnalyze = () => {
  track('analyze_started', {
    sourceType: 'user_input'
  });
};
```

## Data Privacy & Security

- **No Cloud Transmission**: All data stored locally in browser only
- **No API Calls**: No external services or tracking servers
- **User Control**: Users can clear data by clearing browser storage
- **No Sensitive Data**: Avoid tracking passwords or personal information

## Development Workflow

### Testing Feedback Collection

1. Open the application in a browser
2. Click the chat bubble button (bottom-right)
3. Fill in feedback form
4. Click "Send Feedback"
5. Open DevTools console
6. Run: `JSON.parse(localStorage.getItem('neume_feedback_items'))`

### Testing Analytics

1. Perform various actions in the app (add chords, play, analyze, etc.)
2. Open DevTools console
3. Run: `JSON.parse(localStorage.getItem('neume_analytics_events'))`
4. Export and analyze: `copy(JSON.stringify(JSON.parse(localStorage.getItem('neume_analytics_events')), null, 2))`

### Clearing Data

```javascript
// Clear feedback
localStorage.removeItem('neume_feedback_items');

// Clear analytics
localStorage.removeItem('neume_analytics_events');

// Clear both
localStorage.clear();
```

## Future Enhancements

Potential improvements when moving to production:

1. **Backend Storage**: Replace localStorage with API calls to store data on server
2. **Cloud Analytics**: Integrate with services like Mixpanel, Segment, or custom backend
3. **Real-time Sync**: Sync events to server as they occur
4. **Advanced Reporting**: Create dashboards to visualize user behavior
5. **A/B Testing**: Track experiments and user cohorts
6. **Error Tracking**: Integrate with Sentry or similar error monitoring

## Files Created

- `/src/components/FeedbackWidget.tsx` - React component for feedback collection
- `/src/components/FeedbackWidget.module.css` - Styling for feedback modal
- `/src/utils/analytics.ts` - Analytics tracking utility
- `FEEDBACK-ANALYTICS-GUIDE.md` - This documentation

## Files Modified

- `/src/App.tsx` - Added FeedbackWidget import and component rendering
