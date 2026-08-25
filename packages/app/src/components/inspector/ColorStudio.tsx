import React from 'react';
import { Palette, Disc, Sun, Sparkles, Sliders } from 'lucide-react';
import { useTimelineStore } from '../../store/useTimelineStore';
import { ColorWheelValue } from '@legacy/core';

interface WheelControlProps {
  label: string;
  value: ColorWheelValue;
  onChange: (val: Partial<ColorWheelValue>) => void;
}

const ColorWheel: React.FC<WheelControlProps> = ({ label, value, onChange }) => {
  // Convert polar coordinates to position
  const rad = ((value.hue - 90) * Math.PI) / 180;
  const dist = (value.saturation / 100) * 32;
  const handleX = 40 + Math.cos(rad) * dist;
  const handleY = 40 + Math.sin(rad) * dist;

  const handleWheelClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 40;
    const y = e.clientY - rect.top - 40;
    const distance = Math.min(36, Math.sqrt(x * x + y * y));
    const sat = Math.round((distance / 36) * 100);
    let angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;

    onChange({ hue: Math.round(angle), saturation: sat });
  };

  return (
    <div className="flex flex-col items-center p-2 rounded-xl bg-[#101218] border border-white/[0.06]">
      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
        {label}
      </span>

      {/* Wheel Vector Ring */}
      <div
        onClick={handleWheelClick}
        className="w-20 h-20 rounded-full border border-white/15 relative cursor-crosshair mb-2"
        style={{
          background: 'radial-gradient(circle at center, #1c1f26 0%, #101216 100%), conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
          backgroundBlendMode: 'soft-light',
        }}
      >
        <div className="absolute inset-0 rounded-full border border-white/10" />
        {/* Reticle Handle */}
        <div
          className="absolute w-3 h-3 rounded-full border-2 border-white bg-black/50 shadow-md -ml-1.5 -mt-1.5 pointer-events-none"
          style={{ left: `${handleX}px`, top: `${handleY}px` }}
        />
      </div>

      {/* Master Luminance Slider */}
      <div className="w-full flex items-center space-x-1.5">
        <span className="text-[9px] font-mono text-zinc-500">Y</span>
        <input
          type="range"
          min="-50"
          max="50"
          value={value.luminance}
          onChange={(e) => onChange({ luminance: parseInt(e.target.value, 10) })}
          className="flex-1 accent-blue-500 h-1"
        />
        <span className="text-[9px] font-mono text-zinc-400 w-6 text-right">{value.luminance}</span>
      </div>
    </div>
  );
};

export const ColorStudio: React.FC = () => {
  const { project, selectedClipId, updateClipColorGrade, updateClipColorWheel } = useTimelineStore();

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
      <div className="p-6 text-center text-zinc-500 text-xs">
        <span>Select a video clip to access Primary Color Wheels & LUTs</span>
      </div>
    );
  }

  const wheels = selectedClip.colorGrade.wheels || {
    lift: { hue: 0, saturation: 0, luminance: 0 },
    gamma: { hue: 0, saturation: 0, luminance: 0 },
    gain: { hue: 0, saturation: 0, luminance: 0 },
    offset: { hue: 0, saturation: 0, luminance: 0 },
  };

  const luts = [
    { id: 'none', label: 'Rec.709 Standard' },
    { id: 'teal_orange', label: 'Kodak 2383 Teal-Orange' },
    { id: 'cinematic_warm', label: 'Arri Alexa Golden Film' },
    { id: 'film_bw', label: 'Ilford HP5 High Contrast BW' },
  ];

  return (
    <div className="space-y-4 text-xs text-zinc-300 select-none">
      {/* 3-Way Color Wheels Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-semibold">
            Primary Color Wheels (Lift / Gamma / Gain)
          </span>
          <button
            onClick={() =>
              updateClipColorGrade(selectedClip.id, {
                wheels: {
                  lift: { hue: 0, saturation: 0, luminance: 0 },
                  gamma: { hue: 0, saturation: 0, luminance: 0 },
                  gain: { hue: 0, saturation: 0, luminance: 0 },
                  offset: { hue: 0, saturation: 0, luminance: 0 },
                },
              })
            }
            className="text-[10px] text-zinc-500 hover:text-white font-mono"
          >
            Reset Wheels
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <ColorWheel
            label="Lift (Shadows)"
            value={wheels.lift}
            onChange={(v) => updateClipColorWheel(selectedClip.id, 'lift', v)}
          />
          <ColorWheel
            label="Gamma (Mids)"
            value={wheels.gamma}
            onChange={(v) => updateClipColorWheel(selectedClip.id, 'gamma', v)}
          />
          <ColorWheel
            label="Gain (Highs)"
            value={wheels.gain}
            onChange={(v) => updateClipColorWheel(selectedClip.id, 'gain', v)}
          />
        </div>
      </div>

      {/* 3D LUT Emulation */}
      <div className="pt-2 border-t border-white/[0.06]">
        <div className="flex justify-between text-zinc-400 mb-1.5 font-mono text-[10px] uppercase tracking-wider">
          <span>3D LUT Profile</span>
          <span className="text-white">{selectedClip.colorGrade.lut || 'None'}</span>
        </div>
        <select
          value={selectedClip.colorGrade.lut || 'none'}
          onChange={(e) => updateClipColorGrade(selectedClip.id, { lut: e.target.value })}
          className="w-full bg-[#101218] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
        >
          {luts.map((lut) => (
            <option key={lut.id} value={lut.id}>
              {lut.label}
            </option>
          ))}
        </select>
      </div>

      {/* Primary Balancing Sliders */}
      <div className="space-y-3 pt-2 border-t border-white/[0.06]">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between text-zinc-400 mb-1 font-mono text-[10px]">
              <span>Contrast</span>
              <span className="text-white">{selectedClip.colorGrade.contrast}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={selectedClip.colorGrade.contrast}
              onChange={(e) => updateClipColorGrade(selectedClip.id, { contrast: parseInt(e.target.value, 10) })}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-zinc-400 mb-1 font-mono text-[10px]">
              <span>Saturation</span>
              <span className="text-white">{selectedClip.colorGrade.saturation}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={selectedClip.colorGrade.saturation}
              onChange={(e) => updateClipColorGrade(selectedClip.id, { saturation: parseInt(e.target.value, 10) })}
              className="w-full accent-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between text-zinc-400 mb-1 font-mono text-[10px]">
              <span>Temperature</span>
              <span className="text-white">{selectedClip.colorGrade.temperature}K</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={selectedClip.colorGrade.temperature}
              onChange={(e) => updateClipColorGrade(selectedClip.id, { temperature: parseInt(e.target.value, 10) })}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-zinc-400 mb-1 font-mono text-[10px]">
              <span>Film Grain</span>
              <span className="text-white">{selectedClip.colorGrade.filmGrain}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={selectedClip.colorGrade.filmGrain}
              onChange={(e) => updateClipColorGrade(selectedClip.id, { filmGrain: parseInt(e.target.value, 10) })}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
