import express from 'express';
import {
  getDashboard,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getAllOrders,
  updateOrderStatus,
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

export default router;
