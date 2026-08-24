import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePhotoModal({ isOpen, onClose, photoSrc, profile }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const name = profile?.name || 'Maurik Angelo L. Fernandez';
  const title = profile?.professionalTitle || 'Software Developer';
  const location = profile?.location || 'Urdaneta City, Pangasinan';
  const availability = profile?.availability || 'Open to software engineering roles & collaborations';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0d0e12] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/80 bg-[#09090b]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-zinc-400">Profile Photo</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Photo Display Frame */}
          <div className="p-6 flex flex-col items-center bg-[#07080a]">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-2 border-zinc-800/90 shadow-2xl bg-zinc-950 group">
              <img
                src={photoSrc}
                alt={name}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/img/Fernandez_Maurik_Angelo_L.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Profile Info Details */}
            <div className="mt-5 text-center w-full">
              <div className="flex items-center justify-center gap-1.5">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {name}
                </h3>
                <svg
                  className="w-4 h-4 text-blue-500 shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-label="Verified developer"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>

              <p className="text-xs text-zinc-300 font-medium mt-0.5">
                {title}
              </p>
              <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                Full Stack · Web · Mobile
              </p>

              {/* Status Badge */}
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-900/60 bg-emerald-950/40 text-emerald-400 text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>{availability}</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between p-3.5 px-5 border-t border-zinc-800/80 bg-[#09090b] text-xs font-mono">
            <span className="text-zinc-500">{location}</span>
            <a
              href={photoSrc}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 bg-[#121318] hover:bg-zinc-800 transition-colors"
            >
              <span>View Full Resolution</span>
              <span className="text-[11px]">↗</span>
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
