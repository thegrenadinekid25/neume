import { SCALE_DEGREE_TO_PATTERN } from '@/types/accessibility';

export function getPatternId(scaleDegree: number): string {
  const pattern = SCALE_DEGREE_TO_PATTERN[scaleDegree] || 'solid';
  return `pattern-${pattern}`;
}
