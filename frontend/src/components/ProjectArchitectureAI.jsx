import React, { useState } from 'react';
import { copilotService } from '../services/copilotService';

export default function ProjectArchitectureAI({ project }) {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const defaultPrompts = [
    `Why was this tech stack chosen for ${project?.name || 'this project'}?`,
    'How does the system handle state management & data synchronization?',
    'What were the main performance bottlenecks and how were they solved?',
    'How would you scale this architecture if traffic increased 10x?',
  ];

  const handleAsk = async (textToAsk) => {
    const q = (textToAsk || question).trim();
    if (!q || loading) return;

    setQuestion('');
    setError('');
    setLoading(true);

    const userMessage = { role: 'user', content: q };
    setHistory((prev) => [...prev, userMessage]);

    try {
      const data = await copilotService.explainArchitecture(project.id, q);
      setHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          relatedTopics: data.relatedTopics || [],
        },
      ]);
    } catch (err) {
      setError(err.message || 'Failed to get architecture explanation.');
      setHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I encountered an issue analyzing the architecture: ${err.message || 'Please check if the backend is running.'}`,
          relatedTopics: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pt-1">
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-zinc-300 flex items-start gap-2.5">
        <span className="font-mono text-amber-400 text-xs font-bold shrink-0">[Arch]</span>
        <div className="space-y-0.5">
          <p className="font-semibold text-white">Grounded Architecture Explainer</p>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            Ask technical deep-dive questions about <strong className="text-zinc-200">{project?.name}</strong>. Answers are strictly grounded in verified engineering specs, data models, and actual production constraints.
          </p>
        </div>
      </div>

      {/* Suggested Question Chips */}
      {history.length === 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Suggested Questions</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {defaultPrompts.map((promptText, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAsk(promptText)}
                className="p-2.5 rounded-lg border border-zinc-800 bg-[#09090b]/80 hover:bg-zinc-800/80 hover:border-zinc-700 text-left text-xs font-mono text-zinc-300 hover:text-white transition-all flex items-center justify-between gap-2"
              >
                <span className="truncate">{promptText}</span>
                <span className="text-zinc-600 text-xs shrink-0">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Q&A Thread */}
      {history.length > 0 && (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[90%] rounded-xl p-3.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-zinc-800 text-zinc-200'
                    : 'bg-[#09090b] border border-zinc-800 text-zinc-300'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {msg.relatedTopics && msg.relatedTopics.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-mono text-zinc-500 self-center">Related:</span>
                    {msg.relatedTopics.map((topic, tidx) => (
                      <button
                        key={tidx}
                        type="button"
                        onClick={() => handleAsk(topic)}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#09090b] border border-zinc-800 text-xs font-mono text-zinc-400">
                <span className="w-3 h-3 border-2 border-zinc-600 border-t-amber-400 rounded-full animate-spin" />
                Analyzing project architecture with Gemini...
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 pt-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder={`Ask about ${project?.name} architecture (e.g. database indexing, auth, scaling)...`}
          className="flex-1 px-3.5 py-2.5 rounded-lg border border-zinc-800 bg-[#09090b] text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 font-mono"
        />
        <button
          type="button"
          onClick={() => handleAsk()}
          disabled={loading || !question.trim()}
          className="px-4 py-2.5 rounded-lg bg-white text-zinc-950 text-xs font-mono font-semibold hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          Ask
        </button>
      </div>

      {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
    </div>
  );
}
