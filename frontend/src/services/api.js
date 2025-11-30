import axios from 'axios';

// Determine API URL based on environment
let API_URL = process.env.REACT_APP_API_URL;

if (!API_URL) {
  // Check if we are running on an IP address or localhost
  const hostname = window.location.hostname;
  const isIpOrLocal = /^(localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)$/.test(hostname);

  if (isIpOrLocal) {
    API_URL = window.location.origin; // Use current origin (e.g., http://140.245.9.30)
  } else {
    API_URL = window.location.origin; // Fallback to domain
  }
}

// Sanitize API_URL (remove trailing slash and /api suffix if present)
// This prevents duplicate /api/api paths since our endpoint methods already include /api
API_URL = API_URL.replace(/\/$/, '').replace(/\/api$/, '');

console.log('Using API URL:', API_URL);

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

  // Media
  getVideos: () => api.get('/api/media/videos'),
  getAudio: () => api.get('/api/media/audio'),

  // General Axios Instance (for custom calls)
  get: api.get,
  post: api.post,
  put: api.put,
  delete: api.delete,
};

export default apiService;