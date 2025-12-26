# Neume Backend

Real music information retrieval backend using **Essentia** for chord extraction and **Anthropic Claude** for AI explanations.

## Features

- **Chord Extraction**: Real chord recognition using Essentia's HPCP algorithm
- **YouTube Support**: Download and analyze audio from YouTube videos
- **Audio Upload**: Support for MP3, WAV, M4A files
- **Key Detection**: Automatic key and mode detection
- **Tempo Detection**: BPM extraction with beat tracking
- **AI Explanations**: Claude-powered educational explanations

## Prerequisites

### System Requirements
- Python 3.9+
- FFmpeg (for audio processing)
- 8GB RAM minimum (Essentia is memory-intensive)

### macOS Installation
```bash
# Install FFmpeg
brew install ffmpeg

# Install Essentia
brew install essentia

# Or use conda:
conda install -c mtg essentia
```

### Linux Installation
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install ffmpeg python3-dev libfftw3-dev libyaml-dev

# Install Essentia from source or conda
conda install -c mtg essentia
```

### Windows Installation
1. Download FFmpeg from https://ffmpeg.org/download.html
2. Install Python packages (Essentia may need conda on Windows)

## Setup

### 1. Create Virtual Environment
```bash
cd backend/
python -m venv venv

# Activate
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your API key
# ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Run Server
```bash
python main.py
```

Server runs at `http://localhost:8000`

API docs available at `http://localhost:8000/docs`

## API Endpoints

### POST /api/analyze
Analyze audio from YouTube or uploaded file

**Form Data:**
- `youtube_url` (string, optional): YouTube video URL
- `audio_file` (file, optional): Audio file upload
- `start_time` (float, optional): Start time in seconds
- `end_time` (float, optional): End time in seconds
- `key_hint` (string, optional): Key hint (C, D, E, etc.)
- `mode_hint` (string, optional): Mode hint (major, minor)

**Response:**
```json
{
  "title": "Analyzed Audio",
  "composer": null,
  "key": "C",
  "mode": "major",
  "tempo": 120.0,
  "chords": [...],
  "source_url": "https://youtube.com/...",
  "analyzed_at": "2024-01-01T00:00:00"
}
```

### POST /api/explain
Get AI explanation for a chord

**JSON Body:**
```json
{
  "chord": {...},
  "previous_chord": {...},
  "next_chord": {...},
  "key": "C",
  "mode": "major"
}
```

**Response:**
```json
{
  "explanation": "This is a dominant V chord..."
}
```

## How It Works

### Chord Extraction Pipeline

1. **Audio Loading**: Load audio file (WAV, MP3, etc.) at 44.1kHz mono
2. **Key Detection**: Use Essentia's KeyExtractor algorithm
3. **Tempo Detection**: Extract BPM and beat positions
4. **HPCP Extraction**: Compute Harmonic Pitch Class Profile (chromagram)
5. **Chord Detection**: Identify chords using trained chord recognition
6. **Post-Processing**: Group consecutive chords, filter weak detections
7. **Roman Numeral Conversion**: Convert absolute chords to scale degrees

### Accuracy Expectations

- **Classical/choral music**: 70-80% accuracy
- **Pop/rock**: 75-85% accuracy
- **Jazz/complex harmony**: 50-60% accuracy
- **Atonal music**: <50% (not well-suited)

## Troubleshooting

### Essentia Installation Fails
```bash
# Try conda instead of pip
conda install -c mtg essentia

# Or build from source (advanced)
git clone https://github.com/MTG/essentia.git
cd essentia
python waf configure --build-static --with-python
python waf
sudo python waf install
```

### YouTube Download Fails
```bash
# Update yt-dlp
pip install -U yt-dlp

# Test manually
yt-dlp -x --audio-format wav "https://youtube.com/watch?v=..."
```

### CORS Errors
Check that frontend URL is in `CORS_ORIGINS` in `.env`:
```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Memory Issues
Essentia is memory-intensive. If you get memory errors:
- Process shorter audio segments (use start_time/end_time)
- Reduce audio quality
- Increase system RAM allocation

## Development

### Run with Auto-Reload
```bash
uvicorn main:app --reload --port 8000
```

### Run Tests
```bash
pytest tests/
```

### Format Code
```bash
black .
isort .
```

## Production Deployment

### Environment Variables
```bash
ANTHROPIC_API_KEY=your_production_key
CORS_ORIGINS=https://your-frontend.com
TEMP_DIR=/var/tmp/neume
MAX_FILE_SIZE_MB=50
```

### Run with Gunicorn
```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Docker (Optional)
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## License

MIT

## Credits

- **Essentia**: Music Information Retrieval library by Music Technology Group (UPF)
- **Anthropic Claude**: AI explanations
- **yt-dlp**: YouTube downloader
