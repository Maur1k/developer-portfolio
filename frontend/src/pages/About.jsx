import React from 'react';
import { useDocumentData, useCollectionData } from '../hooks/useFirestoreData';
import { fallbackProfile, fallbackEducation, fallbackCertificates } from '../data/fallbackPortfolio';

export default function About() {
  const { data: profile } = useDocumentData('siteContent', 'profile', fallbackProfile);
  const { items: education } = useCollectionData('education', fallbackEducation, { orderBy: 'displayOrder' });
  const { items: certificates } = useCollectionData('certificates', fallbackCertificates, { orderBy: 'displayOrder' });

  return (
    <section className="max-w-4xl mx-auto py-16 px-4 sm:px-6">
      <div className="section-tag mb-4">[About]</div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6">
        {profile.aboutTitle || 'Building software, learning fast, and figuring things out along the way.'}
      </h1>

      <div className="space-y-4 text-base text-zinc-300 leading-relaxed">
        <p className="whitespace-pre-line">{profile.aboutMe}</p>
      </div>

      {/* What I Build Grid */}
      <div className="mt-12 pt-8 border-t border-zinc-900">
        <div className="section-tag mb-4">[What I Build]</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-zinc-900 bg-[#09090b]">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Frontend</p>
            <p className="text-sm font-medium text-zinc-200 mt-1">React · React Native · JavaScript · TypeScript</p>
          </div>
          <div className="p-4 rounded-xl border border-zinc-900 bg-[#09090b]">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Mobile</p>
            <p className="text-sm font-medium text-zinc-200 mt-1">Flutter · Dart · Android · iOS</p>
          </div>
          <div className="p-4 rounded-xl border border-zinc-900 bg-[#09090b]">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Backend</p>
            <p className="text-sm font-medium text-zinc-200 mt-1">Node.js · Express · Laravel · PHP · REST APIs</p>
          </div>
          <div className="p-4 rounded-xl border border-zinc-900 bg-[#09090b]">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Data & Services</p>
            <p className="text-sm font-medium text-zinc-200 mt-1">MySQL · Firebase · Firestore</p>
          </div>
        </div>
      </div>

      {/* Education */}
      {education.length > 0 && (
        <div className="mt-12 pt-8 border-t border-zinc-900">
          <div className="section-tag mb-4">[Education]</div>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="p-4 rounded-xl border border-zinc-900 bg-[#09090b]">
                <p className="text-base font-semibold text-white">{edu.degree}</p>
                {edu.major && <p className="text-sm text-zinc-400">{edu.major}</p>}
                <p className="text-xs text-zinc-500 mt-1">
                  {edu.institution} {edu.campus && `· ${edu.campus}`} {edu.duration && `· ${edu.duration}`}
                </p>
                {edu.description && <p className="text-xs text-zinc-400 mt-2">{edu.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <div className="mt-12 pt-8 border-t border-zinc-900">
          <div className="section-tag mb-4">[Certificates]</div>
          <div className="grid sm:grid-cols-2 gap-4">
            {certificates.map((cert) => {
              const credUrl = cert.credentialUrl || cert.credential_url;
              const pdf = cert.pdfUrl || cert.pdf_url;
              const img = cert.imageUrl || cert.image_url;

              return (
                <div
                  key={cert.id}
                  className="p-5 rounded-xl border border-zinc-900 bg-[#09090b] flex flex-col justify-between transition hover:border-amber-400/30 hover:bg-[#0c0d10]"
                >
                  <div>
                    {img && (
                      <img
                        src={img}
                        alt={cert.title}
                        className="w-full h-36 object-cover rounded-lg mb-3 border border-zinc-800"
                      />
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-white leading-snug">{cert.title}</h4>
                      {cert.date && (
                        <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                          {cert.date}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{cert.issuer}</p>
                  </div>

                  {(credUrl || pdf) && (
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-zinc-800/60">
                      {credUrl && (
                        <a
                          href={credUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
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
                          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition"
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

