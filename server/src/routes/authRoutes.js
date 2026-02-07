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
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.post('/addresses', authenticate, addAddress);
router.put('/addresses/:addressId', authenticate, updateAddress);
router.delete('/addresses/:addressId', authenticate, deleteAddress);

export default router;
