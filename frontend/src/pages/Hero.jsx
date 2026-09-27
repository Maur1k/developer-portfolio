import React from 'react';
import { motion } from 'framer-motion';
import { useDocumentData } from '../hooks/useFirestoreData';
import { fallbackProfile } from '../data/fallbackPortfolio';
import { useCopilot } from '../context/CopilotContext';

export default function Hero({ onOpenRecruiterMatch }) {
  const { data: profile } = useDocumentData('siteContent', 'profile', fallbackProfile);
  const { openCopilot } = useCopilot();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  const handleRecruiterMatch = onOpenRecruiterMatch || (() => openCopilot('match'));

  return (
    <section id="about" className="pt-4 lg:pt-12 pb-20 lg:pb-28 border-b border-slate-200 dark:border-zinc-900">
      {/* Top Meta Row */}
      <div className="flex items-center justify-between pb-10 lg:pb-16">
        <div className="section-tag flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>[About]</span>
        </div>

        <button
          type="button"
          onClick={handleRecruiterMatch}
          className="key-badge hover:text-zinc-900 dark:hover:text-zinc-200 transition-all cursor-pointer group flex items-center gap-1.5"
          title="Recruiter Match — paste a job description (or press M)"
        >
          <span className="text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 text-[11px] font-mono">
            Recruiter Match
          </span>
          <kbd className="keycap group-hover:bg-zinc-300 dark:group-hover:bg-zinc-800 group-hover:text-zinc-900 dark:group-hover:text-white">
            M
          </kbd>
        </button>
      </div>

      {/* Role Subtitle */}
      <div className="mb-4">
        <span className="text-xs sm:text-sm font-mono text-slate-500 dark:text-zinc-400 font-medium">
          {profile.professionalTitle || 'Software Developer'}
          {profile.subtitle ? ` · ${profile.subtitle}` : ''}
        </span>
      </div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="max-w-3xl text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          {profile.headline || 'I build things, break things, and figure out how to make them work.'}
        </h1>
      </motion.div>

      {/* Concise Intro */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-6 max-w-xl text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed"
      >
        {profile.heroDescription ||
          "Hi, I'm Maurik Angelo L. Fernandez, a software developer specializing in full-stack web and mobile development."}
      </motion.p>

      {/* Primary + Secondary CTA */}
      <div className="flex flex-wrap items-center gap-6 mt-10">
        <button
          type="button"
          onClick={() => scrollTo('projects')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 dark:bg-white dark:hover:bg-zinc-200 text-zinc-950 dark:text-zinc-950 font-mono text-xs font-semibold transition-colors cursor-pointer"
        >
          <span>View My Work</span>
          <span>↓</span>
        </button>

        <button
          type="button"
          onClick={() => scrollTo('contact')}
          className="text-xs font-mono text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          Get In Touch ↗
        </button>
      </div>

      {/* Tagline */}
      {profile.tagline && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-14 text-xs font-mono text-slate-400 dark:text-zinc-600"
        >
          <span className="text-amber-500 dark:text-zinc-600">✦</span> {profile.tagline}
        </motion.p>
      )}
    </section>
  );
}
