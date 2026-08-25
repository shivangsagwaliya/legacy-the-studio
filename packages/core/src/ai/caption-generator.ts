import { CaptionStyle, SubtitleWord, Track, Clip } from '../schema/timeline.js';

export interface GeneratedCaptionSegment {
  text: string;
  start: number;
  end: number;
  words: SubtitleWord[];
}

export function generateSmartCaptions(
  transcriptText: string,
  totalDuration: number,
  style: CaptionStyle
): Track {
  const words = transcriptText.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return {
      id: 'track-captions',
      name: 'Subtitles',
      type: 'subtitle',
      muted: false,
      locked: false,
      visible: true,
      volume: 1.0,
      pan: 0,
      clips: [],
    };
  }

  const timePerWord = totalDuration / words.length;
  const wordsPerSegment = 4;
  const clips: Clip[] = [];

  let currentWordIdx = 0;
  let segmentIdx = 0;

  while (currentWordIdx < words.length) {
    const chunk = words.slice(currentWordIdx, currentWordIdx + wordsPerSegment);
    const segStart = currentWordIdx * timePerWord;
    const segEnd = Math.min(totalDuration, (currentWordIdx + chunk.length) * timePerWord);
    const segDuration = segEnd - segStart;

    const segmentWords: SubtitleWord[] = chunk.map((w, i) => ({
      word: w,
      start: (currentWordIdx + i) * timePerWord,
      end: (currentWordIdx + i + 1) * timePerWord,
      confidence: 0.98,
    }));

    clips.push({
      id: `caption-clip-${segmentIdx}`,
      trackId: 'track-captions',
      name: chunk.join(' '),
      type: 'subtitle',
      startTime: segStart,
      duration: segDuration,
      sourceStartTime: 0,
      sourceDuration: segDuration,
      speed: 1.0,
      text: chunk.join(' '),
      captionStyle: { ...style },
      words: segmentWords,
      transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
      colorGrade: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        temperature: 0,
        tint: 0,
        shadows: 0,
        highlights: 0,
        vignette: 0,
        filmGrain: 0,
      },
      keyframes: [],
    });

    currentWordIdx += chunk.length;
    segmentIdx++;
  }

  return {
    id: 'track-captions',
    name: 'Subtitles',
    type: 'subtitle',
    muted: false,
    locked: false,
    visible: true,
    volume: 1.0,
    pan: 0,
    clips,
  };
}
