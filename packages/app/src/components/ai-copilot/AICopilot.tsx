import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Zap,
  Film,
  Layers,
  Type,
  Scissors,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { useTimelineStore } from '../../store/useTimelineStore';

export const AICopilot: React.FC = () => {
  const { aiExecutePrompt } = useTimelineStore();
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: 'Legacy Autonomous Director initialized. Ready to execute multi-track edits, silence cuts, color grading recipes, or subtitle generation.',
    },
  ]);

  const quickActions = [
    { label: 'Cut Dead Air Pauses', icon: <Scissors className="w-3.5 h-3.5" />, prompt: 'Remove all pauses and silence' },
    { label: 'High Energy Retention Pacing', icon: <Zap className="w-3.5 h-3.5" />, prompt: 'Apply High Energy pacing with punch zooms and vibrant color' },
    { label: 'Nolan Cinematic Anamorphic Grade', icon: <Film className="w-3.5 h-3.5" />, prompt: 'Apply Christopher Nolan cinematic 2.39:1 aspect ratio and film grade' },
    { label: 'Tech Minimalist Profile', icon: <Layers className="w-3.5 h-3.5" />, prompt: 'Apply Tech Minimal modern clean typography and smooth glides' },
    { label: 'Synchronize Word Captions', icon: <Type className="w-3.5 h-3.5" />, prompt: 'Generate animated subtitles aligned with audio timestamps' },
  ];

  const handleSend = async (userPrompt: string) => {
    if (!userPrompt.trim() || isProcessing) return;

    setMessages((prev) => [...prev, { sender: 'user', text: userPrompt }]);
    setPrompt('');
    setIsProcessing(true);

    try {
      const response = await aiExecutePrompt(userPrompt);
      setMessages((prev) => [...prev, { sender: 'ai', text: response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Failed to process instruction.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 bg-[#090a0e] flex flex-col overflow-hidden select-none">
      {/* Header */}
      <div className="h-10 px-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0e1015]">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-white tracking-wide uppercase font-mono">
            Autonomous Editing Agent
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded">
          MCP RPC Protocol Active
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`p-3 rounded-xl max-w-[80%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white shadow-sm font-medium'
                  : 'bg-[#12141a] text-zinc-300 border border-white/[0.08] font-mono text-[11px]'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="p-3 rounded-xl bg-[#12141a] border border-white/[0.08] text-zinc-400 text-xs flex items-center space-x-2 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>Analyzing timeline tracks and executing tool calls...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Presets */}
      <div className="p-3 border-t border-white/[0.06] bg-[#0c0d11]">
        <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 px-1 block mb-2 font-semibold">
          Director Automated Recipes
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => handleSend(action.prompt)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#14161d] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.06] text-xs transition-colors"
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/[0.08] bg-[#101218]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(prompt);
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Instruct AI director (e.g. Cut dead air, apply Nolan 2.39:1 grade)..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 bg-[#14161d] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isProcessing}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
