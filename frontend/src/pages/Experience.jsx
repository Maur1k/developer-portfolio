import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCollectionData } from '../hooks/useFirestoreData';
import { fallbackExperience, fallbackEducation } from '../data/fallbackPortfolio';

export default function Experience() {
  const { items: experiences } = useCollectionData('experience', fallbackExperience, { orderBy: 'displayOrder' });
  const { items: education } = useCollectionData('education', fallbackEducation, { orderBy: 'displayOrder' });
  const [expandedId, setExpandedId] = useState(experiences[0]?.id || 'when-in-baguio-contract');

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section id="experience" className="py-16 border-b border-zinc-900">
      {/* Section Tag */}
      <div className="section-tag mb-4">[Experience]</div>

      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Where I've Been Building
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
          My professional journey started with an internship and quickly turned into an opportunity to continue working on production software.
        </p>
      </div>

      <div className="space-y-3">
        {/* Experience Entries */}
        {experiences.map((exp) => {
          const isExpanded = expandedId === exp.id;
          return (
            <div
              key={exp.id}
              className={`rounded-xl border transition-all duration-200 ${
                isExpanded
                  ? 'border-zinc-700/80 bg-[#0d0e12]'
                  : 'border-zinc-900 bg-[#09090b]/60 hover:border-zinc-800 hover:bg-[#0c0d10]'
              }`}
            >
              {/* Header / Clickable Row */}
              <button
                type="button"
                onClick={() => toggleExpand(exp.id)}
                className="w-full p-4 sm:p-5 flex items-start sm:items-center justify-between text-left gap-4"
              >
                <div className="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0">
                  <span className="font-mono text-xs sm:text-sm text-zinc-500 font-semibold shrink-0 pt-0.5 sm:pt-0">
                    {exp.year || '2026'}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                        {exp.position}
                      </h3>
                      {exp.period && (
                        <span className="text-xs font-mono text-zinc-400">
                          ({exp.period})
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                      <span className="text-zinc-300 font-medium">{exp.company}</span>
                      {exp.location && <span className="text-zinc-400"> · {exp.location}</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-0.5 sm:pt-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border border-zinc-800 text-zinc-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-90 text-white border-zinc-600' : ''
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Expandable Content */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-zinc-900/80 space-y-4">
                      {exp.leadSummary && (
                        <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
                          {exp.leadSummary}
                        </p>
                      )}

                      {exp.responsibilities && exp.responsibilities.length > 0 && (
                        <div>
                          <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
                            Key Responsibilities
                          </p>
                          <ul className="space-y-1.5">
                            {exp.responsibilities.map((resp, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-400">
                                <span className="text-zinc-600 select-none mt-1">▪</span>
                                <span className="leading-normal">{resp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-1.5">
                          {exp.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-2.5 py-1 rounded bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono text-zinc-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Education Timeline Row */}
        {education.map((edu) => {
          const isExpanded = expandedId === edu.id;
          return (
            <div
              key={edu.id}
              className={`rounded-xl border transition-all duration-200 ${
                isExpanded
                  ? 'border-zinc-700/80 bg-[#0d0e12]'
                  : 'border-zinc-900 bg-[#09090b]/60 hover:border-zinc-800 hover:bg-[#0c0d10]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleExpand(edu.id)}
                className="w-full p-4 sm:p-5 flex items-start sm:items-center justify-between text-left gap-4"
              >
                <div className="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0">
                  <span className="font-mono text-xs sm:text-sm text-zinc-500 font-semibold shrink-0 pt-0.5 sm:pt-0">
                    {edu.year || '2026'}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                        {edu.degree}
                      </h3>
                      {edu.major && (
                        <span className="text-xs font-mono text-zinc-400">
                          ({edu.major})
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                      <span className="text-zinc-300 font-medium">{edu.institution}</span>
                      {edu.campus && <span className="text-zinc-400"> · {edu.campus}</span>}
                      {edu.duration && <span className="text-zinc-400"> · {edu.duration}</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-0.5 sm:pt-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border border-zinc-800 text-zinc-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-90 text-white border-zinc-600' : ''
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-zinc-900/80 space-y-3">
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                        {edu.description ||
                          'Bachelor of Science in Information Technology specializing in Web and Mobile Technologies from Pangasinan State University – Urdaneta Campus.'}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {['Web & Mobile Technologies', 'Full-Stack Architecture', 'Database Systems', 'Software Engineering'].map((item) => (
                          <span
                            key={item}
                            className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

