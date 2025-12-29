import React from 'react';
import type { VoicePart } from '@/types';
import { VOICE_ORDER, VOICE_RANGES } from '@/data/voice-ranges';
import { useVoiceLineStore } from '@/store/voice-line-store';
import styles from './VoiceLegend.module.css';

interface VoiceLegendProps {
  onVoiceClick?: (voicePart: VoicePart) => void;
}

export const VoiceLegend: React.FC<VoiceLegendProps> = ({ onVoiceClick }) => {
  const voiceLines = useVoiceLineStore((state) => state.voiceLines);
  const activeVoicePart = useVoiceLineStore((state) => state.activeVoicePart);
  const setActiveVoice = useVoiceLineStore((state) => state.setActiveVoice);

  const enabledVoices = VOICE_ORDER.filter((part) => voiceLines[part].enabled);

  const handleClick = (voicePart: VoicePart) => {
    setActiveVoice(voicePart);
    onVoiceClick?.(voicePart);
  };

  return (
    <div className={styles.voiceLegend}>
      {enabledVoices.map((voicePart) => {
        const range = VOICE_RANGES[voicePart];
        const isActive = voicePart === activeVoicePart;

        return (
          <button
            key={voicePart}
            className={`${styles.legendItem} ${isActive ? styles.active : ''}`}
            onClick={() => handleClick(voicePart)}
            title={`Click to set ${range.label} as active voice for adding notes`}
          >
            <span
              className={styles.legendDot}
              style={{ backgroundColor: range.color }}
            />
            <span
              className={styles.legendLabel}
              style={{ color: isActive ? range.color : undefined }}
            >
              {range.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
