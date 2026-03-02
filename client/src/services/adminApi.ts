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
    const response = await apiClient.get('/news', { params: { page, limit } });
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
};

export default adminApi;
