import React from 'react';
import { motion } from 'framer-motion';
import { useDocumentData } from '../hooks/useFirestoreData';
import { fallbackProfile } from '../data/fallbackPortfolio';

export default function Hero({ onThemeToggle }) {
  const { data: profile } = useDocumentData('siteContent', 'profile', fallbackProfile);

  return (
    <section id="about" className="pt-6 sm:pt-10 pb-16 border-b border-zinc-900">
      {/* Top Header Tag & Keyboard Shortcut */}
      <div className="flex items-center justify-between pb-8">
        <div className="section-tag">[About]</div>
        <button
          type="button"
          onClick={onThemeToggle}
          className="key-badge hover:text-zinc-300 transition-colors"
          title="Press D or click to toggle quick view"
        >
          <span>press</span>
          <kbd className="keycap">D</kbd>
        </button>
      </div>

      {/* Main Large Headline */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-8">
          {profile.headline || 'Building reliable software for the web and mobile.'}
        </h1>
      </motion.div>

      {/* Bio Narrative */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-5 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-3xl"
      >
        <p>
          Hi, I'm <span className="text-zinc-100 font-semibold">{profile.name}</span>, a{' '}
          <span className="text-zinc-100 font-medium">software developer</span> specializing in{' '}
          <strong className="text-zinc-200 font-semibold">full-stack web and mobile development</strong>, with experience building and maintaining production applications across web, Android, and iOS.
        </p>

        <p className="text-sm sm:text-base text-zinc-400">
          I work across frontend, backend, APIs, databases, and mobile applications using{' '}
          <span className="text-zinc-200 font-medium">React</span>,{' '}
          <span className="text-zinc-200 font-medium">Flutter</span>,{' '}
          <span className="text-zinc-200 font-medium">Node.js</span>,{' '}
          <span className="text-zinc-200 font-medium">Laravel</span>,{' '}
          <span className="text-zinc-200 font-medium">PHP</span>,{' '}
          <span className="text-zinc-200 font-medium">MySQL</span>,{' '}
          <span className="text-zinc-200 font-medium">Firebase</span>, and{' '}
          <span className="text-zinc-200 font-medium">REST APIs</span>.
        </p>

        <p className="text-sm sm:text-base text-zinc-400">
          I also use modern AI-assisted development tools and agentic workflows as part of my engineering process to accelerate implementation, debugging, research, and repetitive tasks while keeping engineering decisions and code quality under my control.
        </p>

        {/* Ethos / Quote pill */}
        <div className="pt-2">
          <span className="inline-block px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs sm:text-sm font-mono text-zinc-300">
            {profile.tagline || 'growth starts where comfort ends.'}
          </span>
        </div>
      </motion.div>

      {/* Engineering Approach Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-10">
        {(profile.approach || [
          { title: 'Clean', description: 'Maintainable and structured code' },
          { title: 'Practical', description: 'Focused on solving real problems' },
          { title: 'Reliable', description: 'Built with production use in mind' },
          { title: 'AI-Assisted', description: 'Modern development workflows' },
        ]).map((item) => (
          <div
            key={item.title}
            className="p-3.5 rounded-lg border border-zinc-900 bg-[#0a0a0d] hover:border-zinc-800 transition-colors"
          >
            <div className="text-xs font-mono font-semibold text-zinc-200">{item.title}</div>
            <div className="text-[11px] text-zinc-500 mt-1 leading-snug">{item.description}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

