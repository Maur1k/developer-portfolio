import React from 'react';
import { motion } from 'framer-motion';
import { useDocumentData } from '../hooks/useFirestoreData';
import { fallbackProfile } from '../data/fallbackPortfolio';
import { useCopilot } from '../context/CopilotContext';

export default function Hero({ onThemeToggle }) {
  const { data: profile } = useDocumentData('siteContent', 'profile', fallbackProfile);
  const { openCopilot } = useCopilot();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  const approachCards = profile.approach || [
    { title: 'Curious', description: 'Always learning something new.' },
    { title: 'Practical', description: 'I build for real problems, not just demos.' },
    { title: 'Full Stack', description: 'From interface to API to database.' },
    { title: 'AI-Assisted', description: 'Using AI to move faster, think deeper, and automate the repetitive.' },
  ];

  return (
    <section id="about" className="pt-6 sm:pt-10 pb-16 border-b border-zinc-900">
      {/* Top Header Tag & Keyboard Shortcut */}
      <div className="flex items-center justify-between pb-8">
        <div className="section-tag flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>[About]</span>
        </div>
        <button
          type="button"
          onClick={onThemeToggle}
          className="key-badge hover:text-zinc-200 hover:border-zinc-700 transition-all cursor-pointer group"
          title="Press M or click for More options"
        >
          <span className="text-zinc-500 group-hover:text-zinc-300">press</span>
          <kbd className="keycap group-hover:bg-zinc-800 group-hover:text-white">M</kbd>
        </button>
      </div>

      {/* Role Subtitle */}
      <div className="mb-3">
        <span className="text-xs sm:text-sm font-mono text-zinc-400 font-medium">
          Software Developer · Full Stack · Web & Mobile
        </span>
      </div>

      {/* Main Large Headline */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
          {profile.headline || 'I build things, break things, and figure out how to make them work.'}
        </h1>
      </motion.div>

      {/* Bio Narrative */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-6 space-y-4 text-sm sm:text-base text-zinc-300 leading-relaxed"
      >
        <p>
          Hi, I'm <strong className="font-semibold text-white">Maurik Angelo L. Fernandez</strong>, a software developer specializing in <strong className="font-semibold text-white">full-stack web and mobile development</strong>.
        </p>

        <p className="text-zinc-400">
          I've worked on production applications across web, Android, and iOS, with experience spanning frontend development, backend services, REST APIs, databases, payments, notifications, and administrative systems.
        </p>

        <p className="text-zinc-400">
          I work primarily with <strong className="font-medium text-zinc-200">React, Flutter, Node.js, Laravel, PHP, MySQL, Firebase, and REST APIs</strong>, while using AI-assisted and agentic workflows to make development faster without losing control of the engineering behind it.
        </p>
      </motion.div>

      {/* CTA Buttons + Recruiter Match Banner */}
      <div className="flex flex-wrap items-center gap-3 mt-6">
        <button
          type="button"
          onClick={() => openCopilot('match')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 font-mono text-xs font-bold hover:brightness-110 transition-all shadow-md cursor-pointer"
        >
          <span>Recruiter Match — Paste JD</span>
          <span>↗</span>
        </button>

        <button
          type="button"
          onClick={() => scrollTo('projects')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-zinc-950 font-mono text-xs font-semibold hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer"
        >
          <span>View My Work</span>
          <span>↓</span>
        </button>

        <button
          type="button"
          onClick={() => scrollTo('contact')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800 bg-[#121318] text-zinc-300 font-mono text-xs font-medium hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
        >
          <span>Get In Touch</span>
          <span>↗</span>
        </button>
      </div>

      {/* Quote / Ethos Badge */}
      <div className="mt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-zinc-800/80 bg-[#09090b] font-mono text-xs text-zinc-400 shadow-inner">
          <span className="text-zinc-600">✦</span>
          <span>{profile.tagline || 'build. break. learn. repeat.'}</span>
        </div>
      </div>

      {/* 4 Approach Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-8">
        {approachCards.map((item) => (
          <div
            key={item.title}
            className="p-3.5 rounded-xl border border-zinc-900 bg-[#09090b]/80 hover:border-zinc-800 hover:bg-[#0c0d12] transition-all group"
          >
            <p className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors">
              {item.title}
            </p>
            <p className="text-[11px] text-zinc-500 mt-1 leading-snug">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

