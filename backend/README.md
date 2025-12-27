# Neume Backend API

FastAPI backend for chord extraction using Essentia.

## Setup

### Prerequisites
- Python 3.9+
- FFmpeg installed (`brew install ffmpeg` on macOS)
- Essentia library

### Installation

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Running the Server

```bash
python main.py
```

Server runs on http://localhost:8000

API docs available at http://localhost:8000/docs

## API Endpoints

### POST /api/analyze
Analyze audio and extract chord progression.

**Request Body:**
```json
{
  "type": "youtube" | "audio",
  "youtubeUrl": "https://youtube.com/watch?v=...",
  "videoId": "dQw4w9WgXcQ",
  "uploadId": "uuid-for-uploaded-file",
  "startTime": 0,
  "endTime": null,
  "keyHint": "auto",
  "modeHint": "auto"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "title": "Song Title",
    "key": "D",
    "mode": "major",
    "tempo": 120,
    "chords": [...]
  }
}
```

### POST /api/upload
Upload audio file for analysis.

Returns an uploadId to use with the analyze endpoint.

### GET /api/analyze/status/{job_id}
Check analysis progress for long-running jobs.

## Environment Variables

- `PORT`: Server port (default: 8000)
- `CORS_ORIGINS`: Comma-separated allowed origins

## Development

Run with auto-reload:
```bash
uvicorn main:app --reload --port 8000
```
