/**
 * Admin API Service
 * Handles all admin-related API calls for dashboard, products, categories, orders, users, etc.
 */

import axios from 'axios';
import { API_CONFIG } from '@/config/api';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    // Debug: indicate whether token was found (do not log token value)
    // eslint-disable-next-line no-console
    console.debug('[adminApi] Authorization header will be set');
  }
  else {
    // eslint-disable-next-line no-console
    console.debug('[adminApi] No token found in localStorage');
  }
  return config;
});

// ============ DASHBOARD ============
export const adminApi = {
  // Dashboard
  getDashboard: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data.data;
  },

  // ============ PRODUCTS ============
  getAllProducts: async (page = 1, limit = 20, filters?: any) => {
    const response = await apiClient.get('/admin/products', {
      params: { page, limit, ...filters },
    });
    return response.data.data;
  },

  getProductById: async (id: string) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.data;
  },

  createProduct: async (productData: any) => {
    const response = await apiClient.post('/admin/products', productData);
    return response.data.data;
  },

  updateProduct: async (id: string, productData: any) => {
    const response = await apiClient.put(`/admin/products/${id}`, productData);
    return response.data.data;
  },

  deleteProduct: async (id: string) => {
    const response = await apiClient.delete(`/admin/products/${id}`);
    return response.data.data;
  },

  // ============ CATEGORIES ============
  getAllCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data.data;
  },

  createCategory: async (categoryData: any) => {
    const response = await apiClient.post('/admin/categories', categoryData);
    return response.data.data;
  },

  updateCategory: async (id: string, categoryData: any) => {
    const response = await apiClient.put(`/admin/categories/${id}`, categoryData);
    return response.data.data;
  },

  deleteCategory: async (id: string) => {
    const response = await apiClient.delete(`/admin/categories/${id}`);
    return response.data.data;
  },

  // ============ BRANDS ============
  getAllBrands: async () => {
    const response = await apiClient.get('/brands');
    return response.data.data;
  },

  createBrand: async (brandData: any) => {
    const response = await apiClient.post('/admin/brands', brandData);
    return response.data.data;
  },

  updateBrand: async (id: string, brandData: any) => {
    const response = await apiClient.put(`/admin/brands/${id}`, brandData);
    return response.data.data;
  },

  deleteBrand: async (id: string) => {
    const response = await apiClient.delete(`/admin/brands/${id}`);
    return response.data.data;
  },

  // ============ ORDERS ============
  getAllOrders: async (page = 1, limit = 20, filters?: any) => {
    const response = await apiClient.get('/admin/orders', {
      params: { page, limit, ...filters },
    });
    return response.data.data;
  },

  getOrderById: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data.data;
  },

  updateOrderStatus: async (id: string, status: string) => {
    const response = await apiClient.put(`/admin/orders/${id}/status`, { status });
    return response.data.data;
  },

  rejectOrder: async (id: string, rejectionReason: string) => {
    const response = await apiClient.post(`/admin/orders/${id}/reject`, { rejectionReason });
    return response.data.data;
  },

  // ============ USERS ============
  getAllUsers: async (page = 1, limit = 20, filters?: any) => {
    const response = await apiClient.get('/admin/users', {
      params: { page, limit, ...filters },
    });
    return response.data.data;
  },

  getUserById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data.data;
  },

  updateUserRole: async (id: string, role: string) => {
    const response = await apiClient.put(`/admin/users/${id}/role`, { role });
    return response.data.data;
  },

  updateUserStatus: async (id: string, isActive: boolean) => {
    const response = await apiClient.put(`/admin/users/${id}/status`, { isActive });
    return response.data.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data.data;
  },

  // ============ NEWS ============
  getAllNews: async (page = 1, limit = 20) => {
    const response = await apiClient.get('/admin/news', { params: { page, limit } });
    return response.data.data;
  },

  createNews: async (newsData: any) => {
    const response = await apiClient.post('/admin/news', newsData);
    return response.data.data;
  },

  updateNews: async (id: string, newsData: any) => {
    const response = await apiClient.put(`/admin/news/${id}`, newsData);
    return response.data.data;
  },

  publishNews: async (id: string) => {
    const response = await apiClient.put(`/admin/news/${id}/publish`);
    return response.data.data;
  },

  deleteNews: async (id: string) => {
    const response = await apiClient.delete(`/admin/news/${id}`);
    return response.data.data;
  },

  // ============ NEWSLETTER ============
  getNewsletterSubscribers: async () => {
    const response = await apiClient.get('/admin/newsletter/subscribers');
    return response.data.data;
  },

  getNewsletterUsers: async () => {
    const response = await apiClient.get('/admin/newsletter/users');
    return response.data.data;
  },

  sendNewsletter: async (payload: { subject: string; content: string; audience: 'all' | 'users' | 'subscribers' }) => {
    const response = await apiClient.post('/admin/newsletter/send', payload);
    return response.data.data;
  },

  // ============ CONTACTS ============
  getContacts: async (page = 1, limit = 20) => {
    const response = await apiClient.get('/contact', { params: { page, limit } });
    return response.data.data;
  },

  getContactById: async (id: string) => {
    const response = await apiClient.get(`/contact/${id}`);
    return response.data.data;
  },

  deleteContact: async (id: string) => {
    const response = await apiClient.delete(`/contact/${id}`);
    return response.data.data;
  },

  // ============ COUPONS ============
  getAllCoupons: async () => {
    const response = await apiClient.get('/admin/coupons');
    return response.data.data;
  },

  getCouponStats: async () => {
    const response = await apiClient.get('/admin/coupons/stats');
    return response.data.data;
  },

  createCoupon: async (data: any) => {
    const response = await apiClient.post('/admin/coupons', data);
    return response.data.data;
  },

  updateCoupon: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/coupons/${id}`, data);
    return response.data.data;
  },

  deleteCoupon: async (id: string) => {
    const response = await apiClient.delete(`/admin/coupons/${id}`);
    return response.data.data;
  },

  // ============ MEMBERSHIP ============
  getMembershipRewards: async () => {
    const response = await apiClient.get('/admin/membership/rewards');
    return response.data.data;
  },

  createMembershipReward: async (payload: any) => {
    const response = await apiClient.post('/admin/membership/rewards', payload);
    return response.data.data;
  },

  updateMembershipReward: async (id: string, payload: any) => {
    const response = await apiClient.put(`/admin/membership/rewards/${id}`, payload);
    return response.data.data;
  },

  deleteMembershipReward: async (id: string) => {
    const response = await apiClient.delete(`/admin/membership/rewards/${id}`);
    return response.data.data;
  },

  getMembershipStats: async () => {
    const response = await apiClient.get('/admin/membership/stats');
    return response.data.data;
  },

  // ============ UPLOADS ============
  uploadCategoryImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post(`/upload/category/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  uploadProductImages: async (id: string, files: File[], retainedImages: string[] = []) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    formData.append('retainedImages', JSON.stringify(retainedImages));
    const response = await apiClient.post(`/upload/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  uploadNewsThumbnail: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post(`/upload/news/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
};

export default adminApi;
