"""
Chord extraction using Essentia library + RobustChordAnalyzer
Uses Essentia for HPCP extraction, custom analyzer for chord detection.
Supports extended chords, inversions, and shell voicings.
"""
import essentia.standard as es
import numpy as np
from typing import Optional, Dict, Tuple, List

from services.chord_analyzer import RobustChordAnalyzer


class ChordExtractor:
    """
    Extract chords from audio using Essentia's HPCP + RobustChordAnalyzer.

    This combines:
    - Essentia's excellent HPCP (Harmonic Pitch Class Profile) extraction
    - Our custom RobustChordAnalyzer for detecting extended chords, inversions, etc.
    """

    def __init__(self):
        self.sample_rate = 44100
        self.frame_size = 4096
        self.hop_size = 2048
        self.chord_analyzer = RobustChordAnalyzer()

    def extract_chords(
        self,
        audio_file: str,
        key_hint: str = "auto",
        mode_hint: str = "auto"
    ) -> Dict:
        """
        Extract chords from audio file.

        Args:
            audio_file: Path to audio file (WAV, MP3, etc.)
            key_hint: Optional key hint ('C', 'D', etc.) or "auto"
            mode_hint: Optional mode hint ('major', 'minor') or "auto"

        Returns:
            Dictionary with key, mode, tempo, and chords list
        """
        print(f"Loading audio from {audio_file}")

        # Load audio
        loader = es.MonoLoader(filename=audio_file, sampleRate=self.sample_rate)
        audio = loader()

        print(f"Audio loaded: {len(audio)} samples, {len(audio)/self.sample_rate:.2f} seconds")

        # 1. Detect key
        key_detector = es.KeyExtractor()
        detected_key, detected_scale, key_strength = key_detector(audio)

        # Use hints if provided (not "auto")
        key = detected_key if key_hint == "auto" else key_hint
        mode = detected_scale if mode_hint == "auto" else mode_hint

        print(f"Key: {key} {mode} (detected: {detected_key} {detected_scale}, strength: {key_strength:.2f})")

        # 1b. Find HPCP rotation to align with detected key
        # The HPCP may be shifted due to non-standard tuning or audio processing
        # We find the rotation needed to align HPCP with the key's triad
        hpcp_rotation = self._find_hpcp_rotation(audio, key, mode)
        if hpcp_rotation != 0:
            print(f"HPCP rotation: {hpcp_rotation} semitones (aligning to {key})")

        # 2. Detect tempo (BPM)
        rhythm_extractor = es.RhythmExtractor2013()
        bpm, beats, beats_confidence, _, beats_intervals = rhythm_extractor(audio)

        print(f"Raw detected tempo: {bpm:.1f} BPM ({len(beats)} beats)")

        # Tempo octave correction for slow pieces
        # RhythmExtractor often detects 2x the actual tempo for slow music
        # If BPM > 100, check if halving it makes more sense
        if bpm > 100:
            # Heuristic: if very few beats detected per second of audio, tempo is likely too fast
            audio_duration = len(audio) / self.sample_rate
            beats_per_second = len(beats) / audio_duration if audio_duration > 0 else 0

            # If there's roughly 1-2 beats per second but BPM says 120+, likely double-time error
            if beats_per_second < 3 and bpm > 100:
                bpm = bpm / 2
                print(f"Tempo corrected (octave halved): {bpm:.1f} BPM")

        print(f"Final tempo: {bpm:.1f} BPM")

        # 3. Extract HPCP (Harmonic Pitch Class Profile) using Essentia
        hpcps = self._extract_hpcps(audio)
        print(f"Extracted {len(hpcps)} HPCP frames")

        # Apply rotation to align HPCP with detected key
        if hpcp_rotation != 0:
            hpcps = [np.roll(h, -hpcp_rotation) for h in hpcps]
            print(f"Applied {hpcp_rotation}-semitone rotation to {len(hpcps)} frames")

        # 4. Analyze chords using our RobustChordAnalyzer
        # Pass detected key/mode for harmonic context disambiguation
        # Adaptive minimum duration based on tempo to filter passing tones
        beat_duration = 60.0 / bpm  # seconds per beat
        if bpm < 70:
            # Slow pieces (like O Magnum): require ~0.75 beats minimum
            min_beats = 0.75
        elif bpm < 100:
            # Medium tempo: require ~0.5 beats minimum
            min_beats = 0.5
        else:
            # Fast pieces: require ~0.4 beats minimum
            min_beats = 0.4
        min_chord_duration = max(0.3, beat_duration * min_beats)  # At least 300ms
        print(f"Adaptive min chord duration: {min_chord_duration:.2f}s ({min_beats} beats at {bpm:.0f} BPM)")

        chord_progression = self.chord_analyzer.analyze_progression(
            hpcps=hpcps,
            hop_size=self.hop_size,
            sample_rate=self.sample_rate,
            min_duration=min_chord_duration,
            key=key,           # Use detected/hinted key for context
            mode=mode          # Use detected/hinted mode for context
        )

        # Convert to the expected format (chord field as string)
        for chord in chord_progression:
            chord['chord'] = chord.pop('symbol')

        print(f"Detected {len(chord_progression)} chords: {[c['chord'] for c in chord_progression]}")

        return {
            "key": key,
            "mode": mode,
            "tempo": float(bpm),
            "chords": chord_progression
        }

    def _find_hpcp_rotation(self, audio: np.ndarray, key: str, mode: str) -> int:
        """
        Find the optimal rotation to align HPCP with the detected key.

        The HPCP algorithm may not align with absolute pitch due to:
        - Non-standard tuning (baroque, etc.)
        - Audio processing in the recording
        - Sample rate/format issues

        We try all 12 rotations and pick the one where the HPCP
        best correlates with the expected key triad.

        Returns the number of semitones to rotate HPCP left.
        """
        # Pitch class indices: C=0, C#=1, D=2, etc.
        pitch_class_map = {
            'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
            'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
            'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
        }

        key_root = pitch_class_map.get(key, 0)

        # Build expected triad indices (relative to key root at position 0)
        if mode == 'minor':
            # Minor: root, minor 3rd (+3), perfect 5th (+7)
            triad = [key_root, (key_root + 3) % 12, (key_root + 7) % 12]
        else:
            # Major: root, major 3rd (+4), perfect 5th (+7)
            triad = [key_root, (key_root + 4) % 12, (key_root + 7) % 12]

        # Sample audio
        sample_duration = min(30, len(audio) / self.sample_rate)
        sample_frames = int(sample_duration * self.sample_rate)
        audio_sample = audio[:sample_frames]

        # Extract HPCPs at standard reference
        hpcps = self._extract_hpcps(audio_sample, reference_frequency=440.0)
        if not hpcps:
            return 0

        # Average HPCP
        avg_hpcp = np.mean(hpcps, axis=0)
        if np.max(avg_hpcp) > 0:
            avg_hpcp = avg_hpcp / np.max(avg_hpcp)

        # Try all 12 rotations and find the best match to the expected key triad
        best_rotation = 0
        best_score = -1

        for rotation in range(12):
            rotated = np.roll(avg_hpcp, -rotation)
            # Score: sum of energy at triad positions
            score = sum(rotated[pc] for pc in triad)

            if score > best_score:
                best_score = score
                best_rotation = rotation

        # Only return rotation if it significantly improves the score
        # (Check if rotation=0 is already good enough)
        unrotated_score = sum(avg_hpcp[pc] for pc in triad)
        if best_score > unrotated_score * 1.1:  # At least 10% improvement
            return best_rotation

        return 0

    def _extract_hpcps(self, audio: np.ndarray, reference_frequency: float = 440.0) -> List[np.ndarray]:
        """
        Extract HPCP (Harmonic Pitch Class Profile) from audio.

        HPCP is a 12-dimensional vector representing the energy in each
        pitch class (C, C#, D, ..., B). This is the foundation for
        chord detection.

        Args:
            audio: Audio samples
            reference_frequency: Reference frequency for A4 (default 440Hz)
        """
        windowing = es.Windowing(type='blackmanharris62')
        spectrum = es.Spectrum()
        spectral_peaks = es.SpectralPeaks(
            orderBy='magnitude',
            magnitudeThreshold=0.00001,
            minFrequency=40,
            maxFrequency=5000,
            maxPeaks=60
        )

        hpcp = es.HPCP(
            size=12,  # 12 pitch classes
            referenceFrequency=reference_frequency,
            harmonics=8,
            windowSize=1.0
        )

        hpcps = []
        for frame in es.FrameGenerator(audio, frameSize=self.frame_size, hopSize=self.hop_size):
            frame_windowed = windowing(frame)
            frame_spectrum = spectrum(frame_windowed)
            freqs, mags = spectral_peaks(frame_spectrum)
            frame_hpcp = hpcp(freqs, mags)
            hpcps.append(np.array(frame_hpcp))

        return hpcps


def parse_chord_label(label: str) -> Tuple[str, str, Dict[str, bool]]:
    """
    Parse Essentia chord label to our format.

    Args:
        label: Chord label like "C", "Am", "F#m", "Gmaj7"

    Returns:
        Tuple of (root, quality, extensions)
    """
    if not label or label == 'N':
        return ('C', 'major', {})

    # Handle sharps and flats in root
    if len(label) > 1 and label[1] in ['#', 'b']:
        root = label[:2]
        suffix = label[2:]
    else:
        root = label[0]
        suffix = label[1:]

    # Determine quality
    quality = 'major'
    extensions = {}

    suffix_lower = suffix.lower()

    if 'm' in suffix_lower and 'maj' not in suffix_lower:
        quality = 'minor'

    if 'dim' in suffix_lower:
        quality = 'diminished'
    elif 'aug' in suffix_lower:
        quality = 'augmented'

    if '7' in suffix:
        extensions['7'] = True
        if 'm' in suffix_lower and 'maj' not in suffix_lower:
            quality = 'min7'
        elif 'maj' in suffix_lower:
            quality = 'maj7'
        else:
            quality = 'dom7'

    if '9' in suffix:
        extensions['add9'] = True

    return (root, quality, extensions)
