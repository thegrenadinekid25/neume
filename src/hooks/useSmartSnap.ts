import { useState, useCallback, useRef, useEffect } from 'react';
import type { SnapResolution } from '@/types/voice-line';

/**
 * Smart Snap Hook
 *
 * Combines zoom-based baseline snap with hold-to-refine behavior.
 * - Zoom level determines the default snap resolution
 * - Holding while dragging progressively refines the snap
 */

// Snap levels from coarse to fine
const SNAP_LEVELS: SnapResolution[] = [1, 0.5, 0.25, 0.125, 0];

// Time thresholds for hold-to-refine (in ms)
const HOLD_THRESHOLDS = [0, 400, 800, 1200, 1600]; // Each level after 400ms

interface UseSmartSnapOptions {
  zoom: number;
  enabled?: boolean;
}

interface UseSmartSnapReturn {
  /** Current effective snap resolution */
  snapResolution: SnapResolution;
  /** Start tracking hold time (call on drag start) */
  startHold: () => void;
  /** Stop tracking hold time (call on drag end) */
  endHold: () => void;
  /** Whether currently holding/dragging */
  isHolding: boolean;
  /** Current refinement level (0-4) */
  refinementLevel: number;
  /** Baseline snap from zoom (before hold refinement) */
  baselineSnap: SnapResolution;
}

/**
 * Get baseline snap resolution based on zoom level
 * - Zoomed out (< 0.5): Beat snap (1)
 * - Normal (0.5 - 1.5): Half-beat snap (0.5)
 * - Zoomed in (> 1.5): Quarter-beat snap (0.25)
 */
function getBaselineSnapFromZoom(zoom: number): SnapResolution {
  if (zoom < 0.5) return 1;      // Very zoomed out → coarse
  if (zoom < 1.0) return 0.5;    // Somewhat zoomed out → half-beat
  if (zoom < 1.5) return 0.25;   // Normal → quarter-beat
  if (zoom < 2.0) return 0.125;  // Zoomed in → 16th
  return 0.125;                   // Very zoomed in → 16th (can refine to free)
}

/**
 * Get snap level index for a given resolution
 */
function getSnapLevelIndex(resolution: SnapResolution): number {
  const index = SNAP_LEVELS.indexOf(resolution);
  return index >= 0 ? index : 0;
}

export function useSmartSnap({ zoom, enabled = true }: UseSmartSnapOptions): UseSmartSnapReturn {
  const [isHolding, setIsHolding] = useState(false);
  const [refinementLevel, setRefinementLevel] = useState(0);
  const holdStartTime = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Calculate baseline from zoom
  const baselineSnap = getBaselineSnapFromZoom(zoom);
  const baselineIndex = getSnapLevelIndex(baselineSnap);

  // Update refinement level while holding
  const updateRefinement = useCallback(() => {
    if (!holdStartTime.current) return;

    const elapsed = Date.now() - holdStartTime.current;

    // Find which threshold we've passed
    let level = 0;
    for (let i = HOLD_THRESHOLDS.length - 1; i >= 0; i--) {
      if (elapsed >= HOLD_THRESHOLDS[i]) {
        level = i;
        break;
      }
    }

    setRefinementLevel(level);

    // Continue animation if still holding
    if (isHolding) {
      animationFrameRef.current = requestAnimationFrame(updateRefinement);
    }
  }, [isHolding]);

  // Start hold tracking
  const startHold = useCallback(() => {
    if (!enabled) return;

    holdStartTime.current = Date.now();
    setIsHolding(true);
    setRefinementLevel(0);

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(updateRefinement);
  }, [enabled, updateRefinement]);

  // End hold tracking
  const endHold = useCallback(() => {
    setIsHolding(false);
    setRefinementLevel(0);
    holdStartTime.current = null;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Calculate effective snap resolution
  // Start from baseline, then refine based on hold duration
  const effectiveIndex = Math.min(baselineIndex + refinementLevel, SNAP_LEVELS.length - 1);
  const snapResolution = enabled ? SNAP_LEVELS[effectiveIndex] : baselineSnap;

  return {
    snapResolution,
    startHold,
    endHold,
    isHolding,
    refinementLevel,
    baselineSnap,
  };
}
