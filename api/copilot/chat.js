import { GoogleGenerativeAI } from '@google/generative-ai';

const portfolioKnowledge = {
  profile: {
    name: 'Maurik Angelo L. Fernandez',
    title: 'Software Developer',
    subtitle: 'Full Stack · Web · Mobile',
    location: 'Urdaneta City, Pangasinan, Philippines',
    education: 'BS Information Technology, Major in Web and Mobile Technologies — Pangasinan State University, Urdaneta Campus (Graduated July 2026)',
    availability: 'Open to Opportunities',
    contact: {
      email: 'maurikfernandez123@gmail.com',
      phone: '+63 927 797 5100',
    },
    coreSummary: 'Full-stack software developer with production engineering experience building high-performance web dashboards in React 19 and Node.js, cross-platform mobile apps in Flutter serving 60,000+ users, and decoupled REST APIs with Laravel and MySQL.',
  },
  skills: {
    frontend: ['React', 'React 19', 'JavaScript (ES6+)', 'TypeScript', 'Vite', 'Tailwind CSS', 'Framer Motion'],
    mobile: ['Flutter', 'Dart', 'Android (Google Play)', 'iOS (App Store)', 'Provider State Management'],
    backend: ['Node.js', 'Express', 'Laravel', 'PHP', 'REST APIs', 'Middleware Design'],
    database: ['MySQL', 'Relational Schema Design', 'Compound Indexing', 'Keyset Pagination', 'LRU Caching', 'Firebase Firestore'],
    apisAndIntegrations: ['REST APIs', 'PayMongo (GCash, Maya, Cards)', 'Firebase Cloud Messaging (FCM HTTP v1)', 'Leaflet GIS', 'Google Maps API'],
    toolsAndDevOps: ['Git', 'GitHub', 'Vite', 'Postman', 'VS Code', 'Gemini'],
  },
  projects: [
    {
      id: 'backops-wib',
      name: 'When in Baguio — Operations & Dispatch Platform',
      type: 'Production',
      summary: 'The mission-critical operations command center behind Baguio City delivery network — engineered with React 19, Node.js, and MySQL to give dispatchers real-time order tracking, sub-100ms loading speeds, instant push notifications, and exact financial settlements.',
      technologies: ['React 19', 'Vite', 'Node.js', 'Express', 'MySQL', 'Firebase Cloud Messaging (FCM)', 'PayMongo', 'Leaflet GIS', 'Tailwind CSS'],
      evidencePoints: [
        'Sub-100ms dashboard queries via keyset pagination & LRU caching.',
        'High-reliability FCM HTTP v1 push pipeline with token normalization — zero dropped notifications.',
        'Interactive geospatial delivery zone polygon mapping and mountain route surcharge calculations using Leaflet GIS.',
        'Instant PayMongo webhook reconciliation for GCash, Maya, and credit/debit card transactions.',
      ],
    },
    {
      id: 'wibav3',
      name: 'When in Baguio Eats — Customer Mobile App',
      type: 'Production',
      summary: 'A major V2 upgrade of Baguio City customer food ordering app — re-architected in Flutter for 60,000+ existing users with persistent cart state, Google Maps/Leaflet GIS restaurant discovery, instant GCash payments, and 99.2% crash-free stability.',
      technologies: ['Flutter', 'Dart', 'Provider', 'Google Maps', 'Leaflet GIS', 'Firebase Cloud Messaging (FCM)', 'PayMongo (GCash)', 'REST APIs', 'iOS', 'Android'],
      evidencePoints: [
        'Engineered in Flutter & Dart, deployed to 60,000+ users across Google Play and Apple App Store.',
        'Maintains a 99.2% crash-free session rate across diverse Android and iOS hardware.',
        'Offline-first Provider cart persistence reducing checkout latency by 40%.',
        'Seamless GCash QR and PayMongo payment integration with automatic payment reconciliation.',
      ],
    },
    {
      id: 'click2serve',
      name: 'CLICK2SERVE: Smart Municipal Information Kiosk',
      type: 'Completed (Academic/Civic Capstone)',
      summary: 'An AI-assisted touchscreen kiosk and companion web portal deployed in city hall lobbies to help citizens discover municipal services, navigate building departments in 3D, ask questions to an AI assistant, and track queue tickets in real time.',
      technologies: ['Laravel', 'PHP', 'JavaScript', 'MySQL', 'Tailwind CSS', '3D Floor Maps', 'AI Assistant', 'REST API'],
      evidencePoints: [
        'High-contrast accessible touchscreen UI for citizen self-service in city hall lobbies.',
        'Interactive 3D building floor plan guiding visitors floor-by-floor to municipal service windows.',
        'AI-powered municipal assistant answering citizen inquiries in English and Tagalog 24/7.',
        'Real-time queue ticket tracking and officer dispatch management in Laravel and MySQL.',
      ],
    },
    {
      id: 'client-project-tracker',
      name: 'ProjeX — Client Project Management',
      type: 'Technical Assessment / SaaS Project',
      summary: 'A full-stack client project management application built with Laravel 12, React + TypeScript, and MySQL — featuring a clean SaaS-style dashboard with real-time validation, status and priority badges, and full error/loading state handling.',
      technologies: ['Laravel 12', 'PHP', 'MySQL', 'React', 'TypeScript', 'Vite', 'Axios', 'Tailwind CSS v4', 'REST API'],
      evidencePoints: [
        'Decoupled Laravel 12 REST API with strict form request validation and Eloquent ORM.',
        'Type-safe React + TypeScript frontend with real-time validation and state management.',
        'Status and priority badge system with comprehensive CRUD capabilities.',
      ],
    },
  ],
  boundaries: {
    confirmedProduction: [
      'React', 'React 19', 'JavaScript', 'TypeScript', 'Flutter', 'Dart', 'Node.js', 'Express',
      'Laravel', 'PHP', 'MySQL', 'Firebase (FCM, Firestore)', 'PayMongo (GCash, Cards)',
      'Leaflet GIS', 'Google Maps API', 'REST APIs', 'Vite', 'Tailwind CSS', 'Git'
    ],
    notUsedInProduction: [
      'PostgreSQL', 'MongoDB', 'Redis', 'Kubernetes', 'Docker', 'AWS', 'Azure', 'GCP',
      'GraphQL', 'Next.js', 'Vue.js', 'Angular', 'Django', 'Python', 'Go', 'Rust',
      'Java', 'Spring Boot', 'Microservices architecture', 'CI/CD pipelines', 'Terraform', 'Kafka', 'Stripe'
    ],
  },
};

const SYSTEM_PROMPT = `You are Maurik AI, the portfolio copilot and technical representative for Maurik Angelo L. Fernandez — a Software Developer specializing in Full-Stack Web and Mobile Development.

Your purpose is to help recruiters, hiring managers, and engineers evaluate Maurik's qualifications, explore his projects, inspect his code architecture, and verify his hands-on experience.

## CORE PERSONA & COMMUNICATION RULES
- Professional, direct, articulate, and evidence-driven.
- Confident but honest. Avoid empty marketing buzzwords and fake enthusiasm (do NOT say "Awesome question!", "Sure thing!", etc.).
- Do NOT use emojis anywhere in your messages or actions. Keep text clean and engineering-grade.
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

const FREE_TIER_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, history } = req.body || {};
  if (!message || typeof message !== 'string' || message.trim().length < 1) {
    return res.status(400).json({ error: 'Please provide a valid message.' });
  }

  const sanitizedHistory = Array.isArray(history)
    ? history
        .filter((item) => item && typeof item.content === 'string' && (item.role === 'user' || item.role === 'assistant'))
        .slice(-14)
        .map((item) => ({ role: item.role, content: String(item.content).slice(0, 1500) }))
    : [];

  const prompt = `Visitor message: "${message.trim().slice(0, 1000)}"

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
      "target": "<allowed target>",
      "highlightTags": ["<optional skill names>"]
    }
  ],
  "suggestedFollowUps": ["<2-3 relevant follow-up questions>"]
}`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const formattedHistory = formatGeminiHistory(sanitizedHistory);

    for (const modelName of FREE_TIER_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_PROMPT,
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        });

        let text = '';
        if (formattedHistory.length > 0) {
          const chat = model.startChat({ history: formattedHistory });
          const result = await chat.sendMessage(prompt);
          text = result.response.text().trim();
        } else {
          const result = await model.generateContent(prompt);
          text = result.response.text().trim();
        }

        const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed && typeof parsed.message === 'string') {
          return res.status(200).json({
            message: parsed.message,
            evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [],
            confidence: parsed.confidence || 'confirmed',
            actions: Array.isArray(parsed.actions) ? parsed.actions : [],
            suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps) ? parsed.suggestedFollowUps : [],
          });
        }
      } catch (err) {
        console.warn(`[Gemini Serverless Chat] Model ${modelName}:`, err.message);
      }
    }
  }

  // Local fallback if API key is not configured or limits hit
  return res.status(200).json(localFallback(message));
}

function localFallback(message) {
  const m = (message || '').toLowerCase();
  if (m.includes('payment') || m.includes('paymongo') || m.includes('gcash') || m.includes('gateway')) {
    return {
      message: 'Maurik has verified production experience integrating **PayMongo** for end-to-end payment workflows:\n\n- **When in Baguio Eats (Flutter)**: Integrated secure **GCash QR generation** and automated in-app checkout reconciliation.\n- **Operations Dashboard (Node.js/React 19)**: Built automated **webhook listeners** for instant GCash, Maya, and credit/debit card transaction verification.',
      evidence: [
        { projectId: 'backops-wib', projectName: 'When in Baguio Operations', highlight: 'PayMongo automated webhooks for GCash, Maya & Cards' },
        { projectId: 'wibav3', projectName: 'When in Baguio Eats', highlight: 'Flutter GCash QR checkout and payment flow' },
      ],
      confidence: 'confirmed',
      actions: [{ type: 'OPEN_PROJECT', target: 'backops-wib' }],
      suggestedFollowUps: ['How were payment webhooks handled?', 'Tell me about the backend architecture'],
    };
  }
  if (m.includes('mobile') || m.includes('flutter') || m.includes('ios') || m.includes('android')) {
    return {
      message: 'Maurik has verified **production mobile experience** re-architecting the **When in Baguio Eats** customer application in **Flutter & Dart**.\n\n- **60,000+ Active Users** on Google Play and App Store.\n- **99.2% Crash-Free Rate** across iOS and Android.\n- **Provider State Management** with persistent cart caching for 40% faster checkout.\n- **Integrations**: Google Maps, FCM push notifications, and PayMongo GCash payments.',
      evidence: [{ projectId: 'wibav3', projectName: 'When in Baguio Eats', highlight: 'Flutter mobile app for 60,000+ users across iOS & Android' }],
      confidence: 'confirmed',
      actions: [{ type: 'OPEN_PROJECT', target: 'wibav3' }],
      suggestedFollowUps: ['How was state management architected?', 'What payment gateways were integrated?'],
    };
  }
  return {
    message: 'Maurik is a **Software Developer** specializing in Full-Stack Web and Mobile engineering with verified production experience across **React 19, Node.js, Flutter, Laravel, MySQL, and Firebase**.\n\nYou can ask about his specific projects, technical architecture, or paste a Job Description in the Recruiter Match tab.',
    evidence: [
      { projectId: 'backops-wib', projectName: 'When in Baguio Operations', highlight: 'React 19, Node.js, MySQL' },
      { projectId: 'wibav3', projectName: 'When in Baguio Eats', highlight: 'Flutter, iOS, Android' },
    ],
    confidence: 'confirmed',
    actions: [{ type: 'SCROLL_TO', target: 'projects' }],
    suggestedFollowUps: ['What mobile experience does Maurik have?', 'Show me projects using React', 'Tell me about his work at When in Baguio'],
  };
}
