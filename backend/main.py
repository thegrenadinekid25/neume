"""
Neume Chord Extraction API
FastAPI backend for analyzing music and extracting chord progressions
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uuid
import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
import anthropic

from models.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    UploadResponse,
    StatusResponse,
    ChordData,
    AnalysisResultData,
    ErrorData,
    ExplainRequest,
    ExplainResponse,
    ExplainChordData,
    EvolutionStep,
    DeconstructRequest,
    DeconstructResponse,
    SimpleChord,
    DeconstructStep
)
from services.youtube_downloader import YouTubeDownloader
from services.chord_extractor import ChordExtractor, parse_chord_label
from services.deconstructor import ProgressionDeconstructor

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Neume Chord Extraction API",
    description="Extract chord progressions from audio files and YouTube videos",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
youtube_downloader = YouTubeDownloader(output_dir="./temp")
chord_extractor = ChordExtractor()
progression_deconstructor = ProgressionDeconstructor()

# Ensure temp directory exists
os.makedirs("./temp", exist_ok=True)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "service": "Neume Chord Extraction API"}


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_audio(request: AnalyzeRequest):
    """Analyze audio and extract chord progression."""
    try:
        audio_file = None
        title = "Unknown"
        source_url = None

        if request.type == "youtube":
            if not request.videoId:
                raise HTTPException(status_code=400, detail="videoId required for YouTube")

            download_result = youtube_downloader.download_audio(request.videoId)
            audio_file = download_result["filepath"]
            title = download_result["title"]
            source_url = request.youtubeUrl

        elif request.type == "audio":
            if not request.uploadId:
                raise HTTPException(status_code=400, detail="uploadId required for audio file")

            audio_file = f"./temp/{request.uploadId}.wav"
            if not os.path.exists(audio_file):
                raise HTTPException(status_code=404, detail="Uploaded file not found")
            title = "Uploaded Audio"

        else:
            raise HTTPException(status_code=400, detail="Invalid type. Must be 'youtube' or 'audio'")

        analysis = chord_extractor.extract_chords(
            audio_file,
            key_hint=request.keyHint,
            mode_hint=request.modeHint
        )

        tempo = analysis["tempo"]
        beats_per_second = tempo / 60.0

        chords = []
        for chord_data in analysis["chords"]:
            start_beat = chord_data["startTime"] * beats_per_second
            duration_beats = chord_data["duration"] * beats_per_second
            root, quality, extensions = parse_chord_label(chord_data["chord"])

            chords.append(ChordData(
                startBeat=round(start_beat, 2),
                duration=round(duration_beats, 2),
                root=root,
                quality=quality,
                extensions=extensions,
                confidence=chord_data["confidence"]
            ))

        if request.type == "youtube" and request.videoId:
            youtube_downloader.cleanup(request.videoId)

        return AnalyzeResponse(
            success=True,
            result=AnalysisResultData(
                title=title,
                key=analysis["key"],
                mode=analysis["mode"],
                tempo=analysis["tempo"],
                timeSignature="4/4",
                chords=chords,
                sourceUrl=source_url,
                analyzedAt=datetime.now().isoformat()
            )
        )

    except HTTPException:
        raise
    except Exception as e:
        return AnalyzeResponse(
            success=False,
            error=ErrorData(
                code="ANALYSIS_FAILED",
                message=str(e),
                retryable=True
            )
        )


@app.post("/api/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload audio file for analysis."""
    valid_types = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/m4a']
    if file.content_type not in valid_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Supported: MP3, WAV, M4A")

    upload_id = str(uuid.uuid4())
    filepath = f"./temp/{upload_id}.wav"

    try:
        with open(filepath, "wb") as f:
            content = await file.read()
            if len(content) > 50 * 1024 * 1024:
                raise HTTPException(status_code=400, detail="File must be under 50MB")
            f.write(content)

        return UploadResponse(
            uploadId=upload_id,
            expiresAt=(datetime.now() + timedelta(hours=1)).isoformat()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.get("/api/analyze/status/{job_id}", response_model=StatusResponse)
async def get_analysis_status(job_id: str):
    """Check analysis progress for long-running jobs."""
    return StatusResponse(
        status="complete",
        progress=100,
        stage="Analysis complete"
    )


# Scale degree names for explanation prompts
SCALE_DEGREE_NAMES = {
    1: 'Tonic',
    2: 'Supertonic',
    3: 'Mediant',
    4: 'Subdominant',
    5: 'Dominant',
    6: 'Submediant',
    7: 'Leading Tone',
}


def to_roman_numeral(degree: int, quality: str, mode: str) -> str:
    """Convert scale degree and quality to Roman numeral notation."""
    major_numerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
    minor_numerals = ['i', 'ii°', 'III', 'iv', 'V', 'VI', 'VII']
    numerals = minor_numerals if mode == 'minor' else major_numerals
    numeral = numerals[degree - 1] if 1 <= degree <= 7 else str(degree)

    # Adjust for quality overrides
    if quality == 'major' and numeral == numeral.lower():
        numeral = numeral.upper()
    elif quality == 'minor' and numeral == numeral.upper():
        numeral = numeral.lower()
    if quality == 'dom7':
        numeral += '7'
    if quality == 'maj7':
        numeral += 'maj7'
    if quality == 'min7':
        numeral += 'm7'

    return numeral


def summarize_progression(chords: list[ExplainChordData], mode: str) -> str:
    """Summarize a full progression as Roman numerals."""
    if not chords:
        return ''
    return ' → '.join(to_roman_numeral(c.scaleDegree, c.quality, mode) for c in chords)


def build_explanation_prompt(
    chord: ExplainChordData,
    prev_chord: ExplainChordData | None,
    next_chord: ExplainChordData | None,
    full_progression: list[ExplainChordData] | None,
    song_title: str | None,
    composer: str | None
) -> str:
    """Build prompt for Claude API."""
    prompt = "You are an expert music theorist and musicologist. Analyze the following chord in its full musical context.\n\n"

    # Song context if available
    if song_title or composer:
        prompt += "## Song Information\n"
        if song_title:
            prompt += f'Title: "{song_title}"\n'
        if composer:
            prompt += f"Artist/Composer: {composer}\n"
        prompt += "\n"

    # Key and mode
    prompt += "## Musical Context\n"
    prompt += f"Key: {chord.key} {chord.mode}\n"

    # Full progression summary
    if full_progression:
        progression_summary = summarize_progression(full_progression, chord.mode)
        chord_position = next((i + 1 for i, c in enumerate(full_progression) if c.id == chord.id), 0)
        prompt += f"Full Progression: {progression_summary}\n"
        prompt += f"This chord is #{chord_position} of {len(full_progression)} in the sequence.\n"
    prompt += "\n"

    # Current chord details
    roman_numeral = to_roman_numeral(chord.scaleDegree, chord.quality, chord.mode)
    prompt += "## Chord Being Analyzed\n"
    prompt += f"Chord: {roman_numeral} (Scale Degree {chord.scaleDegree}, Quality: {chord.quality})\n"
    prompt += f"Voicing: Soprano-{chord.voices.soprano}, Alto-{chord.voices.alto}, Tenor-{chord.voices.tenor}, Bass-{chord.voices.bass}\n"

    if chord.isChromatic:
        prompt += f"Chromatic Type: {chord.chromaticType}\n"
    prompt += "\n"

    # Immediate harmonic context
    if prev_chord or next_chord:
        prompt += "## Immediate Harmonic Context\n"
        if prev_chord:
            prev_numeral = to_roman_numeral(prev_chord.scaleDegree, prev_chord.quality, chord.mode)
            prompt += f"Previous: {prev_numeral} ({SCALE_DEGREE_NAMES.get(prev_chord.scaleDegree, 'Unknown')})\n"
        prompt += f"Current: {roman_numeral} ({SCALE_DEGREE_NAMES.get(chord.scaleDegree, 'Unknown')})\n"
        if next_chord:
            next_numeral = to_roman_numeral(next_chord.scaleDegree, next_chord.quality, chord.mode)
            prompt += f"Next: {next_numeral} ({SCALE_DEGREE_NAMES.get(next_chord.scaleDegree, 'Unknown')})\n"
        prompt += "\n"

    # Analysis request
    prompt += "## Analysis Request\n"
    prompt += "Provide a comprehensive analysis covering:\n"
    prompt += "1. CONTEXTUAL: How does this chord function within this specific progression? "
    if song_title:
        prompt += f'Consider the style and era of "{song_title}" if you recognize it. '
    prompt += "Explain the harmonic function (tonic, dominant, subdominant, etc.) and why this chord works here.\n"
    prompt += "2. TECHNICAL: Analyze the voice leading, any notable intervals, and the quality choice.\n"
    prompt += "3. HISTORICAL: If this is a recognized song, mention its significance. Otherwise, describe the historical/stylistic context of this harmonic technique.\n"
    prompt += "4. MACRO PATTERNS: If you can identify patterns across the whole progression (like repeated harmonic motions, tension/release cycles, or common chord sequences), mention them.\n\n"

    prompt += "Respond with valid JSON:\n"
    prompt += "{\n"
    prompt += '  "contextual": "detailed explanation of harmonic function and why it works here",\n'
    prompt += '  "technical": "voice leading and technical analysis",\n'
    prompt += '  "historical": "historical/stylistic context or song-specific information",\n'
    prompt += '  "evolutionSteps": [\n'
    prompt += '    { "name": "step name", "description": "description" }\n'
    prompt += "  ]\n"
    prompt += "}\n"
    prompt += "\nReturn only the JSON object."

    return prompt


@app.post("/api/explain", response_model=ExplainResponse)
async def explain_chord(request: ExplainRequest):
    """Get AI-powered explanation for a chord choice."""
    api_key = os.getenv("CLAUDE_API_KEY")

    if not api_key:
        return ExplainResponse(
            success=False,
            error="Claude API key not configured"
        )

    try:
        # Build the prompt
        prompt = build_explanation_prompt(
            chord=request.chord,
            prev_chord=request.prevChord,
            next_chord=request.nextChord,
            full_progression=request.fullProgression,
            song_title=request.songContext.title if request.songContext else None,
            composer=request.songContext.composer if request.songContext else None
        )

        # Call Claude API
        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        # Parse the response
        content = message.content[0].text if message.content else ""

        # Clean up potential markdown code blocks
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content
        if content.endswith("```"):
            content = content.rsplit("```", 1)[0]
        content = content.strip()

        explanation = json.loads(content)

        return ExplainResponse(
            success=True,
            contextual=explanation.get("contextual"),
            technical=explanation.get("technical"),
            historical=explanation.get("historical"),
            evolutionSteps=[
                EvolutionStep(name=step.get("name", ""), description=step.get("description", ""))
                for step in explanation.get("evolutionSteps", [])
            ]
        )

    except json.JSONDecodeError as e:
        return ExplainResponse(
            success=False,
            error=f"Failed to parse Claude response: {str(e)}"
        )
    except anthropic.APIError as e:
        return ExplainResponse(
            success=False,
            error=f"Claude API error: {str(e)}"
        )
    except Exception as e:
        return ExplainResponse(
            success=False,
            error=f"Explanation failed: {str(e)}"
        )


@app.post("/api/deconstruct", response_model=DeconstructResponse)
async def deconstruct_progression(request: DeconstructRequest):
    """
    Analyze a chord progression and return its step-by-step evolution.

    Takes a complex progression and breaks it down into simpler components,
    showing how it evolves from basic triads through various extensions.

    Input:
    {
      "chords": [
        {"root": "C", "quality": "major", "extensions": {}},
        ...
      ],
      "key": "C",
      "mode": "major"
    }

    Output:
    {
      "success": true,
      "steps": [
        {
          "stepNumber": 0,
          "stepName": "Skeleton",
          "description": "...",
          "chords": [...]
        },
        ...
      ]
    }
    """
    try:
        # Convert SimpleChord objects to dictionaries for the deconstructor
        chord_dicts = [
            {
                "root": chord.root,
                "quality": chord.quality,
                "extensions": chord.extensions or {}
            }
            for chord in request.chords
        ]

        # Perform deconstruction
        steps_data = await progression_deconstructor.deconstruct(
            chord_dicts,
            request.key,
            request.mode
        )

        # Convert to DeconstructStep objects
        steps = [
            DeconstructStep(
                stepNumber=step["stepNumber"],
                stepName=step["stepName"],
                description=step["description"],
                chords=[
                    SimpleChord(
                        root=c["root"],
                        quality=c["quality"],
                        extensions=c.get("extensions")
                    )
                    for c in step["chords"]
                ]
            )
            for step in steps_data
        ]

        return DeconstructResponse(
            success=True,
            steps=steps
        )

    except Exception as e:
        return DeconstructResponse(
            success=False,
            error=f"Deconstruction failed: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
