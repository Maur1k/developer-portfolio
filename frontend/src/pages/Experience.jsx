import React, { useId, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCollectionData } from '../hooks/useFirestoreData';
import { fallbackExperience, fallbackEducation, fallbackCertificates } from '../data/fallbackPortfolio';

/*
  Shared editorial grid for every row (experience, education, credentials).
  Columns: year | role/company (flexible) | period/location (fixed) | expand control (fixed)
  Every row and every expanded panel uses the same template, so columns start at
  identical x-positions regardless of content length.
  Mobile collapses to: year | role/company | control, with period/location stacked beneath.
*/
const ROW_GRID =
  'grid grid-cols-[2.5rem_minmax(0,1fr)_1.5rem] md:grid-cols-[3rem_minmax(0,1fr)_12rem_1.5rem] gap-x-4';

// Existing education panel content (previously hard-coded in this component)
const EDUCATION_FALLBACK_DESCRIPTION =
  'Bachelor of Science in Information Technology specializing in Web and Mobile Technologies from Pangasinan State University – Urdaneta Campus.';
const EDUCATION_TAGS = ['Web & Mobile Technologies', 'Full-Stack Architecture', 'Database Systems', 'Software Engineering'];

function Chevron({ open }) {
  return (
    <svg
      className={`w-3.5 h-3.5 transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-90' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function EntryRow({ entry, isExpanded, onToggle, reduceMotion }) {
  const panelId = useId();
  const expandable = Boolean(entry.lead || entry.list.length > 0 || entry.tags.length > 0);

  const rowClasses = `group ${ROW_GRID} gap-y-2 w-full py-6 md:py-7 text-left md:items-baseline`;

  const cells = (
    <>
      <span className="col-start-1 row-start-1 pt-1 md:pt-0 font-mono text-xs tabular-nums text-slate-400 dark:text-zinc-600 group-hover:text-slate-600 dark:group-hover:text-zinc-400 transition-colors">
        {entry.year}
      </span>

      <span className="col-start-2 row-start-1 block min-w-0">
        <span className="block text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-white transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none">
          {entry.title}
          {entry.note && (
            <span className="ml-2 font-mono text-xs font-normal text-slate-500 dark:text-zinc-500">
              ({entry.note})
            </span>
          )}
        </span>
        <span className="mt-1 block text-sm text-slate-600 dark:text-zinc-400">
          <span className="font-medium text-slate-800 dark:text-zinc-300">{entry.primary}</span>
          {entry.secondary && <span className="text-slate-500 dark:text-zinc-500"> · {entry.secondary}</span>}
        </span>
      </span>

      <span className="col-start-2 col-span-2 row-start-2 md:col-span-1 md:col-start-3 md:row-start-1 block min-w-0 font-mono text-xs leading-relaxed text-slate-500 dark:text-zinc-500">
        {entry.side1 && <span className="block text-slate-700 dark:text-zinc-300">{entry.side1}</span>}
        {entry.side2 && <span className="block">{entry.side2}</span>}
      </span>

      {expandable && (
        <span className="col-start-3 row-start-1 md:col-start-4 justify-self-end pt-1 md:pt-0 text-slate-400 dark:text-zinc-600 group-hover:text-slate-700 dark:group-hover:text-zinc-300 transition-colors">
          <Chevron open={isExpanded} />
        </span>
      )}
    </>
  );

  return (
    <li className="border-b border-slate-200 dark:border-zinc-900">
      {expandable ? (
        <h3 className="m-0">
          <button
            type="button"
            onClick={() => onToggle(entry.id)}
            aria-expanded={isExpanded}
            aria-controls={panelId}
            className={`${rowClasses} cursor-pointer focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-amber-500/70`}
          >
            {cells}
          </button>
        </h3>
      ) : (
        <div className={rowClasses}>{cells}</div>
      )}

      <AnimatePresence initial={false}>
        {expandable && isExpanded && (
          <motion.div
            id={panelId}
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduceMotion ? { opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className={ROW_GRID}>
              <div className="col-start-2 col-span-2 min-w-0 pb-8 md:pb-10">
                <div className="max-w-2xl space-y-6">
                  {entry.lead && (
                    <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-zinc-300">
                      {entry.lead}
                    </p>
                  )}

                  {entry.list.length > 0 && (
                    <div>
                      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                        {entry.listLabel}
                      </p>
                      <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                        {entry.list.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-zinc-400">
                            <span className="mt-1 select-none text-slate-400 dark:text-zinc-600">▪</span>
                            <span className="leading-normal">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {entry.tags.length > 0 && (
                    <p className="font-mono text-xs leading-relaxed text-slate-500 dark:text-zinc-500">
                      {entry.tags.join(' · ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

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
        className="w-10 h-10 md:w-11 md:h-11 object-contain rounded-lg p-0.5 bg-white/5 border border-slate-200 dark:border-zinc-800 shrink-0 shadow-sm"
      />
    );
  }

  if (isCredly) {
    return (
      <div
        className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-sm"
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
      className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shrink-0 shadow-sm"
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
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        Credly Badge
      </span>
    );
  }

  if (isLinkedIn) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
        LinkedIn Certified
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Verified
    </span>
  );
}

function CredentialRow({ cert }) {
  const credUrl = cert.credentialUrl || cert.credential_url;
  const pdf = cert.pdfUrl || cert.pdf_url;

  return (
    <li className="border-b border-slate-200 dark:border-zinc-900 group">
      <div className={`${ROW_GRID} gap-y-3 py-6 md:py-7 md:items-center`}>
        {/* Badge Icon Column */}
        <div className="col-start-1 row-start-1 flex items-start pt-0.5">
          <CertificateBadge cert={cert} />
        </div>

        {/* Title, Issuer & Pill Column */}
        <div className="col-start-2 row-start-1 min-w-0 pr-4">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
              {cert.title}
            </h4>
            <CredentialPill cert={cert} />
          </div>
          {cert.issuer && (
            <p className="text-sm text-slate-600 dark:text-zinc-400">{cert.issuer}</p>
          )}
        </div>

        {/* Date & Verification CTA */}
        <div className="col-start-2 col-span-2 row-start-2 md:col-span-1 md:col-start-3 md:row-start-1 min-w-0 font-mono text-xs leading-relaxed text-slate-500 dark:text-zinc-500 flex md:flex-col items-start md:items-end justify-between md:justify-center gap-2">
          {cert.date && <span className="text-slate-700 dark:text-zinc-400 font-medium">{cert.date}</span>}
          {(credUrl || pdf) && (
            <div className="flex items-center gap-2">
              {credUrl && (
                <a
                  href={credUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111215] text-slate-700 dark:text-zinc-300 hover:border-amber-500/50 hover:text-amber-500 transition-all shadow-sm"
                >
                  <span>Verify</span>
                  <span aria-hidden="true">↗</span>
                </a>
              )}
              {pdf && (
                <a
                  href={pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span>PDF</span>
                  <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export default function Experience() {
  const { items: experiences } = useCollectionData('experience', fallbackExperience, { orderBy: 'displayOrder' });
  const { items: education } = useCollectionData('education', fallbackEducation, { orderBy: 'displayOrder' });
  const { items: certificates } = useCollectionData('certificates', fallbackCertificates, { orderBy: 'displayOrder' });
  const [expandedId, setExpandedId] = useState(experiences[0]?.id || 'when-in-baguio-contract');
  const reduceMotion = useReducedMotion();

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Normalize both record types into one row shape so they share the same grid
  const experienceEntries = experiences.map((exp) => ({
    id: exp.id,
    year: exp.year || '2026',
    title: exp.position,
    note: null,
    primary: exp.company,
    secondary: null,
    side1: exp.period,
    side2: exp.location,
    lead: exp.leadSummary,
    listLabel: 'Key Responsibilities',
    list: exp.responsibilities || [],
    tags: exp.technologies || [],
  }));

  const educationEntries = education.map((edu) => ({
    id: edu.id,
    year: edu.year || '2026',
    title: edu.degree,
    note: edu.major,
    primary: edu.institution,
    secondary: edu.campus,
    side1: edu.period || edu.duration,
    side2: edu.location,
    lead: edu.description || EDUCATION_FALLBACK_DESCRIPTION,
    listLabel: '',
    list: [],
    tags: EDUCATION_TAGS,
  }));

  const entries = [...experienceEntries, ...educationEntries];

  return (
    <section id="experience" className="py-20 lg:py-28 border-b border-slate-200 dark:border-zinc-900">
      {/* Section header — single, quiet fade (no translate) */}
      <motion.header
        initial={reduceMotion ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-14 lg:mb-20"
      >
        <p className="section-tag mb-5">02 — EXPERIENCE</p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Where I've Been Building
        </h2>
        <p className="mt-5 max-w-xl text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
          My professional journey started with an internship and quickly turned into an opportunity to continue working on production software.
        </p>
      </motion.header>

      {/* Experience + education rows */}
      <ul className="border-t border-slate-200 dark:border-zinc-900">
        {entries.map((entry) => (
          <EntryRow
            key={entry.id}
            entry={entry}
            isExpanded={expandedId === entry.id}
            onToggle={toggleExpand}
            reduceMotion={reduceMotion}
          />
        ))}
      </ul>

      {/* Certificates & Credentials */}
      {certificates.length > 0 && (
        <div className="mt-16 lg:mt-24">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-slate-400 dark:text-zinc-600">
              Certificates & Credentials
            </h3>
            <span className="font-mono text-xs text-slate-500 dark:text-zinc-500">
              {certificates.length} {certificates.length === 1 ? 'Credential' : 'Credentials'}
            </span>
          </div>

          <ul className="border-t border-slate-200 dark:border-zinc-900">
            {certificates.map((cert) => (
              <CredentialRow key={cert.id} cert={cert} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
