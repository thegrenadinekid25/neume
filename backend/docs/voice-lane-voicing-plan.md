# Voice Lane Voicing System Plan
## 4-Voice vs 8-Voice Smart Arrangement for Extended Chords

### Current State Analysis

**Existing System:**
- Fixed 4 voices: soprano, alto, tenor, bass (SATB)
- `generateSATBVoicing()` in `src/audio/VoiceLeading.ts` handles voice assignment
- For triads: root → bass, 3rd → tenor, 5th → alto, highest → soprano
- For 7th chords: root → bass, 3rd → tenor, 5th → alto, 7th → soprano
- Extended chords (9th, 11th, 13th) notes are collected but only 4 can be voiced

**Problem:**
A Cmaj13 has 6 distinct notes: C, E, G, B, D, A (root, 3rd, 5th, 7th, 9th, 13th)
With only 4 voices, we must intelligently omit notes while preserving chord identity.

---

### Part 1: Smart 4-Voice Extended Chord Voicing

Apply shell voicing principles from jazz theory to intelligently distribute extended chords across 4 voices.

#### Voicing Rules by Chord Type

**Triads (3 notes):**
| Voice   | Note     | Notes                          |
|---------|----------|--------------------------------|
| Bass    | Root     | Always - defines chord         |
| Tenor   | 3rd      | Defines major/minor quality    |
| Alto    | 5th      | Standard doubling              |
| Soprano | Root/3rd | Double root (preferred) or 3rd |

**7th Chords (4 notes):**
| Voice   | Note | Notes                              |
|---------|------|------------------------------------|
| Bass    | Root | Defines chord                      |
| Tenor   | 3rd  | Guide tone - defines quality       |
| Alto    | 5th  | Can be omitted if voices needed    |
| Soprano | 7th  | Guide tone - defines 7th character |

**9th Chords (5 notes → pick 4):**
- **Essential:** Root, 3rd, 7th, 9th
- **Omit:** 5th (most expendable in jazz voicing)

| Voice   | Note |
|---------|------|
| Bass    | Root |
| Tenor   | 3rd  |
| Alto    | 7th  |
| Soprano | 9th  |

**11th Chords (6 notes → pick 4):**
- **Essential:** Root, 7th, 11th
- **Often omit 3rd:** E-F clash between major 3rd and 11th (half-step)
- **Omit:** 5th, sometimes 9th

| Voice   | Note                    |
|---------|-------------------------|
| Bass    | Root                    |
| Tenor   | 7th or 9th              |
| Alto    | 11th                    |
| Soprano | 9th or doubled 11th     |

*Note: For quartal/modern sound, 3rd is often omitted. For fuller sound, include 3rd in tenor.*

**13th Chords (7 notes → pick 4):**
- **Essential:** Root, 3rd, 7th, 13th
- **Omit:** 5th, 9th, 11th (11th especially clashes with 3rd)

| Voice   | Note |
|---------|------|
| Bass    | Root |
| Tenor   | 3rd  |
| Alto    | 7th  |
| Soprano | 13th |

---

### Part 2: 8-Voice Double Choir System (SSAATTBB)

For richer choral texture, support 8 independent voices.

#### Voice Configuration

```typescript
type VoicePart8 =
  | 'soprano1' | 'soprano2'
  | 'alto1' | 'alto2'
  | 'tenor1' | 'tenor2'
  | 'bass1' | 'bass2';
```

#### Voice Ranges (Expanded)

| Voice    | Low  | High | Comfortable    |
|----------|------|------|----------------|
| Soprano1 | D4   | A5   | F4-F5          |
| Soprano2 | C4   | G5   | E4-E5          |
| Alto1    | A3   | E5   | B3-D5          |
| Alto2    | G3   | D5   | A3-C5          |
| Tenor1   | D3   | A4   | E3-F4          |
| Tenor2   | C3   | G4   | D3-E4          |
| Bass1    | G2   | D4   | A2-B3          |
| Bass2    | E2   | C4   | G2-A3          |

#### 8-Voice Distribution for Extended Chords

**Triads (3 notes):**
- Double all notes in octaves for full choral sound
- Root doubled in both bass parts
- 3rd: one alto, one tenor
- 5th: one soprano, one alto

**7th Chords (4 notes):**
- One note per voice pair (S1+S2 share, etc.)
- S1/S2: 7th or melody note
- A1/A2: 5th and 3rd
- T1/T2: 3rd and 7th
- B1/B2: Root (octave doubling)

**9th Chords (5 notes):**
| Voice Pair | Notes           |
|------------|-----------------|
| Sopranos   | 9th, 7th        |
| Altos      | 5th, 3rd        |
| Tenors     | 3rd, Root       |
| Basses     | Root (octaves)  |

**11th Chords (6 notes):**
| Voice Pair | Notes           |
|------------|-----------------|
| Sopranos   | 11th, 9th       |
| Altos      | 7th, 5th        |
| Tenors     | 3rd*, Root      |
| Basses     | Root (octaves)  |

*3rd may be omitted in favor of 11th if desired for quartal sound

**13th Chords (7 notes):**
| Voice Pair | Notes           |
|------------|-----------------|
| Sopranos   | 13th, 9th       |
| Altos      | 7th, 5th        |
| Tenors     | 3rd, Root       |
| Basses     | Root (octaves)  |

---

### Part 3: Implementation Plan

#### Phase 1: Extend Type System

1. **New VoicePart type:** Create `VoicePart8` alongside existing `VoicePart`
2. **Voice count setting:** Add to voicing-store.ts
   ```typescript
   interface VoicingSettings {
     voiceCount: 4 | 8;
     voicingMode: 'classical' | 'jazz' | 'modern';
   }
   ```
3. **Extended voice ranges:** Add soprano1/2, alto1/2, etc. to `voice-ranges.ts`

#### Phase 2: Smart Voicing Logic

1. **Create `smart-voicing.ts`** service:
   ```typescript
   interface SmartVoicingOptions {
     voiceCount: 4 | 8;
     style: 'classical' | 'jazz' | 'modern';
     preferShellVoicing: boolean;
     omittable: ('5th' | '9th' | '11th')[];
   }

   function generateSmartVoicing(
     chord: Chord,
     options: SmartVoicingOptions,
     previousVoicing?: Voices | Voices8
   ): Voices | Voices8;
   ```

2. **Chord analysis integration:**
   - Use interval analysis from chord_analyzer.py
   - Identify chord tones: root, 3rd, 5th, 7th, 9th, 11th, 13th
   - Apply shell voicing rules based on chord type

3. **Priority system for note selection:**
   ```typescript
   const CHORD_TONE_PRIORITY = {
     root: 100,      // Essential
     third: 95,      // Defines quality
     seventh: 90,    // Defines extension character
     thirteenth: 85, // Color tone
     ninth: 80,      // Color tone
     fifth: 70,      // Often omittable
     eleventh: 60,   // Often clashes, omit unless sus
   };
   ```

#### Phase 3: Voice Lane UI Updates

1. **8-voice lane editor:**
   - Render 8 lanes when voiceCount === 8
   - Color-code soprano1 vs soprano2 (slight variation)
   - Collapse/expand voice pairs

2. **Voicing mode selector:**
   - UI component to switch between 4/8 voices
   - Style selector: classical, jazz, modern

3. **Smart suggestions:**
   - Highlight recommended notes for each voice
   - Show omitted notes dimmed in chord palette

#### Phase 4: Voice Leading Updates

1. **Extend `validateVoiceLeading`** for 8 voices
2. **Add cross-voice-pair rules:**
   - Soprano1 should not cross below Soprano2
   - Maximum spacing rules between voice pairs
3. **Update parallel motion detection** for 8 voices

---

### Part 4: File Changes Summary

| File | Changes |
|------|---------|
| `src/types/necklace.ts` | Add `VoicePart8` type |
| `src/types/voice-line.ts` | Add 8-voice support |
| `src/data/voice-ranges.ts` | Add ranges for soprano1/2, etc. |
| `src/audio/VoiceLeading.ts` | Refactor for smart voicing |
| `src/services/smart-voicing.ts` | NEW: Shell voicing logic |
| `src/store/voice-line-store.ts` | Support 8 voice lines |
| `src/store/voicing-store.ts` | Add voiceCount setting |
| `src/components/VoiceLaneEditor/` | UI for 8 voices |

---

### Part 5: Testing Requirements

1. **Unit tests for smart voicing:**
   - 4-voice shell voicing for 9th, 11th, 13th chords
   - 8-voice full voicing for all chord types
   - Voice leading validation with 8 voices

2. **Integration tests:**
   - Chord palette → voice lanes (4 voice)
   - Chord palette → voice lanes (8 voice)
   - Mode switching doesn't lose notes

3. **Visual regression:**
   - 8-voice lane rendering
   - Voice crossing highlights work

---

### Questions for User

1. **Voice naming convention:** SSAATTBB or Soprano I/II, Alto I/II, etc.?
2. **Default mode:** Should new compositions default to 4 or 8 voices?
3. **Jazz vs Classical:** Different shell voicing rules (jazz drops 5th more aggressively)?
4. **Divisi support:** Can a single voice split (e.g., Soprano divisi a2)?
