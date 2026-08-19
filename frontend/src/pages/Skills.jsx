import React from 'react';
import { useDocumentData } from '../hooks/useFirestoreData';
import { fallbackSkills } from '../data/fallbackPortfolio';

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
          return (
            <div
              key={category.key}
              className="rounded-xl border border-zinc-900 bg-[#09090b]/70 hover:border-zinc-800 p-4 sm:p-5 flex flex-col justify-between transition-colors"
            >
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  {category.title}
                </h3>
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

