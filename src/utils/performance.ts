/**
 * Performance monitoring utilities for tracking FPS and memory usage
 */

interface PerformanceMetrics {
  fps: number;
  memoryMB: number | null;
}

class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;

  /**
   * Get current FPS
   */
  getFPS(): number {
    return Math.round(this.fps);
  }

  /**
   * Update FPS calculation (call this every frame)
   */
  updateFPS(): void {
    this.frameCount++;
    const currentTime = performance.now();
    const delta = currentTime - this.lastTime;

    if (delta >= 1000) {
      // Update FPS every second
      this.fps = (this.frameCount * 1000) / delta;
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  /**
   * Get memory usage in MB (only works in Chrome/Edge)
   */
  getMemoryUsage(): number | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024);
    }
    return null;
  }

  /**
   * Get all performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return {
      fps: this.getFPS(),
      memoryMB: this.getMemoryUsage(),
    };
  }

  /**
   * Log metrics to console
   */
  logMetrics(): void {
    const metrics = this.getMetrics();
    console.log(`[Performance] FPS: ${metrics.fps} | Memory: ${metrics.memoryMB || 'N/A'} MB`);
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook to monitor performance
 */
export function usePerformanceMonitor(enabled = false) {
  if (!enabled) return;

  const intervalId = setInterval(() => {
    performanceMonitor.updateFPS();
    performanceMonitor.logMetrics();
  }, 1000);

  return () => clearInterval(intervalId);
}

/**
 * Debounce function for optimizing frequent calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait) as unknown as number;
  };
}

/**
 * Throttle function for limiting call frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
