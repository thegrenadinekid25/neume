/**
 * Voicing Mode Toggle Component
 *
 * Allows switching between "Simple" (basic close-position voicing)
 * and "Voice-Led" (optimized voice-leading following common practice rules)
 */

import { SegmentedControl } from './SegmentedControl';
import type { VoicingMode } from '@/types/voicing';

interface VoicingModeToggleProps {
  value: VoicingMode;
  onChange: (mode: VoicingMode) => void;
}

export function VoicingModeToggle({ value, onChange }: VoicingModeToggleProps) {
  const options = [
    { value: 'simple', label: 'Simple' },
    { value: 'voice-led', label: 'Voice-Led' },
  ];

  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={(v) => onChange(v as VoicingMode)}
      aria-label="Voicing mode"
    />
  );
}
