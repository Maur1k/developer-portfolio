import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDocumentData } from '../hooks/useFirestoreData';
import { fallbackProfile, fallbackProjects } from '../data/fallbackPortfolio';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };
const floatingVariants = { initial: { y: 0 }, animate: { y: -10, transition: { duration: 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' } } };

export default function Hero() {
  const { data: profile } = useDocumentData('siteContent', 'profile', fallbackProfile);
  const wibeProject = fallbackProjects.find(p => p.id === 'wibav3');
  const tags = ['React', 'Node.js', 'Agentic AI', 'Laravel PHP', 'Flutter', 'Firebase'];

  return (
    <section className="min-h-screen relative overflow-hidden pt-20 md:pt-24 pb-16 md:pb-24 px-4 md:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-amber-400/10 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-32 left-0 w-80 h-80 bg-gradient-to-tr from-orange-500/10 to-amber-400/5 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="lg:pr-8">
            <motion.div variants={itemVariants} className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
              <span className="text-xs text-gray-400 font-medium">{profile.professionalTitle} - {profile.availability}</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              <div className="text-white mb-3">{profile.headline?.split(' with ')[0] || 'Building software'}</div>
              <div className="mb-4"><span className="gradient-text text-5xl md:text-6xl lg:text-7xl">{profile.headline?.includes(' with ') ? `with ${profile.headline.split(' with ').slice(1).join(' with ')}` : 'modern workflows.'}</span></div>
            </motion.h1>

            <motion.div variants={itemVariants} className="mb-6">
              <h2 className="text-3xl md:text-4xl font-bold"><span className="text-gray-400">I'm </span><span className="gradient-underline">{profile.name}</span></h2>
            </motion.div>

            <motion.p variants={itemVariants} className="text-lg text-gray-400 mb-6 max-w-md">{profile.heroDescription}</motion.p>
            <motion.p variants={itemVariants} className="text-base text-gray-500 mb-8 max-w-md leading-relaxed">{profile.aboutMe}</motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              <Link to="/projects" className="btn-primary px-8 py-3 text-white font-semibold rounded-xl transition-all duration-300 text-center">See Work</Link>
              <Link to="/contact" className="btn-secondary px-8 py-3 text-white font-semibold rounded-xl transition-all duration-300 text-center backdrop-blur-[1px]">Get in Touch</Link>
              {profile.resumeUrl && <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="btn-secondary px-8 py-3 text-white font-semibold rounded-xl transition-all duration-300 text-center backdrop-blur-[1px]">Resume</a>}
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="hidden lg:flex items-center justify-center">
            <motion.div animate="animate" initial="initial" variants={floatingVariants} className="relative w-[22rem] h-[22rem]">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 to-amber-400/10 rounded-3xl glass-card p-6 flex flex-col justify-between overflow-hidden">
                {profile.profilePhoto ? <img src={profile.profilePhoto} alt={profile.name} className="absolute inset-0 h-full w-full object-cover opacity-20" /> : null}
                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-300">{profile.availability}</div>
                  <div className="mt-8 space-y-1"><p className="text-3xl font-bold text-white leading-tight">{profile.professionalTitle}</p><p className="mt-4 text-sm leading-6 text-gray-400 max-w-sm">AI-assisted, product-minded, and focused on clean architecture, responsive UI, and reliable backend systems.</p></div>
                </div>
                <div className="relative space-y-4"><div className="h-px w-full bg-white/10"></div><div className="flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-gray-200 transition-colors duration-200 hover:border-orange-400/40 hover:text-white">{tag}</span>)}</div></div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Featured Project Section */}
      {wibeProject && (
        <div className="relative z-10 max-w-6xl mx-auto mt-32 px-4 md:px-0">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="rounded-3xl glass-card overflow-hidden border border-white/10 flex flex-col md:flex-row relative hover:border-orange-500/30 transition-colors duration-500 group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-400/5 opacity-50"></div>
            <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold tracking-widest uppercase mb-4 w-max border border-orange-500/30">Featured Project</span>
              <h3 className="text-3xl md:text-5xl font-bold text-white mb-4">{wibeProject.name}</h3>
              <p className="text-gray-400 mb-6 leading-relaxed text-lg">{wibeProject.summary}</p>
              <div className="flex flex-wrap gap-3 mb-8">
                {wibeProject.technologies.slice(0, 4).map(tech => (
                  <span key={tech} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-gray-300">{tech}</span>
                ))}
              </div>
              <div className="flex gap-4">
                <Link to="/projects" className="btn-primary px-8 py-3 rounded-xl font-semibold text-[#090a0c]">View Case Study</Link>
              </div>
            </div>
            <div className="md:w-1/2 relative min-h-[300px] md:min-h-[400px]">
              <img src={encodeURI(wibeProject.thumbnailImage)} alt="WIBE App" className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/50 to-transparent md:bg-gradient-to-l md:from-[#0f1115] md:via-[#0f1115]/80 md:to-transparent"></div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
