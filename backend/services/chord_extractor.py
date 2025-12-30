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

        # 4. Analyze chords using our RobustChordAnalyzer
        # Pass detected key/mode for harmonic context disambiguation
        # Use shorter minimum duration to capture more harmonic detail
        min_chord_duration = 0.2  # 200ms - capture faster harmonic changes

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

    def _extract_hpcps(self, audio: np.ndarray) -> List[np.ndarray]:
        """
        Extract HPCP (Harmonic Pitch Class Profile) from audio.

        HPCP is a 12-dimensional vector representing the energy in each
        pitch class (C, C#, D, ..., B). This is the foundation for
        chord detection.
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
            referenceFrequency=440,
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
