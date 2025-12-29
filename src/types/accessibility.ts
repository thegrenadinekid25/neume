export type ScaleDegreePattern =
  | 'solid'
  | 'horizontal'
  | 'vertical'
  | 'diagonalUp'
  | 'diagonalDown'
  | 'dots'
  | 'crosshatch';

export const SCALE_DEGREE_TO_PATTERN: Record<number, ScaleDegreePattern> = {
  1: 'solid',
  2: 'horizontal',
  3: 'vertical',
  4: 'diagonalUp',
  5: 'diagonalDown',
  6: 'dots',
  7: 'crosshatch',
};

export const PATTERN_DESCRIPTIONS: Record<number, string> = {
  1: 'Solid (I)',
  2: 'Horizontal lines (ii)',
  3: 'Vertical lines (iii)',
  4: 'Diagonal lines forward (IV)',
  5: 'Diagonal lines backward (V)',
  6: 'Dots (vi)',
  7: 'Crosshatch (vii)',
};
