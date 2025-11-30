import axios from 'axios';

// Determine API URL based on environment
let API_URL = process.env.REACT_APP_API_URL;

if (!API_URL) {
  // Check if we are running on an IP address or localhost
  const hostname = window.location.hostname;
  const isIpOrLocal = /^(localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)$/.test(hostname);

  if (isIpOrLocal) {
    API_URL = `${window.location.origin}/api`; // Use current origin + /api
  } else {
    API_URL = `${window.location.origin}/api`; // Fallback to domain + /api
  }
} else {
  // If it's a relative path (like /api), use it as is
  // If it's a full URL, use it as is
  // No sanitization needed
}

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
// Note: baseURL is set to '/api', so we don't prefix endpoints with /api
const apiService = {
  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  sendOtp: (data) => api.post('/auth/send-otp', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  getProfile: () => api.get('/user/profile'),

  // Tasks
  getTasks: () => api.get('/tasks'),
  createTask: (task) => api.post('/tasks', task),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),

  // Japa
  getJapaSummary: () => api.get('/japa/summary'),
  logJapa: (data) => api.post('/japa', data),
  updateDailyGoal: (goal) => api.post('/japa/goal', { daily_goal: goal }),
  getHistoryStats: () => api.get('/japa/history-stats'),
  getGlobalLeaderboard: () => api.get('/japa/leaderboard/global'),

  // Breathe
  logBreathSession: (data) => api.post('/breathe', data),

  // Media
  getVideos: () => api.get('/media/videos'),
  getAudio: () => api.get('/media/audio'),

  // General Axios Instance (for custom calls)
  get: api.get,
  post: api.post,
  put: api.put,
  delete: api.delete,
};

export default apiService;