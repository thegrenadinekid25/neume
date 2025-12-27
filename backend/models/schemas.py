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
