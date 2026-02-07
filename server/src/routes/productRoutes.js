import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getRelatedProducts,
  getProductStats,
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/stats', getProductStats);
router.get('/:slug', getProductBySlug);
router.get('/:slug/related', getRelatedProducts);

export default router;
