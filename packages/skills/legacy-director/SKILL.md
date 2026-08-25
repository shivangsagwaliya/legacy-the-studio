---
name: legacy-video-editor
description: Studio NLE skill for AI models to edit, color grade, mix audio, script, and render videos using the Legacy engine.
---

# Legacy Professional Video Editor Skill

This skill equips an AI model to operate as a senior Hollywood and YouTube post-production editor. It provides precision guidelines, color grading recipes, audio engineering standards, and direct tool calling instructions.

## 1. Pacing and Style Directives

### A. Retention Cadence (MrBeast Profile)
- Target: High retention social videos and fast-paced YouTube content
- Pacing: Jump cuts every 2.0 to 2.8 seconds
- Spatial Motion: Keyframe punch zoom (1.18x) on emphasis points
- Color Grading: High contrast (+18), vibrant saturation (+24), warm midtones
- Typography: Bold sans-serif captions, word-level active scaling, vibrant yellow highlight

### B. Cinematic Anamorphic (Christopher Nolan Profile)
- Target: Narrative cinema, documentaries, trailer sequences
- Aspect Ratio: 2.39:1 Cinemascope or 1.43:1 IMAX
- Pacing: Extended takes (4.0 to 8.0 seconds) with smooth dissolve transitions
- Color Grading: Kodak 2383 teal and orange balance, cold shadows (-12 lift), warm skin tones, 35mm grain (+15%)
- Audio: Dynamic score with Hans Zimmer style low frequency pads and fade envelopes

### C. Minimal Modern (Varun Mayya Tech Profile)
- Target: Tech walk-throughs, architecture essays, software demos
- Visuals: Dark background, glassmorphism cards, subtle floating mockups
- Typography: Clean modern sans-serif with active word highlighting
- Motion: Smooth ease-out camera glides and clean slides
- Audio: Ambient electronic background music ducked automatically when speech begins

## 2. Audio Engineering Standards

- Dialogue: Main voiceover must sit between -6dB and -3dB
- Background Music: Duck to -18dB to -24dB whenever speech occurs
- Sound Effects: Keep between -12dB and -8dB to avoid ear fatigue
- Noise Suppression: Apply AI voice isolation to remove background room noise

## 3. Color Grading Standards

- Lift (Shadows): Adjust blue-cyan tint for cinematic cool blacks
- Gamma (Midtones): Preserve natural human skin tones around 40 to 60 IRE
- Gain (Highlights): Roll off highlights smoothly to avoid harsh digital clipping

## 4. MCP Tools Reference

- `get_timeline_state()`: Returns current tracks, clips, in/out markers, and duration.
- `apply_director_style(style)`: Sets 'high_energy', 'cinematic', or 'tech_minimal'.
- `auto_cut_silence(min_silence_duration)`: Removes dead air pauses from selected track.
- `generate_subtitles(transcript, style)`: Generates synchronized word-level subtitle track.
- `split_clip_at(track_id, clip_id, timestamp)`: Splits clip at playhead time.
- `render_project(output_path, preset)`: Starts headless FFmpeg export.
