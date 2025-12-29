/**
 * Voicing mode types
 * - simple: Basic close-position voicing without voice-leading optimization
 * - voice-led: Optimized voice-leading following common practice rules
 */
export type VoicingMode = 'simple' | 'voice-led';

/**
 * Voicing style for extended chord handling
 * - classical: Traditional voice leading, keeps 3rd in 11th chords
 * - jazz: Shell voicing, may drop 3rd in 11th chords
 * - modern: Most aggressive shell voicing
 */
export type VoicingStyle = 'classical' | 'jazz' | 'modern';

/**
 * Number of voices in the arrangement
 * - 4: Standard SATB (Soprano, Alto, Tenor, Bass)
 * - 8: Double choir SSAATTBB (Soprano I/II, Alto I/II, Tenor I/II, Bass I/II)
 */
export type VoiceCount = 4 | 8;
