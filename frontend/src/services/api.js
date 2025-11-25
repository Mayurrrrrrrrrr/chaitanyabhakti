import axios from 'axios';

// Use environment variable if available, otherwise default to Render backend
// This fixes the hardcoded IP issue (192.168.x.x) which breaks if your IP changes
let API_URL = process.env.REACT_APP_API_URL || 'https://chaitanyabhakti.onrender.com';

// Sanitize API_URL to remove trailing '/api' or '/' to prevent double paths like /api/api/...
API_URL = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to attach the Token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    const lang = localStorage.getItem('appLanguage');
    if (lang) {
      config.headers['Accept-Language'] = lang;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Auto-logout if token is invalid/expired
      localStorage.removeItem('token');
      // Optional: Redirect to login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Methods wrapper
const apiService = {
  // Auth
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  sendOtp: (data) => api.post('/api/auth/send-otp', data),
  verifyOtp: (data) => api.post('/api/auth/verify-otp', data),
  getProfile: () => api.get('/api/user/profile'),

  // Tasks
  getTasks: () => api.get('/api/tasks'),
  createTask: (task) => api.post('/api/tasks', task),
  updateTask: (id, data) => api.put(`/api/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/api/tasks/${id}`),

  // Japa
  getJapaSummary: () => api.get('/api/japa/summary'),
  logJapa: (data) => api.post('/api/japa', data),

  // Breathe
  logBreathSession: (data) => api.post('/api/breathe', data),

  // General Axios Instance (for custom calls)
  get: api.get,
  post: api.post,
  put: api.put,
  delete: api.delete,
};

export default apiService;