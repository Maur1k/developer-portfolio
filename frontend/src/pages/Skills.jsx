import React from 'react';
import { motion } from 'framer-motion';
import { useDocumentData } from '../hooks/useFirestoreData';
import { fallbackSkills } from '../data/fallbackPortfolio';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

const coreSkills = [
  { title: 'React', subtitle: 'Frontend Development', key: 'react', icon: '⚛' },
  { title: 'Flutter', subtitle: 'Android & iOS Development', key: 'flutter', icon: '📱' },
  { title: 'Node.js', subtitle: 'Backend Development', key: 'nodejs', icon: '⚙' },
  { title: 'Laravel / PHP', subtitle: 'Web & API Development', key: 'laravel', icon: '🔧' },
  { title: 'MySQL', subtitle: 'Database Development', key: 'mysql', icon: '🗄' },
  { title: 'Firebase', subtitle: 'Backend Services & Cloud', key: 'firebase', icon: '🔥' },
  { title: 'REST APIs', subtitle: 'API Development & Integration', key: 'restapis', icon: '🔗' },
  { title: 'AI-Assisted Development', subtitle: 'Prompt Engineering • Agentic AI', key: 'aidev', icon: '🤖' },
];

export default function Skills() {
  const { data: skills, loading } = useDocumentData('siteContent', 'skills', fallbackSkills);

  return (
    <section className="min-h-screen py-24 px-4 md:px-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-500/5 to-amber-400/5 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-[-5rem] w-80 h-80 bg-gradient-to-bl from-orange-500/5 to-amber-400/5 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="mb-16">
          <div className="inline-block px-4 py-2 rounded-full glass-card mb-6"><span className="text-sm text-gray-400 font-medium">CORE TECHNOLOGIES</span></div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">Skills & Stack</h2>
          <p className="text-lg text-gray-400 max-w-2xl">Building reliable web, mobile, and backend systems with modern technologies and AI-assisted development workflows.</p>
        </motion.div>

        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading skills...</div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {coreSkills.map((skill) => {
              const items = skills?.[skill.key] || [];
              return (
                <motion.div
                  key={skill.key}
                  variants={itemVariants}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative glass-card group-hover:border-orange-500/40 rounded-2xl p-6 transition-all duration-300 h-full flex flex-col">
                    <div className="mb-5">
                      <div className="text-2xl mb-3">{skill.icon}</div>
                      <h3 className="text-xl font-bold text-white">{skill.title}</h3>
                      <p className="text-xs text-orange-300/80 font-semibold uppercase tracking-wider mt-1">{skill.subtitle}</p>
                    </div>
                    <div className="space-y-2 mt-auto">
                      {items.map((item) => (
                        <div key={item} className="flex items-center gap-2 group/skill">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 group-hover/skill:bg-amber-400 transition-colors"></span>
                          <span className="text-gray-300 group-hover/skill:text-white transition-colors text-sm font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
