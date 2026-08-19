import { fallbackProjects, fallbackProfile, fallbackSkills, fallbackExperience } from '../data/fallbackPortfolio';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Built-in grounded dataset for standalone/Vercel client execution
const clientKnowledge = {
  profile: fallbackProfile,
  projects: fallbackProjects,
  skills: fallbackSkills,
  experience: fallbackExperience,
};

/**
 * Local Grounded Matching Engine (Runs 100% on client / Vercel with zero server required)
 */
function localMatch(jd) {
  const jdLower = (jd || '').toLowerCase();
  const matched = [];
  const gaps = [];

  const checks = [
    { skill: 'React / React 19', key: 'react', proj: 'backops-wib', evidence: 'Architected V2 Operations Dashboard in React 19 with Vite, keyset pagination, and live dispatch state.' },
    { skill: 'Flutter & Dart', key: 'flutter', proj: 'wibav3', evidence: 'Re-architected When in Baguio Eats customer app for 60,000+ users with Provider cart persistence.' },
    { skill: 'Mobile Development (iOS/Android)', key: 'mobile', proj: 'wibav3', evidence: 'Deployed and maintained production applications across both App Store and Google Play.' },
    { skill: 'Node.js & Express', key: 'node', proj: 'backops-wib', evidence: 'Modernized backend REST APIs with zero downtime, LRU caching, and sub-100ms response times.' },
    { skill: 'Laravel & PHP', key: 'laravel', proj: 'client-project-tracker', evidence: 'Built decoupled REST API backend with form request validation and Eloquent ORM.' },
    { skill: 'MySQL & Relational Data', key: 'mysql', proj: 'backops-wib', evidence: 'Relational data modeling, compound indexing, and high-performance query optimization.' },
    { skill: 'Firebase & FCM Push', key: 'firebase', proj: 'backops-wib', evidence: 'Engineered high-reliability FCM HTTP v1 push pipeline with token normalization.' },
    { skill: 'REST APIs & Integrations', key: 'api', proj: 'backops-wib', evidence: 'Designed and consumed production REST APIs with PayMongo payment webhooks.' },
  ];

  for (const c of checks) {
    if (jdLower.includes(c.key)) {
      matched.push({ skill: c.skill, evidence: c.evidence, projectId: c.proj, confidence: 'production' });
    }
  }

  const gapChecks = [
    { key: 'postgresql', name: 'PostgreSQL' },
    { key: 'mongodb', name: 'MongoDB' },
    { key: 'docker', name: 'Docker' },
    { key: 'kubernetes', name: 'Kubernetes' },
    { key: 'aws', name: 'AWS' },
    { key: 'graphql', name: 'GraphQL' },
    { key: 'next.js', name: 'Next.js' },
    { key: 'nextjs', name: 'Next.js' },
    { key: 'python', name: 'Python' },
  ];

  for (const g of gapChecks) {
    if (jdLower.includes(g.key)) {
      gaps.push({
        skill: g.name,
        assessment: `Maurik has not used ${g.name} in active production.`,
        transferability: 'Strong background in relational schema design, REST architecture, and modern JavaScript/TypeScript allows fast adaptation.',
      });
    }
  }

  const score = Math.min(98, Math.max(65, 50 + matched.length * 10 - gaps.length * 4));

  return {
    matchScore: score,
    headline: `Strong match across ${matched.map((m) => m.skill).join(', ') || 'full-stack web and mobile engineering'}.`,
    strongMatches: matched.length > 0 ? matched : [
      { skill: 'Full-Stack Web & Mobile', evidence: 'Production engineering across React 19, Node.js, Flutter, MySQL, and REST APIs.', projectId: 'backops-wib', confidence: 'production' },
    ],
    gaps,
    relevantProjects: [
      { projectId: 'backops-wib', name: 'When in Baguio — Operations & Dispatch Platform', relevance: 'Production operations dashboard with React 19, Node.js, MySQL, and sub-100ms response times.' },
      { projectId: 'wibav3', name: 'When in Baguio Eats — Customer Mobile App', relevance: 'Production Flutter mobile app deployed to 60,000+ users across iOS and Android.' },
    ],
    transferability: 'Maurik brings extensive production experience in full-stack web and mobile systems, making onboarding fast for adjacent frameworks and modern toolchains.',
    recommendation: 'Maurik demonstrates strong technical depth in frontend, backend services, mobile development, and real-time operations software.',
  };
}

/**
 * Local Grounded Chat Engine (Runs 100% on client / Vercel with zero server required)
 */
function localChat(message) {
  const m = (message || '').toLowerCase();

  if (m.includes('baguio') || m.includes('experience') || m.includes('work') || m.includes('contract') || m.includes('intern')) {
    return {
      message: 'At When in Baguio Inc., Maurik served as a Full Stack Web Developer Intern (Jan 2026 – Apr 2026) and transitioned into a Contractual Software Developer role (2026 – Present).\n\nKey accomplishments:\n- Architected the React 19 V2 dispatch and operations dashboard with sub-100ms queries.\n- Modernized Node.js/Express backend APIs with LRU caching and keyset pagination.\n- Upgraded the customer mobile app in Flutter for 60,000+ users across iOS and Android with persistent cart state.\n- Engineered reliable FCM HTTP v1 push notification pipelines and automated PayMongo/GCash payment reconciliations.',
      actions: [
        { type: 'OPEN_PROJECT', target: 'backops-wib' },
        { type: 'SCROLL_TO', target: 'experience' },
      ],
      suggestedFollowUps: ['Show me mobile development details', 'What database optimizations were done?'],
    };
  }

  if (m.includes('mobile') || m.includes('flutter') || m.includes('ios') || m.includes('android')) {
    return {
      message: 'Maurik re-architected the When in Baguio Eats customer app using Flutter and Dart, serving 60,000+ users with persistent cart state, Google Maps/Leaflet GIS restaurant discovery, and 99.2% crash-free stability.',
      actions: [
        { type: 'OPEN_PROJECT', target: 'wibav3' },
        { type: 'HIGHLIGHT_SKILLS', target: 'skills', highlightTags: ['Flutter', 'Mobile Development'] },
      ],
      suggestedFollowUps: ['How was payment integrated?', 'What state management was used?'],
    };
  }

  if (m.includes('react') || m.includes('frontend') || m.includes('dashboard')) {
    return {
      message: 'Maurik has production experience with React 19, Vite, and Tailwind CSS, having built the operations command center for When in Baguio with sub-100ms dashboard queries and live courier tracking.',
      actions: [
        { type: 'OPEN_PROJECT', target: 'backops-wib' },
        { type: 'HIGHLIGHT_SKILLS', target: 'skills', highlightTags: ['React', 'Frontend Development'] },
      ],
      suggestedFollowUps: ['Show me the backend stack', 'What projects use Laravel?'],
    };
  }

  if (m.includes('api') || m.includes('backend') || m.includes('node') || m.includes('laravel')) {
    return {
      message: 'Maurik has extensive backend experience across Node.js/Express and Laravel/PHP:\n- Node.js/Express: REST APIs for the When in Baguio operations dashboard with keyset pagination and LRU caching.\n- Laravel: Decoupled REST APIs with form request validation in ProjeX and civic service workflows in Click2Serve.\n- Relational DBs: MySQL schema modeling, compound indexing, and query optimization.',
      actions: [
        { type: 'OPEN_PROJECT', target: 'backops-wib' },
        { type: 'HIGHLIGHT_SKILLS', target: 'skills', highlightTags: ['Node.js', 'REST APIs', 'MySQL'] },
      ],
      suggestedFollowUps: ['Show me database details', 'Tell me about payment integrations'],
    };
  }

  if (m.includes('resume') || m.includes('cv')) {
    return {
      message: 'Opening Maurik\'s resume viewer.',
      actions: [{ type: 'OPEN_RESUME', target: 'resume' }],
      suggestedFollowUps: ['View contact information', 'Show tech stack overview'],
    };
  }

  if (m.includes('hello') || m.includes('hi') || m.includes('who') || m.includes('help')) {
    return {
      message: 'Hello! I am Maurik AI, a portfolio copilot. I can help you evaluate Maurik\'s qualifications, explore his projects, match a Job Description against his verified stack, or navigate directly to relevant code evidence.',
      actions: [{ type: 'SCROLL_TO', target: 'about' }],
      suggestedFollowUps: ['Tell me about his work at When in Baguio', 'Show me mobile projects', 'Check tech stack'],
    };
  }

  return {
    message: 'Maurik is a full-stack software developer with production experience in React 19, Node.js, Flutter, Laravel, MySQL, and Firebase. You can ask about his specific projects, technical stack, or paste a Job Description for a match assessment.',
    actions: [{ type: 'SCROLL_TO', target: 'projects' }],
    suggestedFollowUps: ['Show me mobile projects', 'What is his experience at When in Baguio?', 'Check tech stack'],
  };
}

function localExplain(projectId, question) {
  const project = clientKnowledge.projects.find((p) => p.id === projectId) || clientKnowledge.projects[0];
  return {
    answer: `${project.name} is engineered using ${(project.technologies || []).join(', ')}. ${project.longDescription || project.summary || project.description}\n\nKey architectural contributions:\n${(project.contributions || project.highlights || []).slice(0, 3).map((h) => `- ${h}`).join('\n')}`,
    relatedTopics: ['How does data synchronization work?', 'What were the scaling considerations?'],
  };
}

/**
 * Universal Copilot API Service
 * 1. Tries backend endpoint if VITE_API_URL or localhost is reachable.
 * 2. Seamlessly falls back to local client engine if offline / deployed on Vercel.
 */
export const copilotService = {
  async matchJobDescription(jobDescription) {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/api/copilot/match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobDescription }),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, using client match engine:', e.message);
      }
    }
    // Instant client fallback
    return localMatch(jobDescription);
  },

  async chat(message, history = []) {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/api/copilot/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, history }),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, using client chat engine:', e.message);
      }
    }
    // Instant client fallback
    return localChat(message);
  },

  async explainArchitecture(projectId, question) {
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/api/copilot/explain`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, question }),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, using client explain engine:', e.message);
      }
    }
    // Instant client fallback
    return localExplain(projectId, question);
  },
};
