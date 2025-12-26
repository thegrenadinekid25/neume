"""
AI-powered chord explanations using Anthropic Claude
"""
import os
from typing import Optional, Dict
from anthropic import Anthropic


client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


async def get_chord_explanation(
    chord: Dict,
    previous_chord: Optional[Dict],
    next_chord: Optional[Dict],
    key: str,
    mode: str
) -> str:
    """
    Get AI explanation for why a chord is used in this context

    Args:
        chord: Current chord data
        previous_chord: Previous chord (if any)
        next_chord: Next chord (if any)
        key: Musical key
        mode: Major or minor

    Returns:
        Detailed explanation string
    """
    # Build context for Claude
    scale_degree = chord.get("scale_degree", chord.get("scaleDegree"))
    quality = chord.get("quality")

    prompt = f"""You are a music theory expert and choral composition educator.

**Analyze this chord:**
- Chord: {roman_numeral(scale_degree, quality)} ({quality} chord on scale degree {scale_degree})
- Key: {key} {mode}
"""

    if previous_chord:
        prev_degree = previous_chord.get("scale_degree", previous_chord.get("scaleDegree"))
        prev_quality = previous_chord.get("quality")
        prompt += f"- Previous chord: {roman_numeral(prev_degree, prev_quality)}\n"

    if next_chord:
        next_degree = next_chord.get("scale_degree", next_chord.get("scaleDegree"))
        next_quality = next_chord.get("quality")
        prompt += f"- Next chord: {roman_numeral(next_degree, next_quality)}\n"

    prompt += """
**Provide a comprehensive explanation in JSON format:**

{
  "context": "Why THIS chord HERE? 2-3 sentences explaining its harmonic function and relationship to surrounding chords.",
  "evolutionSteps": [
    {
      "chord": "Simple version (e.g., 'I')",
      "quality": "major",
      "description": "Starting point - basic triad"
    },
    {
      "chord": "Intermediate (e.g., 'Imaj7')",
      "quality": "maj7",
      "description": "Add seventh for color"
    },
    {
      "chord": "Complex (e.g., 'Imaj9')",
      "quality": "add9",
      "description": "Add ninth for lush sound"
    }
  ],
  "emotion": "How does this chord affect the emotional arc? (1 sentence)",
  "examples": ["Composer 1 who uses this", "Composer 2", "Composer 3"]
}

Be educational, inspiring, and practical. Keep language clear.
"""

    # Call Claude API
    try:
        message = client.messages.create(
            model="claude-sonnet-4-5-20250514",
            max_tokens=1000,
            temperature=0.7,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )

        response_text = message.content[0].text

        # Try to parse JSON response
        try:
            import json
            # Extract JSON from response (Claude might wrap it in markdown)
            if "```json" in response_text:
                json_start = response_text.find("{")
                json_end = response_text.rfind("}") + 1
                response_text = response_text[json_start:json_end]

            return json.loads(response_text)
        except json.JSONDecodeError:
            # If JSON parsing fails, return simple format
            return {
                "context": response_text,
                "evolutionSteps": [],
                "emotion": "",
                "examples": []
            }

    except Exception as e:
        print(f"Error calling Claude API: {str(e)}")
        # Fallback to basic explanation
        return {
            "context": f"This is a {quality} {scale_degree} chord in {key} {mode}.",
            "evolutionSteps": [],
            "emotion": "",
            "examples": []
        }


def roman_numeral(degree: int, quality: str) -> str:
    """Convert scale degree and quality to Roman numeral notation"""
    numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

    if degree < 1 or degree > 7:
        return f"{degree}"

    numeral = numerals[degree - 1]

    # Lowercase for minor/diminished
    if quality in ['minor', 'diminished', 'min7', 'halfdim7']:
        numeral = numeral.lower()

    # Add quality symbols
    if quality == 'diminished':
        numeral += '°'
    elif quality == 'augmented':
        numeral += '+'
    elif quality == 'dom7':
        numeral += '7'
    elif quality == 'maj7':
        numeral += 'maj7'
    elif quality == 'min7':
        numeral += '7'

    return numeral
