import { GoogleGenerativeAI } from '@google/generative-ai';
import { callAI, sanitizeInput } from '../_lib/aiGateway.js';

const projects = {
  'backops-wib': {
    name: 'When in Baguio — Operations & Dispatch Platform',
    stack: 'React 19, Vite, Node.js, Express, MySQL, Firebase Cloud Messaging (FCM HTTP v1), PayMongo, Leaflet GIS, Tailwind CSS',
    details: 'React 19 SPA with Vite. Backend in Node.js/Express with zero-downtime refactored REST APIs. MySQL database with compound indexing, keyset pagination, and LRU in-memory caching. Dual-target FCM HTTP v1 push notification pipeline with token normalization. PayMongo automated webhook reconciliation.',
  },
  'wibav3': {
    name: 'When in Baguio Eats — Customer Mobile App',
    stack: 'Flutter, Dart, Provider, Google Maps, Leaflet GIS, FCM, PayMongo (GCash), REST APIs, iOS, Android',
    details: 'Cross-platform Flutter app for 60,000+ users. Provider state management with persistent cart caching (40% faster checkout). Custom ApiService singleton with retry logic. Point-in-polygon GIS delivery validation and PayMongo GCash QR code generation.',
  },
  'click2serve': {
    name: 'CLICK2SERVE: Smart Municipal Information Kiosk',
    stack: 'Laravel, PHP, JavaScript, MySQL, Tailwind CSS, 3D Floor Maps, AI Assistant',
    details: 'Civic kiosk interface with Laravel backend, Eloquent ORM, MySQL queue ticket tracking, and interactive 3D department floor maps.',
  },
  'client-project-tracker': {
    name: 'ProjeX — Client Project Management',
    stack: 'Laravel 12, PHP, MySQL, React, TypeScript, Vite, Tailwind CSS v4',
    details: 'Decoupled Laravel 12 REST API with form request validation. Type-safe React + TypeScript frontend with real-time validation and status badge tracking.',
  },
};

const EXPLAIN_SYSTEM_PROMPT = `You are Maurik AI, a technical portfolio copilot. Explain project architectures accurately based ONLY on verified project specifications. Use Markdown formatting with bullet points and bold highlights. No emojis. Be concise and engineering-grade.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { projectId, question } = req.body || {};
  const project = projects[projectId] || projects['backops-wib'];
  const sanitizedQuestion = sanitizeInput(question || 'Explain the architecture', 500);

  const prompt = `The visitor is inspecting "${project.name}" and asked: "${sanitizedQuestion}"

Project Specs:
- Stack: ${project.stack}
- Engineering Details: ${project.details}

Explain the architecture accurately in Markdown (bullet points, bold highlights, no emojis).
Return ONLY JSON:
{
  "answer": "<Deep architectural explanation in Markdown>",
  "relatedTopics": ["<2-3 technical deep-dive questions>"]
}`;

  const localFallbackResponse = {
    answer: `### Architecture of ${project.name}\n\n**Core Stack**: ${project.stack}\n\n${project.details}`,
    relatedTopics: ['How does state management work?', 'What database optimizations were applied?'],
  };

  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                   req.headers['x-real-ip'] ||
                   req.socket?.remoteAddress || 'unknown';

  // Multi-provider AI Gateway: Azure OpenAI → Gemini → Local fallback
  const { response, provider } = await callAI({
    systemPrompt: EXPLAIN_SYSTEM_PROMPT,
    userPrompt: prompt,
    history: [],
    parseResponse: (text) => {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed.answer === 'string') return parsed;
      return null;
    },
    localFallback: () => localFallbackResponse,
    clientIp,
  });

  console.log(`[Copilot Explain] Provider: ${provider}`);
  return res.status(200).json(response);
}
