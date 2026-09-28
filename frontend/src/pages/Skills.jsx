import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useDocumentData } from '../hooks/useFirestoreData';
import { fallbackSkills } from '../data/fallbackPortfolio';
import { useCopilot } from '../context/CopilotContext';

const coreSkillsMeta = [
  { key: 'react', title: 'React', subtitle: 'Frontend Development' },
  { key: 'flutter', title: 'Flutter', subtitle: 'Mobile Development' },
  { key: 'nodejs', title: 'Node.js', subtitle: 'Backend Development' },
  { key: 'laravel', title: 'Laravel / PHP', subtitle: 'Web & API Development' },
  { key: 'mysql', title: 'MySQL', subtitle: 'Database Development' },
  { key: 'firebase', title: 'Firebase', subtitle: 'Backend & Cloud Services' },
  { key: 'restapis', title: 'REST APIs', subtitle: 'API Development & Integration' },
  { key: 'aidev', title: 'AI-Assisted Development', subtitle: 'Modern Engineering Workflows' },
];

/*
  Shared editorial grid: category (fixed) | technologies (flexible).
  The left padding on desktop lines the category column up with the title
  column used by the Projects and Experience rows. Mobile stacks the two.
*/
const ROW_GRID = 'grid gap-y-4 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-x-8 md:pl-16';

export default function Skills() {
  const { data: skills } = useDocumentData('siteContent', 'skills', fallbackSkills);
  const { highlightedSkills } = useCopilot();
  const reduceMotion = useReducedMotion();

  const isCategoryHighlighted = (category, items) => {
    if (!highlightedSkills || highlightedSkills.length === 0) return false;
    const catLower = category.title.toLowerCase();
    const keyLower = category.key.toLowerCase();
    return highlightedSkills.some((h) => {
      const hLower = h.toLowerCase();
      return (
        catLower.includes(hLower) ||
        hLower.includes(catLower) ||
        keyLower.includes(hLower) ||
        items.some((it) => it.toLowerCase().includes(hLower))
      );
    });
  };

  return (
    <section id="skills" className="py-20 lg:py-28 border-b border-slate-200 dark:border-zinc-900">
      {/* Section header — single, quiet fade (no translate) */}
      <motion.header
        initial={reduceMotion ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-14 lg:mb-20"
      >
        <p className="section-tag mb-5">04 — TECH STACK</p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          The tools I work with
        </h2>
        <p className="mt-5 max-w-xl text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
          I don't try to use every technology. I focus on understanding the tools I work with and choosing what fits the problem.
        </p>
      </motion.header>

      {/* Column labels (desktop only) */}
      <div className={`hidden md:grid md:grid-cols-[13rem_minmax(0,1fr)] md:gap-x-8 md:pl-16 pb-4 font-mono text-xs uppercase tracking-widest text-slate-400 dark:text-zinc-600`}>
        <span>Category</span>
        <span>Technologies</span>
      </div>

      {/* Inventory — one subtle reveal for the whole list, no per-row stagger */}
      <motion.ul
        initial={reduceMotion ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="border-t border-slate-200 dark:border-zinc-900"
      >
        {coreSkillsMeta.map((category) => {
          const items = skills?.[category.key] || fallbackSkills[category.key] || [];
          const isHighlighted = isCategoryHighlighted(category, items);

          return (
            <li
              key={category.key}
              className={`group border-b transition-colors duration-300 ${
                isHighlighted ? 'border-amber-500/40' : 'border-slate-200 dark:border-zinc-900'
              }`}
            >
              <div className={`${ROW_GRID} py-7 md:py-8`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h3
                      className={`text-lg font-semibold tracking-tight transition-colors duration-300 ${
                        isHighlighted ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {category.title}
                      {isHighlighted && <span className="sr-only"> (highlighted)</span>}
                    </h3>
                    {isHighlighted && (
                      <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60 motion-safe:animate-ping" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-mono text-xs text-slate-500 dark:text-zinc-500 transition-colors group-hover:text-slate-700 dark:group-hover:text-zinc-400">
                    {category.subtitle}
                  </p>
                </div>

                <ul className="min-w-0 space-y-2">
                  {items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm sm:text-[15px] leading-relaxed text-slate-600 dark:text-zinc-400"
                    >
                      <span className="mt-1 select-none text-slate-400 dark:text-zinc-600" aria-hidden="true">▪</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </motion.ul>
    </section>
  );
}
