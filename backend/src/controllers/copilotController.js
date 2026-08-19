import { matchJobDescription, chatCopilot, explainArchitecture } from '../services/geminiService.js';

export async function handleMatch(req, res) {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a valid job description (at least 10 characters).' });
    }
    const result = await matchJobDescription(jobDescription.trim());
    res.json(result);
  } catch (error) {
    console.error('Copilot Match Error:', error);
    res.status(500).json({ error: 'Failed to analyze job description. Please try again.' });
  }
}

export async function handleChat(req, res) {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length < 2) {
      return res.status(400).json({ error: 'Please provide a valid message.' });
    }
    const result = await chatCopilot(message.trim(), history || []);
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
    const result = await explainArchitecture(projectId, question.trim());
    res.json(result);
  } catch (error) {
    console.error('Copilot Explain Error:', error);
    res.status(500).json({ error: 'Failed to explain architecture. Please try again.' });
  }
}
