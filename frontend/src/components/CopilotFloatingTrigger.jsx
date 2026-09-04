import React from 'react';
import { motion } from 'framer-motion';
import { useCopilot } from '../context/CopilotContext';
import { trackEvent } from '../services/analytics';

export default function CopilotFloatingTrigger() {
  const { openCopilot, isOpen } = useCopilot();

  if (isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2"
    >
      <button
        type="button"
        onClick={() => {
          trackEvent('copilot_open', 'Floating Trigger');
          openCopilot('match');
        }}
        className="group flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-slate-300 dark:border-zinc-800 bg-white/95 dark:bg-[#0d0e14]/90 hover:bg-slate-100 dark:hover:bg-[#14151f] hover:border-amber-500/50 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white shadow-xl backdrop-blur-md transition-all duration-200 cursor-pointer"
        title="Open Maurik AI Portfolio Copilot (Press M)"
      >
        <div className="w-5 h-5 rounded bg-amber-500/10 dark:bg-zinc-800 border border-amber-500/30 dark:border-zinc-700 flex items-center justify-center font-mono text-[9px] font-bold text-amber-600 dark:text-amber-400">
          AI
        </div>
        <span className="text-xs font-mono font-medium">Maurik AI</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-500 group-hover:text-slate-800 dark:group-hover:text-zinc-400">
          M
        </span>
      </button>
    </motion.div>
  );
}
