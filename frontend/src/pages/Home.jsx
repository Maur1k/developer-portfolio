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

      if (e.key === 'd' || e.key === 'D') {
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

      {/* Keyboard Shortcut / Developer Palette Modal (Press D) */}
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
                  <kbd className="keycap">D</kbd>
                  <span className="text-sm font-mono font-semibold text-white">
                    Developer Command Menu
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
                    <span>📄</span>
                    <span>View Resume (R)</span>
                  </button>

                  <button
                    type="button"
                    onClick={copyEmail}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white text-left transition"
                  >
                    <span>✉️</span>
                    <span>{copied ? 'Copied Email!' : 'Copy Email'}</span>
                  </button>
                </div>

                {/* Section Jump */}
                <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 pt-2">
                  Jump to Section
                </p>

                <div className="space-y-1.5 text-xs font-mono">
                  {[
                    { label: 'Featured: When in Baguio (WIBE)', id: 'projects', icon: '🚀' },
                    { label: 'Experience: When in Baguio Inc.', id: 'experience', icon: '💼' },
                    { label: 'Tech Stack: 8 Core Domains', id: 'skills', icon: '⚡' },
                    { label: 'Get In Touch / Contact', id: 'contact', icon: '📬' },
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
                        <span>{item.icon}</span>
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
