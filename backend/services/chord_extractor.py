"""
Chord extraction using Essentia library
Real music information retrieval - no mocks!
"""
import essentia
import essentia.standard as es
import numpy as np
from typing import Optional, List, Dict
from datetime import datetime
import uuid


def extract_chords_from_audio(
    audio_file_path: str,
    key_hint: Optional[str] = None,
    mode_hint: Optional[str] = None
) -> Dict:
    """
    Extract chords from audio file using Essentia

    Args:
        audio_file_path: Path to audio file (WAV, MP3, etc.)
        key_hint: Optional key hint ('C', 'D', etc.)
        mode_hint: Optional mode hint ('major', 'minor')

    Returns:
        Dictionary with chord progression data
    """
    print(f"Loading audio from {audio_file_path}")

    # Load audio
    loader = es.MonoLoader(filename=audio_file_path, sampleRate=44100)
    audio = loader()

    print(f"Audio loaded: {len(audio)} samples, {len(audio)/44100:.2f} seconds")

    # 1. Detect key
    key_detector = es.KeyExtractor()
    key, scale, key_strength = key_detector(audio)

    # Use hint if provided
    if key_hint:
        key = key_hint
    if mode_hint:
        scale = mode_hint

    print(f"Detected key: {key} {scale} (strength: {key_strength:.2f})")

    # 2. Detect tempo (BPM)
    rhythm_extractor = es.RhythmExtractor2013()
    bpm, beats, beats_confidence, _, beats_intervals = rhythm_extractor(audio)

    print(f"Detected tempo: {bpm:.1f} BPM ({len(beats)} beats)")

    # 3. Extract chords using HPCP (Harmonic Pitch Class Profile)
    # This is the core chord recognition algorithm

    # Frame-wise analysis
    frame_size = 4096
    hop_size = 2048

    # HPCP extractor (chromagram)
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
        hopSize=hop_size,
        sampleRate=44100
    )

    # Process audio to get HPCPs
    hpcps = []
    for frame in es.FrameGenerator(audio, frameSize=frame_size, hopSize=hop_size):
        frame_windowed = windowing(frame)
        frame_spectrum = spectrum(frame_windowed)
        freqs, mags = spectral_peaks(frame_spectrum)
        frame_hpcp = hpcp(freqs, mags)
        hpcps.append(frame_hpcp)

    # Detect chords from HPCPs
    chords, chord_strengths = chord_detector(essentia.array(hpcps))

    print(f"Detected {len(chords)} chord segments")

    # 4. Convert to chord progression
    chord_progression = []

    # Group consecutive identical chords
    current_chord = None
    start_beat = 0.0
    beat_duration = 60.0 / bpm  # seconds per beat

    for i, chord_name in enumerate(chords):
        # Skip 'N' (no chord) or very weak chords
        if chord_name == 'N' or chord_strengths[i] < 0.1:
            continue

        if chord_name != current_chord:
            if current_chord is not None:
                # Save previous chord
                chord_data = parse_chord_name(current_chord, key, scale, start_beat)
                if chord_data:
                    chord_progression.append(chord_data)

            current_chord = chord_name
            start_beat = (i * hop_size / 44100) / beat_duration  # Convert to beats

    # Add final chord
    if current_chord and current_chord != 'N':
        chord_data = parse_chord_name(current_chord, key, scale, start_beat)
        if chord_data:
            chord_progression.append(chord_data)

    print(f"Chord progression: {len(chord_progression)} chords")

    # 5. Build response
    return {
        "title": "Analyzed Audio",
        "composer": None,
        "key": key,
        "mode": scale,
        "tempo": float(bpm),
        "chords": chord_progression,
        "analyzed_at": datetime.utcnow().isoformat()
    }


def parse_chord_name(
    chord_name: str,
    key: str,
    mode: str,
    start_beat: float
) -> Optional[Dict]:
    """
    Parse Essentia chord name to our chord format

    Essentia format: "C", "C#", "Dm", "Gmaj7", etc.
    Our format: scale degree, quality, extensions
    """
    # Map note names to scale degrees
    note_to_degree = {
        'C': 1, 'C#': 1, 'Db': 2, 'D': 2, 'D#': 2, 'Eb': 3,
        'E': 3, 'F': 4, 'F#': 4, 'Gb': 5, 'G': 5, 'G#': 5,
        'Ab': 6, 'A': 6, 'A#': 6, 'Bb': 7, 'B': 7
    }

    # Extract root note and quality
    root = chord_name.split(':')[0] if ':' in chord_name else chord_name[:2] if '#' in chord_name or 'b' in chord_name else chord_name[0]
    remainder = chord_name[len(root):]

    # Determine quality
    quality = 'major'
    extensions = {}

    if 'm' in remainder or 'min' in remainder:
        quality = 'minor'
    if 'dim' in remainder:
        quality = 'diminished'
    if 'aug' in remainder:
        quality = 'augmented'
    if '7' in remainder:
        quality = 'dom7' if quality == 'major' else 'min7'
    if 'maj7' in remainder:
        quality = 'maj7'

    # Get scale degree
    scale_degree = note_to_degree.get(root, 1)

    # Position chords horizontally
    x_position = 100 + (len([1]) * 320)  # Spread out horizontally

    return {
        "id": str(uuid.uuid4()),
        "scale_degree": scale_degree,
        "quality": quality,
        "extensions": extensions,
        "key": key,
        "mode": mode,
        "is_chromatic": False,
        "voices": {
            "soprano": "C4",
            "alto": "C4",
            "tenor": "C3",
            "bass": "C3"
        },
        "start_beat": start_beat,
        "duration": 4.0,
        "position": {"x": x_position, "y": 200.0},
        "size": 60.0,
        "selected": False,
        "playing": False,
        "source": "analyzed",
        "created_at": datetime.utcnow().isoformat()
    }
