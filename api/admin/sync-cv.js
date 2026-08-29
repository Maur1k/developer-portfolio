import { callAIAdmin } from '../_lib/aiGateway.js';
import { computeMergeDiff, extractStructuredCVFallback } from '../_lib/mergeEngine.js';

const CV_EXTRACTION_SYSTEM_PROMPT = `You are a precise technical document analyzer. Your task is to extract structured portfolio data from a resume/CV text.

Extract the information accurately into this EXACT JSON structure:
{
  "profile": {
    "name": "<full name>",
    "title": "<professional title>",
    "summary": "<summary or objective statement>",
    "location": "<location if present>",
    "email": "<email if present>",
    "phone": "<phone if present>"
  },
  "skills": {
    "languages": ["<programming languages e.g. PHP, JavaScript, Python, Dart, Java>"],
    "frontendAndMobile": ["<frontend & mobile tech e.g. React, React 19, Flutter, Vite, Tailwind CSS, TypeScript>"],
    "backend": ["<backend frameworks & runtimes e.g. Node.js, Express, Laravel, PHP, REST APIs>"],
    "databases": ["<databases e.g. MySQL, MongoDB, Firebase Firestore, PostgreSQL>"],
    "cloudAndAI": ["<cloud & AI tools e.g. Azure OpenAI, Google Gemini, Firebase, AWS, Docker>"],
    "aiAssistedDevelopment": ["<AI tools e.g. Cursor, Claude Code, GitHub Copilot, Codex, ChatGPT>"],
    "practices": ["<engineering practices e.g. Unit Testing, Code Review, Agile, API Design>"],
    "apisAndIntegrations": ["<third-party APIs e.g. PayMongo, FCM, Leaflet GIS, Google Maps API>"],
    "tools": ["<dev tools e.g. Git, GitHub, Postman, VS Code, Vite, cPanel>"]
  },
  "experience": [
    {
      "role": "<job title>",
      "company": "<company name>",
      "location": "<location>",
      "period": "<date range e.g. 2026 - Present>",
      "summary": "<short summary of role>",
      "highlights": ["<specific quantifiable achievements or responsibilities>"]
    }
  ],
  "projects": [
    {
      "name": "<project title>",
      "summary": "<project description>",
      "technologies": ["<technologies used>"],
      "achievements": ["<bullet points or evidence points>"]
    }
  ],
  "education": [
    {
      "degree": "<degree/program>",
      "school": "<institution>",
      "period": "<years e.g. 2022 - 2026>"
    }
  ],
  "certificates": [
    {
      "name": "<certificate or award title>",
      "issuer": "<issuing organization if present>",
      "year": "<year if present>"
    }
  ]
}

Return ONLY valid JSON (no markdown formatting, no commentary).`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { cvText, existingPortfolioData } = req.body || {};

    if (!cvText || typeof cvText !== 'string' || cvText.trim().length < 30) {
      return res.status(400).json({
        error: 'Please provide valid CV/resume text content (at least 30 characters).',
      });
    }

    const userPrompt = `Extract structured portfolio data from the following resume text:\n\n"""\n${cvText.slice(0, 15000)}\n"""`;

    // Extract structured JSON from CV text using Azure OpenAI / Gemini
    const aiOutput = await callAIAdmin({
      systemPrompt: CV_EXTRACTION_SYSTEM_PROMPT,
      userPrompt,
      maxTokens: 2500,
    });

    let cvData = null;
    if (aiOutput) {
      try {
        const cleaned = aiOutput.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
        cvData = JSON.parse(cleaned);
      } catch (err) {
        console.warn('[Serverless CV Sync] JSON parse error, falling back to heuristic parser');
      }
    }

    if (!cvData) {
      console.log('[Serverless CV Sync] Using heuristic parser fallback');
      cvData = extractStructuredCVFallback(cvText);
    }

    // Compute additive merge diff against existing portfolio data
    const portfolio = existingPortfolioData || {};
    const { diffs, summary } = computeMergeDiff(cvData, portfolio);

    return res.status(200).json({
      success: true,
      cvData,
      diffs,
      summary,
      provider: aiOutput ? 'ai-structured' : 'heuristic-fallback',
    });
  } catch (error) {
    console.error('[Admin CV Sync Error]:', error);
    try {
      const fallbackData = extractStructuredCVFallback(req.body?.cvText || '');
      const { diffs, summary } = computeMergeDiff(fallbackData, req.body?.existingPortfolioData || {});
      return res.status(200).json({
        success: true,
        cvData: fallbackData,
        diffs,
        summary,
        provider: 'resilient-fallback',
      });
    } catch (finalErr) {
      return res.status(500).json({ error: error.message || 'CV Sync processing failed.' });
    }
  }
}
