import React, { useEffect, useId, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCollectionData } from '../hooks/useFirestoreData';
import { fallbackProjects, fallbackPlaygroundProjects } from '../data/fallbackPortfolio';
import ProjectArchitectureAI from '../components/ProjectArchitectureAI';
import { useCopilot } from '../context/CopilotContext';
import { trackEvent } from '../services/analytics';

function Icon({ name, className = 'h-4 w-4' }) {
  const paths = {
    github: (
      <path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.86 8.35 6.84 9.7.5.1.68-.22.68-.5 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .08 1.53 1.07 1.53 1.07.9 1.56 2.35 1.11 2.92.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.05 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 5.95c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.92-2.34 4.79-4.57 5.04.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .28.18.61.69.5A10.18 10.18 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z" />
    ),
    external: (
      <>
        <path d="M14 3h7v7" />
        <path d="M10 14 21 3" />
        <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
      </>
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    chevronLeft: <path d="m15 18-6-6 6-6" />,
    chevronRight: <path d="m9 18 6-6-6-6" />,
  };

  const filled = name === 'github';

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function ActionButton({ href, children, icon, variant = 'secondary', disabledLabel, projectTitle }) {
  const base = 'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3.5 text-xs font-mono transition-all duration-200 cursor-pointer';
  const styles =
    variant === 'primary'
      ? 'border border-amber-600/30 dark:border-transparent bg-amber-500 hover:bg-amber-600 dark:bg-white text-white dark:text-zinc-900 font-semibold dark:hover:bg-zinc-200 shadow-sm'
      : 'border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121318] text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700 hover:text-slate-900 dark:hover:text-white shadow-sm';

  if (!href) {
    return (
      <button type="button" disabled className={`${base} ${styles} cursor-not-allowed opacity-40`} title={disabledLabel || 'Unavailable'}>
        {icon}
        {children}
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => {
        trackEvent('project_click', projectTitle || 'Project Link', { url: href });
      }}
      className={`${base} ${styles}`}
    >
      {icon}
      {children}
    </a>
  );
}

/**
 * Minimal inline link used by the editorial featured block and list rows.
 * Same tracking event as ActionButton, without the button chrome.
 */
function TextLink({ href, children, projectTitle }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => {
        trackEvent('project_click', projectTitle || 'Project Link', { url: href });
      }}
      className="inline-flex items-center gap-1 text-xs font-mono text-slate-500 dark:text-zinc-400 underline decoration-slate-300 dark:decoration-zinc-700 underline-offset-4 hover:text-slate-900 dark:hover:text-white hover:decoration-current transition-colors"
    >
      <span>{children}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}

// Only returns links that actually exist on the project record.
function getProjectLinks(project) {
  return [
    project.repositoryUrl && { label: 'GitHub', href: project.repositoryUrl },
    project.appStoreUrl && { label: 'App Store', href: project.appStoreUrl },
    project.playStoreUrl && { label: 'Google Play', href: project.playStoreUrl },
    project.liveDemoUrl && { label: 'Live Demo', href: project.liveDemoUrl },
  ].filter(Boolean);
}

function ScreenshotCarousel({ screenshots = [], compact = false, editorial = false }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  if (!screenshots.length) {
    return (
      <div className="h-44 sm:h-52 w-full flex items-center justify-center rounded-lg border border-zinc-900 bg-[#0c0d10] text-xs font-mono text-zinc-500">
        Interactive Preview Available in Case Study
      </div>
    );
  }

  const items = screenshots;
  const activeScreenshot = items[activeIndex] || items[0];
  const imageSrc = activeScreenshot?.src ? encodeURI(activeScreenshot.src) : '';

  const goToNext = (e) => {
    e?.stopPropagation();
    setActiveIndex((current) => (current + 1) % items.length);
  };
  const goToPrevious = (e) => {
    e?.stopPropagation();
    setActiveIndex((current) => (current - 1 + items.length) % items.length);
  };

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalHeight && naturalWidth) {
      setIsPortrait(naturalHeight > naturalWidth * 1.05);
    }
  };

  // Height adapts dynamically based on orientation and viewport
  const containerHeight = compact
    ? isPortrait
      ? 'h-[290px] xs:h-[330px] sm:h-[360px]'
      : 'h-[190px] xs:h-[220px] sm:h-[250px]'
    : isPortrait
      ? 'h-[360px] xs:h-[420px] sm:h-[480px] md:h-[530px] max-h-[65vh]'
      : 'h-[230px] xs:h-[280px] sm:h-[340px] md:h-[390px] lg:h-[430px] max-h-[60vh]';

  return (
    <div className="space-y-2 w-full select-none">
      <div
        className={`relative overflow-hidden group ${
          editorial
            ? 'border border-slate-200 dark:border-zinc-900 bg-slate-50 dark:bg-[#07080b]'
            : 'rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-slate-100 dark:bg-[#07080b] shadow-lg'
        }`}
      >
        {/* Ambient blurred background for seamless framing on any screen aspect ratio */}
        {imageSrc && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src={imageSrc}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover blur-2xl opacity-20 scale-125 transform transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-200/50 via-slate-100/30 to-transparent dark:from-[#07080b] dark:via-[#07080b]/60 dark:to-[#07080b]/80" />
          </div>
        )}

        <div className={`relative ${containerHeight} w-full flex items-center justify-center p-2.5 sm:p-4 overflow-hidden transition-all duration-300`}>
          {imageSrc ? (
            <img
              key={imageSrc}
              src={imageSrc}
              alt={activeScreenshot.alt || 'Project screenshot'}
              onLoad={handleImageLoad}
              className={`relative z-10 max-h-full max-w-full w-auto h-auto object-contain transition-all duration-300 ${
                editorial ? '' : 'rounded-lg shadow-2xl'
              } ${isPortrait ? 'max-w-[85%] sm:max-w-[70%]' : 'w-full'}`}
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center bg-slate-200 dark:bg-zinc-900 text-xs font-mono text-slate-500 dark:text-zinc-500">
              No screenshot preview
            </div>
          )}

          <button
            type="button"
            aria-label="Open fullscreen image"
            onClick={() => setIsFullscreenOpen(true)}
            className="absolute inset-0 z-10 cursor-zoom-in"
          />

          {items.length > 1 && (
            <div className="absolute inset-x-2.5 bottom-2.5 z-20 flex items-center justify-between pointer-events-none">
              <span className="rounded-md bg-white/95 dark:bg-black/85 px-2.5 py-1 text-[10px] font-mono text-slate-800 dark:text-zinc-300 backdrop-blur-md border border-slate-200 dark:border-zinc-800 shadow-md">
                {activeScreenshot.title || 'Screen'} ({activeIndex + 1}/{items.length})
              </span>
              <div className="flex gap-1.5 pointer-events-auto">
                <button
                  type="button"
                  onClick={goToPrevious}
                  className="p-1.5 rounded-md bg-white/95 dark:bg-black/85 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800 backdrop-blur-md transition hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-md cursor-pointer"
                  aria-label="Previous"
                >
                  <Icon name="chevronLeft" className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  className="p-1.5 rounded-md bg-white/95 dark:bg-black/85 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800 backdrop-blur-md transition hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-md cursor-pointer"
                  aria-label="Next"
                >
                  <Icon name="chevronRight" className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isFullscreenOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-md flex flex-col p-4 sm:p-8"
            onClick={() => setIsFullscreenOpen(false)}
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800" onClick={(e) => e.stopPropagation()}>
              <span className="text-sm font-mono text-zinc-300">{activeScreenshot.title || 'Preview'}</span>
              <button
                type="button"
                onClick={() => setIsFullscreenOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-mono text-zinc-300 hover:text-white"
              >
                Close (ESC)
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center py-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <img
                src={imageSrc}
                alt={activeScreenshot.alt || 'Full preview'}
                className="max-h-[85vh] max-w-full object-contain rounded-lg border border-zinc-800 shadow-2xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Editorial pieces
   ───────────────────────────────────────────────────────────── */

function FeaturedProject({ project, onOpen, reduceMotion }) {
  const links = getProjectLinks(project);
  const description = project.shortDescription || project.summary || project.description;
  const technologies = project.technologies || [];
  const projectTitle = project.title || project.name;

  return (
    <article className="grid lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-center border-t border-slate-200 dark:border-zinc-900 pt-10 lg:pt-14">
      {/* Visual */}
      <motion.div
        className="lg:col-span-7 min-w-0"
        initial={reduceMotion ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {project.screenshots && <ScreenshotCarousel screenshots={project.screenshots} editorial />}
      </motion.div>

      {/* Information */}
      <div className="lg:col-span-5 min-w-0">
        <p className="font-mono text-xs uppercase tracking-widest text-slate-400 dark:text-zinc-600">
          01 — Featured
        </p>

        <h3 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight leading-[1.1] text-slate-900 dark:text-white">
          {project.name || project.title}
        </h3>

        {(project.category || project.subtitle) && (
          <p className="mt-3 font-mono text-xs text-slate-500 dark:text-zinc-400">
            {project.category || project.subtitle}
          </p>
        )}

        <p className="mt-6 max-w-md text-sm sm:text-base leading-relaxed text-slate-600 dark:text-zinc-300">
          {description}
        </p>

        {technologies.length > 0 && (
          <p className="mt-6 max-w-md font-mono text-xs leading-relaxed text-slate-500 dark:text-zinc-500">
            {technologies.join(' · ')}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <button
            type="button"
            onClick={() => onOpen(project)}
            className="inline-flex items-center gap-2 border-b border-slate-900 dark:border-white pb-1 font-mono text-xs font-semibold text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-600 dark:hover:border-amber-400 transition-colors cursor-pointer"
          >
            <span>View Case Study</span>
            <span aria-hidden="true">→</span>
          </button>

          {links.map((link) => (
            <TextLink key={link.label} href={link.href} projectTitle={projectTitle}>
              {link.label}
            </TextLink>
          ))}
        </div>
      </div>
    </article>
  );
}

function ProjectRow({ project, number, onOpen }) {
  const links = getProjectLinks(project);
  const meta = project.category || project.subtitle;
  const techLine = (project.technologies || []).slice(0, 4).join(' · ');
  const projectTitle = project.title || project.name;

  return (
    <li className="group border-b border-slate-200 dark:border-zinc-900">
      <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] md:grid-cols-[3rem_minmax(0,1.3fr)_minmax(0,1fr)_auto] gap-x-4 gap-y-3 py-6 md:py-7 md:items-baseline">
        <span className="pt-1.5 md:pt-0 font-mono text-xs tabular-nums text-slate-400 dark:text-zinc-600 group-hover:text-slate-600 dark:group-hover:text-zinc-400 transition-colors">
          {number}
        </span>

        <div className="min-w-0">
          <h4 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {/* Mouse convenience only — the "Case Study" action below is the keyboard target */}
            <button
              type="button"
              tabIndex={-1}
              onClick={() => onOpen(project)}
              className="text-left cursor-pointer transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none"
            >
              {project.name}
            </button>
          </h4>
          {meta && (
            <p className="mt-1 font-mono text-xs text-slate-500 dark:text-zinc-500">{meta}</p>
          )}
        </div>

        {techLine && (
          <p className="col-start-2 md:col-start-auto font-mono text-xs leading-relaxed text-slate-500 dark:text-zinc-500">
            {techLine}
          </p>
        )}

        <div className="col-start-2 md:col-start-auto md:justify-self-end flex flex-wrap items-center gap-x-5 gap-y-2">
          <button
            type="button"
            onClick={() => onOpen(project)}
            className="inline-flex items-center gap-1 font-mono text-xs text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
          >
            <span>Case Study</span>
            <span aria-hidden="true">→</span>
          </button>

          {links.map((link) => (
            <TextLink key={link.label} href={link.href} projectTitle={projectTitle}>
              {link.label}
            </TextLink>
          ))}
        </div>
      </div>
    </li>
  );
}

function PlaygroundRow({ project, onOpen }) {
  const isPlaceholder = project.id === 'playground-placeholder';
  const links = getProjectLinks(project);
  const description = project.summary || project.shortDescription || project.description;
  const techLine = (project.technologies || []).slice(0, 4).join(' · ');
  const projectTitle = project.title || project.name;

  if (isPlaceholder) {
    return (
      <li className="border-b border-slate-200 dark:border-zinc-900">
        <div className="py-5">
          <p className="text-sm font-medium text-slate-400 dark:text-zinc-600">{project.name}</p>
          {description && (
            <p className="mt-1 max-w-lg text-xs leading-relaxed text-slate-400 dark:text-zinc-600">
              {description}
            </p>
          )}
        </div>
      </li>
    );
  }

  return (
    <li className="group border-b border-slate-200 dark:border-zinc-900">
      <div className="grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] gap-x-6 gap-y-2 py-5 md:items-baseline">
        <div className="min-w-0">
          <h4 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
            <button
              type="button"
              tabIndex={-1}
              onClick={() => onOpen(project)}
              className="text-left cursor-pointer transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none"
            >
              {project.name}
            </button>
          </h4>
          <p className="mt-1 font-mono text-xs text-slate-500 dark:text-zinc-500">
            {[project.category, project.status].filter(Boolean).join(' · ')}
          </p>
        </div>

        {techLine && (
          <p className="font-mono text-xs leading-relaxed text-slate-500 dark:text-zinc-500">{techLine}</p>
        )}

        <div className="md:justify-self-end flex flex-wrap items-center gap-x-5 gap-y-2">
          <button
            type="button"
            onClick={() => onOpen(project)}
            className="inline-flex items-center gap-1 font-mono text-xs text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
          >
            <span>Details</span>
            <span aria-hidden="true">→</span>
          </button>

          {links.map((link) => (
            <TextLink key={link.label} href={link.href} projectTitle={projectTitle}>
              {link.label}
            </TextLink>
          ))}
        </div>
      </div>
    </li>
  );
}

function ProjectModal({ project, onClose, initialTab = 'overview' }) {
  const titleId = useId();
  const [modalTab, setModalTab] = useState(initialTab); // 'overview' | 'screenshots' | 'architecture'

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!project) return null;

  const hasScreenshots = project.screenshots && project.screenshots.length > 0;

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/80 px-3 py-6 backdrop-blur-sm sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.97, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0d0e12] shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800/80 px-5 py-4 bg-slate-50 dark:bg-[#09090b]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-500">
              {project.subtitle || project.category || 'Project Details'}
            </span>
            <h3 id={titleId} className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {project.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-zinc-800/80 bg-slate-100/70 dark:bg-[#07080a] px-3">
          <button
            type="button"
            onClick={() => setModalTab('overview')}
            className={`px-3.5 py-2.5 text-xs font-mono font-medium transition-colors border-b-2 ${
              modalTab === 'overview'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                : 'border-transparent text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300'
            }`}
          >
            Overview
          </button>

          {hasScreenshots && (
            <button
              type="button"
              onClick={() => setModalTab('screenshots')}
              className={`px-3.5 py-2.5 text-xs font-mono font-medium transition-colors border-b-2 ${
                modalTab === 'screenshots'
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                  : 'border-transparent text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300'
              }`}
            >
              Screenshots ({project.screenshots.length})
            </button>
          )}

          <button
            type="button"
            onClick={() => setModalTab('architecture')}
            className={`px-3.5 py-2.5 text-xs font-mono font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              modalTab === 'architecture'
                ? 'border-amber-500 dark:border-amber-400 text-amber-600 dark:text-amber-400 font-semibold'
                : 'border-transparent text-slate-500 dark:text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400/80'
            }`}
          >
            <span>[AI]</span>
            <span>Architecture Q&A</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 1. ARCHITECTURE TAB */}
          {modalTab === 'architecture' && (
            <ProjectArchitectureAI project={project} />
          )}

          {/* 2. SCREENSHOTS TAB */}
          {modalTab === 'screenshots' && hasScreenshots && (
            <div className="space-y-4">
              <ScreenshotCarousel screenshots={project.screenshots} />
              {project.screenshots.length > 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                  {project.screenshots.map((s, idx) => (
                    <div key={idx} className="rounded-lg border border-zinc-800 overflow-hidden bg-zinc-950 aspect-video">
                      <img src={s.src} alt={s.alt} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. OVERVIEW TAB */}
          {modalTab === 'overview' && (
            <>
              {hasScreenshots && (
                <ScreenshotCarousel screenshots={project.screenshots} />
              )}

              <div>
                <h4 className="text-xs font-mono uppercase text-zinc-500 mb-2">Overview</h4>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {project.longDescription || project.description || project.summary}
                </p>
              </div>

              {project.highlights && project.highlights.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase text-zinc-500 mb-2">Key Highlights</h4>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {project.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <span className="text-zinc-500 select-none">▪</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.problem && (
                <div>
                  <h4 className="text-xs font-mono uppercase text-zinc-500 mb-2">Problem</h4>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{project.problem}</p>
                </div>
              )}

              {project.solution && (
                <div>
                  <h4 className="text-xs font-mono uppercase text-zinc-500 mb-2">Solution</h4>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{project.solution}</p>
                </div>
              )}

              {project.contributions && project.contributions.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase text-zinc-500 mb-2">My Engineering Contributions</h4>
                  <ul className="space-y-1.5">
                    {project.contributions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-300">
                        <span className="text-zinc-500 select-none">▪</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.results && project.results.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase text-emerald-400 mb-2">Results & Impact</h4>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {project.results.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <span className="text-emerald-400 select-none font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="text-xs font-mono uppercase text-zinc-500 mb-2">Tech Stack</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(project.technologies || []).map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-800">
            {project.repositoryUrl && (
              <ActionButton href={project.repositoryUrl} icon={<Icon name="github" />}>
                View GitHub Repository
              </ActionButton>
            )}
            {project.appStoreUrl && (
              <ActionButton href={project.appStoreUrl} icon={<Icon name="external" />} variant="primary">
                View on App Store
              </ActionButton>
            )}
            {project.playStoreUrl && (
              <ActionButton href={project.playStoreUrl} icon={<Icon name="external" />} variant="primary">
                View on Google Play
              </ActionButton>
            )}
            {project.liveDemoUrl && (
              <ActionButton href={project.liveDemoUrl} icon={<Icon name="external" />} variant="primary">
                Live Demo
              </ActionButton>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Projects() {
  const { items: allProjects, loading } = useCollectionData('projects', [...fallbackProjects, ...fallbackPlaygroundProjects], { orderBy: 'displayOrder' });
  const [selectedProject, setSelectedProject] = useState(null);
  const { pendingAction, consumePendingAction } = useCopilot();
  const reduceMotion = useReducedMotion();

  const handleOpenProject = (project) => {
    if (project) {
      trackEvent('project_view', project.title || project.name || 'Project');
    }
    setSelectedProject(project);
  };

  useEffect(() => {
    if (pendingAction?.type === 'OPEN_PROJECT' && pendingAction?.projectId) {
      const match = allProjects.find((p) => p.id === pendingAction.projectId) ||
                    fallbackProjects.find((p) => p.id === pendingAction.projectId) ||
                    fallbackPlaygroundProjects.find((p) => p.id === pendingAction.projectId);
      if (match) {
        handleOpenProject(match);
      }
      consumePendingAction();
    }
  }, [pendingAction, allProjects, consumePendingAction]);

  // Separate main projects vs playground projects by projectType field or ID
  const isPlayground = (p) =>
    p.projectType === 'playground' ||
    p.project_type === 'playground' ||
    p.id === 'client-project-tracker' ||
    p.id === 'playground-placeholder';

  const isWibCustomerApp = (p) => {
    if (!p) return false;
    if (p.id === 'wibav3') return true;
    const title = (p.title || p.name || '').toLowerCase();
    return (title.includes('baguio') || title.includes('wibe')) &&
      (title.includes('eat') || title.includes('mobile') || title === 'when in baguio (wibe)');
  };

  const rawMainProjects = allProjects.filter((p) => !isPlayground(p));

  // Deduplicate main projects (prevent duplicate WIBE customer mobile app entries)
  const mainProjects = useMemo(() => {
    const seenWibCustomerApp = { seen: false };
    const seenIds = new Set();
    const result = [];

    for (const p of rawMainProjects) {
      if (isWibCustomerApp(p)) {
        if (!seenWibCustomerApp.seen) {
          seenWibCustomerApp.seen = true;
          result.push(p);
        }
      } else if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        result.push(p);
      }
    }
    return result;
  }, [rawMainProjects]);

  const playgroundProjects = allProjects.filter((p) => isPlayground(p));

  // If no playground projects from DB, use fallback placeholder
  const playgroundItems = playgroundProjects.length > 0 ? playgroundProjects : fallbackPlaygroundProjects;

  // Ensure 'backops-wib' is always the featured project
  const featuredProject =
    mainProjects.find((p) => p.id === 'backops-wib') ||
    mainProjects.find((p) => p.featured && !isWibCustomerApp(p)) ||
    mainProjects[0];

  const otherProjects = mainProjects
    .filter((p) => p.id !== featuredProject?.id && p !== featuredProject)
    .sort((a, b) => {
      const getOrder = (p) => {
        if (isWibCustomerApp(p)) return 1;
        if (p.id === 'click2serve') return 2;
        return p.displayOrder ?? p.display_order ?? 99;
      };
      return getOrder(a) - getOrder(b);
    });

  return (
    <section id="projects" className="py-20 lg:py-28 border-b border-slate-200 dark:border-zinc-900">
      {/* Section header — single, quiet fade (no translate) */}
      <motion.header
        initial={reduceMotion ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-14 lg:mb-20"
      >
        <p className="section-tag mb-5">03 — SELECTED PROJECTS</p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Things I've Built
        </h2>
        <p className="mt-5 max-w-xl text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
          Not every project started with a perfect specification. Some started as school projects. Some started as assessments. Some started because there was a problem worth solving. What they have in common is that each one taught me something new about building software.
        </p>
      </motion.header>

      {/* Featured project */}
      {featuredProject && (
        <FeaturedProject
          project={featuredProject}
          onOpen={handleOpenProject}
          reduceMotion={reduceMotion}
        />
      )}

      {/* Remaining projects — editorial list */}
      {otherProjects.length > 0 && (
        <ul className="mt-16 lg:mt-24 border-t border-slate-200 dark:border-zinc-900">
          {otherProjects.map((project, index) => (
            <ProjectRow
              key={project.id || project.name}
              project={project}
              number={String(index + 2).padStart(2, '0')}
              onOpen={handleOpenProject}
            />
          ))}
        </ul>
      )}

      {/* Playground — smaller secondary list */}
      <div className="mt-20 lg:mt-28">
        <div className="mb-6 max-w-xl">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-400 dark:text-zinc-600">
            Playground
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            Small Projects & Experiments
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-500 leading-relaxed">
            Side builds, school projects, and quick experiments I've worked on for fun or learning — not production-grade, but each one taught me something.
          </p>
        </div>

        <ul className="border-t border-slate-200 dark:border-zinc-900">
          {playgroundItems.map((project) => (
            <PlaygroundRow
              key={project.id || project.name}
              project={project}
              onOpen={handleOpenProject}
            />
          ))}
        </ul>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
