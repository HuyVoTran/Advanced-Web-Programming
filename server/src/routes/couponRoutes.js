import express from 'express';
import { validateCoupon } from '../controllers/couponController.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public: validate coupon during checkout (optionally authenticated)
router.post('/validate', authenticate, validateCoupon);

export default router;
