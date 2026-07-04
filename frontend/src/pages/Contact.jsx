import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDocumentData } from '../hooks/useFirestoreData';
import { fallbackProfile } from '../data/fallbackPortfolio';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };

export default function Contact() {
  const { data: profile } = useDocumentData('siteContent', 'profile', fallbackProfile);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const data = await response.json();
      if (response.ok) { setStatus({ type: 'success', message: data.message }); setFormData({ name: '', email: '', message: '' }); }
      else setStatus({ type: 'error', message: data.error });
    } catch (error) { setStatus({ type: 'error', message: 'An error occurred. Please try again.' }); }
    finally { setLoading(false); }
  };

  const contactMethods = [
    { icon: 'AT', label: 'Email', value: profile.contact?.email, href: `mailto:${profile.contact?.email}`, description: 'Send me a direct message' },
    { icon: 'PH', label: 'Phone', value: profile.contact?.phone, href: `tel:${profile.contact?.phone}`, description: 'Call or message anytime' },
    { icon: 'LOC', label: 'Location', value: profile.location, description: 'Based in the Philippines' },
    { icon: 'IN', label: 'LinkedIn', value: 'LinkedIn Profile', href: profile.socialLinks?.linkedin, description: 'View my professional profile' },
    { icon: 'GH', label: 'GitHub', value: 'GitHub Profile', href: profile.socialLinks?.github, description: 'View my code' },
    { icon: 'FB', label: 'Facebook', value: 'Facebook Profile', href: profile.socialLinks?.facebook, description: 'Connect socially' },
  ].filter((method) => method.value && method.value !== 'undefined');

  const socialLinks = [
    ['LinkedIn', profile.socialLinks?.linkedin],
    ['GitHub', profile.socialLinks?.github],
    ['Facebook', profile.socialLinks?.facebook],
    ['Portfolio', profile.contact?.portfolioUrl],
  ].filter(([, href]) => href);

  return (
    <section className="min-h-screen py-24 px-4 md:px-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-emerald-500/5 to-cyan-400/5 rounded-full blur-3xl"></div></div>
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="mb-16"><div className="inline-block px-4 py-2 rounded-full glass-card mb-6"><span className="text-sm text-gray-400 font-medium">GET IN TOUCH</span></div><h2 className="text-5xl md:text-6xl font-bold text-white mb-4">Let's Work Together</h2><p className="text-lg text-gray-400 max-w-2xl">Have a project in mind or want to discuss opportunities? I'd love to hear from you.</p></motion.div>
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid lg:grid-cols-2 gap-12">
          <motion.div variants={itemVariants} className="space-y-6"><h3 className="text-2xl font-bold text-white">Contact Information</h3>{contactMethods.map((method) => <motion.a key={method.label} href={method.href || '#'} target={method.href ? '_blank' : undefined} rel="noopener noreferrer" className="group block" whileHover={{ x: 8 }}><div className="flex gap-4 p-6 rounded-2xl glass-card group-hover:border-emerald-500/40 transition-all duration-300"><div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 text-sm text-cyan-400 font-bold uppercase">{method.icon}</div><div className="flex-1"><p className="font-bold text-white">{method.label}</p><p className="text-cyan-400 hover:text-white font-semibold text-sm mt-1 break-all">{method.value}</p><p className="text-gray-500 text-xs mt-2">{method.description}</p></div></div></motion.a>)}</motion.div>
          <motion.div variants={itemVariants}><form onSubmit={handleSubmit} className="space-y-4"><div className="group"><label className="block text-sm font-semibold text-gray-400 mb-2">Full Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Maurik" className="w-full px-4 py-3 bg-white/[0.03] backdrop-blur-[1px] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-white placeholder-gray-600 transition-all duration-300" /></div><div className="group"><label className="block text-sm font-semibold text-gray-400 mb-2">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" className="w-full px-4 py-3 bg-white/[0.03] backdrop-blur-[1px] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-white placeholder-gray-600 transition-all duration-300" /></div><div className="group"><label className="block text-sm font-semibold text-gray-400 mb-2">Message</label><textarea name="message" value={formData.message} onChange={handleChange} required rows="5" placeholder="Tell me about your project or opportunity..." className="w-full px-4 py-3 bg-white/[0.03] backdrop-blur-[1px] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-white placeholder-gray-600 transition-all duration-300 resize-none"></textarea></div><motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary w-full px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Sending...' : 'Send Message'}</motion.button>{status && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-lg text-sm font-medium ${status.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300' : 'bg-red-500/20 border border-red-500/50 text-red-300'}`}>{status.message}</motion.div>}</form></motion.div>
        </motion.div>
        {socialLinks.length > 0 && <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} viewport={{ once: true }} className="mt-20 pt-20 border-t border-white/10"><h3 className="text-xl font-bold text-white mb-6 text-center">Follow My Work</h3><div className="flex justify-center gap-4 flex-wrap">{socialLinks.map(([name, href]) => <motion.a key={name} href={href} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="px-6 py-2 glass-card rounded-full text-gray-400 hover:text-cyan-400 hover:border-emerald-500/40 transition-all duration-300 font-medium">{name}</motion.a>)}</div></motion.div>}
      </div>
    </section>
  );
}
