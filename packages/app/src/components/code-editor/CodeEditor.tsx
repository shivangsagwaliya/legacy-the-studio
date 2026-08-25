import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal, Play } from 'lucide-react';
import { useTimelineStore } from '../../store/useTimelineStore';
import { generateRemotionCode } from '@legacy/core';

export const CodeEditor: React.FC = () => {
  const { project } = useTimelineStore();
  const [copied, setCopied] = useState(false);

  const code = generateRemotionCode(project);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 bg-studio-950 flex flex-col overflow-hidden relative font-mono select-text">
      {/* Code Editor Header */}
      <div className="h-10 bg-studio-900/80 backdrop-blur-xl border-b border-white/[0.08] px-4 flex items-center justify-between text-xs text-studio-300">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-apple-blue" />
          <span className="font-semibold text-white">Composition.tsx</span>
          <span className="text-[10px] text-studio-400 font-mono">Remotion Compatible</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-studio-300 hover:text-white border border-white/[0.06] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="flex-1 overflow-auto p-4 bg-[#0a0c10] text-studio-200 text-xs leading-relaxed">
        <pre className="font-mono">
          <code>{code}</code>
        </pre>
      </div>

      {/* Footer Info */}
      <div className="h-7 bg-studio-900/60 border-t border-white/[0.06] px-4 flex items-center justify-between text-[11px] text-studio-400 font-mono">
        <span>Render Target: React 18 / Remotion Engine</span>
        <span>{project.settings.fps} FPS · {project.settings.width}x{project.settings.height}</span>
      </div>
    </div>
  );
};
