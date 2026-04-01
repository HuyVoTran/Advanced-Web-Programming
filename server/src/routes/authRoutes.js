import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  addFavorite,
  removeFavorite,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.post('/addresses', authenticate, addAddress);
router.put('/addresses/:addressId', authenticate, updateAddress);
router.delete('/addresses/:addressId', authenticate, deleteAddress);
router.post('/favorites/:productId', authenticate, addFavorite);
router.delete('/favorites/:productId', authenticate, removeFavorite);

export default router;
