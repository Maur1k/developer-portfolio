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
        <div className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono text-[9px] font-bold text-amber-400">
          AI
        </div>
        <span className="text-xs font-mono font-medium">Maurik AI</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-zinc-400">
          M
        </span>
      </button>
    </motion.div>
  );
}
