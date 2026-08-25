import { SpeedRampPoint } from '../schema/timeline.js';

export function calculateSpeedAtTime(time: number, points: SpeedRampPoint[], defaultSpeed: number = 1.0): number {
  if (!points || points.length === 0) return defaultSpeed;

  const sorted = [...points].sort((a, b) => a.time - b.time);

  if (time <= sorted[0].time) return sorted[0].speedMultiplier;
  if (time >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1].speedMultiplier;

  for (let i = 0; i < sorted.length - 1; i++) {
    const p1 = sorted[i];
    const p2 = sorted[i + 1];

    if (time >= p1.time && time <= p2.time) {
      const progress = (time - p1.time) / (p2.time - p1.time);
      // Smooth cubic smoothstep interpolation
      const smoothProgress = progress * progress * (3 - 2 * progress);
      return p1.speedMultiplier + (p2.speedMultiplier - p1.speedMultiplier) * smoothProgress;
    }
  }

  return defaultSpeed;
}

export function generatePresetSpeedRamp(type: 'bullet_time' | 'jump_ramp' | 'hero_slowmo', duration: number): SpeedRampPoint[] {
  switch (type) {
    case 'bullet_time':
      return [
        { time: 0, speedMultiplier: 1.0 },
        { time: duration * 0.3, speedMultiplier: 3.0 },
        { time: duration * 0.45, speedMultiplier: 0.25 },
        { time: duration * 0.75, speedMultiplier: 0.25 },
        { time: duration * 0.85, speedMultiplier: 2.5 },
        { time: duration, speedMultiplier: 1.0 },
      ];
    case 'hero_slowmo':
      return [
        { time: 0, speedMultiplier: 1.0 },
        { time: duration * 0.2, speedMultiplier: 1.0 },
        { time: duration * 0.4, speedMultiplier: 0.3 },
        { time: duration * 0.8, speedMultiplier: 0.3 },
        { time: duration, speedMultiplier: 1.0 },
      ];
    case 'jump_ramp':
      return [
        { time: 0, speedMultiplier: 1.0 },
        { time: duration * 0.4, speedMultiplier: 2.5 },
        { time: duration * 0.6, speedMultiplier: 0.5 },
        { time: duration, speedMultiplier: 1.0 },
      ];
  }
}
