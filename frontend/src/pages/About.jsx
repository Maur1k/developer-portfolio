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
        Building practical software with modern engineering workflows.
      </h1>

      <div className="space-y-4 text-base text-zinc-300 leading-relaxed">
        <p className="whitespace-pre-line">{profile.aboutMe}</p>
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
            {certificates.map((cert) => (
              <div key={cert.id} className="p-4 rounded-xl border border-zinc-900 bg-[#09090b]">
                <p className="text-sm font-semibold text-white">{cert.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{cert.issuer}</p>
                {cert.date && <p className="text-[11px] font-mono text-zinc-600 mt-1">{cert.date}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

