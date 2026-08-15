import React, { useEffect, useId, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCollectionData } from '../hooks/useFirestoreData';
import { fallbackProjects } from '../data/fallbackPortfolio';

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

  const goToNext = () => setActiveIndex((current) => (current + 1) % items.length);
  const goToPrevious = () => setActiveIndex((current) => (current - 1 + items.length) % items.length);

  const previewHeight = compact ? 'h-48 sm:h-56' : 'h-[40vh] min-h-[300px] sm:h-[48vh]';

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-[#09090b]">
        <div className="relative">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={activeScreenshot.alt || 'Project screenshot'}
              className={`${previewHeight} w-full object-cover object-top transition-transform duration-500`}
              loading="lazy"
            />
          ) : (
            <div className={`${previewHeight} flex items-center justify-center bg-zinc-900 text-xs font-mono text-zinc-500`}>
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
            <div className="absolute inset-x-2 bottom-2 z-20 flex items-center justify-between pointer-events-none">
              <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] font-mono text-zinc-300 backdrop-blur border border-zinc-800">
                {activeScreenshot.title || 'Screen'} ({activeIndex + 1}/{items.length})
              </span>
              <div className="flex gap-1 pointer-events-auto">
                <button
                  type="button"
                  onClick={goToPrevious}
                  className="p-1 rounded bg-black/70 text-zinc-300 hover:text-white border border-zinc-800 backdrop-blur transition"
                  aria-label="Previous"
                >
                  <Icon name="chevronLeft" className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  className="p-1 rounded bg-black/70 text-zinc-300 hover:text-white border border-zinc-800 backdrop-blur transition"
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
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <span className="text-sm font-mono text-zinc-300">{activeScreenshot.title || 'Preview'}</span>
              <button
                type="button"
                onClick={() => setIsFullscreenOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-mono text-zinc-300 hover:text-white"
              >
                Close (ESC)
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center py-4 overflow-hidden">
              <img
                src={imageSrc}
                alt={activeScreenshot.alt || 'Full preview'}
                className="max-h-full max-w-full object-contain rounded-lg border border-zinc-800"
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

function ProjectModal({ project, onClose }) {
  const titleId = useId();

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
            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {project.screenshots && project.screenshots.length > 0 && (
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
  const { items: projects, loading } = useCollectionData('projects', fallbackProjects, { orderBy: 'displayOrder' });
  const [selectedProject, setSelectedProject] = useState(null);

  const featuredProject = projects.find((p) => p.id === 'wibav3') || projects[0];
  const otherProjects = projects.filter((p) => p.id !== featuredProject?.id);

  return (
    <section id="projects" className="py-16 border-b border-zinc-900">
      {/* Section Tag */}
      <div className="section-tag mb-4">[Projects]</div>

      <div className="mb-8 max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Things I've Built
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
          Not every project started with a perfect specification. Some started as school projects. Some started as assessments. Some started because there was a problem worth solving. What they have in common is that each one taught me something new about building software.
        </p>
      </div>

      {/* Featured Main Project (WIBE) */}
      {featuredProject && (
        <div className="mb-10 rounded-xl border border-zinc-800 bg-[#0d0e12] overflow-hidden">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-0">
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                    FEATURED PROJECT
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {featuredProject.subtitle || 'Production · Food Delivery Platform'}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {featuredProject.name}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-300 mt-3 leading-relaxed">
                  {featuredProject.summary || featuredProject.description}
                </p>

                <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                  Worked across web and mobile applications, backend services, APIs, databases, payment integrations, and operational features used by real users.
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
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-[#08090b] border-t lg:border-t-0 lg:border-l border-zinc-900 flex flex-col justify-center">
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
