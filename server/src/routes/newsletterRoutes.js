import express from 'express';
import { subscribeToNewsletter } from '../controllers/newsletterController.js';

const router = express.Router();

// Public endpoint for newsletter subscription
router.post('/subscribe', subscribeToNewsletter);

export default router;
