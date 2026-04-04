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
import couponRoutes from './couponRoutes.js';
import membershipRoutes from './membershipRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import returnRoutes from './returnRoutes.js';
import chatRoutes from './chatRoutes.js';

const router = express.Router();

let cachedVietnamProvinces = null;
let cachedVietnamProvincesAt = 0;
const VIETNAM_PROVINCES_CACHE_TTL_MS = 1000 * 60 * 60 * 12;

const normalizeVietnamAddressData = (raw) => {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((province) => ({
      code: Number(province?.code || 0),
      name: String(province?.name || '').trim(),
      districts: Array.isArray(province?.districts)
        ? province.districts.map((district) => ({
            code: Number(district?.code || 0),
            name: String(district?.name || '').trim(),
            wards: Array.isArray(district?.wards)
              ? district.wards.map((ward) => ({
                  code: Number(ward?.code || 0),
                  name: String(ward?.name || '').trim(),
                }))
              : [],
          }))
        : [],
    }))
    .filter((province) => province.code > 0 && province.name.length > 0);
};

const fetchVietnamAddressData = async () => {
  const now = Date.now();
  if (
    Array.isArray(cachedVietnamProvinces) &&
    cachedVietnamProvinces.length > 0 &&
    now - cachedVietnamProvincesAt < VIETNAM_PROVINCES_CACHE_TTL_MS
  ) {
    return cachedVietnamProvinces;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch('https://provinces.open-api.vn/api/p/?depth=3', {
      signal: controller.signal,
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const raw = await response.json();
    const normalized = normalizeVietnamAddressData(raw);

    if (!Array.isArray(normalized) || normalized.length === 0) {
      throw new Error('empty-data');
    }

    cachedVietnamProvinces = normalized;
    cachedVietnamProvincesAt = Date.now();
    return normalized;
  } finally {
    clearTimeout(timeout);
  }
};

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

router.get('/vietnam-address/provinces', async (req, res) => {
  try {
    const data = await fetchVietnamAddressData();
    return sendResponse(res, 200, 'Dữ liệu tỉnh/thành được lấy thành công', data);
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: 'Không thể tải dữ liệu tỉnh/thành từ nguồn bên ngoài',
      error: error instanceof Error ? error.message : String(error),
    });
  }
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
router.use('/coupons', couponRoutes);
router.use('/membership', membershipRoutes);
router.use('/notifications', notificationRoutes);
router.use('/returns', returnRoutes);
router.use('/chat', chatRoutes);
router.use('/admin', adminRoutes);

export default router;
