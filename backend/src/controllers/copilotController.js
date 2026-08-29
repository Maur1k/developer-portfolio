import { matchJobDescription, chatCopilot, explainArchitecture } from '../services/aiGatewayService.js';

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.socket?.remoteAddress || 'unknown';
}

export async function handleMatch(req, res) {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a valid job description (at least 10 characters).' });
    }
    const clientIp = getClientIp(req);
    const result = await matchJobDescription(jobDescription.trim().slice(0, 3000), clientIp);
    res.json(result);
  } catch (error) {
    console.error('Copilot Match Error:', error);
    res.status(500).json({ error: 'Failed to analyze job description. Please try again.' });
  }
}

export async function handleChat(req, res) {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length < 1) {
      return res.status(400).json({ error: 'Please provide a valid message.' });
    }

    // Token protection: Limit to 4 recent turns and 500 chars message
    const sanitizedHistory = Array.isArray(history)
      ? history
          .filter((item) => item && typeof item.content === 'string' && (item.role === 'user' || item.role === 'assistant'))
          .slice(-4)
          .map((item) => ({
            role: item.role,
            content: String(item.content).slice(0, 1000),
          }))
      : [];

    const clientIp = getClientIp(req);
    const result = await chatCopilot(message.trim().slice(0, 500), sanitizedHistory, clientIp);
    res.json(result);
  } catch (error) {
    console.error('Copilot Chat Error:', error);
    res.status(500).json({ error: 'Failed to process your question. Please try again.' });
  }
}

export async function handleExplain(req, res) {
  try {
    const { projectId, question } = req.body;
    if (!projectId || !question) {
      return res.status(400).json({ error: 'Please provide both projectId and question.' });
    }
    const clientIp = getClientIp(req);
    const result = await explainArchitecture(projectId, String(question).trim().slice(0, 500), clientIp);
    res.json(result);
  } catch (error) {
    console.error('Copilot Explain Error:', error);
    res.status(500).json({ error: 'Failed to explain architecture. Please try again.' });
  }
}
