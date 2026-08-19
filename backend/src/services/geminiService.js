import { GoogleGenerativeAI } from '@google/generative-ai';
import { portfolioKnowledge } from '../data/portfolioKnowledge.js';

const SYSTEM_PROMPT = `You are Maurik AI, the portfolio copilot for Maurik Angelo L. Fernandez — a Software Developer specializing in Full-Stack Web and Mobile Development.

You serve as an intelligent assistant that helps recruiters, hiring managers, and visitors evaluate Maurik's qualifications, explore his projects, and understand his technical capabilities.

## CRITICAL RULES — ANTI-HALLUCINATION & FORMATTING
1. You ONLY know what is provided in the PORTFOLIO DATA below. Never invent projects, technologies, companies, or experiences.
2. If asked about technologies Maurik has NOT used in production (listed in boundaries.notUsedInProduction), clearly state: "This technology was not part of Maurik's production work." Then explain how his existing skills transfer.
3. Never claim Maurik has production experience with something not listed in his projects or skills.
4. Be honest about skill gaps.
5. When citing evidence, always reference specific project names and contributions.
6. DO NOT use emojis in your responses. Keep formatting professional, clean, and minimalist.

## PORTFOLIO DATA
${JSON.stringify(portfolioKnowledge, null, 2)}

## RESPONSE STYLE
- Be professional, concise, and evidence-based.
- Do not use emojis anywhere in text, titles, or tags.
- When answering questions, always cite specific projects, contributions, and results.
- Sound confident about verified skills, honest about gaps, and thoughtful about transferability.`;

function getModel(modelName = 'gemini-flash-latest') {
  const apiKey = process.env.GEMINI_API_KEY || '';
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
  });
}

/**
 * Execute content generation with a tight 3.5-second timeout per model
 */
async function generateWithFallback(prompt) {
  const models = ['gemini-flash-latest', 'gemini-3.5-flash'];
  let lastError = null;

  for (const modelName of models) {
    try {
      const model = getModel(modelName);
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Model ${modelName} timed out (high API traffic)`)), 3500)
      );

      const generatePromise = model.generateContent(prompt).then((res) => res.response.text().trim());

      const text = await Promise.race([generatePromise, timeoutPromise]);
      if (text) return text;
    } catch (err) {
      console.warn(`Model ${modelName} status:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('API busy, switching to local engine.');
}

// ── Match Job Description ──────────────────────────────────
export async function matchJobDescription(jobDescription) {
  const prompt = `A recruiter has submitted the following Job Description. Analyze it against Maurik's portfolio and return a structured JSON evaluation. Do NOT use emojis in any part of the output.

JOB DESCRIPTION:
"""${jobDescription}"""

Return ONLY valid JSON (no markdown fences, no commentary) in this exact format:
{
  "matchScore": <number 0-100>,
  "headline": "<1-sentence summary of fit without emojis>",
  "strongMatches": [
    {
      "skill": "<technology or skill>",
      "evidence": "<specific project or contribution proving this>",
      "projectId": "<id of the project for evidence linking (e.g. backops-wib, wibav3, click2serve, client-project-tracker)>",
      "confidence": "production" | "academic" | "familiar"
    }
  ],
  "gaps": [
    {
      "skill": "<required skill Maurik lacks>",
      "assessment": "<honest evaluation of the gap without emojis>",
      "transferability": "<how existing skills bridge this gap, if applicable>"
    }
  ],
  "relevantProjects": [
    {
      "projectId": "<project id>",
      "name": "<project name>",
      "relevance": "<why this project is relevant to the JD>"
    }
  ],
  "transferability": "<2-3 sentence summary of how Maurik's existing stack bridges any gaps without emojis>",
  "recommendation": "<2-3 sentence professional recommendation without emojis>"
}`;

  try {
    const text = await generateWithFallback(prompt);
    const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.warn('Serving match assessment via local grounded engine:', error.message);
    return generateLocalMatchFallback(jobDescription);
  }
}

// ── Chat Copilot (Natural Language + UI Actions) ───────────
export async function chatCopilot(message, conversationHistory = []) {
  const prompt = `The visitor asked: "${message}"

Respond with ONLY valid JSON (no markdown fences). Do NOT use any emojis in message or actions.
Format:
{
  "message": "<your natural language response, citing specific evidence from the portfolio, no emojis>",
  "actions": [
    {
      "type": "SCROLL_TO" | "OPEN_PROJECT" | "HIGHLIGHT_SKILLS" | "OPEN_RESUME",
      "target": "<section id like 'about', 'experience', 'projects', 'skills', 'contact' OR project id like 'backops-wib', 'wibav3', 'click2serve', 'client-project-tracker'>",
      "highlightTags": ["<optional tech tags to highlight>"]
    }
  ],
  "suggestedFollowUps": ["<2-3 follow-up questions the visitor might ask>"]
}

Rules for actions:
- Use SCROLL_TO for navigating to sections (about, experience, projects, skills, contact).
- Use OPEN_PROJECT with the project id to open a project detail modal.
- Use HIGHLIGHT_SKILLS with highlightTags to visually emphasize technologies.
- Use OPEN_RESUME to open the resume viewer.
- Do NOT use emojis.`;

  try {
    const text = await generateWithFallback(prompt);
    const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.warn('Serving chat response via local grounded engine:', error.message);
    return generateLocalChatFallback(message);
  }
}

// ── Explain Architecture (Project-Specific) ────────────────
export async function explainArchitecture(projectId, question) {
  const project = portfolioKnowledge.projects.find((p) => p.id === projectId);

  if (!project) {
    return {
      answer: `Project ID "${projectId}" was not found. Available projects: ${portfolioKnowledge.projects.map((p) => p.name).join(', ')}.`,
      relatedTopics: [],
    };
  }

  const prompt = `The visitor is looking at the project "${project.name}" and asked:
"${question}"

Project details:
${JSON.stringify(project, null, 2)}

Respond with ONLY valid JSON (no markdown fences, no emojis) in this format:
{
  "answer": "<detailed, grounded answer about this specific project. Only reference technologies and architecture that are actually documented. If asked about something not used, clearly state it was not part of the architecture. No emojis.>",
  "relatedTopics": ["<2-3 related architectural questions the visitor might want to explore without emojis>"]
}`;

  try {
    const text = await generateWithFallback(prompt);
    const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.warn('Serving architecture explainer via local grounded engine:', error.message);
    return generateLocalExplainFallback(project, question);
  }
}

// ── Local Fallback Generator (Guarantees Instant Uptime) ─────
function generateLocalMatchFallback(jd) {
  const jdLower = jd.toLowerCase();
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

  // Check gaps
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

function generateLocalChatFallback(message) {
  const m = message.toLowerCase();

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

  return {
    message: 'Maurik is a full-stack software developer with production experience in React, Node.js, Flutter, Laravel, MySQL, and Firebase. You can ask about his specific projects, technical stack, or paste a Job Description for a match assessment.',
    actions: [{ type: 'SCROLL_TO', target: 'projects' }],
    suggestedFollowUps: ['Show me mobile projects', 'What is his experience at When in Baguio?', 'Check tech stack'],
  };
}

function generateLocalExplainFallback(project, question) {
  return {
    answer: `${project.name} is engineered using ${project.technologies.join(', ')}. ${project.summary}\n\nKey architectural highlights:\n${project.highlights.slice(0, 3).map((h) => `- ${h}`).join('\n')}`,
    relatedTopics: ['How does data synchronization work?', 'What were the scaling considerations?'],
  };
}
