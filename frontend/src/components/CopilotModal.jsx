import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCopilot } from '../context/CopilotContext';
import { copilotService } from '../services/copilotService';

// ── Lightweight Markdown Renderer ─────────────────────────
function FormattedMessage({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBlockContent = [];
  let codeBlockLang = '';

  const formatInline = (str) => {
    // Regex tokenize bold (**bold**), inline code (`code`), and plain text
    const parts = [];
    const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let lastIdx = 0;
    let match;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIdx) {
        parts.push(str.substring(lastIdx, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={`b-${match.index}`} className="font-semibold text-slate-900 dark:text-white">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code
            key={`c-${match.index}`}
            className="bg-amber-500/10 dark:bg-zinc-800/90 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded font-mono text-[11px] border border-amber-500/20 dark:border-zinc-700/60"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      lastIdx = regex.lastIndex;
    }

    if (lastIdx < str.length) {
      parts.push(str.substring(lastIdx));
    }

    return parts.length > 0 ? parts : str;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Code block toggle
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`cb-${idx}`}
            className="bg-slate-100 dark:bg-[#08090d] border border-slate-200 dark:border-zinc-800/90 p-2.5 rounded-md font-mono text-[11px] text-amber-800 dark:text-amber-300 overflow-x-auto my-1.5 leading-relaxed"
          >
            <code>{codeBlockContent.join('\n')}</code>
          </pre>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }

    // Empty line
    if (!trimmed) {
      elements.push(<div key={`sp-${idx}`} className="h-1.5" />);
      return;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h3-${idx}`} className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-2 mb-1 uppercase tracking-wider font-mono">
          {formatInline(trimmed.slice(4))}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h2-${idx}`} className="text-xs font-bold text-slate-900 dark:text-white mt-2.5 mb-1 font-mono">
          {formatInline(trimmed.slice(3))}
        </h3>
      );
      return;
    }

    // Unordered list item (- or *)
    if (/^[-*]\s+/.test(trimmed)) {
      elements.push(
        <div key={`li-${idx}`} className="flex items-start gap-1.5 my-0.5 text-slate-700 dark:text-zinc-300">
          <span className="text-amber-500 dark:text-amber-400 font-bold shrink-0 mt-0.5">•</span>
          <span className="flex-1 min-w-0">{formatInline(trimmed.replace(/^[-*]\s+/, ''))}</span>
        </div>
      );
      return;
    }

    // Numbered list item (e.g. 1. )
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={`nli-${idx}`} className="flex items-start gap-1.5 my-0.5 text-slate-700 dark:text-zinc-300">
          <span className="text-amber-600 dark:text-amber-400 font-mono text-[11px] shrink-0 font-semibold">{numMatch[1]}.</span>
          <span className="flex-1 min-w-0">{formatInline(numMatch[2])}</span>
        </div>
      );
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${idx}`} className="my-0.5 leading-relaxed text-slate-700 dark:text-zinc-300">
        {formatInline(line)}
      </p>
    );
  });

  // Flush trailing code block if any
  if (inCodeBlock && codeBlockContent.length > 0) {
    elements.push(
      <pre
        key="cb-tail"
        className="bg-slate-100 dark:bg-[#08090d] border border-slate-200 dark:border-zinc-800/90 p-2.5 rounded-md font-mono text-[11px] text-amber-800 dark:text-amber-300 overflow-x-auto my-1.5 leading-relaxed"
      >
        <code>{codeBlockContent.join('\n')}</code>
      </pre>
    );
  }

  return <div className="space-y-0.5 text-xs">{elements}</div>;
}

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
        <circle cx="44" cy="44" r={radius} fill="none" className="stroke-slate-200 dark:stroke-zinc-800" strokeWidth={stroke} />
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
      <span className="absolute text-xl font-bold text-slate-900 dark:text-white font-mono">{score}%</span>
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
  'What mobile experience does Maurik have?',
  'Does Maurik have backend experience?',
  'Show me projects using React 19',
  'Tell me about his work at When in Baguio',
  'Does Maurik have Stripe experience?',
  'What database optimizations has he done?',
];

// ── Project ID to Human Readable Name Mapping ─────────────
const PROJECT_NAMES = {
  'backops-wib': 'When in Baguio Operations',
  'wibav3': 'When in Baguio Eats Mobile',
  'click2serve': 'CLICK2SERVE Kiosk',
  'client-project-tracker': 'ProjeX SaaS',
};

const SECTION_NAMES = {
  about: 'About Section',
  experience: 'Experience Section',
  projects: 'Projects Section',
  skills: 'Tech Stack',
  contact: 'Contact Info',
};

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
            className="w-full max-w-2xl max-h-[88vh] rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0b0c10] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 px-5 py-3.5 bg-slate-50 dark:bg-[#09090b] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded border border-amber-500/30 dark:border-zinc-700 bg-amber-500/10 dark:bg-zinc-800 flex items-center justify-center font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  AI
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Maurik AI</h3>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono">Portfolio Copilot & Technical Representative</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCopilot}
                className="text-xs font-mono text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition p-1 cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-slate-200 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-transparent shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('explore')}
                className={`flex-1 px-4 py-2.5 text-xs font-mono font-medium transition-colors ${
                  activeTab === 'explore'
                    ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400 bg-amber-500/10 dark:bg-amber-400/5 font-semibold'
                    : 'text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300'
                }`}
              >
                Ask Maurik
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('match')}
                className={`flex-1 px-4 py-2.5 text-xs font-mono font-medium transition-colors ${
                  activeTab === 'match'
                    ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400 bg-amber-500/10 dark:bg-amber-400/5 font-semibold'
                    : 'text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300'
                }`}
              >
                Recruiter Match
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
  const [copiedSummary, setCopiedSummary] = useState(false);

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
      setError(err.message || 'Failed to analyze job description.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!result) return;
    const summary = `Candidate Evaluation: Maurik Angelo L. Fernandez
Match Score: ${result.matchScore}%
Fit Summary: ${result.headline}

Key Verified Matches:
${(result.strongMatches || []).map((m) => `- ${m.skill}: ${m.evidence}`).join('\n')}

${result.transferableSkills && result.transferableSkills.length > 0 ? `Transferable Skills:\n${result.transferableSkills.map((t) => `- ${t.skill}: ${t.bridge}`).join('\n')}\n` : ''}
${result.gaps && result.gaps.length > 0 ? `Identified Gaps:\n${result.gaps.map((g) => `- ${g.skill}: ${g.assessment}`).join('\n')}\n` : ''}
Recommendation: ${result.recommendation || 'Strong candidate for full-stack web and mobile engineering.'}`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
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
          <p className="text-xs text-slate-600 dark:text-zinc-400 mb-3 leading-relaxed">
            Paste a Job Description below. Maurik AI will evaluate it against verified production experience, identify transferable capabilities, cite projects as evidence, and distinguish any gaps.
          </p>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste a job description here... (e.g. Full Stack Developer — React, Node.js, REST APIs, MySQL, remote)"
            className="w-full h-28 px-3.5 py-3 rounded-lg border border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-[#0d0e12] text-sm text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-600 resize-none focus:outline-none focus:border-amber-500 dark:focus:border-zinc-600 font-mono"
          />
        </div>

        {/* Sample JD Chips */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] text-slate-500 dark:text-zinc-600 font-mono mr-1 self-center">Try Sample JD:</span>
          {sampleJDs.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setJdText(s.jd)}
              className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900/60 text-[11px] font-mono text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
            >
              {s.label}
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-red-500 dark:text-red-400 font-mono">{error}</p>}

        <button
          type="button"
          onClick={analyzeJD}
          disabled={loading}
          className="w-full py-2.5 rounded-lg border border-amber-600/30 dark:border-transparent bg-amber-500 hover:bg-amber-600 dark:bg-white text-white dark:text-zinc-950 font-mono text-xs font-semibold dark:hover:bg-zinc-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/60 dark:border-zinc-400 border-t-white dark:border-t-zinc-900 rounded-full animate-spin" />
              <span>Analyzing against portfolio evidence...</span>
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
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-500 mb-1">Portfolio Evaluation</p>
          <p className="text-sm text-slate-800 dark:text-zinc-200 leading-relaxed font-medium">{result.headline}</p>
        </div>
      </div>

      {/* Strong Matches */}
      {result.strongMatches && result.strongMatches.length > 0 && (
        <div>
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            Strong Matches
          </h4>
          <div className="space-y-1.5">
            {result.strongMatches.map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-xs bg-slate-50 dark:bg-zinc-900/40 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800/60">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-900 dark:text-white">{m.skill}</span>
                    {m.confidence && (
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
                        m.confidence === 'production' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                        m.confidence === 'academic' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                        'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700'
                      }`}>
                        {m.confidence}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400 mt-0.5 text-[11px]">{m.evidence}</p>
                </div>
                {m.projectId && (
                  <button
                    type="button"
                    onClick={() => handleViewEvidence(m.projectId)}
                    className="shrink-0 px-2 py-1 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[10px] font-mono text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-700 transition cursor-pointer"
                  >
                    View ↗
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transferable Skills */}
      {result.transferableSkills && result.transferableSkills.length > 0 && (
        <div>
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400" />
            Transferable Skills
          </h4>
          <div className="space-y-1.5">
            {result.transferableSkills.map((t, i) => (
              <div key={i} className="p-2.5 rounded-lg border border-sky-500/20 bg-sky-500/5 text-xs">
                <span className="font-semibold text-sky-700 dark:text-sky-300 font-mono">{t.skill}</span>
                <p className="text-slate-600 dark:text-zinc-400 mt-0.5 text-[11px]">{t.bridge}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Gaps */}
      {result.gaps && result.gaps.length > 0 && (
        <div>
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
            Skill Gaps (Not in Production)
          </h4>
          <div className="space-y-1.5">
            {result.gaps.map((g, i) => (
              <div key={i} className="p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800/60 bg-slate-50 dark:bg-zinc-900/30 text-xs">
                <span className="font-semibold text-amber-700 dark:text-amber-300">{g.skill}</span>
                <p className="text-slate-600 dark:text-zinc-400 mt-0.5 text-[11px]">{g.assessment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relevant Projects */}
      {result.relevantProjects && result.relevantProjects.length > 0 && (
        <div>
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Best Evidence Projects</h4>
          <div className="space-y-1.5">
            {result.relevantProjects.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800/60 bg-slate-50 dark:bg-zinc-900/30">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{p.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-500 truncate">{p.relevance}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleViewEvidence(p.projectId)}
                  className="shrink-0 px-2.5 py-1 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[10px] font-mono text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors ml-2 cursor-pointer"
                >
                  View Evidence ↗
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      {result.recommendation && (
        <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">Recommendation</h4>
          <p className="text-xs text-slate-700 dark:text-zinc-200 leading-relaxed">{result.recommendation}</p>
        </div>
      )}

      {/* Actions: Copy Summary & Reset */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleCopySummary}
          className="flex-1 py-2.5 rounded-lg border border-amber-600/30 dark:border-zinc-700 bg-amber-500 hover:bg-amber-600 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-xs font-mono text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm font-medium"
        >
          <span>{copiedSummary ? 'Copied to Clipboard!' : 'Copy Summary for Hiring Manager'}</span>
        </button>

        <button
          type="button"
          onClick={() => { setResult(null); setJdText(''); }}
          className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-zinc-800 bg-transparent text-xs font-mono text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition cursor-pointer shrink-0"
        >
          ← Reset
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// EXPLORE TAB — Multi-Turn Conversational Copilot
// ═════════════════════════════════════════════════════════
function ExploreTab({ executeAction, closeCopilot }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMessage = { role: 'user', content: msg };
    const currentMessages = [...messages, userMessage];

    setInput('');
    setMessages(currentMessages);
    setLoading(true);

    try {
      // Pass full conversation history for multi-turn context
      const data = await copilotService.chat(msg, currentMessages);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message || 'No response generated.',
          evidence: data.evidence || [],
          confidence: data.confidence || 'confirmed',
          actions: data.actions || [],
          followUps: data.suggestedFollowUps || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Maurik AI is temporarily unable to reach the inference service (${err.message || 'connection issue'}). You can continue exploring using the suggestions below.`,
          evidence: [],
          confidence: 'missing',
          actions: [{ type: 'SCROLL_TO', target: 'projects' }],
          followUps: ['What mobile experience does Maurik have?', 'Show me projects using React'],
        },
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
        return `View ${PROJECT_NAMES[action.target] || action.target}`;
      case 'SCROLL_TO':
        return `Jump to ${SECTION_NAMES[action.target] || action.target}`;
      case 'HIGHLIGHT_SKILLS':
        return `Highlight ${action.highlightTags && action.highlightTags[0] ? action.highlightTags[0] : 'Skills'}`;
      case 'OPEN_RESUME':
        return 'View Resume';
      default:
        return action.target || 'Explore';
    }
  };

  return (
    <div className="flex flex-col h-[55vh]">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Ask Maurik AI anything about technical experience, system architecture, verified production evidence, or skill transferability.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {exploreSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900/40 text-[11px] font-mono text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors text-left cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[88%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-amber-500/10 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border border-amber-500/20 dark:border-transparent font-medium'
                  : 'bg-slate-50 dark:bg-[#0d0e14] border border-slate-200 dark:border-zinc-800/80 text-slate-700 dark:text-zinc-300 shadow-xs'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <>
                  <FormattedMessage text={msg.content} />

                  {/* Evidence Cards */}
                  {msg.evidence && msg.evidence.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-zinc-800/60 space-y-1.5">
                      <p className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Verified Evidence:</p>
                      {msg.evidence.map((ev, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/60 shadow-xs text-[11px]"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-slate-900 dark:text-white">{ev.projectName || ev.projectId}</span>
                            <span className="text-slate-600 dark:text-zinc-400 block truncate">{ev.highlight}</span>
                          </div>
                          {ev.projectId && (
                            <button
                              type="button"
                              onClick={() => handleAction({ type: 'OPEN_PROJECT', target: ev.projectId })}
                              className="shrink-0 px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[10px] font-mono text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 ml-2 transition cursor-pointer"
                            >
                              Inspect ↗
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* UI Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-slate-200 dark:border-zinc-800/40">
                      {msg.actions.map((action, j) => (
                        <button
                          key={j}
                          type="button"
                          onClick={() => handleAction(action)}
                          className="px-2.5 py-1 rounded-md border border-amber-500/30 dark:border-zinc-700 bg-amber-500/10 dark:bg-zinc-800 text-[11px] font-mono text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-white hover:bg-amber-500/20 dark:hover:bg-zinc-700 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>{getActionLabel(action)}</span>
                          <span className="text-amber-600/70 dark:text-zinc-500">↗</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Dynamic Follow-up Suggestions */}
                  {msg.followUps && msg.followUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-200 dark:border-zinc-800/40">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 self-center mr-1">Suggested:</span>
                      {msg.followUps.map((q, j) => (
                        <button
                          key={j}
                          type="button"
                          onClick={() => sendMessage(q)}
                          className="px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors cursor-pointer text-left"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0d0e14] border border-slate-200 dark:border-zinc-800/60">
              <span className="w-3 h-3 border-2 border-slate-300 dark:border-zinc-600 border-t-amber-500 dark:border-t-amber-400 rounded-full animate-spin" />
              <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-mono">Synthesizing verified portfolio evidence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-slate-200 dark:border-zinc-800/60 p-3 shrink-0 bg-slate-50 dark:bg-[#09090b]">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask Maurik anything about projects, stack, or evidence..."
            className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-[#0d0e12] text-xs text-slate-900 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 dark:focus:border-zinc-600 font-mono"
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-lg border border-amber-600/30 dark:border-transparent bg-amber-500 hover:bg-amber-600 dark:bg-white text-white dark:text-zinc-950 text-xs font-mono font-semibold dark:hover:bg-zinc-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

