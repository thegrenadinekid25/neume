/**
 * Performance monitoring and optimization utilities for Neume
 * Includes Web Vitals reporting, metrics logging, and operation timing
 */

/**
 * Web Vitals metrics interface
 */
interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType?: string;
}

/**
 * Reports Web Vitals metrics
 * Dynamically imports web-vitals library and logs metrics
 */
export async function reportWebVitals(onMetric?: (metric: WebVitalsMetric) => void) {
  // Only in production or when explicitly needed
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Dynamically import web-vitals to avoid bundling in dev
    const vitals = await import('web-vitals');

    // Set up listeners for all Web Vitals metrics
    vitals.onCLS((metric) => {
      if (onMetric) {
        onMetric(metric as WebVitalsMetric);
      } else {
        logMetric('CLS', metric.value, metric.rating);
      }
    });

    // Note: onFID was deprecated in web-vitals v4, replaced by onINP (below)

    vitals.onFCP((metric) => {
      if (onMetric) {
        onMetric(metric as WebVitalsMetric);
      } else {
        logMetric('FCP', metric.value, metric.rating);
      }
    });

    vitals.onLCP((metric) => {
      if (onMetric) {
        onMetric(metric as WebVitalsMetric);
      } else {
        logMetric('LCP', metric.value, metric.rating);
      }
    });

    vitals.onTTFB((metric) => {
      if (onMetric) {
        onMetric(metric as WebVitalsMetric);
      } else {
        logMetric('TTFB', metric.value, metric.rating);
      }
    });

    vitals.onINP((metric) => {
      if (onMetric) {
        onMetric(metric as WebVitalsMetric);
      } else {
        logMetric('INP', metric.value, metric.rating);
      }
    });
  } catch (error) {
    console.warn('Failed to load web-vitals:', error);
  }
}

/**
 * Logs performance metrics in development
 * Provides visual feedback with colored console output
 *
 * @param metricName - Name of the metric (e.g., 'LCP', 'FID')
 * @param value - Numeric value of the metric
 * @param rating - Performance rating ('good', 'needs-improvement', 'poor')
 */
export function logMetric(metricName: string, value: number, rating: 'good' | 'needs-improvement' | 'poor' = 'good') {
  if (process.env.NODE_ENV === 'development') {
    const isGood = rating === 'good';
    const color = isGood ? '#4CAF50' : rating === 'needs-improvement' ? '#FF9800' : '#F44336';
    const icon = isGood ? '✓' : rating === 'needs-improvement' ? '⚠' : '✗';

    console.log(
      `%c${icon} ${metricName}: ${value.toFixed(2)}ms (${rating})`,
      `color: ${color}; font-weight: bold; font-family: monospace;`
    );
  }
}

/**
 * Measures the execution time of an operation
 * Useful for profiling custom code sections
 *
 * @param operationName - Name of the operation being measured
 * @param operation - Async or sync function to measure
 * @returns The result of the operation
 *
 * @example
 * const result = await measureOperation('fetch-data', async () => {
 *   return await fetch('/api/data').then(r => r.json());
 * });
 */
export async function measureOperation<T>(
  operationName: string,
  operation: () => Promise<T> | T
): Promise<T> {
  const startTime = performance.now();
  const startMark = `${operationName}-start`;
  const endMark = `${operationName}-end`;
  const measureName = `${operationName}-duration`;

  try {
    // Mark the start of the operation
    if (typeof performance.mark === 'function') {
      performance.mark(startMark);
    }

    // Execute the operation
    const result = await Promise.resolve(operation());

    // Mark the end of the operation
    if (typeof performance.mark === 'function') {
      performance.mark(endMark);

      // Measure the duration
      if (typeof performance.measure === 'function') {
        performance.measure(measureName, startMark, endMark);
      }
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      logMetric(operationName, duration);
    }

    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (process.env.NODE_ENV === 'development') {
      console.error(`✗ ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
    }

    throw error;
  }
}

/**
 * Measures the execution time of a synchronous operation
 * More lightweight than measureOperation for simple code blocks
 *
 * @param operationName - Name of the operation
 * @param operation - Synchronous function to measure
 * @returns The result of the operation
 */
export function measureSyncOperation<T>(operationName: string, operation: () => T): T {
  const startTime = performance.now();

  try {
    const result = operation();
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (process.env.NODE_ENV === 'development') {
      logMetric(operationName, duration);
    }

    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (process.env.NODE_ENV === 'development') {
      console.error(`✗ ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
    }

    throw error;
  }
}

/**
 * Creates a performance observer for monitoring specific entry types
 * Useful for monitoring layout shifts, long tasks, etc.
 *
 * @param entryTypes - Types of entries to observe
 * @param callback - Function called when entries are observed
 * @returns An AbortController for stopping observation
 *
 * @example
 * const controller = observePerformance(['layout-shift'], (entries) => {
 *   console.log('Layout shift detected:', entries);
 * });
 *
 * // Stop observing
 * controller.abort();
 */
export function observePerformance(
  entryTypes: string[],
  callback: (entries: PerformanceEntryList) => void
): AbortController {
  const controller = new AbortController();

  if (typeof PerformanceObserver === 'undefined') {
    console.warn('PerformanceObserver not available');
    return controller;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      callback(list.getEntries());
    });

    observer.observe({ entryTypes, buffered: true });

    // Store the observer reference for cleanup
    (controller as any).observer = observer;
  } catch (error) {
    console.warn('Failed to create PerformanceObserver:', error);
  }

  return controller;
}

/**
 * Gets all performance metrics collected so far
 * Useful for analytics and debugging
 *
 * @returns Object containing all collected metrics
 */
export function getPerformanceMetrics() {
  if (typeof performance === 'undefined' || typeof performance.getEntriesByType === 'undefined') {
    return {};
  }

  return {
    navigationTiming: performance.getEntriesByType('navigation'),
    paintTiming: performance.getEntriesByType('paint'),
    resourceTiming: performance.getEntriesByType('resource'),
    longtasks: performance.getEntriesByType('longtask'),
    layoutShifts: performance.getEntriesByType('layout-shift'),
  };
}

/**
 * Clears all performance marks and measures
 * Useful when profiling specific sections
 */
export function clearPerformanceMarks() {
  if (typeof performance === 'undefined') return;

  if (typeof performance.clearMarks === 'function') {
    performance.clearMarks();
  }

  if (typeof performance.clearMeasures === 'function') {
    performance.clearMeasures();
  }
}
