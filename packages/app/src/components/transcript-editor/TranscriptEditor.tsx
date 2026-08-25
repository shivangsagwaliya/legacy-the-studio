import React, { useState } from 'react';
import { Type, Trash2, Search, Sparkles, Play, CheckCircle2 } from 'lucide-react';
import { useTimelineStore } from '../../store/useTimelineStore';
import { extractProjectTranscript, editTimelineByDeletingWords, TranscriptWordRef } from '@legacy/core';

export const TranscriptEditor: React.FC = () => {
  const { project, currentTime, setCurrentTime, pushHistory } = useTimelineStore();
  const [selectedWordIndices, setSelectedWordIndices] = useState<number[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  const words = extractProjectTranscript(project);

  const toggleWordSelection = (index: number) => {
    setSelectedWordIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSeekWord = (time: number) => {
    setCurrentTime(time);
  };

  const handleDeleteSelected = () => {
    if (selectedWordIndices.length === 0) return;

    const intervalsToDelete = selectedWordIndices.map((idx) => ({
      start: words[idx].start,
      end: words[idx].end,
    }));

    const updatedProject = editTimelineByDeletingWords(project, intervalsToDelete);
    pushHistory(updatedProject);
    setSelectedWordIndices([]);
  };

  return (
    <div className="flex-1 bg-[#090a0e] flex flex-col overflow-hidden select-none">
      {/* Header */}
      <div className="h-10 px-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0e1015]">
        <div className="flex items-center space-x-2">
          <Type className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-white uppercase font-mono tracking-wide">
            Text-Based Video Editing Studio
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">
            {words.length} Words Diarized
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {selectedWordIndices.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete {selectedWordIndices.length} Words & Ripple Cut</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-white/[0.06] bg-[#0c0d11]">
        <div className="relative max-w-md">
          <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search transcript phrases to jump or cut..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-[#14161d] border border-white/10 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Transcript Text Flow */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {words.length > 0 ? (
          <div className="p-4 rounded-xl bg-[#101218] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold">
                Speaker 1 (Primary Voice)
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Select words to delete speech and automatically cut video footage
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 leading-relaxed">
              {words.map((w, idx) => {
                const isSelected = selectedWordIndices.includes(idx);
                const isCurrent = currentTime >= w.start && currentTime <= w.end;
                const matchesSearch = searchFilter && w.word.toLowerCase().includes(searchFilter.toLowerCase());

                return (
                  <span
                    key={idx}
                    onClick={() => toggleWordSelection(idx)}
                    onDoubleClick={() => handleSeekWord(w.start)}
                    className={`px-2 py-1 rounded text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-red-500/30 text-red-200 line-through border border-red-500/40'
                        : isCurrent
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : matchesSearch
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08] hover:text-white border border-white/[0.04]'
                    }`}
                    title="Click to select for deletion, double click to jump playhead"
                  >
                    {w.word}
                  </span>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center p-8 text-zinc-500 text-xs font-mono">
            <span>NO TRANSCRIPT DETECTED. CLICK GENERATE SUBTITLES OR TRANSCRIBE.</span>
          </div>
        )}
      </div>
    </div>
  );
};
