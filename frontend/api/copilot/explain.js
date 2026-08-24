import { GoogleGenerativeAI } from '@google/generative-ai';

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

const FREE_TIER_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { projectId, question } = req.body || {};
  const project = projects[projectId] || projects['backops-wib'];

  const prompt = `The visitor is inspecting "${project.name}" and asked: "${question || 'Explain the architecture'}"

Project Specs:
- Stack: ${project.stack}
- Engineering Details: ${project.details}

Explain the architecture accurately in Markdown (bullet points, bold highlights, no emojis).
Return ONLY JSON:
{
  "answer": "<Deep architectural explanation in Markdown>",
  "relatedTopics": ["<2-3 technical deep-dive questions>"]
}`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    for (const modelName of FREE_TIER_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        });
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed && typeof parsed.answer === 'string') {
          return res.status(200).json(parsed);
        }
      } catch (err) {
        console.warn(`[Gemini Serverless Explain] Model ${modelName}:`, err.message);
      }
    }
  }

  return res.status(200).json({
    answer: `### Architecture of ${project.name}\n\n**Core Stack**: ${project.stack}\n\n${project.details}`,
    relatedTopics: ['How does state management work?', 'What database optimizations were applied?'],
  });
}
