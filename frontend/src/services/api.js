import axios from 'axios';

export const baseURL = 'http://localhost:5001';

const api = axios.create({
  baseURL: `${baseURL}/api`,
});

// Set up the token interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;