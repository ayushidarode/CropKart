import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Crops API
export const cropsAPI = {
  getAllCrops: () => api.get('/crops'),
  getCropById: (id) => api.get(`/crops/${id}`),
  getFarmerProfile: (farmerId) => api.get(`/farmers/${farmerId}`),
  addCrop: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    return api.post('/crops', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateCrop: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    return api.put(`/crops/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteCrop: (id) => api.delete(`/crops/${id}`),
  getNearby: (latitude, longitude, radius) =>
    api.get('/crops/nearby', { params: { latitude, longitude, radius } }),
};

// Purchase Requests API
export const purchaseRequestsAPI = {
  getAll: () => api.get('/purchase-requests'),
  create: (data) => api.post('/purchase-requests', data),
  update: (id, data) => api.put(`/purchase-requests/${id}`, data),
  getTransportOptions: (id) => api.get(`/purchase-requests/${id}/transport-options`),
};

// Dashboard API
export const dashboardAPI = {
  farmerDashboard: () => api.get('/farmer/dashboard'),
  buyerDashboard: () => api.get('/buyer/dashboard'),
  adminDashboard: () => api.get('/admin/dashboard'),
};

// Market Prices API
export const marketPricesAPI = {
  get: (cropName) => api.get(`/market-prices/${cropName}`),
  compare: (cropId) => api.get(`/market-comparison/${cropId}`),
};

// Messages API
export const messagesAPI = {
  getThread: (cropId) => api.get(`/messages/${cropId}`),
  send: (data) => api.post('/messages', data),
};

export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  toggle: (data) => api.post('/favorites', data),
};

export const reviewsAPI = {
  create: (data) => api.post('/reviews', data),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};

export const assistantAPI = {
  query: (data) => api.post('/assistant/query', data),
};

export default api;
