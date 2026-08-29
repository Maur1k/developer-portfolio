import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { computeMergeDiff } from '../../../api/_lib/mergeEngine.js';

const router = express.Router();

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

router.post('/sync', async (req, res) => {
  try {
    const { cvText, existingPortfolioData } = req.body || {};

    if (!cvText || typeof cvText !== 'string' || cvText.trim().length < 30) {
      return res.status(400).json({
        error: 'Please provide valid CV/resume text content (at least 30 characters).',
      });
    }

    const userPrompt = `Extract structured portfolio data from the following resume text:\n\n"""\n${cvText.slice(0, 15000)}\n"""`;

    let aiOutput = null;

    // 1. Try Azure OpenAI
    const apiKey = process.env.AZURE_OPENAI_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview';

    if (apiKey && endpoint) {
      const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
      try {
        const azureResp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: CV_EXTRACTION_SYSTEM_PROMPT },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.1,
            max_tokens: 2500,
            response_format: { type: 'json_object' },
          }),
        });
        if (azureResp.ok) {
          const data = await azureResp.json();
          aiOutput = data.choices?.[0]?.message?.content?.trim();
        }
      } catch (err) {
        console.warn('[CV Sync] Azure error:', err.message);
      }
    }

    // 2. Try Gemini
    if (!aiOutput && process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: CV_EXTRACTION_SYSTEM_PROMPT,
        generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
      });
      const result = await model.generateContent(userPrompt);
      aiOutput = result.response.text().trim();
    }

    if (!aiOutput) {
      return res.status(500).json({ error: 'AI processing failed. Please verify API keys.' });
    }

    const cleaned = aiOutput.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    const cvData = JSON.parse(cleaned);

    const portfolio = existingPortfolioData || {};
    const { diffs, summary } = computeMergeDiff(cvData, portfolio);

    return res.json({
      success: true,
      cvData,
      diffs,
      summary,
    });
  } catch (error) {
    console.error('CV Sync Route Error:', error);
    return res.status(500).json({ error: error.message || 'CV Sync processing failed.' });
  }
});

export default router;
