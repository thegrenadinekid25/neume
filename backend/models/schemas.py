"""
Pydantic models for API request/response validation
"""
from typing import Optional, List, Dict
from pydantic import BaseModel


class VoiceData(BaseModel):
    """SATB voice data"""
    soprano: str
    alto: str
    tenor: str
    bass: str


class ChordData(BaseModel):
    """Chord information"""
    id: str
    scale_degree: int
    quality: str
    extensions: Dict[str, bool]
    key: str
    mode: str
    is_chromatic: bool
    voices: VoiceData
    start_beat: float
    duration: float
    position: Dict[str, float]
    size: float
    selected: bool
    playing: bool
    source: str
    created_at: str


class AnalysisResponse(BaseModel):
    """Response from chord analysis"""
    title: str
    composer: Optional[str] = None
    key: str
    mode: str
    tempo: float
    chords: List[ChordData]
    source_url: Optional[str] = None
    analyzed_at: str


class ExplanationRequest(BaseModel):
    """Request for chord explanation"""
    chord: Dict
    previous_chord: Optional[Dict] = None
    next_chord: Optional[Dict] = None
    key: str
    mode: str


class EvolutionStep(BaseModel):
    """Single step in chord evolution"""
    chord: str
    quality: str
    description: str


class ExplanationResponse(BaseModel):
    """AI-generated chord explanation with rich content"""
    context: str
    evolutionSteps: List[EvolutionStep]
    emotion: str
    examples: List[str]


class DeconstructRequest(BaseModel):
    """Request to deconstruct a progression"""
    chords: List[Dict]
    key: str
    mode: str
    composer_style: Optional[str] = "Modern sacred choral"


class DeconstructionStep(BaseModel):
    """Single step in progression deconstruction"""
    step_number: int
    step_name: str
    description: str
    chords: List[Dict]


class DeconstructResponse(BaseModel):
    """Response from progression deconstruction"""
    steps: List[DeconstructionStep]
    total_steps: int


class SuggestRequest(BaseModel):
    """Request for AI suggestions based on intent"""
    intent: str
    chords: List[Dict]
    context: Dict[str, str]  # key, mode


class Suggestion(BaseModel):
    """Single AI suggestion"""
    technique: str
    target_chord_id: str
    from_chord: Dict = {}  # Rename to avoid Python keyword
    to: Dict
    rationale: str
    examples: List[str]
    relevance_score: float

    class Config:
        fields = {'from_chord': 'from'}


class SuggestResponse(BaseModel):
    """Response with AI suggestions"""
    suggestions: List[Suggestion]
