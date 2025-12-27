import { ChordQuality, ChordExtensions } from '../types/chord';

/**
 * Badge labels for displaying chord extensions and alterations
 */
export const BADGE_LABELS: Record<string, string> = {
  dom7: '7',
  maj7: '△7',
  min7: 'm7',
  halfdim7: 'ø7',
  dim7: '°7',
  sus2: 'sus2',
  sus4: 'sus4',
  add9: '+9',
  add11: '+11',
  add13: '+13',
  flat9: '♭9',
  sharp9: '♯9',
  sharp11: '♯11',
  flat13: '♭13',
};

/**
 * Human-readable names for chord qualities
 */
export const CHORD_TYPE_NAMES: Record<ChordQuality, string> = {
  major: 'Major',
  minor: 'Minor',
  diminished: 'Diminished',
  augmented: 'Augmented',
  dom7: 'Dominant 7th',
  maj7: 'Major 7th',
  min7: 'Minor 7th',
  halfdim7: 'Half-Diminished 7th',
  dim7: 'Diminished 7th',
};

/**
 * Categories of chord types for organization
 */
export const CHORD_TYPE_CATEGORIES = {
  triads: ['major', 'minor', 'diminished', 'augmented'] as const,
  sevenths: ['dom7', 'maj7', 'min7', 'halfdim7', 'dim7'] as const,
  suspensions: ['sus2', 'sus4'] as const,
  extensions: ['add9', 'add11', 'add13'] as const,
  alterations: ['flat9', 'sharp9', 'sharp11', 'flat13'] as const,
};

/**
 * Check if a chord quality is a seventh chord
 */
export function isSeventhChord(quality: ChordQuality): boolean {
  return CHORD_TYPE_CATEGORIES.sevenths.includes(quality as any);
}

/**
 * Get the badge text for a chord quality
 * Returns the abbreviated display text for the chord quality
 */
export function getChordBadgeText(
  quality: ChordQuality,
  extensions: ChordExtensions
): string | null {
  // For seventh chords, return their badge
  if (isSeventhChord(quality)) {
    return BADGE_LABELS[quality] || null;
  }

  // For extensions, prioritize in order of common usage
  if (extensions.sus4) return BADGE_LABELS.sus4;
  if (extensions.sus2) return BADGE_LABELS.sus2;
  if (extensions.add9) return BADGE_LABELS.add9;
  if (extensions.add11) return BADGE_LABELS.add11;
  if (extensions.add13) return BADGE_LABELS.add13;

  // For alterations
  if (extensions.flat9) return BADGE_LABELS.flat9;
  if (extensions.sharp9) return BADGE_LABELS.sharp9;
  if (extensions.sharp11) return BADGE_LABELS.sharp11;
  if (extensions.flat13) return BADGE_LABELS.flat13;

  return null;
}

/**
 * Check if a chord has any modifications (extensions or alterations)
 */
export function hasChordModifications(
  quality: ChordQuality,
  extensions: ChordExtensions
): boolean {
  // Seventh chords are considered modifications
  if (isSeventhChord(quality)) {
    return true;
  }

  // Check if any extensions are present
  return Object.values(extensions).some((value) => value === true);
}

/**
 * Get the intervals (in semitones from root) for a chord quality
 * Used for calculating actual pitches of chord notes
 */
export function getChordIntervals(
  quality: ChordQuality,
  extensions: ChordExtensions
): number[] {
  // Base intervals for each quality (in semitones from root)
  const baseIntervals: Record<ChordQuality, number[]> = {
    major: [0, 4, 7], // Root, Major 3rd, Perfect 5th
    minor: [0, 3, 7], // Root, Minor 3rd, Perfect 5th
    diminished: [0, 3, 6], // Root, Minor 3rd, Diminished 5th
    augmented: [0, 4, 8], // Root, Major 3rd, Augmented 5th
    dom7: [0, 4, 7, 10], // Root, Major 3rd, Perfect 5th, Minor 7th
    maj7: [0, 4, 7, 11], // Root, Major 3rd, Perfect 5th, Major 7th
    min7: [0, 3, 7, 10], // Root, Minor 3rd, Perfect 5th, Minor 7th
    halfdim7: [0, 3, 6, 10], // Root, Minor 3rd, Diminished 5th, Minor 7th
    dim7: [0, 3, 6, 9], // Root, Minor 3rd, Diminished 5th, Diminished 7th
  };

  let intervals = [...baseIntervals[quality]];

  // Add extension intervals (stacking above the 7th)
  if (extensions.add9) intervals.push(14); // Major 9th
  if (extensions.add11) intervals.push(17); // Perfect 11th
  if (extensions.add13) intervals.push(21); // Major 13th

  // Add alteration intervals
  if (extensions.sharp9) intervals.push(15); // Augmented 9th
  if (extensions.flat9) intervals.push(13); // Minor 9th
  if (extensions.sharp11) intervals.push(18); // Augmented 11th
  if (extensions.flat13) intervals.push(20); // Minor 13th

  // Handle suspensions (replace 3rd)
  if (extensions.sus2) {
    intervals = intervals.filter((i) => i !== 4 && i !== 3); // Remove 3rd
    intervals.push(2); // Add Major 2nd
  }
  if (extensions.sus4) {
    intervals = intervals.filter((i) => i !== 4 && i !== 3); // Remove 3rd
    intervals.push(5); // Add Perfect 4th
  }

  // Sort intervals
  return intervals.sort((a, b) => a - b);
}

/**
 * Get a complete human-readable display name for a chord
 * Example: "C Major 7th" or "D Minor with added 9th"
 */
export function getChordDisplayName(
  rootNote: string,
  quality: ChordQuality,
  extensions: ChordExtensions
): string {
  let displayName = rootNote;

  // Add quality name
  displayName += ' ' + CHORD_TYPE_NAMES[quality];

  // Add extension/alteration descriptions
  const modifications: string[] = [];

  if (extensions.sus2) modifications.push('sus2');
  if (extensions.sus4) modifications.push('sus4');
  if (extensions.add9) modifications.push('add9');
  if (extensions.add11) modifications.push('add11');
  if (extensions.add13) modifications.push('add13');
  if (extensions.flat9) modifications.push('♭9');
  if (extensions.sharp9) modifications.push('♯9');
  if (extensions.sharp11) modifications.push('♯11');
  if (extensions.flat13) modifications.push('♭13');

  if (modifications.length > 0) {
    displayName += ' (' + modifications.join(', ') + ')';
  }

  return displayName;
}
