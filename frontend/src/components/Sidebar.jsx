import React from 'react';

export default function Sidebar({ profile, activeSection, onNavigate, onOpenResume }) {
  const navLinks = [
    { label: 'about', id: 'about' },
    { label: 'experience', id: 'experience' },
    { label: 'projects', id: 'projects' },
    { label: 'tech stack', id: 'skills' },
    { label: 'contact', id: 'contact' },
  ];

  const photoSrc = profile?.profilePhoto || '/img/Fernandez_Maurik_Angelo_L.jpg';
  const linkedinUrl =
    profile?.socialLinks?.linkedin ||
    'https://www.linkedin.com/in/maurik-angelo-fernandez-ab835716a/';

  return (
    <aside className="w-full lg:w-[340px] xl:w-[380px] lg:shrink-0 lg:sticky lg:top-0 lg:h-screen flex flex-col justify-between p-5 sm:p-6 lg:py-10 z-20">
      <div className="space-y-4 lg:space-y-6">
        {/* Profile Image + Name & Title: Always side-by-side in a row on all screens */}
        <div className="flex items-center gap-3 sm:gap-3.5">
          {/* Profile Image & Status */}
          <div className="relative group shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-[#121318] border border-zinc-800 flex items-center justify-center shadow-xl relative">
              <img
                src={photoSrc}
                alt={profile?.name || 'Maurik Angelo L. Fernandez'}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/img/Fernandez_Maurik_Angelo_L.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
            {/* Online / Open Indicator */}
            <div
              className="absolute -bottom-1 -right-1 bg-[#09090b] border border-zinc-800 rounded-full p-0.5 sm:p-1 shadow-lg"
              title="Open to opportunities"
            >
              <span className="block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          {/* Name & Title in 1 line */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="text-sm sm:text-base xl:text-[17px] font-bold tracking-tight text-white whitespace-nowrap">
                {profile?.name || 'Maurik Angelo L. Fernandez'}
              </h1>
              {/* Verified Badge */}
              <svg
                className="w-4 h-4 text-blue-500 shrink-0 inline-block"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-label="Verified developer"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <p className="text-xs text-zinc-300 font-medium mt-0.5 truncate">
              {profile?.professionalTitle || 'Software Developer'}
            </p>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5 whitespace-nowrap">
              Full Stack · Web · Mobile
            </p>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="space-y-2 text-xs text-zinc-400 pt-1">
          <div className="flex items-center gap-2 text-zinc-400">
            <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{profile?.location || 'Urdaneta City, Pangasinan'}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <a
              href={`mailto:${profile?.contact?.email || 'maurikfernandez123@gmail.com'}`}
              className="hover:text-zinc-200 transition-colors truncate"
            >
              {profile?.contact?.email || 'maurikfernandez123@gmail.com'}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a
              href={`tel:${(profile?.contact?.phone || '+639277975100').replace(/\s+/g, '')}`}
              className="hover:text-zinc-200 transition-colors"
            >
              {profile?.contact?.phone || '+63 927 797 5100'}
            </a>
          </div>
        </div>

        {/* Action Button: Book a call / Get in touch */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => onNavigate('contact')}
            className="w-full inline-flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-zinc-800 bg-[#121318] hover:bg-zinc-800/80 hover:border-zinc-700 text-zinc-200 text-xs sm:text-sm font-medium transition-all duration-200 group"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Get In Touch
            </span>
            <span className="text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-0.5">
              ↗
            </span>
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="pt-2 space-y-1">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => onNavigate(link.id)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-mono transition-colors text-left ${
                  isActive
                    ? 'text-white bg-zinc-800/50 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40'
                }`}
              >
                <span>{link.label}</span>
                <span className="text-[11px] opacity-70">↗</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Bar */}
      <div className="pt-6 border-t border-zinc-900 flex items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={onOpenResume}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-800 bg-[#121318] hover:bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Resume
        </button>

        {/* LinkedIn */}
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
          className="p-2 rounded-lg border border-zinc-800 bg-[#121318] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        </a>

        {/* GitHub */}
        {profile.socialLinks?.github && (
          <a
            href={profile.socialLinks.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="p-2 rounded-lg border border-zinc-800 bg-[#121318] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        )}
      </div>
    </aside>
  );
}

