import express from 'express';
import {
  createOrGetMyConversation,
  getConversationMessages,
  getMyChatConversations,
  sendMessageToConversation,
} from '../controllers/chatController.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);
router.get('/my', getMyChatConversations);
router.post('/my', createOrGetMyConversation);
router.get('/:conversationId/messages', getConversationMessages);
router.post('/:conversationId/messages', sendMessageToConversation);

export default router;