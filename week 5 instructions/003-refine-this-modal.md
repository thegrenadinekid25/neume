# Week 5 Prompt 003: Refine This Modal

## Objective
AI-powered suggestions based on emotional/stylistic descriptions. Composers describe what they want to feel, AI provides harmonic techniques.

## Requirements

### Modal Trigger
- Select chord(s) on canvas
- Button appears: [✨ Refine This...]
- Click → Modal opens (600px wide)

### Modal Content

**Free-form Text Input**
```
┌─────────────────────────────────────────┐
│  How should this feel?                  │
├─────────────────────────────────────────┤
│                                         │
│  [Type your intent here...]             │
│                                         │
│  Examples:                              │
│  • "More ethereal and floating"         │
│  • "Darker and more grounded"           │
│  • "Like Arvo Pärt but warmer"          │
│  • "Renaissance outside, Romantic inside"│
│                                         │
│  [Get Suggestions]                      │
│                                         │
└─────────────────────────────────────────┘
```

**AI Suggestions (After Submit)**
```
Suggestions for "More ethereal":

1. Add 9th to I chord (I → Iadd9)
   "The added 9th creates shimmer, characteristic 
    of Lauridsen, Whitacre, and Pärt's sound"
   
   [▶ Preview] [Apply]

2. Suspend V chord (V → Vsus4)
   "Creates floating anticipation, common in 
    sacred choral music"
   
   [▶ Preview] [Apply]

3. Modal mixture (vi → ♭VI)
   "Unexpected dreamlike shift - Romantic harmony"
   
   [▶ Preview] [Apply]

[Not quite right? Try again...]
```

### Technical Implementation

```typescript
// refine-store.ts
interface RefineState {
  isModalOpen: boolean;
  selectedChordIds: string[];
  userIntent: string;
  suggestions: Suggestion[];
  isLoading: boolean;
}

interface Suggestion {
  id: string;
  technique: string; // "add9", "sus4", etc.
  targetChordId: string;
  from: Chord;
  to: Chord;
  rationale: string;
  examples: string[]; // ["Lauridsen", "Whitacre"]
  relevanceScore: number;
}
```

**API Call**
```typescript
async function getSuggestions(intent: string, chords: Chord[]) {
  const response = await fetch('http://localhost:8000/api/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent,
      chords,
      context: {
        key: currentKey,
        mode: currentMode
      }
    })
  });
  
  return response.json();
}
```

**Backend Endpoint (Python)**
```python
@app.post("/api/suggest")
async def suggest_refinements(request: SuggestRequest):
    """
    Generate chord refinement suggestions based on emotional intent.
    """
    
    # Map emotional intent to techniques
    techniques = emotional_mapper.get_techniques(request.intent)
    
    # Generate suggestions
    suggestions = []
    for chord in request.chords:
        for technique in techniques[:3]:  # Max 3 suggestions
            suggestion = apply_technique(chord, technique)
            explanation = await explain_suggestion(
                chord, suggestion, request.intent
            )
            suggestions.append({
                "technique": technique,
                "from": chord,
                "to": suggestion,
                "rationale": explanation
            })
    
    return {"suggestions": suggestions}
```

### Emotional Mapping Database

```python
# In backend
EMOTIONAL_MAPPINGS = {
    "ethereal": {
        "techniques": ["add9", "sus4", "open_voicing", "maj7"],
        "composers": ["Lauridsen", "Whitacre", "Pärt"],
        "avoid": ["tritones", "dense_voicing"]
    },
    "dark": {
        "techniques": ["minor_mode", "diminished", "low_register"],
        "composers": ["Brahms", "Penderecki"],
        "avoid": ["major_mode", "bright_extensions"]
    },
    "triumphant": {
        "techniques": ["major_mode", "V-I", "ascending_bass"],
        "composers": ["Handel", "Williams"],
        "avoid": ["suspensions", "ambiguity"]
    }
}

class EmotionalMapper:
    def get_techniques(self, intent: str):
        # Parse intent, extract keywords
        keywords = extract_keywords(intent)
        
        # Combine mappings for complex requests
        techniques = set()
        for keyword in keywords:
            if keyword in EMOTIONAL_MAPPINGS:
                techniques.update(
                    EMOTIONAL_MAPPINGS[keyword]["techniques"]
                )
        
        return list(techniques)
```

### Iterative Refinement

If user clicks "Not quite right?":
```
┌─────────────────────────────────────────┐
│  What didn't work?                      │
├─────────────────────────────────────────┤
│                                         │
│  [Too subtle / Too extreme /            │
│   Wrong mood / Something else...]       │
│                                         │
│  [Tell me more...]                      │
│                                         │
└─────────────────────────────────────────┘
```

User types: "Too subtle, I can barely hear the difference"

AI adjusts:
```
Okay, let's try something more dramatic:

1. Replace vi with ♭VI (bigger shift)
2. Add maj7(#11) to I (very Lauridsen)
3. Use parallel 9th chords (Debussy-style)
```

### "Surprise Me" Feature

```
[🎲 Surprise me with something unexpected]

Surprise suggestion:

Replace IV with Neapolitan (♭II)
"The Neapolitan chord creates dramatic color.
 Unexpected but grounded in classical harmony
 (Beethoven, Schubert). Try it!"

[▶ Preview] [Apply]
```

## Quality Criteria
- [ ] Modal opens smoothly
- [ ] Text input is responsive
- [ ] Suggestions arrive in <2 sec
- [ ] Rationales are clear and educational
- [ ] Preview lets user hear difference
- [ ] Apply successfully modifies chord
- [ ] Iterative refinement works
- [ ] Surprise me is genuinely interesting

**Estimated Time:** 2-3 hours
