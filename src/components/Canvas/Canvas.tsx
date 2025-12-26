import React, { useRef, useEffect, useState } from 'react';
import { CANVAS_CONFIG } from '@/utils/constants';
import { Chord } from '@types';
import styles from './Canvas.module.css';
import { Playhead } from './Playhead';
import { TimelineRuler } from './TimelineRuler';
import { Grid } from './Grid';
import { WatercolorBackground } from './WatercolorBackground';
import { ChordContextMenu } from './ChordContextMenu';

interface CanvasProps {
  currentKey: string;
  currentMode: 'major' | 'minor';
  zoom?: number;
  isPlaying?: boolean;
  playheadPosition?: number; // In beats
  totalBeats?: number;
  onCanvasClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onAddChord?: (chord: Chord) => void;
  children?: React.ReactNode;
}

export const Canvas: React.FC<CanvasProps> = ({
  currentKey = 'C',
  currentMode = 'major',
  zoom = 1.0,
  isPlaying = false,
  playheadPosition = 0,
  totalBeats = 32, // Default to 8 measures in 4/4
  onCanvasClick,
  onAddChord,
  children,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
  }>({ isOpen: false, position: { x: 0, y: 0 } });

  // Calculate canvas width based on total beats and zoom
  useEffect(() => {
    const width = totalBeats * CANVAS_CONFIG.GRID_BEAT_WIDTH * zoom;
    setCanvasWidth(width);
  }, [totalBeats, zoom]);

  // Handle right-click (context menu)
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ ...contextMenu, isOpen: false });
  };

  const handleAddChord = (chord: Chord) => {
    onAddChord?.(chord);
  };

  return (
    <div className={styles.canvasContainer}>
      {/* Timeline Ruler */}
      <TimelineRuler
        totalBeats={totalBeats}
        zoom={zoom}
        beatWidth={CANVAS_CONFIG.GRID_BEAT_WIDTH}
      />

      {/* Main Canvas */}
      <div
        ref={canvasRef}
        className={styles.canvas}
        onClick={onCanvasClick}
        onContextMenu={handleContextMenu}
      >
        {/* Watercolor Background */}
        <WatercolorBackground
          currentKey={currentKey}
          currentMode={currentMode}
        />

        {/* Background Grid */}
        <Grid
          width={canvasWidth}
          height={600}
          beatWidth={CANVAS_CONFIG.GRID_BEAT_WIDTH * zoom}
          beatsPerMeasure={4}
        />

        {/* Playhead */}
        {isPlaying && (
          <Playhead
            position={playheadPosition * CANVAS_CONFIG.GRID_BEAT_WIDTH * zoom}
          />
        )}

        {/* Chord shapes will render here as children */}
        <div className={styles.chordLayer}>
          {children}
        </div>

        {/* Empty State */}
        {!children && (
          <div className={styles.emptyState}>
            <p>Right-click anywhere to add a chord</p>
            <div className={styles.emptyStateArrow}>↗</div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      <ChordContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        currentKey={currentKey}
        currentMode={currentMode}
        onClose={handleCloseContextMenu}
        onAddChord={handleAddChord}
        canvasScrollLeft={canvasRef.current?.scrollLeft || 0}
        beatWidth={CANVAS_CONFIG.GRID_BEAT_WIDTH * zoom}
      />
    </div>
  );
};
