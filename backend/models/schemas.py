"""
Pydantic models for API request/response validation
"""

from pydantic import BaseModel
from typing import Optional, List, Dict


class AnalyzeRequest(BaseModel):
    """Request body for /api/analyze endpoint"""
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
    """Extracted chord data"""
    startBeat: float
    duration: float
    root: str
    quality: str
    extensions: Dict[str, bool]
    confidence: float


class AnalysisResultData(BaseModel):
    """Analysis result data"""
    title: str
    composer: Optional[str] = None
    key: str
    mode: str
    tempo: float
    timeSignature: str
    chords: List[ChordData]
    sourceUrl: Optional[str] = None
    analyzedAt: str


class ErrorData(BaseModel):
    """Error information"""
    code: str
    message: str
    retryable: bool


class AnalyzeResponse(BaseModel):
    """Response body for /api/analyze endpoint"""
    success: bool
    result: Optional[AnalysisResultData] = None
    error: Optional[ErrorData] = None


class UploadResponse(BaseModel):
    """Response body for /api/upload endpoint"""
    uploadId: str
    expiresAt: str


class StatusResponse(BaseModel):
    """Response body for /api/analyze/status endpoint"""
    status: str  # "processing" | "complete" | "failed"
    progress: int
    stage: str
    estimatedTimeRemaining: Optional[int] = None


# Chord Explanation models

class ChordVoices(BaseModel):
    """Chord voicing data"""
    soprano: str
    alto: str
    tenor: str
    bass: str


class ExplainChordData(BaseModel):
    """Chord data for explanation request"""
    id: str
    scaleDegree: int
    quality: str
    key: str
    mode: str
    voices: ChordVoices
    isChromatic: Optional[bool] = False
    chromaticType: Optional[str] = None


class SongContext(BaseModel):
    """Song context for explanation"""
    title: Optional[str] = None
    composer: Optional[str] = None


class ExplainRequest(BaseModel):
    """Request body for /api/explain endpoint"""
    chord: ExplainChordData
    prevChord: Optional[ExplainChordData] = None
    nextChord: Optional[ExplainChordData] = None
    fullProgression: Optional[List[ExplainChordData]] = None
    songContext: Optional[SongContext] = None


class EvolutionStep(BaseModel):
    """Evolution step in explanation"""
    name: str
    description: str


class ExplainResponse(BaseModel):
    """Response body for /api/explain endpoint"""
    success: bool
    contextual: Optional[str] = None
    technical: Optional[str] = None
    historical: Optional[str] = None
    evolutionSteps: Optional[List[EvolutionStep]] = None
    error: Optional[str] = None


# Deconstruction models

class SimpleChord(BaseModel):
    """Simple chord representation for deconstruction"""
    root: str
    quality: str
    extensions: Optional[Dict[str, bool]] = None


class DeconstructRequest(BaseModel):
    """Request body for /api/deconstruct endpoint"""
    chords: List[SimpleChord]
    key: str
    mode: str
    songTitle: Optional[str] = None
    composer: Optional[str] = None


class DeconstructStep(BaseModel):
    """A single step in the deconstruction process

    Each step represents a layer of harmonic complexity:
    - skeleton: Basic triads
    - sevenths: Added 7th intervals
    - suspensions: Added sus2/sus4
    - extensions: Added 9ths, 11ths, 13ths
    - alterations: Added chromatic alterations
    """
    stepNumber: int
    stepName: str
    description: str
    chords: List[SimpleChord]
    layerType: Optional[str] = None  # skeleton, sevenths, suspensions, extensions, alterations
    modifiedIndices: Optional[List[int]] = None  # Which chord indices changed from previous step
    romanNumerals: Optional[str] = None  # Roman numeral progression string


class DeconstructResponse(BaseModel):
    """Response body for /api/deconstruct endpoint"""
    success: bool
    steps: Optional[List[DeconstructStep]] = None
    error: Optional[str] = None


# Suggestion models

class SuggestRequest(BaseModel):
    """Request body for /api/suggest endpoint"""
    intent: str
    chords: List[SimpleChord]
    key: str
    mode: str


class SuggestionData(BaseModel):
    """A single chord refinement suggestion"""
    id: str
    technique: str  # "add9", "sus4", "open_voicing", etc.
    targetChordId: Optional[str] = None
    fromChord: SimpleChord
    toChord: SimpleChord
    rationale: str
    examples: List[str]  # ["Lauridsen", "Whitacre", "Pärt"]
    relevanceScore: float


class SuggestResponse(BaseModel):
    """Response body for /api/suggest endpoint"""
    success: bool
    suggestions: Optional[List[SuggestionData]] = None
    error: Optional[str] = None


# Chord Insight models (for "Get AI Insight" feature)

class ChordAnnotation(BaseModel):
    """Per-chord annotation from user"""
    chordId: str
    note: str


class ChordInsightRequest(BaseModel):
    """Request body for /api/chord-insight endpoint"""
    chords: List[ExplainChordData]  # All chords in progression
    selectedIndices: List[int]  # Indices of chords to analyze
    key: str
    mode: str
    songTitle: Optional[str] = None
    composer: Optional[str] = None
    annotations: Optional[List[ChordAnnotation]] = None  # User annotations for context


class ChordInsightResponse(BaseModel):
    """Response body for /api/chord-insight endpoint"""
    success: bool
    insight: Optional[str] = None  # Main AI insight
    harmonicFunction: Optional[str] = None  # Function analysis
    suggestions: Optional[List[str]] = None  # Learning suggestions
    error: Optional[str] = None
