# Week 4 Prompt 004: Why This? Panel

## Objective
Create an educational side panel that explains WHY a specific chord was chosen, showing evolution from simple to complex and providing play buttons for comparison.

## Requirements

### Panel Trigger
- Right-click any chord → Context menu shows "Why This? 🤔"
- Click → Panel slides in from right (380px wide)
- Semi-transparent backdrop overlays canvas

### Panel Content Sections

1. **Context Explanation**
   - "Lauridsen uses Dmadd9 to create ethereal quality over the word 'mysterium'"
   - 2-3 sentences explaining THIS chord in THIS context

2. **Evolution Chain** (3-4 steps)
   - Step 1: D major (basic triad)
   - Step 2: Dmaj7 (add 7th)
   - Step 3: Dmadd9 (Lauridsen's choice)
   - Each with description and play buttons

3. **Play Controls**
   - [▶ Isolated] - Play chord alone for 3 sec
   - [▶ In Progression] - Play prev → this → next
   - [▶ Evolution Chain] - Play all variations in sequence
   - [+ Add to Canvas] - Add variation as new chord

4. **Try It Yourself**
   - [Replace with D major] - Swap with simpler version
   - [Replace with Dmaj7]
   - [Keep Dmadd9]

### Visual Design
- Background: White with subtle shadow
- Typography: 13px Inter Regular, 15px for headings
- Colors from spec (#4A90E2, #7F8C8D, etc.)
- Animations: Slide in 300ms, smooth transitions

## Integration with AI
- Content comes from AI Explanation System (Prompt 005)
- Panel structure is static, content is dynamic
- Loading state while AI generates explanation

**Estimated Time:** 2-3 hours
