import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CANVAS_CONFIG } from '@/utils/constants';
import styles from './Canvas.module.css';
import { Playhead } from './Playhead';
import { TimelineRuler } from './TimelineRuler';
import { ChordContextMenu } from './ChordContextMenu';
import { PhraseBackgrounds } from './PhraseBackgrounds';
import type { ScaleDegree, MusicalKey, Mode } from '@/types';
import type { PhraseBoundary } from '@/types/progression';

interface CanvasProps {
  currentKey: MusicalKey;
  currentMode: Mode;
  beatsPerMeasure?: number;
  zoom?: number;
  isPlaying?: boolean;
  playheadPosition?: number;
  totalBeats?: number;
  phrases?: PhraseBoundary[];
  onCanvasClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onAddChord?: (scaleDegree: ScaleDegree, position: { x: number }, options?: { quality?: import('@/types').ChordQuality; extensions?: import('@/types').ChordExtensions }) => void;
  onZoomChange?: (zoom: number) => void;
  children?: React.ReactNode;
}

export const Canvas: React.FC<CanvasProps> = ({
  currentMode = 'major',
  beatsPerMeasure = 4,
  zoom = 1.0,
  isPlaying = false,
  playheadPosition = 0,
  totalBeats = 32,
  phrases = [],
  onCanvasClick,
  onAddChord,
  onZoomChange,
  children,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    clickX: number;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    clickX: 0,
  });

  // Panning state
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; scrollLeft: number } | null>(null);

  const trackWidth = totalBeats * CANVAS_CONFIG.GRID_BEAT_WIDTH * zoom;
  const hasChildren = React.Children.count(children) > 0;

  // Sync ruler scroll with timeline scroll
  useEffect(() => {
    const timeline = timelineRef.current;
    const ruler = rulerRef.current;
    if (!timeline || !ruler) return;

    const handleScroll = () => {
      ruler.scrollLeft = timeline.scrollLeft;
    };

    timeline.addEventListener('scroll', handleScroll);
    return () => timeline.removeEventListener('scroll', handleScroll);
  }, []);

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = timelineRef.current?.getBoundingClientRect();
    const clickX = rect ? e.clientX - rect.left : 0;

    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      clickX,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  };

  const handleAddChord = (
    scaleDegree: ScaleDegree,
    position: { x: number; y: number },
    options?: { quality?: import('@/types').ChordQuality; extensions?: import('@/types').ChordExtensions }
  ) => {
    if (onAddChord) {
      onAddChord(scaleDegree, { x: position.x }, options);
    }
  };

  // Native wheel handler - scroll wheel zooms, pinch gestures also zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onZoomChange) {
      // Pinch gestures have ctrlKey=true and smaller deltaY, mouse wheel has larger deltaY
      const sensitivity = e.ctrlKey ? 0.001 : 0.002;
      const delta = e.deltaY * -sensitivity;
      const newZoom = Math.min(2.0, Math.max(0.5, zoom + delta));
      onZoomChange(newZoom);
    }
  }, [zoom, onZoomChange]);

  // Use native event listener with { passive: false } to prevent browser zoom
  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    timeline.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      timeline.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Panning handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only pan if clicking directly on the timeline (not on a chord)
    const target = e.target as HTMLElement;
    if (target.closest('[data-chord="true"]')) return;

    // Only left mouse button
    if (e.button !== 0) return;

    const timeline = timelineRef.current;
    if (!timeline) return;

    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      scrollLeft: timeline.scrollLeft,
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning || !panStartRef.current || !timelineRef.current) return;

    const dx = e.clientX - panStartRef.current.x;
    timelineRef.current.scrollLeft = panStartRef.current.scrollLeft - dx;
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    panStartRef.current = null;
  }, []);

  // Add global mouse move/up listeners for panning
  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, handleMouseMove, handleMouseUp]);

  // Generate measure and beat dividers
  const dividers = [];
  const beatWidth = CANVAS_CONFIG.GRID_BEAT_WIDTH * zoom;
  const measureWidth = beatsPerMeasure * beatWidth;
  const numMeasures = Math.ceil(totalBeats / beatsPerMeasure);

  // Scaled heights
  const chordAreaHeight = 80 * zoom;
  const trackHeight = 20 * zoom;
  const trackRailHeight = 4 * zoom;

  for (let measure = 0; measure < numMeasures; measure++) {
    // Add beat dividers within each measure (skip first beat of measure)
    for (let beat = 1; beat < beatsPerMeasure; beat++) {
      const beatPosition = measure * measureWidth + beat * beatWidth;
      dividers.push(
        <div
          key={`beat-${measure}-${beat}`}
          className={styles.beatDivider}
          style={{ left: beatPosition, height: chordAreaHeight * 0.4 }}
        />
      );
    }

    // Add measure divider (skip first measure)
    if (measure > 0) {
      dividers.push(
        <div
          key={`measure-${measure}`}
          className={styles.measureDivider}
          style={{ left: measure * measureWidth }}
        />
      );
    }
  }

  return (
    <div className={styles.container}>
      {/* Fixed ruler at top - syncs scroll with timeline */}
      <div ref={rulerRef} className={styles.rulerWrapper}>
        <div style={{ width: trackWidth }}>
          <TimelineRuler
            totalBeats={totalBeats}
            zoom={zoom}
            beatWidth={CANVAS_CONFIG.GRID_BEAT_WIDTH}
            beatsPerMeasure={beatsPerMeasure}
          />
        </div>
      </div>

      {/* Main timeline area */}
      <div
        ref={timelineRef}
        className={styles.timeline}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
        onClick={onCanvasClick}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
      >
        <div className={styles.trackContainer} style={{ width: trackWidth }}>
          {/* Measure and beat dividers */}
          {dividers}

          {/* Chord area - chords sit here */}
          <div className={styles.chordArea} style={{ height: chordAreaHeight }}>
            {/* Phrase background boxes */}
            <PhraseBackgrounds phrases={phrases} zoom={zoom} />

            {children}

            {/* Empty state */}
            {!hasChildren && (
              <div className={styles.emptyState}>
                Right-click to add chords
              </div>
            )}
          </div>

          {/* The track/rail that chords sit on */}
          <div className={styles.track} style={{ height: trackHeight }}>
            <div className={styles.trackStart} style={{ height: trackHeight }} />
            <div className={styles.trackRail} style={{ height: trackRailHeight }} />
            <div className={styles.trackEnd} style={{ height: trackHeight }} />
          </div>

          {/* Playhead */}
          {isPlaying && (
            <Playhead
              position={playheadPosition * CANVAS_CONFIG.GRID_BEAT_WIDTH * zoom}
            />
          )}
        </div>
      </div>

      {/* Context menu for adding chords */}
      <ChordContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        currentMode={currentMode}
        onClose={handleCloseContextMenu}
        onAddChord={handleAddChord}
      />
    </div>
  );
};
