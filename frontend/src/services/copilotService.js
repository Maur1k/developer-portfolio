import { fallbackProjects, fallbackProfile, fallbackSkills, fallbackExperience } from '../data/fallbackPortfolio';

const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');

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
  const transferable = [];
  const gaps = [];

  const checks = [
    { skill: 'React / React 19', key: 'react', proj: 'backops-wib', evidence: 'Architected V2 Operations Dashboard in React 19 with Vite, keyset pagination, and live dispatch state.' },
    { skill: 'Flutter & Mobile Development', key: 'flutter', proj: 'wibav3', evidence: 'Re-architected When in Baguio Eats customer app for 60,000+ users with Provider cart persistence and 99.2% crash-free rate.' },
    { skill: 'Mobile Development (iOS/Android)', key: 'mobile', proj: 'wibav3', evidence: 'Deployed and maintained production applications across both App Store and Google Play.' },
    { skill: 'Node.js & Express REST APIs', key: 'node', proj: 'backops-wib', evidence: 'Modernized backend REST APIs with zero downtime, LRU caching, and sub-100ms response times.' },
    { skill: 'Laravel & PHP Backend', key: 'laravel', proj: 'client-project-tracker', evidence: 'Built decoupled REST API backend with form request validation and Eloquent ORM.' },
    { skill: 'MySQL & Relational Data', key: 'mysql', proj: 'backops-wib', evidence: 'Relational data modeling, compound indexing, and high-performance query optimization.' },
    { skill: 'Firebase & FCM Push Notifications', key: 'firebase', proj: 'backops-wib', evidence: 'Engineered high-reliability FCM HTTP v1 push pipeline with token normalization.' },
    { skill: 'REST APIs & Payment Webhooks', key: 'api', proj: 'backops-wib', evidence: 'Designed and consumed production REST APIs with PayMongo payment webhooks.' },
  ];

  for (const c of checks) {
    if (jdLower.includes(c.key)) {
      matched.push({ skill: c.skill, evidence: c.evidence, projectId: c.proj, confidence: 'production' });
    }
  }

  const transferableChecks = [
    { key: 'postgresql', skill: 'PostgreSQL', bridge: 'Relational schema design, compound indexing, and query optimization in MySQL directly transfer.' },
    { key: 'next.js', skill: 'Next.js', bridge: 'Deep component lifecycle and React 19 / Vite SPA experience enable rapid Next.js onboarding.' },
    { key: 'nextjs', skill: 'Next.js', bridge: 'Deep component lifecycle and React 19 / Vite SPA experience enable rapid Next.js onboarding.' },
    { key: 'stripe', skill: 'Stripe', bridge: 'PayMongo webhook handling, tokenization, and QR workflows directly map to Stripe integration patterns.' },
    { key: 'react native', skill: 'React Native', bridge: 'Mobile lifecycle and cross-platform UI architecture in Flutter combined with React expertise.' },
  ];

  for (const t of transferableChecks) {
    if (jdLower.includes(t.key)) {
      transferable.push({ skill: t.skill, bridge: t.bridge });
    }
  }

  const gapChecks = [
    { key: 'docker', name: 'Docker' },
    { key: 'kubernetes', name: 'Kubernetes' },
    { key: 'aws', name: 'AWS' },
    { key: 'graphql', name: 'GraphQL' },
    { key: 'python', name: 'Python / Django' },
    { key: 'golang', name: 'Go' },
  ];

  for (const g of gapChecks) {
    if (jdLower.includes(g.key)) {
      gaps.push({
        skill: g.name,
        assessment: `Maurik has not used ${g.name} in active production systems.`,
      });
    }
  }

  const matchScore = Math.min(96, Math.max(60, 50 + matched.length * 10 + transferable.length * 4 - gaps.length * 5));

  return {
    matchScore,
    headline: `Strong match across ${matched.map((m) => m.skill).join(', ') || 'full-stack web and mobile engineering'}.`,
    strongMatches: matched.length > 0 ? matched : [
      { skill: 'Full-Stack Web & Mobile', evidence: 'Production engineering across React 19, Node.js, Flutter, MySQL, and REST APIs.', projectId: 'backops-wib', confidence: 'production' },
    ],
    transferableSkills: transferable,
    gaps,
    relevantProjects: [
      { projectId: 'backops-wib', name: 'When in Baguio — Operations & Dispatch Platform', relevance: 'Production operations dashboard with React 19, Node.js, MySQL, and sub-100ms response times.' },
      { projectId: 'wibav3', name: 'When in Baguio Eats — Customer Mobile App', relevance: 'Production Flutter mobile app deployed to 60,000+ users across iOS and Android.' },
    ],
    recommendation: 'Maurik demonstrates strong technical depth in full-stack web and cross-platform mobile systems with verified production impact.',
  };
}

/**
 * Local Grounded Chat Engine with Context Awareness (Runs 100% on client / Vercel)
 */
function localChat(message, conversationHistory = []) {
  const m = (message || '').toLowerCase();
  const lastUserMsg = conversationHistory.slice(-2).find((h) => h.role === 'user')?.content?.toLowerCase() || '';

  // Case: Mobile / Flutter
  if (m.includes('mobile') || m.includes('flutter') || m.includes('ios') || m.includes('android') || (m.includes('app') && !m.includes('web'))) {
    return {
      message: 'Maurik has verified **production mobile experience** re-architecting the **When in Baguio Eats** customer application in **Flutter & Dart**.\n\nKey Highlights:\n- **60,000+ Active Users**: Deployed on Google Play and Apple App Store.\n- **99.2% Crash-Free Rate**: Highly stable cross-platform architecture.\n- **State Management**: Built with Provider and persistent cart caching for 40% faster checkout response.\n- **Integrations**: Google Maps & Leaflet GIS location routing, FCM push notifications, and PayMongo GCash payments.',
      evidence: [
        { projectId: 'wibav3', projectName: 'When in Baguio Eats', highlight: 'Flutter mobile app for 60,000+ users across iOS & Android' },
      ],
      confidence: 'confirmed',
      actions: [{ type: 'OPEN_PROJECT', target: 'wibav3' }],
      suggestedFollowUps: ['How was the mobile state management architected?', 'What payment gateways were integrated?', 'Show me the backend stack'],
    };
  }

  // Case: Contextual follow-up about backend/database after mobile discussion
  if ((m.includes('backend') || m.includes('database') || m.includes('stack')) && (lastUserMsg.includes('mobile') || lastUserMsg.includes('flutter'))) {
    return {
      message: 'For the **When in Baguio Eats** mobile app, the backend integrates with **Node.js/Express REST APIs** and **MySQL** for order processing, alongside **Firebase Cloud Messaging (FCM HTTP v1)** for real-time order lifecycle notifications.',
      evidence: [
        { projectId: 'wibav3', projectName: 'When in Baguio Eats', highlight: 'REST API & FCM HTTP v1 integration' },
        { projectId: 'backops-wib', projectName: 'Operations Dashboard', highlight: 'Node.js & MySQL backend' },
      ],
      confidence: 'confirmed',
      actions: [{ type: 'OPEN_PROJECT', target: 'backops-wib' }],
      suggestedFollowUps: ['How did you optimize database queries?', 'Show me the React dashboard project'],
    };
  }

  // Case: React / Frontend
  if (m.includes('react') || m.includes('frontend') || m.includes('dashboard') || m.includes('vite')) {
    return {
      message: 'Maurik has extensive production experience in modern **React (including React 19)**, **Vite**, and **Tailwind CSS**.\n\nEvidence:\n- **Operations Command Center (When in Baguio)**: Real-time dispatch board with sub-100ms dashboard queries using keyset pagination and LRU caching.\n- **ProjeX SaaS**: Decoupled React 19 + TypeScript frontend with real-time form validation.\n- **CLICK2SERVE**: Municipal kiosk interfaces with Tailwind CSS and 3D maps.',
      evidence: [
        { projectId: 'backops-wib', projectName: 'When in Baguio Operations', highlight: 'React 19 V2 dispatch command center' },
        { projectId: 'client-project-tracker', projectName: 'ProjeX SaaS', highlight: 'React + TypeScript decoupled frontend' },
      ],
      confidence: 'confirmed',
      actions: [
        { type: 'OPEN_PROJECT', target: 'backops-wib' },
        { type: 'HIGHLIGHT_SKILLS', target: 'skills', highlightTags: ['React', 'React 19', 'TypeScript'] },
      ],
      suggestedFollowUps: ['Tell me about the Node.js backend', 'What mobile projects has Maurik built?'],
    };
  }

  // Case: Backend / APIs / Laravel / Node
  if (m.includes('backend') || m.includes('api') || m.includes('node') || m.includes('laravel') || m.includes('database') || m.includes('mysql')) {
    return {
      message: 'Maurik has proven backend engineering experience across **Node.js/Express** and **Laravel/PHP** with **MySQL**:\n\n- **Node.js & Express (Production)**: Modernized REST APIs with zero downtime, keyset pagination, LRU caching, and PayMongo webhook verification.\n- **Laravel & PHP (Production & Civic)**: Built decoupled REST APIs with form request validation in ProjeX and queue management in CLICK2SERVE.\n- **Relational Schema Design**: Compound indexing, query profiling, and transaction management in MySQL.',
      evidence: [
        { projectId: 'backops-wib', projectName: 'When in Baguio Operations', highlight: 'Node.js/Express REST APIs with sub-100ms latency' },
        { projectId: 'client-project-tracker', projectName: 'ProjeX', highlight: 'Laravel 12 decoupled REST API' },
      ],
      confidence: 'confirmed',
      actions: [
        { type: 'OPEN_PROJECT', target: 'backops-wib' },
        { type: 'HIGHLIGHT_SKILLS', target: 'skills', highlightTags: ['Node.js', 'Laravel', 'MySQL'] },
      ],
      suggestedFollowUps: ['How were database queries optimized?', 'Show me the When in Baguio project'],
    };
  }

  // Case: Undocumented / Out-of-bounds technologies
  if (m.includes('stripe') || m.includes('docker') || m.includes('kubernetes') || m.includes('aws') || m.includes('graphql') || m.includes('next.js') || m.includes('postgresql')) {
    const tech = m.includes('stripe') ? 'Stripe' : m.includes('docker') ? 'Docker' : m.includes('kubernetes') ? 'Kubernetes' : m.includes('aws') ? 'AWS' : m.includes('graphql') ? 'GraphQL' : m.includes('next.js') ? 'Next.js' : 'PostgreSQL';
    return {
      message: `Maurik does **not have documented production experience with ${tech}** in his portfolio.\n\nHowever, his existing skills provide a strong foundation:\n- For databases / ${tech}: His depth in **MySQL schema design, compound indexing, and query optimization** transfers directly.\n- For payments: His production experience with **PayMongo webhooks, signature verification, and automated settlement** translates immediately to Stripe.`,
      evidence: [],
      confidence: 'transferable',
      actions: [{ type: 'HIGHLIGHT_SKILLS', target: 'skills', highlightTags: ['MySQL', 'REST APIs', 'Node.js'] }],
      suggestedFollowUps: ['What database technologies has he used?', 'Show me his production projects'],
    };
  }

  // Case: Payments / PayMongo / GCash
  if (m.includes('payment') || m.includes('paymongo') || m.includes('gcash') || m.includes('gateway') || m.includes('checkout') || m.includes('settlement')) {
    return {
      message: 'Maurik has verified production experience integrating **PayMongo** for end-to-end payment workflows:\n\n- **When in Baguio Eats Mobile (Flutter)**: Integrated secure **GCash QR generation** and automated in-app checkout reconciliation.\n- **Operations Dashboard (Node.js/React 19)**: Built automated **webhook listeners** for instant GCash, Maya, and credit/debit card transaction verification and settlement calculation.',
      evidence: [
        { projectId: 'backops-wib', projectName: 'When in Baguio Operations', highlight: 'PayMongo automated webhooks for GCash, Maya, & Cards' },
        { projectId: 'wibav3', projectName: 'When in Baguio Eats', highlight: 'Flutter GCash QR checkout and payment flow' },
      ],
      confidence: 'confirmed',
      actions: [
        { type: 'OPEN_PROJECT', target: 'backops-wib' },
        { type: 'HIGHLIGHT_SKILLS', target: 'skills', highlightTags: ['PayMongo', 'REST APIs'] },
      ],
      suggestedFollowUps: ['How were payment webhooks handled?', 'Tell me about the backend architecture', 'Show me the Flutter mobile app'],
    };
  }

  // Case: Experience / Baguio
  if (m.includes('baguio') || m.includes('experience') || m.includes('work') || m.includes('role') || m.includes('company')) {
    return {
      message: 'At **When in Baguio Inc.**, Maurik started as a Full Stack Web Developer Intern (Jan – Apr 2026) and transitioned into a **Contractual Software Developer** role (2026 – Present).\n\nKey Contributions:\n- **Operations Dashboard**: Architected the React 19 V2 operations center with sub-100ms loading speeds.\n- **Customer Mobile App**: Re-architected in Flutter for 60,000+ users with 99.2% crash-free stability.\n- **Backend & Push Pipeline**: Engineered Node.js APIs, FCM HTTP v1 push notifications, and PayMongo payment reconciliations.',
      evidence: [
        { projectId: 'backops-wib', projectName: 'When in Baguio Operations', highlight: 'React 19 & Node.js Dispatch Platform' },
        { projectId: 'wibav3', projectName: 'When in Baguio Eats', highlight: 'Flutter Customer Mobile App' },
      ],
      confidence: 'confirmed',
      actions: [
        { type: 'OPEN_PROJECT', target: 'backops-wib' },
        { type: 'SCROLL_TO', target: 'experience' },
      ],
      suggestedFollowUps: ['Show me mobile development details', 'What database optimizations were done?'],
    };
  }

  // Case: Resume
  if (m.includes('resume') || m.includes('cv')) {
    return {
      message: 'Opening Maurik\'s verified resume viewer.',
      evidence: [],
      confidence: 'confirmed',
      actions: [{ type: 'OPEN_RESUME', target: 'resume' }],
      suggestedFollowUps: ['View contact information', 'Show tech stack overview'],
    };
  }

  // Default response
  return {
    message: 'Maurik is a **Software Developer** specializing in Full-Stack Web and Mobile engineering with verified production experience across **React 19, Node.js, Flutter, Laravel, MySQL, and Firebase**.\n\nYou can ask about his specific projects, technical architecture, or paste a Job Description in the Recruiter Match tab for a comprehensive fit evaluation.',
    evidence: [
      { projectId: 'backops-wib', projectName: 'When in Baguio Operations', highlight: 'React 19, Node.js, MySQL' },
      { projectId: 'wibav3', projectName: 'When in Baguio Eats', highlight: 'Flutter, iOS, Android' },
    ],
    confidence: 'confirmed',
    actions: [{ type: 'SCROLL_TO', target: 'projects' }],
    suggestedFollowUps: ['What mobile experience does Maurik have?', 'Show me projects using React', 'Tell me about his work at When in Baguio'],
  };
}

function localExplain(projectId, question) {
  const project = clientKnowledge.projects.find((p) => p.id === projectId) || clientKnowledge.projects[0];
  return {
    answer: `### Architecture of ${project.name}\n\n**Core Stack**: ${(project.technologies || []).join(', ')}\n\n${project.longDescription || project.summary || project.description}\n\n**Key Engineering Contributions**:\n${(project.contributions || project.highlights || []).slice(0, 3).map((h) => `- ${h}`).join('\n')}`,
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
    return localChat(message, history);
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

