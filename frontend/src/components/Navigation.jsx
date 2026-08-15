import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const sectionMap = {
    '/': 'about',
    '/about': 'about',
    '/projects': 'projects',
    '/skills': 'skills',
    '/experience': 'experience',
    '/contact': 'contact',
  };

  const scrollToSection = (sectionId) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavClick = (event, path) => {
    event.preventDefault();
    setIsOpen(false);

    if (location.pathname === '/') {
      const sectionId = sectionMap[path];
      if (sectionId) {
        scrollToSection(sectionId);
        return;
      }
    }

    navigate(path);
  };

  const links = [
    { label: 'about', path: '/about' },
    { label: 'experience', path: '/experience' },
    { label: 'projects', path: '/projects' },
    { label: 'tech stack', path: '/skills' },
    { label: 'contact', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050507]/90 backdrop-blur-md border-b border-zinc-900">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-3.5">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-sm font-mono font-bold text-white flex items-center gap-2">
            <span>Maurik Angelo L. Fernandez</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4 font-mono text-xs">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={(event) => handleNavClick(event, link.path)}
                className="text-zinc-400 hover:text-white transition-colors py-1"
              >
                {link.label} ↗
              </Link>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="md:hidden text-zinc-400 hover:text-white p-1 rounded"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="md:hidden pt-3 pb-2 space-y-1 font-mono text-xs"
          >
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={(event) => handleNavClick(event, link.path)}
                className="block px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded transition-colors"
              >
                {link.label} ↗
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </nav>
  );
}

