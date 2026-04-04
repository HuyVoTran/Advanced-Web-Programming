import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getRelatedProducts,
  getProductStats,
  getSearchSuggestions,
  getProductStockBySlug,
  getProductsStock,
} from '../controllers/productController.js';
import { createProductReview, getProductReviews } from '../controllers/reviewController.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/stats', getProductStats);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/stock', getProductsStock);
router.get('/:slug/reviews', optionalAuth, getProductReviews);
router.post('/:slug/reviews', authenticate, createProductReview);
// put related route before the generic slug route to avoid accidental
// matching issues with certain URL structures
router.get('/:slug/related', getRelatedProducts);
router.get('/:slug/stock', getProductStockBySlug);
router.get('/:slug', getProductBySlug);

export default router;
