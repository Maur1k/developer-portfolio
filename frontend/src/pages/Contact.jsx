import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDocumentData } from '../hooks/useFirestoreData';
import { fallbackProfile } from '../data/fallbackPortfolio';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };

export default function Contact() {
  const { data: profile } = useDocumentData('siteContent', 'profile', fallbackProfile);

  const contactMethods = [
    { icon: 'AT', label: 'Email', value: profile.contact?.email, href: `mailto:${profile.contact?.email}`, description: 'Send me a direct message' },
    { icon: 'PH', label: 'Phone', value: profile.contact?.phone, href: `tel:${profile.contact?.phone}`, description: 'Call or message anytime' },
  ].filter((method) => method.value && method.value !== 'undefined');

  const socialLinks = [
    ['LinkedIn', profile.socialLinks?.linkedin],
    ['GitHub', profile.socialLinks?.github],
    ['Facebook', profile.socialLinks?.facebook],
    ['Portfolio', profile.contact?.portfolioUrl],
  ].filter(([, href]) => href);

  return (
    <section className="min-h-screen py-24 px-4 md:px-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-orange-500/5 to-amber-400/5 rounded-full blur-3xl"></div></div>
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="mb-16"><div className="inline-block px-4 py-2 rounded-full glass-card mb-6"><span className="text-sm text-gray-400 font-medium">GET IN TOUCH</span></div><h2 className="text-5xl md:text-6xl font-bold text-white mb-4">Let's Work Together</h2><p className="text-lg text-gray-400 max-w-2xl">Have a project in mind or want to discuss opportunities? I'd love to hear from you.</p></motion.div>
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-2xl mx-auto">
          <motion.div variants={itemVariants} className="space-y-6">{contactMethods.map((method) => <motion.a key={method.label} href={method.href || '#'} target={method.href ? '_blank' : undefined} rel="noopener noreferrer" className="group block" whileHover={{ x: 8 }}><div className="flex gap-4 p-6 rounded-2xl glass-card group-hover:border-orange-500/40 transition-all duration-300"><div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 text-sm text-amber-400 font-bold uppercase">{method.icon}</div><div className="flex-1"><p className="font-bold text-white">{method.label}</p><p className="text-amber-400 hover:text-white font-semibold text-sm mt-1 break-all">{method.value}</p><p className="text-gray-500 text-xs mt-2">{method.description}</p></div></div></motion.a>)}</motion.div>
        </motion.div>
        {socialLinks.length > 0 && <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} viewport={{ once: true }} className="mt-20 pt-20 border-t border-white/10"><h3 className="text-xl font-bold text-white mb-6 text-center">Follow My Work</h3><div className="flex justify-center gap-4 flex-wrap">{socialLinks.map(([name, href]) => <motion.a key={name} href={href} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="px-6 py-2 glass-card rounded-full text-gray-400 hover:text-amber-400 hover:border-orange-500/40 transition-all duration-300 font-medium">{name}</motion.a>)}</div></motion.div>}
      </div>
    </section>
  );
}
