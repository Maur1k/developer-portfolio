import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDocumentData } from '../hooks/useFirestoreData';
import { fallbackProfile } from '../data/fallbackPortfolio';
import { trackEvent } from '../services/analytics';

export default function Contact() {
  const { data: profile } = useDocumentData('siteContent', 'profile', fallbackProfile);
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    if (profile.contact?.email) {
      navigator.clipboard.writeText(profile.contact.email);
      setCopied(true);
      trackEvent('contact_click', 'Email Copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="contact" className="py-16 pb-24">
      {/* Section Tag */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="section-tag mb-8"
      >
        [Contact]
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Let's Build Something.
        </h2>

        <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 mt-4 leading-relaxed">
          Have a project, opportunity, or idea you'd like to discuss? I'm open to software development opportunities and interested in working on products where I can contribute across frontend, backend, mobile, and modern development workflows.
        </p>

        {/* Contact Cards Grid */}
        <div className="grid sm:grid-cols-2 gap-3.5 mt-8">
          {/* Email Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="rounded-xl border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#09090b]/80 hover:border-slate-300 dark:hover:border-zinc-700/80 p-5 flex flex-col justify-between shadow-sm dark:shadow-none glow-card"
          >
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-500">Email</span>
              <p className="text-sm font-medium text-slate-800 dark:text-zinc-200 mt-1 truncate">
                {profile.contact?.email}
              </p>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-zinc-900">
              <a
                href={`mailto:${profile.contact?.email}`}
                onClick={() => trackEvent('contact_click', 'Send Email Link')}
                className="flex-1 inline-flex h-8 items-center justify-center gap-1 rounded bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-mono font-medium hover:bg-slate-800 dark:hover:bg-white transition shadow-sm"
              >
                Send Email ↗
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="px-3 h-8 inline-flex items-center justify-center rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121318] text-xs font-mono text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition cursor-pointer shadow-sm"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </motion.div>

          {/* Phone Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="rounded-xl border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#09090b]/80 hover:border-slate-300 dark:hover:border-zinc-700/80 p-5 flex flex-col justify-between shadow-sm dark:shadow-none glow-card"
          >
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-500">Phone</span>
              <p className="text-sm font-medium text-slate-800 dark:text-zinc-200 mt-1">
                {profile.contact?.phone}
              </p>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-zinc-900">
              <a
                href={`tel:${profile.contact?.phone?.replace(/\s+/g, '')}`}
                onClick={() => trackEvent('contact_click', 'Phone Link')}
                className="flex-1 inline-flex h-8 items-center justify-center gap-1 rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121318] text-slate-700 dark:text-zinc-200 text-xs font-mono font-medium hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition shadow-sm"
              >
                Call / Message ↗
              </a>
            </div>
          </motion.div>
        </div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="mt-8 pt-8 border-t border-slate-200 dark:border-zinc-900"
        >
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-500 mb-3">
            Follow My Work & Professional Profiles
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.socialLinks?.linkedin && (
              <a
                href={profile.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('linkedin_click', 'Contact Section')}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#09090b] hover:border-slate-300 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-mono transition shadow-sm"
              >
                <span className="text-blue-500 dark:text-blue-400 font-bold">in</span>
                <span>LinkedIn</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-600">↗</span>
              </a>
            )}
            {profile.socialLinks?.github && (
              <a
                href={profile.socialLinks.github}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('github_click', 'Contact Section')}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#09090b] hover:border-slate-300 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-mono transition shadow-sm"
              >
                <span>GitHub</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-600">↗</span>
              </a>
            )}
            {profile.socialLinks?.jobstreet && (
              <a
                href={profile.socialLinks.jobstreet}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('contact_click', 'JobStreet')}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#09090b] hover:border-slate-300 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-mono transition shadow-sm"
              >
                <span className="text-purple-500 dark:text-purple-400 font-bold">JS</span>
                <span>JobStreet</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-600">↗</span>
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

