import express from 'express';
import {
  getDashboard,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getAllOrders,
  updateOrderStatus,
  rejectOrder,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
} from '../controllers/adminController.js';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { createBrand, updateBrand, deleteBrand } from '../controllers/brandController.js';
import { createNews, updateNews, publishNews, deleteNews, getAllNewsAdmin } from '../controllers/newsController.js';
import {
  getNewsletterSubscribers,
  getNewsletterUsers,
  sendNewsletterBroadcast,
} from '../controllers/newsletterAdminController.js';
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponStats,
} from '../controllers/couponController.js';
import {
  createRewardItemAdmin,
  deleteRewardItemAdmin,
  getAllRewardItemsAdmin,
  getRewardRedemptionStatsAdmin,
  syncUserMembershipAdmin,
  updateRewardItemAdmin,
} from '../controllers/membershipController.js';
import {
  getAllReturnRequestsAdmin,
  updateReturnRequestStatusAdmin,
} from '../controllers/returnController.js';
import {
  getAllConversationsAdmin,
  getConversationMessages,
  sendMessageToConversation,
  updateConversationStatusAdmin,
} from '../controllers/chatController.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, adminOnly);

// Dashboard
router.get('/dashboard', getDashboard);

// Product Management
router.post('/products', createProduct);
router.get('/products', getAllProducts);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Category Management
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Brand Management
router.post('/brands', createBrand);
router.put('/brands/:id', updateBrand);
router.delete('/brands/:id', deleteBrand);

// Order Management
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/reject', rejectOrder);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// News Management
router.get('/news', getAllNewsAdmin);
router.post('/news', createNews);
router.put('/news/:id', updateNews);
router.put('/news/:id/publish', publishNews);
router.delete('/news/:id', deleteNews);

// Newsletter Management
router.get('/newsletter/subscribers', getNewsletterSubscribers);
router.get('/newsletter/users', getNewsletterUsers);
router.post('/newsletter/send', sendNewsletterBroadcast);

// Coupon Management
router.get('/coupons', getAllCoupons);
router.get('/coupons/stats', getCouponStats);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Membership Reward Management
router.get('/membership/rewards', getAllRewardItemsAdmin);
router.post('/membership/rewards', createRewardItemAdmin);
router.put('/membership/rewards/:id', updateRewardItemAdmin);
router.delete('/membership/rewards/:id', deleteRewardItemAdmin);
router.get('/membership/stats', getRewardRedemptionStatsAdmin);
router.post('/membership/sync/:userId', syncUserMembershipAdmin);

// Return Requests Management
router.get('/returns', getAllReturnRequestsAdmin);
router.put('/returns/:id/status', updateReturnRequestStatusAdmin);

// Chat Management
router.get('/chats', getAllConversationsAdmin);
router.get('/chats/:conversationId/messages', getConversationMessages);
router.post('/chats/:conversationId/messages', sendMessageToConversation);
router.put('/chats/:conversationId/status', updateConversationStatusAdmin);

export default router;
