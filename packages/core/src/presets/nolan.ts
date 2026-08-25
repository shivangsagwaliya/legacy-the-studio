import { CaptionStyle, ColorGrade, TimelineProject } from '../schema/timeline.js';

export const NOLAN_CAPTION_STYLE: CaptionStyle = {
  fontFamily: 'Cinzel, Georgia, serif',
  fontSize: 32,
  textColor: '#E2E8F0',
  highlightColor: '#94A3B8',
  hasShadow: false,
  hasStroke: false,
  uppercase: true,
  animation: 'fade',
  positionY: 88,
};

export const NOLAN_COLOR_GRADE: ColorGrade = {
  brightness: -2,
  contrast: 24,
  saturation: -10,
  temperature: -6,
  tint: -4,
  shadows: -8,
  highlights: -12,
  lut: 'teal_orange',
  vignette: 18,
  filmGrain: 15,
  wheels: {
    lift: { hue: 205, saturation: 22, luminance: -12 },
    gamma: { hue: 35, saturation: 18, luminance: 4 },
    gain: { hue: 40, saturation: 15, luminance: -6 },
    offset: { hue: 210, saturation: 6, luminance: 0 },
  },
};

export function applyNolanCinematicStyle(project: TimelineProject): TimelineProject {
  const updatedTracks = project.tracks.map((track) => {
    if (track.type === 'video' || track.type === 'broll') {
      const updatedClips = track.clips.map((clip) => ({
        ...clip,
        colorGrade: { ...NOLAN_COLOR_GRADE },
        transitionIn: clip.transitionIn || { type: 'blur_dissolve' as const, duration: 0.8 },
      }));
      return { ...track, clips: updatedClips };
    }

    if (track.type === 'music') {
      const updatedClips = track.clips.map((clip) => ({
        ...clip,
        audio: {
          volume: 0.8,
          fadeIn: 2.0,
          fadeOut: 2.5,
          pan: 0,
          ducking: true,
          mute: false,
        },
      }));
      return { ...track, clips: updatedClips };
    }

    return track;
  });

  return {
    ...project,
    settings: {
      ...project.settings,
      directorStyle: 'cinematic',
      aspectRatio: '2.39:1',
      width: 2560,
      height: 1070,
    },
    tracks: updatedTracks,
    updatedAt: new Date().toISOString(),
  };
}
