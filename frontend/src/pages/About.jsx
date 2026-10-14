import React, { useState } from 'react';
import { useDocumentData, useCollectionData } from '../hooks/useFirestoreData';
import { fallbackProfile, fallbackEducation, fallbackCertificates } from '../data/fallbackPortfolio';

function CertificateBadge({ cert }) {
  const [imageError, setImageError] = useState(false);
  const img = cert.imageUrl || cert.image_url;
  const url = cert.credentialUrl || cert.credential_url || '';
  const isCredly = url.includes('credly.com') || (cert.issuer || '').toLowerCase().includes('cisco');

  if (img && !imageError) {
    return (
      <img
        src={img}
        alt={cert.title}
        onError={() => setImageError(true)}
        className="w-10 h-10 object-contain rounded-lg p-0.5 bg-white/5 border border-slate-200 dark:border-zinc-800 shrink-0 shadow-sm"
      />
    );
  }

  if (isCredly) {
    return (
      <div
        className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-sm"
        title="Credly Verified Badge"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-500" fill="currentColor" aria-hidden="true">
          <path d="M12 2l7.5 4.3v8.6L12 22l-7.5-4.3V6.3L12 2zm0 2.3L6.5 7.4v6.8L12 17.4l5.5-3.2V7.4L12 4.3z" />
          <path d="M11 13.8l-2.4-2.4 1.4-1.4 1 1 3.2-3.2 1.4 1.4z" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shrink-0 shadow-sm"
      title="LinkedIn Certified"
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-sky-400" fill="currentColor" aria-hidden="true">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 15l-4-4 1.41-1.41L10 13.17l6.59-6.59L18 8l-8 8z" />
      </svg>
    </div>
  );
}

function CredentialPill({ cert }) {
  const url = cert.credentialUrl || cert.credential_url || '';
  const isCredly = url.includes('credly.com') || (cert.platform || '').toLowerCase().includes('credly');
  const isLinkedIn = url.includes('linkedin.com') || url.includes('lnkd.in') || (cert.platform || '').toLowerCase().includes('linkedin');

  if (isCredly) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        Credly Badge
      </span>
    );
  }

  if (isLinkedIn) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
        LinkedIn Certified
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Verified
    </span>
  );
}

export default function About() {
  const { data: profile } = useDocumentData('siteContent', 'profile', fallbackProfile);
  const { items: education } = useCollectionData('education', fallbackEducation, { orderBy: 'displayOrder' });
  const { items: certificates } = useCollectionData('certificates', fallbackCertificates, { orderBy: 'displayOrder' });

  return (
    <section className="max-w-4xl mx-auto py-16 px-4 sm:px-6">
      <div className="section-tag mb-4">[About]</div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
        {profile.aboutTitle || 'Building software, learning fast, and figuring things out along the way.'}
      </h1>

      <div className="space-y-4 text-base text-slate-600 dark:text-zinc-300 leading-relaxed">
        <p className="whitespace-pre-line">{profile.aboutMe}</p>
      </div>

      {/* What I Build Grid */}
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-zinc-900">
        <div className="section-tag mb-4">[What I Build]</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#09090b] shadow-sm dark:shadow-none">
            <p className="text-xs font-mono text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Frontend</p>
            <p className="text-sm font-medium text-slate-800 dark:text-zinc-200 mt-1">React · React Native · JavaScript · TypeScript</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#09090b] shadow-sm dark:shadow-none">
            <p className="text-xs font-mono text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Mobile</p>
            <p className="text-sm font-medium text-slate-800 dark:text-zinc-200 mt-1">Flutter · Dart · Android · iOS</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#09090b] shadow-sm dark:shadow-none">
            <p className="text-xs font-mono text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Backend</p>
            <p className="text-sm font-medium text-slate-800 dark:text-zinc-200 mt-1">Node.js · Express · Laravel · PHP · REST APIs</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#09090b] shadow-sm dark:shadow-none">
            <p className="text-xs font-mono text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Data & Services</p>
            <p className="text-sm font-medium text-slate-800 dark:text-zinc-200 mt-1">MySQL · Firebase · Firestore</p>
          </div>
        </div>
      </div>

      {/* Education */}
      {education.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-zinc-900">
          <div className="section-tag mb-4">[Education]</div>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="p-4 rounded-xl border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#09090b] shadow-sm dark:shadow-none">
                <p className="text-base font-semibold text-slate-900 dark:text-white">{edu.degree}</p>
                {edu.major && <p className="text-sm text-slate-600 dark:text-zinc-400">{edu.major}</p>}
                <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                  {edu.institution} {edu.campus && `· ${edu.campus}`} {edu.duration && `· ${edu.duration}`}
                </p>
                {edu.description && <p className="text-xs text-slate-600 dark:text-zinc-400 mt-2">{edu.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-zinc-900">
          <div className="section-tag mb-4">[Certificates]</div>
          <div className="grid sm:grid-cols-2 gap-4">
            {certificates.map((cert) => {
              const credUrl = cert.credentialUrl || cert.credential_url;
              const pdf = cert.pdfUrl || cert.pdf_url;
              const img = cert.imageUrl || cert.image_url;

              return (
                <div
                  key={cert.id}
                  className="p-5 rounded-xl border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#09090b] flex flex-col justify-between transition hover:border-amber-500/40 hover:bg-slate-50 dark:hover:bg-[#0c0d10] shadow-sm dark:shadow-none group"
                >
                  <div className="flex items-start gap-3.5">
                    <CertificateBadge cert={cert} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug group-hover:text-amber-500 transition-colors">
                          {cert.title}
                        </h4>
                        {cert.date && (
                          <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700/50">
                            {cert.date}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">{cert.issuer}</p>
                      <div className="mt-2.5">
                        <CredentialPill cert={cert} />
                      </div>
                    </div>
                  </div>

                  {(credUrl || pdf) && (
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-200 dark:border-zinc-800/60">
                      {credUrl && (
                        <a
                          href={credUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition"
                        >
                          <span>Verify Credential</span>
                          <span className="text-[10px]">↗</span>
                        </a>
                      )}
                      {pdf && (
                        <a
                          href={pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition"
                        >
                          <span>View PDF</span>
                          <span className="text-[10px]">↗</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
