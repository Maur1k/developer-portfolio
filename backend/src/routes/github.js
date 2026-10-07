import express from 'express';
import { getContributionCalendar } from '../controllers/githubController.js';

const router = express.Router();

router.get('/calendar', getContributionCalendar);

export default router;
