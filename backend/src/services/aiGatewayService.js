import { GoogleGenerativeAI } from '@google/generative-ai';
import { portfolioKnowledge } from '../data/portfolioKnowledge.js';

const SYSTEM_PROMPT = `You are Maurik AI, the portfolio copilot and technical representative for Maurik Angelo L. Fernandez — a Software Developer specializing in Full-Stack Web and Mobile Development, and an AI-augmented developer proficient in AI-assisted & agentic workflows.

Your purpose is to help recruiters, hiring managers, and engineers evaluate Maurik's qualifications, explore his projects, inspect his code architecture, and verify his hands-on experience.

## CORE PERSONA & COMMUNICATION RULES
- Professional, direct, articulate, and evidence-driven.
- Confident but honest. Avoid empty marketing buzzwords and fake enthusiasm.
- Do NOT use emojis anywhere in your messages or actions. Keep text clean and terminal/engineering-grade.
- Format messages using Markdown (bullet points, bold highlights, concise inline code where relevant).
- Be concise by default (2-4 punchy paragraphs or structured bullet points).

## EVIDENCE-FIRST ACCURACY RULES
1. CONFIRMED EXPERIENCE: Only claim production experience for technologies documented in the PORTFOLIO DATA. Always cite the specific project name, metric, or technical responsibility.
2. TRANSFERABLE EXPERIENCE: If asked about adjacent technologies (e.g. PostgreSQL, Next.js, React Native, Docker, Stripe, LangChain), explicitly state: "This is not explicitly documented in Maurik's production work, but his strong background in [related tech] provides a fast learning curve."
3. MISSING / UNDOCUMENTED EXPERIENCE: If asked about technologies Maurik has NOT used (e.g. Kubernetes, AWS, GraphQL, Go, Java Spring Boot, Rust), clearly state: "Maurik does not have documented experience with this technology in his portfolio." Never invent companies, certifications, or projects.
4. ACTION DISPATCH: You can recommend UI actions using the allowed types:
   - OPEN_PROJECT: target MUST be one of ["backops-wib", "wibav3", "click2serve", "client-project-tracker"]
   - SCROLL_TO: target MUST be one of ["about", "experience", "projects", "skills", "contact"]
   - HIGHLIGHT_SKILLS: target is "skills", highlightTags is an array of technology strings
   - OPEN_RESUME: target is "resume"

## PORTFOLIO DATA
${JSON.stringify(portfolioKnowledge, null, 2)}
`;

// ── Rate Limiter (In-Memory Sliding Window) ────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;

export function isRateLimited(ip) {
  const now = Date.now();
  const key = ip || 'unknown';

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, []);
  }

  const timestamps = rateLimitMap.get(key).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  rateLimitMap.set(key, timestamps);

  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  timestamps.push(now);
  return false;
}

// ── Fast Path Detection ──────────────────────────────────
const GREETING_PATTERNS = /^(hi|hello|hey|yo|sup|good\s*(morning|afternoon|evening)|what'?s?\s*up|howdy|greetings?)\b/i;
const OFF_TOPIC_PATTERNS = /\b(recipe|weather|joke|poem|song|story|movie|game|homework|essay|translate|capital of|president of|what is the meaning of life)\b/i;

export function sanitizeInput(message, maxLength = 500) {
  return (message || '').trim().slice(0, maxLength);
}

export function sanitizeHistory(history, maxTurns = 4, maxContentLength = 1000) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((item) => item && typeof item.content === 'string' && (item.role === 'user' || item.role === 'assistant'))
    .slice(-maxTurns)
    .map((item) => ({
      role: item.role,
      content: String(item.content).slice(0, maxContentLength),
    }));
}

export function detectFastPath(message) {
  const trimmed = (message || '').trim();
  if (trimmed.length <= 20 && GREETING_PATTERNS.test(trimmed)) {
    return {
      message: "Welcome! I'm **Maurik AI**, the portfolio copilot for Maurik Angelo Fernandez — a Software Developer specializing in Full-Stack Web, Mobile, and AI-Assisted Development.\n\nYou can ask me about his **projects**, **technical skills**, **work experience**, or paste a **Job Description** for an instant fit evaluation.",
      evidence: [],
      confidence: 'confirmed',
      actions: [{ type: 'SCROLL_TO', target: 'about' }],
      suggestedFollowUps: ['What projects has Maurik built?', 'Tell me about his mobile development experience', 'Show me his tech stack'],
    };
  }
  if (OFF_TOPIC_PATTERNS.test(trimmed)) {
    return {
      message: "I'm configured to answer questions specifically about **Maurik's software engineering experience, projects, and technical skills**. I can help you explore his production work, code architecture, or evaluate his fit for a role.",
      evidence: [],
      confidence: 'confirmed',
      actions: [],
      suggestedFollowUps: ['What is Maurik\'s tech stack?', 'Show me his projects', 'Tell me about his work experience'],
    };
  }
  return null;
}

// ── Azure OpenAI Provider ──────────────────────────────────
async function callAzureOpenAI({ systemPrompt, userPrompt, history = [], maxTokens = 350 }) {
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview';

  if (!apiKey || !endpoint) return null;

  const isAzureInference = endpoint.includes('models.inference.ai.azure.com') || endpoint.includes('inference.ai.azure.com');
  const url = isAzureInference
    ? `${endpoint.replace(/\/$/, '')}/chat/completions`
    : `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((h) => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content,
    })),
    { role: 'user', content: userPrompt },
  ];

  const headers = {
    'Content-Type': 'application/json',
    ...(isAzureInference ? { Authorization: `Bearer ${apiKey}` } : { 'api-key': apiKey }),
  };

  const body = {
    messages,
    temperature: 0.2,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
    ...(isAzureInference ? { model: deployment } : {}),
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.warn(`[Backend Azure OpenAI] HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.warn('[Backend Azure OpenAI] Error:', err.message);
    return null;
  }
}

// ── Google Gemini Provider ─────────────────────────────────
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

function formatGeminiHistory(history = []) {
  if (!Array.isArray(history) || history.length === 0) return [];
  const formatted = [];
  for (const item of history) {
    if (!item || !item.content) continue;
    const role = item.role === 'assistant' || item.role === 'model' ? 'model' : 'user';
    const text = typeof item.content === 'string' ? item.content : JSON.stringify(item.content);
    if (formatted.length > 0 && formatted[formatted.length - 1].role === role) {
      formatted[formatted.length - 1].parts[0].text += `\n\n${text}`;
    } else {
      formatted.push({ role, parts: [{ text }] });
    }
  }
  while (formatted.length > 0 && formatted[0].role !== 'user') {
    formatted.shift();
  }
  return formatted;
}

async function callGemini({ systemPrompt, userPrompt, history = [] }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const formattedHistory = formatGeminiHistory(history);

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      });

      let text = '';
      if (formattedHistory.length > 0) {
        const chat = model.startChat({ history: formattedHistory });
        const result = await chat.sendMessage(userPrompt);
        text = result.response.text().trim();
      } else {
        const result = await model.generateContent(userPrompt);
        text = result.response.text().trim();
      }

      if (text) return text;
    } catch (err) {
      console.warn(`[Backend Gemini] Model ${modelName}:`, err.message);
    }
  }

  return null;
}

// ── Match Job Description ──────────────────────────────────
export async function matchJobDescription(jobDescription, clientIp) {
  if (clientIp && isRateLimited(clientIp)) {
    return generateLocalMatchFallback(jobDescription);
  }

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
      "bridge": "<how Maurik's verified skills bridge this, e.g. MySQL -> PostgreSQL, PayMongo -> Stripe, AI-Assisted Workflows -> LangChain>"
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

  // 1. Try Azure OpenAI
  const azureRes = await callAzureOpenAI({ systemPrompt: SYSTEM_PROMPT, userPrompt: prompt, maxTokens: 800 });
  if (azureRes) {
    try {
      const cleaned = azureRes.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed.matchScore === 'number') return parsed;
    } catch (e) { /* fallback */ }
  }

  // 2. Try Gemini
  const geminiRes = await callGemini({ systemPrompt: SYSTEM_PROMPT, userPrompt: prompt });
  if (geminiRes) {
    try {
      const cleaned = geminiRes.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed.matchScore === 'number') return parsed;
    } catch (e) { /* fallback */ }
  }

  // 3. Fallback
  return generateLocalMatchFallback(jobDescription);
}

// ── Multi-Turn Chat Copilot ────────────────────────────────
export async function chatCopilot(message, conversationHistory = [], clientIp) {
  // Fast path greetings / off topic
  const fast = detectFastPath(message);
  if (fast) return fast;

  if (clientIp && isRateLimited(clientIp)) {
    return generateLocalChatFallback(message, conversationHistory);
  }

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

  // 1. Try Azure OpenAI
  const azureRes = await callAzureOpenAI({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: prompt,
    history: conversationHistory,
    maxTokens: 350,
  });
  if (azureRes) {
    try {
      const cleaned = azureRes.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
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
    } catch (e) { /* fallback */ }
  }

  // 2. Try Gemini
  const geminiRes = await callGemini({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: prompt,
    history: conversationHistory,
  });
  if (geminiRes) {
    try {
      const cleaned = geminiRes.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
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
    } catch (e) { /* fallback */ }
  }

  // 3. Fallback
  return generateLocalChatFallback(message, conversationHistory);
}

// ── Explain Architecture ───────────────────────────────────
export async function explainArchitecture(projectId, question, clientIp) {
  const project = portfolioKnowledge.projects.find((p) => p.id === projectId) || portfolioKnowledge.projects[0];

  if (clientIp && isRateLimited(clientIp)) {
    return generateLocalExplainFallback(project, question);
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

  const azureRes = await callAzureOpenAI({ systemPrompt: SYSTEM_PROMPT, userPrompt: prompt, maxTokens: 450 });
  if (azureRes) {
    try {
      const cleaned = azureRes.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed.answer === 'string') return parsed;
    } catch (e) { /* fallback */ }
  }

  const geminiRes = await callGemini({ systemPrompt: SYSTEM_PROMPT, userPrompt: prompt });
  if (geminiRes) {
    try {
      const cleaned = geminiRes.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed.answer === 'string') return parsed;
    } catch (e) { /* fallback */ }
  }

  return generateLocalExplainFallback(project, question);
}

// ── Grounded Local Fallback Engine ─────────────────────────
function generateLocalMatchFallback(jd) {
  const jdLower = (jd || '').toLowerCase();
  const matched = [];
  const transferable = [];
  const gaps = [];

  const checks = [
    { skill: 'AI-Assisted & Agentic Workflows', key: 'ai', proj: 'backops-wib', evidence: 'AI-augmented software developer integrating Cursor, Claude Code, GitHub Copilot, OpenAI Codex, ChatGPT, and Gemini for accelerated technical research, implementation, and architectural validation.' },
    { skill: 'Azure OpenAI & Multi-Cloud AI', key: 'azure', proj: 'backops-wib', evidence: 'Engineered multi-provider AI gateway using Azure OpenAI (gpt-4o-mini) and Gemini with token governance and automated fallback.' },
    { skill: 'React / React 19', key: 'react', proj: 'backops-wib', evidence: 'Architected V2 Operations Dashboard with React 19, Vite, and live dispatch board.' },
    { skill: 'Flutter & Mobile Development', key: 'flutter', proj: 'wibav3', evidence: 'Re-architected When in Baguio Eats customer app for 60,000+ users with 99.2% crash-free rate.' },
    { skill: 'Node.js & Express REST APIs', key: 'node', proj: 'backops-wib', evidence: 'Modernized backend REST endpoints with LRU caching, keyset pagination, and sub-100ms loads.' },
    { skill: 'Laravel & PHP Backend', key: 'laravel', proj: 'client-project-tracker', evidence: 'Built decoupled REST API backend with form request validation and Eloquent ORM.' },
    { skill: 'MySQL & Relational Data', key: 'mysql', proj: 'backops-wib', evidence: 'Designed relational schemas, compound indexes, and optimized query pipelines.' },
    { skill: 'MongoDB & Document Databases', key: 'mongo', proj: 'client-project-tracker', evidence: 'Proficient in document database schema design, querying, and integration.' },
    { skill: 'Python Programming', key: 'python', proj: 'backops-wib', evidence: 'Core language proficiency in Python for scripting, rapid prototyping, and backend integrations.' },
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
    { key: 'langchain', skill: 'LangChain / AI Agent Frameworks', bridge: 'Deep daily experience with AI-assisted and agentic development (Cursor, Claude Code, OpenAI Codex, Copilot) combined with Python and Node.js REST API engineering enables rapid adoption of LangChain and agentic orchestration.' },
    { key: 'llama', skill: 'LlamaIndex / RAG Pipelines', bridge: 'Strong understanding of prompt engineering, context window management, and structured JSON output from LLM integrations.' },
    { key: 'postgresql', skill: 'PostgreSQL', bridge: 'Relational data modeling, compound indexing, and SQL optimization from MySQL transfer directly.' },
    { key: 'next.js', skill: 'Next.js', bridge: 'Deep component lifecycle and React 19 / Vite SPA experience enable fast SSR/Next.js onboarding.' },
    { key: 'stripe', skill: 'Stripe', bridge: 'PayMongo webhook handling, tokenization, and QR workflows directly map to Stripe integration patterns.' },
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
    { key: 'golang', name: 'Go' },
    { key: 'rust', name: 'Rust' },
  ];

  for (const g of gapChecks) {
    if (jdLower.includes(g.key)) {
      gaps.push({ skill: g.name, assessment: `Maurik has not used ${g.name} in active production systems.` });
    }
  }

  const matchScore = Math.min(96, Math.max(60, 50 + matched.length * 10 + transferable.length * 4 - gaps.length * 5));

  return {
    matchScore,
    headline: `Strong match across ${matched.map((m) => m.skill).join(', ') || 'full-stack web, mobile, and AI engineering'}.`,
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

  if (m.includes('azure') || m.includes('cloud') || m.includes('ai') || m.includes('cursor') || m.includes('copilot') || m.includes('agent')) {
    return {
      message: 'Maurik is an **AI-augmented software developer** who integrates AI-assisted and agentic workflows into daily production engineering:\n\n- **Azure AI & Multi-Cloud Gateway**: Built resilient multi-provider AI gateway using **Azure OpenAI (`gpt-4o-mini`)** and Google Gemini with token governance and circuit breaker fallback.\n- **AI Tooling Mastery**: Daily use of **Cursor, Claude Code, GitHub Copilot, OpenAI Codex, ChatGPT, and Gemini** for rapid implementation and technical research.\n- **Agentic Workflows**: Leverages AI agents to accelerate debugging and code reviews while maintaining **complete ownership of technical decisions and code quality**.',
      evidence: [
        { projectId: 'backops-wib', projectName: 'When in Baguio Operations', highlight: 'Rapid full-stack delivery with AI-assisted workflows & Node.js/React 19' },
        { projectId: 'wibav3', projectName: 'When in Baguio Eats', highlight: 'Accelerated Flutter debugging & push notification pipeline architecture' },
      ],
      confidence: 'confirmed',
      actions: [
        { type: 'HIGHLIGHT_SKILLS', target: 'skills', highlightTags: ['Cursor', 'Claude Code', 'GitHub Copilot', 'Azure OpenAI'] },
      ],
      suggestedFollowUps: ['Tell me about the Azure AI gateway', 'What is his core tech stack?', 'Show me the Flutter mobile app'],
    };
  }

  return {
    message: 'Maurik is a **Software Developer** specializing in Full-Stack Web and Mobile engineering with verified production experience across **React 19, Node.js, Flutter, Laravel, MySQL, and Azure AI**.\n\nYou can ask about his specific projects, technical architecture, or paste a Job Description in the Recruiter Match tab for a comprehensive fit evaluation.',
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
