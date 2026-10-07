import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { trackEvent } from '../services/analytics';
import ThemeToggle from './ThemeToggle';

// ── Mobile Top Bar + Slide-in Drawer ──────────────────────────────────────
// Only rendered on mobile (<lg). Desktop uses the sticky Sidebar directly.

function MobileNav({ profile, activeSection, onNavigate, onOpenResume, onOpenPhoto }) {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { number: '01', label: 'About', id: 'about' },
    { number: '02', label: 'Experience', id: 'experience' },
    { number: '03', label: 'Projects', id: 'projects' },
    { number: '04', label: 'Tech Stack', id: 'skills' },
    { number: '05', label: 'Contact', id: 'contact' },
  ];

  const photoSrc = profile?.profilePhoto || '/img/Fernandez_Maurik_Angelo_L.jpg';
  const fullName = profile?.name || 'Maurik Angelo L. Fernandez';
  const nameParts = fullName.trim().split(' ');
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const firstNames = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : fullName;
  const linkedinUrl = profile?.socialLinks?.linkedin || 'https://www.linkedin.com/in/maurik-angelo-fernandez-ab835716a/';

  // Close drawer on route navigation
  const handleNav = (id) => {
    setOpen(false);
    trackEvent('page_view', `Section: ${navLinks.find(l => l.id === id)?.label}`);
    onNavigate(id);
  };

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* ── Sticky Top Bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 sm:px-6 bg-[#f8fafc]/90 dark:bg-[#050507]/90 backdrop-blur-md border-b border-slate-200/60 dark:border-zinc-900/60">
        {/* Left: avatar + name */}
        <button
          type="button"
          onClick={onOpenPhoto}
          aria-label="View profile photo"
          className="flex items-center gap-3 min-w-0 focus:outline-none group"
        >
          <img
            src={photoSrc}
            alt={fullName}
            className="w-8 h-8 rounded-full object-cover object-top border border-slate-200 dark:border-zinc-800 group-hover:border-amber-500/50 transition-colors shrink-0"
            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/img/Fernandez_Maurik_Angelo_L.jpg'; }}
          />
          <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white truncate">
            {firstNames} {lastName}
          </span>
        </button>

        {/* Right: theme toggle + hamburger */}
        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle
            variant="icon"
            className="!rounded-md !shadow-none !border-slate-200 dark:!border-zinc-800"
          />
          <button
            type="button"
            onClick={() => setOpen(prev => !prev)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-md border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700 hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none"
          >
            {/* Animated hamburger → X */}
            <motion.span
              animate={{ rotate: open ? 45 : 0, y: open ? 7 : 0 }}
              transition={{ duration: 0.22 }}
              className="block w-4 h-[1.5px] bg-current rounded-full origin-center"
            />
            <motion.span
              animate={{ opacity: open ? 0 : 1, scaleX: open ? 0 : 1 }}
              transition={{ duration: 0.18 }}
              className="block w-4 h-[1.5px] bg-current rounded-full"
            />
            <motion.span
              animate={{ rotate: open ? -45 : 0, y: open ? -7 : 0 }}
              transition={{ duration: 0.22 }}
              className="block w-4 h-[1.5px] bg-current rounded-full origin-center"
            />
          </button>
        </div>
      </header>

      {/* ── Drawer + Backdrop ──────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed top-0 left-0 z-50 h-full w-[280px] flex flex-col bg-[#f8fafc] dark:bg-[#09090b] border-r border-slate-200 dark:border-zinc-900 overflow-y-auto"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between h-14 px-5 border-b border-slate-200 dark:border-zinc-900 shrink-0">
                <button
                  type="button"
                  onClick={() => { setOpen(false); onOpenPhoto(); }}
                  className="flex items-center gap-3 min-w-0 group focus:outline-none"
                >
                  <img
                    src={photoSrc}
                    alt={fullName}
                    className="w-8 h-8 rounded-full object-cover object-top border border-slate-200 dark:border-zinc-800 group-hover:border-amber-500/50 transition-colors shrink-0"
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/img/Fernandez_Maurik_Angelo_L.jpg'; }}
                  />
                  <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white truncate">
                    {firstNames} {lastName}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Identity block */}
              <div className="px-5 pt-6 pb-4">
                <h2 className="text-xl font-bold tracking-tight leading-snug text-slate-900 dark:text-white">
                  <span className="block">{firstNames}</span>
                  {lastName && <span className="block">{lastName}</span>}
                </h2>
                <p className="mt-2 text-xs font-mono text-slate-600 dark:text-zinc-400">
                  {profile?.professionalTitle || 'Software Developer'}
                </p>
                {profile?.subtitle && (
                  <p className="mt-0.5 text-[11px] font-mono text-slate-500 dark:text-zinc-500">
                    {profile.subtitle}
                  </p>
                )}
              </div>

              {/* Nav links */}
              <nav className="px-5 pb-4 space-y-0.5">
                {navLinks.map(link => {
                  const isActive = activeSection === link.id;
                  return (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => handleNav(link.id)}
                      className={`group w-full flex items-center gap-3 py-2.5 pl-3 -ml-3 border-l-2 bg-transparent text-left outline-none focus:outline-none transition-colors duration-200 ${
                        isActive
                          ? 'border-amber-500 text-slate-900 dark:text-white'
                          : 'border-transparent text-slate-500 dark:text-zinc-500 hover:border-slate-300 dark:hover:border-zinc-700 hover:text-slate-800 dark:hover:text-zinc-300'
                      }`}
                    >
                      <span className="font-mono text-[10px] tabular-nums text-slate-400 dark:text-zinc-600">
                        {link.number}
                      </span>
                      <span className="text-sm tracking-wide">{link.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Bottom: availability + contact + actions */}
              <div className="mt-auto px-5 py-6 border-t border-slate-200 dark:border-zinc-900 space-y-4">
                {/* Availability */}
                <div className="space-y-1 text-xs font-mono">
                  {profile?.availability && (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                      <span>{profile.availability}</span>
                    </div>
                  )}
                  {profile?.location && (
                    <p className="text-slate-500 dark:text-zinc-500">{profile.location}</p>
                  )}
                </div>

                {/* Contact */}
                <div className="space-y-1 text-xs font-mono">
                  <a
                    href={`mailto:${profile?.contact?.email || 'maurikfernandez123@gmail.com'}`}
                    onClick={() => trackEvent('contact_click', 'Mobile Drawer Email')}
                    className="block text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors truncate"
                  >
                    {profile?.contact?.email || 'maurikfernandez123@gmail.com'}
                  </a>
                  {profile?.contact?.phone && (
                    <a
                      href={`tel:${profile.contact.phone.replace(/\s+/g, '')}`}
                      onClick={() => trackEvent('contact_click', 'Mobile Drawer Phone')}
                      className="block text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {profile.contact.phone}
                    </a>
                  )}
                </div>

                {/* Resume + Socials */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      trackEvent('resume_view', 'Mobile Drawer Resume');
                      onOpenResume();
                    }}
                    className="flex-1 inline-flex items-center justify-center h-9 rounded-md border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    Resume
                  </button>

                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent('linkedin_click', 'Mobile Drawer')}
                    aria-label="LinkedIn"
                    className="p-2 rounded-md border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>

                  {profile?.socialLinks?.github && (
                    <a
                      href={profile.socialLinks.github}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackEvent('github_click', 'Mobile Drawer')}
                      aria-label="GitHub"
                      className="p-2 rounded-md border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Desktop Sidebar (unchanged) ────────────────────────────────────────────
function DesktopSidebar({ profile, activeSection, onNavigate, onOpenResume, onOpenPhoto }) {
  const navLinks = [
    { number: '01', label: 'About', id: 'about' },
    { number: '02', label: 'Experience', id: 'experience' },
    { number: '03', label: 'Projects', id: 'projects' },
    { number: '04', label: 'Tech Stack', id: 'skills' },
    { number: '05', label: 'Contact', id: 'contact' },
  ];

  const photoSrc = profile?.profilePhoto || '/img/Fernandez_Maurik_Angelo_L.jpg';
  const linkedinUrl = profile?.socialLinks?.linkedin || 'https://www.linkedin.com/in/maurik-angelo-fernandez-ab835716a/';
  const fullName = profile?.name || 'Maurik Angelo L. Fernandez';
  const nameParts = fullName.trim().split(' ');
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const firstNames = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : fullName;

  return (
    <aside className="w-[280px] xl:w-[300px] shrink-0 sticky top-0 h-screen flex flex-col justify-between py-8 sm:py-10 px-7 z-20 border-r border-slate-200 dark:border-zinc-900">
      <div className="space-y-10">
        {/* Identity */}
        <div>
          <button
            type="button"
            onClick={onOpenPhoto}
            aria-label="View profile photo"
            title="Click to view full photo & info"
            className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-800 hover:border-amber-500/50 flex items-center justify-center cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 mb-5"
          >
            <img
              src={photoSrc}
              alt={fullName}
              className="w-full h-full object-cover object-top"
              onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/img/Fernandez_Maurik_Angelo_L.jpg'; }}
            />
          </button>

          <h1 className="text-2xl xl:text-[26px] font-bold tracking-tight leading-[1.15] text-slate-900 dark:text-white">
            <span className="block">{firstNames}</span>
            {lastName && <span className="block">{lastName}</span>}
          </h1>

          <p className="mt-3 text-xs font-mono text-slate-600 dark:text-zinc-400">
            {profile?.professionalTitle || 'Software Developer'}
          </p>
          {profile?.subtitle && (
            <p className="mt-1 text-[11px] font-mono text-slate-500 dark:text-zinc-500">
              {profile.subtitle}
            </p>
          )}
        </div>

        {/* Numbered Navigation */}
        <nav className="space-y-0.5">
          {navLinks.map(link => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => {
                  trackEvent('page_view', `Section: ${link.label}`);
                  onNavigate(link.id);
                }}
                className={`group w-full flex items-center gap-3 py-2 pl-3 -ml-3 border-l-2 bg-transparent text-left outline-none focus:outline-none focus-visible:outline-none focus-visible:border-amber-500 focus-visible:text-slate-900 dark:focus-visible:text-white transition-colors duration-200 ${
                  isActive
                    ? 'border-amber-500 text-slate-900 dark:text-white'
                    : 'border-transparent text-slate-500 dark:text-zinc-500 hover:border-slate-300 dark:hover:border-zinc-700 hover:text-slate-800 dark:hover:text-zinc-300'
                }`}
              >
                <span className="font-mono text-[10px] tabular-nums text-slate-400 dark:text-zinc-600 group-hover:text-slate-500 dark:group-hover:text-zinc-500">
                  {link.number}
                </span>
                <span className="text-xs tracking-wide">{link.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className="pt-8 border-t border-slate-200 dark:border-zinc-900 space-y-4">
        <div className="space-y-1 text-xs font-mono">
          {profile?.availability && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>{profile.availability}</span>
            </div>
          )}
          {profile?.location && (
            <p className="text-slate-500 dark:text-zinc-500">{profile.location}</p>
          )}
        </div>

        <div className="space-y-1 text-xs font-mono">
          <a
            href={`mailto:${profile?.contact?.email || 'maurikfernandez123@gmail.com'}`}
            onClick={() => trackEvent('contact_click', 'Sidebar Email')}
            className="block text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors truncate"
          >
            {profile?.contact?.email || 'maurikfernandez123@gmail.com'}
          </a>
          {profile?.contact?.phone && (
            <a
              href={`tel:${profile.contact.phone.replace(/\s+/g, '')}`}
              onClick={() => trackEvent('contact_click', 'Sidebar Phone')}
              className="block text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {profile.contact.phone}
            </a>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              trackEvent('resume_view', 'Sidebar Resume Button');
              onOpenResume();
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-md border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
          >
            Resume
          </button>

          <ThemeToggle
            variant="icon"
            className="!rounded-md !shadow-none !border-slate-200 dark:!border-zinc-800"
          />

          <a
            href={linkedinUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent('linkedin_click', 'Sidebar')}
            aria-label="LinkedIn"
            className="p-2 rounded-md border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>

          {profile?.socialLinks?.github && (
            <a
              href={profile.socialLinks.github}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('github_click', 'Sidebar')}
              aria-label="GitHub"
              className="p-2 rounded-md border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}

// ── Main export — renders the correct variant per breakpoint ───────────────
export default function Sidebar(props) {
  return (
    <>
      {/* Mobile: sticky top bar + drawer (hidden on lg+) */}
      <div className="lg:hidden">
        <MobileNav {...props} />
      </div>

      {/* Desktop: original sticky sidebar (hidden below lg) */}
      <div className="hidden lg:block">
        <DesktopSidebar {...props} />
      </div>
    </>
  );
}
