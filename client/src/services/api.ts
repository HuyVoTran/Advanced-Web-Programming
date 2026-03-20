/**
 * API Service
 * Quản lý tất cả các request đến backend
 */

import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

interface RequestOptions extends RequestInit {
  token?: string;
}

/**
 * Hàm fetch chung cho tất cả API calls
 */
export const apiCall = async <T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

/**
 * Products API
 */
export const productsAPI = {
  getAll: (params?: Record<string, any>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiCall(`/products${queryString}`);
  },

  getById: (id: string) => apiCall(`/products/${id}`),

  getFeatured: () => apiCall('/products/featured'),

  getByCategory: (categoryId: string) => apiCall(`/products?category=${categoryId}`),

  search: (query: string) => apiCall(`/products?search=${encodeURIComponent(query)}`),

  getRelated: (productId: string) => apiCall(`/products/${productId}/related`),

  getStats: () => apiCall('/products/stats'),
};

/**
 * Categories API
 */
export const categoriesAPI = {
  getAll: () => apiCall('/categories'),

  getById: (id: string) => apiCall(`/categories/${id}`),

  create: (data: any, token: string) =>
    apiCall('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  update: (id: string, data: any, token: string) =>
    apiCall(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  delete: (id: string, token: string) =>
    apiCall(`/categories/${id}`, {
      method: 'DELETE',
      token,
    }),
};

/**
 * Brands API
 */
export const brandsAPI = {
  getAll: () => apiCall('/brands'),

  getById: (id: string) => apiCall(`/brands/${id}`),

  create: (data: any, token: string) =>
    apiCall('/brands', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  update: (id: string, data: any, token: string) =>
    apiCall(`/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  delete: (id: string, token: string) =>
    apiCall(`/brands/${id}`, {
      method: 'DELETE',
      token,
    }),
};

/**
 * Cart API
 */
export const cartAPI = {
  getCart: (token: string) => apiCall('/cart', { token }),

  addItem: (productId: string, quantity: number, token: string) =>
    apiCall('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
      token,
    }),

  updateItem: (itemId: string, quantity: number, token: string) =>
    apiCall(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
      token,
    }),

  removeItem: (itemId: string, token: string) =>
    apiCall(`/cart/${itemId}`, {
      method: 'DELETE',
      token,
    }),

  clearCart: (token: string) =>
    apiCall('/cart', {
      method: 'DELETE',
      token,
    }),
};

/**
 * Orders API
 */
export const ordersAPI = {
  getAll: (token: string) => apiCall('/orders/my-orders', { token }),

  getUserOrders: (token: string) => apiCall('/orders/my-orders', { token }),

  getById: (id: string, token: string) => apiCall(`/orders/${id}`, { token }),

  create: (data: any, token?: string) =>
    apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
      ...(token && { token }),
    }),

  cancel: (id: string, token: string) =>
    apiCall(`/orders/${id}/cancel`, {
      method: 'PUT',
      token,
    }),
};

/**
 * News API
 */
export const newsAPI = {
  getAll: (params?: Record<string, any>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiCall(`/news${queryString}`);
  },

  getById: (id: string) => apiCall(`/news/${id}`),

  getBySlug: (slug: string) => apiCall(`/news/${slug}`),

  create: (data: any, token: string) =>
    apiCall('/news', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  update: (id: string, data: any, token: string) =>
    apiCall(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  delete: (id: string, token: string) =>
    apiCall(`/news/${id}`, {
      method: 'DELETE',
      token,
    }),
};

/**
 * Contact API
 */
export const contactAPI = {
  submit: (data: any) =>
    apiCall('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: (token: string) => apiCall('/contact', { token }),

  getById: (id: string, token: string) => apiCall(`/contact/${id}`, { token }),

  delete: (id: string, token: string) =>
    apiCall(`/contact/${id}`, {
      method: 'DELETE',
      token,
    }),
};

/**
 * Auth API
 */
export const authAPI = {
  register: (data: any) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getProfile: (token: string) => apiCall('/auth/profile', { token }),

  updateProfile: (data: any, token: string) =>
    apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  changePassword: (data: any, token: string) =>
    apiCall('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  forgotPassword: (email: string) =>
    apiCall('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string, confirmPassword: string) =>
    apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password, confirmPassword }),
    }),

  addAddress: (data: any, token: string) =>
    apiCall('/auth/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  updateAddress: (addressId: string, data: any, token: string) =>
    apiCall(`/auth/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  deleteAddress: (addressId: string, token: string) =>
    apiCall(`/auth/addresses/${addressId}`, {
      method: 'DELETE',
      token,
    }),
};

/**
 * Admin API
 */
export const adminAPI = {
  getDashboard: (token: string) => apiCall('/admin/dashboard', { token }),

  getUsers: (token: string) => apiCall('/admin/users', { token }),

  getOrders: (token: string) => apiCall('/admin/orders', { token }),
};

/**
 * Home API
 */
export const homeAPI = {
  getHomeData: () => apiCall('/home'),
};

export default {
  productsAPI,
  categoriesAPI,
  brandsAPI,
  cartAPI,
  ordersAPI,
  newsAPI,
  contactAPI,
  authAPI,
  adminAPI,
  homeAPI,
};
