import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { trackEvent } from '../services/analytics';

export default function ThemeToggle({ variant = 'icon', className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  const handleToggle = () => {
    trackEvent('theme_toggle', isDark ? 'Switch to Light' : 'Switch to Dark');
    toggleTheme();
  };

  // Sun Icon (Rendered in Dark Mode to prompt user: "Switch to Light Mode")
  const SunIcon = ({ className = 'w-4 h-4' }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );

  // Moon Icon (Rendered in Light Mode to prompt user: "Switch to Dark Mode")
  const MoonIcon = ({ className = 'w-4 h-4' }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );

  if (variant === 'badge') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`key-badge hover:text-zinc-900 dark:hover:text-zinc-200 transition-all cursor-pointer group flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-300 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/60 hover:bg-zinc-200 dark:hover:bg-zinc-850 ${className}`}
        title={isDark ? 'Switch to Light Mode (Press T)' : 'Switch to Dark Mode (Press T)'}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        <motion.div
          key={isDark ? 'dark-badge-icon' : 'light-badge-icon'}
          initial={{ rotate: -30, opacity: 0, scale: 0.8 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 30, opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="text-amber-500 dark:text-amber-400 shrink-0"
        >
          {isDark ? <SunIcon className="w-3.5 h-3.5" /> : <MoonIcon className="w-3.5 h-3.5" />}
        </motion.div>
        <span className="text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 text-[11px] font-mono select-none">
          {isDark ? 'light' : 'dark'}
        </span>
        <kbd className="keycap group-hover:bg-zinc-300 dark:group-hover:bg-zinc-800 group-hover:text-zinc-900 dark:group-hover:text-white">
          T
        </kbd>
      </button>
    );
  }

  // Default 'icon' variant for Sidebar, Navigation bar, or custom placement
  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode (Press T)' : 'Switch to Dark Mode (Press T)'}
      className={`p-2 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#121318] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center shadow-sm ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? 'sun' : 'moon'}
          initial={{ scale: 0.6, rotate: -60, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.6, rotate: 60, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="text-amber-500 dark:text-amber-400"
        >
          {isDark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
