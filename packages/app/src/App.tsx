import React from 'react';
import { Header } from './components/header/Header';
import { Preview } from './components/preview/Preview';
import { Timeline } from './components/timeline/Timeline';
import { Inspector } from './components/inspector/Inspector';
import { MediaBin } from './components/media-bin/MediaBin';
import { CodeEditor } from './components/code-editor/CodeEditor';
import { AICopilot } from './components/ai-copilot/AICopilot';
import { TranscriptEditor } from './components/transcript-editor/TranscriptEditor';
import { useTimelineStore } from './store/useTimelineStore';

export const App: React.FC = () => {
  const { workspace } = useTimelineStore();

  return (
    <div className="h-screen w-screen flex flex-col bg-[#08090c] text-zinc-100 overflow-hidden font-sans select-none">
      {/* Studio Header */}
      <Header />

      {/* Main Workspace Layout */}
      {workspace === 'code' ? (
        <div className="flex-1 flex min-h-0 relative">
          <MediaBin />
          <CodeEditor />
          <div className="w-[480px] flex flex-col border-l border-white/[0.08]">
            <Preview />
          </div>
        </div>
      ) : workspace === 'transcript' ? (
        <div className="flex-1 flex flex-col min-h-0 relative">
          <div className="flex-1 flex min-h-0">
            <MediaBin />
            <TranscriptEditor />
            <div className="w-[450px] flex flex-col border-l border-white/[0.08]">
              <Preview />
            </div>
          </div>
          <Timeline />
        </div>
      ) : workspace === 'ai' ? (
        <div className="flex-1 flex flex-col min-h-0 relative">
          <div className="flex-1 flex min-h-0">
            <MediaBin />
            <AICopilot />
            <div className="w-[450px] flex flex-col border-l border-white/[0.08]">
              <Preview />
            </div>
          </div>
          <Timeline />
        </div>
      ) : (
        /* Edit / Color / Audio / Effects Workspaces */
        <div className="flex-1 flex flex-col min-h-0 relative">
          <div className="flex-1 flex min-h-0">
            <MediaBin />
            <Preview />
            <Inspector />
          </div>
          <Timeline />
        </div>
      )}
    </div>
  );
};
