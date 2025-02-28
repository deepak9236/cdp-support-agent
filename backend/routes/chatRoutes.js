import express from 'express';
import { processQuery, getChatHistory, clearChatHistory } from '../controllers/chatController.js';

const router = express.Router();

// Process a new chat query
router.post('/query', processQuery);

// Get chat history for a user
router.get('/history/:userId', getChatHistory);

// Clear chat history for a user
router.delete('/history/:userId', clearChatHistory);

export default router;