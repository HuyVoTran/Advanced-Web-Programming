/**
 * Cấu hình API
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

export const API_ENDPOINTS = {
  // Products
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  FEATURED_PRODUCTS: '/products/featured',
  RELATED_PRODUCTS: (id: string) => `/products/${id}/related`,
  PRODUCT_STATS: '/products/stats',

  // Categories
  CATEGORIES: '/categories',
  CATEGORY_DETAIL: (id: string) => `/categories/${id}`,

  // Brands
  BRANDS: '/brands',
  BRAND_DETAIL: (id: string) => `/brands/${id}`,

  // Cart
  CART: '/cart',
  CART_ADD: '/cart/add',
  CART_UPDATE: (id: string) => `/cart/${id}`,
  CART_REMOVE: (id: string) => `/cart/${id}`,
  CART_CLEAR: '/cart',

  // Orders
  ORDERS: '/orders/my-orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  ORDER_CREATE: '/orders',
  ORDER_CANCEL: (id: string) => `/orders/${id}/cancel`,

  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/auth/profile',
  ADDRESSES: '/auth/addresses',
  ADDRESS_UPDATE: (id: string) => `/auth/addresses/${id}`,
  ADDRESS_DELETE: (id: string) => `/auth/addresses/${id}`,
  CHANGE_PASSWORD: '/auth/change-password',

  // News
  NEWS: '/news',
  NEWS_DETAIL: (id: string) => `/news/${id}`,

  // Contact
  CONTACT: '/contact',
  CONTACT_DETAIL: (id: string) => `/contact/${id}`,

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_ORDERS: '/admin/orders',

  // Home
  HOME: '/home',
};

/**
 * Default values cho UI
 */
export const UI_DEFAULTS = {
  ITEMS_PER_PAGE: 12,
  SKELETON_COUNT: 6,
  DEBOUNCE_DELAY: 500,
};

/**
 * HTTP Status Messages (Vietnamese)
 */
export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: 'Yêu cầu không hợp lệ',
  401: 'Vui lòng đăng nhập',
  403: 'Bạn không có quyền truy cập',
  404: 'Không tìm thấy tài nguyên',
  500: 'Lỗi máy chủ',
  503: 'Dịch vụ không khả dụng',
};
