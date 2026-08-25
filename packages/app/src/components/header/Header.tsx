import React, { useState } from 'react';
import {
  Sliders,
  Download,
  Film,
  Zap,
  Layers,
  ChevronDown,
  RotateCcw,
  RotateCw,
  Check,
  Columns,
  Activity,
  Code2,
  Sparkles,
  Volume2,
  Palette,
  Scissors,
  Wand2,
  FileText,
} from 'lucide-react';
import { useTimelineStore, WorkspaceView } from '../../store/useTimelineStore';
import { AspectRatio, DirectorStyle, ASPECT_RATIO_DIMENSIONS } from '@legacy/core';

export const Header: React.FC = () => {
  const {
    project,
    setAspectRatio,
    workspace,
    setWorkspace,
    showDualViewer,
    setShowDualViewer,
    showScopes,
    setShowScopes,
    undo,
    redo,
    historyIndex,
    history,
    isExporting,
    exportProgress,
    exportVideo,
  } = useTimelineStore();

  const [showAspectMenu, setShowAspectMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const aspectRatios: AspectRatio[] = ['16:9', '9:16', '1:1', '2.39:1', '1.43:1'];
  const workspaces: Array<{ id: WorkspaceView; label: string; icon: React.ReactNode }> = [
    { id: 'edit', label: 'Edit', icon: <Scissors className="w-3.5 h-3.5" /> },
    { id: 'transcript', label: 'Text Edit', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'color', label: 'Color Studio', icon: <Palette className="w-3.5 h-3.5" /> },
    { id: 'audio', label: 'Fairlight Audio', icon: <Volume2 className="w-3.5 h-3.5" /> },
    { id: 'code', label: 'Remotion Code', icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: 'ai', label: 'AI Director', icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="h-12 bg-[#0d0e12] border-b border-white/[0.08] flex items-center justify-between px-3 z-40 relative select-none">
      {/* Left: App Identifier & Project Metadata */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold tracking-wider uppercase text-white font-mono">
            LEGACY
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 font-mono border border-white/[0.04]">
            PRO STUDIO
          </span>
        </div>

        <div className="h-3.5 w-px bg-white/10" />

        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-zinc-300">
            {project.title}
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            {project.settings.fps} FPS · {project.settings.colorSpace?.toUpperCase() || 'REC.709'}
          </span>
        </div>

        {/* History Controls */}
        <div className="flex items-center space-x-0.5 pl-1">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-1 rounded hover:bg-white/[0.08] disabled:opacity-20 text-zinc-400 hover:text-white transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-1 rounded hover:bg-white/[0.08] disabled:opacity-20 text-zinc-400 hover:text-white transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Center: NLE Workspaces */}
      <div className="flex items-center bg-[#14161d] p-0.5 rounded-lg border border-white/[0.06]">
        {workspaces.map((ws) => (
          <button
            key={ws.id}
            onClick={() => setWorkspace(ws.id)}
            className={`flex items-center space-x-1.5 px-3 py-1 text-[11px] font-medium rounded-md transition-all ${
              workspace === ws.id
                ? 'bg-white/[0.14] text-white shadow-sm border border-white/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            {ws.icon}
            <span>{ws.label}</span>
          </button>
        ))}
      </div>

      {/* Right: Format, Scopes, Dual Viewer & Export */}
      <div className="flex items-center space-x-2">
        {/* Dual Viewer Toggle */}
        <button
          onClick={() => setShowDualViewer(!showDualViewer)}
          className={`p-1.5 rounded-md border text-xs transition-colors ${
            showDualViewer
              ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
              : 'bg-white/[0.04] border-white/[0.06] text-zinc-400 hover:text-white'
          }`}
          title="Dual Source / Program Viewer"
        >
          <Columns className="w-3.5 h-3.5" />
        </button>

        {/* Scopes Toggle */}
        <button
          onClick={() => setShowScopes(!showScopes)}
          className={`p-1.5 rounded-md border text-xs transition-colors ${
            showScopes
              ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
              : 'bg-white/[0.04] border-white/[0.06] text-zinc-400 hover:text-white'
          }`}
          title="Video Scopes (Vectorscope, RGB Parade)"
        >
          <Activity className="w-3.5 h-3.5" />
        </button>

        {/* Aspect Ratio Menu */}
        <div className="relative">
          <button
            onClick={() => setShowAspectMenu(!showAspectMenu)}
            className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-medium rounded-md bg-[#14161d] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.06] transition-all"
          >
            <span>{project.settings.aspectRatio}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {showAspectMenu && (
            <div className="absolute top-full mt-1 right-0 w-48 bg-[#14161d] border border-white/10 rounded-xl shadow-2xl p-1 z-50">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => {
                    setAspectRatio(ratio);
                    setShowAspectMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    project.settings.aspectRatio === ratio
                      ? 'bg-blue-600/20 text-blue-400 font-medium'
                      : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span>{ASPECT_RATIO_DIMENSIONS[ratio].label}</span>
                  {project.settings.aspectRatio === ratio && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Master Export */}
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Master</span>
        </button>
      </div>

      {/* Export Dialog */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#12141a] border border-white/10 rounded-2xl p-6 w-[440px] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
                Render & Export Engine
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex justify-between py-1.5 border-b border-white/5 font-mono">
                <span className="text-zinc-400">Master Canvas</span>
                <span className="text-white">
                  {project.settings.width} × {project.settings.height} ({project.settings.aspectRatio})
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5 font-mono">
                <span className="text-zinc-400">Target Framerate</span>
                <span className="text-white">{project.settings.fps} FPS Progressive</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5 font-mono">
                <span className="text-zinc-400">Encoder Pipeline</span>
                <span className="text-white">FFmpeg 6.1 HWACCEL NVENC/VAAPI</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5 font-mono">
                <span className="text-zinc-400">Audio Channels</span>
                <span className="text-white">24-bit 48kHz Stereo PCM / AAC</span>
              </div>
            </div>

            {isExporting ? (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-zinc-300 font-mono">
                  <span>Multiplexing streams...</span>
                  <span>{exportProgress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-150"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex space-x-2 pt-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await exportVideo('high_quality');
                    setShowExportModal(false);
                  }}
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md transition-all"
                >
                  Queue Render
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
