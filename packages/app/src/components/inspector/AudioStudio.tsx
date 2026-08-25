import React from 'react';
import { Volume2, Mic, Activity, Sliders, Shield } from 'lucide-react';
import { useTimelineStore } from '../../store/useTimelineStore';
import { ParametricEQGraph } from './ParametricEQGraph';

export const AudioStudio: React.FC = () => {
  const { project, selectedClipId, updateClipAudio, audioMeterL, audioMeterR } = useTimelineStore();

  let selectedClip = null;
  for (const track of project.tracks) {
    const found = track.clips.find((c) => c.id === selectedClipId);
    if (found) {
      selectedClip = found;
      break;
    }
  }

  const vol = selectedClip?.audio?.volume ?? 1.0;
  const ducking = selectedClip?.audio?.ducking ?? true;
  const noiseSuppression = selectedClip?.audio?.noiseSuppression ?? 0;

  return (
    <div className="space-y-4 text-xs text-zinc-300 select-none">
      {/* Master Stereo Peak VU Meters */}
      <div className="p-3 rounded-xl bg-[#101218] border border-white/[0.06] space-y-2">
        <div className="flex justify-between text-[10px] font-mono text-zinc-400">
          <span>Stereo Master Out</span>
          <span className="text-white font-semibold">
            {audioMeterL > -60 ? `${audioMeterL.toFixed(1)} dB` : '-INF'}
          </span>
        </div>

        {/* L Channel */}
        <div className="flex items-center space-x-2">
          <span className="text-[9px] font-mono text-zinc-500 w-3">L</span>
          <div className="flex-1 bg-black/80 rounded h-2 overflow-hidden flex border border-white/5">
            <div
              className="h-full transition-all duration-75"
              style={{
                width: `${Math.max(0, ((audioMeterL + 60) / 60) * 100)}%`,
                background:
                  audioMeterL > -3
                    ? '#ef4444'
                    : audioMeterL > -12
                    ? '#f59e0b'
                    : '#10b981',
              }}
            />
          </div>
        </div>

        {/* R Channel */}
        <div className="flex items-center space-x-2">
          <span className="text-[9px] font-mono text-zinc-500 w-3">R</span>
          <div className="flex-1 bg-black/80 rounded h-2 overflow-hidden flex border border-white/5">
            <div
              className="h-full transition-all duration-75"
              style={{
                width: `${Math.max(0, ((audioMeterR + 60) / 60) * 100)}%`,
                background:
                  audioMeterR > -3
                    ? '#ef4444'
                    : audioMeterR > -12
                    ? '#f59e0b'
                    : '#10b981',
              }}
            />
          </div>
        </div>
      </div>

      {/* 4-Band Parametric EQ Graph */}
      <ParametricEQGraph />

      {/* Clip Level Controls */}
      {selectedClip && (
        <div className="space-y-3 pt-2">
          <div>
            <div className="flex justify-between text-zinc-400 mb-1.5 font-mono text-[10px]">
              <span>Clip Gain</span>
              <span className="text-white">{(vol * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={vol}
              onChange={(e) => updateClipAudio(selectedClip.id, { volume: parseFloat(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          {/* AI Voice Isolation / Noise Reduction */}
          <div className="p-3 rounded-xl bg-[#101218] border border-white/[0.06] space-y-2">
            <div className="flex justify-between text-zinc-400 font-mono text-[10px]">
              <span>AI Voice Isolation</span>
              <span className="text-white">{noiseSuppression}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={noiseSuppression}
              onChange={(e) => updateClipAudio(selectedClip.id, { noiseSuppression: parseInt(e.target.value, 10) })}
              className="w-full accent-blue-500"
            />
            <p className="text-[10px] text-zinc-500">Separates human dialogue from room reverb and ambient noise.</p>
          </div>

          {/* Sidechain Auto-Ducking */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#101218] border border-white/[0.06]">
            <div>
              <span className="text-xs font-medium text-white block">Sidechain Ducking</span>
              <span className="text-[10px] text-zinc-500">Auto-lower track -18dB when speech is detected</span>
            </div>
            <input
              type="checkbox"
              checked={ducking}
              onChange={(e) => updateClipAudio(selectedClip.id, { ducking: e.target.checked })}
              className="w-4 h-4 accent-blue-500 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
