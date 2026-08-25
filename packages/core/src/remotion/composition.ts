import { Clip, TimelineProject, Track, AspectRatio } from '../schema/timeline.js';

export interface CodeCompositionSchema {
  id: string;
  title: string;
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  sequences: Array<{
    id: string;
    fromFrame: number;
    durationInFrames: number;
    trackType: 'video' | 'audio' | 'text' | 'broll';
    src?: string;
    text?: string;
    style?: {
      scale?: number;
      opacity?: number;
      filter?: string;
      color?: string;
    };
  }>;
}

export function projectToCodeComposition(project: TimelineProject): CodeCompositionSchema {
  const fps = project.settings.fps || 30;
  const sequences: CodeCompositionSchema['sequences'] = [];

  project.tracks.forEach((track) => {
    track.clips.forEach((clip) => {
      sequences.push({
        id: clip.id,
        fromFrame: Math.round(clip.startTime * fps),
        durationInFrames: Math.round(clip.duration * fps),
        trackType: track.type === 'broll' ? 'broll' : track.type === 'audio' || track.type === 'music' || track.type === 'sfx' ? 'audio' : track.type === 'text' || track.type === 'subtitle' ? 'text' : 'video',
        src: clip.src,
        text: clip.text,
        style: {
          scale: clip.transform.scale,
          opacity: clip.transform.opacity,
          filter: clip.colorGrade.lut,
          color: clip.captionStyle?.textColor,
        },
      });
    });
  });

  return {
    id: project.id,
    title: project.title,
    fps,
    width: project.settings.width,
    height: project.settings.height,
    durationInFrames: Math.round(project.duration * fps),
    sequences,
  };
}

export function generateRemotionCode(project: TimelineProject): string {
  const comp = projectToCodeComposition(project);
  return `import React from 'react';
import { Composition, Sequence, Video, Audio, AbsoluteFill } from 'legacy-core';

export const ${comp.title.replace(/[^a-zA-Z0-9]/g, '') || 'MyVideoComposition'}: React.FC = () => {
  return (
    <Composition
      width={${comp.width}}
      height={${comp.height}}
      fps={${comp.fps}}
      durationInFrames={${comp.durationInFrames}}
    >
      <AbsoluteFill style={{ backgroundColor: '#000000' }}>
${comp.sequences
  .map((seq) => {
    if (seq.trackType === 'text') {
      return `        <Sequence from={${seq.fromFrame}} durationInFrames={${seq.durationInFrames}}>
          <div className="flex items-center justify-center w-full h-full">
            <span style={{ fontSize: '3rem', fontWeight: 800, color: '${seq.style?.color || '#FFFFFF'}' }}>
              ${seq.text || ''}
            </span>
          </div>
        </Sequence>`;
    }
    if (seq.trackType === 'audio') {
      return `        <Sequence from={${seq.fromFrame}} durationInFrames={${seq.durationInFrames}}>
          <Audio src="${seq.src || ''}" volume={1.0} />
        </Sequence>`;
    }
    return `        <Sequence from={${seq.fromFrame}} durationInFrames={${seq.durationInFrames}}>
          <Video src="${seq.src || ''}" style={{ transform: 'scale(${seq.style?.scale || 1.0})' }} />
        </Sequence>`;
  })
  .join('\n')}
      </AbsoluteFill>
    </Composition>
  );
};
`;
}
