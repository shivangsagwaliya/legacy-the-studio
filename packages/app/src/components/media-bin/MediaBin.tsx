import React, { useState } from 'react';
import {
  Film,
  Music,
  Type,
  Layers,
  Sparkles,
  Plus,
  Play,
  Upload,
  Search,
  Wand2,
  Sliders,
} from 'lucide-react';
import { useTimelineStore } from '../../store/useTimelineStore';
import { Clip, STUDIO_FONTS, STUDIO_TRANSITIONS, TransitionType } from '@legacy/core';

export const MediaBin: React.FC = () => {
  const { project, addClipToTrack, currentTime, pushHistory, selectedClipId } = useTimelineStore();
  const [activeTab, setActiveTab] = useState<'media' | 'audio' | 'transitions' | 'fonts'>('media');
  const [searchQuery, setSearchQuery] = useState('');

  const footagePool = [
    {
      id: 'clip-hero-raw',
      name: 'RAW 001 A-Roll 4K.mp4',
      type: 'video' as const,
      duration: 5.0,
      codec: 'ProRes 422 HQ',
      fps: 30,
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
    {
      id: 'clip-reveal-raw',
      name: 'RAW 002 Tracking Shot.mp4',
      type: 'video' as const,
      duration: 4.5,
      codec: 'ProRes 422 HQ',
      fps: 30,
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    },
    {
      id: 'clip-action-raw',
      name: 'RAW 003 Macro Detail.mp4',
      type: 'video' as const,
      duration: 3.5,
      codec: 'H.265 10-Bit',
      fps: 60,
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },
  ];

  const audioPool = [
    { id: 'sfx-01', name: 'High Speed Whip Whoosh', duration: 0.8, type: 'sfx' },
    { id: 'sfx-02', name: 'Sub Bass Impact Boom', duration: 2.0, type: 'sfx' },
    { id: 'sfx-03', name: 'Cinematic Tension Riser', duration: 3.5, type: 'sfx' },
    { id: 'sfx-04', name: 'Tech Bell Ping Hit', duration: 0.5, type: 'sfx' },
    { id: 'mus-01', name: 'Hans Zimmer Low Bass Drone', duration: 14.0, type: 'music' },
  ];

  const handleApplyTransition = (transType: TransitionType) => {
    if (!selectedClipId) return;

    const updatedTracks = project.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((clip) =>
        clip.id === selectedClipId
          ? { ...clip, transitionIn: { type: transType, duration: 0.3 } }
          : clip
      ),
    }));

    pushHistory({ ...project, tracks: updatedTracks });
  };

  const handleApplyFont = (fontFamily: string) => {
    const updatedTracks = project.tracks.map((track) => {
      if (track.type !== 'subtitle') return track;
      return {
        ...track,
        clips: track.clips.map((clip) => ({
          ...clip,
          captionStyle: clip.captionStyle
            ? { ...clip.captionStyle, fontFamily }
            : undefined,
        })),
      };
    });

    pushHistory({ ...project, tracks: updatedTracks });
  };

  const handleAddMedia = (item: (typeof footagePool)[0]) => {
    const videoTrack = project.tracks.find((t) => t.type === 'video');
    if (!videoTrack) return;

    const newClip: Clip = {
      id: `clip-${Date.now()}`,
      trackId: videoTrack.id,
      name: item.name,
      type: item.type,
      src: item.src,
      startTime: currentTime,
      duration: item.duration,
      sourceStartTime: 0,
      sourceDuration: item.duration,
      speed: 1.0,
      transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1.0 },
      colorGrade: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        temperature: 0,
        tint: 0,
        shadows: 0,
        highlights: 0,
        vignette: 0,
        filmGrain: 0,
      },
      keyframes: [],
    };

    addClipToTrack(videoTrack.id, newClip);
  };

  return (
    <div className="w-68 bg-[#0d0e12] border-r border-white/[0.08] flex flex-col z-30 select-none">
      {/* Bin Tabs Bar */}
      <div className="flex bg-[#12141a] p-1 border-b border-white/[0.06]">
        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-1 text-[10px] font-mono uppercase tracking-wider rounded transition-all ${
            activeTab === 'media' ? 'bg-white/[0.12] text-white font-semibold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Media
        </button>
        <button
          onClick={() => setActiveTab('audio')}
          className={`flex-1 py-1 text-[10px] font-mono uppercase tracking-wider rounded transition-all ${
            activeTab === 'audio' ? 'bg-white/[0.12] text-white font-semibold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          SFX
        </button>
        <button
          onClick={() => setActiveTab('transitions')}
          className={`flex-1 py-1 text-[10px] font-mono uppercase tracking-wider rounded transition-all ${
            activeTab === 'transitions' ? 'bg-white/[0.12] text-white font-semibold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Cut VFX
        </button>
        <button
          onClick={() => setActiveTab('fonts')}
          className={`flex-1 py-1 text-[10px] font-mono uppercase tracking-wider rounded transition-all ${
            activeTab === 'fonts' ? 'bg-white/[0.12] text-white font-semibold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Fonts
        </button>
      </div>

      {/* Search & Import */}
      <div className="p-2.5 space-y-2 border-b border-white/[0.06]">
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search effects & assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#14161d] border border-white/10 rounded-lg pl-7 pr-2.5 py-1 text-[11px] text-white placeholder-zinc-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {/* MEDIA TAB */}
        {activeTab === 'media' &&
          footagePool.map((item) => (
            <div
              key={item.id}
              onClick={() => handleAddMedia(item)}
              className="bg-[#12141a] hover:bg-[#181a22] border border-white/[0.06] hover:border-white/15 rounded-lg p-2 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-7 h-7 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Film className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-zinc-200 truncate">{item.name}</span>
                  <span className="text-[9px] text-zinc-500 font-mono">
                    {item.codec} · {item.duration}s
                  </span>
                </div>
              </div>

              <button className="p-1 rounded bg-white/[0.06] hover:bg-blue-600 hover:text-white text-zinc-400 transition-colors">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ))}

        {/* AUDIO & SFX TAB */}
        {activeTab === 'audio' &&
          audioPool.map((item) => (
            <div
              key={item.id}
              className="bg-[#12141a] hover:bg-[#181a22] border border-white/[0.06] rounded-lg p-2 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Music className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-zinc-200">{item.name}</span>
                  <span className="text-[9px] text-zinc-500 font-mono uppercase">{item.type} · {item.duration}s</span>
                </div>
              </div>

              <button className="p-1 rounded bg-white/[0.06] hover:bg-blue-600 hover:text-white text-zinc-400 transition-colors">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ))}

        {/* TRANSITIONS TAB (12 Studio Transitions) */}
        {activeTab === 'transitions' && (
          <div className="space-y-1.5">
            <div className="px-1 py-0.5 text-[9px] font-mono uppercase tracking-wider text-zinc-500">
              Click to apply to selected clip
            </div>
            {STUDIO_TRANSITIONS.map((tr) => (
              <div
                key={tr.id}
                onClick={() => handleApplyTransition(tr.id)}
                className="bg-[#12141a] hover:bg-[#181a22] border border-white/[0.06] hover:border-blue-500/30 rounded-lg p-2 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Wand2 className="w-3.5 h-3.5 text-blue-400" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-zinc-200">{tr.name}</span>
                    <span className="text-[9px] text-zinc-500 font-mono">{tr.category}</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-zinc-500 bg-white/[0.04] px-1.5 py-0.5 rounded">0.3s</span>
              </div>
            ))}
          </div>
        )}

        {/* FONTS STUDIO TAB */}
        {activeTab === 'fonts' && (
          <div className="space-y-1.5">
            <div className="px-1 py-0.5 text-[9px] font-mono uppercase tracking-wider text-zinc-500">
              Click to apply font to subtitle tracks
            </div>
            {STUDIO_FONTS.map((font) => (
              <div
                key={font.id}
                onClick={() => handleApplyFont(font.name)}
                className="bg-[#12141a] hover:bg-[#181a22] border border-white/[0.06] hover:border-blue-500/30 rounded-lg p-2.5 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white tracking-wide" style={{ fontFamily: font.name }}>
                    {font.name}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono">{font.category}</span>
                </div>
                <button className="text-[10px] font-mono text-blue-400 hover:text-white">Apply</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
