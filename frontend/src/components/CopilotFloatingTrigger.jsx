import React from 'react';
import { motion } from 'framer-motion';
import { useCopilot } from '../context/CopilotContext';

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
        onClick={() => openCopilot('match')}
        className="group flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-zinc-800 bg-[#0d0e14]/90 hover:bg-[#14151f] hover:border-amber-500/40 text-zinc-300 hover:text-white shadow-xl backdrop-blur-md transition-all duration-200 cursor-pointer"
        title="Open Maurik AI Portfolio Copilot (Press M)"
      >
        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
          </svg>
        </div>
        <span className="text-xs font-mono font-medium">Maurik AI</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-zinc-400">
          M
        </span>
      </button>
    </motion.div>
  );
}
