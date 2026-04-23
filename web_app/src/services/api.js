import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from './constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRequest = error.config?.url?.includes('/auth/');
      if (!isAuthRequest) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_ID);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const usersAPI = {
  search: (query) => api.get('/users/search', { params: { q: query } }),
  getById: (id) => api.get(`/users/${id}`),
  updateStatus: (status) => api.put('/users/status', { status }),
  getOnline: () => api.get('/users/online'),
  getAll: () => api.get('/users/all'),
};

export const contactsAPI = {
  getAll: () => api.get('/contacts'),
  getPending: () => api.get('/contacts/pending'),
  add: (contactId) => api.post('/contacts', { contactId }),
  update: (id, status) => api.put(`/contacts/${id}`, { status }),
  remove: (id) => api.delete(`/contacts/${id}`),
};

export const conversationsAPI = {
  getAll: () => api.get('/conversations'),
  getOrCreate: (participantId) => api.post('/conversations', { participantId }),
  createGroup: (name, participantIds) => api.post('/conversations/group', { name, participantIds }),
  getMessages: (id, params) => api.get(`/conversations/${id}/messages`, { params }),
  markAsRead: (id) => api.post(`/conversations/${id}/read`),
};

export const callsAPI = {
  getHistory: () => api.get('/calls/history'),
  create: (data) => api.post('/calls', data),
  updateStatus: (id, status) => api.put(`/calls/${id}`, { status }),
};

export default api;