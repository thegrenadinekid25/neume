/**
 * SyllableDisplay Component
 *
 * Displays syllables beneath notes in the composition canvas.
 * Supports inline editing and melisma connectors.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { VoicePart } from '@/types/voice-line';
import type { SyllableAssignment } from '@/types/text-setting';
import { useTextSettingStore } from '@/store/text-setting-store';
import styles from './SyllableDisplay.module.css';

interface SyllableDisplayProps {
  voice: VoicePart;
  noteId: string;
  x: number;
  y: number;
  isSelected?: boolean;
}

export function SyllableDisplay({
  voice,
  noteId,
  x,
  y,
  isSelected = false,
}: SyllableDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    getAssignmentForNote,
    updateSyllableAssignment,
    toggleMelisma,
    editingSyllableNoteId,
    startEditingSyllable,
    stopEditingSyllable,
  } = useTextSettingStore();

  const assignment = getAssignmentForNote(voice, noteId);

  // Start editing when this note's syllable is selected for editing
  useEffect(() => {
    if (editingSyllableNoteId === noteId) {
      setIsEditing(true);
      setEditValue(assignment?.text || '');
    } else {
      setIsEditing(false);
    }
  }, [editingSyllableNoteId, noteId, assignment?.text]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(() => {
    startEditingSyllable(noteId);
  }, [noteId, startEditingSyllable]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        updateSyllableAssignment(voice, noteId, editValue);
        stopEditingSyllable();
      } else if (e.key === 'Escape') {
        stopEditingSyllable();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        updateSyllableAssignment(voice, noteId, editValue);
        // TODO: Move to next note's syllable
        stopEditingSyllable();
      }
    },
    [voice, noteId, editValue, updateSyllableAssignment, stopEditingSyllable]
  );

  const handleBlur = useCallback(() => {
    if (isEditing) {
      updateSyllableAssignment(voice, noteId, editValue);
      stopEditingSyllable();
    }
  }, [isEditing, voice, noteId, editValue, updateSyllableAssignment, stopEditingSyllable]);

  const handleMelismaToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleMelisma(voice, noteId);
    },
    [voice, noteId, toggleMelisma]
  );

  if (!assignment && !isEditing) {
    return null;
  }

  const displayText = assignment?.isMelisma
    ? '\u2014' // em-dash for melisma
    : assignment?.text || '';

  return (
    <g className={styles.container} transform={`translate(${x}, ${y})`}>
      {isEditing ? (
        <foreignObject x={-40} y={0} width={80} height={24}>
          <input
            ref={inputRef}
            type="text"
            className={styles.editInput}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />
        </foreignObject>
      ) : (
        <motion.g
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          <text
            className={`${styles.syllableText} ${assignment?.isMelisma ? styles.melisma : ''} ${isSelected ? styles.selected : ''}`}
            textAnchor="middle"
            dominantBaseline="hanging"
            onDoubleClick={handleDoubleClick}
          >
            {displayText}
          </text>
          {/* Melisma toggle indicator */}
          {assignment && !assignment.isMelisma && (
            <circle
              className={styles.melismaToggle}
              cx={25}
              cy={6}
              r={4}
              onClick={handleMelismaToggle}
            />
          )}
        </motion.g>
      )}
    </g>
  );
}

/**
 * MelismaLine Component
 *
 * Draws a line connecting melismatic syllables.
 */

interface MelismaLineProps {
  x1: number;
  x2: number;
  y: number;
}

export function MelismaLine({ x1, x2, y }: MelismaLineProps) {
  return (
    <line
      className={styles.melismaLine}
      x1={x1}
      y1={y}
      x2={x2}
      y2={y}
    />
  );
}

/**
 * SyllableRow Component
 *
 * Container for all syllables in a voice line.
 */

interface SyllableRowProps {
  voice: VoicePart;
  assignments: SyllableAssignment[];
  notePositions: Map<string, { x: number; y: number }>;
  baseY: number;
}

export function SyllableRow({
  voice,
  assignments,
  notePositions,
  baseY,
}: SyllableRowProps) {
  const melismaLines: MelismaLineProps[] = [];

  // Find melisma connections
  for (let i = 1; i < assignments.length; i++) {
    const current = assignments[i];
    const previous = assignments[i - 1];

    if (current.isMelisma && previous) {
      const prevPos = notePositions.get(previous.noteId);
      const currPos = notePositions.get(current.noteId);

      if (prevPos && currPos) {
        melismaLines.push({
          x1: prevPos.x + 20,
          x2: currPos.x - 20,
          y: baseY + 8,
        });
      }
    }
  }

  return (
    <g className={styles.syllableRow}>
      {/* Melisma lines */}
      {melismaLines.map((line, idx) => (
        <MelismaLine key={`melisma-${idx}`} {...line} />
      ))}

      {/* Syllable displays */}
      {assignments.map((assignment) => {
        const pos = notePositions.get(assignment.noteId);
        if (!pos) return null;

        return (
          <SyllableDisplay
            key={assignment.noteId}
            voice={voice}
            noteId={assignment.noteId}
            x={pos.x}
            y={baseY}
          />
        );
      })}
    </g>
  );
}
