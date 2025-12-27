# Prompt 008: Week 1 Integration Demo

## Objective
Create a complete integration demo that brings together all Week 1 components (canvas, grid, shapes, colors, watercolor background) into a working visual prototype. This verifies that the foundation is solid and ready for Week 2 interactions.

## Context
Week 1 has built the visual foundation:
- ✅ Project setup
- ✅ Dependencies installed
- ✅ Project structure & types
- ✅ Color system
- ✅ Canvas with grid
- ✅ Chord shapes (all 7 types)
- ✅ Watercolor background

Now we need to integrate everything and create a demo that showcases the visual design.

**Dependencies:**
- Requires ALL previous Week 1 prompts (001-007)

**Purpose:**
- Verify all components work together
- Test visual design system
- Provide baseline for Week 2 development
- Demonstrate progress to stakeholders

## Requirements

1. **Create demo progression** with all 7 chord types visible
2. **Show multiple states** (default, hover, selected, playing)
3. **Test key changes** (demonstrate background transitions)
4. **Verify zoom levels** (0.5x, 1x, 2x)
5. **Test all scale degrees** in both major and minor
6. **Show chromatic chords** with shimmer effect
7. **Display extension badges** (7th, add9, sus4)
8. **Demonstrate playhead** animation
9. **Provide interactive controls** for testing
10. **Create visual regression tests** (screenshot comparisons)

## Technical Constraints

- Must run smoothly (60fps)
- All components properly typed (no TypeScript errors)
- Clean console (no warnings or errors)
- Responsive to window resize
- Keyboard accessible

## Implementation

### src/App.tsx (Integration Demo)

```typescript
import React, { useState } from 'react';
import { Canvas } from '@/components/Canvas/Canvas';
import { ChordShape } from '@/components/Canvas/ChordShape';
import { Chord, MusicalKey, Mode } from '@types';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

/**
 * Week 1 Integration Demo
 * Showcases complete visual system
 */
function App() {
  const [currentKey, setCurrentKey] = useState<MusicalKey>('C');
  const [currentMode, setCurrentMode] = useState<Mode>('major');
  const [zoom, setZoom] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [selectedChordId, setSelectedChordId] = useState<string | null>(null);

  // Demo progression: I - V - vi - IV (Pop Progression) with variations
  const demoChords: Chord[] = [
    // Measure 1: I (Tonic circle)
    {
      id: uuidv4(),
      scaleDegree: 1,
      quality: 'major',
      extensions: { add9: true },
      key: currentKey,
      mode: currentMode,
      isChromatic: false,
      voices: { soprano: 'E4', alto: 'C4', tenor: 'G3', bass: 'C3' },
      startBeat: 0,
      duration: 4,
      position: { x: 100, y: 250 },
      size: 60,
      selected: selectedChordId === 'chord-1',
      playing: isPlaying && playheadPosition >= 0 && playheadPosition < 4,
      source: 'user',
      createdAt: new Date().toISOString(),
    },
    // Measure 2: V (Dominant pentagon)
    {
      id: uuidv4(),
      scaleDegree: 5,
      quality: 'major',
      extensions: { sus4: true },
      key: currentKey,
      mode: currentMode,
      isChromatic: false,
      voices: { soprano: 'F4', alto: 'D4', tenor: 'G3', bass: 'G2' },
      startBeat: 4,
      duration: 4,
      position: { x: 420, y: 250 },
      size: 60,
      selected: selectedChordId === 'chord-2',
      playing: isPlaying && playheadPosition >= 4 && playheadPosition < 8,
      source: 'user',
      createdAt: new Date().toISOString(),
    },
    // Measure 3: vi (Submediant dotted circle)
    {
      id: uuidv4(),
      scaleDegree: 6,
      quality: 'minor',
      extensions: {},
      key: currentKey,
      mode: currentMode,
      isChromatic: false,
      voices: { soprano: 'E4', alto: 'C4', tenor: 'A3', bass: 'A2' },
      startBeat: 8,
      duration: 4,
      position: { x: 740, y: 250 },
      size: 60,
      selected: selectedChordId === 'chord-3',
      playing: isPlaying && playheadPosition >= 8 && playheadPosition < 12,
      source: 'user',
      createdAt: new Date().toISOString(),
    },
    // Measure 4: IV (Subdominant square)
    {
      id: uuidv4(),
      scaleDegree: 4,
      quality: 'major',
      extensions: {},
      key: currentKey,
      mode: currentMode,
      isChromatic: false,
      voices: { soprano: 'F4', alto: 'C4', tenor: 'A3', bass: 'F3' },
      startBeat: 12,
      duration: 4,
      position: { x: 1060, y: 250 },
      size: 60,
      selected: selectedChordId === 'chord-4',
      playing: isPlaying && playheadPosition >= 12 && playheadPosition < 16,
      source: 'user',
      createdAt: new Date().toISOString(),
    },
    // Measure 5: ii (Supertonic rounded square)
    {
      id: uuidv4(),
      scaleDegree: 2,
      quality: 'minor',
      extensions: {},
      key: currentKey,
      mode: currentMode,
      isChromatic: false,
      voices: { soprano: 'F4', alto: 'D4', tenor: 'A3', bass: 'D3' },
      startBeat: 16,
      duration: 4,
      position: { x: 100, y: 380 },
      size: 60,
      selected: selectedChordId === 'chord-5',
      playing: isPlaying && playheadPosition >= 16 && playheadPosition < 20,
      source: 'user',
      createdAt: new Date().toISOString(),
    },
    // Measure 6: iii (Mediant triangle)
    {
      id: uuidv4(),
      scaleDegree: 3,
      quality: 'minor',
      extensions: {},
      key: currentKey,
      mode: currentMode,
      isChromatic: false,
      voices: { soprano: 'E4', alto: 'B3', tenor: 'G3', bass: 'E3' },
      startBeat: 20,
      duration: 4,
      position: { x: 420, y: 380 },
      size: 60,
      selected: selectedChordId === 'chord-6',
      playing: isPlaying && playheadPosition >= 20 && playheadPosition < 24,
      source: 'user',
      createdAt: new Date().toISOString(),
    },
    // Measure 7: vii° (Leading tone outlined pentagon)
    {
      id: uuidv4(),
      scaleDegree: 7,
      quality: 'diminished',
      extensions: {},
      key: currentKey,
      mode: currentMode,
      isChromatic: false,
      voices: { soprano: 'F4', alto: 'D4', tenor: 'B3', bass: 'B2' },
      startBeat: 24,
      duration: 4,
      position: { x: 740, y: 380 },
      size: 60,
      selected: selectedChordId === 'chord-7',
      playing: isPlaying && playheadPosition >= 24 && playheadPosition < 28,
      source: 'user',
      createdAt: new Date().toISOString(),
    },
    // Measure 8: ♭VI (Chromatic - borrowed from minor)
    {
      id: uuidv4(),
      scaleDegree: 6,
      quality: 'major',
      extensions: {},
      key: currentKey,
      mode: currentMode,
      isChromatic: true,
      chromaticType: 'borrowed',
      voices: { soprano: 'E4', alto: 'C4', tenor: 'Ab3', bass: 'Ab2' },
      startBeat: 28,
      duration: 4,
      position: { x: 1060, y: 380 },
      size: 60,
      selected: selectedChordId === 'chord-8',
      playing: isPlaying && playheadPosition >= 28 && playheadPosition < 32,
      source: 'analyzed',
      analyzedFrom: 'Lauridsen - O Magnum Mysterium',
      createdAt: new Date().toISOString(),
    },
  ];

  // Simulate playback
  const handlePlayPause = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      // Simple playback simulation
      const interval = setInterval(() => {
        setPlayheadPosition(prev => {
          if (prev >= 32) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.5; // Advance by half beat
        });
      }, 250); // 120 BPM = 500ms per beat, 250ms per half beat
    } else {
      setIsPlaying(false);
      setPlayheadPosition(0);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>Neume - Week 1 Demo</h1>
        <p>Foundation Complete: Visual System</p>
      </header>

      {/* Controls */}
      <div className="demo-controls">
        <div className="control-group">
          <label>Key:</label>
          <select 
            value={currentKey} 
            onChange={(e) => setCurrentKey(e.target.value as MusicalKey)}
          >
            <option value="C">C</option>
            <option value="G">G</option>
            <option value="D">D</option>
            <option value="A">A</option>
            <option value="E">E</option>
            <option value="F">F</option>
          </select>
          
          <label>Mode:</label>
          <select 
            value={currentMode} 
            onChange={(e) => setCurrentMode(e.target.value as Mode)}
          >
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>
        </div>

        <div className="control-group">
          <label>Zoom:</label>
          <button onClick={() => setZoom(0.5)}>0.5x</button>
          <button onClick={() => setZoom(1.0)}>1x</button>
          <button onClick={() => setZoom(2.0)}>2x</button>
          <span className="zoom-display">{zoom}x</span>
        </div>

        <div className="control-group">
          <button onClick={handlePlayPause} className="play-button">
            {isPlaying ? '⏸ Pause' : '▶ Play Demo'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <Canvas
        currentKey={currentKey}
        currentMode={currentMode}
        zoom={zoom}
        isPlaying={isPlaying}
        playheadPosition={playheadPosition}
        totalBeats={32}
      >
        {demoChords.map(chord => (
          <ChordShape
            key={chord.id}
            chord={chord}
            isSelected={chord.id === selectedChordId}
            isPlaying={chord.playing}
            onSelect={() => setSelectedChordId(
              chord.id === selectedChordId ? null : chord.id
            )}
            zoom={zoom}
          />
        ))}
      </Canvas>

      {/* Legend */}
      <div className="demo-legend">
        <h3>Visual System Legend</h3>
        <div className="legend-grid">
          <div className="legend-item">
            <div className="legend-shape circle" />
            <span>I (Tonic) - Circle</span>
          </div>
          <div className="legend-item">
            <div className="legend-shape rounded-square" />
            <span>ii (Supertonic) - Rounded Square</span>
          </div>
          <div className="legend-item">
            <div className="legend-shape triangle" />
            <span>iii (Mediant) - Triangle</span>
          </div>
          <div className="legend-item">
            <div className="legend-shape square" />
            <span>IV (Subdominant) - Square</span>
          </div>
          <div className="legend-item">
            <div className="legend-shape pentagon" />
            <span>V (Dominant) - Pentagon</span>
          </div>
          <div className="legend-item">
            <div className="legend-shape circle-dotted" />
            <span>vi (Submediant) - Circle</span>
          </div>
          <div className="legend-item">
            <div className="legend-shape pentagon-outlined" />
            <span>vii° (Leading Tone) - Pentagon</span>
          </div>
        </div>
        
        <div className="legend-section">
          <h4>Interactive States</h4>
          <ul>
            <li><strong>Hover:</strong> Shape scales to 1.05x with glow</li>
            <li><strong>Selected:</strong> Blue stroke, 1.03x scale</li>
            <li><strong>Playing:</strong> Breathing pulse (1.0 → 1.12 → 1.0)</li>
            <li><strong>Chromatic:</strong> Iridescent shimmer overlay</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
```

### src/App.css

```css
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  height: var(--header-height);
  background-color: var(--background-primary);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: var(--shadow-sm);
}

.app-header h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.app-header p {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.demo-controls {
  background-color: var(--background-secondary);
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  gap: 32px;
  align-items: center;
}

.control-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.control-group label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.control-group select,
.control-group button {
  padding: 6px 12px;
  border: 1px solid var(--border-medium);
  border-radius: var(--border-radius-sm);
  background-color: white;
  font-size: 13px;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-apple-smooth);
}

.control-group select:hover,
.control-group button:hover {
  border-color: var(--primary-action);
  background-color: rgba(74, 144, 226, 0.05);
}

.play-button {
  background-color: var(--primary-action);
  color: white;
  border: none;
  padding: 8px 16px;
  font-weight: 500;
}

.play-button:hover {
  background-color: #3a7bc8;
}

.zoom-display {
  font-size: 13px;
  color: var(--text-secondary);
  min-width: 40px;
}

.demo-legend {
  background-color: var(--background-primary);
  padding: 24px;
  border-top: 1px solid var(--border-light);
}

.demo-legend h3 {
  font-size: 15px;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.demo-legend h4 {
  font-size: 13px;
  margin: 16px 0 8px;
  color: var(--text-primary);
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: var(--text-secondary);
}

.legend-shape {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.legend-shape.circle {
  border-radius: 50%;
  background-color: var(--color-major-I);
}

.legend-shape.rounded-square {
  border-radius: 4px;
  background-color: var(--color-major-ii);
}

.legend-shape.triangle {
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-bottom: 20px solid var(--color-major-iii);
  background: none;
}

.legend-shape.square {
  background-color: var(--color-major-IV);
}

.legend-shape.pentagon {
  background-color: var(--color-major-V);
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
}

.legend-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.legend-section li {
  font-size: 13px;
  color: var(--text-secondary);
  padding: 4px 0;
}
```

## Testing Checklist

### Visual Tests

- [ ] **All 7 shapes render correctly**
  - I: Circle (gold)
  - ii: Rounded square (sage green)
  - iii: Triangle (dusty rose)
  - IV: Square (periwinkle blue)
  - V: Pentagon (terracotta)
  - vi: Circle (purple)
  - vii°: Pentagon (gray)

- [ ] **Colors match spec**
  - Compare with color system constants
  - Verify in both major and minor modes

- [ ] **Background changes smoothly**
  - Change key from C to G
  - Verify 400ms transition
  - No jarring flashes

- [ ] **Watercolor effect visible**
  - Subtle texture present
  - Paper grain visible
  - Not distracting

- [ ] **Extension badges display**
  - "+9" on Iadd9
  - "sus4" on Vsus4
  - Positioned correctly (top-right)

- [ ] **Chromatic shimmer works**
  - ♭VI chord has iridescent overlay
  - Glow effect visible

### Interaction Tests

- [ ] **Hover state**
  - Shape scales to 1.05x
  - Subtle glow appears
  - Smooth animation

- [ ] **Selection**
  - Click chord → blue stroke appears
  - Click again → deselects
  - Only one selected at a time

- [ ] **Playing animation**
  - Click play → playhead moves
  - Chords pulse when playhead passes
  - Breathing rhythm matches spec

- [ ] **Zoom levels**
  - 0.5x: All shapes smaller, grid compressed
  - 1x: Default view
  - 2x: All shapes larger, grid expanded

- [ ] **Key changes**
  - Background color updates
  - Chord colors update (if mode changed)
  - Smooth transitions

### Performance Tests

- [ ] **Frame rate**
  - 60fps maintained during playback
  - No dropped frames during zoom
  - Smooth scrolling

- [ ] **Memory usage**
  - No memory leaks
  - Stable after multiple key changes
  - Clean up on unmount

### Accessibility Tests

- [ ] **Keyboard navigation**
  - Tab through controls
  - Focus indicators visible
  - Space/Enter activates buttons

- [ ] **Screen reader**
  - Header announced
  - Controls labeled
  - Chord shapes have ARIA labels

### TypeScript Tests

- [ ] **No compilation errors**
  - `npx tsc --noEmit` passes
  - No type warnings
  - All imports resolve

- [ ] **No runtime errors**
  - Clean console
  - No React warnings
  - No undefined errors

## Quality Criteria

- [ ] Demo runs smoothly at 60fps
- [ ] All components integrated correctly
- [ ] Visual design matches spec exactly
- [ ] Interactive states work as expected
- [ ] Zoom levels function properly
- [ ] Key changes are smooth
- [ ] No TypeScript errors
- [ ] No console warnings or errors
- [ ] Accessible (keyboard, screen reader)
- [ ] Ready for Week 2 development

## Next Steps

After Week 1 integration is verified:

1. **Week 2: Interactions**
   - Right-click context menu
   - Drag-and-drop chord placement
   - Selection system
   - Delete functionality
   - Undo/redo

2. **Document learnings**
   - What worked well
   - What needs refinement
   - Performance notes
   - UX observations

3. **Prepare demo**
   - Record screen capture
   - Create presentation slides
   - Share with stakeholders

---

**Output Format:** Provide complete App.tsx integration demo with controls, legend, and comprehensive testing checklist. Verify all Week 1 components work together seamlessly.
