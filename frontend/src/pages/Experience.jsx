import React from 'react';
import { motion } from 'framer-motion';
import { useCollectionData } from '../hooks/useFirestoreData';
import { fallbackExperience } from '../data/fallbackPortfolio';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
const itemVariants = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };

export default function Experience() {
  const { items: experiences } = useCollectionData('experience', fallbackExperience, { orderBy: 'displayOrder' });
  const allSkills = [...new Set(experiences.flatMap((exp) => exp.technologies || []))];

  return (
    <section className="min-h-screen py-24 px-4 md:px-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute top-40 left-0 w-96 h-96 bg-gradient-to-br from-emerald-500/5 to-cyan-400/5 rounded-full blur-3xl"></div></div>
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="mb-16"><div className="inline-block px-4 py-2 rounded-full glass-card mb-6"><span className="text-sm text-gray-400 font-medium">PROFESSIONAL JOURNEY</span></div><h2 className="text-5xl md:text-6xl font-bold text-white mb-4">Experience</h2></motion.div>
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-8">
          {experiences.map((exp) => <motion.div key={exp.id} variants={itemVariants} className="group relative"><div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-400/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div><div className="relative glass-card group-hover:border-emerald-500/40 rounded-2xl p-8 md:p-10 transition-all duration-300"><div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6"><div className="flex gap-4">{exp.logoUrl && <img src={exp.logoUrl} alt={`${exp.company} logo`} className="h-12 w-12 rounded-lg object-cover" />}<div><h3 className="text-3xl font-bold text-white mb-1">{exp.position}</h3><p className="text-cyan-400 font-semibold">{exp.company}</p><p className="text-sm text-gray-500 mt-1">{exp.duration}</p></div></div><div className="flex flex-wrap gap-2">{(exp.technologies || []).slice(0, 3).map((metric) => <span key={metric} className="px-3 py-1 bg-white/[0.03] border border-white/10 text-emerald-300 text-xs rounded-full font-medium">{metric}</span>)}</div></div><p className="text-gray-400 mb-6">{exp.description}</p><div className="space-y-3"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">KEY RESPONSIBILITIES</p><ul className="space-y-2">{(exp.responsibilities || []).map((responsibility, index) => <motion.li key={responsibility} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="flex items-start gap-3 text-gray-300"><span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-emerald-500/50 flex-shrink-0 mt-0.5"><span className="w-2 h-2 rounded-full bg-cyan-400"></span></span><span className="text-sm">{responsibility}</span></motion.li>)}</ul></div></div></motion.div>)}
        </motion.div>
        {allSkills.length > 0 && <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }} className="mt-16 pt-16 border-t border-white/10"><h3 className="text-2xl font-bold text-white mb-8">Skills Applied</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{allSkills.map((skill) => <div key={skill} className="px-4 py-3 glass-card rounded-lg text-center text-sm text-gray-400 hover:border-emerald-500/40 transition-all duration-300">{skill}</div>)}</div></motion.div>}
      </div>
    </section>
  );
}
