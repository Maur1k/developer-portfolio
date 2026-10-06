import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useCopilot } from '../context/CopilotContext';

// ─────────────────────────────────────────────────────────────────
// TECHNOLOGY DATA — canonical approved list, keyed by category
// ─────────────────────────────────────────────────────────────────
const TECH_GRID = [
  { name: 'React',        category: 'Frontend',    icon: IconReact        },
  { name: 'React Native', category: 'Mobile',      icon: IconReactNative  },
  { name: 'JavaScript',   category: 'Frontend',    icon: IconJS           },
  { name: 'TypeScript',   category: 'Frontend',    icon: IconTS           },
  { name: 'Flutter',      category: 'Mobile',      icon: IconFlutter      },
  { name: 'Dart',         category: 'Mobile',      icon: IconDart         },
  { name: 'Node.js',      category: 'Backend',     icon: IconNode         },
  { name: 'Express.js',   category: 'Backend',     icon: IconExpress      },
  { name: 'Laravel',      category: 'Backend',     icon: IconLaravel      },
  { name: 'PHP',          category: 'Backend',     icon: IconPHP          },
  { name: 'MySQL',        category: 'Data',        icon: IconMySQL        },
  { name: 'MongoDB',      category: 'Data',        icon: IconMongo        },
  { name: 'Firebase',     category: 'Data',        icon: IconFirebase     },
  { name: 'Firestore',    category: 'Data',        icon: IconFirestore    },
  { name: 'REST APIs',    category: 'Integration', icon: IconREST         },
  { name: 'Git / GitHub', category: 'Tooling',     icon: IconGitHub       },
  { name: 'Postman',      category: 'Tooling',     icon: IconPostman      },
  { name: 'VS Code',      category: 'Tooling',     icon: IconVSCode       },
  { name: 'cPanel',       category: 'Tooling',     icon: IconCPanel       },
  { name: 'Codemagic',    category: 'Tooling',     icon: IconCodemagic    },
];

// ─────────────────────────────────────────────────────────────────
// SVG ICON COMPONENTS — recognisable single-colour marks, 28×28
// ─────────────────────────────────────────────────────────────────
function IconReact() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="2.05" fill="#61DAFB"/>
      <ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#61DAFB" strokeWidth="1.2"/>
      <ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(60 12 12)"/>
      <ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(120 12 12)"/>
    </svg>
  );
}
function IconReactNative() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="2.05" fill="#61DAFB"/>
      <ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#61DAFB" strokeWidth="1.2"/>
      <ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(60 12 12)"/>
      <ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(120 12 12)"/>
    </svg>
  );
}
function IconJS() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <rect width="24" height="24" rx="2" fill="#F7DF1E"/>
      <text x="2.5" y="19" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="13" fill="#000">JS</text>
    </svg>
  );
}
function IconTS() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <rect width="24" height="24" rx="2" fill="#3178C6"/>
      <text x="2" y="19" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="11" fill="#FFF">TS</text>
    </svg>
  );
}
function IconFlutter() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true">
      <polygon points="12,2 20,10 16,14 8,6" fill="#54C5F8"/>
      <polygon points="8,14 12,10 20,18 16,22 8,14" fill="#01579B"/>
      <polygon points="16,14 20,18 16,22" fill="#29B6F6"/>
    </svg>
  );
}
function IconDart() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path d="M4.99 4L15 2l5 5-1.5 10.5L4.99 4z" fill="#00B4AB"/>
      <path d="M15 2l4 4-1 2-5-5 2-1z" fill="#00D2FF"/>
      <path d="M4.99 4L3 14l3 7 12.5-2.5L4.99 4z" fill="#0175C2"/>
      <path d="M3 14l3 7 1.5-3L4.99 4 3 14z" fill="#0E4DA4"/>
    </svg>
  );
}
function IconNode() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" fill="#3C873A"/>
      <text x="5.5" y="15" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="5.5" fill="#FFF">node</text>
    </svg>
  );
}
function IconExpress() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <rect width="24" height="24" rx="2" fill="#1A1A1A" stroke="#333" strokeWidth="0.5"/>
      <text x="2.5" y="15.5" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="8" fill="#FFF">exp</text>
    </svg>
  );
}
function IconLaravel() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path d="M23 6.5L16.5 2 10 5.5v7L16.5 16 23 12.5V6.5z" fill="#FF2D20"/>
      <path d="M10 5.5L3.5 2 1 6.5v6l6.5 3.5 2.5-1.5V5.5z" fill="#FF2D20" opacity="0.65"/>
    </svg>
  );
}
function IconPHP() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <ellipse cx="12" cy="12" rx="11" ry="7" fill="#777BB4"/>
      <text x="4.5" y="15.5" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="8.5" fill="#FFF">PHP</text>
    </svg>
  );
}
function IconMySQL() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" fill="#00618A"/>
      <text x="2.5" y="15" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="6.5" fill="#FFF">MySQL</text>
    </svg>
  );
}
function IconMongo() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path d="M12 2C10 6 7 8 7 13c0 3 2 6 5 7 3-1 5-4 5-7 0-5-3-7-5-11z" fill="#4DB33D"/>
      <rect x="11" y="18" width="2" height="4" fill="#4DB33D"/>
    </svg>
  );
}
function IconFirebase() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path d="M5 20L8.5 5l4 7-2 3L5 20z" fill="#FFA000"/>
      <path d="M8.5 5L12.5 12l4.5-7.5L19 20H5L8.5 5z" fill="#F57C00"/>
      <path d="M16.5 4.5L19 20 12.5 12l4-7.5z" fill="#FFCA28"/>
    </svg>
  );
}
function IconFirestore() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#1A73E8"/>
      <path d="M7 8h10M7 12h10M7 16h6" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function IconREST() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <rect x="2" y="7" width="20" height="10" rx="5" fill="none" stroke="#71717A" strokeWidth="1.5"/>
      <text x="4.5" y="14.5" fontFamily="Arial,sans-serif" fontSize="6.5" fontWeight="bold" fill="#A1A1AA">REST</text>
    </svg>
  );
}
function IconGitHub() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.59 2 12.25c0 4.53 2.87 8.37 6.84 9.72.5.09.68-.22.68-.49v-1.7C6.73 20.36 6.14 18.37 6.14 18.37c-.46-1.19-1.12-1.5-1.12-1.5-.91-.64.07-.62.07-.62 1.01.07 1.54 1.06 1.54 1.06.9 1.57 2.36 1.12 2.93.85.09-.66.35-1.12.64-1.37-2.24-.26-4.59-1.15-4.59-5.1 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05a9.4 9.4 0 012.5-.34c.85 0 1.7.11 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.96-2.35 4.84-4.59 5.1.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.49C19.13 20.62 22 16.78 22 12.25 22 6.59 17.52 2 12 2z" fill="#E4E4E7"/>
    </svg>
  );
}
function IconPostman() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#FF6C37"/>
      <text x="5" y="14" fontFamily="Arial,sans-serif" fontSize="5.5" fontWeight="bold" fill="#FFF">POST</text>
    </svg>
  );
}
function IconVSCode() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path d="M17.5 2l-9 8.5L4 7 2 9l4 3-4 3 2 2 4.5-3.5 9 8.5 2.5-1.5v-17L17.5 2z" fill="#007ACC"/>
    </svg>
  );
}
function IconCPanel() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="3" fill="#FF6C2C"/>
      <text x="4.5" y="15.5" fontFamily="Arial,sans-serif" fontSize="9" fontWeight="bold" fill="#FFF">cP</text>
    </svg>
  );
}
function IconCodemagic() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#1A1A2E"/>
      <path d="M7 12l3-4 2 6 2-4 3 2" stroke="#F5A623" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// TECH CELL
// ─────────────────────────────────────────────────────────────────
function TechCell({ tech, isHighlighted }) {
  const Icon = tech.icon;
  return (
    <div
      className={[
        'group flex flex-col gap-2.5 p-4 h-full border transition-colors duration-200',
        isHighlighted
          ? 'border-amber-500/40 bg-amber-500/[0.03]'
          : 'border-zinc-800 bg-[#0e0e10] hover:border-zinc-700 hover:bg-[#111113]',
      ].join(' ')}
    >
      <div className="w-7 h-7 shrink-0">
        <Icon />
      </div>
      <p
        className={[
          'text-sm leading-tight transition-colors duration-200',
          isHighlighted
            ? 'text-amber-400'
            : 'text-zinc-200 group-hover:text-white',
        ].join(' ')}
      >
        {tech.name}
      </p>
      <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mt-auto">
        {tech.category}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN SECTION
// ─────────────────────────────────────────────────────────────────
export default function Skills() {
  const { highlightedSkills } = useCopilot();
  const reduceMotion = useReducedMotion();

  const highlights = (highlightedSkills || [])
    .map((h) => String(h).toLowerCase().trim())
    .filter(Boolean);

  const isTechHighlighted = (tech) => {
    if (highlights.length === 0) return false;
    const t = tech.name.toLowerCase();
    return highlights.some((h) => t.includes(h) || h.includes(t));
  };

  return (
    <section
      id="skills"
      className="py-20 lg:py-28 border-b border-zinc-900"
      aria-label="Tech Stack"
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <motion.header
        initial={reduceMotion ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12 lg:mb-16"
      >
        <div className="w-10 h-px bg-amber-500 mb-5" aria-hidden="true" />
        <p className="section-tag mb-4">04 — TECH STACK</p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100 leading-tight mb-5">
          The tools I work with
        </h2>
        <p className="max-w-xl text-sm sm:text-base text-zinc-500 leading-relaxed">
          The tools I work with to build robust, scalable, and beautiful digital
          experiences.
        </p>
      </motion.header>

      {/* ── Grid ─────────────────────────────────────────────── */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        {/*
          gap-px collapses the 1px gutters between cells into hairline
          separators without a wrapping border box.
        */}
        <div
          className="grid gap-px grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 bg-zinc-800/40"
          role="list"
          aria-label="Technology list"
        >
          {TECH_GRID.map((tech) => (
            <div key={tech.name} role="listitem">
              <TechCell tech={tech} isHighlighted={isTechHighlighted(tech)} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Footer note ──────────────────────────────────────── */}
      <p className="mt-8 font-mono text-[10px] uppercase tracking-widest text-zinc-700">
        04 — Design System · Technology Showcase
      </p>
    </section>
  );
}
