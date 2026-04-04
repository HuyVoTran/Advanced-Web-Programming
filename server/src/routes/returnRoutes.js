import express from 'express';
import {
  createReturnRequest,
  getMyReturnRequests,
} from '../controllers/returnController.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);
router.get('/my', getMyReturnRequests);
router.post('/', createReturnRequest);

export default router;