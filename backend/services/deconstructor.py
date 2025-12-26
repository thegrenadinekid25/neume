"""
Deconstruction service for analyzing complex progressions
and breaking them down into evolutionary steps.
"""

from typing import List, Dict, Any
import anthropic
import os

# Initialize Anthropic client
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def extract_skeleton(chords: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Extract the harmonic skeleton by removing all extensions.
    Returns basic triads only.
    """
    skeleton = []
    for chord in chords:
        # Keep basic structure but remove extensions
        basic_chord = {
            **chord,
            "extensions": {}
        }
        # Simplify quality (maj7 → major, etc.)
        if basic_chord.get("quality") in ["maj7", "add9", "maj9"]:
            basic_chord["quality"] = "major"
        elif basic_chord.get("quality") in ["min7", "min9"]:
            basic_chord["quality"] = "minor"
        elif basic_chord.get("quality") in ["dom7", "7"]:
            basic_chord["quality"] = "major"  # Dominant becomes major triad

        skeleton.append(basic_chord)

    return skeleton


def identify_layers(original_chords: List[Dict[str, Any]], skeleton: List[Dict[str, Any]]) -> Dict[str, List[int]]:
    """
    Identify what harmonic layers were added.
    Returns indices of chords with each type of extension.
    """
    layers = {
        "sevenths": [],
        "suspensions": [],
        "ninths": [],
        "alterations": [],
        "added_tones": []
    }

    for i, chord in enumerate(original_chords):
        extensions = chord.get("extensions", {})

        # Check for 7ths
        if extensions.get("seventh") or chord.get("quality") in ["maj7", "min7", "dom7", "7"]:
            layers["sevenths"].append(i)

        # Check for suspensions
        if extensions.get("sus4") or extensions.get("sus2"):
            layers["suspensions"].append(i)

        # Check for 9ths
        if extensions.get("add9") or extensions.get("ninth") or chord.get("quality") in ["maj9", "min9"]:
            layers["ninths"].append(i)

        # Check for alterations (b5, #5, etc.)
        if extensions.get("flat5") or extensions.get("sharp5"):
            layers["alterations"].append(i)

        # Check for added tones (add6, add11, add13)
        if extensions.get("add6") or extensions.get("add11") or extensions.get("add13"):
            layers["added_tones"].append(i)

    return layers


def apply_layer(base_chords: List[Dict[str, Any]], layer_type: str, indices: List[int]) -> List[Dict[str, Any]]:
    """
    Apply a harmonic layer to specific chords.
    """
    result = [chord.copy() for chord in base_chords]

    for i in indices:
        if i < len(result):
            chord = result[i]
            extensions = chord.get("extensions", {}).copy()

            if layer_type == "seventh":
                extensions["seventh"] = True
                # Update quality if needed
                if chord["quality"] == "major":
                    chord["quality"] = "maj7"
                elif chord["quality"] == "minor":
                    chord["quality"] = "min7"

            elif layer_type == "sus4":
                extensions["sus4"] = True

            elif layer_type == "add9":
                extensions["add9"] = True

            elif layer_type == "flat5":
                extensions["flat5"] = True

            chord["extensions"] = extensions
            result[i] = chord

    return result


def create_progression_steps(original_chords: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Create step-by-step evolution from skeleton to final version.
    Returns 3-6 meaningful steps.
    """
    steps = []

    # Step 0: Skeleton
    skeleton = extract_skeleton(original_chords)
    steps.append({
        "step_number": 0,
        "step_name": "Skeleton",
        "chords": skeleton
    })

    # Identify layers in original
    layers = identify_layers(original_chords, skeleton)

    current_chords = skeleton
    step_num = 1

    # Step 1: Add 7ths (if present)
    if layers["sevenths"]:
        current_chords = apply_layer(current_chords, "seventh", layers["sevenths"])
        steps.append({
            "step_number": step_num,
            "step_name": "Add 7ths",
            "chords": current_chords
        })
        step_num += 1

    # Step 2: Add suspensions (if present)
    if layers["suspensions"]:
        current_chords = apply_layer(current_chords, "sus4", layers["suspensions"])
        steps.append({
            "step_number": step_num,
            "step_name": "Suspensions",
            "chords": current_chords
        })
        step_num += 1

    # Step 3: Add 9ths (if present)
    if layers["ninths"]:
        current_chords = apply_layer(current_chords, "add9", layers["ninths"])
        steps.append({
            "step_number": step_num,
            "step_name": "Added 9ths",
            "chords": current_chords
        })
        step_num += 1

    # Step 4: Add alterations (if present)
    if layers["alterations"]:
        for i in layers["alterations"]:
            if i < len(current_chords):
                original_extensions = original_chords[i].get("extensions", {})
                current_chords[i]["extensions"].update(original_extensions)

        steps.append({
            "step_number": step_num,
            "step_name": "Alterations",
            "chords": current_chords
        })
        step_num += 1

    # Final step: Complete version (if different from last step)
    if steps[-1]["chords"] != original_chords:
        steps.append({
            "step_number": step_num,
            "step_name": "Final Version",
            "chords": original_chords
        })

    return steps


async def generate_step_explanation(
    step_name: str,
    step_number: int,
    chords: List[Dict[str, Any]],
    key: str,
    mode: str,
    composer_style: str = "Modern sacred choral (Lauridsen, Whitacre)"
) -> str:
    """
    Generate AI explanation for a deconstruction step using Claude API.
    """

    # Create a concise chord summary
    chord_summary = ", ".join([
        f"{c.get('scaleDegree', '?')}{c.get('quality', '')}"
        for c in chords[:5]  # First 5 chords
    ])
    if len(chords) > 5:
        chord_summary += f" ... ({len(chords)} total)"

    prompt = f"""You are a music theory educator explaining harmonic evolution to composers.

**Context:**
- Step {step_number}: {step_name}
- Key: {key} {mode}
- Style: {composer_style}
- Progression: {chord_summary}

**Task:**
Explain what this harmonic layer adds in 2-3 sentences:
1. What this layer contributes musically (sound/color/emotion)
2. Why composers use this technique
3. Brief historical or stylistic context (mention specific composers if relevant)

Keep the tone inspiring and educational. Write for practicing composers who want to understand how complexity evolves from simplicity."""

    try:
        message = await client.messages.create(
            model="claude-sonnet-4-5-20250514",
            max_tokens=500,
            temperature=0.7,
            messages=[{"role": "user", "content": prompt}]
        )

        return message.content[0].text.strip()

    except Exception as e:
        # Fallback explanations if API fails
        fallback_explanations = {
            "Skeleton": "The harmonic foundation - simple diatonic progression with basic triads. This is the essential voice leading that underpins the entire piece.",
            "Add 7ths": "Adding 7ths creates warmth and sophistication. This is the first step toward the rich harmony characteristic of Lauridsen and Whitacre.",
            "Suspensions": "Suspensions create yearning and delay harmonic arrival. This evokes the anticipation found in Renaissance polyphony (Byrd, Palestrina).",
            "Added 9ths": "The added 9ths create shimmer and space - signature elements of modern sacred choral music. This 'halo' effect is beloved by composers like Whitacre and Ešenvalds.",
            "Alterations": "Chromatic alterations add tension and color, borrowing from jazz harmony while maintaining the sacred aesthetic.",
            "Final Version": "The complete masterpiece with all extensions. Notice how each layer built upon the last, transforming a simple progression into something transcendent."
        }

        return fallback_explanations.get(step_name, "This step adds complexity to the harmonic progression.")


async def deconstruct_progression(
    chords: List[Dict[str, Any]],
    key: str,
    mode: str,
    composer_style: str = "Modern sacred choral"
) -> Dict[str, Any]:
    """
    Main entry point: Deconstruct progression into evolutionary steps
    with AI-generated explanations.
    """
    # Create progression steps
    steps = create_progression_steps(chords)

    # Generate AI explanations for each step
    for step in steps:
        explanation = await generate_step_explanation(
            step_name=step["step_name"],
            step_number=step["step_number"],
            chords=step["chords"],
            key=key,
            mode=mode,
            composer_style=composer_style
        )
        step["description"] = explanation

    return {
        "steps": steps,
        "total_steps": len(steps)
    }
