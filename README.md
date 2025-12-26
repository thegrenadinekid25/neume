# 🎵 Neume

**Explore chord progressions through shapes, colors, and intelligent AI**

A visual music theory tool for composers, arrangers, and students to understand harmony through interactive exploration and AI-powered insights.

---

## ✨ Features

### 🎨 Visual Chord Exploration
- **7 unique shapes** representing scale degrees (I, ii, iii, IV, V, vi, vii°)
- **Color-coded** by harmonic function (tonic, subdominant, dominant)
- **Drag-and-drop** interface for intuitive progression building
- **Real-time playback** with Web Audio API

### 🤖 AI-Powered Analysis
- **Analyze real music** from YouTube URLs or audio files
- **"Why This?" explanations** - Understand why progressions work
- **Build From Bones** - See how simple ideas evolve into complex harmony
- **Refine This** - Emotional intent → specific harmonic techniques

### 💾 Save & Export
- **My Progressions** library with search and favorites
- **MIDI export** for use in your DAW
- **localStorage persistence** - your work is never lost
- **Tags and metadata** for organization

### ⚡ Power User Features
- **Comprehensive keyboard shortcuts** (press `?` to see all)
- **Undo/redo** with full history
- **Multi-select** and batch operations
- **Tutorial system** for first-time users

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Anthropic API key ([get one here](https://console.anthropic.com/))

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Anthropic API key to .env.local:
# VITE_ANTHROPIC_API_KEY=your_key_here
```

### Running Locally

```bash
# Start frontend (Vite dev server)
npm run dev

# In a separate terminal, start backend (Python FastAPI)
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Open [http://localhost:5173](http://localhost:5173) to use the app.

---

## 📖 Usage

### First-Time Users

1. **Complete the tutorial** - Appears automatically on first visit
2. **Play the example progression** - Click Play or press Space
3. **Right-click to add chords** - Build your own progressions
4. **Analyze real music** - Click "Analyze" and paste a YouTube URL
5. **Explore AI features** - Try "Build From Bones" and "Refine This"

### Keyboard Shortcuts

Press `?` to see all shortcuts, or use these essentials:

- `Space` - Play/Pause
- `Cmd/Ctrl + Z` - Undo
- `Cmd/Ctrl + S` - Save progression
- `Cmd/Ctrl + A` - Select all
- `Delete` - Delete selected
- `?` - Show shortcuts guide

---

## 🏗️ Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite for blazing-fast dev server
- Zustand for state management
- Framer Motion for animations
- Web Audio API for playback
- Tone.js for audio synthesis

**Backend:**
- Python 3.12+ with FastAPI
- Anthropic Claude Sonnet 4.5 for AI features
- yt-dlp for YouTube audio extraction
- Essentia/Librosa for audio analysis

**Performance:**
- 197 KB gzipped bundle size
- Code splitting with lazy loading
- React.memo for component optimization
- 60fps animations

---

## 📁 Project Structure

```
neume/
├── src/
│   ├── components/       # React components
│   │   ├── Canvas/       # Main canvas and shapes
│   │   ├── Modals/       # Analyze, Refine This, etc.
│   │   ├── Panels/       # Build From Bones panel
│   │   └── Tutorial/     # Welcome tutorial
│   ├── store/            # Zustand state management
│   ├── audio/            # Audio engine and playback
│   ├── services/         # API services
│   ├── utils/            # Utilities
│   └── styles/           # CSS modules
├── backend/
│   ├── main.py           # FastAPI app
│   ├── services/         # AI and music analysis
│   └── models/           # Data models
└── public/               # Static assets
```

---

## 🎯 Performance

**Lighthouse Scores:**
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >90

**Bundle Size:**
- Main bundle: 197 KB (gzipped)
- Lazy-loaded modals: ~2-11 KB each
- Total initial load: <200 KB

**Browser Support:**
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Anthropic** for Claude API and AI capabilities
- **Music theory inspiration** from Eric Whitacre, Morten Lauridsen, and Arvo Pärt
- **Tonal.js** for music theory utilities
- **Tone.js** for Web Audio abstractions

---

## 🗺️ Roadmap

### v1.1 (Coming Soon)
- [ ] Voice leading visualization
- [ ] MIDI input support
- [ ] More chord types (9ths, 11ths, 13ths)
- [ ] Export to MusicXML
- [ ] Collaboration features

### v2.0 (Future)
- [ ] Mobile app
- [ ] Real-time collaboration
- [ ] AI composition assistant
- [ ] Integration with popular DAWs

---

**Built with ❤️ for composers, by composers**
