# Week 4.5 Prompt 2: Voice Leading for Complex Harmonies

## Objective
Enhance the SATB voice leading algorithm to handle extended harmonies (7ths, 9ths, 11ths, 13ths, suspensions, alterations) with proper voice distribution, range management, and smooth transitions.

## Context
- **Current state:** Week 3 implemented basic SATB voicing for triads
- **New challenge:** Extended chords have 4-7 notes, must be distributed across 4 voices
- **Critical:** Voice leading must sound professional and follow classical rules
- **Integration:** Tone.js playback system, chord progression analyzer

## Requirements

### 1. Extended Chord Note Distribution

**Principle:** Distribute chord tones across SATB to maximize harmonic richness while maintaining voice ranges.

**Priority System for 4 Voices:**

**7th Chords (4 notes: root, 3rd, 5th, 7th):**
1. Bass: Always gets root
2. Tenor: Gets 3rd or 5th
3. Alto: Gets remaining (3rd or 5th)
4. Soprano: Gets 7th (for color on top)

Example: Cmaj7 (C-E-G-B)
```
Soprano: B4  (7th - harmonic color)
Alto:    G4  (5th - stable)
Tenor:   E3  (3rd - warmth)
Bass:    C2  (root - foundation)
```

**9th Chords (5 notes: root, 3rd, 5th, 7th, 9th):**
- Omit the 5th (least important for color)
- Distribution: root (bass), 3rd (tenor), 7th (alto), 9th (soprano)

Example: Cadd9 (C-E-G-D)
```
Soprano: D5  (9th - shimmer)
Alto:    E4  (3rd)
Tenor:   G3  (5th)
Bass:    C2  (root)
```

**Suspended Chords (sus2: 1-2-5, sus4: 1-4-5):**
- Double the suspension note for emphasis
- Distribution: root (bass), 5th (tenor), sus note (alto + soprano)

Example: Csus4 (C-F-G)
```
Soprano: F4  (sus4 - tension)
Alto:    F4  (sus4 doubled)
Tenor:   G3  (5th)
Bass:    C2  (root)
```

**11th/13th Chords:**
- Omit 5th and sometimes 3rd
- Prioritize: root, 7th, extension (11th or 13th)

Example: C13 (C-E-G-B♭-D-F-A) → use C-E-B♭-A
```
Soprano: A4  (13th)
Alto:    B♭4 (7th)
Tenor:   E3  (3rd)
Bass:    C2  (root)
```

### 2. Voice Range Enforcement

**Strict Ranges (from Week 3):**
```typescript
const VOICE_RANGES = {
  soprano: { min: 'C4', max: 'G5' },
  alto:    { min: 'G3', max: 'D5' },
  tenor:   { min: 'C3', max: 'G4' },
  bass:    { min: 'E2', max: 'C4' }
};
```

**Range Violations:**
- If a note would violate range, move it up/down an octave
- If still out of range, redistribute to another voice
- Never compromise bass root (always in range)

### 3. Voice Leading Rules for Extended Chords

**Smooth Motion (minimize movement):**
```typescript
function calculateTotalMovement(voicingA: SATB, voicingB: SATB): number {
  let totalSemitones = 0;
  for (const voice of ['soprano', 'alto', 'tenor', 'bass']) {
    totalSemitones += Math.abs(
      Note.midi(voicingB[voice]) - Note.midi(voicingA[voice])
    );
  }
  return totalSemitones;
}
```

**Common Tone Retention:**
- If a note appears in both chords, keep it in the same voice
- Example: C → Cmaj7, keep C-E-G in same voices, add B to soprano

**Contrary Motion:**
- When bass moves up, soprano should move down (or stay)
- When bass moves down, soprano should move up (or stay)
- Creates balance and independence

**Avoid Parallel Motion:**
- No parallel 5ths between any two voices
- No parallel octaves between any two voices
- Check all voice pairs: S-A, S-T, S-B, A-T, A-B, T-B

**Resolution of Tension:**
- 7ths resolve down by step
- Suspensions resolve down (sus4 → 3rd, sus2 → root)
- Leading tones resolve up to tonic

### 4. Algorithm Structure

```typescript
interface VoicingAlgorithm {
  // Main function
  generateVoicing(chord: Chord, previousVoicing?: SATB): SATB;
  
  // Helper functions
  getNoteSet(chord: Chord): string[];           // Get all chord tones
  prioritizeNotes(notes: string[]): string[];   // Order by importance
  distributeNotes(notes: string[], prev?: SATB): SATB;
  enforceRanges(voicing: SATB): SATB;
  optimizeVoiceLeading(voicing: SATB, prev: SATB): SATB;
  validateVoicing(voicing: SATB): ValidationResult;
}
```

### 5. Detailed Implementation

**Step 1: Generate Note Set**
```typescript
function getNoteSet(chord: Chord): string[] {
  const notes = Chord.get(`${chord.root}${chord.quality}`).notes;
  
  // Add extensions
  if (chord.extensions.add9) {
    notes.push(Note.transpose(chord.root, '9M'));
  }
  if (chord.extensions.add11) {
    notes.push(Note.transpose(chord.root, '11P'));
  }
  // ... handle other extensions
  
  return notes;
}
```

**Step 2: Prioritize Notes**
```typescript
function prioritizeNotes(chord: Chord, notes: string[]): string[] {
  const priority = {
    root: 0,      // Always include
    seventh: 1,   // Critical for color
    ninth: 2,     // Extensions are important
    third: 3,     // Defines quality
    fifth: 4,     // Can be omitted
    eleventh: 5,
    thirteenth: 5
  };
  
  return notes.sort((a, b) => {
    const degreeA = getChordDegree(a, chord.root);
    const degreeB = getChordDegree(b, chord.root);
    return priority[degreeA] - priority[degreeB];
  });
}
```

**Step 3: Distribute to Voices**
```typescript
function distributeNotes(
  chord: Chord, 
  notes: string[], 
  previousVoicing?: SATB
): SATB {
  const voicing: SATB = {
    soprano: '',
    alto: '',
    tenor: '',
    bass: ''
  };
  
  // Bass always gets root
  voicing.bass = findClosestOctave(chord.root, VOICE_RANGES.bass);
  
  // If 7th chord, soprano gets 7th
  if (chord.quality.includes('7')) {
    const seventh = notes.find(n => getChordDegree(n, chord.root) === 'seventh');
    voicing.soprano = findClosestOctave(seventh, VOICE_RANGES.soprano);
  }
  
  // Distribute remaining notes to tenor and alto
  const remaining = notes.filter(n => 
    n !== voicing.bass && n !== voicing.soprano
  );
  
  // Optimize for common tones if previous voicing exists
  if (previousVoicing) {
    voicing.tenor = findCommonTone(remaining, previousVoicing.tenor) || remaining[0];
    voicing.alto = findCommonTone(remaining, previousVoicing.alto) || remaining[1];
  } else {
    voicing.tenor = findClosestOctave(remaining[0], VOICE_RANGES.tenor);
    voicing.alto = findClosestOctave(remaining[1], VOICE_RANGES.alto);
  }
  
  return voicing;
}
```

**Step 4: Optimize Voice Leading**
```typescript
function optimizeVoiceLeading(
  current: SATB, 
  previous: SATB
): SATB {
  let optimized = { ...current };
  let bestScore = calculateVoiceLeadingScore(current, previous);
  
  // Try inversions and octave adjustments
  const variations = generateVoicingVariations(current);
  
  for (const variation of variations) {
    const score = calculateVoiceLeadingScore(variation, previous);
    if (score < bestScore && isValidVoicing(variation)) {
      optimized = variation;
      bestScore = score;
    }
  }
  
  return optimized;
}

function calculateVoiceLeadingScore(current: SATB, previous: SATB): number {
  let score = 0;
  
  // Penalty for large leaps
  score += calculateTotalMovement(current, previous);
  
  // Penalty for parallel 5ths/8ves
  if (hasParallelFifths(current, previous)) score += 100;
  if (hasParallelOctaves(current, previous)) score += 100;
  
  // Bonus for contrary motion
  if (hasContraryMotion(current, previous)) score -= 10;
  
  // Bonus for common tones
  score -= countCommonTones(current, previous) * 5;
  
  return score;
}
```

### 6. Validation

**Check for Voice Leading Errors:**
```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateVoicing(
  current: SATB, 
  previous?: SATB
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check ranges
  for (const voice in current) {
    if (!isInRange(current[voice], VOICE_RANGES[voice])) {
      errors.push(`${voice} out of range: ${current[voice]}`);
    }
  }
  
  // Check spacing (adjacent voices shouldn't be > octave apart)
  if (intervalBetween(current.soprano, current.alto) > 12) {
    warnings.push('Wide spacing between soprano and alto');
  }
  
  // Check voice crossing
  if (Note.midi(current.alto) > Note.midi(current.soprano)) {
    errors.push('Alto crosses above soprano');
  }
  
  // Check parallel motion
  if (previous) {
    if (hasParallelFifths(current, previous)) {
      errors.push('Parallel fifths detected');
    }
    if (hasParallelOctaves(current, previous)) {
      errors.push('Parallel octaves detected');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
```

## Technical Constraints

- **Library:** @tonaljs/tonal for music theory calculations
- **Performance:** Voicing algorithm must run in < 5ms per chord
- **Audio:** Integration with Tone.js PolySynth
- **State:** Store voicings in Zustand for undo/redo

## Code Structure

```
src/
├── audio/
│   ├── VoiceLeading.ts           # UPDATE: Extended chord voicing
│   └── VoicingAlgorithm.ts       # NEW: Core algorithm
└── utils/
    ├── music-theory.ts           # UPDATE: Helper functions
    └── voice-leading-rules.ts    # NEW: Validation rules
```

## Testing Considerations

**Unit Tests:**
```typescript
describe('Voice Leading for Extended Chords', () => {
  test('Cmaj7 voicing has 7th in soprano', () => {
    const voicing = generateVoicing({ root: 'C', quality: 'maj7' });
    expect(voicing.soprano).toContain('B');
  });
  
  test('Cadd9 omits 5th when voicing', () => {
    const voicing = generateVoicing({ root: 'C', quality: 'major', extensions: { add9: true } });
    const notes = Object.values(voicing);
    expect(notes.filter(n => n.includes('G')).length).toBeLessThan(2);
  });
  
  test('No parallel fifths in I-V-vi-IV', () => {
    const progression = [
      { scaleDegree: 1, quality: 'major' },
      { scaleDegree: 5, quality: 'major' },
      { scaleDegree: 6, quality: 'minor' },
      { scaleDegree: 4, quality: 'major' }
    ];
    
    const voicings = generateVoicings(progression);
    for (let i = 0; i < voicings.length - 1; i++) {
      expect(hasParallelFifths(voicings[i], voicings[i+1])).toBe(false);
    }
  });
});
```

**Manual Tests:**
1. Create Cmaj7 → verify B appears in soprano
2. Create Csus4 → verify F is doubled
3. Create Cadd9 → verify smooth voice leading
4. Create I7-IV7-V7 progression → check for parallel 5ths
5. Create complex progression with all extension types

## Quality Criteria

- [ ] All extended chord types voice correctly
- [ ] 7th appears in soprano for 7th chords
- [ ] Suspensions are doubled appropriately
- [ ] 9ths/11ths/13ths distributed across voices
- [ ] No parallel 5ths or octaves
- [ ] Voices stay within ranges
- [ ] Smooth voice leading (minimal movement)
- [ ] Common tones retained when possible
- [ ] Algorithm runs in < 5ms per chord

## Success Criteria

After implementation:
1. All 17 extended chord types voice beautifully
2. Progression I-Imaj7-Iadd9 sounds smooth
3. No voice leading errors in test progressions
4. Audio playback includes all chord tones correctly
5. Users can hear the difference between Cmaj7 and C7

---

**Estimated Time:** 1.5-2 hours
**Dependencies:** Week 3 (SATB voicing), Prompt 1 (extended chord types)
**Blocks:** Audio playback, MIDI export
