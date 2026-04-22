import express from 'express';
import { createOrder, getMyOrders, getOrderById, cancelOrder } from '../controllers/orderController.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', optionalAuth, createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/:id', optionalAuth, getOrderById);
router.put('/:id/cancel', authenticate, cancelOrder);

export default router;
