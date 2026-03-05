import express from 'express';
import { uploadCategory, uploadProduct } from '../middlewares/upload.middleware.js';
import { uploadCategoryImage, uploadProductImages } from '../controllers/uploadController.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Upload category image - requires auth
router.post('/category/:id', authenticate, uploadCategory.single('image'), uploadCategoryImage);

// Upload product images (max 4) - requires auth
router.post('/products/:id', authenticate, uploadProduct.array('images', 4), uploadProductImages);

export default router;
