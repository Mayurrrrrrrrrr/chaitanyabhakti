import axios from 'axios';

const api = axios.create({
  /**
   * 🛑 THE FIX IS HERE 🛑
   * The baseURL should JUST be your server's address, not the API path.
   * WRONG: http://localhost:5000/api
   * RIGHT: http://localhost:5000
   */
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

// Add a request interceptor to include the token
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

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Handle unauthorized access, e.g., redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;