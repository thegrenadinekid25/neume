"""
Chord extraction using Essentia library
Real music information retrieval - no mocks!
"""
import essentia
import essentia.standard as es
import numpy as np
from typing import Optional, Dict, Tuple


class ChordExtractor:
    """Extract chords from audio using Essentia's HPCP algorithm."""

    def __init__(self):
        self.sample_rate = 44100
        self.frame_size = 4096
        self.hop_size = 2048

    def extract_chords(
        self,
        audio_file: str,
        key_hint: str = "auto",
        mode_hint: str = "auto"
    ) -> Dict:
        """
        Extract chords from audio file using Essentia.

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

        print(f"Detected tempo: {bpm:.1f} BPM ({len(beats)} beats)")

        # 3. Extract chords using HPCP (Harmonic Pitch Class Profile)
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

        # Chord detector
        chord_detector = es.ChordsDetection(
            hopSize=self.hop_size,
            sampleRate=self.sample_rate
        )

        # Process audio to get HPCPs
        hpcps = []
        for frame in es.FrameGenerator(audio, frameSize=self.frame_size, hopSize=self.hop_size):
            frame_windowed = windowing(frame)
            frame_spectrum = spectrum(frame_windowed)
            freqs, mags = spectral_peaks(frame_spectrum)
            frame_hpcp = hpcp(freqs, mags)
            hpcps.append(frame_hpcp)

        # Detect chords from HPCPs
        chords, chord_strengths = chord_detector(essentia.array(hpcps))

        print(f"Detected {len(chords)} chord segments")

        # 4. Convert to chord progression with timing
        chord_progression = []
        frame_duration = self.hop_size / self.sample_rate  # seconds per frame

        current_chord = None
        chord_start_time = 0.0
        chord_start_idx = 0

        for i, (chord_name, strength) in enumerate(zip(chords, chord_strengths)):
            # Skip 'N' (no chord) or very weak chords
            if chord_name == 'N' or strength < 0.1:
                continue

            if chord_name != current_chord:
                if current_chord is not None:
                    # Save previous chord
                    duration = (i - chord_start_idx) * frame_duration
                    if duration > 0.5:  # Only include chords longer than 0.5s
                        chord_progression.append({
                            "startTime": chord_start_time,
                            "duration": duration,
                            "chord": current_chord,
                            "confidence": float(np.mean([chord_strengths[j] for j in range(chord_start_idx, i) if chords[j] == current_chord]))
                        })

                current_chord = chord_name
                chord_start_time = i * frame_duration
                chord_start_idx = i

        # Add final chord
        if current_chord and current_chord != 'N':
            duration = (len(chords) - chord_start_idx) * frame_duration
            if duration > 0.5:
                chord_progression.append({
                    "startTime": chord_start_time,
                    "duration": duration,
                    "chord": current_chord,
                    "confidence": float(np.mean([chord_strengths[j] for j in range(chord_start_idx, len(chords)) if chords[j] == current_chord]))
                })

        print(f"Chord progression: {[c['chord'] for c in chord_progression]}")

        return {
            "key": key,
            "mode": mode,
            "tempo": float(bpm),
            "chords": chord_progression
        }


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
