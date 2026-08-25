import React, { useState } from 'react';
import { Gauge, Zap, Play, RotateCcw } from 'lucide-react';
import { useTimelineStore } from '../../store/useTimelineStore';
import { generatePresetSpeedRamp, SpeedRampPoint } from '@legacy/core';

export const SpeedRampGraph: React.FC = () => {
  const { project, selectedClipId, pushHistory } = useTimelineStore();

  let selectedClip = null;
  for (const track of project.tracks) {
    const found = track.clips.find((c) => c.id === selectedClipId);
    if (found) {
      selectedClip = found;
      break;
    }
  }

  if (!selectedClip) return null;

  const points: SpeedRampPoint[] = selectedClip.speedRamp || [
    { time: 0, speedMultiplier: 1.0 },
    { time: selectedClip.duration, speedMultiplier: 1.0 },
  ];

  const handleApplyPreset = (preset: 'bullet_time' | 'jump_ramp' | 'hero_slowmo') => {
    if (!selectedClip) return;
    const newPoints = generatePresetSpeedRamp(preset, selectedClip.duration);

    const updatedTracks = project.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((c) => (c.id === selectedClip.id ? { ...c, speedRamp: newPoints } : c)),
    }));

    pushHistory({ ...project, tracks: updatedTracks });
  };

  // Convert points to SVG Path
  const width = 280;
  const height = 100;
  const dur = selectedClip.duration || 1;

  const svgPoints = points.map((p) => {
    const x = (p.time / dur) * width;
    const y = height - (Math.min(4, Math.max(0.1, p.speedMultiplier)) / 4) * height;
    return `${x},${y}`;
  });

  const pathD = `M 0,${height - (1 / 4) * height} L ${svgPoints.join(' L ')}`;

  return (
    <div className="p-3 rounded-xl bg-[#101218] border border-white/[0.06] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-semibold">
          Optical Flow Speed Ramp Curve
        </span>
        <span className="text-[10px] font-mono text-blue-400">Bézier Dynamic</span>
      </div>

      {/* SVG Curve Canvas */}
      <div className="w-full h-24 bg-black/80 rounded-lg border border-white/10 relative p-1">
        <svg className="w-full h-full overflow-visible">
          {/* 1.0x Normal Speed Line */}
          <line
            x1="0"
            y1={height - (1 / 4) * height}
            x2={width}
            y2={height - (1 / 4) * height}
            stroke="rgba(255,255,255,0.15)"
            strokeDasharray="4 4"
          />

          {/* Speed Ramp Curve */}
          <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" />

          {/* Control Keyframe Nodes */}
          {points.map((p, idx) => {
            const cx = (p.time / dur) * width;
            const cy = height - (Math.min(4, Math.max(0.1, p.speedMultiplier)) / 4) * height;
            return (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r="4"
                fill="#ffffff"
                stroke="#3b82f6"
                strokeWidth="2"
                className="cursor-pointer"
              />
            );
          })}
        </svg>

        <span className="absolute top-1 left-2 text-[8px] font-mono text-zinc-500">4.0x FAST</span>
        <span className="absolute bottom-1 left-2 text-[8px] font-mono text-zinc-500">0.25x SLOW-MO</span>
      </div>

      {/* Ramp Presets */}
      <div className="grid grid-cols-3 gap-1.5 pt-1">
        <button
          onClick={() => handleApplyPreset('bullet_time')}
          className="py-1 px-2 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[10px] font-mono text-zinc-300 hover:text-white transition-colors text-center"
        >
          Bullet Time
        </button>
        <button
          onClick={() => handleApplyPreset('hero_slowmo')}
          className="py-1 px-2 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[10px] font-mono text-zinc-300 hover:text-white transition-colors text-center"
        >
          Hero Slow-Mo
        </button>
        <button
          onClick={() => handleApplyPreset('jump_ramp')}
          className="py-1 px-2 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[10px] font-mono text-zinc-300 hover:text-white transition-colors text-center"
        >
          Jump Ramp
        </button>
      </div>
    </div>
  );
};
