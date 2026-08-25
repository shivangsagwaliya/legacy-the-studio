import {
  CaptionStyle,
  Clip,
  ColorGrade,
  Keyframe,
  TimelineProject,
  BeatMarker,
  Track,
} from '../schema/timeline.js';

export const MR_BEAST_CAPTION_STYLE: CaptionStyle = {
  fontFamily: 'Anton, Montserrat, Impact, sans-serif',
  fontSize: 52,
  textColor: '#FFFFFF',
  highlightColor: '#FACC15', // Vibrant High-Energy Yellow
  backgroundColor: 'rgba(0, 0, 0, 0.88)',
  hasShadow: true,
  hasStroke: true,
  strokeColor: '#000000',
  strokeWidth: 5,
  letterSpacing: 1.2,
  uppercase: true,
  animation: 'bounce',
  positionY: 72,
};

export const MR_BEAST_COLOR_GRADE: ColorGrade = {
  brightness: 4,
  contrast: 20,
  saturation: 26,
  temperature: 3,
  tint: 0,
  shadows: 8,
  highlights: -4,
  vignette: 0,
  filmGrain: 0,
  wheels: {
    lift: { hue: 210, saturation: 8, luminance: -4 },
    gamma: { hue: 45, saturation: 16, luminance: 6 },
    gain: { hue: 50, saturation: 14, luminance: 4 },
    offset: { hue: 0, saturation: 0, luminance: 0 },
  },
};

export function applyMrBeastPacing(project: TimelineProject): TimelineProject {
  const updatedTracks: Track[] = project.tracks.map((track) => {
    if (track.type !== 'video') return track;

    const newClips: Clip[] = [];

    track.clips.forEach((clip) => {
      // If clip is longer than 2.5s, add energetic retention punch-zooms
      if (clip.duration > 2.4) {
        const keyframes: Keyframe[] = [...clip.keyframes];

        // 1.18x Punch Zoom
        keyframes.push({
          id: `kf-zoom-in-${clip.id}`,
          time: 0.9,
          property: 'scale',
          value: 1.18,
          easing: 'ease-out',
        });

        // Snap back to 1.0x
        keyframes.push({
          id: `kf-zoom-reset-${clip.id}`,
          time: 2.2,
          property: 'scale',
          value: 1.0,
          easing: 'ease-in-out',
        });

        newClips.push({
          ...clip,
          colorGrade: { ...MR_BEAST_COLOR_GRADE },
          transitionIn: { type: 'zoom_punch', duration: 0.2 },
          keyframes,
        });
      } else {
        newClips.push({
          ...clip,
          colorGrade: { ...MR_BEAST_COLOR_GRADE },
          transitionIn: { type: 'whip_left', duration: 0.15 },
        });
      }
    });

    return { ...track, clips: newClips };
  });

  // Sound Design Layer: Insert whooshes and impact drops on clip cuts
  const sfxClips: Clip[] = [];
  let sfxId = 1;

  const mainVideo = updatedTracks.find((t) => t.type === 'video');
  if (mainVideo) {
    mainVideo.clips.forEach((clip, idx) => {
      if (idx > 0) {
        sfxClips.push({
          id: `sfx-whoosh-${sfxId++}`,
          trackId: 'track-sfx',
          name: 'High Speed Whoosh',
          type: 'sfx',
          startTime: Math.max(0, clip.startTime - 0.1),
          duration: 0.8,
          sourceStartTime: 0,
          sourceDuration: 0.8,
          speed: 1.0,
          audio: {
            volume: 0.9,
            fadeIn: 0.05,
            fadeOut: 0.2,
            pan: 0,
            ducking: false,
            mute: false,
          },
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
          colorGrade: { brightness: 0, contrast: 0, saturation: 0, temperature: 0, tint: 0, shadows: 0, highlights: 0, vignette: 0, filmGrain: 0 },
          keyframes: [],
        });
      }
    });
  }

  const existingSfxTrack = updatedTracks.find((t) => t.type === 'sfx');
  let finalTracks = updatedTracks;

  if (existingSfxTrack) {
    finalTracks = updatedTracks.map((t) => (t.type === 'sfx' ? { ...t, clips: sfxClips } : t));
  } else {
    finalTracks.push({
      id: 'track-sfx',
      name: 'SFX Accents & Whooshes',
      type: 'sfx',
      muted: false,
      locked: false,
      visible: true,
      volume: 1.0,
      pan: 0,
      clips: sfxClips,
    });
  }

  // Generate dynamic music beat markers (every 0.75s)
  const beatMarkers: BeatMarker[] = [];
  for (let t = 0.5; t < project.duration; t += 0.75) {
    beatMarkers.push({
      id: `beat-${t.toFixed(2)}`,
      time: t,
      strength: (t % 1.5 === 0) ? 1.0 : 0.8,
    });
  }

  return {
    ...project,
    settings: {
      ...project.settings,
      directorStyle: 'high_energy',
    },
    beatMarkers,
    tracks: finalTracks,
    updatedAt: new Date().toISOString(),
  };
}
