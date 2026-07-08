import { create } from 'zustand';
import api from '../services/api';

export const useAuth = create((set) => ({
  user: null,
  loading: false,
  async login(email, password) {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      set({ user: data.user, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },
  async fetchMe() {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user });
    } catch { /* token invalid */ }
  },
  logout() {
    api.post('/auth/logout').catch(() => {});
    localStorage.clear();
    set({ user: null });
  },
}));