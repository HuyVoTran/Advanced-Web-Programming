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
// put related route before the generic slug route to avoid accidental
// matching issues with certain URL structures
router.get('/:slug/related', getRelatedProducts);
router.get('/:slug', getProductBySlug);

export default router;
