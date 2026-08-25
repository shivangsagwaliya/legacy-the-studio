import { create } from 'zustand';
import {
  TimelineProject,
  Track,
  Clip,
  AspectRatio,
  DirectorStyle,
  ASPECT_RATIO_DIMENSIONS,
  ColorWheelValue,
  calculateProjectDuration,
  splitClip,
  rippleDeleteClip,
  findSnapPoint,
  applyMrBeastPacing,
  applyNolanCinematicStyle,
  applyTechMinimalStyle,
  generateSmartCaptions,
  detectSimulatedSilence,
  autoCutSilenceFromTrack,
  MR_BEAST_CAPTION_STYLE,
  NOLAN_CAPTION_STYLE,
  TECH_MINIMAL_CAPTION_STYLE,
} from '@legacy/core';

export type WorkspaceView = 'edit' | 'transcript' | 'color' | 'audio' | 'effects' | 'code' | 'ai';

export interface TimelineState {
  project: TimelineProject;
  history: TimelineProject[];
  historyIndex: number;

  workspace: WorkspaceView;
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  zoom: number;
  snapping: boolean;
  showDualViewer: boolean;
  showScopes: boolean;

  audioMeterL: number; // -60dB to 0dB
  audioMeterR: number; // -60dB to 0dB

  selectedTrackId: string | null;
  selectedClipId: string | null;
  isExporting: boolean;
  exportProgress: number;

  setWorkspace: (workspace: WorkspaceView) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlayPause: () => void;
  stepFrame: (direction: 'forward' | 'backward') => void;
  setZoom: (zoom: number) => void;
  setSnapping: (enabled: boolean) => void;
  setShowDualViewer: (show: boolean) => void;
  setShowScopes: (show: boolean) => void;
  setInPoint: (time?: number) => void;
  setOutPoint: (time?: number) => void;

  selectClip: (trackId: string | null, clipId: string | null) => void;

  splitClipAtPlayhead: () => void;
  rippleDeleteSelected: () => void;
  updateClipTransform: (clipId: string, transform: Partial<Clip['transform']>) => void;
  updateClipColorGrade: (clipId: string, colorGrade: Partial<Clip['colorGrade']>) => void;
  updateClipColorWheel: (clipId: string, wheel: 'lift' | 'gamma' | 'gain' | 'offset', value: Partial<ColorWheelValue>) => void;
  updateClipAudio: (clipId: string, audio: Partial<NonNullable<Clip['audio']>>) => void;
  updateClipSpeed: (clipId: string, speed: number) => void;
  updateClipText: (clipId: string, text: string) => void;
  moveClip: (clipId: string, targetTrackId: string, newStartTime: number) => void;
  trimClip: (clipId: string, newStartTime: number, newDuration: number) => void;
  addClipToTrack: (trackId: string, clip: Clip) => void;

  setAspectRatio: (aspectRatio: AspectRatio) => void;
  setDirectorStyle: (style: DirectorStyle) => void;

  aiCutSilences: () => void;
  aiGenerateSubtitles: (transcript?: string) => void;
  aiExecutePrompt: (prompt: string) => Promise<string>;

  undo: () => void;
  redo: () => void;
  pushHistory: (newProject: TimelineProject) => void;

  exportVideo: (preset: 'fast' | 'high_quality') => Promise<void>;
}

const INITIAL_PROJECT: TimelineProject = {
  id: 'project-legacy-pro',
  title: 'Cinematic Narrative Master',
  version: '2.0.0',
  settings: {
    aspectRatio: '16:9',
    width: 3840,
    height: 2160,
    fps: 30,
    sampleRate: 48000,
    directorStyle: 'standard',
    colorSpace: 'display_p3',
  },
  duration: 14.0,
  inPoint: 0,
  outPoint: 14.0,
  beatMarkers: [
    { id: 'b-1', time: 0, strength: 1.0 },
    { id: 'b-2', time: 2.5, strength: 0.8 },
    { id: 'b-3', time: 5.0, strength: 0.9 },
    { id: 'b-4', time: 7.5, strength: 0.8 },
    { id: 'b-5', time: 10.0, strength: 1.0 },
    { id: 'b-6', time: 12.5, strength: 0.8 },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tracks: [
    {
      id: 'track-v1',
      name: 'Video A-Roll',
      type: 'video',
      muted: false,
      locked: false,
      visible: true,
      volume: 1.0,
      pan: 0,
      clips: [
        {
          id: 'clip-v1',
          trackId: 'track-v1',
          name: 'Hero Establishing 4K',
          type: 'video',
          src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          startTime: 0,
          duration: 5.0,
          sourceStartTime: 0,
          sourceDuration: 5.0,
          speed: 1.0,
          transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1.0 },
          colorGrade: {
            brightness: 0,
            contrast: 12,
            saturation: 14,
            temperature: -2,
            tint: 0,
            shadows: 2,
            highlights: -4,
            vignette: 10,
            filmGrain: 0,
            wheels: {
              lift: { hue: 215, saturation: 10, luminance: -4 },
              gamma: { hue: 40, saturation: 8, luminance: 2 },
              gain: { hue: 45, saturation: 6, luminance: 0 },
              offset: { hue: 0, saturation: 0, luminance: 0 },
            },
          },
          keyframes: [],
        },
        {
          id: 'clip-v2',
          trackId: 'track-v1',
          name: 'Subject Motion Tracking',
          type: 'video',
          src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          startTime: 5.0,
          duration: 4.5,
          sourceStartTime: 8.0,
          sourceDuration: 4.5,
          speed: 1.0,
          transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1.0 },
          colorGrade: {
            brightness: 2,
            contrast: 15,
            saturation: 18,
            temperature: 2,
            tint: 0,
            shadows: 0,
            highlights: -6,
            vignette: 8,
            filmGrain: 0,
            wheels: {
              lift: { hue: 200, saturation: 8, luminance: -2 },
              gamma: { hue: 35, saturation: 10, luminance: 4 },
              gain: { hue: 40, saturation: 8, luminance: 2 },
              offset: { hue: 0, saturation: 0, luminance: 0 },
            },
          },
          keyframes: [],
        },
        {
          id: 'clip-v3',
          trackId: 'track-v1',
          name: 'Climax High Key',
          type: 'video',
          src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          startTime: 9.5,
          duration: 4.5,
          sourceStartTime: 0,
          sourceDuration: 4.5,
          speed: 1.0,
          transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1.0 },
          colorGrade: {
            brightness: -1,
            contrast: 18,
            saturation: 10,
            temperature: -4,
            tint: -2,
            shadows: -4,
            highlights: -8,
            vignette: 14,
            filmGrain: 8,
            wheels: {
              lift: { hue: 210, saturation: 14, luminance: -6 },
              gamma: { hue: 30, saturation: 12, luminance: 0 },
              gain: { hue: 35, saturation: 10, luminance: -2 },
              offset: { hue: 0, saturation: 0, luminance: 0 },
            },
          },
          keyframes: [],
        },
      ],
    },
    {
      id: 'track-v2',
      name: 'Video B-Roll',
      type: 'broll',
      muted: false,
      locked: false,
      visible: true,
      volume: 1.0,
      pan: 0,
      clips: [
        {
          id: 'clip-broll-1',
          trackId: 'track-v2',
          name: 'Architecture Cutaway',
          type: 'graphic',
          startTime: 3.0,
          duration: 2.0,
          sourceStartTime: 0,
          sourceDuration: 2.0,
          speed: 1.0,
          transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1.0 },
          colorGrade: { brightness: 0, contrast: 0, saturation: 0, temperature: 0, tint: 0, shadows: 0, highlights: 0, vignette: 0, filmGrain: 0 },
          keyframes: [],
        },
      ],
    },
    {
      id: 'track-captions',
      name: 'Subtitles & Dialogue',
      type: 'subtitle',
      muted: false,
      locked: false,
      visible: true,
      volume: 1.0,
      pan: 0,
      clips: [
        {
          id: 'cap-1',
          trackId: 'track-captions',
          name: 'Line 01',
          type: 'subtitle',
          startTime: 0.8,
          duration: 3.2,
          sourceStartTime: 0,
          sourceDuration: 3.2,
          speed: 1.0,
          text: 'DESIGNED FOR UNCOMPROMISED CINEMA',
          captionStyle: {
            fontFamily: 'Inter, -apple-system, sans-serif',
            fontSize: 34,
            textColor: '#FFFFFF',
            highlightColor: '#38BDF8',
            backgroundColor: 'rgba(10, 12, 16, 0.85)',
            hasShadow: true,
            hasStroke: false,
            uppercase: true,
            animation: 'word_highlight',
            positionY: 82,
          },
          words: [
            { word: 'DESIGNED', start: 0.8, end: 1.4, speaker: 'Host' },
            { word: 'FOR', start: 1.4, end: 1.8, speaker: 'Host' },
            { word: 'UNCOMPROMISED', start: 1.8, end: 2.8, speaker: 'Host' },
            { word: 'CINEMA', start: 2.8, end: 4.0, speaker: 'Host' },
          ],
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
          colorGrade: { brightness: 0, contrast: 0, saturation: 0, temperature: 0, tint: 0, shadows: 0, highlights: 0, vignette: 0, filmGrain: 0 },
          keyframes: [],
        },
      ],
    },
    {
      id: 'track-a1',
      name: 'Dialogue Voiceover',
      type: 'audio',
      muted: false,
      locked: false,
      visible: true,
      volume: 1.0,
      pan: 0,
      clips: [],
    },
    {
      id: 'track-a2',
      name: 'Master Score',
      type: 'music',
      muted: false,
      locked: false,
      visible: true,
      volume: 0.85,
      pan: 0,
      clips: [
        {
          id: 'score-1',
          trackId: 'track-a2',
          name: 'Hans Zimmer Tension Pad',
          type: 'audio',
          startTime: 0,
          duration: 14.0,
          sourceStartTime: 0,
          sourceDuration: 14.0,
          speed: 1.0,
          audio: {
            volume: 0.82,
            fadeIn: 1.0,
            fadeOut: 2.0,
            pan: 0,
            ducking: true,
            duckingAmount: -18,
            mute: false,
          },
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
          colorGrade: { brightness: 0, contrast: 0, saturation: 0, temperature: 0, tint: 0, shadows: 0, highlights: 0, vignette: 0, filmGrain: 0 },
          keyframes: [],
        },
      ],
    },
  ],
};

export const useTimelineStore = create<TimelineState>((set, get) => ({
  project: INITIAL_PROJECT,
  history: [INITIAL_PROJECT],
  historyIndex: 0,

  workspace: 'edit',
  currentTime: 0,
  isPlaying: false,
  playbackSpeed: 1.0,
  zoom: 75,
  snapping: true,
  showDualViewer: false,
  showScopes: false,

  audioMeterL: -14,
  audioMeterR: -14,

  selectedTrackId: 'track-v1',
  selectedClipId: 'clip-v1',
  isExporting: false,
  exportProgress: 0,

  setWorkspace: (workspace) => set({ workspace }),

  setCurrentTime: (time) => {
    const maxTime = get().project.duration;
    const clamped = Math.max(0, Math.min(time, maxTime));

    // Dynamic audio meter fluctuation
    const isPlaying = get().isPlaying;
    const l = isPlaying ? -12 + (Math.sin(clamped * 10) * 8) : -60;
    const r = isPlaying ? -14 + (Math.cos(clamped * 8) * 7) : -60;

    set({ currentTime: clamped, audioMeterL: l, audioMeterR: r });
  },

  setIsPlaying: (playing) => set({ isPlaying: playing }),
  togglePlayPause: () => set((s) => ({ isPlaying: !s.isPlaying })),

  stepFrame: (direction) => {
    const fps = get().project.settings.fps || 30;
    const delta = 1 / fps;
    const newTime = direction === 'forward' ? get().currentTime + delta : get().currentTime - delta;
    get().setCurrentTime(newTime);
  },

  setZoom: (zoom) => set({ zoom: Math.max(20, Math.min(zoom, 300)) }),
  setSnapping: (enabled) => set({ snapping: enabled }),
  setShowDualViewer: (show) => set({ showDualViewer: show }),
  setShowScopes: (show) => set({ showScopes: show }),

  setInPoint: (time) => {
    const t = time ?? get().currentTime;
    set((s) => ({ project: { ...s.project, inPoint: t } }));
  },

  setOutPoint: (time) => {
    const t = time ?? get().currentTime;
    set((s) => ({ project: { ...s.project, outPoint: t } }));
  },

  selectClip: (trackId, clipId) => set({ selectedTrackId: trackId, selectedClipId: clipId }),

  pushHistory: (newProject) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newProject);
    set({
      project: newProject,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      set({
        historyIndex: historyIndex - 1,
        project: history[historyIndex - 1],
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({
        historyIndex: historyIndex + 1,
        project: history[historyIndex + 1],
      });
    }
  },

  splitClipAtPlayhead: () => {
    const { project, currentTime, selectedClipId, selectedTrackId } = get();
    if (!selectedClipId || !selectedTrackId) return;

    const track = project.tracks.find((t) => t.id === selectedTrackId);
    if (!track) return;

    const updatedTrack = splitClip(track, selectedClipId, currentTime);
    const updatedTracks = project.tracks.map((t) => (t.id === selectedTrackId ? updatedTrack : t));

    const newProject: TimelineProject = {
      ...project,
      tracks: updatedTracks,
      updatedAt: new Date().toISOString(),
    };

    get().pushHistory(newProject);
  },

  rippleDeleteSelected: () => {
    const { project, selectedClipId } = get();
    if (!selectedClipId) return;

    const updatedTracks = rippleDeleteClip(project.tracks, selectedClipId);
    const newDuration = calculateProjectDuration(updatedTracks);

    const newProject: TimelineProject = {
      ...project,
      duration: newDuration,
      tracks: updatedTracks,
      updatedAt: new Date().toISOString(),
    };

    set({ selectedClipId: null });
    get().pushHistory(newProject);
  },

  updateClipTransform: (clipId, transformUpdates) => {
    const { project } = get();
    const updatedTracks = project.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((clip) => {
        if (clip.id !== clipId) return clip;
        return {
          ...clip,
          transform: { ...clip.transform, ...transformUpdates },
        };
      }),
    }));

    set({ project: { ...project, tracks: updatedTracks } });
  },

  updateClipColorGrade: (clipId, colorUpdates) => {
    const { project } = get();
    const updatedTracks = project.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((clip) => {
        if (clip.id !== clipId) return clip;
        return {
          ...clip,
          colorGrade: { ...clip.colorGrade, ...colorUpdates },
        };
      }),
    }));

    set({ project: { ...project, tracks: updatedTracks } });
  },

  updateClipColorWheel: (clipId, wheel, valueUpdates) => {
    const { project } = get();
    const updatedTracks = project.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((clip) => {
        if (clip.id !== clipId) return clip;
        const currentWheels = clip.colorGrade.wheels || {
          lift: { hue: 0, saturation: 0, luminance: 0 },
          gamma: { hue: 0, saturation: 0, luminance: 0 },
          gain: { hue: 0, saturation: 0, luminance: 0 },
          offset: { hue: 0, saturation: 0, luminance: 0 },
        };

        const updatedWheel = { ...currentWheels[wheel], ...valueUpdates };
        return {
          ...clip,
          colorGrade: {
            ...clip.colorGrade,
            wheels: { ...currentWheels, [wheel]: updatedWheel },
          },
        };
      }),
    }));

    set({ project: { ...project, tracks: updatedTracks } });
  },

  updateClipAudio: (clipId, audioUpdates) => {
    const { project } = get();
    const updatedTracks = project.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((clip) => {
        if (clip.id !== clipId) return clip;
        return {
          ...clip,
          audio: clip.audio ? { ...clip.audio, ...audioUpdates } : undefined,
        };
      }),
    }));

    set({ project: { ...project, tracks: updatedTracks } });
  },

  updateClipSpeed: (clipId, speed) => {
    const { project } = get();
    const updatedTracks = project.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((clip) => {
        if (clip.id !== clipId) return clip;
        const newDuration = clip.sourceDuration / Math.max(0.1, speed);
        return {
          ...clip,
          speed,
          duration: newDuration,
        };
      }),
    }));

    const newDuration = calculateProjectDuration(updatedTracks);
    get().pushHistory({ ...project, duration: newDuration, tracks: updatedTracks });
  },

  updateClipText: (clipId, text) => {
    const { project } = get();
    const updatedTracks = project.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((clip) => {
        if (clip.id !== clipId) return clip;
        return { ...clip, text };
      }),
    }));

    set({ project: { ...project, tracks: updatedTracks } });
  },

  moveClip: (clipId, targetTrackId, newStartTime) => {
    const { project, snapping } = get();
    let finalStartTime = Math.max(0, newStartTime);

    if (snapping) {
      finalStartTime = findSnapPoint(finalStartTime, project.tracks);
    }

    let movedClip: Clip | null = null;

    const tracksWithoutClip = project.tracks.map((track) => {
      const clip = track.clips.find((c) => c.id === clipId);
      if (clip) {
        movedClip = { ...clip, trackId: targetTrackId, startTime: finalStartTime };
        return { ...track, clips: track.clips.filter((c) => c.id !== clipId) };
      }
      return track;
    });

    if (!movedClip) return;

    const finalTracks = tracksWithoutClip.map((track) => {
      if (track.id === targetTrackId && movedClip) {
        return {
          ...track,
          clips: [...track.clips, movedClip].sort((a, b) => a.startTime - b.startTime),
        };
      }
      return track;
    });

    const newDuration = calculateProjectDuration(finalTracks);
    get().pushHistory({ ...project, duration: newDuration, tracks: finalTracks });
  },

  trimClip: (clipId, newStartTime, newDuration) => {
    const { project } = get();
    if (newDuration < 0.2) return;

    const updatedTracks = project.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((clip) => {
        if (clip.id !== clipId) return clip;
        return {
          ...clip,
          startTime: Math.max(0, newStartTime),
          duration: newDuration,
        };
      }),
    }));

    const dur = calculateProjectDuration(updatedTracks);
    get().pushHistory({ ...project, duration: dur, tracks: updatedTracks });
  },

  addClipToTrack: (trackId, clip) => {
    const { project } = get();
    const updatedTracks = project.tracks.map((track) => {
      if (track.id === trackId) {
        return {
          ...track,
          clips: [...track.clips, clip].sort((a, b) => a.startTime - b.startTime),
        };
      }
      return track;
    });

    const dur = calculateProjectDuration(updatedTracks);
    get().pushHistory({ ...project, duration: dur, tracks: updatedTracks });
  },

  setAspectRatio: (aspectRatio) => {
    const { project } = get();
    const dimensions = ASPECT_RATIO_DIMENSIONS[aspectRatio];
    const newProject: TimelineProject = {
      ...project,
      settings: {
        ...project.settings,
        aspectRatio,
        width: dimensions.width,
        height: dimensions.height,
      },
      updatedAt: new Date().toISOString(),
    };
    get().pushHistory(newProject);
  },

  setDirectorStyle: (style) => {
    const { project } = get();
    let updatedProject = project;

    if (style === 'high_energy') {
      updatedProject = applyMrBeastPacing(project);
    } else if (style === 'cinematic') {
      updatedProject = applyNolanCinematicStyle(project);
    } else if (style === 'tech_minimal') {
      updatedProject = applyTechMinimalStyle(project);
    } else {
      updatedProject = {
        ...project,
        settings: { ...project.settings, directorStyle: 'standard' },
      };
    }

    get().pushHistory(updatedProject);
  },

  aiCutSilences: () => {
    const { project } = get();
    const silences = detectSimulatedSilence(project.duration);
    const updatedTracks = project.tracks.map((t) =>
      t.type === 'video' ? autoCutSilenceFromTrack(t, silences) : t
    );

    const dur = calculateProjectDuration(updatedTracks);
    get().pushHistory({ ...project, duration: dur, tracks: updatedTracks });
  },

  aiGenerateSubtitles: (transcript) => {
    const { project } = get();
    const text =
      transcript ||
      'Designed for cinematic precision, effortless timeline manipulation, and autonomous agent coordination.';

    const style =
      project.settings.directorStyle === 'high_energy'
        ? MR_BEAST_CAPTION_STYLE
        : project.settings.directorStyle === 'cinematic'
        ? NOLAN_CAPTION_STYLE
        : TECH_MINIMAL_CAPTION_STYLE;

    const subTrack = generateSmartCaptions(text, project.duration, style);
    const filteredTracks = project.tracks.filter((t) => t.type !== 'subtitle');

    get().pushHistory({
      ...project,
      tracks: [...filteredTracks, subTrack],
      updatedAt: new Date().toISOString(),
    });
  },

  aiExecutePrompt: async (prompt: string): Promise<string> => {
    const lower = prompt.toLowerCase();
    const store = get();

    if (lower.includes('silence') || lower.includes('pause') || lower.includes('dead air')) {
      store.aiCutSilences();
      return 'Removed pauses and tightened pacing across primary video track.';
    }

    if (lower.includes('beast') || lower.includes('high energy') || lower.includes('retention') || lower.includes('zoom')) {
      store.setDirectorStyle('high_energy');
      return 'Applied High Energy pacing profile with punch zoom keyframes and beat markers.';
    }

    if (lower.includes('nolan') || lower.includes('cinematic') || lower.includes('film') || lower.includes('anamorphic')) {
      store.setDirectorStyle('cinematic');
      return 'Applied Cinematic Suite: 2.39:1 Cinemascope, 35mm grain, and teal-orange 3-way color balance.';
    }

    if (lower.includes('varun') || lower.includes('tech') || lower.includes('clean') || lower.includes('apple')) {
      store.setDirectorStyle('tech_minimal');
      return 'Applied Tech Minimal profile: smooth tracking camera glides and clean typography.';
    }

    if (lower.includes('caption') || lower.includes('subtitle') || lower.includes('subtitles') || lower.includes('transcribe')) {
      store.aiGenerateSubtitles();
      return 'Generated synchronized word-level subtitle sequence.';
    }

    if (lower.includes('vertical') || lower.includes('tiktok') || lower.includes('shorts') || lower.includes('9:16')) {
      store.setAspectRatio('9:16');
      return 'Updated aspect ratio to 9:16 Vertical format.';
    }

    if (lower.includes('split') || lower.includes('cut')) {
      store.splitClipAtPlayhead();
      return 'Split clip at current playhead timecode.';
    }

    store.aiCutSilences();
    store.aiGenerateSubtitles();
    return `Executed instruction: "${prompt}". Timeline optimized and subtitles synchronized.`;
  },

  exportVideo: async () => {
    set({ isExporting: true, exportProgress: 0 });

    for (let p = 10; p <= 100; p += 15) {
      await new Promise((r) => setTimeout(r, 180));
      set({ exportProgress: p });
    }

    await new Promise((r) => setTimeout(r, 200));
    set({ isExporting: false, exportProgress: 100 });
  },
}));
