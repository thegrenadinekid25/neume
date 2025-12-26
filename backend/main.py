"""
Harmonic Canvas Backend API
FastAPI server for chord extraction and AI explanations
"""
import os
import tempfile
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import services - make audio processing optional
try:
    from services.youtube_downloader import download_youtube_audio
    from services.chord_extractor import extract_chords_from_audio
    AUDIO_PROCESSING_AVAILABLE = True
except ImportError as e:
    print(f"Audio processing not available: {e}")
    AUDIO_PROCESSING_AVAILABLE = False

from services.ai_explainer import get_chord_explanation
from services.deconstructor import deconstruct_progression
from services.suggestion_engine import generate_suggestions
from models.schemas import (
    AnalysisResponse,
    ExplanationRequest,
    ExplanationResponse,
    DeconstructRequest,
    DeconstructResponse,
    SuggestRequest,
    SuggestResponse
)

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Harmonic Canvas API",
    description="Audio analysis and chord extraction API",
    version="1.0.0"
)

# CORS configuration - read from environment for production flexibility
cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
cors_origins = [origin.strip() for origin in cors_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary directory for audio files
TEMP_DIR = Path(os.getenv("TEMP_DIR", "./temp"))
TEMP_DIR.mkdir(exist_ok=True)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Harmonic Canvas API",
        "version": "1.0.0"
    }


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_audio(
    youtube_url: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None),
    start_time: Optional[float] = Form(None),
    end_time: Optional[float] = Form(None),
    key_hint: Optional[str] = Form(None),
    mode_hint: Optional[str] = Form(None)
):
    """
    Analyze audio from YouTube URL or uploaded file
    Extract chords, key, tempo, and generate chord progression
    """
    if not AUDIO_PROCESSING_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Audio processing not available. Essentia/librosa not installed (Python 3.14 compatibility issue)."
        )

    try:
        audio_path = None

        # Download from YouTube or save uploaded file
        if youtube_url:
            print(f"Downloading YouTube video: {youtube_url}")
            audio_path = await download_youtube_audio(
                youtube_url,
                TEMP_DIR,
                start_time=start_time,
                end_time=end_time
            )
        elif audio_file:
            print(f"Processing uploaded file: {audio_file.filename}")
            # Save uploaded file
            audio_path = TEMP_DIR / f"upload_{audio_file.filename}"
            with open(audio_path, "wb") as f:
                content = await audio_file.read()
                f.write(content)
        else:
            raise HTTPException(
                status_code=400,
                detail="Must provide either youtube_url or audio_file"
            )

        # Extract chords from audio
        print(f"Extracting chords from: {audio_path}")
        result = extract_chords_from_audio(
            str(audio_path),
            key_hint=key_hint,
            mode_hint=mode_hint
        )

        # Add source URL if YouTube
        if youtube_url:
            result["source_url"] = youtube_url

        # Clean up temporary file
        if audio_path and audio_path.exists():
            audio_path.unlink()

        return result

    except Exception as e:
        print(f"Error analyzing audio: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/explain", response_model=ExplanationResponse)
async def explain_chord(request: ExplanationRequest):
    """
    Get AI explanation for a chord in context
    Uses Anthropic Claude API
    """
    try:
        explanation = await get_chord_explanation(
            request.chord,
            request.previous_chord,
            request.next_chord,
            request.key,
            request.mode
        )

        return ExplanationResponse(explanation=explanation)

    except Exception as e:
        print(f"Error generating explanation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/deconstruct", response_model=DeconstructResponse)
async def deconstruct_endpoint(request: DeconstructRequest):
    """
    Deconstruct a complex progression into evolutionary steps.
    Returns 3-6 meaningful steps showing how complexity emerged.
    """
    try:
        result = await deconstruct_progression(
            chords=request.chords,
            key=request.key,
            mode=request.mode,
            composer_style=request.composer_style
        )

        return DeconstructResponse(**result)

    except Exception as e:
        print(f"Error deconstructing progression: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/suggest", response_model=SuggestResponse)
async def suggest_endpoint(request: SuggestRequest):
    """
    Generate AI suggestions based on emotional intent.
    User describes what they want to feel, AI suggests harmonic techniques.
    """
    try:
        suggestions = await generate_suggestions(
            intent=request.intent,
            chords=request.chords,
            key=request.context.get("key", "C"),
            mode=request.context.get("mode", "major")
        )

        return SuggestResponse(suggestions=suggestions)

    except Exception as e:
        print(f"Error generating suggestions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
