import express from 'express';
import { validateCoupon } from '../controllers/couponController.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public: validate coupon during checkout (works for guests and logged-in users)
router.post('/validate', optionalAuth, validateCoupon);

export default router;
