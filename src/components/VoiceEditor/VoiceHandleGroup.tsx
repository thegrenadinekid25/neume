import { useMemo } from 'react';
import type { Voices } from '@/types/chord';
import type { VoiceType, VoiceLeadingIssue } from '@/services/voice-leading-analyzer';
import { VoiceHandle, midiToNoteName } from './VoiceHandle';
import styles from './VoiceHandleGroup.module.css';

// Note name to MIDI conversion
const NOTE_SEMITONES: Record<string, number> = {
  'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11,
};

function noteToMidi(note: string): number {
  if (!note) return 60;
  const match = note.match(/^([A-Ga-g])([#b]?)(-?\d+)$/);
  if (!match) return 60;
  const [, baseName, accidental, octaveStr] = match;
  let semitone = NOTE_SEMITONES[baseName.toUpperCase()] ?? 0;
  if (accidental === '#') semitone += 1;
  if (accidental === 'b') semitone -= 1;
  return (parseInt(octaveStr, 10) + 1) * 12 + semitone;
}

interface VoiceHandleGroupProps {
  voices: Voices;
  issues: VoiceLeadingIssue[];
  activeVoice: VoiceType | null;
  onDragStart: (voice: VoiceType, midi: number) => void;
  onDrag: (voice: VoiceType, midi: number, noteName: string) => void;
  onDragEnd: () => void;
}

const VOICE_ORDER: VoiceType[] = ['soprano', 'alto', 'tenor', 'bass'];
const CONTAINER_HEIGHT = 180;

export function VoiceHandleGroup({
  voices,
  issues,
  activeVoice,
  onDragStart,
  onDrag,
  onDragEnd,
}: VoiceHandleGroupProps) {
  // Check which voices have issues
  const voiceIssues = useMemo(() => {
    const result: Record<VoiceType, { hasError: boolean; hasWarning: boolean }> = {
      soprano: { hasError: false, hasWarning: false },
      alto: { hasError: false, hasWarning: false },
      tenor: { hasError: false, hasWarning: false },
      bass: { hasError: false, hasWarning: false },
    };

    for (const issue of issues) {
      if (issue.voicePair) {
        for (const voice of issue.voicePair) {
          if (issue.severity === 'error') {
            result[voice].hasError = true;
          } else if (issue.severity === 'warning') {
            result[voice].hasWarning = true;
          }
        }
      }
      if (issue.voice) {
        if (issue.severity === 'error') {
          result[issue.voice].hasError = true;
        } else if (issue.severity === 'warning') {
          result[issue.voice].hasWarning = true;
        }
      }
    }

    return result;
  }, [issues]);

  return (
    <div className={styles.container}>
      <div className={styles.handles}>
        {VOICE_ORDER.map((voice) => {
          const note = voices[voice];
          if (!note) return null;

          const midi = noteToMidi(note);
          const { hasError, hasWarning } = voiceIssues[voice];

          return (
            <VoiceHandle
              key={voice}
              voice={voice}
              currentMidi={midi}
              containerHeight={CONTAINER_HEIGHT}
              isActive={activeVoice === voice}
              hasError={hasError}
              hasWarning={hasWarning}
              onDragStart={onDragStart}
              onDrag={(newMidi) => {
                const newNote = midiToNoteName(newMidi);
                onDrag(voice, newMidi, newNote);
              }}
              onDragEnd={onDragEnd}
            />
          );
        })}
      </div>

      {issues.length > 0 && (
        <div className={styles.issuesList}>
          {issues.map((issue, i) => (
            <div
              key={i}
              className={`${styles.issue} ${issue.severity === 'error' ? styles.error : styles.warning}`}
            >
              {issue.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
