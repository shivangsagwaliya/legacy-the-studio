import { CaptionStyle, Clip, ColorGrade, Keyframe, TimelineProject } from '../schema/timeline.js';

export const TECH_MINIMAL_CAPTION_STYLE: CaptionStyle = {
  fontFamily: 'Inter, -apple-system, sans-serif',
  fontSize: 34,
  textColor: '#FFFFFF',
  highlightColor: '#38BDF8',
  backgroundColor: 'rgba(15, 23, 42, 0.85)',
  hasShadow: true,
  hasStroke: false,
  uppercase: false,
  animation: 'word_highlight',
  positionY: 80,
};

export const TECH_MINIMAL_COLOR_GRADE: ColorGrade = {
  brightness: 2,
  contrast: 8,
  saturation: 8,
  temperature: -2,
  tint: 0,
  shadows: 2,
  highlights: 0,
  vignette: 4,
  filmGrain: 0,
  wheels: {
    lift: { hue: 220, saturation: 6, luminance: 0 },
    gamma: { hue: 200, saturation: 8, luminance: 2 },
    gain: { hue: 0, saturation: 0, luminance: 0 },
    offset: { hue: 0, saturation: 0, luminance: 0 },
  },
};

export function applyTechMinimalStyle(project: TimelineProject): TimelineProject {
  const updatedTracks = project.tracks.map((track) => {
    if (track.type === 'video') {
      const updatedClips = track.clips.map((clip) => {
        const keyframes: Keyframe[] = [...clip.keyframes];

        keyframes.push({
          id: `kf-tech-scale-${clip.id}`,
          time: clip.duration,
          property: 'scale',
          value: 1.04,
          easing: 'ease-out',
        });

        return {
          ...clip,
          colorGrade: { ...TECH_MINIMAL_COLOR_GRADE },
          keyframes,
        };
      });
      return { ...track, clips: updatedClips };
    }

    return track;
  });

  return {
    ...project,
    settings: {
      ...project.settings,
      directorStyle: 'tech_minimal',
    },
    tracks: updatedTracks,
    updatedAt: new Date().toISOString(),
  };
}
