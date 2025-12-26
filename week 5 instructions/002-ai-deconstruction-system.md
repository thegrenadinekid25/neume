# Week 5 Prompt 002: AI Deconstruction System

## Objective
Backend logic to deconstruct complex progressions into evolutionary steps using music theory analysis and Claude API for explanations.

## Requirements

### API Endpoint
```python
@app.post("/api/deconstruct")
async def deconstruct_progression(request: DeconstructRequest):
    """
    Analyze progression and return step-by-step evolution.
    
    Input:
    {
      "chords": [...],  # Complex progression
      "key": "D",
      "mode": "major"
    }
    
    Output:
    {
      "steps": [
        {
          "stepNumber": 0,
          "stepName": "Skeleton",
          "description": "...",
          "chords": [...]
        },
        ...
      ]
    }
    """
```

### Deconstruction Algorithm

**Step 1: Extract Skeleton**
```python
def extract_skeleton(chords):
    """Remove all extensions, return basic triads."""
    skeleton = []
    for chord in chords:
        skeleton.append({
            "root": chord["root"],
            "quality": "major" if chord["quality"] in ["maj7", "add9"] else chord["quality"],
            "extensions": {}
        })
    return skeleton
```

**Step 2: Identify Layers**
```python
def identify_layers(original, skeleton):
    """Find what was added (7ths, 9ths, sus, etc.)"""
    layers = {
        "sevenths": [],
        "suspensions": [],
        "ninths": [],
        "alterations": []
    }
    
    for i, chord in enumerate(original):
        if "7" in chord.get("extensions", {}):
            layers["sevenths"].append(i)
        if "add9" in chord.get("extensions", {}):
            layers["ninths"].append(i)
        if "sus4" in chord.get("extensions", {}):
            layers["suspensions"].append(i)
    
    return layers
```

**Step 3: Create Intermediate Steps**
```python
def create_steps(skeleton, layers):
    """Build progressive versions."""
    steps = [
        {"name": "Skeleton", "chords": skeleton}
    ]
    
    # Add 7ths if present
    if layers["sevenths"]:
        step1 = add_sevenths(skeleton, layers["sevenths"])
        steps.append({"name": "Add 7ths", "chords": step1})
    
    # Add suspensions
    if layers["suspensions"]:
        step2 = add_suspensions(step1, layers["suspensions"])
        steps.append({"name": "Suspensions", "chords": step2})
    
    # Add 9ths
    if layers["ninths"]:
        step3 = add_ninths(step2, layers["ninths"])
        steps.append({"name": "Added 9ths", "chords": step3})
    
    return steps
```

**Step 4: Generate AI Explanations**
```python
async def explain_step(step_name, chords, composer):
    """Use Claude API to explain this step."""
    
    prompt = f"""
Explain this harmonic layer in a chord progression:

Step: {step_name}
Composer style: {composer}
Chords: {chords}

Provide a 2-3 sentence explanation:
1. What this layer adds musically
2. Why composers use this technique
3. Historical/stylistic context

Write for composers, be inspiring and educational.
"""
    
    message = await anthropic_client.messages.create(
        model='claude-sonnet-4-20250514',
        max_tokens=500,
        messages=[{'role': 'user', 'content': prompt}]
    )
    
    return message.content[0].text
```

### Music Theory Rules
- Don't add 9ths before 7ths (violates harmonic building)
- Group related extensions (all sus4s = one step)
- Limit to 3-6 steps (more = overwhelming)
- Each step should sound meaningfully different

### Quality Criteria
- [ ] Skeleton correctly removes all extensions
- [ ] Layers identified accurately
- [ ] Steps build logically (simple → complex)
- [ ] AI explanations are educational
- [ ] 3-6 steps total (not too many)

**Estimated Time:** 2-3 hours
