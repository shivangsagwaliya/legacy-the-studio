import React, { useState } from 'react';
import {
  Sliders,
  Palette,
  Volume2,
  Gauge,
  Type,
  Maximize2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useTimelineStore } from '../../store/useTimelineStore';
import { ColorStudio } from './ColorStudio';
import { AudioStudio } from './AudioStudio';
import { SpeedRampGraph } from './SpeedRampGraph';

export const Inspector: React.FC = () => {
  const {
    project,
    selectedClipId,
    updateClipTransform,
    updateClipSpeed,
    updateClipText,
  } = useTimelineStore();

  const [activeTab, setActiveTab] = useState<'video' | 'color' | 'audio' | 'speed' | 'text'>('video');

  let selectedClip = null;
  for (const track of project.tracks) {
    const found = track.clips.find((c) => c.id === selectedClipId);
    if (found) {
      selectedClip = found;
      break;
    }
  }

  if (!selectedClip) {
    return (
      <div className="w-80 bg-[#0e1015] border-l border-white/[0.08] flex flex-col items-center justify-center p-6 text-center text-zinc-500 text-xs select-none">
        <Sliders className="w-6 h-6 mb-2 opacity-30" />
        <span className="font-medium text-zinc-400">Inspector Inactive</span>
        <span className="text-[10px] text-zinc-600 mt-1">Select a clip in the timeline to inspect properties</span>
      </div>
    );
  }

  return (
    <div className="w-84 bg-[#0e1015] border-l border-white/[0.08] flex flex-col z-30 select-none">
      {/* Inspector Header */}
      <div className="p-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-white truncate max-w-[190px]">
              {selectedClip.name}
            </span>
            <span className="text-[9px] font-mono text-zinc-500 uppercase">
              {selectedClip.type} Stream · {selectedClip.duration.toFixed(2)}s
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#14161d] p-0.5 rounded-lg border border-white/[0.06]">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-1 text-[10px] font-medium rounded transition-all ${
              activeTab === 'video' ? 'bg-white/[0.12] text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Video
          </button>
          <button
            onClick={() => setActiveTab('color')}
            className={`flex-1 py-1 text-[10px] font-medium rounded transition-all ${
              activeTab === 'color' ? 'bg-white/[0.12] text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Color
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex-1 py-1 text-[10px] font-medium rounded transition-all ${
              activeTab === 'audio' ? 'bg-white/[0.12] text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Audio
          </button>
          <button
            onClick={() => setActiveTab('speed')}
            className={`flex-1 py-1 text-[10px] font-medium rounded transition-all ${
              activeTab === 'speed' ? 'bg-white/[0.12] text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Ramp
          </button>
          {selectedClip.type === 'subtitle' && (
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-1 text-[10px] font-medium rounded transition-all ${
                activeTab === 'text' ? 'bg-white/[0.12] text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Text
            </button>
          )}
        </div>
      </div>

      {/* Inspector Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-zinc-300">
        {/* VIDEO TAB */}
        {activeTab === 'video' && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-zinc-400 mb-1 font-mono text-[10px]">
                <span>Scale Multiplier</span>
                <span className="text-white">{(selectedClip.transform.scale * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.05"
                value={selectedClip.transform.scale}
                onChange={(e) => updateClipTransform(selectedClip.id, { scale: parseFloat(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-zinc-400 mb-1 font-mono text-[10px]">
                <span>Opacity</span>
                <span className="text-white">{(selectedClip.transform.opacity * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={selectedClip.transform.opacity}
                onChange={(e) => updateClipTransform(selectedClip.id, { opacity: parseFloat(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-zinc-400 mb-1 font-mono text-[10px]">
                <span>Spatial Rotation</span>
                <span className="text-white">{selectedClip.transform.rotation}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={selectedClip.transform.rotation}
                onChange={(e) => updateClipTransform(selectedClip.id, { rotation: parseInt(e.target.value, 10) })}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
        )}

        {/* COLOR TAB */}
        {activeTab === 'color' && <ColorStudio />}

        {/* AUDIO TAB */}
        {activeTab === 'audio' && <AudioStudio />}

        {/* SPEED TAB */}
        {activeTab === 'speed' && (
          <div className="space-y-4">
            <SpeedRampGraph />

            <div>
              <div className="flex justify-between text-zinc-400 mb-1 font-mono text-[10px]">
                <span>Static Speed Multiplier</span>
                <span className="text-white">{selectedClip.speed}x</span>
              </div>
              <input
                type="range"
                min="0.25"
                max="4.0"
                step="0.25"
                value={selectedClip.speed}
                onChange={(e) => updateClipSpeed(selectedClip.id, parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
        )}

        {/* TEXT TAB */}
        {activeTab === 'text' && selectedClip.type === 'subtitle' && (
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">Transcript Phrase</span>
            <textarea
              value={selectedClip.text || ''}
              onChange={(e) => updateClipText(selectedClip.id, e.target.value)}
              className="w-full bg-[#101218] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none h-24"
            />
          </div>
        )}
      </div>
    </div>
  );
};
