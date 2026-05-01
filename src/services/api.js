import axios from 'axios';

const API_URL = 'https://backend-meubles-ben-youssef.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
});

// ── Intercepteur requête : inject JWT de manière sécurisée ───────────────────
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Si le navigateur bloque le localStorage (ex: Safari privé)
      console.warn("LocalStorage inaccessible");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Intercepteur réponse : gère les 401 (Token expiré) ──────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (e) {}
      
      // Ne pas rediriger si on est déjà sur la page de login/register
      const publicPages = ['/login', '/register'];
      if (!publicPages.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ════════════════════════════════════════════════════════
//  AUTHENTIFICATION
// ════════════════════════════════════════════════════════
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ════════════════════════════════════════════════════════
//  CATÉGORIES
// ════════════════════════════════════════════════════════
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),
};

// ════════════════════════════════════════════════════════
//  PRODUITS
// ════════════════════════════════════════════════════════
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/admin/products', data),
  update: (id, data) => api.put(`/admin/products/${id}`, data),
  delete: (id) => api.delete(`/admin/products/${id}`),
  getReviews: (id) => api.get(`/products/${id}/reviews`),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
};

// ════════════════════════════════════════════════════════
//  UTILISATEURS (admin)
// ════════════════════════════════════════════════════════
export const usersAPI = {
  getAll: () => api.get('/admin/users'),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  delete: (id) => api.delete(`/admin/users/${id}`),
};

// ════════════════════════════════════════════════════════
//  PANIER
// ════════════════════════════════════════════════════════
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  update: (productId, data) => api.put(`/cart/${productId}`, data),
  remove: (productId) => api.delete(`/cart/${productId}`),
  clear: () => api.delete('/cart/clear'),
};

// ════════════════════════════════════════════════════════
//  COMMANDES
// ════════════════════════════════════════════════════════
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getUserOrders: () => api.get('/orders'),
  getUserOrderById: (id) => api.get(`/orders/${id}`),
  updateUserOrder: (id, data) => api.put(`/orders/${id}`, data),
  cancelUserOrder: (id) => api.post(`/orders/${id}/cancel`),
  // Admin
  getAll: () => api.get('/admin/orders'),
  getById: (id) => api.get(`/admin/orders/${id}`),
  updateStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
};

// ════════════════════════════════════════════════════════
//  STATISTIQUES
// ════════════════════════════════════════════════════════
export const statsAPI = {
  getStats: () => api.get('/admin/stats'),
};

export default api;