import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Volume2,
  VolumeX,
  Grid,
  Bookmark,
  Crop,
} from 'lucide-react';
import { useTimelineStore } from '../../store/useTimelineStore';
import { formatTimecode, interpolateKeyframe } from '@legacy/core';
import { Scopes } from './Scopes';

export const Preview: React.FC = () => {
  const {
    project,
    currentTime,
    setCurrentTime,
    isPlaying,
    togglePlayPause,
    stepFrame,
    showDualViewer,
    showScopes,
    setInPoint,
    setOutPoint,
  } = useTimelineStore();

  const [showSafeGuides, setShowSafeGuides] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const mainVideoTrack = project.tracks.find((t) => t.type === 'video');
  const activeVideoClip = mainVideoTrack?.clips.find(
    (c) => currentTime >= c.startTime && currentTime <= c.startTime + c.duration
  );

  const subtitleTrack = project.tracks.find((t) => t.type === 'subtitle');
  const activeSubtitleClip = subtitleTrack?.clips.find(
    (c) => currentTime >= c.startTime && currentTime <= c.startTime + c.duration
  );

  const currentScale = activeVideoClip
    ? interpolateKeyframe(activeVideoClip, currentTime, 'scale', activeVideoClip.transform.scale)
    : 1.0;
  const currentOpacity = activeVideoClip ? activeVideoClip.transform.opacity : 1.0;
  const colorGrade = activeVideoClip?.colorGrade;

  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const loop = (now: number) => {
      if (isPlaying) {
        const delta = (now - lastTimestamp) / 1000;
        if (delta > 0) {
          const nextTime = currentTime + delta;
          if (nextTime >= project.duration) {
            setCurrentTime(0);
          } else {
            setCurrentTime(nextTime);
          }
        }
      }
      lastTimestamp = now;
      if (isPlaying) {
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(loop);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, currentTime, project.duration, setCurrentTime]);

  const getAspectRatioStyle = () => {
    switch (project.settings.aspectRatio) {
      case '9:16':
        return { aspectRatio: '9 / 16', maxHeight: '100%', maxWidth: '320px' };
      case '1:1':
        return { aspectRatio: '1 / 1', maxHeight: '100%', maxWidth: '420px' };
      case '2.39:1':
        return { aspectRatio: '2.39 / 1', width: '100%', maxHeight: '340px' };
      case '1.43:1':
        return { aspectRatio: '1.43 / 1', maxHeight: '100%', maxWidth: '540px' };
      case '16:9':
      default:
        return { aspectRatio: '16 / 9', width: '100%', maxHeight: '100%' };
    }
  };

  const getFilterStyle = () => {
    if (!colorGrade) return 'none';
    const brightness = 1 + colorGrade.brightness / 100;
    const contrast = 1 + colorGrade.contrast / 100;
    const saturate = 1 + colorGrade.saturation / 100;
    const hue = colorGrade.temperature * 0.8;
    return `brightness(${brightness}) contrast(${contrast}) saturate(${saturate}) hue-rotate(${hue}deg)`;
  };

  return (
    <div className="flex-1 bg-[#08090c] flex min-h-0 relative select-none">
      {/* Center Viewport Stage */}
      <div className="flex-1 flex flex-col items-center justify-between p-3 min-w-0 relative">
        {/* Top Viewport Header */}
        <div className="w-full flex items-center justify-between px-2 text-xs text-zinc-400">
          <div className="flex items-center space-x-2 font-mono">
            <span className="bg-[#12141a] px-2 py-0.5 rounded border border-white/5 text-zinc-300 text-[10px]">
              PROGRAM MONITOR · {project.settings.width} × {project.settings.height}
            </span>
            {project.inPoint !== undefined && (
              <span className="text-[10px] text-blue-400">
                IN: {formatTimecode(project.inPoint, project.settings.fps).slice(3, 8)}
              </span>
            )}
            {project.outPoint !== undefined && (
              <span className="text-[10px] text-blue-400">
                OUT: {formatTimecode(project.outPoint, project.settings.fps).slice(3, 8)}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setInPoint()}
              className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white"
              title="Mark In (I)"
            >
              Mark In (I)
            </button>
            <button
              onClick={() => setOutPoint()}
              className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white"
              title="Mark Out (O)"
            >
              Mark Out (O)
            </button>
            <button
              onClick={() => setShowSafeGuides(!showSafeGuides)}
              className={`p-1 rounded transition-colors ${
                showSafeGuides ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-white/5 text-zinc-400'
              }`}
              title="Safe Area Guides"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 rounded hover:bg-white/5 text-zinc-400"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Viewport Canvas (Supports Dual Viewer) */}
        <div className="flex-1 flex items-center justify-center w-full my-2 relative space-x-3 overflow-hidden">
          {/* Source Monitor (if Dual Viewer active) */}
          {showDualViewer && (
            <div className="flex-1 h-full flex flex-col items-center justify-center bg-black rounded-lg border border-white/10 p-2">
              <span className="text-[10px] font-mono text-zinc-500 mb-1">SOURCE MONITOR</span>
              <div className="w-full flex-1 bg-zinc-950 rounded flex items-center justify-center text-xs text-zinc-600">
                Source Media Clip
              </div>
            </div>
          )}

          {/* Program Master Monitor */}
          <div
            style={getAspectRatioStyle()}
            className="relative bg-black rounded-lg overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center transition-all duration-200"
          >
            {activeVideoClip ? (
              <div
                className="w-full h-full relative overflow-hidden flex items-center justify-center bg-zinc-900"
                style={{
                  transform: `scale(${currentScale}) rotate(${activeVideoClip.transform.rotation}deg)`,
                  opacity: currentOpacity,
                  filter: getFilterStyle(),
                  transition: 'transform 0.05s linear',
                }}
              >
                <video
                  ref={videoRef}
                  src={activeVideoClip.src}
                  className="w-full h-full object-cover"
                  muted={isMuted}
                  playsInline
                />

                {colorGrade?.filmGrain && colorGrade.filmGrain > 0 && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
                    style={{
                      backgroundImage: `radial-gradient(circle, #fff 10%, transparent 11%)`,
                      backgroundSize: '3px 3px',
                    }}
                  />
                )}

                {colorGrade?.vignette && colorGrade.vignette > 0 && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      boxShadow: `inset 0 0 ${colorGrade.vignette * 1.5}px rgba(0,0,0,0.85)`,
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="text-center p-4 text-zinc-600 text-xs font-mono">
                <span>NO SIGNAL AT PLAYHEAD</span>
              </div>
            )}

            {/* Subtitles Layer */}
            {activeSubtitleClip && activeSubtitleClip.text && (
              <div
                className="absolute left-0 right-0 px-4 flex justify-center text-center pointer-events-none z-20"
                style={{ top: `${activeSubtitleClip.captionStyle?.positionY || 80}%` }}
              >
                <div
                  className="px-3 py-1 rounded max-w-[90%] font-extrabold tracking-wide drop-shadow-md"
                  style={{
                    fontFamily: activeSubtitleClip.captionStyle?.fontFamily || 'Inter, sans-serif',
                    fontSize: `${activeSubtitleClip.captionStyle?.fontSize || 28}px`,
                    color: activeSubtitleClip.captionStyle?.textColor || '#FFFFFF',
                    backgroundColor: activeSubtitleClip.captionStyle?.backgroundColor || 'transparent',
                  }}
                >
                  {activeSubtitleClip.words && activeSubtitleClip.words.length > 0 ? (
                    activeSubtitleClip.words.map((w, idx) => {
                      const isHighlighted = currentTime >= w.start && currentTime <= w.end;
                      return (
                        <span
                          key={idx}
                          className="inline-block mx-1 transition-all duration-75"
                          style={{
                            color: isHighlighted
                              ? activeSubtitleClip.captionStyle?.highlightColor || '#FACC15'
                              : activeSubtitleClip.captionStyle?.textColor || '#FFFFFF',
                            transform: isHighlighted ? 'scale(1.12)' : 'scale(1.0)',
                          }}
                        >
                          {w.word}
                        </span>
                      );
                    })
                  ) : (
                    <span>{activeSubtitleClip.text}</span>
                  )}
                </div>
              </div>
            )}

            {/* Safe Guides */}
            {showSafeGuides && (
              <div className="absolute inset-0 pointer-events-none border border-cyan-500/20 m-[5%] rounded">
                <div className="absolute inset-0 border border-cyan-500/15 m-[5%] rounded" />
              </div>
            )}
          </div>
        </div>

        {/* Master Transport Bar */}
        <div className="bg-[#12141a] px-4 py-1.5 rounded-xl border border-white/10 shadow-lg flex items-center space-x-5 z-20">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => stepFrame('backward')}
              className="p-1 rounded hover:bg-white/[0.08] text-zinc-400 hover:text-white"
              title="Step -1 Frame"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={togglePlayPause}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
            </button>

            <button
              onClick={() => stepFrame('forward')}
              className="p-1 rounded hover:bg-white/[0.08] text-zinc-400 hover:text-white"
              title="Step +1 Frame"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-white font-semibold">
              {formatTimecode(currentTime, project.settings.fps)}
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400">
              {formatTimecode(project.duration, project.settings.fps)}
            </span>
          </div>
        </div>
      </div>

      {/* Video Scopes Sidebar (if active) */}
      {showScopes && <Scopes />}
    </div>
  );
};
