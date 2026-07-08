import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    if (err.response?.status === 401 && !isRefreshing) {
      isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/auth/refresh', { refresh: refreshToken },
          { baseURL: api.defaults.baseURL });
        localStorage.setItem('accessToken', data.access);
        isRefreshing = false;
        err.config.headers.Authorization = `Bearer ${data.access}`;
        return api(err.config);
      } catch (e) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;