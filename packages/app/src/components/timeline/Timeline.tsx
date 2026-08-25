import React, { useRef, useState, useEffect } from 'react';
import {
  Scissors,
  Trash2,
  Magnet,
  ZoomIn,
  ZoomOut,
  Video,
  Music,
  Type,
  Layers,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { useTimelineStore } from '../../store/useTimelineStore';
import { formatTimecode, Track, Clip } from '@legacy/core';

export const Timeline: React.FC = () => {
  const {
    project,
    currentTime,
    setCurrentTime,
    zoom,
    setZoom,
    snapping,
    setSnapping,
    selectedTrackId,
    selectedClipId,
    selectClip,
    splitClipAtPlayhead,
    rippleDeleteSelected,
    moveClip,
    trimClip,
    aiCutSilences,
  } = useTimelineStore();

  const rulerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Time to pixel conversion
  const timeToPx = (time: number) => time * zoom;
  const pxToTime = (px: number) => px / zoom;

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        useTimelineStore.getState().togglePlayPause();
      } else if (e.code === 'KeyB') {
        e.preventDefault();
        splitClipAtPlayhead();
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        e.preventDefault();
        rippleDeleteSelected();
      } else if (e.ctrlKey && e.code === 'KeyZ') {
        e.preventDefault();
        useTimelineStore.getState().undo();
      } else if (e.ctrlKey && e.code === 'KeyY') {
        e.preventDefault();
        useTimelineStore.getState().redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [splitClipAtPlayhead, rippleDeleteSelected]);

  // Scrubbing on Ruler
  const handleRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    updatePlayheadFromMouse(e);
  };

  const updatePlayheadFromMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = Math.max(0, pxToTime(clickX));
    setCurrentTime(newTime);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbing && rulerRef.current) {
        const rect = rulerRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newTime = Math.max(0, pxToTime(clickX));
        setCurrentTime(newTime);
      }
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, pxToTime, setCurrentTime]);

  // Render Time Markers on Ruler
  const renderTimeMarkers = () => {
    const markers: React.ReactNode[] = [];
    const step = zoom > 120 ? 0.5 : zoom > 50 ? 1.0 : 2.0;
    const totalSteps = Math.ceil(project.duration / step) + 2;

    for (let i = 0; i <= totalSteps; i++) {
      const time = i * step;
      const x = timeToPx(time);
      const isMajor = i % 2 === 0;

      markers.push(
        <div key={i} className="absolute top-0 flex flex-col items-center" style={{ left: `${x}px` }}>
          <div className={`w-px ${isMajor ? 'h-3 bg-white/30' : 'h-1.5 bg-white/15'}`} />
          {isMajor && (
            <span className="text-[9px] font-mono text-studio-400 mt-0.5 select-none -translate-x-1/2">
              {formatTimecode(time, project.settings.fps).slice(3, 8)}
            </span>
          )}
        </div>
      );
    }
    return markers;
  };

  // Helper for Track Icons
  const getTrackIcon = (type: Track['type']) => {
    switch (type) {
      case 'video':
        return <Video className="w-3.5 h-3.5 text-blue-400" />;
      case 'broll':
        return <Layers className="w-3.5 h-3.5 text-indigo-400" />;
      case 'subtitle':
      case 'text':
        return <Type className="w-3.5 h-3.5 text-amber-400" />;
      case 'audio':
      case 'music':
      case 'sfx':
        return <Music className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-studio-400" />;
    }
  };

  // Helper for Clip Colors
  const getClipColorClass = (type: Clip['type'], isSelected: boolean) => {
    if (isSelected) return 'bg-white/[0.2] border-apple-blue shadow-lg shadow-apple-blue/20 ring-1 ring-apple-blue';
    switch (type) {
      case 'video':
        return 'bg-blue-600/30 border-blue-500/40 text-blue-100 hover:bg-blue-600/40';
      case 'graphic':
      case 'image':
        return 'bg-indigo-600/30 border-indigo-500/40 text-indigo-100 hover:bg-indigo-600/40';
      case 'subtitle':
      case 'text':
        return 'bg-amber-600/30 border-amber-500/40 text-amber-100 hover:bg-amber-600/40';
      case 'audio':
      case 'sfx':
        return 'bg-emerald-600/30 border-emerald-500/40 text-emerald-100 hover:bg-emerald-600/40';
      default:
        return 'bg-studio-800 border-white/10 text-white';
    }
  };

  return (
    <div className="h-72 bg-studio-900/95 backdrop-blur-2xl border-t border-white/[0.08] flex flex-col z-30 select-none">
      {/* Timeline Controls Toolbar */}
      <div className="h-10 px-4 border-b border-white/[0.06] flex items-center justify-between text-xs text-studio-300">
        <div className="flex items-center space-x-2">
          {/* Split at Playhead (Razor) */}
          <button
            onClick={splitClipAtPlayhead}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.1] hover:text-white border border-white/[0.06] transition-colors"
            title="Split Clip at Playhead (B)"
          >
            <Scissors className="w-3.5 h-3.5 text-studio-400" />
            <span>Split (B)</span>
          </button>

          {/* Ripple Delete */}
          <button
            onClick={rippleDeleteSelected}
            disabled={!selectedClipId}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white/[0.05] hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 disabled:opacity-30 border border-white/[0.06] transition-colors"
            title="Ripple Delete Selected Clip (Del)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          {/* AI Silence Cutter */}
          <button
            onClick={aiCutSilences}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-colors"
            title="Automatically cut pauses from timeline"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Cut Pauses</span>
          </button>

          {/* Snapping Toggle */}
          <button
            onClick={() => setSnapping(!snapping)}
            className={`p-1.5 rounded-md border transition-colors ${
              snapping
                ? 'bg-apple-blue/20 text-apple-blue border-apple-blue/30'
                : 'bg-white/[0.05] text-studio-400 border-white/[0.06]'
            }`}
            title="Magnetic Snapping (S)"
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-3">
          <ZoomOut className="w-3.5 h-3.5 text-studio-400 cursor-pointer" onClick={() => setZoom(zoom - 20)} />
          <input
            type="range"
            min="30"
            max="250"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-24 accent-apple-blue"
          />
          <ZoomIn className="w-3.5 h-3.5 text-studio-400 cursor-pointer" onClick={() => setZoom(zoom + 20)} />
        </div>
      </div>

      {/* Main Track Workspace & Ruler */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden relative">
        {/* Left Track Headers Column */}
        <div className="w-48 bg-studio-950/80 border-r border-white/[0.06] flex flex-col z-20 shrink-0">
          <div className="h-6 border-b border-white/[0.06] px-3 flex items-center text-[10px] text-studio-400 uppercase font-mono tracking-wider">
            Tracks
          </div>

          <div className="flex-1 flex flex-col overflow-y-auto">
            {project.tracks.map((track) => (
              <div
                key={track.id}
                onClick={() => selectClip(track.id, null)}
                className={`h-14 px-3 border-b border-white/[0.04] flex items-center justify-between transition-colors ${
                  selectedTrackId === track.id ? 'bg-white/[0.06]' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  {getTrackIcon(track.type)}
                  <span className="text-xs font-medium truncate text-studio-200">{track.name}</span>
                </div>

                <div className="flex items-center space-x-1 text-studio-400">
                  <button className="p-1 hover:text-white transition-colors">
                    {track.muted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                  <button className="p-1 hover:text-white transition-colors">
                    {track.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Scrollable Timeline Lanes Area */}
        <div className="flex-1 flex flex-col overflow-x-auto relative overflow-y-hidden">
          {/* Timecode Ruler */}
          <div
            ref={rulerRef}
            onMouseDown={handleRulerMouseDown}
            className="h-6 bg-studio-950/90 border-b border-white/[0.06] relative cursor-pointer select-none"
            style={{ width: `${Math.max(1200, timeToPx(project.duration + 5))}px` }}
          >
            {renderTimeMarkers()}

            {/* Playhead Needle Head */}
            <div
              className="absolute top-0 w-3 h-3 -ml-1.5 bg-apple-blue rotate-45 pointer-events-none z-30 transition-transform"
              style={{ left: `${timeToPx(currentTime)}px` }}
            />
          </div>

          {/* Multi-Track Lanes */}
          <div
            className="flex-1 flex flex-col relative"
            style={{ width: `${Math.max(1200, timeToPx(project.duration + 5))}px` }}
          >
            {/* Playhead Vertical Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-apple-blue pointer-events-none z-30 shadow-[0_0_8px_rgba(10,132,255,0.8)]"
              style={{ left: `${timeToPx(currentTime)}px` }}
            />

            {project.tracks.map((track) => (
              <div
                key={track.id}
                className="h-14 border-b border-white/[0.04] relative flex items-center bg-studio-900/30"
              >
                {track.clips.map((clip) => {
                  const isSelected = selectedClipId === clip.id;
                  const clipLeft = timeToPx(clip.startTime);
                  const clipWidth = Math.max(16, timeToPx(clip.duration));

                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectClip(track.id, clip.id);
                      }}
                      style={{
                        left: `${clipLeft}px`,
                        width: `${clipWidth}px`,
                      }}
                      className={`absolute h-10 rounded-lg border px-2.5 flex items-center justify-between cursor-pointer transition-shadow select-none group ${getClipColorClass(
                        clip.type,
                        isSelected
                      )}`}
                    >
                      {/* Left Trim Handle */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-white/40 rounded-l-lg" />

                      {/* Clip Title & Information */}
                      <div className="flex items-center space-x-1.5 overflow-hidden">
                        <span className="text-xs font-semibold truncate tracking-tight">{clip.name}</span>
                        {clip.speed !== 1.0 && (
                          <span className="text-[10px] font-mono opacity-80">{clip.speed}x</span>
                        )}
                      </div>

                      {/* Subtitle preview chips */}
                      {clip.type === 'subtitle' && clip.text && (
                        <span className="text-[10px] truncate max-w-[70%] opacity-90 font-mono italic">
                          "{clip.text}"
                        </span>
                      )}

                      {/* Audio waveform illustration for audio clips */}
                      {(clip.type === 'audio' || clip.type === 'sfx') && (
                        <div className="flex items-center space-x-0.5 opacity-60 h-4">
                          {[40, 70, 90, 60, 30, 85, 100, 45, 65, 80, 50, 95, 35].map((h, i) => (
                            <div
                              key={i}
                              className="w-0.5 bg-current rounded-full"
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Right Trim Handle */}
                      <div className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-white/40 rounded-r-lg" />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
