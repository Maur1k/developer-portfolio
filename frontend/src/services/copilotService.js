const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Copilot API Service — communicates with the backend Gemini-powered endpoints.
 */
export const copilotService = {
  /**
   * Recruiter Job Match — analyze a Job Description against Maurik's portfolio.
   * @param {string} jobDescription - The raw JD text.
   * @returns {Promise<Object>} Structured match result with score, matches, gaps, evidence.
   */
  async matchJobDescription(jobDescription) {
    const res = await fetch(`${API_BASE}/api/copilot/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobDescription }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to analyze job description.');
    }

    return res.json();
  },

  /**
   * Chat Copilot — ask Maurik AI a natural language question.
   * @param {string} message - The visitor's question.
   * @param {Array} history - Optional conversation history.
   * @returns {Promise<Object>} Response with message, actions, and follow-ups.
   */
  async chat(message, history = []) {
    const res = await fetch(`${API_BASE}/api/copilot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to process question.');
    }

    return res.json();
  },

  /**
   * Architecture Explain — get a grounded deep-dive on a specific project.
   * @param {string} projectId - The project ID.
   * @param {string} question - The architecture question.
   * @returns {Promise<Object>} Answer and related topics.
   */
  async explainArchitecture(projectId, question) {
    const res = await fetch(`${API_BASE}/api/copilot/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, question }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to explain architecture.');
    }

    return res.json();
  },
};
