import { GoogleGenerativeAI } from '@google/generative-ai';
import { portfolioKnowledge } from '../data/portfolioKnowledge.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are Maurik AI, the portfolio copilot for Maurik Angelo L. Fernandez — a Software Developer specializing in Full-Stack Web and Mobile Development.

You serve as an intelligent assistant that helps recruiters, hiring managers, and visitors evaluate Maurik's qualifications, explore his projects, and understand his technical capabilities.

## CRITICAL RULES — ANTI-HALLUCINATION
1. You ONLY know what is provided in the PORTFOLIO DATA below. Never invent projects, technologies, companies, or experiences.
2. If asked about technologies Maurik has NOT used in production (listed in boundaries.notUsedInProduction), clearly state: "This technology was not part of Maurik's production work." Then optionally explain how his existing skills transfer.
3. Never claim Maurik has production experience with something not listed in his projects or skills.
4. Be honest about skill gaps. Honesty is more impressive than bluffing.
5. When citing evidence, always reference specific project names and contributions.

## PORTFOLIO DATA
${JSON.stringify(portfolioKnowledge, null, 2)}

## RESPONSE STYLE
- Be professional, concise, and evidence-based.
- When answering questions, always cite specific projects, contributions, and results.
- Use structured formatting (not excessive markdown) for clarity.
- Sound confident about verified skills, honest about gaps, and thoughtful about transferability.`;

function getModel() {
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT,
  });
}

// ── Match Job Description ──────────────────────────────────
export async function matchJobDescription(jobDescription) {
  const model = getModel();

  const prompt = `A recruiter has submitted the following Job Description. Analyze it against Maurik's portfolio and return a structured JSON evaluation.

JOB DESCRIPTION:
"""${jobDescription}"""

Return ONLY valid JSON (no markdown fences, no commentary) in this exact format:
{
  "matchScore": <number 0-100>,
  "headline": "<1-sentence summary of fit>",
  "strongMatches": [
    {
      "skill": "<technology or skill>",
      "evidence": "<specific project or contribution proving this>",
      "projectId": "<id of the project for evidence linking>",
      "confidence": "production" | "academic" | "familiar"
    }
  ],
  "gaps": [
    {
      "skill": "<required skill Maurik lacks>",
      "assessment": "<honest evaluation of the gap>",
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
  "transferability": "<2-3 sentence summary of how Maurik's existing stack bridges any gaps>",
  "recommendation": "<2-3 sentence professional recommendation>"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  
  // Strip markdown fences if present
  const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  return JSON.parse(cleaned);
}

// ── Chat Copilot (Natural Language + UI Actions) ───────────
export async function chatCopilot(message, conversationHistory = []) {
  const model = getModel();

  const prompt = `The visitor asked: "${message}"

Respond with ONLY valid JSON (no markdown fences) in this exact format:
{
  "message": "<your natural language response, citing specific evidence from the portfolio>",
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
- You can include multiple actions (e.g. scroll to projects AND open a specific project).
- Only include actions when they genuinely help answer the question. Don't force actions for every response.
- If the visitor asks something conversational or off-topic, respond politely and explain you can help with portfolio-related questions.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  return JSON.parse(cleaned);
}

// ── Explain Architecture (Project-Specific) ────────────────
export async function explainArchitecture(projectId, question) {
  const model = getModel();
  const project = portfolioKnowledge.projects.find(p => p.id === projectId);

  if (!project) {
    return {
      answer: `I don't have detailed information about a project with ID "${projectId}". Available projects are: ${portfolioKnowledge.projects.map(p => p.name).join(', ')}.`,
      relatedTopics: [],
    };
  }

  const prompt = `The visitor is looking at the project "${project.name}" and asked:
"${question}"

Project details:
${JSON.stringify(project, null, 2)}

Respond with ONLY valid JSON (no markdown fences) in this format:
{
  "answer": "<detailed, grounded answer about this specific project. Only reference technologies and architecture that are actually documented. If asked about something not used in this project, clearly state it was not part of the architecture and optionally discuss how it could fit.>",
  "relatedTopics": ["<2-3 related architectural questions the visitor might want to explore>"]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  return JSON.parse(cleaned);
}
