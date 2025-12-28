import React from 'react';
import { useVoiceLineStore } from '@/store/voice-line-store';
import type { VoicePart } from '@/types';
import styles from './VoiceToggleBar.module.css';

const VOICE_LABELS: Record<VoicePart, string> = {
  soprano: 'S',
  alto: 'A',
  tenor: 'T',
  bass: 'B',
};

const VOICE_COLORS: Record<VoicePart, string> = {
  soprano: '#E8A03E',
  alto: '#E85D3D',
  tenor: '#6B9080',
  bass: '#4A6FA5',
};

export const VoiceToggleBar: React.FC = () => {
  const voiceLines = useVoiceLineStore(s => s.voiceLines);
  const toggleVoiceEnabled = useVoiceLineStore(s => s.toggleVoiceEnabled);

  return (
    <div className={styles.toggleBar}>
      {(['soprano', 'alto', 'tenor', 'bass'] as const).map(voice => {
        const isEnabled = voiceLines[voice]?.enabled ?? false;
        return (
          <button
            key={voice}
            className={`${styles.toggleButton} ${isEnabled ? styles.active : ''}`}
            style={{
              backgroundColor: isEnabled ? VOICE_COLORS[voice] : 'transparent',
              borderColor: VOICE_COLORS[voice],
              color: isEnabled ? 'white' : VOICE_COLORS[voice],
            }}
            onClick={() => toggleVoiceEnabled(voice)}
            title={`Toggle ${voice} voice`}
          >
            {VOICE_LABELS[voice]}
          </button>
        );
      })}
    </div>
  );
};
