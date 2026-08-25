import React, { useState } from 'react';
import { Activity, BarChart3, Disc } from 'lucide-react';
import { useTimelineStore } from '../../store/useTimelineStore';

export const Scopes: React.FC = () => {
  const { project, currentTime } = useTimelineStore();
  const [scopeType, setScopeType] = useState<'parade' | 'vectorscope' | 'waveform'>('parade');

  return (
    <div className="w-72 bg-[#0c0d11] border-l border-white/[0.08] flex flex-col z-20 select-none">
      {/* Scopes Header */}
      <div className="h-9 px-3 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
          Video Scopes
        </span>
        <div className="flex bg-[#14161d] p-0.5 rounded border border-white/[0.06]">
          <button
            onClick={() => setScopeType('parade')}
            className={`px-2 py-0.5 text-[9px] font-mono rounded ${
              scopeType === 'parade' ? 'bg-white/[0.12] text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            RGB Parade
          </button>
          <button
            onClick={() => setScopeType('vectorscope')}
            className={`px-2 py-0.5 text-[9px] font-mono rounded ${
              scopeType === 'vectorscope' ? 'bg-white/[0.12] text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Vector
          </button>
          <button
            onClick={() => setScopeType('waveform')}
            className={`px-2 py-0.5 text-[9px] font-mono rounded ${
              scopeType === 'waveform' ? 'bg-white/[0.12] text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Waveform
          </button>
        </div>
      </div>

      {/* Scope Canvas Area */}
      <div className="flex-1 p-3 flex flex-col items-center justify-center bg-black/60 relative">
        {scopeType === 'parade' && (
          <div className="w-full h-full flex space-x-1.5 p-1">
            {/* Red Channel */}
            <div className="flex-1 bg-black/80 rounded border border-red-900/30 p-1 flex flex-col justify-between relative overflow-hidden">
              <span className="text-[8px] font-mono text-red-500 z-10">R 100%</span>
              <div className="h-full flex items-end justify-around space-x-0.5 opacity-70">
                {[60, 85, 40, 90, 75, 50, 95, 30, 70, 80].map((h, i) => (
                  <div key={i} className="w-1 bg-red-500 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
              <span className="text-[8px] font-mono text-red-900/80 z-10">0 IRE</span>
            </div>

            {/* Green Channel */}
            <div className="flex-1 bg-black/80 rounded border border-emerald-900/30 p-1 flex flex-col justify-between relative overflow-hidden">
              <span className="text-[8px] font-mono text-emerald-500 z-10">G 100%</span>
              <div className="h-full flex items-end justify-around space-x-0.5 opacity-70">
                {[55, 70, 60, 80, 85, 65, 75, 45, 90, 60].map((h, i) => (
                  <div key={i} className="w-1 bg-emerald-500 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
              <span className="text-[8px] font-mono text-emerald-900/80 z-10">0 IRE</span>
            </div>

            {/* Blue Channel */}
            <div className="flex-1 bg-black/80 rounded border border-blue-900/30 p-1 flex flex-col justify-between relative overflow-hidden">
              <span className="text-[8px] font-mono text-blue-500 z-10">B 100%</span>
              <div className="h-full flex items-end justify-around space-x-0.5 opacity-70">
                {[70, 50, 90, 65, 40, 85, 60, 75, 55, 95].map((h, i) => (
                  <div key={i} className="w-1 bg-blue-500 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
              <span className="text-[8px] font-mono text-blue-900/80 z-10">0 IRE</span>
            </div>
          </div>
        )}

        {scopeType === 'vectorscope' && (
          <div className="w-48 h-48 rounded-full border border-emerald-500/30 relative flex items-center justify-center bg-black/90">
            {/* Skin Tone Indicator Line */}
            <div className="absolute w-full h-px bg-amber-500/40 rotate-[137deg]" />
            <div className="absolute w-full h-px bg-white/10" />
            <div className="absolute h-full w-px bg-white/10" />

            {/* Color targets */}
            <span className="absolute top-2 right-6 text-[8px] font-mono text-red-400">R</span>
            <span className="absolute top-2 left-6 text-[8px] font-mono text-yellow-400">Yl</span>
            <span className="absolute bottom-2 left-6 text-[8px] font-mono text-emerald-400">G</span>
            <span className="absolute bottom-2 right-6 text-[8px] font-mono text-blue-400">B</span>

            {/* Chroma cluster */}
            <div className="w-20 h-20 rounded-full bg-emerald-400/20 blur-md" />
          </div>
        )}

        {scopeType === 'waveform' && (
          <div className="w-full h-full bg-black/90 rounded border border-white/10 p-2 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between text-[8px] font-mono text-zinc-500 border-b border-white/5 pb-0.5">
              <span>1023 (100 IRE)</span>
              <span>WHITE CLIPPING</span>
            </div>
            <div className="h-full flex items-end justify-around space-x-0.5 opacity-60">
              {[40, 65, 80, 50, 70, 90, 60, 45, 85, 95, 35, 75, 60, 80, 55, 90].map((h, i) => (
                <div key={i} className="w-1 bg-amber-300 rounded-t" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="flex justify-between text-[8px] font-mono text-zinc-500 border-t border-white/5 pt-0.5">
              <span>0 (0 IRE)</span>
              <span>BLACK CRUSH</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
