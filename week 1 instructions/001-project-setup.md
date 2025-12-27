# Prompt 001: Project Setup - Vite + React + TypeScript

## Objective
Create a modern, production-ready React project with TypeScript using Vite as the build tool. This will serve as the foundation for the Neume application.

## Context
This is the first step in building Neume, an interactive chord progression generator for classical choral composers. We need a fast, modern development environment with full TypeScript support and optimal developer experience.

**Related Components:** None yet - this is the foundation
**Current State:** Starting from scratch
**Next Steps:** After this, we'll install dependencies and set up project structure

## Requirements

1. **Initialize Vite project** with React + TypeScript template
2. **Configure TypeScript** with strict mode and appropriate compiler options
3. **Set up ESLint** for code quality
4. **Configure Vite** for optimal development experience
5. **Create basic app structure** (App.tsx, main.tsx)
6. **Set up CSS** infrastructure (support for CSS modules)
7. **Configure absolute imports** using path aliases
8. **Add .gitignore** with appropriate exclusions
9. **Create README** with setup instructions
10. **Verify build works** (dev server and production build)

## Technical Constraints

- **Node version:** 18+ recommended
- **Package manager:** npm (consistent with project)
- **Build tool:** Vite 5.x
- **React version:** 18.x
- **TypeScript version:** 5.x
- **Target browsers:** Modern evergreen browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

## Code Structure

```
neume/
├── public/
│   └── (empty for now - will add assets later)
├── src/
│   ├── App.tsx
│   ├── App.module.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── .eslintrc.cjs
└── README.md
```

## Configuration Details

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@utils/*": ["./src/utils/*"],
      "@types/*": ["./src/types/*"],
      "@audio/*": ["./src/audio/*"],
      "@ai/*": ["./src/ai/*"],
      "@store/*": ["./src/store/*"],
      "@hooks/*": ["./src/hooks/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Vite Configuration (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@audio': path.resolve(__dirname, './src/audio'),
      '@ai': path.resolve(__dirname, './src/ai'),
      '@store': path.resolve(__dirname, './src/store'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

### ESLint Configuration (.eslintrc.cjs)

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
```

## Initial App Code

### src/main.tsx

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### src/App.tsx

```typescript
import './App.module.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Neume</h1>
        <p>Foundation Setup Complete</p>
      </header>
      <main className="app-main">
        <p>Week 1: Building the foundation...</p>
      </main>
    </div>
  )
}

export default App
```

### src/App.module.css

```css
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
}

.app-header {
  padding: 2rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.app-main {
  flex: 1;
  padding: 2rem;
}
```

### src/index.css

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```

## .gitignore

```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

## README.md

```markdown
# Neume

An interactive chord progression generator for classical choral composers.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview production build:
   ```bash
   npm run preview
   ```

## Tech Stack

- React 18
- TypeScript 5
- Vite 5
- CSS Modules

## Project Status

Week 1: Foundation - IN PROGRESS
```

## Installation Commands

```bash
# Create project
npm create vite@latest neume -- --template react-ts

# Navigate to project
cd neume

# Install ESLint dependencies
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks eslint-plugin-react-refresh

# Verify setup
npm run dev
```

## Quality Criteria

- [ ] TypeScript compilation works without errors
- [ ] Dev server starts on port 3000
- [ ] Production build completes successfully
- [ ] ESLint runs without errors
- [ ] Path aliases work (@/ imports resolve correctly)
- [ ] Hot module replacement (HMR) works
- [ ] CSS modules are enabled and working
- [ ] README has clear setup instructions
- [ ] .gitignore excludes appropriate files

## Implementation Notes

1. **Path Aliases:** The `@/` alias pattern makes imports cleaner and easier to refactor. Instead of `../../../components/Foo`, you write `@components/Foo`.

2. **CSS Modules:** Enabled by default in Vite. Any `.module.css` file gets scoped styles automatically.

3. **Strict TypeScript:** We're using strict mode to catch errors early. This will pay dividends as the codebase grows.

4. **Port 3000:** Chosen to match common React conventions and avoid conflicts.

## Testing Considerations

After setup, verify:

1. **Dev server works:**
   ```bash
   npm run dev
   # Should open browser at http://localhost:3000
   # Should show "Neume" header
   ```

2. **Hot reload works:**
   - Edit src/App.tsx
   - Save file
   - Browser should update without full refresh

3. **TypeScript checking:**
   ```bash
   npx tsc --noEmit
   # Should complete with no errors
   ```

4. **Build works:**
   ```bash
   npm run build
   # Should create dist/ folder with optimized assets
   ```

5. **Path aliases work:**
   - Create a test file at `src/components/Test.tsx`
   - Import it in App.tsx: `import Test from '@components/Test'`
   - Should resolve correctly

## Next Steps

After this setup is complete:
1. Install project dependencies (Prompt 002)
2. Set up project structure and types (Prompt 003)
3. Begin building visual components

---

**Output Format:** Provide all configuration files, initial source code, and installation commands. Ensure the project runs successfully with `npm run dev`.
