"""
Chord progression deconstruction service
Breaks down complex progressions into evolutionary steps with AI explanations
"""
import anthropic
import os
from typing import List, Dict, Optional


class Chord:
    """Internal chord representation for deconstruction"""

    def __init__(self, root: str, quality: str, extensions: Optional[Dict[str, bool]] = None):
        self.root = root
        self.quality = quality
        self.extensions = extensions or {}

    def to_dict(self):
        """Convert to dictionary format for API responses"""
        return {
            "root": self.root,
            "quality": self.quality,
            "extensions": self.extensions,
        }

    def copy(self):
        """Create a copy of this chord"""
        return Chord(self.root, self.quality, dict(self.extensions))

    def has_extension(self, extension: str) -> bool:
        """Check if chord has a specific extension"""
        return self.extensions.get(extension, False)

    def remove_extensions(self):
        """Remove all extensions, keeping only root and quality"""
        base_quality = "major"
        if self.quality in ["minor", "min7", "m7", "m"]:
            base_quality = "minor"
        elif self.quality == "diminished":
            base_quality = "diminished"
        elif self.quality == "augmented":
            base_quality = "augmented"

        self.quality = base_quality
        self.extensions = {}

    def __repr__(self):
        ext_str = ""
        if self.extensions:
            ext_str = ", " + str(self.extensions)
        return f"{self.root}{self.quality}{ext_str}"


class ProgressionDeconstructor:
    """Deconstruct chord progressions into evolutionary steps"""

    def __init__(self):
        self.api_key = os.getenv("CLAUDE_API_KEY")
        self.client = anthropic.Anthropic(api_key=self.api_key) if self.api_key else None

    def extract_skeleton(self, chords: List[Chord]) -> List[Chord]:
        """
        Remove all extensions, return basic triads.
        Strip down to root and quality only.
        """
        skeleton = []
        for chord in chords:
            new_chord = chord.copy()
            new_chord.remove_extensions()
            skeleton.append(new_chord)
        return skeleton

    def identify_layers(self, original: List[Chord], skeleton: List[Chord]) -> Dict[str, List[int]]:
        """
        Find what was added to the skeleton (7ths, 9ths, sus, etc.)
        Returns dict mapping layer types to indices where they appear
        """
        layers = {
            "sevenths": [],
            "suspensions": [],
            "ninths": [],
            "alterations": [],
        }

        for i, chord in enumerate(original):
            if chord.has_extension("7"):
                if i not in layers["sevenths"]:
                    layers["sevenths"].append(i)

            if chord.has_extension("add9"):
                if i not in layers["ninths"]:
                    layers["ninths"].append(i)

            if chord.has_extension("sus4") or chord.has_extension("sus2"):
                if i not in layers["suspensions"]:
                    layers["suspensions"].append(i)

            # Check for alterations (b5, #5, etc)
            has_alteration = any(
                key for key in chord.extensions.keys() if key not in ["7", "add9", "sus4", "sus2"]
            )
            if has_alteration and i not in layers["alterations"]:
                layers["alterations"].append(i)

        return layers

    def add_sevenths(self, base_chords: List[Chord], indices: List[int]) -> List[Chord]:
        """Add 7th extension to specified chord indices"""
        result = [c.copy() for c in base_chords]
        for idx in indices:
            if 0 <= idx < len(result):
                result[idx].extensions["7"] = True
        return result

    def add_suspensions(self, base_chords: List[Chord], indices: List[int]) -> List[Chord]:
        """Add sus4 extension to specified chord indices"""
        result = [c.copy() for c in base_chords]
        for idx in indices:
            if 0 <= idx < len(result):
                result[idx].extensions["sus4"] = True
        return result

    def add_ninths(self, base_chords: List[Chord], indices: List[int]) -> List[Chord]:
        """Add 9th extension to specified chord indices"""
        result = [c.copy() for c in base_chords]
        for idx in indices:
            if 0 <= idx < len(result):
                result[idx].extensions["add9"] = True
        return result

    def add_alterations(self, base_chords: List[Chord], original: List[Chord]) -> List[Chord]:
        """Add any alterations from the original chords"""
        result = [c.copy() for c in base_chords]
        for i, orig_chord in enumerate(original):
            if i < len(result):
                for key, value in orig_chord.extensions.items():
                    if key not in ["7", "add9", "sus4", "sus2"] and value:
                        result[i].extensions[key] = value
        return result

    def create_steps(self, skeleton: List[Chord], layers: Dict[str, List[int]], original: List[Chord]) -> List[tuple]:
        """
        Build progressive versions, yielding (name, chords) tuples.
        Order: skeleton → 7ths → suspensions → 9ths → alterations
        Limit to 3-6 steps max
        """
        steps = [("Skeleton", skeleton)]

        current = skeleton

        # Add 7ths if present
        if layers["sevenths"]:
            current = self.add_sevenths(current, layers["sevenths"])
            steps.append(("Add 7ths", current))

        # Add suspensions if present
        if layers["suspensions"]:
            current = self.add_suspensions(current, layers["suspensions"])
            steps.append(("Suspensions", current))

        # Add 9ths if present
        if layers["ninths"]:
            current = self.add_ninths(current, layers["ninths"])
            steps.append(("Added 9ths", current))

        # Add alterations if present
        if layers["alterations"]:
            current = self.add_alterations(current, original)
            steps.append(("Complex Alterations", current))

        # Limit to 6 steps max
        return steps[:6]

    def format_chord_list(self, chords: List[Chord]) -> str:
        """Format a chord list as a readable string"""
        return " → ".join(str(c) for c in chords)

    async def generate_explanation(
        self,
        step_name: str,
        chords: List[Chord],
        previous_chords: Optional[List[Chord]] = None,
        song_title: Optional[str] = None,
        composer: Optional[str] = None,
        key: Optional[str] = None,
        mode: Optional[str] = None
    ) -> str:
        """
        Use Claude API to generate explanation for a step.
        Returns a 2-3 sentence explanation.

        Args:
            step_name: Name of the current step (e.g., "Skeleton", "Add 7ths")
            chords: Current chord list for this step
            previous_chords: Chord list from the previous step
            song_title: Optional song title for contextual explanations
            composer: Optional composer/artist name for contextual explanations
            key: Musical key (e.g., "C", "G")
            mode: Musical mode (e.g., "major", "minor")
        """
        if not self.client:
            return "Explanation unavailable - API key not configured"

        chord_str = self.format_chord_list(chords)
        previous_str = (
            self.format_chord_list(previous_chords) if previous_chords else "basic triads"
        )

        # Build context-aware prompt
        if song_title and composer:
            prompt = f"""You are an expert music theorist teaching how "{song_title}" by {composer} builds its harmonic structure.

You're explaining the step-by-step evolution of the chord progression from this song.

"""
        elif song_title:
            prompt = f"""You are an expert music theorist teaching how "{song_title}" builds its harmonic structure.

You're explaining the step-by-step evolution of the chord progression from this song.

"""
        elif composer:
            prompt = f"""You are an expert music theorist teaching how {composer}'s harmonic language develops.

You're explaining the step-by-step evolution of a chord progression in their style.

"""
        else:
            prompt = """You are an expert music theorist explaining chord progression evolution.

"""

        prompt += f"""Explain what happens in this harmonic layer step:

Previous Step: {previous_str}
Current Step: {step_name}
Current Chords: {chord_str}"""

        if key and mode:
            prompt += f"\nKey: {key} {mode}"

        prompt += "\n\nProvide a 2-3 sentence explanation covering:\n"
        prompt += "1. What this layer adds musically"

        if song_title or composer:
            prompt += f"\n2. How this technique contributes to the song's emotional character"
            if composer:
                prompt += f"\n3. Why {composer} might have made this harmonic choice"
        else:
            prompt += "\n2. Why composers use this technique"
            prompt += "\n3. Historical/stylistic context"

        prompt += "\n\nWrite for composers - be inspiring and educational. Keep it concise."

        if song_title:
            prompt += f" Reference \"{song_title}\" naturally in your explanation."

        try:
            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=300,
                messages=[{"role": "user", "content": prompt}],
            )

            return message.content[0].text if message.content else "Unable to generate explanation"
        except Exception as e:
            return f"Explanation generation failed: {str(e)}"

    async def deconstruct(
        self,
        chords: List[Dict],
        key: str,
        mode: str,
        song_title: Optional[str] = None,
        composer: Optional[str] = None
    ) -> List[Dict]:
        """
        Main deconstruction method.

        Args:
            chords: List of chord dicts with root, quality, extensions
            key: Musical key (e.g., "C", "G")
            mode: Musical mode (e.g., "major", "minor")
            song_title: Optional song title for richer, contextual descriptions
            composer: Optional composer/artist name for contextual descriptions

        Returns:
            List of step dicts with stepNumber, stepName, description, chords
        """
        # Convert to internal Chord objects
        chord_objects = [Chord(c["root"], c["quality"], c.get("extensions", {})) for c in chords]

        # Step 1: Extract skeleton
        skeleton = self.extract_skeleton(chord_objects)

        # Step 2: Identify layers
        layers = self.identify_layers(chord_objects, skeleton)

        # Step 3: Create progression steps
        progression_steps = self.create_steps(skeleton, layers, chord_objects)

        # Step 4: Generate AI explanations and build response
        steps = []
        previous_chords = None

        for step_number, (step_name, step_chords) in enumerate(progression_steps):
            # Generate explanation with song context if available
            description = await self.generate_explanation(
                step_name,
                step_chords,
                previous_chords,
                song_title=song_title,
                composer=composer,
                key=key,
                mode=mode
            )

            # Build step response
            steps.append({
                "stepNumber": step_number,
                "stepName": step_name,
                "description": description,
                "chords": [c.to_dict() for c in step_chords],
            })

            previous_chords = step_chords

        return steps
