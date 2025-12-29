"""
Emotional intent mapping to harmonic techniques.
Maps keywords from user input to specific chord manipulation techniques.
"""

from typing import List, Set
import re

# Emotional mappings: keywords to harmonic techniques and composer examples
EMOTIONAL_MAPPINGS = {
    "ethereal": {
        "techniques": ["add9", "sus4", "open_voicing", "maj7"],
        "composers": ["Lauridsen", "Whitacre", "Pärt"],
        "avoid": ["tritones", "dense_voicing"]
    },
    "floating": {
        "techniques": ["sus4", "add9", "open_voicing"],
        "composers": ["Whitacre", "Lauridsen"],
        "avoid": ["heavy_bass", "diminished"]
    },
    "dark": {
        "techniques": ["minor_mode", "diminished", "low_register"],
        "composers": ["Brahms", "Penderecki"],
        "avoid": ["major_mode", "bright_extensions"]
    },
    "somber": {
        "techniques": ["minor_mode", "diminished", "sus2"],
        "composers": ["Brahms", "Shostakovich"],
        "avoid": ["major_mode", "bright_extensions"]
    },
    "triumphant": {
        "techniques": ["major_mode", "V-I", "ascending_bass"],
        "composers": ["Handel", "Williams"],
        "avoid": ["suspensions", "ambiguity"]
    },
    "bright": {
        "techniques": ["major_mode", "add9", "ascending_bass"],
        "composers": ["Rutter", "Lauridsen"],
        "avoid": ["minor_mode", "low_register"]
    },
    "warm": {
        "techniques": ["maj7", "add9", "open_voicing"],
        "composers": ["Lauridsen", "Whitacre", "Rutter"],
        "avoid": ["tritones", "diminished"]
    },
    "sad": {
        "techniques": ["minor_mode", "diminished", "sus2"],
        "composers": ["Brahms", "Barber"],
        "avoid": ["major_mode", "bright_extensions"]
    },
    "romantic": {
        "techniques": ["maj7", "modal_mixture", "chromatic"],
        "composers": ["Brahms", "Schubert", "Wagner"],
        "avoid": ["sparse_voicing"]
    },
    "dreamlike": {
        "techniques": ["modal_mixture", "sus4", "open_voicing"],
        "composers": ["Debussy", "Pärt", "Whitacre"],
        "avoid": ["tritones", "aggressive_rhythm"]
    },
    "dramatic": {
        "techniques": ["V-I", "chromatic", "low_register"],
        "composers": ["Penderecki", "Shostakovich"],
        "avoid": ["sparse_voicing"]
    },
    "grounded": {
        "techniques": ["low_register", "minor_mode", "root_position"],
        "composers": ["Brahms", "Penderecki"],
        "avoid": ["open_voicing", "high_register"]
    },
    "sacred": {
        "techniques": ["sus4", "maj7", "open_voicing"],
        "composers": ["Whitacre", "Lauridsen", "Pärt"],
        "avoid": ["tritones"]
    },
    "renaissance": {
        "techniques": ["root_position", "parallel_motion", "open_voicing"],
        "composers": ["Palestrina", "Lasso"],
        "avoid": ["chromatic", "dense_voicing"]
    },
    "modern": {
        "techniques": ["chromatic", "parallel_9ths", "extended_harmony"],
        "composers": ["Debussy", "Ravel"],
        "avoid": ["strict_voice_leading"]
    },
    "peaceful": {
        "techniques": ["sus4", "open_voicing", "maj7", "add9"],
        "composers": ["Whitacre", "Lauridsen", "Pärt"],
        "avoid": ["tritones", "diminished", "aggressive_rhythm"]
    },
    "intense": {
        "techniques": ["minor_mode", "V-I", "chromatic", "low_register"],
        "composers": ["Penderecki", "Shostakovich", "Williams"],
        "avoid": ["open_voicing", "sparse_voicing"]
    },
    "joyful": {
        "techniques": ["major_mode", "add9", "ascending_bass", "bright_extensions"],
        "composers": ["Rutter", "Lauridsen", "Whitacre"],
        "avoid": ["minor_mode", "diminished", "low_register"]
    },
    "mysterious": {
        "techniques": ["chromatic", "modal_mixture", "diminished", "tritone"],
        "composers": ["Penderecki", "Ligeti", "Whitacre"],
        "avoid": ["parallel_motion", "open_voicing"]
    },
    "angelic": {
        "techniques": ["maj7", "open_voicing", "add9", "sus4"],
        "composers": ["Whitacre", "Lauridsen", "Pärt"],
        "avoid": ["tritones", "dense_voicing", "minor_mode"]
    },
    "solemn": {
        "techniques": ["minor_mode", "diminished", "sus2", "low_register"],
        "composers": ["Brahms", "Penderecki", "Shostakovich"],
        "avoid": ["major_mode", "bright_extensions", "ascending_bass"]
    },
    "melancholic": {
        "techniques": ["minor_mode", "modal_mixture", "sus2", "chromatic"],
        "composers": ["Barber", "Brahms", "Whitacre"],
        "avoid": ["major_mode", "ascending_bass", "bright_extensions"]
    }
}


class EmotionalMapper:
    """
    Maps emotional intent descriptions to harmonic techniques.
    Extracts keywords from user input and combines relevant techniques.
    """

    def __init__(self):
        self.mappings = EMOTIONAL_MAPPINGS

    def extract_keywords(self, intent: str) -> Set[str]:
        """
        Extract emotional keywords from user intent.

        Args:
            intent: Free-form text description (e.g., "More ethereal and floating")

        Returns:
            Set of recognized keywords
        """
        intent_lower = intent.lower()
        keywords = set()

        # Direct keyword matching
        for keyword in self.mappings.keys():
            if keyword in intent_lower:
                keywords.add(keyword)

        # Handle multi-word descriptions
        # "more ethereal" -> "ethereal"
        # "darker and more grounded" -> "dark", "grounded"
        words = re.findall(r'\b\w+\b', intent_lower)
        for word in words:
            # Check for partial matches (e.g., "floating" matches "float")
            for keyword in self.mappings.keys():
                if word in keyword or keyword in word:
                    keywords.add(keyword)

        return keywords

    def get_techniques(self, intent: str) -> List[str]:
        """
        Get harmonic techniques based on emotional intent.

        Args:
            intent: Free-form text description

        Returns:
            List of technique names, sorted by relevance
        """
        keywords = self.extract_keywords(intent)

        # Combine techniques from all matching keywords
        techniques = set()
        for keyword in keywords:
            if keyword in self.mappings:
                techniques.update(self.mappings[keyword]["techniques"])

        # If no keywords matched, return empty list
        if not keywords:
            return []

        # Return unique techniques
        return list(techniques)

    def get_composers(self, intent: str) -> List[str]:
        """
        Get composer examples relevant to the intent.

        Args:
            intent: Free-form text description

        Returns:
            List of composer names
        """
        keywords = self.extract_keywords(intent)
        composers = set()

        for keyword in keywords:
            if keyword in self.mappings:
                composers.update(self.mappings[keyword]["composers"])

        return list(composers)

    def should_avoid(self, intent: str) -> List[str]:
        """
        Get techniques to avoid based on intent.

        Args:
            intent: Free-form text description

        Returns:
            List of techniques to avoid
        """
        keywords = self.extract_keywords(intent)
        avoid = set()

        for keyword in keywords:
            if keyword in self.mappings:
                avoid.update(self.mappings[keyword]["avoid"])

        return list(avoid)
