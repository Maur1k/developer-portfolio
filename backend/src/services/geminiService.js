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
 * Execute content generation with fallback models
 */
async function generateWithFallback(prompt) {
  const models = ['gemini-flash-latest', 'gemini-3.6-flash', 'gemini-3.5-flash'];
  let lastError = null;

  for (const modelName of models) {
    try {
      const model = getModel(modelName);
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      return text;
    } catch (err) {
      console.warn(`Model ${modelName} failed, trying next fallback:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All model attempts failed.');
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
    console.error('Gemini match error, using intelligent fallback parser:', error);
    // Intelligent local fallback if API is unavailable or rate-limited
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
    console.error('Gemini chat error, using local fallback:', error);
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
    console.error('Gemini explain error, using local fallback:', error);
    return generateLocalExplainFallback(project, question);
  }
}

// ── Local Fallback Generator (Guarantees 100% uptime) ───────
function generateLocalMatchFallback(jd) {
  const jdLower = jd.toLowerCase();
  const matched = [];
  const gaps = [];

  const checks = [
    { skill: 'React', key: 'react', proj: 'backops-wib', evidence: 'Engineered V2 Operations Dashboard in React 19 for food delivery dispatch.' },
    { skill: 'Node.js', key: 'node', proj: 'backops-wib', evidence: 'Modernized backend REST APIs with zero downtime and sub-100ms response times.' },
    { skill: 'Flutter', key: 'flutter', proj: 'wibav3', evidence: 'V2 customer mobile app on iOS/Android with persistent cart and 99.2% crash-free rate.' },
    { skill: 'Laravel / PHP', key: 'laravel', proj: 'client-project-tracker', evidence: 'Built decoupled REST API backend with form request validation.' },
    { skill: 'MySQL', key: 'mysql', proj: 'backops-wib', evidence: 'Relational data modeling, compound indexing, and keyset pagination.' },
    { skill: 'Firebase', key: 'firebase', proj: 'wibav3', evidence: 'Firebase Cloud Messaging (FCM HTTP v1) push notifications with deep-linking.' },
    { skill: 'REST APIs', key: 'api', proj: 'backops-wib', evidence: 'Designed and consumed production REST APIs across web and mobile.' },
  ];

  for (const c of checks) {
    if (jdLower.includes(c.key)) {
      matched.push({ skill: c.skill, evidence: c.evidence, projectId: c.proj, confidence: 'production' });
    }
  }

  // Check gaps
  const gapChecks = ['postgresql', 'mongodb', 'docker', 'kubernetes', 'aws', 'graphql', 'next.js', 'vue', 'python'];
  for (const g of gapChecks) {
    if (jdLower.includes(g)) {
      gaps.push({
        skill: g.toUpperCase(),
        assessment: `Maurik has not used ${g.toUpperCase()} in production.`,
        transferability: 'Strong foundation in relational databases, REST patterns, and JavaScript/TypeScript enables rapid adaptation.',
      });
    }
  }

  const score = Math.min(95, Math.max(65, 50 + matched.length * 10 - gaps.length * 5));

  return {
    matchScore: score,
    headline: `Strong match across ${matched.map((m) => m.skill).join(', ') || 'core full-stack development'}.`,
    strongMatches: matched.length > 0 ? matched : [
      { skill: 'Full Stack Web & Mobile', evidence: 'Production engineering across React, Node.js, Flutter, and MySQL.', projectId: 'backops-wib', confidence: 'production' },
    ],
    gaps,
    relevantProjects: [
      { projectId: 'backops-wib', name: 'When in Baguio — Operations & Dispatch Platform', relevance: 'Production operations dashboard with React 19, Node.js, and MySQL.' },
      { projectId: 'wibav3', name: 'When in Baguio Eats — Mobile App', relevance: 'Production Flutter app on iOS and Android with persistent state.' },
    ],
    transferability: 'Extensive hands-on experience in full-stack web and mobile systems provides a solid foundation for picking up adjacent technologies quickly.',
    recommendation: 'Maurik demonstrates strong capabilities in modern frontend, backend services, and mobile development.',
  };
}

function generateLocalChatFallback(message) {
  const m = message.toLowerCase();

  if (m.includes('baguio') || m.includes('experience') || m.includes('work') || m.includes('contract')) {
    return {
      message: 'Maurik worked as a Software Developer at When in Baguio Inc., contributing to the BackOps & Dispatch Platform (React 19, Node.js, MySQL) and the customer mobile app (Flutter for iOS/Android). His work covered real-time order tracking, FCM HTTP v1 notifications, and payment integrations.',
      actions: [
        { type: 'OPEN_PROJECT', target: 'backops-wib' },
        { type: 'SCROLL_TO', target: 'experience' },
      ],
      suggestedFollowUps: ['Show me mobile development details', 'What database optimization was done?'],
    };
  }

  if (m.includes('mobile') || m.includes('flutter') || m.includes('ios') || m.includes('android')) {
    return {
      message: 'Maurik developed the V2 upgrade of the When in Baguio Eats customer app using Flutter and Dart, supporting 60,000+ users with persistent cart state, Google Maps/Leaflet GIS, and 99.2% crash-free stability.',
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
    answer: `${project.name} is engineered using ${project.technologies.join(', ')}. ${project.summary} Contributions include: ${project.contributions.slice(0, 3).join('. ')}.`,
    relatedTopics: ['How does data synchronization work?', 'What were the scaling considerations?'],
  };
}
