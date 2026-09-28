import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useDocumentData } from '../hooks/useFirestoreData';
import { fallbackProfile } from '../data/fallbackPortfolio';
import { useCopilot } from '../context/CopilotContext';

// Categories map 1:1 to the keys in profile.stackBreakdown.
const stackCategories = [
  { key: 'frontend', label: 'Frontend' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'backend', label: 'Backend' },
  { key: 'data', label: 'Data' },
];

/*
  Shared editorial grid: category (fixed) | technologies (flexible).
  The left padding on desktop lines the category column up with the title
  column used by the Projects and Experience rows. Mobile stacks the two.
*/
const ROW_GRID = 'grid gap-y-2 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-x-8 md:pl-16 md:items-baseline';

export default function Skills() {
  const { data: profile } = useDocumentData('siteContent', 'profile', fallbackProfile);
  const { highlightedSkills } = useCopilot();
  const reduceMotion = useReducedMotion();

  const stack = profile?.stackBreakdown || fallbackProfile.stackBreakdown || {};
  const highlights = (highlightedSkills || []).map((h) => String(h).toLowerCase().trim()).filter(Boolean);

  // A single technology is highlighted when a Copilot-highlighted skill names it
  const isTechHighlighted = (tech) => {
    if (highlights.length === 0) return false;
    const t = tech.toLowerCase();
    return highlights.some((h) => t.includes(h) || h.includes(t));
  };

  // A row is highlighted when the category itself or any of its technologies matches
  const isCategoryHighlighted = (category, items) => {
    if (highlights.length === 0) return false;
    const labelLower = category.label.toLowerCase();
    const keyLower = category.key.toLowerCase();
    const categoryMatch = highlights.some(
      (h) => labelLower.includes(h) || h.includes(labelLower) || keyLower.includes(h)
    );
    return categoryMatch || items.some(isTechHighlighted);
  };

  const rows = stackCategories
    .map((category) => ({ ...category, items: stack[category.key] || [] }))
    .filter((category) => category.items.length > 0);

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
      <div className="hidden md:grid md:grid-cols-[13rem_minmax(0,1fr)] md:gap-x-8 md:pl-16 pb-4 font-mono text-xs uppercase tracking-widest text-slate-400 dark:text-zinc-600">
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
        {rows.map((category) => {
          const isHighlighted = isCategoryHighlighted(category, category.items);

          return (
            <li
              key={category.key}
              className={`border-b transition-colors duration-300 ${
                isHighlighted ? 'border-amber-500/40' : 'border-slate-200 dark:border-zinc-900'
              }`}
            >
              <div className={`${ROW_GRID} py-5 md:py-6`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <h3
                    className={`text-lg font-semibold tracking-tight transition-colors duration-300 ${
                      isHighlighted ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {category.label}
                    {isHighlighted && <span className="sr-only"> (highlighted)</span>}
                  </h3>
                  {isHighlighted && (
                    <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60 motion-safe:animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                    </span>
                  )}
                </div>

                <p className="min-w-0 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-zinc-400">
                  {category.items.map((tech, index) => (
                    <React.Fragment key={tech}>
                      <span className="whitespace-nowrap">
                        <span
                          className={
                            isTechHighlighted(tech) ? 'font-medium text-amber-600 dark:text-amber-400' : undefined
                          }
                        >
                          {tech}
                        </span>
                        {index < category.items.length - 1 && (
                          <span className="mx-2 text-slate-300 dark:text-zinc-700" aria-hidden="true">·</span>
                        )}
                      </span>{' '}
                    </React.Fragment>
                  ))}
                </p>
              </div>
            </li>
          );
        })}
      </motion.ul>
    </section>
  );
}
