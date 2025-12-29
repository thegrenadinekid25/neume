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

const VOICE_PAIRS: Record<VoicePart, VoicePart> = {
  soprano: 'alto',
  alto: 'soprano',
  tenor: 'bass',
  bass: 'tenor',
};

export const VoiceToggleBar: React.FC = () => {
  const voiceLines = useVoiceLineStore(s => s.voiceLines);
  const enableSingleVoice = useVoiceLineStore(s => s.enableSingleVoice);
  const setVoiceEnabled = useVoiceLineStore(s => s.setVoiceEnabled);
  const setAllVoicesEnabled = useVoiceLineStore(s => s.setAllVoicesEnabled);

  const allEnabled = ['soprano', 'alto', 'tenor', 'bass'].every(voice => voiceLines[voice as VoicePart]?.enabled ?? false);

  const handleVoiceClick = (voice: VoicePart, e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.shiftKey) {
      // Shift+click: toggle the pair
      const pair = VOICE_PAIRS[voice];
      const pairEnabled = voiceLines[pair]?.enabled ?? false;
      setVoiceEnabled(voice, !voiceLines[voice]?.enabled);
      setVoiceEnabled(pair, !pairEnabled);
    } else {
      // Default: radio behavior (only this voice enabled)
      enableSingleVoice(voice);
    }
  };

  const handleAllClick = () => {
    setAllVoicesEnabled(!allEnabled);
  };

  return (
    <div className={styles.toggleBar}>
      <button
        className={`${styles.allButton} ${allEnabled ? styles.active : ''}`}
        onClick={handleAllClick}
        title="Toggle all voices"
      >
        All
      </button>
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
            onClick={(e) => handleVoiceClick(voice, e)}
            title={`Click to enable only ${voice}. Shift+click to toggle ${voice} and ${VOICE_PAIRS[voice]} together.`}
          >
            {VOICE_LABELS[voice]}
          </button>
        );
      })}
    </div>
  );
};
