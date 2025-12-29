import { SegmentedControl } from '@/components/UI/SegmentedControl';
import type { SoundType } from '@/types';
import styles from './SoundToggle.module.css';

interface SoundToggleProps {
  value: SoundType;
  onChange: (type: SoundType) => void;
}

export function SoundToggle({ value, onChange }: SoundToggleProps) {
  const options = [
    { value: 'piano', label: 'Piano' },
    { value: 'chime', label: 'Chime' },
  ];

  return (
    <div className={styles.container}>
      <SegmentedControl
        options={options}
        value={value}
        onChange={(v) => onChange(v as SoundType)}
      />
    </div>
  );
}
