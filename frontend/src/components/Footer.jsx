import React from 'react';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'Quick Links': [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/maurik-angelo-ab835716a/' },
      { label: 'JobStreet', href: 'https://ph.jobstreet.com/profiles/maurikangelo-fernandez-7mNlX0tM26' },
    ],
    'Contact': [
      { label: 'Email', href: 'mailto:maurikfernandez123@gmail.com' },
      { label: 'Phone', href: 'tel:+639277975100' },
      { label: 'Location', href: '#' },
    ],
  };

  return (
    <footer className="relative border-t border-white/10 bg-[#111217]/80 backdrop-blur-[1px] mt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-bold gradient-text mb-2">Maurik</h3>
            <p className="text-sm text-gray-500">
              Full Stack Developer focused on AI-assisted development and modern web applications.
            </p>
          </motion.div>

          {/* Quick Links */}
          {Object.entries(footerLinks).map(([category, links], idx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <h4 className="font-semibold text-white mb-4 text-sm">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              &copy; {currentYear} Maurik Angelo L. Fernandez. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs text-gray-500">Available for opportunities</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
