import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pt-8 pb-12 border-t border-zinc-900 text-xs font-mono text-zinc-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-zinc-400 font-semibold">Maurik Angelo L. Fernandez</p>
          <p className="text-zinc-600 mt-0.5">Software Developer · Full-Stack & Mobile Development</p>
        </div>

        <div className="flex flex-col sm:items-end gap-1 text-[11px]">
          <p>© {currentYear} Maurik Angelo L. Fernandez. All rights reserved.</p>
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Available for opportunities</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

