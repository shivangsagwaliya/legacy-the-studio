import { TimelineProject, Track, Clip, SubtitleWord } from '../schema/timeline.js';
import { calculateProjectDuration } from './timeline-engine.js';

export interface TranscriptWordRef {
  clipId: string;
  wordIndex: number;
  word: string;
  start: number;
  end: number;
  speaker?: string;
  deleted?: boolean;
}

export function extractProjectTranscript(project: TimelineProject): TranscriptWordRef[] {
  const words: TranscriptWordRef[] = [];
  const captionTrack = project.tracks.find((t) => t.type === 'subtitle');
  if (!captionTrack) return words;

  captionTrack.clips.forEach((clip) => {
    if (clip.words) {
      clip.words.forEach((w, idx) => {
        words.push({
          clipId: clip.id,
          wordIndex: idx,
          word: w.word,
          start: w.start,
          end: w.end,
          speaker: w.speaker || 'Speaker 1',
          deleted: false,
        });
      });
    }
  });

  return words;
}

export function editTimelineByDeletingWords(
  project: TimelineProject,
  deletedWordIntervals: Array<{ start: number; end: number }>
): TimelineProject {
  if (deletedWordIntervals.length === 0) return project;

  // Cut and ripple all video and audio tracks according to deleted word intervals
  const updatedTracks = project.tracks.map((track) => {
    const newClips: Clip[] = [];
    let currentPlacement = 0;

    track.clips.forEach((clip) => {
      // Check which word cuts intersect this clip
      const cutsInClip = deletedWordIntervals.filter(
        (del) => del.start >= clip.startTime && del.end <= clip.startTime + clip.duration
      );

      if (cutsInClip.length === 0) {
        newClips.push({ ...clip, startTime: currentPlacement });
        currentPlacement += clip.duration;
        return;
      }

      let segmentStart = clip.startTime;

      cutsInClip.forEach((cut, idx) => {
        const segDuration = cut.start - segmentStart;
        if (segDuration > 0.1) {
          newClips.push({
            ...clip,
            id: `${clip.id}-textcut-${idx}`,
            startTime: currentPlacement,
            duration: segDuration,
            sourceStartTime: clip.sourceStartTime + (segmentStart - clip.startTime) * clip.speed,
            sourceDuration: segDuration * clip.speed,
          });
          currentPlacement += segDuration;
        }
        segmentStart = cut.end;
      });

      const tailDuration = clip.startTime + clip.duration - segmentStart;
      if (tailDuration > 0.1) {
        newClips.push({
          ...clip,
          id: `${clip.id}-textcut-tail`,
          startTime: currentPlacement,
          duration: tailDuration,
          sourceStartTime: clip.sourceStartTime + (segmentStart - clip.startTime) * clip.speed,
          sourceDuration: tailDuration * clip.speed,
        });
        currentPlacement += tailDuration;
      }
    });

    return { ...track, clips: newClips };
  });

  const newDur = calculateProjectDuration(updatedTracks);
  return {
    ...project,
    duration: newDur,
    tracks: updatedTracks,
    updatedAt: new Date().toISOString(),
  };
}
