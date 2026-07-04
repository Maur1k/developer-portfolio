import React from 'react';
import { motion } from 'framer-motion';
import { useCollectionData, useDocumentData } from '../hooks/useFirestoreData';
import { fallbackCertificates, fallbackEducation, fallbackProfile } from '../data/fallbackPortfolio';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };

export default function About() {
  const { data: profile } = useDocumentData('siteContent', 'profile', fallbackProfile);
  const { items: education } = useCollectionData('education', fallbackEducation, { orderBy: 'displayOrder' });
  const { items: certificates } = useCollectionData('certificates', fallbackCertificates, { orderBy: 'displayOrder' });

  return (
    <section className="min-h-screen py-24 px-4 md:px-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute top-40 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/5 to-cyan-400/5 rounded-full blur-3xl"></div></div>
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="mb-16">
          <div className="inline-block px-4 py-2 rounded-full glass-card mb-6"><span className="text-sm text-gray-400 font-medium">ABOUT ME</span></div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">Building modern web products</h2>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div variants={itemVariants} className="space-y-6">
            <div><h3 className="text-2xl font-bold text-white mb-4">Who I Am</h3><p className="text-gray-400 text-lg leading-relaxed">{profile.aboutMe}</p></div>
            <div><h3 className="text-2xl font-bold text-white mb-4">My Approach</h3><p className="text-gray-400 text-lg leading-relaxed">I use AI-assisted development tools to move faster on debugging, documentation, prototyping, and architecture decisions while keeping the work grounded in maintainable code.</p></div>
            <div><h3 className="text-2xl font-bold text-white mb-4">Beyond Code</h3><p className="text-gray-400 text-lg leading-relaxed">I enjoy solving product problems, refining developer workflows, and building scalable web applications that feel fast, clear, and durable.</p></div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            {education.length > 0 && (
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative glass-card group-hover:border-emerald-500/40 rounded-2xl p-8 transition-all duration-300">
                  <h4 className="text-lg font-bold text-white mb-4">Education</h4>
                  <div className="space-y-5">
                    {education.map((entry) => (
                      <div key={entry.id} className="border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
                        <p className="text-cyan-400 font-semibold">{entry.degree}</p>
                        <p className="text-gray-400 text-sm">{entry.institution}</p>
                        {entry.campus && <p className="text-gray-500 text-xs mt-1">{entry.campus}</p>}
                        {entry.duration && <p className="text-gray-500 text-xs mt-1">{entry.duration}</p>}
                        {entry.description && <p className="text-gray-400 text-sm mt-2">{entry.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {certificates.length > 0 && (
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative glass-card group-hover:border-emerald-500/40 rounded-2xl p-8 transition-all duration-300">
                  <h4 className="text-lg font-bold text-white mb-4">Certificates</h4>
                  <div className="space-y-4">
                    {certificates.map((certificate) => (
                      <div key={certificate.id} className="flex gap-4 items-start">
                        {certificate.imageUrl && (
                          <img src={certificate.imageUrl} alt={certificate.title} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-white">{certificate.title}</p>
                          <p className="text-sm text-gray-400">{certificate.issuer}</p>
                          {certificate.date && <p className="text-xs text-gray-500 mt-1">{certificate.date}</p>}
                          <div className="mt-2 flex flex-wrap gap-3 text-sm">
                            {certificate.credentialUrl && (
                              <a href={certificate.credentialUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-white transition-colors">View Credential</a>
                            )}
                            {certificate.pdfUrl && (
                              <a href={certificate.pdfUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-white transition-colors">Download PDF</a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="group relative"><div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div><div className="relative glass-card group-hover:border-emerald-500/40 rounded-2xl p-8 transition-all duration-300"><h4 className="text-lg font-bold text-white mb-4">Contact</h4><div className="space-y-4"><div><p className="text-gray-500 text-xs font-semibold uppercase mb-1">Location</p><p className="text-gray-300">{profile.location}</p></div><div><p className="text-gray-500 text-xs font-semibold uppercase mb-1">Email</p><a href={`mailto:${profile.contact?.email}`} className="text-cyan-400 hover:text-white transition-colors">{profile.contact?.email}</a></div><div><p className="text-gray-500 text-xs font-semibold uppercase mb-1">Phone</p><a href={`tel:${profile.contact?.phone}`} className="text-cyan-400 hover:text-white transition-colors">{profile.contact?.phone}</a></div></div></div></div>
            <div className="grid grid-cols-3 gap-4">{[{ label: 'Clean', value: 'Architecture' }, { label: 'Fast', value: 'Delivery' }, { label: 'AI', value: 'Assisted' }].map((item) => <motion.div key={item.label} whileHover={{ y: -4 }} className="text-center px-4 py-4 glass-card rounded-lg hover:border-emerald-500/40 transition-all duration-300"><p className="text-2xl font-bold gradient-text">{item.value}</p><p className="text-xs text-gray-500 mt-1">{item.label}</p></motion.div>)}</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
