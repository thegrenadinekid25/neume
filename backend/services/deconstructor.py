"""
Chord progression deconstruction service
Breaks down complex progressions into evolutionary steps with AI explanations.

Produces a pedagogical step-by-step breakdown:
1. SKELETON - Basic triads only
2. SEVENTHS - Add 7th intervals (maj7, min7, dom7)
3. SUSPENSIONS - Add sus2/sus4 (delays the 3rd)
4. EXTENSIONS - Add 9ths, 11ths, 13ths
5. FULL - Original progression with all modifications
"""
import anthropic
import os
from typing import List, Dict, Optional, Tuple


# Layer effect descriptions - what each harmonic layer adds emotionally/sonically
LAYER_EFFECTS = {
    "skeleton": {
        "name": "Skeleton",
        "effect": "The harmonic foundation - simple triads that establish the basic chord progression.",
        "historical": "Renaissance and early Baroque composers built entire works on these fundamental harmonies.",
    },
    "sevenths": {
        "name": "Add 7ths",
        "effect": "Adds richness and harmonic momentum. The 7th creates a gentle dissonance that wants to resolve, pulling the ear forward through the progression.",
        "historical": "Seventh chords became standard in the Baroque era and are essential to jazz harmony.",
    },
    "suspensions": {
        "name": "Add Suspensions",
        "effect": "Delays the 3rd, creating tension that begs for resolution. Sus chords evoke longing, anticipation, or a sense of being 'suspended' between two emotional states.",
        "historical": "From Renaissance polyphony through contemporary choral music, suspensions create some of the most expressive moments in harmony.",
    },
    "extensions": {
        "name": "Add Extensions",
        "effect": "Opens up the sound with upper partials. 9ths add warmth, 11ths create modal color and openness, 13ths produce lush, sophisticated voicings.",
        "historical": "Lauridsen, Whitacre, and jazz composers use these to create the 'floating' quality in modern harmony.",
    },
    "alterations": {
        "name": "Complex Alterations",
        "effect": "Chromatic alterations (b5, #11, b9) add tension and color beyond the diatonic scale, creating unexpected harmonic twists.",
        "historical": "From late Romantic chromaticism to jazz altered dominants, these add sophisticated edge.",
    },
}

# Roman numeral mappings
SCALE_DEGREES_MAJOR = {0: 'I', 2: 'ii', 4: 'iii', 5: 'IV', 7: 'V', 9: 'vi', 11: 'vii°'}
SCALE_DEGREES_MINOR = {0: 'i', 2: 'ii°', 3: 'III', 5: 'iv', 7: 'V', 8: 'VI', 10: 'VII'}
NOTE_TO_SEMITONE = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
                    'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}


class Chord:
    """Internal chord representation for deconstruction"""

    def __init__(self, root: str, quality: str, extensions: Optional[Dict[str, bool]] = None,
                 original_symbol: str = None):
        self.root = root
        self.quality = quality
        self.extensions = extensions or {}
        self.original_symbol = original_symbol  # Preserve original for display

    def to_dict(self):
        """Convert to dictionary format for API responses"""
        return {
            "root": self.root,
            "quality": self.quality,
            "extensions": self.extensions,
        }

    def copy(self):
        """Create a copy of this chord"""
        return Chord(self.root, self.quality, dict(self.extensions), self.original_symbol)

    def has_extension(self, extension: str) -> bool:
        """Check if chord has a specific extension"""
        return self.extensions.get(extension, False)

    def has_any_seventh(self) -> bool:
        """Check if chord has any type of 7th"""
        return any(self.extensions.get(k, False) for k in ['maj7', 'min7', 'dom7', 'dim7'])

    def has_any_suspension(self) -> bool:
        """Check if chord has sus2 or sus4"""
        return self.extensions.get('sus2', False) or self.extensions.get('sus4', False)

    def has_any_extension(self) -> bool:
        """Check if chord has 9th, 11th, or 13th"""
        return any(self.extensions.get(k, False) for k in ['add9', 'add11', 'add13', 'add6'])

    def has_any_alteration(self) -> bool:
        """Check if chord has alterations like b5, #5, b9, etc."""
        alteration_keys = ['b5', '#5', 'b9', '#9', '#11', 'b13']
        return any(self.extensions.get(k, False) for k in alteration_keys)

    def remove_extensions(self):
        """Remove all extensions, keeping only root and base quality (triad)"""
        # Keep the base triad quality
        self.extensions = {}

    def to_symbol(self) -> str:
        """Generate a readable chord symbol"""
        suffix = ""
        q = self.quality
        if q == 'minor':
            suffix = 'm'
        elif q == 'diminished':
            suffix = 'dim'
        elif q == 'augmented':
            suffix = '+'

        # Add extensions to symbol
        if self.has_any_seventh():
            if self.extensions.get('maj7'):
                suffix += 'maj7'
            elif self.extensions.get('min7'):
                suffix += '7' if q == 'minor' else 'm7'
            elif self.extensions.get('dom7'):
                suffix += '7'
            elif self.extensions.get('dim7'):
                suffix += 'dim7'

        if self.extensions.get('sus4'):
            suffix = suffix.replace('7', '7sus4') if '7' in suffix else 'sus4'
        if self.extensions.get('sus2'):
            suffix = suffix.replace('7', '7sus2') if '7' in suffix else 'sus2'

        if self.extensions.get('add9'):
            suffix = suffix.replace('7', '9') if '7' in suffix else suffix + 'add9'
        if self.extensions.get('add11'):
            suffix = suffix.replace('9', '11') if '9' in suffix else suffix + 'add11'
        if self.extensions.get('add13'):
            suffix = suffix.replace('11', '13') if '11' in suffix else suffix + 'add13'

        return f"{self.root}{suffix}"

    def __repr__(self):
        return self.to_symbol()


class ProgressionDeconstructor:
    """Deconstruct chord progressions into evolutionary steps with rich AI explanations"""

    def __init__(self):
        self.api_key = os.getenv("CLAUDE_API_KEY")
        self.client = anthropic.Anthropic(api_key=self.api_key) if self.api_key else None

    def get_roman_numeral(self, chord: Chord, key: str, mode: str) -> str:
        """Convert a chord to its Roman numeral in the given key"""
        key_semitone = NOTE_TO_SEMITONE.get(key, 0)
        root_semitone = NOTE_TO_SEMITONE.get(chord.root, 0)
        interval = (root_semitone - key_semitone) % 12

        scale_degrees = SCALE_DEGREES_MAJOR if mode == 'major' else SCALE_DEGREES_MINOR
        base_numeral = scale_degrees.get(interval, '?')

        # Adjust case based on chord quality
        if chord.quality == 'minor' and base_numeral.isupper():
            base_numeral = base_numeral.lower()
        elif chord.quality == 'major' and base_numeral.islower():
            base_numeral = base_numeral.upper()

        # Add 7th indicator
        if chord.has_any_seventh():
            if chord.extensions.get('maj7'):
                base_numeral += 'maj7'
            elif chord.extensions.get('dom7'):
                base_numeral += '7'
            elif chord.extensions.get('min7'):
                base_numeral += '7' if chord.quality == 'minor' else 'm7'

        # Add suspension indicator
        if chord.extensions.get('sus4'):
            base_numeral += 'sus4'
        elif chord.extensions.get('sus2'):
            base_numeral += 'sus2'

        # Add extension indicators
        if chord.extensions.get('add9'):
            base_numeral = base_numeral.replace('7', '9') if '7' in base_numeral else base_numeral + 'add9'
        if chord.extensions.get('add11'):
            base_numeral = base_numeral.replace('9', '11') if '9' in base_numeral else base_numeral + '11'
        if chord.extensions.get('add13'):
            base_numeral = base_numeral.replace('11', '13') if '11' in base_numeral else base_numeral + '13'

        return base_numeral

    def format_roman_numerals(self, chords: List[Chord], key: str, mode: str) -> str:
        """Format progression as Roman numerals"""
        numerals = [self.get_roman_numeral(c, key, mode) for c in chords]
        return " → ".join(numerals)

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

    def identify_layers(self, original: List[Chord]) -> Dict[str, List[int]]:
        """
        Find what modifications exist in the progression.
        Returns dict mapping layer types to chord indices where they appear.
        """
        layers = {
            "sevenths": [],      # maj7, min7, dom7, dim7
            "suspensions": [],   # sus2, sus4
            "extensions": [],    # add9, add11, add13
            "alterations": [],   # b5, #5, b9, #9, #11, b13
        }

        for i, chord in enumerate(original):
            if chord.has_any_seventh():
                layers["sevenths"].append(i)

            if chord.has_any_suspension():
                layers["suspensions"].append(i)

            if chord.has_any_extension():
                layers["extensions"].append(i)

            if chord.has_any_alteration():
                layers["alterations"].append(i)

        return layers

    def add_sevenths(self, base_chords: List[Chord], original: List[Chord], indices: List[int]) -> List[Chord]:
        """Add 7th extensions from original chords to specified indices"""
        result = [c.copy() for c in base_chords]
        for idx in indices:
            if 0 <= idx < len(result) and idx < len(original):
                # Copy the specific 7th type from original
                for seventh_type in ['maj7', 'min7', 'dom7', 'dim7']:
                    if original[idx].extensions.get(seventh_type):
                        result[idx].extensions[seventh_type] = True
                        break
        return result

    def add_suspensions(self, base_chords: List[Chord], original: List[Chord], indices: List[int]) -> List[Chord]:
        """Add suspension extensions from original chords"""
        result = [c.copy() for c in base_chords]
        for idx in indices:
            if 0 <= idx < len(result) and idx < len(original):
                if original[idx].extensions.get('sus4'):
                    result[idx].extensions['sus4'] = True
                if original[idx].extensions.get('sus2'):
                    result[idx].extensions['sus2'] = True
        return result

    def add_extensions(self, base_chords: List[Chord], original: List[Chord], indices: List[int]) -> List[Chord]:
        """Add 9th/11th/13th extensions from original chords"""
        result = [c.copy() for c in base_chords]
        for idx in indices:
            if 0 <= idx < len(result) and idx < len(original):
                for ext in ['add9', 'add11', 'add13', 'add6']:
                    if original[idx].extensions.get(ext):
                        result[idx].extensions[ext] = True
        return result

    def add_alterations(self, base_chords: List[Chord], original: List[Chord], indices: List[int]) -> List[Chord]:
        """Add chromatic alterations from original chords"""
        result = [c.copy() for c in base_chords]
        for idx in indices:
            if 0 <= idx < len(result) and idx < len(original):
                for alt in ['b5', '#5', 'b9', '#9', '#11', 'b13']:
                    if original[idx].extensions.get(alt):
                        result[idx].extensions[alt] = True
        return result

    def find_modified_indices(self, prev_chords: List[Chord], curr_chords: List[Chord]) -> List[int]:
        """Find which chord indices changed between steps"""
        modified = []
        for i in range(min(len(prev_chords), len(curr_chords))):
            if str(prev_chords[i]) != str(curr_chords[i]):
                modified.append(i)
        return modified

    def create_steps(
        self,
        skeleton: List[Chord],
        layers: Dict[str, List[int]],
        original: List[Chord],
        key: str,
        mode: str
    ) -> List[Dict]:
        """
        Build progressive versions with metadata.
        Order: skeleton → 7ths → suspensions → extensions → alterations
        Returns list of step dicts with name, chords, layer_type, modified_indices, roman_numerals
        """
        steps = [{
            "name": "Skeleton",
            "chords": skeleton,
            "layer_type": "skeleton",
            "modified_indices": [],
            "roman_numerals": self.format_roman_numerals(skeleton, key, mode),
        }]

        current = skeleton

        # Add 7ths if present
        if layers["sevenths"]:
            prev = current
            current = self.add_sevenths(current, original, layers["sevenths"])
            steps.append({
                "name": "Add 7ths",
                "chords": current,
                "layer_type": "sevenths",
                "modified_indices": self.find_modified_indices(prev, current),
                "roman_numerals": self.format_roman_numerals(current, key, mode),
            })

        # Add suspensions if present
        if layers["suspensions"]:
            prev = current
            current = self.add_suspensions(current, original, layers["suspensions"])
            steps.append({
                "name": "Add Suspensions",
                "chords": current,
                "layer_type": "suspensions",
                "modified_indices": self.find_modified_indices(prev, current),
                "roman_numerals": self.format_roman_numerals(current, key, mode),
            })

        # Add extensions if present
        if layers["extensions"]:
            prev = current
            current = self.add_extensions(current, original, layers["extensions"])
            steps.append({
                "name": "Add Extensions",
                "chords": current,
                "layer_type": "extensions",
                "modified_indices": self.find_modified_indices(prev, current),
                "roman_numerals": self.format_roman_numerals(current, key, mode),
            })

        # Add alterations if present
        if layers["alterations"]:
            prev = current
            current = self.add_alterations(current, original, layers["alterations"])
            steps.append({
                "name": "Complex Alterations",
                "chords": current,
                "layer_type": "alterations",
                "modified_indices": self.find_modified_indices(prev, current),
                "roman_numerals": self.format_roman_numerals(current, key, mode),
            })

        return steps[:6]  # Limit to 6 steps max

    def format_chord_list(self, chords: List[Chord]) -> str:
        """Format a chord list as a readable string"""
        return " → ".join(str(c) for c in chords)

    async def generate_explanation(
        self,
        step: Dict,
        previous_step: Optional[Dict] = None,
        song_title: Optional[str] = None,
        composer: Optional[str] = None,
        key: Optional[str] = None,
        mode: Optional[str] = None
    ) -> str:
        """
        Use Claude API to generate a rich explanation for a deconstruction step.

        Explains:
        1. What SOUND/EFFECT this modification creates
        2. WHY composers use this technique
        3. How it changes the EMOTIONAL character

        Args:
            step: Current step dict with name, chords, layer_type, modified_indices, roman_numerals
            previous_step: Previous step dict (None for skeleton)
            song_title: Optional song title for contextual explanations
            composer: Optional composer/artist name for contextual explanations
            key: Musical key (e.g., "C", "G")
            mode: Musical mode (e.g., "major", "minor")
        """
        if not self.client:
            # Return fallback from LAYER_EFFECTS
            layer_info = LAYER_EFFECTS.get(step["layer_type"], {})
            return layer_info.get("effect", "Explanation unavailable - API key not configured")

        layer_type = step["layer_type"]
        layer_info = LAYER_EFFECTS.get(layer_type, {})

        # Build the progression strings
        current_progression = step["roman_numerals"]
        previous_progression = previous_step["roman_numerals"] if previous_step else "basic triads"

        # Identify what specifically changed
        modified_count = len(step.get("modified_indices", []))
        chord_list = step["chords"]
        modified_chords = [str(chord_list[i]) for i in step.get("modified_indices", []) if i < len(chord_list)]

        # Build context-aware prompt
        context = ""
        if song_title and composer:
            context = f'analyzing "{song_title}" by {composer}'
        elif song_title:
            context = f'analyzing "{song_title}"'
        elif composer:
            context = f"studying {composer}'s harmonic style"
        else:
            context = "teaching chord progression construction"

        prompt = f"""You're Leonard Bernstein at the piano, {context}, showing someone how harmony builds from simple bones to something that moves the soul.

FROM: {previous_progression}
TO: {current_progression} ({step["name"]})
KEY: {key} {mode}

WHAT CHANGED: {modified_count} chord(s) modified: {', '.join(modified_chords) if modified_chords else 'establishing foundation'}
LAYER: {layer_type}
HINT: {layer_info.get('effect', '')}

In 2-3 sentences, tell us:
- What this change DOES to the sound (be vivid—"floating", "aching", "bright")
- WHY a composer reaches for this tool at this moment
- How it serves the emotional arc

RULES:
- Talk about what the ear hears, not just what the theory says
- If it affects how the voices move, mention it—but explain why that matters
- Wit is welcome; sentimentality is not
- No emojis, no exclamation points, no filler
- Exactly 2-3 sentences"""

        if song_title:
            prompt += f'\n- Reference "{song_title}" naturally'
        if composer:
            prompt += f"\n- Connect to {composer}'s compositional style"

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",  # Use Sonnet for speed
                max_tokens=250,
                messages=[{"role": "user", "content": prompt}],
            )

            return message.content[0].text if message.content else layer_info.get("effect", "Unable to generate explanation")
        except Exception as e:
            # Fallback to static description
            return layer_info.get("effect", f"Explanation generation failed: {str(e)}")

    async def deconstruct(
        self,
        chords: List[Dict],
        key: str,
        mode: str,
        song_title: Optional[str] = None,
        composer: Optional[str] = None
    ) -> List[Dict]:
        """
        Main deconstruction method - breaks a progression into pedagogical steps.

        Args:
            chords: List of chord dicts with root, quality, extensions
            key: Musical key (e.g., "C", "G")
            mode: Musical mode (e.g., "major", "minor")
            song_title: Optional song title for richer, contextual descriptions
            composer: Optional composer/artist name for contextual descriptions

        Returns:
            List of step dicts with:
            - stepNumber: int
            - stepName: str
            - description: str (AI-generated)
            - chords: List[dict]
            - layerType: str
            - modifiedIndices: List[int]
            - romanNumerals: str
        """
        # Convert to internal Chord objects, preserving original symbol
        chord_objects = [
            Chord(
                c["root"],
                c["quality"],
                c.get("extensions", {}),
                c.get("symbol", None)
            )
            for c in chords
        ]

        # Step 1: Extract skeleton (basic triads)
        skeleton = self.extract_skeleton(chord_objects)

        # Step 2: Identify what layers exist in the original
        layers = self.identify_layers(chord_objects)

        # Step 3: Create progression steps with metadata
        progression_steps = self.create_steps(skeleton, layers, chord_objects, key, mode)

        # Step 4: Generate AI explanations for each step
        result_steps = []
        previous_step = None

        for step_number, step in enumerate(progression_steps):
            # Generate rich explanation with song context
            description = await self.generate_explanation(
                step=step,
                previous_step=previous_step,
                song_title=song_title,
                composer=composer,
                key=key,
                mode=mode
            )

            # Build response step
            result_steps.append({
                "stepNumber": step_number,
                "stepName": step["name"],
                "description": description,
                "chords": [c.to_dict() for c in step["chords"]],
                "layerType": step["layer_type"],
                "modifiedIndices": step["modified_indices"],
                "romanNumerals": step["roman_numerals"],
            })

            previous_step = step

        return result_steps
