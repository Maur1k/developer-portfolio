import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useDocumentData } from '../hooks/useFirestoreData';
import { fallbackProfile } from '../data/fallbackPortfolio';

export default function About() {
  const { data: profile } = useDocumentData('siteContent', 'profile', fallbackProfile);
  const reduceMotion = useReducedMotion();

  const aboutTitle = profile?.aboutTitle || fallbackProfile.aboutTitle;
  const aboutMe = profile?.aboutMe || fallbackProfile.aboutMe || '';
  const approach = profile?.approach || fallbackProfile.approach || [];

  // aboutMe is stored as one string with blank-line-separated paragraphs
  const paragraphs = aboutMe.split(/\n\s*\n/).filter(Boolean);

  return (
    <section id="about" className="py-20 lg:py-28 border-b border-slate-200 dark:border-zinc-900">
      {/* Editorial two-column intro — one quiet fade, no stagger */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="grid lg:grid-cols-12 gap-x-10 gap-y-8 lg:gap-x-16"
      >
        <div className="lg:col-span-4">
          <p className="section-tag mb-5">01 — ABOUT</p>
          <h2 className="max-w-xs text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            {aboutTitle}
          </h2>
        </div>

        <div className="lg:col-span-8 max-w-2xl space-y-5">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-zinc-300"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </motion.div>

      {/* Secondary: how I work — light, editorial, no cards */}
      {approach.length > 0 && (
        <div className="mt-16 lg:mt-24 pt-10 lg:pt-12 border-t border-slate-200 dark:border-zinc-900">
          <div className="grid lg:grid-cols-12 gap-x-10 gap-y-8 lg:gap-x-16">
            <div className="lg:col-span-4">
              <p className="font-mono text-xs uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                How I Work
              </p>
            </div>

            <div className="lg:col-span-8 max-w-2xl">
              <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
                {approach.map((item) => (
                  <li key={item.title}>
                    <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
