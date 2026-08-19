import React, { useState } from 'react';
import { useDocumentData } from '../hooks/useFirestoreData';
import { fallbackProfile } from '../data/fallbackPortfolio';

export default function Contact() {
  const { data: profile } = useDocumentData('siteContent', 'profile', fallbackProfile);
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    if (profile.contact?.email) {
      navigator.clipboard.writeText(profile.contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="contact" className="py-16 pb-24">
      {/* Section Tag */}
      <div className="section-tag mb-8">[Contact]</div>

      <div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Let's Build Something.
        </h2>

        <p className="text-sm sm:text-base text-zinc-400 mt-4 leading-relaxed">
          Have a project, opportunity, or idea you'd like to discuss? I'm open to software development opportunities and interested in working on products where I can contribute across frontend, backend, mobile, and modern development workflows.
        </p>

        {/* Contact Cards Grid */}
        <div className="grid sm:grid-cols-2 gap-3.5 mt-8">
          {/* Email Card */}
          <div className="rounded-xl border border-zinc-900 bg-[#09090b]/80 p-5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Email</span>
              <p className="text-sm font-medium text-zinc-200 mt-1 truncate">
                {profile.contact?.email}
              </p>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-900">
              <a
                href={`mailto:${profile.contact?.email}`}
                className="flex-1 inline-flex h-8 items-center justify-center gap-1 rounded bg-zinc-100 text-zinc-900 text-xs font-mono font-medium hover:bg-white transition"
              >
                Send Email ↗
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="px-3 h-8 inline-flex items-center justify-center rounded border border-zinc-800 bg-[#121318] text-xs font-mono text-zinc-300 hover:text-white transition"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Phone Card */}
          <div className="rounded-xl border border-zinc-900 bg-[#09090b]/80 p-5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Phone</span>
              <p className="text-sm font-medium text-zinc-200 mt-1">
                {profile.contact?.phone}
              </p>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-900">
              <a
                href={`tel:${profile.contact?.phone?.replace(/\s+/g, '')}`}
                className="flex-1 inline-flex h-8 items-center justify-center gap-1 rounded border border-zinc-800 bg-[#121318] text-zinc-200 text-xs font-mono font-medium hover:bg-zinc-800 transition"
              >
                Call / Message ↗
              </a>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-8 pt-8 border-t border-zinc-900">
          <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-3">
            Follow My Work & Professional Profiles
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.socialLinks?.linkedin && (
              <a
                href={profile.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-900 bg-[#09090b] hover:border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition"
              >
                <span className="text-blue-400">in</span>
                <span>LinkedIn</span>
                <span className="text-[10px] text-zinc-600">↗</span>
              </a>
            )}
            {profile.socialLinks?.github && (
              <a
                href={profile.socialLinks.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-900 bg-[#09090b] hover:border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition"
              >
                <span>GitHub</span>
                <span className="text-[10px] text-zinc-600">↗</span>
              </a>
            )}
            {profile.socialLinks?.jobstreet && (
              <a
                href={profile.socialLinks.jobstreet}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-900 bg-[#09090b] hover:border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition"
              >
                <span className="text-purple-400">JS</span>
                <span>JobStreet</span>
                <span className="text-[10px] text-zinc-600">↗</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

