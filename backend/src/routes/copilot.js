import express from 'express';
import { handleMatch, handleChat, handleExplain } from '../controllers/copilotController.js';

const router = express.Router();

router.post('/match', handleMatch);
router.post('/chat', handleChat);
router.post('/explain', handleExplain);

export default router;
