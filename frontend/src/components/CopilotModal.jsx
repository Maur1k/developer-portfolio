import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCopilot } from '../context/CopilotContext';
import { copilotService } from '../services/copilotService';

// ── Score Ring ────────────────────────────────────────────
function ScoreRing({ score }) {
  const radius = 36;
  const stroke = 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444';

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width="88" height="88" className="-rotate-90">
        <circle cx="44" cy="44" r={radius} fill="none" stroke="#27272a" strokeWidth={stroke} />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-xl font-bold text-white font-mono">{score}%</span>
    </div>
  );
}

// ── Sample JD Chips ──────────────────────────────────────
const sampleJDs = [
  { label: 'Full Stack React/Node', jd: 'Junior Full Stack Developer — React, Node.js, REST APIs, MySQL, remote. Experience with mobile development is a plus.' },
  { label: 'Flutter Mobile Dev', jd: 'Mobile Developer — Flutter, Dart, iOS, Android, Firebase, push notifications, REST APIs. Production app experience required.' },
  { label: 'Laravel PHP Dev', jd: 'PHP Developer — Laravel, MySQL, REST APIs, Tailwind CSS, JavaScript. Experience with admin dashboards and CRUD systems.' },
];

// ── Explore Mode Suggestion Chips ────────────────────────
const exploreSuggestions = [
  'Show me projects using React',
  'What mobile experience does Maurik have?',
  'Find evidence of REST API experience',
  'Show me the tech stack',
  'Tell me about his work at When in Baguio',
  'Does Maurik have payment integration experience?',
];

// ── Main Modal Component ─────────────────────────────────
export default function CopilotModal() {
  const { isOpen, closeCopilot, activeTab, setActiveTab, executeAction } = useCopilot();
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') closeCopilot();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, closeCopilot]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm"
          onClick={closeCopilot}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[88vh] rounded-xl border border-zinc-800 bg-[#0b0c10] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-3.5 bg-[#09090b] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded border border-zinc-700 bg-zinc-800 flex items-center justify-center font-mono text-[10px] font-bold text-amber-400">
                  AI
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Maurik AI</h3>
                  <p className="text-[10px] text-zinc-500 font-mono">Portfolio Copilot</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCopilot}
                className="text-xs font-mono text-zinc-500 hover:text-white transition p-1"
              >
                ESC
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-zinc-800/60 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('match')}
                className={`flex-1 px-4 py-2.5 text-xs font-mono font-medium transition-colors ${
                  activeTab === 'match'
                    ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-400/5'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Recruiter Match
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('explore')}
                className={`flex-1 px-4 py-2.5 text-xs font-mono font-medium transition-colors ${
                  activeTab === 'explore'
                    ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-400/5'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Ask Maurik
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'match' ? (
                <MatchTab executeAction={executeAction} closeCopilot={closeCopilot} />
              ) : (
                <ExploreTab executeAction={executeAction} closeCopilot={closeCopilot} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═════════════════════════════════════════════════════════
// MATCH TAB — Recruiter Job Description Evaluator
// ═════════════════════════════════════════════════════════
function MatchTab({ executeAction, closeCopilot }) {
  const [jdText, setJdText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeJD = async () => {
    if (!jdText.trim() || jdText.trim().length < 10) {
      setError('Please enter a job description (at least 10 characters).');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const data = await copilotService.matchJobDescription(jdText.trim());
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleViewEvidence = (projectId) => {
    closeCopilot();
    setTimeout(() => {
      executeAction({ type: 'OPEN_PROJECT', target: projectId });
    }, 300);
  };

  // Input view
  if (!result) {
    return (
      <div className="p-5 space-y-4">
        <div>
          <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
            Paste a Job Description below. Maurik AI will analyze it against verified production experience, cite specific projects as evidence, and identify any gaps.
          </p>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste a job description here... (e.g. Junior Full Stack Developer — React, Node.js, REST APIs, PostgreSQL, remote)"
            className="w-full h-28 px-3.5 py-3 rounded-lg border border-zinc-800 bg-[#0d0e12] text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-600 font-mono"
          />
        </div>

        {/* Sample JD Chips */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] text-zinc-600 font-mono mr-1 self-center">Try:</span>
          {sampleJDs.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setJdText(s.jd)}
              className="px-2.5 py-1 rounded-md border border-zinc-800 bg-zinc-900/60 text-[11px] font-mono text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-red-400 font-mono">{error}</p>}

        <button
          type="button"
          onClick={analyzeJD}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-white text-zinc-950 font-mono text-xs font-semibold hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
              <span>Analyzing with Gemini...</span>
            </>
          ) : (
            <span>Analyze Match</span>
          )}
        </button>
      </div>
    );
  }

  // Results view
  return (
    <div className="p-5 space-y-5">
      {/* Score + Headline */}
      <div className="flex items-center gap-4">
        <ScoreRing score={result.matchScore || 0} />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">Job Match</p>
          <p className="text-sm text-zinc-200 leading-relaxed">{result.headline}</p>
        </div>
      </div>

      {/* Strong Matches */}
      {result.strongMatches && result.strongMatches.length > 0 && (
        <div>
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Strong Matches
          </h4>
          <div className="space-y-1.5">
            {result.strongMatches.map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">+</span>
                <div className="min-w-0">
                  <span className="font-semibold text-white">{m.skill}</span>
                  <span className="text-zinc-500 mx-1">—</span>
                  <span className="text-zinc-400">{m.evidence}</span>
                  {m.confidence && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono ${
                      m.confidence === 'production' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      m.confidence === 'academic' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}>
                      {m.confidence}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Gaps */}
      {result.gaps && result.gaps.length > 0 && (
        <div>
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Skill Gaps
          </h4>
          <div className="space-y-2">
            {result.gaps.map((g, i) => (
              <div key={i} className="p-2.5 rounded-lg border border-zinc-800/60 bg-zinc-900/30 text-xs">
                <span className="font-semibold text-amber-300">{g.skill}</span>
                <p className="text-zinc-400 mt-0.5">{g.assessment}</p>
                {g.transferability && (
                  <p className="text-zinc-500 mt-1 italic text-[11px]">↳ {g.transferability}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relevant Projects with View Evidence */}
      {result.relevantProjects && result.relevantProjects.length > 0 && (
        <div>
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">Relevant Projects</h4>
          <div className="space-y-1.5">
            {result.relevantProjects.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-800/60 bg-zinc-900/30">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                  <p className="text-[11px] text-zinc-500 truncate">{p.relevance}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleViewEvidence(p.projectId)}
                  className="shrink-0 px-2.5 py-1 rounded-md border border-zinc-700 bg-zinc-800 text-[10px] font-mono text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors ml-2 cursor-pointer"
                >
                  View Evidence ↗
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transferability */}
      {result.transferability && (
        <div className="p-3 rounded-lg border border-zinc-800/60 bg-zinc-900/20">
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">Transferability</h4>
          <p className="text-xs text-zinc-300 leading-relaxed">{result.transferability}</p>
        </div>
      )}

      {/* Recommendation */}
      {result.recommendation && (
        <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
          <p className="text-xs text-zinc-200 leading-relaxed">{result.recommendation}</p>
        </div>
      )}

      {/* Reset */}
      <button
        type="button"
        onClick={() => { setResult(null); setJdText(''); }}
        className="w-full py-2 rounded-lg border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
      >
        ← Analyze Another JD
      </button>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// EXPLORE TAB — Ask Maurik / Natural Language Chat
// ═════════════════════════════════════════════════════════
function ExploreTab({ executeAction, closeCopilot }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const data = await copilotService.chat(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          actions: data.actions || [],
          followUps: data.suggestedFollowUps || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Sorry, I couldn't process that. ${err.message || 'Is the backend running?'}`, actions: [], followUps: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action) => {
    closeCopilot();
    setTimeout(() => executeAction(action), 300);
  };

  const getActionLabel = (action) => {
    switch (action.type) {
      case 'OPEN_PROJECT':
        return `[Project: ${action.target}]`;
      case 'SCROLL_TO':
        return `[Section: ${action.target}]`;
      case 'HIGHLIGHT_SKILLS':
        return `[Skills: ${action.highlightTags ? action.highlightTags.join(', ') : action.target}]`;
      case 'OPEN_RESUME':
        return '[View Resume]';
      default:
        return action.target || 'Navigate';
    }
  };

  return (
    <div className="flex flex-col h-[55vh]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-xs text-zinc-500 leading-relaxed">
              Ask Maurik AI about technical experience, architecture, skills, and projects.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {exploreSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-[11px] font-mono text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-zinc-800 text-zinc-200'
                : 'bg-[#0d0e14] border border-zinc-800/60 text-zinc-300'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Action buttons from AI */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-zinc-800/40">
                  {msg.actions.map((action, j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => handleAction(action)}
                      className="px-2 py-1 rounded-md border border-zinc-700 bg-zinc-800 text-[10px] font-mono text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                      {getActionLabel(action)} ↗
                    </button>
                  ))}
                </div>
              )}

              {/* Follow-up suggestions */}
              {msg.followUps && msg.followUps.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-zinc-800/40">
                  {msg.followUps.map((q, j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => sendMessage(q)}
                      className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-500 hover:text-zinc-300 bg-zinc-900/60 hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#0d0e14] border border-zinc-800/60">
              <span className="w-3 h-3 border-2 border-zinc-600 border-t-amber-400 rounded-full animate-spin" />
              <span className="text-[11px] text-zinc-500 font-mono">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800/60 p-3 shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask Maurik anything..."
            className="flex-1 px-3.5 py-2 rounded-lg border border-zinc-800 bg-[#0d0e12] text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 font-mono"
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="px-3.5 py-2 rounded-lg bg-white text-zinc-950 text-xs font-mono font-semibold hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
