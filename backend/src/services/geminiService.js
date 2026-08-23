import { GoogleGenerativeAI } from '@google/generative-ai';
import { portfolioKnowledge } from '../data/portfolioKnowledge.js';

const SYSTEM_PROMPT = `You are Maurik AI, the portfolio copilot and technical representative for Maurik Angelo L. Fernandez — a Software Developer specializing in Full-Stack Web and Mobile Development.

Your purpose is to help recruiters, hiring managers, and engineers evaluate Maurik's qualifications, explore his projects, inspect his code architecture, and verify his hands-on experience.

## CORE PERSONA & COMMUNICATION RULES
- Professional, direct, articulate, and evidence-driven.
- Confident but honest. Avoid empty marketing buzzwords and fake enthusiasm (do NOT say "Awesome question!", "Sure thing!", etc.).
- Do NOT use emojis anywhere in your messages or actions. Keep text clean and terminal/engineering-grade.
- Format messages using Markdown (bullet points, bold highlights, concise inline code where relevant).
- Be concise by default (2-4 punchy paragraphs or structured bullet points).

## EVIDENCE-FIRST ACCURACY RULES
1. CONFIRMED EXPERIENCE: Only claim production experience for technologies documented in the PORTFOLIO DATA. Always cite the specific project name, metric, or technical responsibility.
2. TRANSFERABLE EXPERIENCE: If asked about adjacent technologies (e.g. PostgreSQL, Next.js, React Native, Docker, Stripe), explicitly state: "This is not explicitly documented in Maurik's production work, but his strong background in [related technology e.g. MySQL / React 19 / PayMongo] provides a fast learning curve."
3. MISSING / UNDOCUMENTED EXPERIENCE: If asked about technologies Maurik has NOT used (e.g. Kubernetes, AWS, GraphQL, Python, Go, Java Spring Boot), clearly state: "Maurik does not have documented experience with this technology in his portfolio." Never invent companies, certifications, or projects.
4. ACTION DISPATCH: You can recommend UI actions using the allowed types:
   - OPEN_PROJECT: target MUST be one of ["backops-wib", "wibav3", "click2serve", "client-project-tracker"]
   - SCROLL_TO: target MUST be one of ["about", "experience", "projects", "skills", "contact"]
   - HIGHLIGHT_SKILLS: target is "skills", highlightTags is an array of technology strings
   - OPEN_RESUME: target is "resume"

## PORTFOLIO DATA
${JSON.stringify(portfolioKnowledge, null, 2)}
`;

// Free-tier eligible models in order of priority
const FREE_TIER_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

function getModel(modelName, systemInstruction = SYSTEM_PROMPT) {
  const genAI = getGenAI();
  if (!genAI) throw new Error('GEMINI_API_KEY is not configured');
  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });
}

/**
 * Format and normalize conversational history for Gemini SDK
 * Gemini requires alternating user/model roles starting with 'user'
 */
function formatGeminiHistory(history = []) {
  if (!Array.isArray(history) || history.length === 0) return [];

  const formatted = [];
  for (const item of history) {
    if (!item || !item.content) continue;
    const role = item.role === 'assistant' || item.role === 'model' ? 'model' : 'user';
    const text = typeof item.content === 'string' ? item.content : JSON.stringify(item.content);

    // Merge consecutive messages with the same role
    if (formatted.length > 0 && formatted[formatted.length - 1].role === role) {
      formatted[formatted.length - 1].parts[0].text += `\n\n${text}`;
    } else {
      formatted.push({
        role,
        parts: [{ text }],
      });
    }
  }

  // Gemini history must start with a 'user' turn
  while (formatted.length > 0 && formatted[0].role !== 'user') {
    formatted.shift();
  }

  return formatted;
}

// ── Match Job Description ──────────────────────────────────
export async function matchJobDescription(jobDescription) {
  const prompt = `A recruiter or hiring manager provided this Job Description. Evaluate Maurik against it strictly based on the portfolio data. Return ONLY valid JSON (no markdown fences, no emojis).

JOB DESCRIPTION:
"""${jobDescription}"""

Required JSON Structure:
{
  "matchScore": <number between 0 and 100 based on realistic fit>,
  "headline": "<1-sentence direct summary of candidate fit without emojis>",
  "strongMatches": [
    {
      "skill": "<matched skill>",
      "evidence": "<specific project evidence or metric proving this>",
      "projectId": "<backops-wib | wibav3 | click2serve | client-project-tracker>",
      "confidence": "production" | "academic" | "familiar"
    }
  ],
  "transferableSkills": [
    {
      "skill": "<requested skill>",
      "bridge": "<how Maurik's verified skills bridge this, e.g. MySQL -> PostgreSQL, PayMongo -> Stripe>"
    }
  ],
  "gaps": [
    {
      "skill": "<missing skill Maurik has not used>",
      "assessment": "<honest statement that this is not in Maurik's production work>"
    }
  ],
  "relevantProjects": [
    {
      "projectId": "<backops-wib | wibav3 | click2serve | client-project-tracker>",
      "name": "<project name>",
      "relevance": "<direct reason why this project demonstrates the required capabilities>"
    }
  ],
  "recommendation": "<2-3 sentence technical recommendation for the hiring team without emojis>"
}`;

  const genAI = getGenAI();
  if (genAI) {
    for (const modelName of FREE_TIER_MODELS) {
      try {
        const model = getModel(modelName);
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed && typeof parsed.matchScore === 'number') {
          return parsed;
        }
      } catch (err) {
        console.warn(`[Gemini Match] Model ${modelName} notice:`, err.message);
      }
    }
  }

  return generateLocalMatchFallback(jobDescription);
}

// ── Multi-Turn Chat Copilot ────────────────────────────────
export async function chatCopilot(message, conversationHistory = []) {
  const prompt = `Visitor message: "${message}"

Respond strictly as Maurik AI adhering to all persona and accuracy rules. Return ONLY valid JSON (no markdown fences, no emojis).

Required JSON format:
{
  "message": "<Conversational markdown response grounded in Maurik's actual work. Use bolding and concise bullet points. Cite evidence.>",
  "evidence": [
    {
      "projectId": "<backops-wib | wibav3 | click2serve | client-project-tracker>",
      "projectName": "<Project Name>",
      "highlight": "<Brief evidence summary>"
    }
  ],
  "confidence": "confirmed" | "transferable" | "missing",
  "actions": [
    {
      "type": "OPEN_PROJECT" | "SCROLL_TO" | "HIGHLIGHT_SKILLS" | "OPEN_RESUME",
      "target": "<backops-wib | wibav3 | click2serve | client-project-tracker | about | experience | projects | skills | contact | resume>",
      "highlightTags": ["<optional skill names>"]
    }
  ],
  "suggestedFollowUps": ["<2-3 relevant, dynamic follow-up questions for the visitor>"]
}`;

  const genAI = getGenAI();
  if (genAI) {
    const formattedHistory = formatGeminiHistory(conversationHistory);

    for (const modelName of FREE_TIER_MODELS) {
      try {
        const model = getModel(modelName);

        let text = '';
        if (formattedHistory.length > 0) {
          const chat = model.startChat({ history: formattedHistory });
          const res = await chat.sendMessage(prompt);
          text = res.response.text().trim();
        } else {
          const res = await model.generateContent(prompt);
          text = res.response.text().trim();
        }

        const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
        const parsed = JSON.parse(cleaned);

        if (parsed && typeof parsed.message === 'string') {
          return {
            message: parsed.message,
            evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [],
            confidence: parsed.confidence || 'confirmed',
            actions: Array.isArray(parsed.actions) ? parsed.actions : [],
            suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps) ? parsed.suggestedFollowUps : [],
          };
        }
      } catch (err) {
        console.warn(`[Gemini Chat] Model ${modelName} notice:`, err.message);
      }
    }
  }

  return generateLocalChatFallback(message, conversationHistory);
}

// ── Explain Architecture ───────────────────────────────────
export async function explainArchitecture(projectId, question) {
  const project = portfolioKnowledge.projects.find((p) => p.id === projectId);
  if (!project) {
    return {
      answer: `Project "${projectId}" was not found. Available projects: ${portfolioKnowledge.projects.map((p) => p.name).join(', ')}.`,
      relatedTopics: [],
    };
  }

  const prompt = `The visitor is inspecting the project "${project.name}" and asked:
"${question}"

Project Specifications:
${JSON.stringify(project, null, 2)}

Explain the architecture accurately based ONLY on this project's verified specifications.
Return ONLY valid JSON (no markdown fences, no emojis) in this format:
{
  "answer": "<Deep architectural explanation formatted in Markdown. Cite database schemas, caching layers, or state architecture if relevant.>",
  "relatedTopics": ["<2-3 technical deep-dive questions specific to this project>"]
}`;

  const genAI = getGenAI();
  if (genAI) {
    for (const modelName of FREE_TIER_MODELS) {
      try {
        const model = getModel(modelName);
        const res = await model.generateContent(prompt);
        const text = res.response.text().trim();
        const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed && typeof parsed.answer === 'string') {
          return parsed;
        }
      } catch (err) {
        console.warn(`[Gemini Explain] Model ${modelName} notice:`, err.message);
      }
    }
  }

  return generateLocalExplainFallback(project, question);
}

// ── Grounded Local Fallback Engine (Zero Server / Rate-Limit Safe) ──
function generateLocalMatchFallback(jd) {
  const jdLower = (jd || '').toLowerCase();
  const matched = [];
  const transferable = [];
  const gaps = [];

  const checks = [
    { skill: 'React / React 19', key: 'react', proj: 'backops-wib', evidence: 'Architected V2 Operations Dashboard with React 19, Vite, and live dispatch board.' },
    { skill: 'Flutter & Mobile Development', key: 'flutter', proj: 'wibav3', evidence: 'Re-architected When in Baguio Eats customer app for 60,000+ users with 99.2% crash-free rate.' },
    { skill: 'Node.js & Express REST APIs', key: 'node', proj: 'backops-wib', evidence: 'Modernized backend REST endpoints with LRU caching, keyset pagination, and sub-100ms loads.' },
    { skill: 'Laravel & PHP Backend', key: 'laravel', proj: 'client-project-tracker', evidence: 'Built decoupled REST API backend with form request validation and Eloquent ORM.' },
    { skill: 'MySQL & Relational Data', key: 'mysql', proj: 'backops-wib', evidence: 'Designed relational schemas, compound indexes, and optimized query pipelines.' },
    { skill: 'Firebase & Push Notifications', key: 'firebase', proj: 'backops-wib', evidence: 'Engineered high-reliability FCM HTTP v1 notification pipelines with token normalization.' },
    { skill: 'Payment Gateways & Webhooks', key: 'payment', proj: 'backops-wib', evidence: 'Integrated PayMongo automated webhooks for GCash, Maya, and card transaction settlement.' },
    { skill: 'Geospatial & Mapping (GIS)', key: 'map', proj: 'backops-wib', evidence: 'Implemented Leaflet GIS polygon validation and Haversine distance mountain surcharges.' },
  ];

  for (const c of checks) {
    if (jdLower.includes(c.key)) {
      matched.push({ skill: c.skill, evidence: c.evidence, projectId: c.proj, confidence: 'production' });
    }
  }

  const transferableChecks = [
    { key: 'postgresql', skill: 'PostgreSQL', bridge: 'Relational data modeling, compound indexing, and SQL optimization from MySQL transfer directly.' },
    { key: 'next.js', skill: 'Next.js', bridge: 'Deep component lifecycle and React 19 / Vite SPA experience enable fast SSR/Next.js onboarding.' },
    { key: 'nextjs', skill: 'Next.js', bridge: 'Deep component lifecycle and React 19 / Vite SPA experience enable fast SSR/Next.js onboarding.' },
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

function generateLocalChatFallback(message, conversationHistory = []) {
  const m = (message || '').toLowerCase();

  // Inspect recent context for follow-up questions
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

function generateLocalExplainFallback(project, question) {
  return {
    answer: `### Architecture of ${project.name}\n\n**Core Stack**: ${(project.technologies || []).join(', ')}\n\n${project.summary}\n\n**Key Engineering Points**:\n${(project.evidencePoints || project.highlights || project.contributions || []).slice(0, 3).map((h) => `- ${h}`).join('\n')}`,
    relatedTopics: ['How does state management work?', 'What database optimizations were applied?'],
  };
}

