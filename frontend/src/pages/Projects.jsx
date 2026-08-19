import React, { useEffect, useId, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCollectionData } from '../hooks/useFirestoreData';
import { fallbackProjects, fallbackPlaygroundProjects } from '../data/fallbackPortfolio';
import ProjectArchitectureAI from '../components/ProjectArchitectureAI';
import { useCopilot } from '../context/CopilotContext';

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

function ActionButton({ href, children, icon, variant = 'secondary', disabledLabel }) {
  const base = 'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3.5 text-xs font-mono transition-all duration-200';
  const styles =
    variant === 'primary'
      ? 'bg-zinc-100 text-zinc-900 font-semibold hover:bg-white'
      : 'border border-zinc-800 bg-[#121318] text-zinc-300 hover:border-zinc-700 hover:text-white';

  if (!href) {
    return (
      <button type="button" disabled className={`${base} ${styles} cursor-not-allowed opacity-40`} title={disabledLabel || 'Unavailable'}>
        {icon}
        {children}
      </button>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={`${base} ${styles}`}>
      {icon}
      {children}
    </a>
  );
}

function ScreenshotCarousel({ screenshots = [], compact = false }) {
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
      <div className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-[#07080b] group shadow-lg">
        {/* Ambient blurred background for seamless framing on any screen aspect ratio */}
        {imageSrc && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src={imageSrc}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover blur-2xl opacity-20 scale-125 transform transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080b] via-[#07080b]/60 to-[#07080b]/80" />
          </div>
        )}

        <div className={`relative ${containerHeight} w-full flex items-center justify-center p-2.5 sm:p-4 overflow-hidden transition-all duration-300`}>
          {imageSrc ? (
            <img
              key={imageSrc}
              src={imageSrc}
              alt={activeScreenshot.alt || 'Project screenshot'}
              onLoad={handleImageLoad}
              className={`relative z-10 max-h-full max-w-full w-auto h-auto object-contain rounded-lg shadow-2xl transition-all duration-300 ${
                isPortrait ? 'max-w-[85%] sm:max-w-[70%]' : 'w-full'
              }`}
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center bg-zinc-900 text-xs font-mono text-zinc-500">
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
              <span className="rounded-md bg-black/85 px-2.5 py-1 text-[10px] font-mono text-zinc-300 backdrop-blur-md border border-zinc-800 shadow-md">
                {activeScreenshot.title || 'Screen'} ({activeIndex + 1}/{items.length})
              </span>
              <div className="flex gap-1.5 pointer-events-auto">
                <button
                  type="button"
                  onClick={goToPrevious}
                  className="p-1.5 rounded-md bg-black/85 text-zinc-300 hover:text-white border border-zinc-800 backdrop-blur-md transition hover:bg-zinc-800 shadow-md"
                  aria-label="Previous"
                >
                  <Icon name="chevronLeft" className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  className="p-1.5 rounded-md bg-black/85 text-zinc-300 hover:text-white border border-zinc-800 backdrop-blur-md transition hover:bg-zinc-800 shadow-md"
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

function ProjectCard({ project, index, onLearnMore }) {
  const screenshots = project.screenshots || [];
  const technologies = project.technologies || [];

  return (
    <article className="rounded-xl border border-zinc-900 bg-[#09090b]/80 hover:border-zinc-800 transition-all duration-200 flex flex-col overflow-hidden">
      {screenshots.length > 0 && (
        <div className="p-3 border-b border-zinc-900/80">
          <ScreenshotCarousel screenshots={screenshots} compact />
        </div>
      )}

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            Project {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-zinc-800 text-zinc-400 bg-zinc-900">
            {project.status || 'Production'}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          {project.name}
        </h3>

        <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed flex-1">
          {project.summary || project.shortDescription || project.description}
        </p>

        {/* Highlights */}
        {project.highlights && (
          <ul className="mt-4 space-y-1">
            {project.highlights.slice(0, 3).map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-xs text-zinc-400">
                <span className="text-zinc-600 select-none">▪</span>
                <span className="leading-tight">{item}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Tech Stack Tags */}
        <div className="flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-zinc-900">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 rounded bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono text-zinc-300"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-5 pt-2">
          <button
            type="button"
            onClick={() => onLearnMore(project)}
            className="flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-[#121318] hover:bg-zinc-800 hover:border-zinc-700 text-xs font-mono text-white transition-colors"
          >
            <span>Learn More</span>
            <span className="text-[11px] opacity-70">↗</span>
          </button>

          {project.repositoryUrl && (
            <ActionButton href={project.repositoryUrl} icon={<Icon name="github" />}>
              GitHub
            </ActionButton>
          )}
          {project.appStoreUrl && (
            <ActionButton href={project.appStoreUrl} icon={<Icon name="external" />}>
              App Store
            </ActionButton>
          )}
          {project.playStoreUrl && (
            <ActionButton href={project.playStoreUrl} icon={<Icon name="external" />}>
              Google Play
            </ActionButton>
          )}
        </div>
      </div>
    </article>
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
        className="relative my-auto max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-xl border border-zinc-800 bg-[#0d0e12] shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800/80 px-5 py-4 bg-[#09090b]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              {project.subtitle || project.category || 'Project Details'}
            </span>
            <h3 id={titleId} className="text-lg sm:text-xl font-bold text-white">
              {project.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-zinc-800/80 bg-[#07080a] px-3">
          <button
            type="button"
            onClick={() => setModalTab('overview')}
            className={`px-3.5 py-2.5 text-xs font-mono font-medium transition-colors border-b-2 ${
              modalTab === 'overview'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
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
                  ? 'border-white text-white font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
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
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-amber-400/80'
            }`}
          >
            <span>⚡</span>
            <span>AI Architecture Q&A</span>
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

function PlaygroundCard({ project, onLearnMore }) {
  const technologies = project.technologies || [];
  const isPlaceholder = project.id === 'playground-placeholder';
  const thumbnail = project.thumbnailImage || project.thumbnail_image;
  const screenshots = project.screenshots || [];

  return (
    <article
      className={`relative rounded-xl border bg-[#09090b]/60 flex flex-col transition-all duration-200 overflow-hidden
        ${isPlaceholder
          ? 'border-dashed border-zinc-800 opacity-60'
          : 'border-zinc-900 hover:border-zinc-700'
        }`}
    >
      {/* Top accent bar */}
      {!isPlaceholder && (
        <div className="h-0.5 w-full bg-gradient-to-r from-amber-500/0 via-amber-400/30 to-amber-500/0" />
      )}

      {/* Thumbnail image */}
      {!isPlaceholder && (thumbnail || screenshots.length > 0) && (
        <div className="relative w-full aspect-video overflow-hidden bg-zinc-950 border-b border-zinc-900">
          <img
            src={thumbnail || screenshots[0]?.src}
            alt={project.name}
            className="w-full h-full object-cover object-top"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.parentElement.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/60 to-transparent pointer-events-none" />
        </div>
      )}

      <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/70">
                {project.category || 'Playground'}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
              {project.name}
            </h4>
          </div>
          {!isPlaceholder && (
            <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-500 bg-zinc-900">
              {project.status || 'Done'}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-500 leading-relaxed flex-1">
          {project.summary || project.shortDescription || project.description}
        </p>

        {/* Tech tags */}
        {technologies.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800/60 text-[10px] font-mono text-zinc-400"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        {!isPlaceholder && (
          <div className="flex flex-wrap gap-2 pt-1 border-t border-zinc-900/60">
            <button
              type="button"
              onClick={() => onLearnMore(project)}
              className="inline-flex h-7 items-center gap-1 rounded-lg border border-zinc-800 bg-transparent hover:bg-zinc-900 text-[11px] font-mono text-zinc-300 px-2.5 transition-colors"
            >
              Details ↗
            </button>
            {project.repositoryUrl && (
              <ActionButton href={project.repositoryUrl} icon={<Icon name="github" />}>
                GitHub
              </ActionButton>
            )}
            {project.liveDemoUrl && (
              <ActionButton href={project.liveDemoUrl} icon={<Icon name="external" />} variant="primary">
                Demo
              </ActionButton>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default function Projects() {
  const { items: allProjects, loading } = useCollectionData('projects', [...fallbackProjects, ...fallbackPlaygroundProjects], { orderBy: 'displayOrder' });
  const [selectedProject, setSelectedProject] = useState(null);
  const { pendingAction, consumePendingAction } = useCopilot();

  useEffect(() => {
    if (pendingAction?.type === 'OPEN_PROJECT' && pendingAction?.projectId) {
      const match = allProjects.find((p) => p.id === pendingAction.projectId) ||
                    fallbackProjects.find((p) => p.id === pendingAction.projectId) ||
                    fallbackPlaygroundProjects.find((p) => p.id === pendingAction.projectId);
      if (match) {
        setSelectedProject(match);
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

  const mainProjects = allProjects.filter((p) => !isPlayground(p));
  const playgroundProjects = allProjects.filter((p) => isPlayground(p));

  // If no playground projects from DB, use fallback placeholder
  const playgroundItems = playgroundProjects.length > 0 ? playgroundProjects : fallbackPlaygroundProjects;

  // Ensure 'backops-wib' is always the featured project
  const featuredProject =
    mainProjects.find((p) => p.id === 'backops-wib') ||
    mainProjects.find((p) => p.featured && p.id !== 'wibav3') ||
    mainProjects[0];

  const otherProjects = mainProjects
    .filter((p) => p.id !== featuredProject?.id)
    .sort((a, b) => {
      const getOrder = (p) => {
        if (p.id === 'wibav3') return 1;
        if (p.id === 'click2serve') return 2;
        return p.displayOrder ?? p.display_order ?? 99;
      };
      return getOrder(a) - getOrder(b);
    });

  return (
    <section id="projects" className="py-16 border-b border-zinc-900">
      {/* Section Tag */}
      <div className="section-tag mb-4">[Projects]</div>

      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Things I've Built
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
          Not every project started with a perfect specification. Some started as school projects. Some started as assessments. Some started because there was a problem worth solving. What they have in common is that each one taught me something new about building software.
        </p>
      </div>

      {/* Featured Main Project */}
      {featuredProject && (
        <div className="mb-10 rounded-xl border border-zinc-800 bg-[#0d0e12] overflow-hidden">
          <div className="grid lg:grid-cols-[1.1fr_1fr] xl:grid-cols-[1.05fr_1.15fr] gap-0 items-stretch">
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                    FEATURED PROJECT
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {featuredProject.subtitle || featuredProject.category || 'Production · Platform'}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {featuredProject.name || featuredProject.title}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-300 mt-3 leading-relaxed">
                  {featuredProject.longDescription || featuredProject.summary || featuredProject.description}
                </p>

                {featuredProject.highlights && (
                  <div className="mt-4 space-y-1.5">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Highlights</p>
                    <ul className="grid sm:grid-cols-2 gap-1.5">
                      {featuredProject.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-zinc-400">
                          <span className="text-zinc-600">▪</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-900 space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {(featuredProject.technologies || []).map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(featuredProject)}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-white text-zinc-900 font-semibold px-4 text-xs font-mono hover:bg-zinc-200 transition-colors"
                  >
                    View Case Study ↗
                  </button>

                  {featuredProject.repositoryUrl && (
                    <ActionButton href={featuredProject.repositoryUrl} icon={<Icon name="github" />}>
                      GitHub
                    </ActionButton>
                  )}
                  {featuredProject.appStoreUrl && (
                    <ActionButton href={featuredProject.appStoreUrl} icon={<Icon name="external" />}>
                      App Store
                    </ActionButton>
                  )}
                  {featuredProject.playStoreUrl && (
                    <ActionButton href={featuredProject.playStoreUrl} icon={<Icon name="external" />}>
                      Google Play
                    </ActionButton>
                  )}
                  {featuredProject.liveDemoUrl && (
                    <ActionButton href={featuredProject.liveDemoUrl} icon={<Icon name="external" />}>
                      Live Demo
                    </ActionButton>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 bg-[#08090b] border-t lg:border-t-0 lg:border-l border-zinc-900 flex flex-col justify-center items-center">
              {featuredProject.screenshots && (
                <ScreenshotCarousel screenshots={featuredProject.screenshots} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Other Selected Projects Grid */}
      {otherProjects.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {otherProjects.map((project, index) => (
            <ProjectCard
              key={project.id || project.name}
              project={project}
              index={index + 1}
              onLearnMore={setSelectedProject}
            />
          ))}
        </div>
      )}

      {/* ── Playground Section ─────────────────────────────────── */}
      <div className="mt-16 pt-10 border-t border-zinc-900/60">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/60">Playground</span>
              <span className="h-px flex-1 min-w-[24px] bg-amber-400/10" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Small Projects & Experiments
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-lg leading-relaxed">
              Side builds, school projects, and quick experiments I've worked on for fun or learning — not production-grade, but each one taught me something.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {playgroundItems.map((project) => (
            <PlaygroundCard
              key={project.id || project.name}
              project={project}
              onLearnMore={setSelectedProject}
            />
          ))}
        </div>
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
