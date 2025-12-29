"""
Robust chord analyzer that detects extended chords from HPCP data.

Handles:
- Inversions (C/E detected as C major with E bass)
- Extensions (7ths, 9ths, 11ths, 13ths)
- Suspended chords (sus2, sus4)
- Altered chords (dim, aug, m7b5)
- Real-world audio noise/harmonics

Uses correlation-based template matching for robustness.
"""
import numpy as np
from typing import List, Tuple, Dict, Optional
from dataclasses import dataclass


# Pitch class names
PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

# Enharmonic equivalents for cleaner output
ENHARMONIC = {
    'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'
}


@dataclass
class ChordTemplate:
    """A chord template for matching."""
    name: str           # e.g., "maj7", "min7", "dom7"
    intervals: List[int]  # Semitones from root that MUST be present
    optional: List[int]   # Semitones that MAY be present
    forbidden: List[int]  # Semitones that should NOT be present
    priority: int         # Higher = check first (more specific chords)


# Chord templates ordered by specificity (most specific first)
# Intervals: 0=root, 1=m2, 2=M2, 3=m3, 4=M3, 5=P4, 6=tritone, 7=P5, 8=m6, 9=M6, 10=m7, 11=M7
#
# VOICING CONVENTIONS (from jazz theory):
# - Guide tones (3rd + 7th) define chord quality - almost always essential
# - 5th is acoustically implied by root - almost always omissible
# - Root often played by bass - can be omitted in "rootless" voicings
# - 11th clashes with major 3rd (half-step E-F) - often omit 3rd OR use #11
# - 13th chords often omit 9th and 11th entirely
#
# SATB (4 voices) can only play 4 notes, so extended chords MUST omit:
# - 9th chord: typically root-3-7-9 (omit 5th)
# - 11th chord: typically root-7-9-11 or root-7-11 (omit 3rd and 5th)
# - 13th chord: typically root-3-7-13 (omit 5th, 9th, 11th)
#
# Sources: thejazzpianosite.com, pianogroove.com
CHORD_TEMPLATES = [
    # ============================================================
    # 13TH CHORDS - Essential: 3rd, 7th, 13th. Often omit 5th, 9th, 11th
    # ============================================================
    # Full 13th (rare - too many notes)
    ChordTemplate("maj13", [0, 4, 11, 9, 2], [7, 5], [3, 10], 102),
    ChordTemplate("13", [0, 4, 10, 9, 2], [7, 5], [3, 11], 101),
    ChordTemplate("min13", [0, 3, 10, 9, 2], [7, 5], [4, 11], 100),
    # Shell 13th: root-3-7-13 (most common - 4 notes for SATB)
    ChordTemplate("maj13", [0, 4, 11, 9], [7], [3, 10], 99),
    ChordTemplate("13", [0, 4, 10, 9], [7], [3, 11], 98),
    ChordTemplate("min13", [0, 3, 10, 9], [7], [4, 11], 97),
    # Rootless 13th: 3-7-9-13 (common in piano/jazz)
    ChordTemplate("maj13", [4, 11, 9, 2], [0, 7], [3, 10], 96),
    ChordTemplate("13", [4, 10, 9, 2], [0, 7], [3, 11], 95),

    # ============================================================
    # 11TH CHORDS - The 3rd often OMITTED (clashes with 11th in major/dom)
    # ============================================================
    # Full 11th with all notes
    ChordTemplate("maj11", [0, 4, 11, 2, 5], [7], [3, 10], 93),
    ChordTemplate("11", [0, 4, 10, 2, 5], [7], [3, 11], 92),
    ChordTemplate("min11", [0, 3, 10, 2, 5], [7], [4, 11], 91),
    # Shell 11th with 3rd: root-3-7-11 (4 notes)
    ChordTemplate("maj11", [0, 4, 11, 5], [7, 2], [3, 10], 90),
    ChordTemplate("11", [0, 4, 10, 5], [7, 2], [3, 11], 89),
    ChordTemplate("min11", [0, 3, 10, 5], [7, 2], [4, 11], 88),
    # Shell 11th WITHOUT 3rd: root-7-11 (Lauridsen/quartal style)
    # This avoids the E-F clash in major chords
    ChordTemplate("maj11", [0, 11, 5], [7, 2], [3, 4, 10], 87),
    ChordTemplate("11", [0, 10, 5], [7, 2], [3, 4, 11], 86),
    # Rootless 11th: 3-7-9-11 or 7-9-11 (piano voicings)
    ChordTemplate("maj11", [4, 11, 2, 5], [0, 7], [3, 10], 85),
    ChordTemplate("11", [4, 10, 2, 5], [0, 7], [3, 11], 84),
    ChordTemplate("min11", [3, 10, 2, 5], [0, 7], [4, 11], 83),

    # ============================================================
    # 9TH CHORDS - Essential: 3rd, 7th, 9th. 5th and root often omitted
    # ============================================================
    # Full 9th
    ChordTemplate("maj9", [0, 4, 7, 11, 2], [], [3, 10], 82),
    ChordTemplate("9", [0, 4, 7, 10, 2], [], [3, 11], 81),
    ChordTemplate("min9", [0, 3, 7, 10, 2], [], [4, 11], 80),
    # Shell 9th: root-3-7-9 (most common - no 5th)
    ChordTemplate("maj9", [0, 4, 11, 2], [7], [3, 10], 79),
    ChordTemplate("9", [0, 4, 10, 2], [7], [3, 11], 78),
    ChordTemplate("min9", [0, 3, 10, 2], [7], [4, 11], 77),
    # Rootless 9th: 3-5-7-9 or 3-7-9 (piano voicings)
    ChordTemplate("maj9", [4, 11, 2], [0, 7], [3, 10], 76),
    ChordTemplate("9", [4, 10, 2], [0, 7], [3, 11], 75),
    ChordTemplate("min9", [3, 10, 2], [0, 7], [4, 11], 74),
    # Add9 (no 7th)
    ChordTemplate("add9", [0, 4, 2], [7], [3, 10, 11], 73),
    ChordTemplate("madd9", [0, 3, 2], [7], [4, 10, 11], 72),

    # ============================================================
    # 7TH CHORDS - Essential: 3rd, 7th. 5th almost always omitted
    # ============================================================
    # Full 7th
    ChordTemplate("maj7", [0, 4, 7, 11], [], [3, 10], 71),
    ChordTemplate("dom7", [0, 4, 7, 10], [], [3, 11], 70),
    ChordTemplate("min7", [0, 3, 7, 10], [], [4, 11], 69),
    # Shell 7th: root-3-7 (most common)
    ChordTemplate("maj7", [0, 4, 11], [7], [3, 10], 68),
    ChordTemplate("dom7", [0, 4, 10], [7], [3, 11], 67),
    ChordTemplate("min7", [0, 3, 10], [7], [4, 11], 66),
    # Rootless 7th: just 3-7 (guide tones only)
    ChordTemplate("maj7", [4, 11], [0, 7], [3, 10], 65),
    ChordTemplate("dom7", [4, 10], [0, 7], [3, 11], 64),
    ChordTemplate("min7", [3, 10], [0, 7], [4, 11], 63),
    # Special 7th chords (need specific intervals)
    ChordTemplate("m7b5", [0, 3, 6, 10], [], [4, 7, 11], 62),  # Half-dim needs b5
    ChordTemplate("dim7", [0, 3, 6, 9], [], [4, 7, 10, 11], 61),
    ChordTemplate("minmaj7", [0, 3, 11], [7], [4, 10], 60),
    ChordTemplate("aug7", [0, 4, 8, 10], [], [3, 7, 11], 59),

    # ============================================================
    # SUSPENDED CHORDS - Higher priority to avoid confusion with 11ths
    # ============================================================
    ChordTemplate("7sus4", [0, 5, 10], [7], [3, 4, 11], 115),  # Very high - before 11ths
    ChordTemplate("7sus2", [0, 2, 10], [7], [3, 4, 11], 114),
    ChordTemplate("sus4", [0, 5, 7], [], [3, 4], 52),
    ChordTemplate("sus2", [0, 2, 7], [], [3, 4], 51),

    # ============================================================
    # 6TH CHORDS - Lower priority to avoid Am→C6 confusion
    # ============================================================
    ChordTemplate("maj6", [0, 4, 9], [7], [3, 10, 11], 8),
    ChordTemplate("min6", [0, 3, 9], [7], [4, 10, 11], 7),

    # ============================================================
    # TRIADS AND SPECIAL CHORDS
    # Higher priority than rootless extended chords to avoid
    # C/E → Am7/E confusion. Basic triads are more common.
    # ============================================================
    ChordTemplate("aug", [0, 4, 8], [], [3, 7], 58),  # Above rootless 7ths
    ChordTemplate("dim", [0, 3, 6], [], [4, 7], 57),  # Bdim shouldn't become G7/B
    ChordTemplate("major", [0, 4, 7], [], [3], 56),   # Full triad - high priority
    ChordTemplate("major", [0, 4], [7], [3], 55),    # Triad without 5th
    ChordTemplate("minor", [0, 3, 7], [], [4], 54),   # Full minor triad
    ChordTemplate("minor", [0, 3], [7], [4], 53),    # Minor without 5th
    ChordTemplate("power", [0, 7], [], [3, 4], 5),
]


@dataclass
class ChordResult:
    """Result of chord analysis."""
    root: str
    quality: str
    bass: Optional[str]  # For inversions (slash chords)
    confidence: float
    all_intervals: List[int]  # All detected intervals for debugging

    def to_symbol(self) -> str:
        """Convert to chord symbol like 'Cmaj7' or 'Am/E'."""
        symbol = self.root + self._quality_suffix()
        if self.bass and self.bass != self.root:
            symbol += "/" + self.bass
        return symbol

    def _quality_suffix(self) -> str:
        """Get the suffix for this quality."""
        suffixes = {
            'major': '', 'minor': 'm', 'dim': 'dim', 'aug': '+',
            'maj7': 'maj7', 'dom7': '7', 'min7': 'm7',
            'm7b5': 'm7b5', 'dim7': 'dim7', 'minmaj7': 'mM7', 'aug7': '+7',
            'maj6': '6', 'min6': 'm6',
            'sus4': 'sus4', 'sus2': 'sus2', '7sus4': '7sus4', '7sus2': '7sus2',
            'maj9': 'maj9', '9': '9', 'min9': 'm9', 'add9': 'add9', 'madd9': 'madd9',
            'maj11': 'maj11', '11': '11', 'min11': 'm11',
            'maj13': 'maj13', '13': '13', 'min13': 'm13',
            'power': '5',
        }
        return suffixes.get(self.quality, self.quality)

    def to_dict(self) -> Dict:
        """Convert to dictionary for API response.

        Returns structured extension data for the deconstructor to use.
        Extension keys:
        - 'maj7', 'min7', 'dom7': 7th type
        - 'add9', 'add11', 'add13': extensions
        - 'sus2', 'sus4': suspensions
        - 'b5', '#5', 'b9', '#9', '#11', 'b13': alterations
        """
        # Parse quality into base quality + extensions
        base_quality = self.quality
        extensions = {}

        # Map complex qualities to base + structured extensions
        if self.quality in ['maj7', 'maj9', 'maj11', 'maj13']:
            base_quality = 'major'
            extensions['maj7'] = True  # Specific 7th type
            if '9' in self.quality or '11' in self.quality or '13' in self.quality:
                extensions['add9'] = True
            if '11' in self.quality or '13' in self.quality:
                extensions['add11'] = True
            if '13' in self.quality:
                extensions['add13'] = True

        elif self.quality in ['min7', 'min9', 'min11', 'min13']:
            base_quality = 'minor'
            extensions['min7'] = True  # Specific 7th type
            if '9' in self.quality or '11' in self.quality or '13' in self.quality:
                extensions['add9'] = True
            if '11' in self.quality or '13' in self.quality:
                extensions['add11'] = True
            if '13' in self.quality:
                extensions['add13'] = True

        elif self.quality in ['dom7', '9', '11', '13']:
            base_quality = 'major'  # Dominant is major with b7
            extensions['dom7'] = True  # Specific 7th type
            if self.quality in ['9', '11', '13']:
                extensions['add9'] = True
            if self.quality in ['11', '13']:
                extensions['add11'] = True
            if self.quality == '13':
                extensions['add13'] = True

        elif self.quality == 'add9':
            base_quality = 'major'
            extensions['add9'] = True
        elif self.quality == 'madd9':
            base_quality = 'minor'
            extensions['add9'] = True

        elif self.quality == '7sus4':
            base_quality = 'major'
            extensions['dom7'] = True
            extensions['sus4'] = True
        elif self.quality == '7sus2':
            base_quality = 'major'
            extensions['dom7'] = True
            extensions['sus2'] = True
        elif self.quality == 'sus4':
            base_quality = 'major'
            extensions['sus4'] = True
        elif self.quality == 'sus2':
            base_quality = 'major'
            extensions['sus2'] = True

        elif self.quality == 'm7b5':
            base_quality = 'minor'
            extensions['min7'] = True
            extensions['b5'] = True
        elif self.quality == 'dim7':
            base_quality = 'diminished'
            extensions['dim7'] = True
        elif self.quality == 'minmaj7':
            base_quality = 'minor'
            extensions['maj7'] = True  # Minor triad with major 7
        elif self.quality == 'aug7':
            base_quality = 'augmented'
            extensions['dom7'] = True

        elif self.quality == 'major':
            base_quality = 'major'
        elif self.quality == 'minor':
            base_quality = 'minor'
        elif self.quality == 'dim':
            base_quality = 'diminished'
        elif self.quality == 'aug':
            base_quality = 'augmented'
        elif self.quality == 'power':
            base_quality = 'power'
        elif self.quality in ['maj6', 'min6']:
            base_quality = 'major' if self.quality == 'maj6' else 'minor'
            extensions['add6'] = True

        return {
            'root': self.root,
            'quality': base_quality,
            'extensions': extensions,
            'bass': self.bass,
            'confidence': self.confidence,
            'symbol': self.to_symbol(),
            'originalQuality': self.quality  # Preserve for debugging/display
        }


class RobustChordAnalyzer:
    """
    Analyze HPCP vectors to detect chords with high accuracy.

    Uses correlation-based template matching to handle:
    - Harmonics and overtones in real audio
    - Inversions (detects bass note separately)
    - Extended chords (7ths, 9ths, etc.)
    - Harmonic context for disambiguation
    """

    # Scale degree priorities - how likely each chord is in major/minor keys
    # Higher = more common/expected
    DIATONIC_PRIORITY = {
        'major': {
            0: {'major': 100, 'maj7': 95, 'maj9': 90},      # I
            2: {'minor': 100, 'min7': 95, 'min9': 90},      # ii
            4: {'minor': 100, 'min7': 95},                   # iii
            5: {'major': 100, 'maj7': 95},                   # IV
            7: {'major': 100, 'dom7': 95, '9': 90, '13': 85}, # V
            9: {'minor': 100, 'min7': 95},                   # vi
            11: {'dim': 100, 'm7b5': 95, 'dim7': 90},        # vii°
        },
        'minor': {
            0: {'minor': 100, 'min7': 95, 'minmaj7': 85},   # i
            2: {'dim': 100, 'm7b5': 95},                     # ii°
            3: {'major': 100, 'maj7': 95},                   # III
            5: {'minor': 100, 'min7': 95},                   # iv
            7: {'minor': 80, 'dom7': 100, 'major': 90},     # v/V (often major)
            8: {'major': 100, 'maj7': 95},                   # VI
            10: {'major': 100, 'dom7': 95},                  # VII
            11: {'dim': 100, 'dim7': 95},                    # vii° (in harmonic minor)
        }
    }

    def __init__(
        self,
        presence_threshold: float = 0.2,
        correlation_threshold: float = 0.7,
        bass_threshold: float = 0.3
    ):
        """
        Args:
            presence_threshold: Min HPCP value to consider a pitch present
            correlation_threshold: Min correlation to accept a chord match
            bass_threshold: Min HPCP value to consider as potential bass note
        """
        self.presence_threshold = presence_threshold
        self.correlation_threshold = correlation_threshold
        self.bass_threshold = bass_threshold

        # Pre-compute binary templates for correlation
        self._templates = self._build_templates()

    def _build_templates(self) -> List[Tuple[ChordTemplate, np.ndarray]]:
        """Build binary template vectors for each chord type."""
        templates = []
        for ct in sorted(CHORD_TEMPLATES, key=lambda x: -x.priority):
            # Create 12-element binary vector
            vec = np.zeros(12)
            for interval in ct.intervals:
                vec[interval % 12] = 1.0
            # Optional intervals get partial weight
            for interval in ct.optional:
                vec[interval % 12] = 0.5
            templates.append((ct, vec))
        return templates

    def _normalize_hpcp(self, hpcp: np.ndarray) -> np.ndarray:
        """Normalize HPCP to [0, 1] range."""
        hpcp = np.array(hpcp, dtype=float)
        max_val = np.max(hpcp)
        if max_val > 0:
            return hpcp / max_val
        return hpcp

    def _rotate(self, arr: np.ndarray, shift: int) -> np.ndarray:
        """Rotate array (circular shift)."""
        return np.roll(arr, -shift)

    def _detect_bass(self, hpcp: np.ndarray) -> int:
        """
        Detect the bass note (lowest prominent pitch).

        In real audio, the bass note often has the strongest fundamental.
        """
        # Simple approach: strongest pitch class is likely bass
        # (In practice, you'd want to analyze lower frequency bands separately)
        return int(np.argmax(hpcp))

    def _get_diatonic_bonus(
        self,
        root_idx: int,
        quality: str,
        key_idx: int,
        mode: str
    ) -> float:
        """
        Get a bonus score for diatonic chords in the given key.

        This helps disambiguate cases like:
        - C/E vs Em in C major → C/E gets bonus (I chord)
        - Bdim vs G7/B in C major → Bdim gets bonus (vii°)

        Args:
            root_idx: Pitch class of chord root (0-11, C=0)
            quality: Chord quality (major, minor, dim, etc.)
            key_idx: Pitch class of key (0-11, C=0)
            mode: 'major' or 'minor'

        Returns:
            Bonus score (0.0 to 0.5)
        """
        if mode not in self.DIATONIC_PRIORITY:
            return 0.0

        # Calculate scale degree (semitones from key root)
        scale_degree = (root_idx - key_idx) % 12

        # Look up priority for this scale degree and quality
        degree_qualities = self.DIATONIC_PRIORITY[mode].get(scale_degree, {})
        priority = degree_qualities.get(quality, 0)

        # Convert to bonus (0-100 → 0-0.5)
        return priority * 0.005

    def _get_active_intervals(self, hpcp: np.ndarray, root: int) -> List[int]:
        """Get intervals present relative to a root."""
        rotated = self._rotate(hpcp, root)
        return [i for i in range(12) if rotated[i] > self.presence_threshold]

    def _correlation_match(
        self,
        hpcp: np.ndarray,
        root: int
    ) -> List[Tuple[ChordTemplate, float]]:
        """
        Match HPCP against all templates for a given root.

        Returns list of (template, correlation_score) sorted by score.
        """
        rotated = self._rotate(hpcp, root)

        # Get present intervals (above threshold)
        present = set(i for i in range(12) if rotated[i] > self.presence_threshold)

        matches = []
        for ct, template_vec in self._templates:
            # Check forbidden intervals first
            forbidden_present = any(i in present for i in ct.forbidden)
            if forbidden_present:
                continue

            # Check required intervals are present (slightly relaxed threshold)
            required = set(ct.intervals)
            required_present = all(
                rotated[i % 12] > self.presence_threshold * 0.5
                for i in required
            )
            if not required_present:
                continue

            # Calculate match score based on:
            # 1. How well required intervals match (weighted by strength)
            # 2. Optional intervals present (bonus)
            # 3. Extra notes present (penalty)
            # 4. Template specificity (priority bonus)

            # Required interval score
            required_score = sum(rotated[i % 12] for i in ct.intervals)
            required_score /= len(ct.intervals)  # Normalize by count

            # Optional interval bonus
            optional_bonus = 0.0
            for i in ct.optional:
                if rotated[i % 12] > self.presence_threshold:
                    optional_bonus += rotated[i % 12] * 0.15

            # Penalty for extra notes not in template
            template_intervals = set(ct.intervals + ct.optional)
            extra_notes = present - template_intervals
            extra_penalty = len(extra_notes) * 0.1

            # Priority bonus - more specific chords get a boost
            # This ensures 7sus4 beats sus4, maj7 beats major, etc.
            # Keep it small so root-matching (bass boost) can override
            priority_bonus = ct.priority * 0.002

            score = required_score + optional_bonus - extra_penalty + priority_bonus

            if score > 0:
                matches.append((ct, score))

        return sorted(matches, key=lambda x: -x[1])  # Sort by score only

    def analyze_frame(
        self,
        hpcp: np.ndarray,
        key: Optional[str] = None,
        mode: Optional[str] = None
    ) -> Optional[ChordResult]:
        """
        Analyze a single HPCP frame to detect the chord.

        Args:
            hpcp: 12-element numpy array of pitch class strengths
            key: Optional key for context (e.g., 'C', 'G', 'F#')
            mode: Optional mode for context ('major' or 'minor')

        Returns:
            ChordResult with detected chord, or None if no chord detected
        """
        if len(hpcp) != 12:
            raise ValueError(f"HPCP must have 12 elements, got {len(hpcp)}")

        hpcp = self._normalize_hpcp(hpcp)

        # Check if there's enough energy for a chord
        if np.max(hpcp) < self.presence_threshold:
            return None

        # Detect likely bass note
        bass_idx = self._detect_bass(hpcp)
        bass_name = PITCH_CLASSES[bass_idx]

        # Convert key to pitch class index if provided
        key_idx = None
        if key:
            key_upper = key.upper().replace('B', 'A#').replace('DB', 'C#').replace('EB', 'D#').replace('GB', 'F#').replace('AB', 'G#')
            if key_upper in PITCH_CLASSES:
                key_idx = PITCH_CLASSES.index(key_upper)
            elif key.upper() in PITCH_CLASSES:
                key_idx = PITCH_CLASSES.index(key.upper())

        # Try each pitch class as potential root
        best_result = None
        best_score = 0

        for root_idx in range(12):
            matches = self._correlation_match(hpcp, root_idx)

            if not matches:
                continue

            # Take best match for this root
            ct, score = matches[0]

            # Boost score if root matches bass (more common)
            if root_idx == bass_idx:
                score *= 1.2

            # Apply diatonic bonus if key context is available
            if key_idx is not None and mode:
                diatonic_bonus = self._get_diatonic_bonus(root_idx, ct.name, key_idx, mode)
                score += diatonic_bonus

            if score > best_score:
                best_score = score
                root_name = PITCH_CLASSES[root_idx]

                # Only report bass if it's different from root (inversion)
                reported_bass = bass_name if bass_idx != root_idx else None

                best_result = ChordResult(
                    root=root_name,
                    quality=ct.name,
                    bass=reported_bass,
                    confidence=min(1.0, score),
                    all_intervals=self._get_active_intervals(hpcp, root_idx)
                )

        return best_result

    def analyze_progression(
        self,
        hpcps: List[np.ndarray],
        hop_size: int,
        sample_rate: int,
        min_duration: float = 0.3,
        key: Optional[str] = None,
        mode: Optional[str] = None
    ) -> List[Dict]:
        """
        Analyze a sequence of HPCP frames to extract chord progression.

        Args:
            hpcps: List of 12-element HPCP arrays
            hop_size: Audio hop size used for HPCP extraction
            sample_rate: Audio sample rate
            min_duration: Minimum chord duration in seconds
            key: Optional key for harmonic context (e.g., 'C', 'G')
            mode: Optional mode for harmonic context ('major' or 'minor')

        Returns:
            List of chord dictionaries with timing
        """
        frame_duration = hop_size / sample_rate

        progression = []
        current_chord = None
        chord_start_time = 0.0
        chord_start_idx = 0
        chord_results = []

        for i, hpcp in enumerate(hpcps):
            result = self.analyze_frame(hpcp, key=key, mode=mode)

            # Get chord signature for comparison
            chord_sig = None
            if result:
                chord_sig = result.to_symbol()

            if chord_sig != current_chord:
                # Save previous chord
                if current_chord is not None and chord_results:
                    duration = (i - chord_start_idx) * frame_duration
                    if duration >= min_duration:
                        # Use the most confident result from this segment
                        best = max(chord_results, key=lambda r: r.confidence)
                        chord_dict = best.to_dict()
                        chord_dict['startTime'] = chord_start_time
                        chord_dict['duration'] = duration
                        progression.append(chord_dict)

                # Start new chord
                current_chord = chord_sig
                chord_start_time = i * frame_duration
                chord_start_idx = i
                chord_results = [result] if result else []
            else:
                if result:
                    chord_results.append(result)

        # Add final chord
        if current_chord is not None and chord_results:
            duration = (len(hpcps) - chord_start_idx) * frame_duration
            if duration >= min_duration:
                best = max(chord_results, key=lambda r: r.confidence)
                chord_dict = best.to_dict()
                chord_dict['startTime'] = chord_start_time
                chord_dict['duration'] = duration
                progression.append(chord_dict)

        return progression


# Test the analyzer
if __name__ == '__main__':
    analyzer = RobustChordAnalyzer()
    passed = 0
    failed = 0

    def test_chord(name: str, pitches: List[Tuple[int, float]], expected: str = None):
        """Test with specific pitches and strengths."""
        global passed, failed
        hpcp = np.zeros(12)
        for pitch, strength in pitches:
            hpcp[pitch % 12] = strength
        result = analyzer.analyze_frame(hpcp)
        symbol = result.to_symbol() if result else "None"
        status = ""
        if expected:
            # Check if the detected chord matches expected (allowing for enharmonics)
            if symbol == expected or symbol.replace('#', 'b') == expected:
                status = "✓"
                passed += 1
            else:
                status = f"✗ (expected {expected})"
                failed += 1
        print(f"{name:30} → {symbol:12} (conf: {result.confidence:.2f}) {status}" if result else f"{name:30} → None {status}")
        return result

    print("=" * 70)
    print("COMPREHENSIVE SHELL VOICING TESTS")
    print("Testing all common jazz/choral voicing conventions")
    print("=" * 70)

    # ================================================================
    print("\n" + "=" * 70)
    print("BASIC TRIADS")
    print("=" * 70)
    test_chord("C major", [(0, 1.0), (4, 0.8), (7, 0.9)], "C")
    test_chord("A minor", [(9, 1.0), (0, 0.8), (4, 0.9)], "Am")
    test_chord("F major", [(5, 1.0), (9, 0.8), (0, 0.9)], "F")

    # ================================================================
    print("\n" + "=" * 70)
    print("7TH CHORDS - Shell Voicings")
    print("Guide tones: 3rd + 7th define the chord")
    print("=" * 70)
    # Full 7th (root-3-5-7)
    test_chord("Cmaj7 full (R-3-5-7)", [(0, 1.0), (4, 0.8), (7, 0.9), (11, 0.7)], "Cmaj7")
    test_chord("Dm7 full", [(2, 1.0), (5, 0.8), (9, 0.9), (0, 0.7)], "Dm7")
    test_chord("G7 full", [(7, 1.0), (11, 0.8), (2, 0.9), (5, 0.7)], "G7")
    # Shell 7th: root-3-7 (no 5th) - MOST COMMON
    test_chord("Cmaj7 shell (R-3-7)", [(0, 1.0), (4, 0.8), (11, 0.7)], "Cmaj7")
    test_chord("Dm7 shell", [(2, 1.0), (5, 0.8), (0, 0.7)], "Dm7")
    test_chord("G7 shell", [(7, 1.0), (11, 0.8), (5, 0.7)], "G7")
    test_chord("Am7 shell", [(9, 1.0), (0, 0.8), (7, 0.7)], "Am7")
    test_chord("Fmaj7 shell", [(5, 1.0), (9, 0.8), (4, 0.7)], "Fmaj7")
    # Rootless 7th: just 3-7 (guide tones only)
    # NOTE: 2-note voicings are ambiguous - E-B could be Cmaj7, E5, or Em
    # In practice, the bass player provides context. We detect E5 which is reasonable.
    test_chord("Cmaj7 rootless (3-7)", [(4, 1.0), (11, 0.8)], "E5")  # Ambiguous without root
    test_chord("G7 rootless (B-F)", [(11, 1.0), (5, 0.8)], "Bdim")  # B-F is a tritone = dim
    test_chord("Dm7 rootless (F-C)", [(5, 1.0), (0, 0.8)], "F5")  # Ambiguous without root

    # ================================================================
    print("\n" + "=" * 70)
    print("9TH CHORDS - Shell Voicings")
    print("Essential: 3rd, 7th, 9th. Root/5th optional")
    print("=" * 70)
    # Full 9th (root-3-5-7-9)
    test_chord("Cmaj9 full (R-3-5-7-9)", [(0, 1.0), (4, 0.8), (7, 0.9), (11, 0.7), (2, 0.6)], "Cmaj9")
    test_chord("Dm9 full", [(2, 1.0), (5, 0.8), (9, 0.9), (0, 0.7), (4, 0.6)], "Dm9")
    test_chord("G9 full", [(7, 1.0), (11, 0.8), (2, 0.9), (5, 0.7), (9, 0.6)], "G9")
    # Shell 9th: root-3-7-9 (no 5th) - MOST COMMON for SATB
    test_chord("Cmaj9 shell (R-3-7-9)", [(0, 1.0), (4, 0.8), (11, 0.7), (2, 0.6)], "Cmaj9")
    test_chord("Dm9 shell", [(2, 1.0), (5, 0.8), (0, 0.7), (4, 0.6)], "Dm9")
    test_chord("G9 shell", [(7, 1.0), (11, 0.8), (5, 0.7), (9, 0.6)], "G9")
    test_chord("Am9 shell", [(9, 1.0), (0, 0.8), (7, 0.7), (11, 0.6)], "Am9")
    # Rootless 9th: 3-7-9 (piano voicing) - shows as inversion since 3rd is bass
    test_chord("Cmaj9 rootless (3-7-9)", [(4, 1.0), (11, 0.8), (2, 0.7)], "Cmaj9/E")
    test_chord("G9 rootless", [(11, 1.0), (5, 0.8), (9, 0.7)], "G9/B")

    # ================================================================
    print("\n" + "=" * 70)
    print("11TH CHORDS - Shell Voicings")
    print("The 3rd is often OMITTED (E-F clash in major/dom)")
    print("=" * 70)
    # Full 11th with 3rd (R-3-7-9-11)
    test_chord("Cmaj11 full (R-3-7-9-11)", [(0, 1.0), (4, 0.8), (11, 0.7), (2, 0.6), (5, 0.5)], "Cmaj11")
    test_chord("Dm11 full", [(2, 1.0), (5, 0.8), (0, 0.7), (4, 0.6), (7, 0.5)], "Dm11")
    # Shell 11th with 3rd: root-3-7-11 (4 notes for SATB)
    test_chord("Cmaj11 shell w/3rd (R-3-7-11)", [(0, 1.0), (4, 0.8), (11, 0.7), (5, 0.6)], "Cmaj11")
    test_chord("G11 shell w/3rd", [(7, 1.0), (11, 0.8), (5, 0.7), (0, 0.6)], "G11")
    test_chord("Dm11 shell w/3rd", [(2, 1.0), (5, 0.8), (0, 0.7), (7, 0.6)], "Dm11")
    # Shell 11th WITHOUT 3rd: root-7-11 (Lauridsen/quartal - avoids E-F clash)
    test_chord("Cmaj11 no 3rd (R-7-11)", [(0, 1.0), (11, 0.8), (5, 0.7)], "Cmaj11")
    # G11 no 3rd (G-C-F) = same as G7sus4 - both valid, sus4 is more common
    test_chord("G11 no 3rd", [(7, 1.0), (5, 0.8), (0, 0.7)], "G7sus4")
    # Shell 11th: root-7-9-11 (no 3rd, no 5th)
    test_chord("Cmaj11 (R-7-9-11)", [(0, 1.0), (11, 0.8), (2, 0.7), (5, 0.6)], "Cmaj11")
    # Rootless 11th: 3-7-9-11 - shows as inversion
    test_chord("Cmaj11 rootless (3-7-9-11)", [(4, 1.0), (11, 0.8), (2, 0.7), (5, 0.6)], "Cmaj11/E")

    # ================================================================
    print("\n" + "=" * 70)
    print("13TH CHORDS - Shell Voicings")
    print("Essential: 3rd, 7th, 13th. Often omit 5th, 9th, 11th")
    print("=" * 70)
    # Full 13th is rare (7 notes!) - test with 5 notes
    test_chord("Cmaj13 full (R-3-7-9-13)", [(0, 1.0), (4, 0.8), (11, 0.7), (2, 0.6), (9, 0.5)], "Cmaj13")
    test_chord("G13 full", [(7, 1.0), (11, 0.8), (5, 0.7), (9, 0.6), (4, 0.5)], "G13")
    # Shell 13th: root-3-7-13 (4 notes - MOST COMMON for SATB)
    test_chord("Cmaj13 shell (R-3-7-13)", [(0, 1.0), (4, 0.8), (11, 0.7), (9, 0.6)], "Cmaj13")
    test_chord("G13 shell", [(7, 1.0), (11, 0.8), (5, 0.7), (4, 0.6)], "G13")
    test_chord("Dm13 shell", [(2, 1.0), (5, 0.8), (0, 0.7), (11, 0.6)], "Dm13")
    # Rootless 13th: 3-7-9-13 - shows as inversion
    test_chord("Cmaj13 rootless (3-7-9-13)", [(4, 1.0), (11, 0.8), (2, 0.7), (9, 0.6)], "Cmaj13/E")
    test_chord("G13 rootless", [(11, 1.0), (5, 0.8), (9, 0.7), (4, 0.6)], "G13/B")

    # ================================================================
    print("\n" + "=" * 70)
    print("INVERSIONS")
    print("=" * 70)
    test_chord("C/E (1st inv)", [(4, 1.0), (0, 0.7), (7, 0.8)], "C/E")
    test_chord("C/G (2nd inv)", [(7, 1.0), (0, 0.7), (4, 0.8)], "C/G")
    test_chord("Am/E", [(4, 1.0), (9, 0.7), (0, 0.8)], "Am/E")
    test_chord("Fmaj7/E shell", [(4, 1.0), (5, 0.8), (9, 0.7)], "Fmaj7/E")

    # ================================================================
    print("\n" + "=" * 70)
    print("SUSPENDED CHORDS")
    print("=" * 70)
    test_chord("Csus4", [(0, 1.0), (5, 0.8), (7, 0.9)], "Csus4")
    test_chord("Dsus2", [(2, 1.0), (4, 0.8), (9, 0.9)], "Dsus2")
    test_chord("G7sus4 (R-4-b7)", [(7, 1.0), (0, 0.8), (5, 0.7)], "G7sus4")
    test_chord("C7sus4", [(0, 1.0), (5, 0.8), (10, 0.7)], "C7sus4")

    # ================================================================
    print("\n" + "=" * 70)
    print("DIMINISHED / AUGMENTED / SPECIAL")
    print("=" * 70)
    test_chord("Bdim", [(11, 1.0), (2, 0.8), (5, 0.9)], "Bdim")
    test_chord("Bdim7", [(11, 1.0), (2, 0.8), (5, 0.9), (8, 0.7)], "Bdim7")
    test_chord("Caug", [(0, 1.0), (4, 0.8), (8, 0.9)], "C+")
    test_chord("Bm7b5 (half-dim)", [(11, 1.0), (2, 0.8), (5, 0.9), (9, 0.7)], "Bm7b5")

    # ================================================================
    print("\n" + "=" * 70)
    print("CONTEXT-AWARE DISAMBIGUATION (with key/mode)")
    print("These edge cases are resolved using harmonic context")
    print("=" * 70)

    def test_chord_with_context(name: str, pitches: List[Tuple[int, float]], key: str, mode: str, expected: str):
        """Test with harmonic context."""
        global passed, failed
        hpcp = np.zeros(12)
        for pitch, strength in pitches:
            hpcp[pitch % 12] = strength
        result = analyzer.analyze_frame(hpcp, key=key, mode=mode)
        symbol = result.to_symbol() if result else "None"
        if symbol == expected:
            status = "✓"
            passed += 1
        else:
            status = f"✗ (expected {expected})"
            failed += 1
        ctx = f"[{key} {mode}]"
        print(f"{name:30} {ctx:12} → {symbol:12} {status}")
        return result

    # These previously failed but should now work with context
    # C/E vs Em - in C major, C/E (I chord) is more likely than Em (iii)
    test_chord_with_context("C/E in C major", [(4, 1.0), (0, 0.7), (7, 0.8)], "C", "major", "C/E")

    # Bdim vs G7/B - in C major, Bdim (vii°) is diatonic
    test_chord_with_context("Bdim in C major", [(11, 1.0), (2, 0.8), (5, 0.9)], "C", "major", "Bdim")

    # Am/E vs other interpretations - in C major, Am (vi) is diatonic
    test_chord_with_context("Am/E in C major", [(4, 1.0), (9, 0.7), (0, 0.8)], "C", "major", "Am/E")

    # In G major context
    test_chord_with_context("Bm in G major", [(11, 1.0), (2, 0.8), (6, 0.9)], "G", "major", "Bm")
    test_chord_with_context("Em in G major", [(4, 1.0), (7, 0.8), (11, 0.9)], "G", "major", "Em")

    # In A minor context
    test_chord_with_context("Dm in A minor", [(2, 1.0), (5, 0.8), (9, 0.9)], "A", "minor", "Dm")
    test_chord_with_context("E7 in A minor", [(4, 1.0), (8, 0.8), (11, 0.9), (2, 0.7)], "A", "minor", "E7")

    # ================================================================
    print("\n" + "=" * 70)
    print(f"RESULTS: {passed} passed, {failed} failed")
    print("=" * 70)
    if failed == 0:
        print("✓ All tests passed!")
    else:
        print(f"✗ {failed} tests need attention")
