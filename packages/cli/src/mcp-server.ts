#!/usr/bin/env node
import * as readline from 'readline';
import {
  TimelineProject,
  applyMrBeastPacing,
  applyNolanCinematicStyle,
  applyTechMinimalStyle,
  generateSmartCaptions,
  detectSimulatedSilence,
  autoCutSilenceFromTrack,
  MR_BEAST_CAPTION_STYLE,
  NOLAN_CAPTION_STYLE,
  TECH_MINIMAL_CAPTION_STYLE,
} from '@legacy/core';

// Model Context Protocol Server for AI Agents
let currentProject: TimelineProject | null = null;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', (line: string) => {
  try {
    const request = JSON.parse(line);
    const { id, method, params } = request;

    if (method === 'legacy.loadProject') {
      currentProject = params.project;
      respond(id, { status: 'success', message: 'Project loaded', project: currentProject });
    } else if (method === 'legacy.applyStyle') {
      if (!currentProject) throw new Error('No project currently loaded');
      const style = params.style;
      if (style === 'high_energy') currentProject = applyMrBeastPacing(currentProject);
      else if (style === 'cinematic') currentProject = applyNolanCinematicStyle(currentProject);
      else if (style === 'tech_minimal') currentProject = applyTechMinimalStyle(currentProject);
      respond(id, { status: 'success', project: currentProject });
    } else if (method === 'legacy.cutSilence') {
      if (!currentProject) throw new Error('No project currently loaded');
      const silences = detectSimulatedSilence(currentProject.duration);
      currentProject.tracks = currentProject.tracks.map((t) =>
        t.type === 'video' ? autoCutSilenceFromTrack(t, silences) : t
      );
      respond(id, { status: 'success', removedPauses: silences.length, project: currentProject });
    } else if (method === 'legacy.generateSubtitles') {
      if (!currentProject) throw new Error('No project currently loaded');
      const transcript = params.transcript || 'Welcome to this video';
      const style =
        currentProject.settings.directorStyle === 'high_energy'
          ? MR_BEAST_CAPTION_STYLE
          : currentProject.settings.directorStyle === 'cinematic'
          ? NOLAN_CAPTION_STYLE
          : TECH_MINIMAL_CAPTION_STYLE;

      const captionTrack = generateSmartCaptions(transcript, currentProject.duration, style);
      currentProject.tracks = currentProject.tracks.filter((t) => t.type !== 'subtitle').concat(captionTrack);
      respond(id, { status: 'success', captionCount: captionTrack.clips.length, project: currentProject });
    } else {
      respond(id, { error: `Method ${method} not recognized` });
    }
  } catch (err: any) {
    respond(null, { error: err.message });
  }
});

function respond(id: string | number | null, result: unknown) {
  process.stdout.write(JSON.stringify({ id, jsonrpc: '2.0', result }) + '\n');
}
