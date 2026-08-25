export type AspectRatio = '16:9' | '9:16' | '1:1' | '2.39:1' | '1.43:1';

export type DirectorStyle = 'standard' | 'high_energy' | 'cinematic' | 'tech_minimal';

export type TrackType = 'video' | 'broll' | 'audio' | 'sfx' | 'music' | 'text' | 'subtitle';

export type ClipType = 'video' | 'audio' | 'image' | 'text' | 'subtitle' | 'sfx' | 'graphic';

export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bezier';

export type BlendMode = 'normal' | 'screen' | 'multiply' | 'overlay' | 'darken' | 'lighten' | 'color-dodge';

export interface BezierPoint {
  x: number;
  y: number;
}

export interface SpeedRampPoint {
  time: number;
  speedMultiplier: number;
  curveIn?: BezierPoint;
  curveOut?: BezierPoint;
}

export interface ColorWheelValue {
  hue: number;
  saturation: number;
  luminance: number;
}

export interface ThreeWayColorWheels {
  lift: ColorWheelValue;
  gamma: ColorWheelValue;
  gain: ColorWheelValue;
  offset: ColorWheelValue;
}

export interface ParametricEQBand {
  frequency: number;
  gain: number;
  q: number;
  enabled: boolean;
}

export interface AudioEqualizer {
  bands: ParametricEQBand[];
  highPass: number;
  lowPass: number;
}

export interface Keyframe {
  id: string;
  time: number;
  property: 'x' | 'y' | 'scale' | 'rotation' | 'opacity' | 'volume' | 'blur';
  value: number;
  easing?: EasingType;
}

export interface Transform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  blendMode?: BlendMode;
}

export interface ColorGrade {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  tint: number;
  shadows: number;
  highlights: number;
  lut?: string;
  vignette: number;
  filmGrain: number;
  wheels?: ThreeWayColorWheels;
}

export interface AudioProperties {
  volume: number;
  fadeIn: number;
  fadeOut: number;
  pan: number;
  ducking: boolean;
  duckingAmount?: number;
  noiseSuppression?: number;
  mute: boolean;
  equalizer?: AudioEqualizer;
}

export interface SubtitleWord {
  word: string;
  start: number;
  end: number;
  speaker?: string;
  confidence?: number;
}

export type CaptionAnimation =
  | 'none'
  | 'fade'
  | 'pop'
  | 'bounce'
  | 'word_highlight'
  | 'typewriter'
  | 'glow'
  | 'kinetic_wave'
  | 'shimmer';

export interface CaptionStyle {
  fontFamily: string;
  fontSize: number;
  textColor: string;
  highlightColor: string;
  backgroundColor?: string;
  hasShadow: boolean;
  hasStroke: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  letterSpacing?: number;
  uppercase: boolean;
  animation: CaptionAnimation;
  positionY: number;
}

export type TransitionType =
  | 'none'
  | 'crossfade'
  | 'dip_to_black'
  | 'dip_to_white'
  | 'whip_left'
  | 'whip_right'
  | 'zoom_punch'
  | 'spin_cw'
  | 'glitch_rgb'
  | 'light_leak'
  | 'blur_dissolve'
  | 'linear_wipe'
  | 'radial_wipe';

export interface Transition {
  type: TransitionType;
  duration: number;
}

export interface BeatMarker {
  id: string;
  time: number;
  strength: number;
}

export interface Clip {
  id: string;
  trackId: string;
  name: string;
  type: ClipType;
  src?: string;
  startTime: number;
  duration: number;
  sourceStartTime: number;
  sourceDuration: number;
  speed: number;
  speedRamp?: SpeedRampPoint[];
  transform: Transform;
  colorGrade: ColorGrade;
  audio?: AudioProperties;
  keyframes: Keyframe[];
  text?: string;
  captionStyle?: CaptionStyle;
  words?: SubtitleWord[];
  transitionIn?: Transition;
  transitionOut?: Transition;
  metadata?: Record<string, unknown>;
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  muted: boolean;
  locked: boolean;
  visible: boolean;
  volume: number;
  pan: number;
  clips: Clip[];
}

export interface ProjectSettings {
  aspectRatio: AspectRatio;
  width: number;
  height: number;
  fps: number;
  sampleRate: number;
  directorStyle: DirectorStyle;
  colorSpace?: 'rec709' | 'srgb' | 'display_p3' | 'aces_cg';
}

export interface TimelineProject {
  id: string;
  title: string;
  version: string;
  settings: ProjectSettings;
  duration: number;
  inPoint?: number;
  outPoint?: number;
  beatMarkers?: BeatMarker[];
  tracks: Track[];
  createdAt: string;
  updatedAt: string;
}

export const ASPECT_RATIO_DIMENSIONS: Record<AspectRatio, { width: number; height: number; label: string }> = {
  '16:9': { width: 1920, height: 1080, label: 'Widescreen (16:9)' },
  '9:16': { width: 1080, height: 1920, label: 'Vertical / Shorts (9:16)' },
  '1:1': { width: 1080, height: 1080, label: 'Square (1:1)' },
  '2.39:1': { width: 2560, height: 1070, label: 'Cinemascope (2.39:1)' },
  '1.43:1': { width: 1920, height: 1342, label: 'IMAX (1.43:1)' },
};

export const STUDIO_FONTS = [
  { id: 'anton', name: 'Anton', category: 'High Energy Bold (MrBeast)' },
  { id: 'montserrat', name: 'Montserrat Black', category: 'High Energy Modern' },
  { id: 'impact', name: 'Impact', category: 'YouTube Classic' },
  { id: 'bebas', name: 'Bebas Neue', category: 'Punch Headline' },
  { id: 'inter', name: 'Inter / SF Pro', category: 'Apple Minimal Clean' },
  { id: 'cinzel', name: 'Cinzel', category: 'Cinematic Serif (Nolan)' },
  { id: 'oswald', name: 'Oswald', category: 'Documentary Tall' },
  { id: 'poppins', name: 'Poppins ExtraBold', category: 'Creator Modern' },
  { id: 'jetbrains', name: 'JetBrains Mono', category: 'Tech Code / Terminal' },
];

export const STUDIO_TRANSITIONS: Array<{ id: TransitionType; name: string; category: string }> = [
  { id: 'crossfade', name: 'Smooth Crossfade', category: 'Standard' },
  { id: 'dip_to_black', name: 'Dip to Black', category: 'Standard' },
  { id: 'dip_to_white', name: 'Flash Dip to White', category: 'Standard' },
  { id: 'whip_left', name: 'Whip Pan Left', category: 'Kinetic Motion' },
  { id: 'whip_right', name: 'Whip Pan Right', category: 'Kinetic Motion' },
  { id: 'zoom_punch', name: 'Zoom In Punch', category: 'Kinetic Motion' },
  { id: 'spin_cw', name: 'Spin Rotate Fast', category: 'Kinetic Motion' },
  { id: 'glitch_rgb', name: 'RGB Chromatic Glitch', category: 'Stylized' },
  { id: 'light_leak', name: 'Optical Light Leak', category: 'Stylized' },
  { id: 'blur_dissolve', name: 'Film Blur Dissolve', category: 'Cinematic' },
  { id: 'linear_wipe', name: 'Linear Bar Wipe', category: 'Geometric' },
  { id: 'radial_wipe', name: 'Radial Clock Wipe', category: 'Geometric' },
];
