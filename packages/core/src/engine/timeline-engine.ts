import { Clip, Keyframe, Track, TimelineProject } from '../schema/timeline.js';

export function formatTimecode(totalSeconds: number, fps: number = 30): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const frames = Math.floor((totalSeconds % 1) * fps);

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
}

export function parseTimecode(tc: string, fps: number = 30): number {
  const parts = tc.split(':').map((p) => parseInt(p, 10) || 0);
  if (parts.length !== 4) return 0;
  const [hours, minutes, seconds, frames] = parts;
  return hours * 3600 + minutes * 60 + seconds + frames / fps;
}

export function calculateProjectDuration(tracks: Track[]): number {
  let maxEndTime = 0;
  for (const track of tracks) {
    for (const clip of track.clips) {
      const clipEnd = clip.startTime + clip.duration;
      if (clipEnd > maxEndTime) {
        maxEndTime = clipEnd;
      }
    }
  }
  return Math.max(maxEndTime, 5.0); // minimum 5s empty canvas
}

export function splitClip(track: Track, clipId: string, splitTime: number): Track {
  const clipIndex = track.clips.findIndex((c) => c.id === clipId);
  if (clipIndex === -1) return track;

  const clip = track.clips[clipIndex];
  if (splitTime <= clip.startTime || splitTime >= clip.startTime + clip.duration) {
    return track;
  }

  const offset = splitTime - clip.startTime;
  const firstDuration = offset;
  const secondDuration = clip.duration - offset;

  const firstHalf: Clip = {
    ...clip,
    id: `${clip.id}-part1`,
    duration: firstDuration,
    sourceDuration: firstDuration * clip.speed,
  };

  const secondHalf: Clip = {
    ...clip,
    id: `${clip.id}-part2`,
    startTime: splitTime,
    duration: secondDuration,
    sourceStartTime: clip.sourceStartTime + firstDuration * clip.speed,
    sourceDuration: secondDuration * clip.speed,
  };

  const newClips = [...track.clips];
  newClips.splice(clipIndex, 1, firstHalf, secondHalf);

  return { ...track, clips: newClips };
}

export function rippleDeleteClip(tracks: Track[], clipId: string): Track[] {
  let targetTrackIndex = -1;
  let targetClipIndex = -1;
  let deletedDuration = 0;
  let deletedStartTime = 0;

  for (let i = 0; i < tracks.length; i++) {
    const idx = tracks[i].clips.findIndex((c) => c.id === clipId);
    if (idx !== -1) {
      targetTrackIndex = i;
      targetClipIndex = idx;
      deletedDuration = tracks[i].clips[idx].duration;
      deletedStartTime = tracks[i].clips[idx].startTime;
      break;
    }
  }

  if (targetTrackIndex === -1) return tracks;

  return tracks.map((track, tIdx) => {
    if (tIdx !== targetTrackIndex) {
      return track;
    }

    const newClips = track.clips
      .filter((c) => c.id !== clipId)
      .map((c) => {
        if (c.startTime > deletedStartTime) {
          return { ...c, startTime: Math.max(0, c.startTime - deletedDuration) };
        }
        return c;
      });

    return { ...track, clips: newClips };
  });
}

export function findSnapPoint(
  targetTime: number,
  tracks: Track[],
  snapThresholdSeconds: number = 0.2
): number {
  let closestTime = targetTime;
  let minDiff = snapThresholdSeconds;

  for (const track of tracks) {
    for (const clip of track.clips) {
      const startDiff = Math.abs(clip.startTime - targetTime);
      if (startDiff < minDiff) {
        minDiff = startDiff;
        closestTime = clip.startTime;
      }

      const endDiff = Math.abs(clip.startTime + clip.duration - targetTime);
      if (endDiff < minDiff) {
        minDiff = endDiff;
        closestTime = clip.startTime + clip.duration;
      }
    }
  }

  return closestTime;
}

export function interpolateKeyframe(
  clip: Clip,
  currentTime: number,
  property: Keyframe['property'],
  defaultValue: number
): number {
  const matchingKeyframes = clip.keyframes
    .filter((k) => k.property === property)
    .sort((a, b) => a.time - b.time);

  if (matchingKeyframes.length === 0) return defaultValue;

  const clipRelativeTime = currentTime - clip.startTime;

  if (clipRelativeTime <= matchingKeyframes[0].time) {
    return matchingKeyframes[0].value;
  }

  const lastKf = matchingKeyframes[matchingKeyframes.length - 1];
  if (clipRelativeTime >= lastKf.time) {
    return lastKf.value;
  }

  for (let i = 0; i < matchingKeyframes.length - 1; i++) {
    const kf1 = matchingKeyframes[i];
    const kf2 = matchingKeyframes[i + 1];

    if (clipRelativeTime >= kf1.time && clipRelativeTime <= kf2.time) {
      const progress = (clipRelativeTime - kf1.time) / (kf2.time - kf1.time);
      return kf1.value + (kf2.value - kf1.value) * progress;
    }
  }

  return defaultValue;
}
