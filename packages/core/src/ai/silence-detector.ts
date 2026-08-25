import { Clip, Track } from '../schema/timeline.js';

export interface SilenceInterval {
  start: number;
  end: number;
  duration: number;
}

export interface CutResult {
  originalDuration: number;
  newDuration: number;
  removedPausesCount: number;
  retainedIntervals: Array<{ start: number; end: number }>;
}

export function detectSimulatedSilence(duration: number, minSilenceDuration: number = 0.6): SilenceInterval[] {
  // Silence detector algorithm
  const silences: SilenceInterval[] = [];
  let currentTime = 1.8;

  while (currentTime + minSilenceDuration < duration - 1.0) {
    silences.push({
      start: currentTime,
      end: currentTime + minSilenceDuration,
      duration: minSilenceDuration,
    });
    currentTime += 3.5 + Math.random() * 2.0;
  }

  return silences;
}

export function autoCutSilenceFromTrack(track: Track, silences: SilenceInterval[]): Track {
  if (track.clips.length === 0 || silences.length === 0) return track;

  const newClips: Clip[] = [];
  let currentPlacementTime = 0;

  track.clips.forEach((clip) => {
    // Find silences that fall within this clip
    const clipSilences = silences.filter(
      (s) => s.start >= clip.startTime && s.end <= clip.startTime + clip.duration
    );

    if (clipSilences.length === 0) {
      newClips.push({
        ...clip,
        startTime: currentPlacementTime,
      });
      currentPlacementTime += clip.duration;
      return;
    }

    let segmentStart = clip.startTime;

    clipSilences.forEach((silence, idx) => {
      const activeDuration = silence.start - segmentStart;
      if (activeDuration > 0.15) {
        newClips.push({
          ...clip,
          id: `${clip.id}-cut-${idx}`,
          startTime: currentPlacementTime,
          duration: activeDuration,
          sourceStartTime: clip.sourceStartTime + (segmentStart - clip.startTime) * clip.speed,
          sourceDuration: activeDuration * clip.speed,
        });
        currentPlacementTime += activeDuration;
      }
      segmentStart = silence.end;
    });

    const finalDuration = clip.startTime + clip.duration - segmentStart;
    if (finalDuration > 0.15) {
      newClips.push({
        ...clip,
        id: `${clip.id}-cut-end`,
        startTime: currentPlacementTime,
        duration: finalDuration,
        sourceStartTime: clip.sourceStartTime + (segmentStart - clip.startTime) * clip.speed,
        sourceDuration: finalDuration * clip.speed,
      });
      currentPlacementTime += finalDuration;
    }
  });

  return { ...track, clips: newClips };
}
