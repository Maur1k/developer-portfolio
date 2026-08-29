/**
 * Additive Merge Engine for CV / Resume Sync
 *
 * Core Design: ADDITIVE MERGE, NEVER DESTRUCTIVE OVERWRITE
 *
 * Rules:
 * 1. ADD NEW — Never Delete: Items in CV but not in portfolio → flagged as NEW
 * 2. ENRICH — Never Downgrade: If portfolio has richer detail, keep it
 * 3. HUMAN APPROVAL REQUIRED: All changes presented for selective approval
 *
 * Diff Categories:
 * - NEW: Found in CV, not in portfolio
 * - UPDATED: In both, CV has newer/different info worth reviewing
 * - UNCHANGED: Already matches or portfolio is richer
 * - PORTFOLIO_ONLY: In portfolio but not in CV → always preserved
 */

/**
 * Normalize a string for comparison (lowercase, trim, remove extra spaces)
 */
function normalize(str) {
  return (str || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Check if two strings are semantically similar enough to be considered the same item
 */
function isSimilar(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return true;
  // Check if one contains the other (e.g., "React" matches "React 19")
  if (na.includes(nb) || nb.includes(na)) return true;
  // Check word overlap (>60% shared words)
  const wordsA = new Set(na.split(/\s+/));
  const wordsB = new Set(nb.split(/\s+/));
  const intersection = [...wordsA].filter((w) => wordsB.has(w));
  const union = new Set([...wordsA, ...wordsB]);
  return union.size > 0 && intersection.length / union.size > 0.6;
}

/**
 * Compare two arrays of strings (e.g., skill lists)
 * Returns categorized diff items
 */
function diffStringArrays(cvItems, portfolioItems, sectionName) {
  const results = [];

  // Find NEW items (in CV but not in portfolio)
  for (const cvItem of cvItems) {
    const match = portfolioItems.find((p) => isSimilar(cvItem, p));
    if (!match) {
      results.push({
        section: sectionName,
        category: 'NEW',
        cvValue: cvItem,
        portfolioValue: null,
        selected: true, // pre-checked for convenience
      });
    } else {
      // Check if they are slightly different (potential update)
      if (normalize(cvItem) !== normalize(match)) {
        results.push({
          section: sectionName,
          category: 'UNCHANGED',
          cvValue: cvItem,
          portfolioValue: match,
          selected: false,
        });
      }
    }
  }

  // Find PORTFOLIO_ONLY items (in portfolio but not in CV)
  for (const pItem of portfolioItems) {
    const match = cvItems.find((c) => isSimilar(c, pItem));
    if (!match) {
      results.push({
        section: sectionName,
        category: 'PORTFOLIO_ONLY',
        cvValue: null,
        portfolioValue: pItem,
        selected: false, // always preserved, never deleted
      });
    }
  }

  return results;
}

/**
 * Compare two text fields (e.g., summary, title)
 * If CV version is shorter/less detailed, keep portfolio version
 */
function diffTextField(cvValue, portfolioValue, fieldName, sectionName) {
  const cv = (cvValue || '').trim();
  const pf = (portfolioValue || '').trim();

  if (!cv && !pf) return null;

  if (!cv && pf) {
    return {
      section: sectionName,
      field: fieldName,
      category: 'PORTFOLIO_ONLY',
      cvValue: null,
      portfolioValue: pf,
      selected: false,
    };
  }

  if (cv && !pf) {
    return {
      section: sectionName,
      field: fieldName,
      category: 'NEW',
      cvValue: cv,
      portfolioValue: null,
      selected: true,
    };
  }

  // Both exist — compare
  if (normalize(cv) === normalize(pf)) {
    return null; // identical, skip
  }

  // If portfolio version is longer/richer, mark as UNCHANGED (keep portfolio)
  if (pf.length >= cv.length * 1.3) {
    return {
      section: sectionName,
      field: fieldName,
      category: 'UNCHANGED',
      cvValue: cv,
      portfolioValue: pf,
      note: 'Portfolio version is more detailed — keeping existing.',
      selected: false,
    };
  }

  // CV has meaningfully different content
  return {
    section: sectionName,
    field: fieldName,
    category: 'UPDATED',
    cvValue: cv,
    portfolioValue: pf,
    selected: false, // admin must manually approve updates
  };
}

/**
 * Compare experience entries by role + company similarity
 */
function diffExperience(cvExperience, portfolioExperience) {
  const results = [];

  for (const cvExp of cvExperience || []) {
    const cvKey = normalize(`${cvExp.role || ''} ${cvExp.company || ''}`);
    const match = (portfolioExperience || []).find((pExp) => {
      const pKey = normalize(`${pExp.role || ''} ${pExp.company || ''}`);
      return isSimilar(cvKey, pKey);
    });

    if (!match) {
      results.push({
        section: 'Experience',
        category: 'NEW',
        cvValue: cvExp,
        portfolioValue: null,
        displayLabel: `${cvExp.role || 'Role'} at ${cvExp.company || 'Company'}`,
        selected: true,
      });
    } else {
      // Compare highlights/responsibilities
      const cvHighlights = cvExp.highlights || cvExp.responsibilities || [];
      const pfHighlights = match.responsibilities || match.highlights || [];

      // Find genuinely new highlights
      const newHighlights = cvHighlights.filter(
        (ch) => !pfHighlights.some((ph) => isSimilar(ch, ph))
      );

      if (newHighlights.length > 0) {
        results.push({
          section: 'Experience',
          category: 'UPDATED',
          cvValue: { ...cvExp, newHighlights },
          portfolioValue: match,
          displayLabel: `${match.role || cvExp.role} at ${match.company || cvExp.company}`,
          note: `${newHighlights.length} new highlight(s) found in CV`,
          selected: false,
        });
      }
    }
  }

  // PORTFOLIO_ONLY experiences
  for (const pExp of portfolioExperience || []) {
    const pKey = normalize(`${pExp.role || ''} ${pExp.company || ''}`);
    const match = (cvExperience || []).find((cExp) => {
      const cKey = normalize(`${cExp.role || ''} ${cExp.company || ''}`);
      return isSimilar(cKey, pKey);
    });

    if (!match) {
      results.push({
        section: 'Experience',
        category: 'PORTFOLIO_ONLY',
        cvValue: null,
        portfolioValue: pExp,
        displayLabel: `${pExp.role || 'Role'} at ${pExp.company || 'Company'}`,
        selected: false,
      });
    }
  }

  return results;
}

/**
 * Compare project entries by name similarity
 */
function diffProjects(cvProjects, portfolioProjects) {
  const results = [];

  for (const cvProj of cvProjects || []) {
    const match = (portfolioProjects || []).find((pProj) =>
      isSimilar(cvProj.name || '', pProj.name || pProj.title || '')
    );

    if (!match) {
      results.push({
        section: 'Projects',
        category: 'NEW',
        cvValue: cvProj,
        portfolioValue: null,
        displayLabel: cvProj.name || 'Unnamed Project',
        selected: true,
      });
    } else {
      // Check for new technologies
      const cvTech = cvProj.technologies || [];
      const pfTech = match.technologies || [];
      const newTech = cvTech.filter((ct) => !pfTech.some((pt) => isSimilar(ct, pt)));

      // Check for new achievements
      const cvAchievements = cvProj.achievements || cvProj.evidencePoints || [];
      const pfAchievements = match.evidencePoints || match.highlights || match.contributions || [];
      const newAchievements = cvAchievements.filter(
        (ca) => !pfAchievements.some((pa) => isSimilar(ca, pa))
      );

      if (newTech.length > 0 || newAchievements.length > 0) {
        results.push({
          section: 'Projects',
          category: 'UPDATED',
          cvValue: { ...cvProj, newTechnologies: newTech, newAchievements },
          portfolioValue: match,
          displayLabel: match.name || match.title || cvProj.name,
          note: `${newTech.length} new tech, ${newAchievements.length} new achievement(s)`,
          selected: false,
        });
      }
    }
  }

  // PORTFOLIO_ONLY projects
  for (const pProj of portfolioProjects || []) {
    const match = (cvProjects || []).find((cProj) =>
      isSimilar(cProj.name || '', pProj.name || pProj.title || '')
    );

    if (!match) {
      results.push({
        section: 'Projects',
        category: 'PORTFOLIO_ONLY',
        cvValue: null,
        portfolioValue: pProj,
        displayLabel: pProj.name || pProj.title || 'Project',
        selected: false,
      });
    }
  }

  return results;
}

/**
 * Local Heuristic Fallback Parser:
 * Extracts structured portfolio elements from raw resume text when AI keys are unavailable.
 */
export function extractStructuredCVFallback(rawText) {
  const text = rawText || '';

  // 1. Profile Extraction
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const name = 'Maurik Angelo L. Fernandez';
  const title = text.includes('Full-Stack') || text.includes('Full Stack')
    ? 'Software Developer | Full-Stack & AI-Assisted Development'
    : 'Software Developer';

  // 2. Skill Keyword Scanner
  const skillDict = {
    languages: ['PHP', 'JavaScript', 'TypeScript', 'Dart', 'Python', 'Java', 'C++', 'C#', 'Rust', 'Go', 'HTML5', 'CSS3', 'SQL'],
    frontendAndMobile: ['React', 'React 19', 'React Native', 'Flutter', 'Tailwind CSS', 'Vite', 'Framer Motion', 'Vue', 'Next.js', 'Redux', 'Provider'],
    backend: ['Node.js', 'Express', 'Express.js', 'Laravel', 'PHP', 'REST APIs', 'GraphQL', 'Django', 'FastAPI'],
    databases: ['MySQL', 'MongoDB', 'Firebase Firestore', 'Realtime Database', 'PostgreSQL', 'Redis', 'Supabase', 'SQLite'],
    cloudAndAI: ['Azure OpenAI', 'Azure AI', 'Google Gemini', 'Firebase', 'AWS', 'Docker', 'Kubernetes', 'GCP', 'Vercel'],
    aiAssistedDevelopment: ['Cursor', 'Claude Code', 'GitHub Copilot', 'OpenAI Codex', 'ChatGPT', 'Gemini', 'LangChain', 'LlamaIndex', 'Dialogflow'],
    apisAndIntegrations: ['PayMongo', 'Firebase Cloud Messaging (FCM)', 'FCM HTTP v1', 'Leaflet GIS', 'Google Maps API', 'Stripe', 'Axios'],
    tools: ['Git', 'GitHub', 'Postman', 'VS Code', 'cPanel', 'Vite', 'Codemagic'],
  };

  const extractedSkills = {};
  for (const [cat, techList] of Object.entries(skillDict)) {
    extractedSkills[cat] = techList.filter((tech) => {
      const regex = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(text);
    });
  }

  // 3. Projects & Experience Detection
  const projects = [];
  if (/baguio.*ops|backops|operations/i.test(text)) {
    projects.push({
      name: 'When in Baguio — Operations & Dispatch Platform',
      technologies: ['React 19', 'Node.js', 'MySQL', 'FCM', 'PayMongo', 'Leaflet GIS', 'Tailwind CSS'],
      achievements: [
        'Sub-100ms dashboard queries via keyset pagination & LRU caching.',
        'High-reliability FCM HTTP v1 push pipeline with token normalization.',
        'PayMongo webhook reconciliation for GCash, Maya, and card transactions.',
      ],
    });
  }
  if (/baguio.*eats|wibav3|wibe|customer mobile/i.test(text)) {
    projects.push({
      name: 'When in Baguio Eats — Customer Mobile App',
      technologies: ['Flutter', 'Dart', 'Provider', 'Google Maps', 'PayMongo (GCash)', 'Codemagic'],
      achievements: [
        '60,000+ registered users across Apple App Store and Google Play.',
        '99.2% crash-free session stability.',
        'Provider cart persistence reducing checkout latency by 40%.',
        'FCM notification routing with deep-link navigation.',
      ],
    });
  }
  if (/click2serve|kiosk|alaminos|municipal/i.test(text)) {
    projects.push({
      name: 'CLICK2SERVE: Smart Municipal Information Kiosk',
      technologies: ['Laravel', 'PHP', 'MySQL', 'JavaScript', 'Tailwind CSS', '3D Floor Maps', 'AI Assistant'],
      achievements: [
        'Built a touchscreen kiosk and citizen web portal for Alaminos City Hall.',
        'Engineered ticket queue state management and officer dispatch dashboard.',
        'Developed an AI-powered FAQ chatbot using Dialogflow for 24/7 citizen inquiries.',
      ],
    });
  }
  if (/projex|project.*management/i.test(text)) {
    projects.push({
      name: 'ProjeX — Client Project Management',
      technologies: ['Laravel 12', 'PHP', 'MySQL', 'React', 'TypeScript', 'Vite', 'Tailwind CSS v4'],
      achievements: [
        'Decoupled Laravel 12 REST API with strict form request validation.',
        'Type-safe React + TypeScript frontend with real-time validation and status badge tracking.',
      ],
    });
  }

  const experience = [];
  if (/when in baguio/i.test(text)) {
    experience.push({
      role: 'Contractual Software Developer',
      company: 'When in Baguio Inc.',
      period: '2026 – Present',
      location: 'Baguio City / Remote, Philippines',
      highlights: [
        'Supported development and modernization of production customer and dispatch applications.',
        'Configured and deployed iOS releases through Codemagic and Google Play.',
        'Implemented FCM notification routing with local caching and deep-link navigation.',
      ],
    });
  }

  return {
    profile: {
      name,
      title,
      summary: text.slice(0, 350).trim(),
      email: emailMatch ? emailMatch[0] : 'maurikfernandez123@gmail.com',
      phone: phoneMatch ? phoneMatch[0] : '+63 927 797 5100',
    },
    skills: extractedSkills,
    experience,
    projects,
    education: [
      {
        degree: 'BS Information Technology, Major in Web and Mobile Technologies',
        school: 'Pangasinan State University, Urdaneta Campus',
        period: '2022 – 2026',
      },
    ],
    certificates: [],
  };
}

/**
 * Main merge function: compares CV-extracted data against existing portfolio data.
 *
 * @param {Object} cvData - Structured JSON extracted from the CV by the AI
 * @param {Object} portfolioData - Current portfolio data from the database
 * @returns {Object} { diffs: Array, summary: { newCount, updatedCount, unchangedCount, portfolioOnlyCount } }
 */
export function computeMergeDiff(cvData, portfolioData) {
  const diffs = [];

  // ── Profile Fields ───────────────────────────────
  const profileFields = ['title', 'summary', 'coreSummary'];
  for (const field of profileFields) {
    const cvVal = cvData.profile?.[field];
    const pfVal = portfolioData.profile?.[field];
    const diff = diffTextField(cvVal, pfVal, field, 'Profile');
    if (diff) diffs.push(diff);
  }

  // ── Skills ───────────────────────────────────────
  const skillCategories = [
    'languages', 'frontendAndMobile', 'backend', 'databases',
    'aiAssistedDevelopment', 'cloudAndAI', 'practices',
    'apisAndIntegrations', 'developmentTools', 'tools',
  ];

  for (const cat of skillCategories) {
    const cvSkills = cvData.skills?.[cat] || [];
    const pfSkills = portfolioData.skills?.[cat] || [];
    if (cvSkills.length > 0 || pfSkills.length > 0) {
      const skillDiffs = diffStringArrays(cvSkills, pfSkills, `Skills > ${cat}`);
      diffs.push(...skillDiffs);
    }
  }

  // ── Experience ───────────────────────────────────
  const expDiffs = diffExperience(cvData.experience, portfolioData.experience);
  diffs.push(...expDiffs);

  // ── Projects ─────────────────────────────────────
  const projDiffs = diffProjects(cvData.projects, portfolioData.projects);
  diffs.push(...projDiffs);

  // ── Education ────────────────────────────────────
  const cvEdu = cvData.education || [];
  const pfEdu = portfolioData.education || [];
  for (const ce of cvEdu) {
    const ceKey = normalize(`${ce.degree || ''} ${ce.school || ''}`);
    const match = pfEdu.find((pe) => isSimilar(ceKey, normalize(`${pe.degree || ''} ${pe.school || ''}`)));
    if (!match) {
      diffs.push({
        section: 'Education',
        category: 'NEW',
        cvValue: ce,
        portfolioValue: null,
        displayLabel: `${ce.degree || 'Degree'} — ${ce.school || 'School'}`,
        selected: true,
      });
    }
  }

  // ── Certificates ─────────────────────────────────
  const cvCerts = cvData.certificates || [];
  const pfCerts = portfolioData.certificates || [];
  for (const cc of cvCerts) {
    const ccName = normalize(cc.name || cc);
    const match = pfCerts.find((pc) => isSimilar(ccName, normalize(pc.name || pc)));
    if (!match) {
      diffs.push({
        section: 'Certificates',
        category: 'NEW',
        cvValue: cc,
        portfolioValue: null,
        displayLabel: cc.name || cc,
        selected: true,
      });
    }
  }

  // ── Summary Statistics ───────────────────────────
  const summary = {
    newCount: diffs.filter((d) => d.category === 'NEW').length,
    updatedCount: diffs.filter((d) => d.category === 'UPDATED').length,
    unchangedCount: diffs.filter((d) => d.category === 'UNCHANGED').length,
    portfolioOnlyCount: diffs.filter((d) => d.category === 'PORTFOLIO_ONLY').length,
    totalDiffs: diffs.length,
  };

  return { diffs, summary };
}
