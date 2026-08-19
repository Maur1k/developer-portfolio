import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResumeModal({ isOpen, onClose, resumeUrl = '/files/Resume.jpg' }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setHasError(false);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const isPdf = useMemo(() => {
    if (!resumeUrl) return false;
    const urlLower = resumeUrl.toLowerCase();
    return (
      urlLower.includes('.pdf') ||
      urlLower.includes('application/pdf') ||
      urlLower.includes('format=pdf') ||
      (!urlLower.includes('.jpg') &&
        !urlLower.includes('.jpeg') &&
        !urlLower.includes('.png') &&
        !urlLower.includes('.webp'))
    );
  }, [resumeUrl]);

  const downloadFilename = useMemo(() => {
    return isPdf ? 'Maurik_Angelo_Fernandez_Resume.pdf' : 'Maurik_Angelo_Fernandez_Resume.jpg';
  }, [isPdf]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative h-[92vh] w-full max-w-5xl rounded-2xl border border-zinc-800 bg-[#0d0e12] shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-[#09090b] shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs sm:text-sm font-mono font-semibold text-white">
                Maurik Angelo L. Fernandez — Resume
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase">
                {isPdf ? 'PDF' : 'Image'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={resumeUrl}
                download={downloadFilename}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-white text-zinc-950 text-xs font-mono font-medium hover:bg-zinc-200 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </a>

              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-mono text-zinc-300 hover:text-white transition"
                title="Open in new tab"
              >
                <span>Full Tab</span>
                <span className="text-[11px]">↗</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Document Viewer Container */}
          <div className="flex-1 w-full h-full bg-[#050507] overflow-hidden flex flex-col">
            {isPdf ? (
              <div className="w-full h-full flex-1 relative bg-[#1c1d22]">
                <iframe
                  src={`${resumeUrl}#view=FitH`}
                  title="Maurik Angelo L. Fernandez - Resume PDF Preview"
                  className="w-full h-full border-0"
                  onError={() => setHasError(true)}
                />
                {hasError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0d0e12] text-zinc-300">
                    <p className="text-sm font-medium mb-3">Unable to preview PDF directly in this browser frame.</p>
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-zinc-950 font-mono text-xs font-semibold hover:bg-zinc-200 transition"
                    >
                      <span>Open PDF in New Tab</span>
                      <span>↗</span>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex justify-center items-start">
                <img
                  src={resumeUrl}
                  alt="Maurik Angelo L. Fernandez Resume"
                  className="w-full max-w-3xl rounded-lg shadow-2xl border border-zinc-800/80 object-contain"
                  loading="eager"
                  onError={() => setHasError(true)}
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
