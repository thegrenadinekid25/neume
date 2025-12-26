# Prompt 002: Install Dependencies - Core Libraries

## Objective
Install all core dependencies required for Harmonic Canvas development, based on the open-source research document. This includes music theory, audio synthesis, UI libraries, and development tools.

## Context
Following the project setup (Prompt 001), we now need to install the battle-tested open-source libraries that will power Harmonic Canvas. These libraries were carefully researched and selected for their quality, licensing, and fit with our requirements.

**Dependencies:** Requires Prompt 001 (Project Setup) to be complete
**Related Components:** All future components will use these libraries
**Next Steps:** After installation, we'll set up project structure and TypeScript types

## Requirements

1. **Install all music theory and audio libraries** (Tonal.js, Tone.js)
2. **Install all UI/interaction libraries** (@dnd-kit, Framer Motion)
3. **Install state management** (Zustand)
4. **Install utility libraries** (uuid, date-fns, FileSaver.js)
5. **Install MIDI export library** (MidiWriterJS)
6. **Install development dependencies** (TypeScript types)
7. **Verify all installations** succeeded
8. **Update package.json** with proper version pinning
9. **Create lock file** for consistent installs

## Technical Constraints

- **License compatibility:** All libraries must be MIT licensed (already verified in research)
- **Bundle size:** Keep total bundle reasonable (libraries are modular)
- **TypeScript support:** All libraries must have types (included or via @types)
- **React compatibility:** All UI libraries must work with React 18
- **Browser support:** Libraries must support modern evergreen browsers

## Dependencies to Install

### Core Music Libraries (CRITICAL - Week 5-6)

```bash
# Tonal.js - Music theory (modular installation)
npm install tonal

# Tone.js - Audio synthesis and scheduling
npm install tone
```

**Why these specific packages:**
- `tonal` is the main package that includes all modules
- `tone` provides complete audio synthesis capabilities

### UI & Interaction Libraries (CRITICAL - Week 3-4)

```bash
# @dnd-kit - Modern drag-and-drop
npm install @dnd-kit/core @dnd-kit/utilities

# Framer Motion - Animations
npm install framer-motion
```

**Why these specific packages:**
- `@dnd-kit/core` + `@dnd-kit/utilities` provide full drag-and-drop
- `framer-motion` is the gold standard for React animations

### State Management (CRITICAL - Week 2)

```bash
# Zustand - Minimal state management
npm install zustand
```

**Why:**
- Already specified in the spec
- Minimal boilerplate, perfect for our needs

### Utility Libraries (CRITICAL - Week 9)

```bash
# UUID - Unique ID generation
npm install uuid

# date-fns - Date handling
npm install date-fns

# FileSaver.js - File downloads
npm install file-saver
```

**Why these specific packages:**
- `uuid` for generating unique chord IDs
- `date-fns` for timestamp handling in saved progressions
- `file-saver` for exporting MIDI files

### MIDI Export (CRITICAL - Week 9)

```bash
# MidiWriterJS - MIDI file generation
npm install midi-writer-js
```

**Why:**
- Clean API, integrates perfectly with Tonal.js
- MIT licensed, actively maintained

### TypeScript Type Definitions

```bash
# Types for libraries that don't include them
npm install -D @types/uuid @types/file-saver
```

**Note:** Most modern libraries (Tonal, Tone, Zustand, Framer Motion, @dnd-kit) include TypeScript definitions, so we only need @types packages for uuid and file-saver.

## Complete Installation Command

Run this single command to install everything:

```bash
npm install tonal tone @dnd-kit/core @dnd-kit/utilities framer-motion zustand uuid date-fns file-saver midi-writer-js && npm install -D @types/uuid @types/file-saver
```

## Expected package.json Dependencies Section

After installation, your `package.json` should include:

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/utilities": "^3.2.2",
    "date-fns": "^3.0.0",
    "file-saver": "^2.0.5",
    "framer-motion": "^10.16.0",
    "midi-writer-js": "^2.1.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tonal": "^5.0.0",
    "tone": "^14.7.77",
    "uuid": "^9.0.1",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/file-saver": "^2.0.7",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@types/uuid": "^9.0.7",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

## Verification Steps

After installation, verify each library:

### 1. Verify Tonal.js

Create `src/test/verify-tonal.ts`:

```typescript
import { Chord, Note, Scale } from 'tonal';

// Test basic functionality
console.log('Tonal.js verification:');
console.log('C major scale:', Scale.get('C major').notes);
console.log('Cmaj7 chord:', Chord.get('Cmaj7').notes);
console.log('C4 MIDI:', Note.midi('C4'));
```

### 2. Verify Tone.js

Create `src/test/verify-tone.ts`:

```typescript
import * as Tone from 'tone';

// Test synth creation
const synth = new Tone.Synth().toDestination();
console.log('Tone.js synth created:', synth instanceof Tone.Synth);
```

### 3. Verify @dnd-kit

```typescript
import { DndContext } from '@dnd-kit/core';

console.log('@dnd-kit imported successfully:', typeof DndContext);
```

### 4. Verify Framer Motion

```typescript
import { motion } from 'framer-motion';

console.log('Framer Motion imported successfully:', typeof motion);
```

### 5. Verify Zustand

```typescript
import { create } from 'zustand';

const useStore = create(() => ({ count: 0 }));
console.log('Zustand store created:', typeof useStore);
```

### 6. Run Verification

```bash
# TypeScript should compile without errors
npx tsc --noEmit

# Should see no TypeScript errors
```

## Quality Criteria

- [ ] All packages install without errors
- [ ] package-lock.json is created/updated
- [ ] No peer dependency warnings
- [ ] All packages are latest stable versions
- [ ] TypeScript can import all libraries without errors
- [ ] No conflicting versions
- [ ] Total node_modules size is reasonable (<500MB)
- [ ] Dev server still starts successfully

## Implementation Notes

1. **Version Pinning:** We use `^` (caret) versioning to allow minor and patch updates but lock major versions. This balances stability with security updates.

2. **Lock File:** The `package-lock.json` ensures everyone on the team gets identical dependency versions. Commit this file to version control.

3. **Modular Imports:** Libraries like Tonal.js and @dnd-kit allow importing only what you need:
   ```typescript
   // Instead of importing everything:
   import * as Tonal from 'tonal';
   
   // Import specific modules:
   import { Chord, Scale } from 'tonal';
   ```

4. **Tree Shaking:** Vite will automatically remove unused code from these libraries in production builds.

5. **Audio Context Warning:** Tone.js will show a console warning about AudioContext needing user interaction. This is expected and will be handled in Week 5-6.

## Bundle Size Reference

Expected production bundle sizes (gzipped):

- **Tonal.js:** ~50KB (only imported modules)
- **Tone.js:** ~150KB (full audio engine)
- **@dnd-kit:** ~10KB (core only)
- **Framer Motion:** ~40KB (tree-shaken)
- **Zustand:** ~2KB (minimal)
- **Other utilities:** ~20KB combined

**Total:** ~270KB for all core libraries (excellent for a music app)

## Common Issues & Solutions

### Issue: Peer Dependency Warnings

```
npm WARN @dnd-kit/core requires a peer of react@^18.0.0
```

**Solution:** This is informational. If React 18 is installed (from Prompt 001), you can ignore.

### Issue: TypeScript Cannot Find Modules

```
Cannot find module 'tone' or its corresponding type declarations
```

**Solution:** 
1. Ensure installation completed: `npm list tone`
2. Restart TypeScript server in your editor
3. Check `node_modules/@types` for type definitions

### Issue: High Severity Vulnerabilities

```
found 3 high severity vulnerabilities
```

**Solution:**
1. Run `npm audit` to see details
2. Run `npm audit fix` to auto-fix if possible
3. Most audio libraries have few dependencies, so this is unlikely

## Next Steps

After dependencies are installed:
1. Set up project folder structure (Prompt 003)
2. Define TypeScript interfaces (Prompt 003)
3. Create color system constants (Prompt 004)
4. Begin building components (Prompts 005-007)

## Testing Installation

Create a simple test file to verify everything works:

**src/test/installation-test.tsx**

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { Chord } from 'tonal';
import * as Tone from 'tone';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Test component using all libraries
export const InstallationTest: React.FC = () => {
  const chord = Chord.get('Cmaj7');
  const id = uuidv4();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2>Installation Test</h2>
      <p>Chord: {chord.name}</p>
      <p>Notes: {chord.notes.join(', ')}</p>
      <p>ID: {id}</p>
      <p>Tone.js version: {Tone.version}</p>
    </motion.div>
  );
};
```

Run `npm run dev` and import this test component to verify everything works together.

---

**Output Format:** Provide the complete installation command, verification steps, and confirmation that all libraries are properly installed and accessible.
