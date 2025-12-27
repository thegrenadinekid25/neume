import { memo } from 'react';
import type { Chord } from '@/types';
import type { NecklaceSettings, VoicePart } from '@/types/necklace';
import { MelodicNecklace } from './MelodicNecklace';
import styles from './MelodicNecklaces.module.css';

interface MelodicNecklacesProps {
  chords: Chord[];
  settings: NecklaceSettings;
  containerHeight: number;
  zoom: number;
}

const VOICE_ORDER: VoicePart[] = ['bass', 'tenor', 'alto', 'soprano'];

export const MelodicNecklaces = memo(function MelodicNecklaces({
  chords,
  settings,
  containerHeight,
  zoom,
}: MelodicNecklacesProps) {
  if (!settings.visible || chords.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {VOICE_ORDER.map((voice) => {
        const voiceConfig = settings.voices[voice];
        if (!voiceConfig.enabled) return null;

        return (
          <MelodicNecklace
            key={voice}
            chords={chords}
            voice={voice}
            color={voiceConfig.color}
            opacity={voiceConfig.opacity}
            containerHeight={containerHeight}
            zoom={zoom}
            showDots={settings.showDots}
            showLines={settings.showLines}
            dotSize={settings.dotSize}
            lineWidth={settings.lineWidth}
            animate={settings.animateOnChange}
          />
        );
      })}
    </div>
  );
});
