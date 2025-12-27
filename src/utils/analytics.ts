// Analytics tracking utility for development insights
// Stores events in localStorage for review without cloud infrastructure

export type AnalyticsEventType =
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

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: string;
  data?: Record<string, unknown>;
}

const ANALYTICS_STORAGE_KEY = 'neume_analytics_events';
const MAX_STORED_EVENTS = 500;

/**
 * Track an analytics event
 * Logs to console in development and stores in localStorage
 */
export function track(eventType: AnalyticsEventType, data?: Record<string, unknown>): void {
  const event: AnalyticsEvent = {
    type: eventType,
    timestamp: new Date().toISOString(),
    data,
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('[Analytics]', event.type, event.data || '');
  }

  // Store in localStorage
  try {
    const existingEvents = getAnalytics();
    const updatedEvents = [...existingEvents, event];

    // Keep only the most recent events
    if (updatedEvents.length > MAX_STORED_EVENTS) {
      updatedEvents.splice(0, updatedEvents.length - MAX_STORED_EVENTS);
    }

    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(updatedEvents));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[Analytics] Failed to store event:', error);
    }
  }
}

/**
 * Retrieve all stored analytics events
 */
export function getAnalytics(): AnalyticsEvent[] {
  try {
    const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[Analytics] Failed to retrieve events:', error);
    }
    return [];
  }
}

/**
 * Clear all analytics events
 */
export function clearAnalytics(): void {
  try {
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[Analytics] Failed to clear events:', error);
    }
  }
}

/**
 * Get analytics events filtered by type
 */
export function getAnalyticsByType(type: AnalyticsEventType): AnalyticsEvent[] {
  return getAnalytics().filter(event => event.type === type);
}

/**
 * Get event counts by type (useful for insights)
 */
export function getEventCounts(): Record<AnalyticsEventType, number> {
  const events = getAnalytics();
  const counts: Record<string, number> = {};

  events.forEach(event => {
    counts[event.type] = (counts[event.type] || 0) + 1;
  });

  return counts as Record<AnalyticsEventType, number>;
}

/**
 * Export analytics as JSON for download
 */
export function exportAnalytics(): string {
  return JSON.stringify(getAnalytics(), null, 2);
}
