import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Note } from 'tonal';
import type { MelodicNote, VoicePart } from '@/types';
import { useTextSettingStore } from '@/store/text-setting-store';
import { useVoiceLineStore } from '@/store/voice-line-store';
import { ContextMenu, type ContextMenuItem } from '@/components/UI/ContextMenu';
import styles from './NoteDot.module.css';

interface NoteDotProps {
  note: MelodicNote;
  x: number;
  y: number;
  color: string;
  isSelected: boolean;
  isPlaying: boolean;
  voicePart: VoicePart;
  laneHeight: number;
  onSelect: (id: string, multiSelect: boolean) => void;
  onDrag: (id: string, newY: number) => void;
  onDragEnd: (id: string, finalY: number) => void;
  onConflictDragStart?: (noteId: string, note: MelodicNote, event: React.MouseEvent<HTMLDivElement>) => void;
}

const LANE_PADDING = 8;

export const NoteDot: React.FC<NoteDotProps> = ({
  note,
  x,
  y,
  color,
  isSelected,
  isPlaying,
  voicePart,
  laneHeight,
  onSelect,
  onDrag: _onDrag,
  onDragEnd,
  onConflictDragStart,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingLyric, setIsEditingLyric] = useState(false);
  const [lyricInput, setLyricInput] = useState(note.text || '');
  const dragOffsetRef = useRef(0); // Track cumulative drag offset
  const justDraggedRef = useRef(false); // Prevent click after drag
  const lyricInputRef = useRef<HTMLInputElement>(null);

  // Get syllable assignment from text-setting store
  const getAssignmentForNote = useTextSettingStore((state) => state.getAssignmentForNote);
  const syllableAssignment = getAssignmentForNote(voicePart, note.id);

  // Get store actions for note manipulation
  const updateNote = useVoiceLineStore((state) => state.updateNote);
  const deleteNote = useVoiceLineStore((state) => state.deleteNote);

  // Context menu state
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditingLyric && lyricInputRef.current) {
      lyricInputRef.current.focus();
      lyricInputRef.current.select();
    }
  }, [isEditingLyric]);

  // Sync lyricInput with note.text when it changes externally
  useEffect(() => {
    if (!isEditingLyric) {
      setLyricInput(note.text || '');
    }
  }, [note.text, isEditingLyric]);

  // Calculate Y constraints based on lane height
  const constraints = useMemo(() => {
    const minY = LANE_PADDING; // Top of usable area
    const maxY = laneHeight - LANE_PADDING; // Bottom of usable area
    return { minY, maxY };
  }, [laneHeight]);

  // Get pitch name from MIDI
  const pitchName = note.pitch || Note.fromMidi(note.midi) || 'C4';

  const handleDragStart = (event: any) => {
    setIsDragging(true);
    dragOffsetRef.current = 0;
    justDraggedRef.current = false;
    // Call conflict detection hook's drag start
    if (onConflictDragStart) {
      onConflictDragStart(note.id, note, event as React.MouseEvent<HTMLDivElement>);
    }
  };

  const handleDrag = (_event: any, info: any) => {
    // Track the offset but don't update store during drag
    // info.offset.y gives total offset from drag start
    dragOffsetRef.current = info.offset.y;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    justDraggedRef.current = true;
    // Calculate final Y position and update store
    const finalY = Math.max(constraints.minY, Math.min(constraints.maxY, y + dragOffsetRef.current));
    onDragEnd(note.id, finalY);
    dragOffsetRef.current = 0;
    // Reset the flag after a short delay to allow click event to be ignored
    setTimeout(() => {
      justDraggedRef.current = false;
    }, 100);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Ignore click if we just finished dragging
    if (justDraggedRef.current) return;

    const multiSelect = e.metaKey || e.ctrlKey || e.shiftKey;
    onSelect(note.id, multiSelect);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  };

  // Context menu items for note manipulation
  const contextMenuItems: ContextMenuItem[] = useMemo(() => {
    const currentAccidental = note.accidental;

    return [
      // Accidental options
      {
        id: 'accidental-natural',
        label: currentAccidental === null ? '✓ Natural' : 'Natural',
        action: () => {
          updateNote(voicePart, note.id, { accidental: null });
          setContextMenuOpen(false);
        },
      },
      {
        id: 'accidental-sharp',
        label: currentAccidental === 'sharp' ? '✓ Sharp (♯)' : 'Sharp (♯)',
        action: () => {
          updateNote(voicePart, note.id, { accidental: 'sharp' });
          setContextMenuOpen(false);
        },
      },
      {
        id: 'accidental-flat',
        label: currentAccidental === 'flat' ? '✓ Flat (♭)' : 'Flat (♭)',
        action: () => {
          updateNote(voicePart, note.id, { accidental: 'flat' });
          setContextMenuOpen(false);
        },
      },
      { id: 'divider-1', label: '', divider: true },
      // Rest toggle
      {
        id: 'toggle-rest',
        label: note.isRest ? 'Make Note' : 'Make Rest',
        action: () => {
          updateNote(voicePart, note.id, { isRest: !note.isRest });
          setContextMenuOpen(false);
        },
      },
      { id: 'divider-2', label: '', divider: true },
      // Delete
      {
        id: 'delete-note',
        label: 'Delete Note',
        action: () => {
          deleteNote(voicePart, note.id);
          setContextMenuOpen(false);
        },
      },
    ];
  }, [note.accidental, note.isRest, note.id, voicePart, updateNote, deleteNote]);

  // Double-click to edit lyric inline
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditingLyric(true);
  };

  // Save lyric on blur or Enter
  const handleLyricBlur = () => {
    setIsEditingLyric(false);
    if (lyricInput !== (note.text || '')) {
      updateNote(voicePart, note.id, { text: lyricInput || undefined });
    }
  };

  const handleLyricKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLyricBlur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setLyricInput(note.text || '');
      setIsEditingLyric(false);
    } else if (e.key === 'Tab') {
      // Allow Tab to move to next note's lyric (future enhancement)
      handleLyricBlur();
    }
  };

  // Determine visual state classes for wrapper
  const wrapperClasses = [
    styles.noteDotWrapper,
    isDragging && styles.dragging,
  ]
    .filter(Boolean)
    .join(' ');

  // NCT abbreviations for badge display
  const NCT_ABBREVIATIONS: Record<string, string> = {
    passing: 'p',
    neighbor: 'n',
    suspension: 's',
    anticipation: 'ant',
    escape: 'e',
    appoggiatura: 'app',
    pedal: 'ped',
    retardation: 'ret',
  };

  // Determine chord tone status - default to hollow (false) if not analyzed
  const isChordTone = note.analysis?.isChordTone ?? false;
  const nctType = note.analysis?.nonChordToneType;
  const nctAbbrev = nctType ? NCT_ABBREVIATIONS[nctType] : null;

  // Determine visual state classes for inner dot
  const dotClasses = [
    styles.noteDot,
    isSelected && styles.selected,
    isPlaying && styles.playing,
    note.accidental === 'sharp' && styles.sharp,
    note.accidental === 'flat' && styles.flat,
    isChordTone && styles.chordTone,
    !isChordTone && styles.nonChordTone,
  ]
    .filter(Boolean)
    .join(' ');

  // Use a key that includes midi to force remount after drag updates position
  // This resets Framer Motion's internal transform state
  const motionKey = `${note.id}-${note.midi}`;

  return (
    <motion.div
      key={motionKey}
      className={wrapperClasses}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        color: color, // Used by currentColor for border
      }}
      drag="y"
      dragConstraints={{
        top: constraints.minY - y,
        bottom: constraints.maxY - y,
      }}
      dragElastic={0}
      dragMomentum={false}
      onDragStart={() => {
        // Create a synthetic event-like object for motion's onDragStart
        handleDragStart({ clientX: 0, clientY: 0 });
      }}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      role="button"
      tabIndex={0}
      aria-label={`Note ${pitchName} at beat ${note.startBeat}`}
    >
      <motion.div
        className={dotClasses}
        whileDrag={{ scale: 1.3 }}
        animate={{
          scale: isPlaying ? 1.2 : 1,
        }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 300,
        }}
      />
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className={styles.tooltip}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {pitchName}
          </motion.div>
        )}
      </AnimatePresence>
      {/* NCT type badge */}
      {nctAbbrev && (
        <div className={styles.nctBadge}>{nctAbbrev}</div>
      )}
      {/* Lyric/syllable text - inline editable */}
      {isEditingLyric ? (
        <input
          ref={lyricInputRef}
          type="text"
          className={styles.lyricInput}
          value={lyricInput}
          onChange={(e) => setLyricInput(e.target.value)}
          onBlur={handleLyricBlur}
          onKeyDown={handleLyricKeyDown}
          onClick={(e) => e.stopPropagation()}
          placeholder="lyric"
        />
      ) : (note.text || syllableAssignment?.text) ? (
        <div className={styles.lyricText}>
          {syllableAssignment?.isMelisma ? '\u2014' : (syllableAssignment?.text || note.text)}
        </div>
      ) : null}
      {/* Note context menu */}
      <ContextMenu
        isOpen={contextMenuOpen}
        position={contextMenuPosition}
        items={contextMenuItems}
        onClose={() => setContextMenuOpen(false)}
      />
    </motion.div>
  );
};
