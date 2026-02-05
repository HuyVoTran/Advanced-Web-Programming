// Application Constants

// App Configuration
export const APP_NAME = 'Luxury Jewelry Store';
export const APP_DESCRIPTION = 'Hệ thống thương mại điện tử trang sức cao cấp';
export const APP_VERSION = '1.0.0';

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
