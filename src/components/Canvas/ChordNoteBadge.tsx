import type { ChordAnnotation } from '@/types';
import styles from './ChordNoteBadge.module.css';

interface ChordNoteBadgeProps {
  annotations: ChordAnnotation[];
  onClick: () => void;
  zoom?: number;
}

// Color mapping for annotation types
const TYPE_COLORS: Record<string, string> = {
  note: '#6b7280',      // Gray
  performance: '#8b5cf6', // Purple
  theory: '#3b82f6',    // Blue
  reference: '#10b981', // Green
};

export function ChordNoteBadge({ annotations, onClick, zoom = 1 }: ChordNoteBadgeProps) {
  if (annotations.length === 0) return null;

  // Get primary type (first annotation's type)
  const primaryType = annotations[0]?.type || 'note';
  const color = TYPE_COLORS[primaryType] || TYPE_COLORS.note;
  const count = annotations.length;

  return (
    <button
      className={styles.badge}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        backgroundColor: color,
        transform: `scale(${Math.max(0.8, zoom)})`,
      }}
      title={`${count} annotation${count > 1 ? 's' : ''}`}
    >
      {count > 1 ? count : '✎'}
    </button>
  );
}
