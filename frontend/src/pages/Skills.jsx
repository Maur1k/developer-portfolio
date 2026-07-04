import React from 'react';
import { motion } from 'framer-motion';
import { useDocumentData } from '../hooks/useFirestoreData';
import { fallbackSkills } from '../data/fallbackPortfolio';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } };

export default function Skills() {
  const { data: skills, loading } = useDocumentData('siteContent', 'skills', fallbackSkills);
  const skillCategories = [
    { title: 'Languages', key: 'languages', icon: '<>' },
    { title: 'Frontend', key: 'frontend', icon: 'UI' },
    { title: 'Backend', key: 'backend', icon: 'API' },
    { title: 'Databases', key: 'databases', icon: 'DB' },
    { title: 'Tools', key: 'tools', icon: 'CLI' },
    { title: 'Cloud', key: 'cloud', icon: 'CL' },
    { title: 'AI Tools', key: 'aiTools', icon: 'AI' },
    { title: 'Soft Skills', key: 'softSkills', icon: 'SK' },
  ].filter((category) => Array.isArray(skills?.[category.key]) && skills[category.key].length);

  return (
    <section className="min-h-screen py-24 px-4 md:px-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-500/5 to-cyan-400/5 rounded-full blur-3xl"></div></div>
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="mb-16">
          <div className="inline-block px-4 py-2 rounded-full glass-card mb-6"><span className="text-sm text-gray-400 font-medium">TECHNICAL EXPERTISE</span></div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">Skills & Stack</h2>
          <p className="text-lg text-gray-400 max-w-2xl">A practical toolkit for building scalable web applications with modern frontends, reliable APIs, and AI-assisted development workflows.</p>
        </motion.div>

        {loading ? <div className="text-center text-gray-500 py-12">Loading skills...</div> : <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">{skillCategories.map((category, idx) => <motion.div key={category.key} variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="group relative"><div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div><div className="relative glass-card group-hover:border-emerald-500/40 rounded-2xl p-6 transition-all duration-300"><div className="mb-6"><div className="text-2xl mb-2 text-cyan-400 font-bold">{category.icon}</div><h3 className="text-xl font-bold text-white">{category.title}</h3></div><motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-2">{skills[category.key].map((skill) => <motion.div key={skill} variants={itemVariants} className="flex items-center gap-2 group/skill"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover/skill:bg-cyan-400 transition-colors"></span><span className="text-gray-300 group-hover/skill:text-white transition-colors text-sm font-medium">{skill}</span></motion.div>)}</motion.div></div></motion.div>)}</div>}
      </div>
    </section>
  );
}
