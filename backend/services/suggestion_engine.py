"""
Emotional intent → Harmonic suggestion engine
Maps user's emotional descriptions to specific chord techniques
"""

from typing import List, Dict, Any, Set
import anthropic
import os
import re

# Initialize Anthropic client
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Emotional keyword mappings
EMOTIONAL_MAPPINGS = {
    "ethereal": {
        "techniques": ["add9", "sus4", "maj7"],
        "composers": ["Lauridsen", "Whitacre", "Pärt"],
        "avoid": ["tritone", "diminished"]
    },
    "floating": {
        "techniques": ["sus4", "add9", "maj9"],
        "composers": ["Whitacre", "Ešenvalds"],
        "avoid": ["bass_emphasis"]
    },
    "dark": {
        "techniques": ["minor", "diminished", "flat5"],
        "composers": ["Brahms", "Penderecki"],
        "avoid": ["major", "bright"]
    },
    "grounded": {
        "techniques": ["bass_emphasis", "perfect_fifth"],
        "composers": ["Bach", "Pärt"],
        "avoid": ["sus4", "ambiguous"]
    },
    "warm": {
        "techniques": ["maj7", "add6", "major"],
        "composers": ["Lauridsen", "Elgar"],
        "avoid": ["harsh", "dissonant"]
    },
    "triumphant": {
        "techniques": ["major", "ascending", "forte"],
        "composers": ["Handel", "John Williams"],
        "avoid": ["minor", "soft"]
    },
    "melancholic": {
        "techniques": ["minor", "sus2", "seventh"],
        "composers": ["Chopin", "Fauré"],
        "avoid": ["major", "bright"]
    },
    "renaissance": {
        "techniques": ["perfect_intervals", "modal"],
        "composers": ["Palestrina", "Byrd"],
        "avoid": ["chromatic", "extensions"]
    },
    "romantic": {
        "techniques": ["maj7", "add9", "chromatic"],
        "composers": ["Brahms", "Wagner"],
        "avoid": ["simple"]
    },
    "unexpected": {
        "techniques": ["neapolitan", "augmented", "modal_mixture"],
        "composers": ["Beethoven", "Debussy"],
        "avoid": ["predictable"]
    }
}


def extract_keywords(intent: str) -> Set[str]:
    """Extract emotional keywords from user intent"""
    intent_lower = intent.lower()
    keywords = set()

    for keyword in EMOTIONAL_MAPPINGS.keys():
        if keyword in intent_lower:
            keywords.add(keyword)

    return keywords


def get_techniques_for_intent(intent: str) -> List[str]:
    """Map emotional intent to harmonic techniques"""
    keywords = extract_keywords(intent)

    if not keywords:
        # Use AI to interpret if no direct keywords match
        return ["add9", "maj7", "sus4"]  # Safe defaults

    techniques = set()
    for keyword in keywords:
        if keyword in EMOTIONAL_MAPPINGS:
            techniques.update(EMOTIONAL_MAPPINGS[keyword]["techniques"])

    return list(techniques)[:5]  # Limit to 5 techniques


def apply_technique_to_chord(chord: Dict[str, Any], technique: str) -> Dict[str, Any]:
    """
    Apply a harmonic technique to a chord
    Returns modified chord
    """
    modified_chord = chord.copy()
    extensions = modified_chord.get("extensions", {}).copy()

    if technique == "add9":
        extensions["add9"] = True
        modified_chord["extensions"] = extensions

    elif technique == "sus4":
        extensions["sus4"] = True
        modified_chord["extensions"] = extensions

    elif technique == "maj7":
        if modified_chord.get("quality") == "major":
            modified_chord["quality"] = "maj7"
            extensions["seventh"] = True
            modified_chord["extensions"] = extensions

    elif technique == "minor":
        if modified_chord.get("quality") == "major":
            modified_chord["quality"] = "minor"

    elif technique == "diminished":
        modified_chord["quality"] = "diminished"

    elif technique == "flat5":
        extensions["flat5"] = True
        modified_chord["extensions"] = extensions

    elif technique == "augmented":
        modified_chord["quality"] = "augmented"

    elif technique == "neapolitan":
        # Neapolitan: flat II chord (major)
        modified_chord["scaleDegree"] = 2
        modified_chord["quality"] = "major"
        # Note: Would need to adjust for actual Neapolitan (bII)

    elif technique == "modal_mixture":
        # Borrow from parallel minor/major
        if modified_chord.get("mode") == "major":
            if modified_chord["quality"] == "minor":
                pass  # Already borrowed
            else:
                # Convert IV to iv (common mixture)
                if modified_chord.get("scaleDegree") == 4:
                    modified_chord["quality"] = "minor"

    return modified_chord


async def generate_suggestion_explanation(
    original_chord: Dict[str, Any],
    modified_chord: Dict[str, Any],
    technique: str,
    intent: str
) -> Dict[str, Any]:
    """
    Use Claude API to explain why this suggestion matches the intent
    """
    prompt = f"""You are a music theory expert helping a composer.

**User's Intent:** "{intent}"

**Suggestion:** Apply {technique} to transform this chord:
- From: {original_chord.get('quality', '')} on scale degree {original_chord.get('scaleDegree', '?')}
- To: {modified_chord.get('quality', '')} with extensions {modified_chord.get('extensions', {})}

**Task:**
Explain in 1-2 sentences:
1. How this technique serves the emotional intent
2. Which composers use this technique

Be concise, inspiring, and practical. Mention specific composers."""

    try:
        message = await client.messages.create(
            model="claude-sonnet-4-5-20250514",
            max_tokens=300,
            temperature=0.7,
            messages=[{"role": "user", "content": prompt}]
        )

        rationale = message.content[0].text.strip()

        # Extract composer names (simple pattern matching)
        composers = []
        for mapping in EMOTIONAL_MAPPINGS.values():
            for composer in mapping["composers"]:
                if composer in rationale:
                    composers.append(composer)

        # Remove duplicates
        composers = list(set(composers))

        return {
            "rationale": rationale,
            "examples": composers[:3]  # Max 3 composers
        }

    except Exception as e:
        # Fallback explanation
        keywords = extract_keywords(intent)
        composer_examples = []
        for keyword in keywords:
            if keyword in EMOTIONAL_MAPPINGS:
                composer_examples.extend(EMOTIONAL_MAPPINGS[keyword]["composers"])

        return {
            "rationale": f"Adding {technique} creates the {intent} quality you're looking for. This technique is characteristic of modern sacred choral music.",
            "examples": list(set(composer_examples))[:3]
        }


async def generate_suggestions(
    intent: str,
    chords: List[Dict[str, Any]],
    key: str,
    mode: str
) -> List[Dict[str, Any]]:
    """
    Main entry point: Generate chord suggestions based on emotional intent
    """
    # Get relevant techniques for this intent
    techniques = get_techniques_for_intent(intent)

    suggestions = []

    # Generate suggestions (max 3)
    for i, chord in enumerate(chords[:3]):  # Only suggest for first 3 chords
        for technique in techniques[:2]:  # Max 2 techniques per chord
            # Apply technique
            modified_chord = apply_technique_to_chord(chord, technique)

            # Skip if no actual change
            if modified_chord == chord:
                continue

            # Get AI explanation
            explanation = await generate_suggestion_explanation(
                chord, modified_chord, technique, intent
            )

            suggestions.append({
                "technique": f"{technique.replace('_', ' ').title()}",
                "target_chord_id": chord.get("id"),
                "from": chord,
                "to": modified_chord,
                "rationale": explanation["rationale"],
                "examples": explanation["examples"],
                "relevance_score": 1.0
            })

            # Limit total suggestions
            if len(suggestions) >= 3:
                break

        if len(suggestions) >= 3:
            break

    # If no suggestions generated, provide generic ones
    if not suggestions and chords:
        chord = chords[0]
        suggestions.append({
            "technique": "Add 9th",
            "target_chord_id": chord.get("id"),
            "from": chord,
            "to": apply_technique_to_chord(chord, "add9"),
            "rationale": "Adding a 9th creates shimmer and space, characteristic of modern choral music by Lauridsen and Whitacre.",
            "examples": ["Lauridsen", "Whitacre"],
            "relevance_score": 1.0
        })

    return suggestions
