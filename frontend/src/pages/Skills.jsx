import React from 'react';
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

export default function Skills() {
  const { data: skills } = useDocumentData('siteContent', 'skills', fallbackSkills);
  const { highlightedSkills } = useCopilot();

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
    <section id="skills" className="py-16 border-b border-zinc-900">
      {/* Section Tag */}
      <div className="section-tag mb-4">[Tech Stack]</div>

      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Tools I Use to Build
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
          I don't try to use every technology. I focus on understanding the tools I work with and choosing what fits the problem.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {coreSkillsMeta.map((category) => {
          const items = skills?.[category.key] || fallbackSkills[category.key] || [];
          const isHighlighted = isCategoryHighlighted(category, items);

          return (
            <div
              key={category.key}
              className={`rounded-xl border p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 ${
                isHighlighted
                  ? 'border-amber-400/80 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/50 scale-[1.02]'
                  : 'border-zinc-900 bg-[#09090b]/70 hover:border-zinc-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-semibold tracking-tight ${isHighlighted ? 'text-amber-300' : 'text-white'}`}>
                    {category.title}
                  </h3>
                  {isHighlighted && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                </div>
                <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                  {category.subtitle}
                </p>

                <ul className="mt-3.5 space-y-1.5">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <span className="w-1 h-1 rounded-full bg-zinc-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

