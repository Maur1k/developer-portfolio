import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Hero from './Hero';
import Experience from './Experience';
import Projects from './Projects';
import Skills from './Skills';
import Contact from './Contact';
import Footer from '../components/Footer';
import { useDocumentData } from '../hooks/useFirestoreData';
import { fallbackProfile } from '../data/fallbackPortfolio';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const { data: profile } = useDocumentData('siteContent', 'profile', fallbackProfile);
  const [activeSection, setActiveSection] = useState('about');
  const [isShortcutOpen, setIsShortcutOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const topOffset = element.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
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
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setIsShortcutOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsShortcutOpen(false);
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

      {/* Keyboard Shortcut / Quick Info Modal (Press D) */}
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
              className="w-full max-w-md rounded-xl border border-zinc-800 bg-[#0d0e12] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <kbd className="keycap">D</kbd>
                  <span className="text-sm font-mono font-semibold text-white">Quick Navigation & Shortcuts</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShortcutOpen(false)}
                  className="text-xs font-mono text-zinc-500 hover:text-white"
                >
                  ESC
                </button>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <p className="text-zinc-400 pb-1">Jump directly to any section:</p>
                {[
                  { label: '1. About & Hero', id: 'about' },
                  { label: '2. Professional Experience', id: 'experience' },
                  { label: '3. Featured & Selected Projects', id: 'projects' },
                  { label: '4. Core Tech Stack', id: 'skills' },
                  { label: '5. Contact & Connect', id: 'contact' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      scrollToSection(item.id);
                      setIsShortcutOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded border border-zinc-800/60 bg-zinc-900/60 hover:bg-zinc-800 hover:text-white text-zinc-300 transition"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>{profile.name}</span>
                <span>{profile.availability}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}