/**
 * Extended chord definitions for Expert Mode
 * Includes 9th, 11th, 13th chords and altered dominants
 */

export type ChordCategory =
  | 'basic'        // Major, minor, dim, aug
  | 'seventh'      // 7th chords
  | 'extended'     // 9th, 11th, 13th
  | 'altered';     // Altered dominants

export interface ExtendedChordDefinition {
  id: string;
  quality: string;
  displayName: string;
  symbol: string;
  badgeText: string;
  category: ChordCategory;
  intervals: number[];
  description: string;
  expertLevel: number; // 1-3
}

export const EXTENDED_CHORD_DEFINITIONS: ExtendedChordDefinition[] = [
  // 9th Chords
  {
    id: 'dom9',
    quality: 'dom9',
    displayName: 'Dominant 9th',
    symbol: '9',
    badgeText: '9',
    category: 'extended',
    intervals: [0, 4, 7, 10, 14],
    description: 'A dominant 7th with added major 9th. Common in jazz and R&B.',
    expertLevel: 1,
  },
  {
    id: 'maj9',
    quality: 'maj9',
    displayName: 'Major 9th',
    symbol: 'maj9',
    badgeText: '△9',
    category: 'extended',
    intervals: [0, 4, 7, 11, 14],
    description: 'A major 7th with added major 9th. Lush, sophisticated sound.',
    expertLevel: 1,
  },
  {
    id: 'min9',
    quality: 'min9',
    displayName: 'Minor 9th',
    symbol: 'm9',
    badgeText: 'm9',
    category: 'extended',
    intervals: [0, 3, 7, 10, 14],
    description: 'A minor 7th with added major 9th. Soulful, warm tone.',
    expertLevel: 1,
  },
  // 11th Chords
  {
    id: 'dom11',
    quality: 'dom11',
    displayName: 'Dominant 11th',
    symbol: '11',
    badgeText: '11',
    category: 'extended',
    intervals: [0, 4, 7, 10, 14, 17],
    description: 'Full dominant chord with 9th and 11th. Rich, complex sound.',
    expertLevel: 2,
  },
  {
    id: 'min11',
    quality: 'min11',
    displayName: 'Minor 11th',
    symbol: 'm11',
    badgeText: 'm11',
    category: 'extended',
    intervals: [0, 3, 7, 10, 14, 17],
    description: 'Minor chord extended to the 11th. Deep, contemplative sound.',
    expertLevel: 2,
  },
  // 13th Chords
  {
    id: 'dom13',
    quality: 'dom13',
    displayName: 'Dominant 13th',
    symbol: '13',
    badgeText: '13',
    category: 'extended',
    intervals: [0, 4, 7, 10, 14, 21],
    description: 'Dominant chord with 9th and 13th. Common jazz voicing.',
    expertLevel: 2,
  },
  {
    id: 'maj13',
    quality: 'maj13',
    displayName: 'Major 13th',
    symbol: 'maj13',
    badgeText: '△13',
    category: 'extended',
    intervals: [0, 4, 7, 11, 14, 21],
    description: 'Major chord extended to the 13th. Very sophisticated.',
    expertLevel: 2,
  },
  {
    id: 'min13',
    quality: 'min13',
    displayName: 'Minor 13th',
    symbol: 'm13',
    badgeText: 'm13',
    category: 'extended',
    intervals: [0, 3, 7, 10, 14, 21],
    description: 'Minor chord with added 13th. Expressive, deep color.',
    expertLevel: 2,
  },
  // Altered Dominants
  {
    id: 'alt',
    quality: 'alt',
    displayName: 'Altered Dominant',
    symbol: 'alt',
    badgeText: 'alt',
    category: 'altered',
    intervals: [0, 4, 8, 10, 13],
    description: 'Dominant with altered 5th and 9th. Maximum tension before resolution.',
    expertLevel: 3,
  },
  {
    id: 'dom7b9',
    quality: 'dom7b9',
    displayName: 'Dominant 7♭9',
    symbol: '7♭9',
    badgeText: '7♭9',
    category: 'altered',
    intervals: [0, 4, 7, 10, 13],
    description: 'Dominant 7th with flat 9. Creates strong tension.',
    expertLevel: 2,
  },
  {
    id: 'dom7sharp9',
    quality: 'dom7sharp9',
    displayName: 'Dominant 7♯9',
    symbol: '7♯9',
    badgeText: '7♯9',
    category: 'altered',
    intervals: [0, 4, 7, 10, 15],
    description: 'The "Hendrix chord". Bluesy, aggressive tension.',
    expertLevel: 2,
  },
  {
    id: 'dom7sharp11',
    quality: 'dom7sharp11',
    displayName: 'Dominant 7♯11',
    symbol: '7♯11',
    badgeText: '7♯11',
    category: 'altered',
    intervals: [0, 4, 7, 10, 18],
    description: 'Lydian dominant. Bright, modern sound.',
    expertLevel: 3,
  },
];

// Group chords by category
export const CHORDS_BY_CATEGORY: Record<ChordCategory, ExtendedChordDefinition[]> = {
  basic: [],
  seventh: [],
  extended: EXTENDED_CHORD_DEFINITIONS.filter(c => c.category === 'extended'),
  altered: EXTENDED_CHORD_DEFINITIONS.filter(c => c.category === 'altered'),
};

// Badge labels for extended chords
export const EXTENDED_BADGE_LABELS: Record<string, string> = {
  dom9: '9',
  maj9: '△9',
  min9: 'm9',
  dom11: '11',
  min11: 'm11',
  dom13: '13',
  maj13: '△13',
  min13: 'm13',
  alt: 'alt',
  dom7b9: '7♭9',
  dom7sharp9: '7♯9',
  dom7sharp11: '7♯11',
};

// Chord type names for extended chords
export const EXTENDED_CHORD_TYPE_NAMES: Record<string, string> = {
  dom9: 'Dominant 9th',
  maj9: 'Major 9th',
  min9: 'Minor 9th',
  dom11: 'Dominant 11th',
  min11: 'Minor 11th',
  dom13: 'Dominant 13th',
  maj13: 'Major 13th',
  min13: 'Minor 13th',
  alt: 'Altered',
  dom7b9: 'Dominant 7♭9',
  dom7sharp9: 'Dominant 7♯9',
  dom7sharp11: 'Dominant 7♯11',
};
