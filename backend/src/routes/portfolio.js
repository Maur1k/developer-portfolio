import express from 'express';
import { getPortfolioData, getProjects, getSkills, contactForm } from '../controllers/portfolioController.js';

const router = express.Router();

// Routes
router.get('/portfolio', getPortfolioData);
router.get('/projects', getProjects);
router.get('/skills', getSkills);
router.post('/contact', contactForm);

export default router;
