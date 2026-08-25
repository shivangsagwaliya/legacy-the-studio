import React, { useState } from 'react';
import { Activity, Sliders } from 'lucide-react';
import { useTimelineStore } from '../../store/useTimelineStore';

export const ParametricEQGraph: React.FC = () => {
  const [bands, setBands] = useState([
    { id: 'low', freq: '80 Hz', gain: 2, q: 0.7 },
    { id: 'lmid', freq: '400 Hz', gain: -3, q: 1.2 },
    { id: 'hmid', freq: '2.5 kHz', gain: 4, q: 1.0 },
    { id: 'high', freq: '10 kHz', gain: 1, q: 0.8 },
  ]);

  const width = 280;
  const height = 90;

  return (
    <div className="p-3 rounded-xl bg-[#101218] border border-white/[0.06] space-y-3 select-none">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-semibold">
          4-Band Fairlight Parametric EQ
        </span>
        <span className="text-[10px] font-mono text-emerald-400">DSP Active</span>
      </div>

      {/* SVG EQ Curve */}
      <div className="w-full h-24 bg-black/90 rounded-lg border border-white/10 relative p-1">
        <svg className="w-full h-full overflow-visible">
          {/* 0dB Center Line */}
          <line
            x1="0"
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke="rgba(255,255,255,0.15)"
            strokeDasharray="2 2"
          />

          {/* EQ Curve Line */}
          <path
            d={`M 0,${height / 2} Q 60,${height / 2 - 12} 120,${height / 2 + 16} T 200,${
              height / 2 - 20
            } T ${width},${height / 2 - 6}`}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
          />

          {/* Interactive Band Nodes */}
          {[
            { cx: 50, cy: height / 2 - 12, label: '1' },
            { cx: 110, cy: height / 2 + 16, label: '2' },
            { cx: 180, cy: height / 2 - 20, label: '3' },
            { cx: 240, cy: height / 2 - 6, label: '4' },
          ].map((node, i) => (
            <g key={i}>
              <circle
                cx={node.cx}
                cy={node.cy}
                r="5"
                fill="#ffffff"
                stroke="#10b981"
                strokeWidth="2"
                className="cursor-pointer hover:scale-125 transition-transform"
              />
              <text
                x={node.cx}
                y={node.cy - 8}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="8"
                fontFamily="monospace"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>

        <span className="absolute top-1 left-2 text-[8px] font-mono text-zinc-500">+18 dB</span>
        <span className="absolute bottom-1 left-2 text-[8px] font-mono text-zinc-500">-18 dB</span>
        <span className="absolute bottom-1 right-2 text-[8px] font-mono text-zinc-500">20 kHz</span>
        <span className="absolute bottom-1 left-12 text-[8px] font-mono text-zinc-500">20 Hz</span>
      </div>

      {/* Band Parameters Row */}
      <div className="grid grid-cols-4 gap-1.5 pt-1">
        {bands.map((b) => (
          <div key={b.id} className="p-1.5 rounded bg-white/[0.03] border border-white/[0.04] text-center font-mono">
            <span className="text-[9px] text-zinc-400 block">{b.freq}</span>
            <span className="text-[10px] text-white font-semibold block">
              {b.gain > 0 ? `+${b.gain}` : b.gain} dB
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
