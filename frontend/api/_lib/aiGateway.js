/**
 * Multi-Provider AI Gateway
 * Primary: Azure OpenAI (gpt-4o-mini) — enterprise-grade, paid via student credits
 * Fallback: Google Gemini Flash — 100% free forever
 * Final: Local grounded heuristics — $0, 0 tokens
 *
 * Features:
 * - Automatic failover cascade
 * - IP-based sliding window rate limiting
 * - Input truncation & output token capping
 * - Fast-path greeting/off-topic detection
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// ── Rate Limiter (In-Memory Sliding Window) ────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX_REQUESTS = 10;

function isRateLimited(ip) {
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

// Clean up stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of rateLimitMap.entries()) {
    const active = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (active.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, active);
    }
  }
}, 10 * 60 * 1000);

// ── Fast-Path Detection (Greetings & Off-Topic) ───────────
const GREETING_PATTERNS = /^(hi|hello|hey|yo|sup|good\s*(morning|afternoon|evening)|what'?s?\s*up|howdy|greetings?)\b/i;
const OFF_TOPIC_PATTERNS = /\b(recipe|weather|joke|poem|song|story|movie|game|homework|essay|translate|capital of|president of|what is the meaning of life)\b/i;

function getGreetingResponse() {
  return {
    message: "Welcome! I'm **Maurik AI**, the portfolio copilot for Maurik Angelo Fernandez — a Software Developer specializing in Full-Stack Web, Mobile, and AI-Assisted Development.\n\nYou can ask me about his **projects**, **technical skills**, **work experience**, or paste a **Job Description** for an instant fit evaluation.",
    evidence: [],
    confidence: 'confirmed',
    actions: [{ type: 'SCROLL_TO', target: 'about' }],
    suggestedFollowUps: ['What projects has Maurik built?', 'Tell me about his mobile development experience', 'Show me his tech stack'],
  };
}

function getOffTopicResponse() {
  return {
    message: "I'm configured to answer questions specifically about **Maurik's software engineering experience, projects, and technical skills**. I can help you explore his production work, code architecture, or evaluate his fit for a role.",
    evidence: [],
    confidence: 'confirmed',
    actions: [],
    suggestedFollowUps: ['What is Maurik\'s tech stack?', 'Show me his projects', 'Tell me about his work experience'],
  };
}

/**
 * Detect if a message should be fast-pathed (no AI tokens consumed)
 * Returns a response object if fast-pathed, or null if it should go to AI
 */
export function detectFastPath(message) {
  const trimmed = (message || '').trim();

  // Very short messages (1-2 words) that are greetings
  if (trimmed.length <= 20 && GREETING_PATTERNS.test(trimmed)) {
    return getGreetingResponse();
  }

  // Off-topic questions
  if (OFF_TOPIC_PATTERNS.test(trimmed)) {
    return getOffTopicResponse();
  }

  return null;
}

// ── Input Sanitization ─────────────────────────────────────
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

// ── Azure OpenAI Provider ──────────────────────────────────
async function callAzureOpenAI({ systemPrompt, userPrompt, history = [] }) {
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
    max_tokens: 350,
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
      const errText = await response.text().catch(() => 'Unknown error');
      console.warn(`[Azure OpenAI] HTTP ${response.status}: ${errText}`);
      return null;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return null;

    return text;
  } catch (err) {
    console.warn('[Azure OpenAI] Error:', err.message);
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
      console.warn(`[Gemini] Model ${modelName}:`, err.message);
    }
  }

  return null;
}

// ── Main Gateway: Cascading Provider Calls ─────────────────
/**
 * Send a prompt through the multi-provider AI gateway.
 *
 * @param {Object} options
 * @param {string} options.systemPrompt - The system instruction
 * @param {string} options.userPrompt - The user message / prompt
 * @param {Array}  options.history - Conversation history [{role, content}]
 * @param {Function} options.parseResponse - Function to validate/parse the raw AI text
 * @param {Function} options.localFallback - Function returning a fallback response
 * @param {string} options.clientIp - The client IP for rate limiting
 * @returns {Object} { response, provider }
 */
export async function callAI({ systemPrompt, userPrompt, history = [], parseResponse, localFallback, clientIp }) {
  // Rate limiting check
  if (clientIp && isRateLimited(clientIp)) {
    console.warn(`[AI Gateway] Rate limited IP: ${clientIp}`);
    return {
      response: localFallback ? localFallback() : getOffTopicResponse(),
      provider: 'rate-limited',
    };
  }

  // 1. Try Azure OpenAI (Primary)
  const azureResult = await callAzureOpenAI({ systemPrompt, userPrompt, history });
  if (azureResult) {
    try {
      const cleaned = azureResult.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      const parsed = parseResponse ? parseResponse(cleaned) : JSON.parse(cleaned);
      if (parsed) return { response: parsed, provider: 'azure-openai' };
    } catch (err) {
      console.warn('[AI Gateway] Azure parse error:', err.message);
    }
  }

  // 2. Try Google Gemini (Fallback)
  const geminiResult = await callGemini({ systemPrompt, userPrompt, history });
  if (geminiResult) {
    try {
      const cleaned = geminiResult.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      const parsed = parseResponse ? parseResponse(cleaned) : JSON.parse(cleaned);
      if (parsed) return { response: parsed, provider: 'gemini' };
    } catch (err) {
      console.warn('[AI Gateway] Gemini parse error:', err.message);
    }
  }

  // 3. Local fallback
  return {
    response: localFallback ? localFallback() : { message: 'Service temporarily unavailable.' },
    provider: 'local-fallback',
  };
}

/**
 * Lightweight AI call for admin/internal use (no rate limiting, higher token budget)
 * Used for CV sync extraction where we need larger outputs
 */
export async function callAIAdmin({ systemPrompt, userPrompt, maxTokens = 2000 }) {
  // 1. Try Azure OpenAI with higher token budget
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview';

  if (apiKey && endpoint) {
    const isAzureInference = endpoint.includes('models.inference.ai.azure.com') || endpoint.includes('inference.ai.azure.com');
    const url = isAzureInference
      ? `${endpoint.replace(/\/$/, '')}/chat/completions`
      : `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const headers = {
      'Content-Type': 'application/json',
      ...(isAzureInference ? { Authorization: `Bearer ${apiKey}` } : { 'api-key': apiKey }),
    };

    const body = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
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

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    } catch (err) {
      console.warn('[AI Gateway Admin] Azure error:', err.message);
    }
  }

  // 2. Fall back to Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    const genAI = new GoogleGenerativeAI(geminiKey);
    for (const modelName of GEMINI_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
          generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
        });
        const result = await model.generateContent(userPrompt);
        const text = result.response.text().trim();
        if (text) return text;
      } catch (err) {
        console.warn(`[AI Gateway Admin] Gemini ${modelName}:`, err.message);
      }
    }
  }

  return null;
}
