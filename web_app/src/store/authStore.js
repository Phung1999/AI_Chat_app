import { create } from 'zustand';
import { authAPI } from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('chat_token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    const token = localStorage.getItem('chat_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const response = await authAPI.getProfile();
      if (response.data.success) {
        const user = response.data.data;
        set({ user, isAuthenticated: true, isLoading: false });
        initSocket(user.id);
      } else {
        localStorage.removeItem('chat_token');
        set({ isLoading: false, isAuthenticated: false });
      }
    } catch (error) {
      localStorage.removeItem('chat_token');
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const response = await authAPI.login({ email, password });
      if (response.data.success) {
        const { user, token } = response.data.data;
        localStorage.setItem('chat_token', token);
        localStorage.setItem('chat_user_id', user.id.toString());
        initSocket(user.id);
        set({ user, token, isAuthenticated: true, error: null });
        return true;
      } else {
        set({ error: response.data.error?.message || 'Login failed' });
        return false;
      }
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Login failed';
      set({ error: message });
      return false;
    }
  },

  register: async (email, password, displayName) => {
    set({ error: null });
    try {
      const response = await authAPI.register({ email, password, displayName });
      if (response.data.success) {
        const { user, token } = response.data.data;
        localStorage.setItem('chat_token', token);
        localStorage.setItem('chat_user_id', user.id.toString());
        initSocket(user.id);
        set({ user, token, isAuthenticated: true, error: null });
        return true;
      } else {
        set({ error: response.data.error?.message || 'Registration failed' });
        return false;
      }
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Registration failed';
      set({ error: message });
      return false;
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (_) {}
    disconnectSocket();
    localStorage.removeItem('chat_token');
    localStorage.removeItem('chat_user_id');
    set({ user: null, token: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;