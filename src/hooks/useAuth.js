import { create } from 'zustand';
import api from '../utils/api';

const safeParseUser = () => {
  try {
    const raw = localStorage.getItem('scholarai_user');
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    return JSON.parse(raw);
  } catch { return null; }
};

const useAuth = create((set) => ({
  user:            safeParseUser(),
  token:           localStorage.getItem('scholarai_token') || null,
  isAuthenticated: !!localStorage.getItem('scholarai_token'),

  setAuth: (token, user) => {
    localStorage.setItem('scholarai_token', token);
    localStorage.setItem('scholarai_user',  JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data.data;
    localStorage.setItem('scholarai_token', token);
    localStorage.setItem('scholarai_user',  JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
    return res.data;
  },

  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token, user } = res.data.data;
    localStorage.setItem('scholarai_token', token);
    localStorage.setItem('scholarai_user',  JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('scholarai_token');
    localStorage.removeItem('scholarai_user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));

export default useAuth;