import express from 'express';
import { uploadCategory, uploadProduct, uploadNews } from '../middlewares/upload.middleware.js';
import { uploadCategoryImage, uploadProductImages, uploadNewsImage } from '../controllers/uploadController.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Upload category image - requires auth
router.post('/category/:id', authenticate, uploadCategory.single('image'), uploadCategoryImage);

// Upload product images (max 4) - requires auth
router.post('/products/:id', authenticate, uploadProduct.array('images', 4), uploadProductImages);

// Upload news thumbnail - requires auth
router.post('/news/:id', authenticate, uploadNews.single('image'), uploadNewsImage);

export default router;
