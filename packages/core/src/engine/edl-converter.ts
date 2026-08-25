import { TimelineProject, Track, Clip } from '../schema/timeline.js';
import { formatTimecode } from './timeline-engine.js';

export function exportToCMX3600EDL(project: TimelineProject): string {
  const lines: string[] = [];
  lines.push(`TITLE: ${project.title.toUpperCase()}`);
  lines.push(`FCM: NON-DROP FRAME`);
  lines.push('');

  let eventNumber = 1;
  const fps = project.settings.fps || 30;

  project.tracks.forEach((track) => {
    if (track.type === 'video') {
      track.clips.forEach((clip) => {
        const eventId = eventNumber.toString().padStart(3, '0');
        const reelName = 'AX'.padEnd(8, ' ');
        const trackType = 'V     C        ';

        const srcIn = formatTimecode(clip.sourceStartTime, fps);
        const srcOut = formatTimecode(clip.sourceStartTime + clip.duration * clip.speed, fps);
        const recIn = formatTimecode(clip.startTime, fps);
        const recOut = formatTimecode(clip.startTime + clip.duration, fps);

        lines.push(`${eventId}  ${reelName} ${trackType} ${srcIn} ${srcOut} ${recIn} ${recOut}`);
        lines.push(`* FROM CLIP NAME: ${clip.name}`);
        lines.push('');
        eventNumber++;
      });
    }
  });

  return lines.join('\n');
}

export function exportToFinalCutProXML(project: TimelineProject): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="4">
  <sequence>
    <name>${project.title}</name>
    <duration>${Math.round(project.duration * project.settings.fps)}</duration>
    <rate>
      <timebase>${project.settings.fps}</timebase>
      <ntsc>FALSE</ntsc>
    </rate>
    <media>
      <video>
        <format>
          <samplecharacteristics>
            <width>${project.settings.width}</width>
            <height>${project.settings.height}</height>
          </samplecharacteristics>
        </format>
      </video>
    </media>
  </sequence>
</xmeml>`;
}
