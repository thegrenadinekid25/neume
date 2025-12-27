# Counterpoint Analyzer

A TypeScript implementation of traditional counterpoint rule analysis for four-part (SATB) choral writing.

## Overview

This analyzer detects voice-leading violations in real-time as users compose, providing educational feedback and suggestions for improvement. It's designed for web-based music composition tools.

## Features

### Violation Detection

| Rule | Severity | Description |
|------|----------|-------------|
| **Parallel Fifths** | Error | Two voices moving in parallel perfect fifths |
| **Parallel Octaves** | Error | Two voices moving in parallel octaves/unisons |
| **Hidden Fifths** | Warning | Approaching a perfect fifth by similar motion |
| **Hidden Octaves** | Warning | Approaching an octave by similar motion |
| **Voice Crossing** | Warning | A lower voice goes above a higher voice |
| **Voice Overlap** | Info | A voice's note crosses the previous note of adjacent voice |
| **Spacing Violation** | Warning | More than an octave between soprano/alto or alto/tenor |
| **Range Violation** | Error/Warning | Notes outside voice's absolute or comfortable range |

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Voice Lines Input                      │
│  (SATB notes with beat positions and MIDI values)       │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Beat Snapshot Builder                   │
│  Groups notes by beat position for temporal analysis    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Detection Functions                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │  Parallel   │ │   Hidden    │ │   Voice     │       │
│  │  Motion     │ │   Parallels │ │   Crossing  │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │   Voice     │ │   Spacing   │ │   Range     │       │
│  │   Overlap   │ │   Check     │ │   Check     │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Analysis Result                        │
│  - List of violations with locations                    │
│  - Severity levels (error/warning/info)                 │
│  - Suggestions for fixing                               │
│  - Quality score (0-100)                                │
└─────────────────────────────────────────────────────────┘
```

## Technical Implementation

### Beat Snapshot Approach

Rather than comparing notes directly, we build "snapshots" of which notes are sounding at each beat. This correctly handles:

- Notes with different durations
- Overlapping notes
- Tied notes spanning multiple beats

```typescript
interface BeatSnapshot {
  beat: number;
  notes: Partial<Record<VoicePart, {
    noteId: string;
    midi: number;
    pitch: string;
  }>>;
}
```

### Interval Detection

Perfect intervals are detected using MIDI semitone calculations:

```typescript
// Perfect fifth = 7 semitones (or inverted = 5)
function isPerfectFifth(interval: number): boolean {
  const normalized = Math.abs(interval) % 12;
  return normalized === 7 || normalized === 5;
}

// Perfect octave/unison = 0 semitones (mod 12)
function isPerfectOctaveOrUnison(interval: number): boolean {
  return Math.abs(interval) % 12 === 0;
}
```

### Motion Analysis

Voice motion is classified as:

- **Similar Motion**: Both voices move in the same direction
- **Contrary Motion**: Voices move in opposite directions
- **Oblique Motion**: One voice moves, one stays (not currently detected separately)
- **Parallel Motion**: Similar motion maintaining the same interval

## Configuration

The analyzer supports configurable strictness levels:

```typescript
interface CounterpointAnalyzerConfig {
  checkParallelFifths: boolean;      // default: true
  checkParallelOctaves: boolean;     // default: true
  checkHiddenFifths: boolean;        // default: true
  checkHiddenOctaves: boolean;       // default: true
  checkVoiceCrossing: boolean;       // default: true
  checkVoiceOverlap: boolean;        // default: true
  checkSpacing: boolean;             // default: true
  checkRange: boolean;               // default: true
  maxSopranoAltoSpacing: number;     // default: 12 semitones
  maxAltoTenorSpacing: number;       // default: 12 semitones
  warnOnExtendedRange: boolean;      // default: true
  strictness: 'strict' | 'normal' | 'relaxed';
}
```

## Dependencies

- **uuid**: For generating unique violation IDs
- **Tonal.js** (optional): For pitch name conversions (not required for core analysis)

## Usage

```typescript
import { analyzeCounterpoint } from './counterpoint-analyzer';

const result = analyzeCounterpoint(voiceLines, {
  strictness: 'normal',
  checkHiddenFifths: true,
});

console.log(result.summary.isValid);  // true if no errors
console.log(result.summary.score);    // 0-100 quality score
console.log(result.violations);       // array of violations
```

## Future Improvements

### Planned Enhancements

1. **Melodic Analysis**
   - Large leap detection (>P5)
   - Augmented/diminished interval warnings
   - Resolution of tendency tones (7th scale degree, leading tones)

2. **Harmonic Analysis**
   - Doubled leading tone detection
   - Incomplete chord warnings
   - Seventh chord resolution rules

3. **Style-Specific Rules**
   - Renaissance (Palestrina) style
   - Baroque (Bach) chorale style
   - Common practice period rules
   - Modern/jazz voice leading

4. **Performance Optimization**
   - Incremental analysis (only re-analyze changed sections)
   - Web Worker support for background analysis
   - Caching of analysis results

### Academic References

The rules implemented are based on standard counterpoint pedagogy:

- Fux, Johann Joseph. *Gradus ad Parnassum* (1725)
- Schenker, Heinrich. *Counterpoint* (1910)
- Kennan, Kent. *Counterpoint Based on Eighteenth-Century Practice* (1999)
- Kostka, Stefan & Payne, Dorothy. *Tonal Harmony* (2012)

## Existing Implementations (Other Languages)

### Python - music21 (Most Comprehensive)

**[music21](https://github.com/cuthbertLab/music21)** (BSD License) is the gold standard for computer-aided musicology.

Key modules relevant to our implementation:

1. **[voiceLeading.py](https://github.com/cuthbertLab/music21/blob/master/music21/voiceLeading.py)** - Core voice leading analysis
   - `VoiceLeadingQuartet` class for analyzing four-voice motion
   - Parallel motion detection (fifths, octaves)
   - Anti-parallel motion detection
   - Resolution checking for dissonances

2. **[music21-tools/counterpoint/species.py](https://github.com/cuthbertLab/music21-tools/blob/master/counterpoint/species.py)** - Species counterpoint
   - Rules for 1st-5th species counterpoint
   - Cantus firmus generation
   - Species-specific constraint checking

3. **Voice Leading Quartet Features** (from [official docs](https://www.music21.org/music21docs/moduleReference/moduleVoiceLeading.html)):
   - Check dissonance resolution (P4, d5, A4, m7)
   - 16th century style validation
   - Anti-parallel fifths detection
   - Smoothness metrics

**Potential Imports/Ports:**
- Resolution rules for dissonances
- Species counterpoint constraints
- More sophisticated parallel detection (compound intervals)
- Tendency tone resolution (leading tones, 7ths)

### C++

- **MuseScore** (GPL) - Open source notation software
  - Has voice leading checks in `libmscore/check.cpp`
  - Limited to basic parallel 5ths/8ves detection

### Java

- **JFugue** - Music programming library
  - Basic interval analysis, no counterpoint-specific features

### Haskell

- **Euterpea** - Music composition library
  - Functional approach to music theory
  - Academic implementations of counterpoint rules

## Improvements We Could Port from music21

Based on [music21's voiceLeading module](https://www.music21.org/music21docs/moduleReference/moduleVoiceLeading.html):

### 1. VoiceLeadingQuartet Patterns
```python
# music21 checks for these specific patterns
- Parallel unisons (P1 to P1)
- Direct/hidden unisons (approaching P1 by similar motion)
- Anti-parallel motion (P5 to P5 by contrary motion - also forbidden!)
- Compound interval handling (P12 = P5, P15 = P8)
```

### 2. Dissonance Resolution Rules
```python
# music21 validates resolution of:
- Perfect 4th resolving to 3rd or 5th
- Diminished 5th resolving inward to 3rd
- Augmented 4th (tritone) resolving outward to 6th
- Minor 7th resolving to 6th or 8th
```

### 3. Style-Specific Rules
- **Renaissance (16th c.)**: Stricter rules on direct intervals
- **Baroque (Bach chorales)**: Different treatment of hidden parallels
- **Common Practice**: Standard rules we currently implement

### 4. Smoothness Metrics
```typescript
// Could add to our analyzer
function calculateVoiceLeadingSmoothness(
  voiceLines: Record<VoicePart, VoiceLine>
): number {
  // Sum of all melodic intervals (smaller = smoother)
  // Penalize leaps > P5
  // Reward stepwise motion
}
```

## Contributing

Contributions welcome! Areas where help is needed:

1. Additional counterpoint rules (see "Planned Enhancements")
2. Style-specific rule sets
3. Performance optimizations
4. Test coverage
5. Documentation improvements

## License

MIT License - See LICENSE file for details.

## Related Projects

- [Neume](https://github.com/thegrenadinekid25/neume) - The choral composition app this was built for
- [Tonal.js](https://github.com/tonaljs/tonal) - Music theory library for JavaScript
- [music21](https://github.com/cuthbertLab/music21) - Python toolkit for computer-aided musicology
