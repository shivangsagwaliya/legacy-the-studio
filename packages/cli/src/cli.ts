#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { TimelineProject, buildFFmpegCommand, generateRemotionCode } from '@legacy/core';

const args = process.argv.slice(2);
const command = args[0];

function printHelp() {
  console.log(`
Legacy Video Editor CLI

Commands:
  render <project.json> -o <output.mp4>    Render a video project using FFmpeg
  export-code <project.json>               Export Remotion-compatible React code
  inspect <project.json>                   Print timeline summary and tracks
  mcp                                      Run Model Context Protocol server for AI

Options:
  -o, --output <path>                      Output video file path
  --preset <fast|high_quality>             Encoding preset
  -h, --help                               Show this help message
`);
}

if (!command || command === '-h' || command === '--help') {
  printHelp();
  process.exit(0);
}

if (command === 'render') {
  const projectPath = args[1];
  const outputFlagIdx = args.indexOf('-o') !== -1 ? args.indexOf('-o') : args.indexOf('--output');
  const outputPath = outputFlagIdx !== -1 ? args[outputFlagIdx + 1] : 'output.mp4';

  if (!projectPath || !fs.existsSync(projectPath)) {
    console.error('Error: Project file not found at:', projectPath);
    process.exit(1);
  }

  const project: TimelineProject = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
  console.log(`Rendering project "${project.title}" (${project.settings.width}x${project.settings.height} @ ${project.settings.fps}fps)...`);

  const { command: cmd, args: ffmpegArgs } = buildFFmpegCommand(project, { outputPath });
  console.log(`Executing: ${cmd} ${ffmpegArgs.join(' ')}`);

  try {
    execSync(`${cmd} ${ffmpegArgs.join(' ')}`, { stdio: 'inherit' });
    console.log(`Render complete: ${outputPath}`);
  } catch (err) {
    console.error('Render error:', err);
    process.exit(1);
  }
} else if (command === 'export-code') {
  const projectPath = args[1];
  if (!projectPath || !fs.existsSync(projectPath)) {
    console.error('Error: Project file not found.');
    process.exit(1);
  }
  const project: TimelineProject = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
  console.log(generateRemotionCode(project));
} else {
  printHelp();
}
