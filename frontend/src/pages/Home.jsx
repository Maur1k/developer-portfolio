import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Hero from './Hero';
import Experience from './Experience';
import Projects from './Projects';
import Skills from './Skills';
import Contact from './Contact';
import Footer from '../components/Footer';
import ResumeModal from '../components/ResumeModal';
import { useDocumentData } from '../hooks/useFirestoreData';
import { fallbackProfile } from '../data/fallbackPortfolio';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const { data: profile } = useDocumentData('siteContent', 'profile', fallbackProfile);
  const [activeSection, setActiveSection] = useState('about');
  const [isShortcutOpen, setIsShortcutOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const topOffset = element.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  const copyEmail = () => {
    if (profile.contact?.email) {
      navigator.clipboard.writeText(profile.contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'experience', 'projects', 'skills', 'contact'];
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    const handleKeyDown = (e) => {
      // If user is typing in an input/textarea, ignore
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;

      if (e.key === 'm' || e.key === 'M' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setIsShortcutOpen((prev) => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setIsResumeOpen(true);
      } else if (e.key === 'Escape') {
        setIsShortcutOpen(false);
        setIsResumeOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050507] text-[#ededed]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:gap-12 xl:gap-16">
          {/* Left Column: Fixed / Sticky Profile Sidebar */}
          <Sidebar
            profile={profile}
            activeSection={activeSection}
            onNavigate={scrollToSection}
            onOpenResume={() => setIsResumeOpen(true)}
          />

          {/* Right Column: Main Content Stream */}
          <main className="flex-1 min-w-0 py-6 lg:py-10 max-w-4xl">
            <Hero onThemeToggle={() => setIsShortcutOpen(true)} />
            <Experience />
            <Projects />
            <Skills />
            <Contact />
            <Footer />
          </main>
        </div>
      </div>

      {/* Resume Viewer Modal */}
      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
        resumeUrl={profile.resumeUrl || '/files/Resume.jpg'}
      />

      {/* Keyboard Shortcut / Developer Palette Modal (Press M) */}
      <AnimatePresence>
        {isShortcutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsShortcutOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-xl border border-zinc-800 bg-[#0d0e12] p-5 sm:p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <kbd className="keycap">M</kbd>
                  <span className="text-sm font-mono font-semibold text-white">
                    More & Quick Navigation
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShortcutOpen(false)}
                  className="text-xs font-mono text-zinc-500 hover:text-white"
                >
                  ESC
                </button>
              </div>

              {/* Quick Actions Grid */}
              <div className="space-y-3">
                <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                  Quick Actions
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      setIsShortcutOpen(false);
                      setIsResumeOpen(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white text-left transition"
                  >
                    <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                    <span>View Resume (R)</span>
                  </button>

                  <button
                    type="button"
                    onClick={copyEmail}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white text-left transition"
                  >
                    <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                    <span>{copied ? 'Copied Email!' : 'Copy Email'}</span>
                  </button>
                </div>

                {/* Section Jump */}
                <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 pt-2">
                  Jump to Section
                </p>

                <div className="space-y-1.5 text-xs font-mono">
                  {[
                    {
                      label: 'Featured: When in Baguio BackOps',
                      id: 'projects',
                      icon: (
                        <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                        </svg>
                      ),
                    },
                    {
                      label: 'Experience: When in Baguio Inc.',
                      id: 'experience',
                      icon: (
                        <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                        </svg>
                      ),
                    },
                    {
                      label: 'Tech Stack: 8 Core Domains',
                      id: 'skills',
                      icon: (
                        <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                        </svg>
                      ),
                    },
                    {
                      label: 'Get In Touch / Contact',
                      id: 'contact',
                      icon: (
                        <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                      ),
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        scrollToSection(item.id);
                        setIsShortcutOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-zinc-800/60 bg-zinc-900/40 hover:bg-zinc-800 hover:text-white text-zinc-300 transition"
                    >
                      <span className="flex items-center gap-2">
                        {item.icon}
                        <span>{item.label}</span>
                      </span>
                      <span className="text-zinc-600">↵</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Profiles Footer */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <div className="flex items-center gap-3">
                  <a
                    href={profile.socialLinks?.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-zinc-300"
                  >
                    LinkedIn ↗
                  </a>
                  <a
                    href={profile.socialLinks?.github}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-zinc-300"
                  >
                    GitHub ↗
                  </a>
                </div>
                <span className="text-emerald-500">● {profile.availability}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
