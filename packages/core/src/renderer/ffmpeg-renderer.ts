import { TimelineProject, Clip } from '../schema/timeline.js';

export interface RenderOptions {
  outputPath: string;
  preset?: 'fast' | 'high_quality' | 'lossless';
  hwaccel?: 'auto' | 'nvenc' | 'vaapi' | 'qsv' | 'none';
  onProgress?: (progress: number) => void;
}

export function buildFFmpegCommand(project: TimelineProject, options: RenderOptions): { command: string; args: string[] } {
  const inputs: string[] = [];
  const filterComplexParts: string[] = [];
  const videoClips: Array<{ clip: Clip; inputIndex: number }> = [];
  const audioClips: Array<{ clip: Clip; inputIndex: number }> = [];

  let currentInputIndex = 0;

  // Gather video and audio tracks
  project.tracks.forEach((track) => {
    if (track.type === 'video' || track.type === 'broll') {
      track.clips.forEach((clip) => {
        if (clip.src) {
          inputs.push('-ss', clip.sourceStartTime.toString(), '-t', clip.duration.toString(), '-i', clip.src);
          videoClips.push({ clip, inputIndex: currentInputIndex });
          currentInputIndex++;
        }
      });
    } else if (track.type === 'audio' || track.type === 'music' || track.type === 'sfx') {
      track.clips.forEach((clip) => {
        if (clip.src) {
          inputs.push('-ss', clip.sourceStartTime.toString(), '-t', clip.duration.toString(), '-i', clip.src);
          audioClips.push({ clip, inputIndex: currentInputIndex });
          currentInputIndex++;
        }
      });
    }
  });

  const width = project.settings.width;
  const height = project.settings.height;
  const fps = project.settings.fps || 30;

  // Base black background canvas
  filterComplexParts.push(`color=c=black:s=${width}x${height}:r=${fps}:d=${project.duration}[base_canvas]`);
  let lastVideoOutput = 'base_canvas';

  // Video overlays and color grading
  videoClips.forEach((item, idx) => {
    const { clip, inputIndex } = item;
    const clipTag = `v${inputIndex}_processed`;
    const overlayTag = `v_layer_${idx}`;

    // Apply scaling and basic color adjustment filters
    const scaleFilter = `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`;
    let colorFilter = '';

    if (clip.colorGrade.contrast !== 0 || clip.colorGrade.brightness !== 0 || clip.colorGrade.saturation !== 0) {
      const contrastVal = (1 + clip.colorGrade.contrast / 100).toFixed(2);
      const brightnessVal = (clip.colorGrade.brightness / 200).toFixed(2);
      const saturationVal = (1 + clip.colorGrade.saturation / 100).toFixed(2);
      colorFilter = `,eq=contrast=${contrastVal}:brightness=${brightnessVal}:saturation=${saturationVal}`;
    }

    filterComplexParts.push(`[${inputIndex}:v]${scaleFilter}${colorFilter}[${clipTag}]`);

    const enableExpr = `between(t,${clip.startTime},${clip.startTime + clip.duration})`;
    filterComplexParts.push(`[${lastVideoOutput}][${clipTag}]overlay=enable='${enableExpr}'[${overlayTag}]`);
    lastVideoOutput = overlayTag;
  });

  // Audio mix filtergraph
  let audioOutputArg: string[] = [];
  if (audioClips.length > 0) {
    const audioTags: string[] = [];
    audioClips.forEach((item) => {
      const { clip, inputIndex } = item;
      const delayedTag = `a${inputIndex}_delayed`;
      const delayMs = Math.round(clip.startTime * 1000);
      const vol = clip.audio?.volume ?? 1.0;
      filterComplexParts.push(`[${inputIndex}:a]adelay=${delayMs}|${delayMs},volume=${vol}[${delayedTag}]`);
      audioTags.push(`[${delayedTag}]`);
    });

    filterComplexParts.push(`${audioTags.join('')}amix=inputs=${audioClips.length}:dropout_transition=2[out_audio]`);
    audioOutputArg = ['-map', '[out_audio]'];
  } else {
    // Generate silent audio stream to keep containers happy
    filterComplexParts.push(`anullsrc=r=48000:cl=stereo:d=${project.duration}[out_audio]`);
    audioOutputArg = ['-map', '[out_audio]'];
  }

  const args: string[] = [
    '-y',
    ...inputs,
    '-filter_complex',
    filterComplexParts.join(';'),
    '-map',
    `[${lastVideoOutput}]`,
    ...audioOutputArg,
    '-c:v',
    'libx264',
    '-preset',
    options.preset === 'high_quality' ? 'slow' : 'veryfast',
    '-crf',
    '18',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-pix_fmt',
    'yuv420p',
    '-t',
    project.duration.toString(),
    options.outputPath,
  ];

  return { command: 'ffmpeg', args };
}
