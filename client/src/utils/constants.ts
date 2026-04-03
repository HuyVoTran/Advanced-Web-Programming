// Application Constants

// App Configuration
export const APP_NAME = 'Luxury Jewelry Store';
export const APP_DESCRIPTION = 'Hệ thống thương mại điện tử trang sức cao cấp';
export const APP_VERSION = '1.0.0';

export type CurrencyCode = 'vnd' | 'usd';

export const CURRENCY_STORAGE_KEY = 'luxury_jewelry_currency';
export const CURRENCY_CHANGE_EVENT = 'luxury_jewelry_currency_change';

const USD_EXCHANGE_RATE = 25000;

const normalizeCurrency = (value?: string): CurrencyCode =>
  String(value || '').toLowerCase() === 'usd' ? 'usd' : 'vnd';

export const getPreferredCurrency = (fallback: CurrencyCode = 'vnd'): CurrencyCode => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
  return normalizeCurrency(stored || fallback);
};

export const setPreferredCurrency = (currency: CurrencyCode): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const normalized = normalizeCurrency(currency);
  window.localStorage.setItem(CURRENCY_STORAGE_KEY, normalized);
  window.dispatchEvent(new CustomEvent(CURRENCY_CHANGE_EVENT, { detail: normalized }));
};

const toPrettyUsd = (rawUsd: number): number => {
  const safe = Number.isFinite(rawUsd) ? Math.max(0, rawUsd) : 0;

  if (safe >= 1000) {
    return Math.round(safe / 50) * 50;
  }

  const roundedInteger = Math.round(safe);
  const candidates = [
    roundedInteger,
    Math.floor(safe) + 0.49,
    Math.floor(safe) + 0.99,
  ];

  return candidates.reduce((closest, current) =>
    Math.abs(current - safe) < Math.abs(closest - safe) ? current : closest
  );
};

/**
 * Format price to Vietnamese Dong currency
 */
export const formatPrice = (value: number, currency?: CurrencyCode): string => {
  const selectedCurrency = normalizeCurrency(currency || getPreferredCurrency('vnd'));
  const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;

  if (selectedCurrency === 'usd') {
    const rawUsd = safeValue / USD_EXCHANGE_RATE;
    const prettyUsd = toPrettyUsd(rawUsd);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(prettyUsd);
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(safeValue);
};

export const roundPriceToStep = (value: number, step: number = 1000): number => {
  const numericValue = Number.isFinite(value) ? value : 0;
  const numericStep = Number.isFinite(step) && step > 0 ? step : 1000;
  return Math.max(0, Math.round(numericValue / numericStep) * numericStep);
};

export const calculateDiscountedPrice = (
  basePrice: number,
  salePercent: number,
  roundingStep: number = 1000
): number => {
  const normalizedBasePrice = Number.isFinite(basePrice) ? Math.max(0, basePrice) : 0;
  const normalizedSalePercent = Number.isFinite(salePercent)
    ? Math.min(100, Math.max(0, salePercent))
    : 0;

  if (normalizedSalePercent <= 0) {
    return roundPriceToStep(normalizedBasePrice, roundingStep);
  }

  const rawDiscountedPrice = normalizedBasePrice * (1 - normalizedSalePercent / 100);
  return roundPriceToStep(rawDiscountedPrice, roundingStep);
};

/**
 * Get order status display text in Vietnamese
 */
export const getStatusText = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Chờ xác nhận';
    case 'processing':
      return 'Đang xử lý';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'shipping':
      return 'Đang giao';
    case 'completed':
    case 'delivered':
      return 'Hoàn thành';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
};

/**
 * Get order status badge color classes
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'processing':
      return 'bg-blue-100 text-blue-700';
    case 'confirmed':
      return 'bg-indigo-100 text-indigo-700';
    case 'shipping':
      return 'bg-purple-100 text-purple-700';
    case 'completed':
    case 'delivered':
      return 'bg-green-100 text-green-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

// Colors (matching theme.css)
export const COLORS = {
  primary: '#C9A24D',
  primaryDark: '#b8923f',
  white: '#FFFFFF',
  black: '#1a1a1a',
  gray: {
    50: '#f5f5f5',
    100: '#f3f3f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#6b6b6b',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
} as const;

// Breakpoints (matching Tailwind defaults)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Animation Durations (in ms)
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 700,
} as const;

// Delays
export const DELAYS = {
  debounce: 500,
  toast: 3000,
  tooltip: 200,
} as const;

// E-commerce Constants
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Chờ xác nhận',
  [ORDER_STATUS.CONFIRMED]: 'Đã xác nhận',
  [ORDER_STATUS.SHIPPING]: 'Đang giao hàng',
  [ORDER_STATUS.DELIVERED]: 'Đã giao hàng',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy',
} as const;

export const PAYMENT_METHODS = {
  COD: 'cod',
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
} as const;

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.COD]: 'Thanh toán khi nhận hàng (COD)',
  [PAYMENT_METHODS.BANK_TRANSFER]: 'Chuyển khoản ngân hàng',
  [PAYMENT_METHODS.CREDIT_CARD]: 'Thẻ tín dụng/ghi nợ',
} as const;

// User Roles
export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

// Pagination
export const PAGINATION = {
  defaultPageSize: 12,
  pageSizeOptions: [12, 24, 36, 48],
} as const;

// Form Validation
export const VALIDATION = {
  phone: {
    pattern: /^[0-9]{10,11}$/,
    message: 'Số điện thoại phải có 10-11 chữ số',
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email không hợp lệ',
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số',
  },
} as const;

// Product Filters
export const SORT_OPTIONS = [
  { value: 'featured', label: 'Nổi bật' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá: Thấp đến cao' },
  { value: 'price-desc', label: 'Giá: Cao đến thấp' },
  { value: 'name-asc', label: 'Tên: A-Z' },
  { value: 'name-desc', label: 'Tên: Z-A' },
] as const;

// Price Range (for filters)
export const PRICE_RANGE = {
  min: 10_000_000,
  max: 500_000_000,
  step: 10_000_000,
} as const;

// Free Shipping Threshold
export const FREE_SHIPPING_THRESHOLD = 0; // Free shipping for all luxury jewelry

// File Upload
export const FILE_UPLOAD = {
  maxSize: 5 * 1024 * 1024, // 5MB
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
  maxFiles: 5,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  cart: 'luxury_jewelry_cart',
  user: 'luxury_jewelry_user',
  wishlist: 'luxury_jewelry_wishlist',
  recentlyViewed: 'luxury_jewelry_recently_viewed',
  theme: 'luxury_jewelry_theme',
} as const;

// API Endpoints (for future backend integration)
export const API_ENDPOINTS = {
  products: '/api/products',
  orders: '/api/orders',
  users: '/api/users',
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
  },
  categories: '/api/categories',
  brands: '/api/brands',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  network: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.',
  server: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  notFound: 'Không tìm thấy nội dung.',
  unauthorized: 'Bạn cần đăng nhập để thực hiện thao tác này.',
  forbidden: 'Bạn không có quyền truy cập.',
  validation: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  generic: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  saved: 'Đã lưu thành công',
  updated: 'Đã cập nhật thành công',
  deleted: 'Đã xóa thành công',
  created: 'Đã tạo thành công',
} as const;

// Contact Info
export const CONTACT_INFO = {
  email: 'support@luxuryjewelry.com',
  phone: '1900-xxxx',
  address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
  workingHours: 'Thứ 2 - Chủ nhật: 9:00 - 21:00',
} as const;

// Social Links
export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/luxuryjewelry',
  instagram: 'https://instagram.com/luxuryjewelry',
  youtube: 'https://youtube.com/luxuryjewelry',
  tiktok: 'https://tiktok.com/@luxuryjewelry',
} as const;

// SEO
export const SEO = {
  defaultTitle: 'Luxury Jewelry Store - Trang sức cao cấp',
  titleTemplate: '%s | Luxury Jewelry Store',
  defaultDescription: 'Khám phá bộ sưu tập trang sức cao cấp với thiết kế tinh tế và chất lượng đẳng cấp quốc tế.',
  keywords: 'trang sức cao cấp, nhẫn kim cương, dây chuyền vàng, bông tai đá quý',
} as const;

// Feature Flags (for gradual rollout)
export const FEATURES = {
  enableWishlist: true,
  enableReviews: true,
  enableQuickView: true,
  enableCompare: false,
  enableChat: false,
  enableNotifications: true,
} as const;
