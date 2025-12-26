# Week 4 Prompt 002: Backend Chord Extraction API

**Server-side chord recognition using Essentia and AI analysis**

---

## Objective

Create a backend API that receives audio files or YouTube URLs, extracts chord progressions using Essentia (Python), and returns structured chord data. This is the intelligence layer that powers the "Analyze" feature.

---

## Context

**Where This Fits:**
- User uploads file/URL in Analyze Modal (Prompt 001)
- This API processes the audio and extracts chords
- Returns progression to frontend for display (Prompt 003)
- AI explains each chord (Prompt 005)

**Dependencies:**
- ✅ Prompt 001: Analyze Modal (provides input format)
- ✅ Python 3.9+ installed
- ✅ FFmpeg installed (for YouTube audio extraction)

**Blocks:**
- Prompt 003: Frontend needs this API's response format
- Prompt 005: AI explanations need chord analysis data

**Technology Stack:**
- Python 3.9+ with FastAPI
- Essentia 2.1+ (chord recognition)
- yt-dlp (YouTube audio extraction)
- librosa (audio analysis)
- Anthropic Claude API (optional AI enhancement)

---

## Requirements

### API Endpoints

**1. POST /api/analyze**

**Purpose:** Main analysis endpoint

**Input (JSON):**
```json
{
  "type": "youtube" | "audio",
  
  // If YouTube
  "youtubeUrl": "https://youtube.com/watch?v=...",
  "videoId": "dQw4w9WgXcQ",
  
  // If audio file
  "audioData": "base64_encoded_audio" OR "file_upload_id",
  
  // Optional parameters
  "startTime": 0,      // seconds
  "endTime": null,     // null = full audio
  "keyHint": "auto",   // "auto" | "C" | "D" | etc.
  "modeHint": "auto"   // "auto" | "major" | "minor"
}
```

**Output (JSON):**
```json
{
  "success": true,
  "result": {
    "title": "O Magnum Mysterium",
    "composer": "Morten Lauridsen",
    "key": "D",
    "mode": "major",
    "tempo": 66,
    "timeSignature": "4/4",
    "chords": [
      {
        "startBeat": 0,
        "duration": 4,
        "root": "D",
        "quality": "major",
        "extensions": { "add9": true },
        "confidence": 0.89
      },
      // ... more chords
    ],
    "sourceUrl": "https://youtube.com/watch?v=...",
    "analyzedAt": "2024-12-01T10:30:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "DOWNLOAD_FAILED" | "ANALYSIS_FAILED" | "INVALID_INPUT",
    "message": "Couldn't download audio from YouTube",
    "retryable": true
  }
}
```

---

**2. GET /api/analyze/status/{job_id}**

**Purpose:** Check analysis progress (for long-running jobs)

**Output:**
```json
{
  "status": "processing" | "complete" | "failed",
  "progress": 65,
  "stage": "Extracting chords...",
  "estimatedTimeRemaining": 12
}
```

---

**3. POST /api/upload**

**Purpose:** Upload audio file (for large files, use multipart)

**Input:** Multipart form data with audio file

**Output:**
```json
{
  "uploadId": "abc123",
  "expiresAt": "2024-12-01T11:30:00Z"
}
```

---

### Chord Extraction Algorithm

**Process:**

1. **Download/Load Audio**
   - YouTube: Use yt-dlp to extract audio
   - File: Decode uploaded audio
   - Convert to 44.1kHz mono WAV

2. **Extract Features**
   - Use Essentia's HPCP (Harmonic Pitch Class Profile)
   - Beat tracking for chord boundaries
   - Key estimation

3. **Detect Chords**
   - Essentia's ChordsDetection algorithm
   - Map to Roman numerals based on key
   - Calculate confidence scores

4. **Quantize to Beats**
   - Align chords to beat grid
   - Merge short chords (< 0.5 beats)
   - Snap to nearest beat

5. **Enrich with Extensions**
   - Detect 7ths, 9ths, suspensions
   - Use HPCP spectral analysis
   - AI validation (optional)

6. **Return Structured Data**
   - Convert to frontend format
   - Include metadata (title, composer, etc.)

---

### Implementation (Python)

**File Structure:**
```
backend/
├── main.py                  # FastAPI app
├── services/
│   ├── youtube_downloader.py
│   ├── chord_extractor.py
│   └── audio_processor.py
├── models/
│   └── schemas.py           # Pydantic models
├── utils/
│   └── roman_numeral.py     # Key → Roman numeral conversion
├── requirements.txt
└── README.md
```

---

### Core Dependencies

```txt
# requirements.txt

fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
pydantic==2.5.0

# Audio processing
essentia==2.1b6.dev1110
librosa==0.10.1
numpy==1.24.3
scipy==1.11.4

# YouTube
yt-dlp==2023.11.16

# Optional AI
anthropic==0.7.7

# Utilities
python-dotenv==1.0.0
```

---

### Essentia Chord Extraction

```python
# services/chord_extractor.py

import essentia.standard as es
import numpy as np
from typing import List, Dict

class ChordExtractor:
    def __init__(self):
        self.sample_rate = 44100
        
    def extract_chords(
        self, 
        audio_file: str,
        key_hint: str = "auto",
        mode_hint: str = "auto"
    ) -> Dict:
        """
        Extract chords from audio file using Essentia.
        
        Returns:
            {
                "key": "D",
                "mode": "major",
                "tempo": 66,
                "chords": [
                    {
                        "startTime": 0.0,
                        "duration": 2.42,
                        "chord": "D",
                        "confidence": 0.89
                    },
                    ...
                ]
            }
        """
        
        # Load audio
        loader = es.MonoLoader(filename=audio_file)
        audio = loader()
        
        # Extract key
        key, scale, strength = self._extract_key(audio, key_hint, mode_hint)
        
        # Extract tempo
        tempo = self._extract_tempo(audio)
        
        # Extract chords
        chords = self._extract_chord_sequence(audio, key, scale)
        
        return {
            "key": key,
            "mode": scale,
            "tempo": tempo,
            "chords": chords
        }
    
    def _extract_key(self, audio, key_hint, mode_hint):
        """Extract musical key using Essentia KeyExtractor."""
        
        if key_hint != "auto":
            # Use provided key hint
            return (key_hint, mode_hint, 1.0)
        
        key_extractor = es.KeyExtractor()
        key, scale, strength = key_extractor(audio)
        
        # Convert to our format
        # Essentia returns: "A", "major", 0.89
        return (key, scale, strength)
    
    def _extract_tempo(self, audio):
        """Extract tempo using RhythmExtractor."""
        
        rhythm_extractor = es.RhythmExtractor2013()
        bpm, beats, beats_confidence, _, _ = rhythm_extractor(audio)
        
        return round(bpm)
    
    def _extract_chord_sequence(self, audio, key, scale):
        """Extract chord sequence using HPCP and ChordsDetection."""
        
        # Frame-based analysis
        frame_size = 4096
        hop_size = 2048
        
        # Windowing
        w = es.Windowing(type='blackmanharris62')
        
        # FFT
        fft = es.FFT()
        
        # Spectral peaks
        spectral_peaks = es.SpectralPeaks()
        
        # HPCP
        hpcp = es.HPCP()
        
        # Chords detection
        chords_detection = es.ChordsDetection()
        
        # Process frames
        hpcp_frames = []
        
        for frame in es.FrameGenerator(audio, frameSize=frame_size, hopSize=hop_size):
            # Window
            windowed = w(frame)
            
            # FFT
            spectrum = fft(windowed)
            
            # Spectral peaks
            frequencies, magnitudes = spectral_peaks(spectrum)
            
            # HPCP
            hpcp_frame = hpcp(frequencies, magnitudes)
            hpcp_frames.append(hpcp_frame)
        
        # Convert to numpy array
        hpcp_array = np.array(hpcp_frames)
        
        # Detect chords
        chord_labels, chord_strengths = chords_detection(hpcp_array)
        
        # Convert frame indices to time
        frame_duration = hop_size / self.sample_rate
        
        chords = []
        current_chord = None
        current_start = 0
        
        for i, (chord, strength) in enumerate(zip(chord_labels, chord_strengths)):
            time = i * frame_duration
            
            if chord != current_chord:
                # Chord change
                if current_chord is not None:
                    chords.append({
                        "startTime": current_start,
                        "duration": time - current_start,
                        "chord": current_chord,
                        "confidence": strength
                    })
                
                current_chord = chord
                current_start = time
        
        # Add final chord
        if current_chord:
            chords.append({
                "startTime": current_start,
                "duration": len(audio) / self.sample_rate - current_start,
                "chord": current_chord,
                "confidence": chord_strengths[-1]
            })
        
        return chords
```

---

### YouTube Audio Extraction

```python
# services/youtube_downloader.py

import yt_dlp
import os
from typing import Dict

class YouTubeDownloader:
    def __init__(self, output_dir: str = "./temp"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
    
    def download_audio(self, video_id: str) -> Dict:
        """
        Download audio from YouTube video.
        
        Returns:
            {
                "filepath": "/path/to/audio.wav",
                "title": "Video Title",
                "duration": 245.6
            }
        """
        
        url = f"https://www.youtube.com/watch?v={video_id}"
        
        output_path = os.path.join(self.output_dir, f"{video_id}.wav")
        
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'wav',
            }],
            'outtmpl': output_path.replace('.wav', ''),
            'quiet': True,
            'no_warnings': True,
        }
        
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                
                return {
                    "filepath": output_path,
                    "title": info.get('title', 'Unknown'),
                    "duration": info.get('duration', 0)
                }
        
        except Exception as e:
            raise Exception(f"Failed to download: {str(e)}")
```

---

### FastAPI Application

```python
# main.py

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uuid
import os

from services.youtube_downloader import YouTubeDownloader
from services.chord_extractor import ChordExtractor
from utils.roman_numeral import to_roman_numeral

app = FastAPI(title="Harmonic Canvas Chord Extraction API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services
youtube_downloader = YouTubeDownloader()
chord_extractor = ChordExtractor()

# Pydantic models
class AnalyzeRequest(BaseModel):
    type: str  # "youtube" | "audio"
    youtubeUrl: Optional[str] = None
    videoId: Optional[str] = None
    audioData: Optional[str] = None
    uploadId: Optional[str] = None
    startTime: Optional[float] = 0
    endTime: Optional[float] = None
    keyHint: str = "auto"
    modeHint: str = "auto"

class ChordData(BaseModel):
    startBeat: float
    duration: float
    root: str
    quality: str
    extensions: dict
    confidence: float

class AnalyzeResponse(BaseModel):
    success: bool
    result: Optional[dict] = None
    error: Optional[dict] = None

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_audio(request: AnalyzeRequest):
    """
    Analyze audio and extract chord progression.
    """
    
    try:
        # Step 1: Get audio file
        if request.type == "youtube":
            if not request.videoId:
                raise HTTPException(400, "videoId required for YouTube")
            
            # Download from YouTube
            download_result = youtube_downloader.download_audio(request.videoId)
            audio_file = download_result["filepath"]
            title = download_result["title"]
        
        elif request.type == "audio":
            # Handle uploaded file
            if not request.uploadId:
                raise HTTPException(400, "uploadId required for audio file")
            
            audio_file = f"./temp/{request.uploadId}.wav"
            title = "Uploaded Audio"
        
        else:
            raise HTTPException(400, "Invalid type")
        
        # Step 2: Extract chords
        analysis = chord_extractor.extract_chords(
            audio_file,
            key_hint=request.keyHint,
            mode_hint=request.modeHint
        )
        
        # Step 3: Convert to frontend format
        chords = []
        tempo = analysis["tempo"]
        beats_per_second = tempo / 60
        
        for chord_data in analysis["chords"]:
            # Convert time to beats
            start_beat = chord_data["startTime"] * beats_per_second
            duration_beats = chord_data["duration"] * beats_per_second
            
            # Parse chord (e.g., "D" → root="D", quality="major")
            root, quality, extensions = parse_chord_label(chord_data["chord"])
            
            chords.append({
                "startBeat": round(start_beat, 2),
                "duration": round(duration_beats, 2),
                "root": root,
                "quality": quality,
                "extensions": extensions,
                "confidence": chord_data["confidence"]
            })
        
        # Step 4: Clean up temp files
        if os.path.exists(audio_file):
            os.remove(audio_file)
        
        # Step 5: Return result
        return AnalyzeResponse(
            success=True,
            result={
                "title": title,
                "key": analysis["key"],
                "mode": analysis["mode"],
                "tempo": analysis["tempo"],
                "timeSignature": "4/4",  # Default for now
                "chords": chords,
                "sourceUrl": request.youtubeUrl if request.type == "youtube" else None,
                "analyzedAt": datetime.now().isoformat()
            }
        )
    
    except Exception as e:
        return AnalyzeResponse(
            success=False,
            error={
                "code": "ANALYSIS_FAILED",
                "message": str(e),
                "retryable": True
            }
        )

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload audio file for analysis.
    """
    
    upload_id = str(uuid.uuid4())
    filepath = f"./temp/{upload_id}.wav"
    
    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)
    
    return {
        "uploadId": upload_id,
        "expiresAt": (datetime.now() + timedelta(hours=1)).isoformat()
    }

def parse_chord_label(label: str):
    """
    Parse Essentia chord label to our format.
    
    Examples:
        "D" → ("D", "major", {})
        "Dm" → ("D", "minor", {})
        "D7" → ("D", "major", {"7": True})
        "Dm7" → ("D", "minor", {"7": True})
    """
    
    # Implementation depends on Essentia's output format
    # This is a simplified version
    
    root = label[0]
    quality = "minor" if "m" in label else "major"
    extensions = {}
    
    if "7" in label:
        extensions["7"] = True
    if "9" in label:
        extensions["add9"] = True
    
    return root, quality, extensions

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## Integration Points

### Frontend Integration

```typescript
// In analysis-store.ts

async startAnalysis(input: AnalysisInput) {
  set({ isAnalyzing: true, progress: { stage: 'uploading', progress: 0, message: 'Uploading...' } });
  
  try {
    // If audio file, upload first
    if (input.type === 'audio' && input.audioFile) {
      const formData = new FormData();
      formData.append('file', input.audioFile);
      
      const uploadRes = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const { uploadId } = await uploadRes.json();
      input.uploadId = uploadId;
    }
    
    // Analyze
    set({ progress: { stage: 'analyzing', progress: 50, message: 'Analyzing chords...' } });
    
    const response = await fetch('http://localhost:8000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    
    const data = await response.json();
    
    if (data.success) {
      set({ result: data.result, isAnalyzing: false });
    } else {
      set({ error: data.error, isAnalyzing: false });
    }
  } catch (error) {
    set({ 
      error: { code: 'NETWORK_ERROR', message: error.message, retryable: true },
      isAnalyzing: false 
    });
  }
}
```

---

## Quality Criteria

- [ ] **API responds quickly** - <30 seconds for typical song
- [ ] **YouTube download works** - Handles various URL formats
- [ ] **Chord extraction accurate** - >70% accuracy on tonal music
- [ ] **Key detection correct** - Matches expected key >80% of time
- [ ] **Tempo estimation close** - Within ±5 BPM
- [ ] **Error handling robust** - Graceful failures with helpful messages
- [ ] **CORS configured** - Frontend can connect
- [ ] **File cleanup** - Temp files deleted after analysis
- [ ] **Type safety** - Pydantic models validate all data
- [ ] **Documentation clear** - API docs auto-generated by FastAPI

---

## Testing Considerations

### Test Cases

1. **YouTube analysis**
   - URL: https://youtube.com/watch?v=YourTestVideo
   - Should extract chords within 30 seconds
   - Should return correct key and tempo

2. **Audio file upload**
   - Upload .mp3 file
   - Should process and return chords
   - Should clean up temp files

3. **Error handling**
   - Invalid YouTube URL → 400 error
   - Non-existent video → Download failed error
   - Corrupt audio file → Analysis failed error

4. **Edge cases**
   - Very short audio (<10 sec) → Handle gracefully
   - Very long audio (>10 min) → May need timeout/streaming
   - Atonal music → Return best guess or error

---

## Deployment Notes

### Running Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Install system dependencies
# macOS: brew install ffmpeg essentia
# Linux: sudo apt-get install ffmpeg libessentia-dev

# Run server
python main.py

# Server runs on http://localhost:8000
# API docs: http://localhost:8000/docs
```

### Production Deployment

- Use Docker for consistent environment
- Set up proper CORS for production domain
- Add authentication/rate limiting
- Use background job queue (Celery) for long analyses
- Store results in database (PostgreSQL)

---

## Success Criteria

- [ ] API accepts YouTube URLs and audio files
- [ ] Essentia successfully extracts chords
- [ ] Returns accurate key and tempo
- [ ] Chord sequence aligns with beats
- [ ] Frontend can connect and receive responses
- [ ] Error handling is comprehensive
- [ ] Performance is acceptable (<30 sec typical)
- [ ] Code is well-documented
- [ ] FastAPI docs auto-generated

---

## Next Steps

After completing this prompt:

1. **Test with real music** - Try various pieces
2. **Tune accuracy** - Adjust Essentia parameters
3. **Move to Prompt 003** - Display analyzed progressions
4. **Optional: Add AI enhancement** - Use Claude to improve chord labeling

---

**Output Format:** Complete Python backend API with FastAPI, Essentia integration, and comprehensive error handling.

**Estimated Time:** 3-4 hours (including Essentia setup)
