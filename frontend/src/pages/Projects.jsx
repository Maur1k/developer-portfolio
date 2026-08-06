import React, { useEffect, useId, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCollectionData } from '../hooks/useFirestoreData';
import { fallbackProjects } from '../data/fallbackPortfolio';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 18 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 12,
    transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
  },
};

const fallbackScreens = [
  {
    src: '',
    alt: 'Project preview placeholder',
    title: 'Preview',
  },
];

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

function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-white/10 bg-white/[0.035] text-gray-300',
    accent: 'border-orange-400/20 bg-orange-400/[0.08] text-orange-200',
    amber: 'border-amber-300/20 bg-amber-300/[0.08] text-amber-100',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${tones[tone]}`}>
      {children}
    </span>
  );
}

function ActionButton({ href, children, icon, variant = 'secondary', disabledLabel }) {
  const base = 'inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70';
  const styles = variant === 'primary'
    ? 'bg-gradient-to-r from-orange-400 to-amber-300 text-[#090a0c] shadow-[0_14px_35px_rgba(34,211,238,0.16)] hover:brightness-110'
    : 'border border-white/10 bg-white/[0.035] text-gray-200 hover:border-white/20 hover:bg-white/[0.07] hover:text-white';

  if (!href) {
    return (
      <button type="button" disabled className={`${base} ${styles} cursor-not-allowed opacity-45`} title={disabledLabel || 'Unavailable'}>
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
  const items = screenshots.length ? screenshots : fallbackScreens;
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasErrorMap, setHasErrorMap] = useState({});
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  const activeScreenshot = items[activeIndex] || items[0];
  const imageSrc = activeScreenshot?.src ? encodeURI(activeScreenshot.src) : '';

  const goToNext = () => setActiveIndex((current) => (current + 1) % items.length);
  const goToPrevious = () => setActiveIndex((current) => (current - 1 + items.length) % items.length);

  const handleDragEnd = (_, info) => {
    if (info.offset.x < -50) goToNext();
    if (info.offset.x > 50) goToPrevious();
  };

  const handleFullscreenTap = (event) => {
    const { clientX, currentTarget } = event;
    const { left, width } = currentTarget.getBoundingClientRect();
    const tapPosition = clientX - left;

    if (tapPosition <= width * 0.35) goToPrevious();
    else if (tapPosition >= width * 0.65) goToNext();
    else setIsFullscreenOpen(false);
  };

  const previewHeight = compact
    ? 'h-56 sm:h-60 lg:h-64'
    : 'h-[44vh] min-h-[340px] sm:h-[50vh] lg:h-[58vh]';

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0b0d12]">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 via-transparent to-amber-300/10 opacity-70" />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreenshot.src || activeScreenshot.title}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, scale: 0.985, x: 18 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.985, x: -18 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="relative touch-pan-y select-none"
            style={{ touchAction: 'pan-y' }}
          >
            {imageSrc && !hasErrorMap[activeScreenshot.src] ? (
              <img
                src={imageSrc}
                alt={activeScreenshot.alt}
                onError={() => setHasErrorMap((current) => ({ ...current, [activeScreenshot.src]: true }))}
                className={`${previewHeight} w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.025]`}
                loading="lazy"
                draggable="false"
              />
            ) : (
              <div className={`${previewHeight} flex w-full items-center justify-center bg-gradient-to-br from-orange-400/10 to-amber-300/10 p-6 text-center`}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Preview coming soon</p>
                  <p className="mt-2 max-w-xs text-sm text-gray-400">Add screenshots to the project object and they will render here automatically.</p>
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/10 pointer-events-none" />

            <button type="button" aria-label="Open fullscreen viewer" onClick={() => setIsFullscreenOpen(true)} className="absolute inset-0 z-10 cursor-zoom-in">
              <span className="sr-only">Open fullscreen viewer</span>
            </button>

            {items.length > 1 && (
              <>
                <button type="button" aria-label="Previous screenshot" onClick={goToPrevious} className="absolute inset-y-0 left-0 z-20 flex w-[28%] items-center justify-start pl-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white/85 backdrop-blur transition hover:bg-black/50 hover:text-white">
                    <Icon name="chevronLeft" />
                  </span>
                </button>
                <button type="button" aria-label="Next screenshot" onClick={goToNext} className="absolute inset-y-0 right-0 z-20 flex w-[28%] items-center justify-end pr-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white/85 backdrop-blur transition hover:bg-black/50 hover:text-white">
                    <Icon name="chevronRight" />
                  </span>
                </button>
              </>
            )}

            <div className="absolute left-3 right-3 top-3 z-20 flex items-center justify-between gap-3">
              <span className="truncate rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur">
                {activeScreenshot.title}
              </span>
              <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-300 backdrop-blur">
                {String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {!compact && items.length > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-7">
          {items.slice(0, 7).map((screenshot, index) => (
            <button
              key={screenshot.src || screenshot.title}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`group/thumb relative overflow-hidden rounded-xl border transition-all duration-300 ${index === activeIndex ? 'border-orange-300/70 ring-1 ring-orange-300/25' : 'border-white/10 hover:border-white/20'}`}
            >
              {screenshot.src ? (
                <img src={encodeURI(screenshot.src)} alt={screenshot.alt} className="aspect-[4/3] h-full w-full object-cover object-center" loading="lazy" draggable="false" />
              ) : (
                <div className="aspect-[4/3] bg-white/[0.04]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent opacity-60" />
              <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-full border border-white/10 bg-black/35 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur">
                {screenshot.title}
              </span>
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isFullscreenOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-md">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200">Fullscreen viewer</p>
                  <h3 className="mt-1 truncate text-base font-semibold text-white sm:text-xl">{activeScreenshot.title}</h3>
                </div>
                <button type="button" onClick={() => setIsFullscreenOpen(false)} className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-gray-200 transition hover:bg-white/[0.08] hover:text-white">
                  <Icon name="close" />
                  Close
                </button>
              </div>

              <div className="relative flex min-h-0 flex-1 items-center justify-center p-2 sm:p-6" onClick={handleFullscreenTap}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeScreenshot.src || activeScreenshot.title}
                    src={imageSrc}
                    alt={activeScreenshot.alt}
                    initial={{ opacity: 0, scale: 0.985, x: 22 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.985, x: -22 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="max-h-full w-full max-w-6xl rounded-[1.25rem] border border-white/10 object-contain shadow-2xl"
                    draggable="false"
                  />
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectCard({ project, index, onLearnMore }) {
  const screenshots = project.screenshots || [];
  const preview = screenshots[0];
  const technologies = project.technologies || [];

  return (
    <motion.article variants={itemVariants} className="group relative h-full">
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-orange-300/20 via-white/0 to-amber-300/20 opacity-0 blur transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12141a]/80 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur transition-all duration-500 group-hover:-translate-y-1 group-hover:border-orange-300/25 group-hover:bg-[#151820]/90">
        <div className="border-b border-white/10 bg-black/20 p-3">
          <ScreenshotCarousel screenshots={screenshots} compact />
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge tone="amber">{project.category || 'Case Study'}</Badge>
            <Badge tone="accent">{project.status || 'Completed'}</Badge>
          </div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Project {String(index + 1).padStart(2, '0')}</p>
          <h3 className="text-xl font-bold leading-tight text-white sm:text-2xl">{project.name}</h3>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-400">{project.summary || project.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {technologies.slice(0, 5).map((tech) => (
              <span key={tech} className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-medium text-gray-300 transition-colors group-hover:border-white/15">
                {tech}
              </span>
            ))}
            {technologies.length > 5 && (
              <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-medium text-gray-400">+{technologies.length - 5}</span>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => onLearnMore(project)}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-white text-[#090d12] px-4 text-sm font-bold transition-all duration-300 hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
            >
              Learn More
              <Icon name="arrow" />
            </button>
            <div className="flex gap-3">
              <ActionButton href={project.repositoryUrl} icon={<Icon name="github" />} disabledLabel="Repository not available">
                <span className="sr-only sm:not-sr-only">GitHub</span>
              </ActionButton>
              {project.liveDemoUrl && (
                <ActionButton href={project.liveDemoUrl} icon={<Icon name="external" />}>
                  Demo
                </ActionButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function DetailBlock({ title, children }) {
  if (!children || (Array.isArray(children) && !children.length)) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">{title}</h4>
      {Array.isArray(children) ? (
        <ul className="mt-4 space-y-3">
          {children.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-6 text-gray-300">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-6 text-gray-300">{children}</p>
      )}
    </section>
  );
}

function ProjectModal({ project, onClose }) {
  const titleId = useId();
  const summaryId = useId();

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
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/70 px-3 py-6 backdrop-blur-md sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={summaryId}
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onMouseDown={(event) => event.stopPropagation()}
        className="relative my-auto max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/12 bg-[#101217] shadow-[0_35px_120px_rgba(0,0,0,0.65)]"
      >
        <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/10 bg-[#101217]/90 px-4 py-4 backdrop-blur sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-200">Project details</p>
            <h3 id={titleId} className="mt-1 truncate text-lg font-bold text-white sm:text-2xl">{project.name}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close project details" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gray-300 transition hover:bg-white/[0.08] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70">
            <Icon name="close" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-4.5rem)] overflow-y-auto">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <div className="border-b border-white/10 p-4 sm:p-6 lg:border-b-0 lg:border-r">
              <ScreenshotCarousel screenshots={project.screenshots || []} />
            </div>

            <div className="p-5 sm:p-6 lg:p-8">
              <div className="flex flex-wrap gap-2">
                <Badge tone="amber">{project.category || 'Case Study'}</Badge>
                <Badge tone="accent">{project.status || 'Completed'}</Badge>
              </div>

              <p id={summaryId} className="mt-5 text-base leading-7 text-gray-300">{project.summary || project.description}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <ActionButton href={project.repositoryUrl} icon={<Icon name="github" />} disabledLabel="Repository not available">
                  GitHub Repository
                </ActionButton>
                {project.liveDemoUrl && (
                  <ActionButton href={project.liveDemoUrl} icon={<Icon name="external" />} variant="primary">
                    Live Demo
                  </ActionButton>
                )}
              </div>

              <div className="mt-8 grid gap-4">
                <DetailBlock title="Problem Statement">{project.problem}</DetailBlock>
                <DetailBlock title="Solution Implemented">{project.solution}</DetailBlock>
                <DetailBlock title="Key Features">{project.features}</DetailBlock>
                <DetailBlock title="Challenges Encountered">{project.challenges}</DetailBlock>
                <DetailBlock title="My Contributions">{project.contributions}</DetailBlock>
              </div>

              <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Technologies Used</h4>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(project.technologies || []).map((tech) => (
                    <span key={tech} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-gray-300">{tech}</span>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Projects() {
  const { items: projects, loading } = useCollectionData('projects', fallbackProjects, { orderBy: 'displayOrder' });
  const [selectedProject, setSelectedProject] = useState(null);

  const projectCountLabel = useMemo(() => {
    if (!projects.length) return 'Portfolio-ready case studies';
    return `${projects.length} ${projects.length === 1 ? 'project' : 'projects'} ready to explore`;
  }, [projects.length]);

  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-24 md:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-[-10rem] top-32 h-[32rem] w-[32rem] rounded-full bg-amber-400/[0.055] blur-3xl" />
        <div className="absolute left-[-12rem] bottom-20 h-[28rem] w-[28rem] rounded-full bg-orange-400/[0.045] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 grid gap-8 lg:mb-16 lg:grid-cols-[minmax(0,0.72fr)_minmax(280px,0.28fr)] lg:items-end"
        >
          <div>
            <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 backdrop-blur">
              <span className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-400">Selected Work</span>
            </div>
            <h2 className="max-w-3xl text-5xl font-bold leading-[0.95] text-white md:text-6xl">Projects & Impact</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-400">
              Full-stack applications designed around useful workflows, maintainable systems, and clear outcomes for real users.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200">Showcase system</p>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              {projectCountLabel}. The grid auto-wraps from one to three columns and each card is generated from the project data.
            </p>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-[28rem] animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid auto-rows-fr gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {projects.map((project, index) => (
              <ProjectCard key={project.id || project.name} project={project} index={index} onLearnMore={setSelectedProject} />
            ))}
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-gray-500">No projects found.</div>
        )}
      </div>

      <AnimatePresence>
        {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
      </AnimatePresence>
    </section>
  );
}



