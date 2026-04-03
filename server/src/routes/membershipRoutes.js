import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  getMembershipOverview,
  getMyRedemptions,
  getRewardCatalog,
  redeemReward,
} from '../controllers/membershipController.js';

const router = express.Router();

router.use(authenticate);

router.get('/overview', getMembershipOverview);
router.get('/rewards', getRewardCatalog);
router.post('/redeem', redeemReward);
router.get('/redemptions', getMyRedemptions);

export default router;
