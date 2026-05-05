import { create } from 'zustand';
import { authService } from '../services';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.login(email, password);
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ token, user, loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Erreur de connexion';
      set({ error: message, loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null });
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.register(data);
      set({ loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Erreur d\'enregistrement';
      set({ error: message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));
