"""
Neume Chord Extraction API
FastAPI backend for analyzing music and extracting chord progressions
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import uuid
import os
import json
import asyncio
from datetime import datetime, timedelta
from dotenv import load_dotenv
import anthropic
from typing import List

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
    DeconstructStep,
    SuggestRequest,
    SuggestResponse,
    SuggestionData,
    ChordInsightRequest,
    ChordInsightResponse,
)
from services.youtube_downloader import YouTubeDownloader, YouTubeDownloaderError
from services.chord_extractor import ChordExtractor, parse_chord_label
from services.deconstructor import ProgressionDeconstructor
from services.emotional_mapper import EmotionalMapper

# Load environment variables
load_dotenv()

# Claude API Configuration
CLAUDE_MODEL = "claude-opus-4-5-20250929"

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI app
app = FastAPI(
    title="Neume Chord Extraction API",
    description="Extract chord progressions from audio files and YouTube videos",
    version="1.0.0"
)

# Add rate limiter to app state
app.state.limiter = limiter

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


# Custom exception handler for rate limit exceeded
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "success": False,
            "error": {
                "code": "RATE_LIMIT_EXCEEDED",
                "message": f"Too many requests. Limit: {exc.detail}. Please try again later.",
                "retryable": True,
                "retryAfter": 3600
            }
        },
        headers={"Retry-After": "3600"}
    )


# Initialize services
youtube_downloader = YouTubeDownloader(output_dir="./temp")
chord_extractor = ChordExtractor()
progression_deconstructor = ProgressionDeconstructor()
emotional_mapper = EmotionalMapper()

# Ensure temp directory exists
os.makedirs("./temp", exist_ok=True)


@app.on_event("startup")
async def validate_api_key():
    """Validate Claude API key on startup."""
    api_key = os.getenv("CLAUDE_API_KEY")

    if not api_key:
        print("\n" + "=" * 60)
        print("WARNING: CLAUDE_API_KEY not found in environment variables!")
        print("AI features will not work. Set CLAUDE_API_KEY in .env file.")
        print("=" * 60 + "\n")
        return

    if not api_key.startswith("sk-ant-"):
        print("\n" + "=" * 60)
        print("WARNING: CLAUDE_API_KEY appears invalid (should start with 'sk-ant-')")
        print("=" * 60 + "\n")
        return

    print("✓ Claude API key validated successfully")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "service": "Neume Chord Extraction API"}


@app.post("/api/analyze", response_model=AnalyzeResponse)
@limiter.limit("10/hour")
async def analyze_audio(request_obj: Request, request: AnalyzeRequest):
    """Analyze audio and extract chord progression."""
    try:
        audio_file = None
        title = "Unknown"
        source_url = None

        if request.type == "youtube":
            if not request.videoId:
                raise HTTPException(status_code=400, detail="videoId required for YouTube")

            try:
                download_result = await youtube_downloader.download_audio(request.videoId)
                audio_file = download_result["filepath"]
                title = download_result["title"]
                source_url = request.youtubeUrl
            except YouTubeDownloaderError as e:
                return AnalyzeResponse(
                    success=False,
                    error=ErrorData(
                        code="YOUTUBE_DOWNLOAD_FAILED",
                        message=e.message,
                        retryable=e.retryable
                    )
                )
            except asyncio.TimeoutError:
                return AnalyzeResponse(
                    success=False,
                    error=ErrorData(
                        code="DOWNLOAD_TIMEOUT",
                        message="Download timed out after 5 minutes",
                        retryable=True
                    )
                )

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
@limiter.limit("30/hour")
async def explain_chord(request_obj: Request, request: ExplainRequest):
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
            model=CLAUDE_MODEL,
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
@limiter.limit("20/hour")
async def deconstruct_progression(request_obj: Request, request: DeconstructRequest):
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

        # Perform deconstruction with optional song context
        steps_data = await progression_deconstructor.deconstruct(
            chord_dicts,
            request.key,
            request.mode,
            song_title=request.songTitle,
            composer=request.composer
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


# Chord manipulation functions for suggestions

def apply_technique(chord: SimpleChord, technique: str) -> SimpleChord:
    """
    Apply a harmonic technique to a chord.

    Args:
        chord: The original chord
        technique: Technique name like "add9", "sus4", etc.

    Returns:
        Modified chord
    """
    new_extensions = chord.extensions.copy() if chord.extensions else {}

    if technique == "add9":
        new_extensions["add9"] = True
    elif technique == "sus4":
        new_extensions["sus4"] = True
    elif technique == "sus2":
        new_extensions["sus2"] = True
    elif technique == "maj7":
        new_extensions["maj7"] = True
    elif technique == "min7":
        new_extensions["min7"] = True
    elif technique == "dom7":
        new_extensions["dom7"] = True
    elif technique == "open_voicing":
        new_extensions["open_voicing"] = True
    elif technique == "modal_mixture":
        new_extensions["modal_mixture"] = True
    elif technique == "chromatic":
        new_extensions["chromatic"] = True
    elif technique == "V-I":
        # V-I is a progression, not an extension
        new_extensions["V-I"] = True
    elif technique == "ascending_bass":
        new_extensions["ascending_bass"] = True
    elif technique == "root_position":
        new_extensions["root_position"] = True
    elif technique == "parallel_motion":
        new_extensions["parallel_motion"] = True
    elif technique == "parallel_9ths":
        new_extensions["parallel_9ths"] = True
    elif technique == "extended_harmony":
        new_extensions["extended_harmony"] = True
    elif technique == "low_register":
        new_extensions["low_register"] = True
    elif technique == "dense_voicing":
        new_extensions["dense_voicing"] = True

    return SimpleChord(
        root=chord.root,
        quality=chord.quality,
        extensions=new_extensions
    )


async def build_suggestion_explanation(
    from_chord: SimpleChord,
    to_chord: SimpleChord,
    technique: str,
    intent: str,
    composers: List[str],
    key: str,
    mode: str
) -> str:
    """
    Build an AI explanation for a chord suggestion.

    Args:
        from_chord: Original chord
        to_chord: Modified chord
        technique: Applied technique
        intent: User's emotional intent
        composers: Relevant composers
        key: Musical key
        mode: Major or minor

    Returns:
        AI-generated explanation
    """
    api_key = os.getenv("CLAUDE_API_KEY")

    if not api_key:
        return "The added extension creates a harmonic shift. Listen carefully to the sound difference."

    prompt = f"""You are an expert music theorist explaining chord refinements.

A composer wants their chord to sound: "{intent}"

Original chord: {from_chord.root} {from_chord.quality}
Modified chord: {to_chord.root} {to_chord.quality}
Technique applied: {technique}
Key: {key} {mode}
Relevant composers: {', '.join(composers)}

Provide a concise, educational explanation (1-2 sentences) of:
1. What this technique does to the sound
2. Why it matches the emotional intent
3. Which composer(s) use this technique

Keep it conversational and engaging. No markdown formatting."""

    try:
        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=256,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        return message.content[0].text if message.content else ""

    except Exception as e:
        print(f"Error generating explanation: {str(e)}")
        return f"The {technique} creates a harmonic shift characteristic of modern composition techniques."


def calculate_relevance_score(technique: str, intent: str, avoid_list: List[str]) -> float:
    """
    Calculate relevance score for a suggestion.

    Args:
        technique: The technique applied
        intent: User's emotional intent
        avoid_list: Techniques to avoid for this intent

    Returns:
        Relevance score from 0.0 to 1.0
    """
    base_score = 0.7

    # Penalize avoided techniques
    if technique in avoid_list:
        return 0.3

    # Boost score based on technique popularity
    popular_techniques = ["add9", "sus4", "maj7", "minor_mode"]
    if technique in popular_techniques:
        base_score = 0.85

    return min(1.0, base_score + 0.1)


@app.post("/api/suggest", response_model=SuggestResponse)
@limiter.limit("20/hour")
async def suggest_refinements(request_obj: Request, request: SuggestRequest):
    """
    Generate chord refinement suggestions based on emotional intent.

    Takes a free-form emotional description and generates harmonic suggestions
    that match the requested feeling or style.

    Input:
    {
      "intent": "More ethereal and floating",
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
      "suggestions": [
        {
          "id": "suggestion-1",
          "technique": "add9",
          "fromChord": {...},
          "toChord": {...},
          "rationale": "The added 9th creates shimmer...",
          "examples": ["Lauridsen", "Whitacre"],
          "relevanceScore": 0.85
        },
        ...
      ]
    }
    """
    try:
        # Get techniques based on emotional intent
        techniques = emotional_mapper.get_techniques(request.intent)
        composers = emotional_mapper.get_composers(request.intent)
        avoid = emotional_mapper.should_avoid(request.intent)

        if not techniques:
            return SuggestResponse(
                success=True,
                suggestions=[]
            )

        suggestions = []
        suggestion_id = 0

        # Generate suggestions for each chord and technique combination
        for chord_idx, chord in enumerate(request.chords):
            for technique in techniques[:3]:  # Limit to 3 techniques per chord
                if suggestion_id >= 6:  # Overall limit to 6 suggestions
                    break

                # Apply technique to create modified chord
                modified_chord = apply_technique(chord, technique)

                # Calculate relevance
                relevance = calculate_relevance_score(technique, request.intent, avoid)

                # Generate AI explanation
                explanation = await build_suggestion_explanation(
                    from_chord=chord,
                    to_chord=modified_chord,
                    technique=technique,
                    intent=request.intent,
                    composers=composers,
                    key=request.key,
                    mode=request.mode
                )

                # Create suggestion
                suggestion = SuggestionData(
                    id=f"suggestion-{suggestion_id}",
                    technique=technique,
                    targetChordId=f"chord-{chord_idx}",
                    fromChord=chord,
                    toChord=modified_chord,
                    rationale=explanation,
                    examples=composers[:2] if composers else ["Various composers"],
                    relevanceScore=relevance
                )

                suggestions.append(suggestion)
                suggestion_id += 1

        # Sort by relevance score (highest first)
        suggestions.sort(key=lambda x: x.relevanceScore, reverse=True)

        return SuggestResponse(
            success=True,
            suggestions=suggestions
        )

    except Exception as e:
        return SuggestResponse(
            success=False,
            error=f"Suggestion generation failed: {str(e)}"
        )


def build_chord_insight_prompt(
    chords: list,
    selected_indices: list[int],
    key: str,
    mode: str,
    song_title: str | None,
    composer: str | None,
    annotations: list | None
) -> str:
    """Build prompt for chord insight analysis."""
    prompt = "You are an expert music theorist providing deep insight into a specific moment in a chord progression.\n\n"

    # Song context
    if song_title or composer:
        prompt += "## Song Context\n"
        if song_title:
            prompt += f'This progression is from "{song_title}"'
            if composer:
                prompt += f" by {composer}"
            prompt += ".\n"
        elif composer:
            prompt += f"Composed by {composer}.\n"
        prompt += "\n"

    # Key and mode
    prompt += f"## Key: {key} {mode}\n\n"

    # Full progression
    prompt += "## Full Progression\n"
    progression_str = " → ".join(
        to_roman_numeral(c.scaleDegree, c.quality, mode)
        for c in chords
    )
    prompt += f"{progression_str}\n\n"

    # Highlighted chords
    selected_chords = [chords[i] for i in selected_indices if i < len(chords)]
    prompt += "## Highlighted Moment(s)\n"
    for i, chord in zip(selected_indices, selected_chords):
        numeral = to_roman_numeral(chord.scaleDegree, chord.quality, mode)
        prompt += f"- Chord #{i+1}: {numeral} (Scale Degree {chord.scaleDegree}, {chord.quality})\n"

        # Include any user annotation for this chord
        if annotations:
            for ann in annotations:
                if ann.chordId == chord.id:
                    prompt += f"  User note: \"{ann.note}\"\n"
    prompt += "\n"

    prompt += "## Analysis Request\n"
    prompt += "Provide a focused, educational analysis of this specific moment. Cover:\n"
    prompt += "1. Why this chord/moment is musically interesting or effective\n"
    prompt += "2. The harmonic function and voice leading at play\n"
    prompt += "3. Similar techniques used by other composers\n"
    prompt += "4. Learning suggestions for the student\n\n"

    prompt += "Respond with valid JSON:\n"
    prompt += "{\n"
    prompt += '  "insight": "main educational insight about this moment (2-3 sentences)",\n'
    prompt += '  "harmonicFunction": "brief description of harmonic function",\n'
    prompt += '  "suggestions": ["learning tip 1", "learning tip 2"]\n'
    prompt += "}\n"
    prompt += "\nReturn only the JSON object."

    return prompt


@app.post("/api/chord-insight", response_model=ChordInsightResponse)
@limiter.limit("30/hour")
async def get_chord_insight(request_obj: Request, request: ChordInsightRequest):
    """
    Get AI-powered insight for selected chord(s).

    Provides deep analysis of a specific moment in a progression,
    considering user annotations and song context.
    """
    api_key = os.getenv("CLAUDE_API_KEY")

    if not api_key:
        return ChordInsightResponse(
            success=False,
            error="Claude API key not configured"
        )

    if not request.selectedIndices:
        return ChordInsightResponse(
            success=False,
            error="No chords selected for analysis"
        )

    try:
        # Build the prompt
        prompt = build_chord_insight_prompt(
            chords=request.chords,
            selected_indices=request.selectedIndices,
            key=request.key,
            mode=request.mode,
            song_title=request.songTitle,
            composer=request.composer,
            annotations=request.annotations
        )

        # Call Claude API
        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = message.content[0].text.strip()

        # Parse JSON response
        import re
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if not json_match:
            return ChordInsightResponse(
                success=False,
                error="Failed to parse AI response"
            )

        result = json.loads(json_match.group())

        return ChordInsightResponse(
            success=True,
            insight=result.get("insight"),
            harmonicFunction=result.get("harmonicFunction"),
            suggestions=result.get("suggestions", [])
        )

    except Exception as e:
        return ChordInsightResponse(
            success=False,
            error=f"Chord insight failed: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
