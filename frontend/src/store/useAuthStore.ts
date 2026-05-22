import { create } from 'zustand';
import { api } from '../utils/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<void>;
  register: (userDetails: any) => Promise<void>;
  googleLogin: (googleData: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('luxe_blooms_token') : null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response: any = await api.post('/auth/login', credentials);
      const { token, data } = response;
      localStorage.setItem('luxe_blooms_token', token);
      set({ user: data.user, token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
      throw err;
    }
  },

  register: async (userDetails) => {
    set({ isLoading: true, error: null });
    try {
      const response: any = await api.post('/auth/register', userDetails);
      const { token, data } = response;
      localStorage.setItem('luxe_blooms_token', token);
      set({ user: data.user, token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Registration failed', isLoading: false });
      throw err;
    }
  },

  googleLogin: async (googleData) => {
    set({ isLoading: true, error: null });
    try {
      const response: any = await api.post('/auth/google-login', googleData);
      const { token, data } = response;
      localStorage.setItem('luxe_blooms_token', token);
      set({ user: data.user, token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Google Login failed', isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('luxe_blooms_token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('luxe_blooms_token');
    if (!token) {
      set({ isAuthenticated: false, isLoading: false });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const response: any = await api.get('/auth/me');
      set({ user: response.data.user, token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      localStorage.removeItem('luxe_blooms_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
