import express from 'express';
import { sendResponse } from '../utils/response.js';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import brandRoutes from './brandRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import newsRoutes from './newsRoutes.js';
import contactRoutes from './contactRoutes.js';
import adminRoutes from './adminRoutes.js';
import newsletterRoutes from './newsletterRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const router = express.Router();

// Home route with mock data
router.get('/home', (req, res) => {
  const homeData = {
    heroBanners: [
      {
        id: 1,
        title: 'Luxury Jewelry Collection',
        subtitle: 'Discover exquisite pieces from world-renowned brands',
        image: '/images/banner-1.jpg',
        link: '/products',
      },
      {
        id: 2,
        title: 'New Season 2024',
        subtitle: 'Limited edition collections now available',
        image: '/images/banner-2.jpg',
        link: '/products?category=new',
      },
    ],
    featuredCollections: [
      {
        id: 1,
        name: 'Diamond Collection',
        image: '/images/collection-1.jpg',
        link: '/products?material=diamond',
      },
      {
        id: 2,
        name: 'Gold Jewelry',
        image: '/images/collection-2.jpg',
        link: '/products?material=gold',
      },
      {
        id: 3,
        name: 'Platinum Elegance',
        image: '/images/collection-3.jpg',
        link: '/products?material=platinum',
      },
    ],
    stats: {
      yearsInBusiness: 25,
      productCount: 500,
      happyCustomers: 50000,
      countries: 120,
    },
  };

  return sendResponse(res, 200, 'Dữ liệu trang chủ được lấy thành công', homeData);
});

// API Routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/news', newsRoutes);
router.use('/contact', contactRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/upload', uploadRoutes);
router.use('/admin', adminRoutes);

export default router;
