# Legacy

Legacy is an open-source, cross-platform video editor that combines the precision of high-end studio editing (DaVinci Resolve, Final Cut Pro, Premiere Pro) with Remotion-compatible declarative code compositions and autonomous AI agent workflows.

## Key Features

- **Professional Studio Interface**:
  - Obsidian dark theme engineered for color accuracy and distraction-free editing.
  - Dedicated NLE Workspaces: Edit, Text Edit (Transcript Speech Cutter), Color Studio, Fairlight Audio, Motion Effects, Remotion Code, and AI Director.
  - Dual Monitor View: Source Monitor and Program Master Monitor.
  - Video Scopes: Real-time RGB Parade, Vectorscope with skin-tone line, and Waveform monitor.
  - DaVinci Resolve-grade 3-Way Color Wheels: Lift (Shadows), Gamma (Midtones), Gain (Highlights), and Offset (Master) with 3D LUT profiles.
  - Fairlight-grade Audio: Real-time stereo peak dB VU meters, 4-Band Parametric EQ graph, AI voice isolation, and sidechain auto-ducking (-18 dB).
  - Magnetic Multi-Track Timeline: Razor split (`B`), ripple delete (`Del`), magnetic snapping (`S`), In/Out markers (`I` / `O`), and velocity speed ramping curves.

- **Dual Creation Workflow**:
  - **Manual NLE Mode**: Full timeline scrubbing, trimming, color balancing, and audio mixing.
  - **Code Mode**: Declarative React / TypeScript Remotion-compatible code editor with live hot-reload sync.

- **Director Styling Profiles**:
  - **Retention Cadence (MrBeast Profile)**: High-energy cuts, 1.18x punch zoom keyframes, stacked SFX whooshes and impacts, and kinetic yellow subtitles.
  - **Cinematic Anamorphic (Christopher Nolan Profile)**: 2.39:1 Cinemascope and 1.43:1 IMAX aspect ratios, 35mm grain, and teal-orange 3-way color balance.
  - **Minimal Modern (Varun Mayya Profile)**: Clean glass cards, modern typography, and smooth camera glides.

- **AI Agent Integration & MCP Server**:
  - Model Context Protocol (MCP) server for Antigravity, Claude, GPT, or local models.
  - Text-based video editing with diarized transcript word deletion.
  - Word-level subtitle generation with kinetic typography animations.
  - Automatic silence and dead air removal.
  - In-app natural language command copilot.

- **Headless FFmpeg Video Pipeline**:
  - Multi-track hardware-accelerated video export on Linux and Windows.
  - CMX 3600 EDL and Final Cut Pro XML (FCPXML) project interchange.

---

## Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Studio UI
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Run Headless Render via CLI
```bash
node packages/cli/dist/cli.js render demo-project.json -o master_export.mp4
```

### 4. Run AI Agent Model Context Protocol Server
```bash
npm run mcp
```

---

## Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `Space` | Play / Pause |
| `B` | Split clip at playhead (Razor) |
| `Delete` / `Backspace` | Ripple delete selected clip |
| `S` | Toggle magnetic snapping |
| `I` | Mark In Point |
| `O` | Mark Out Point |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |

---

## License

MIT License. Open source for creators, developers, and AI agents.
