import axios from 'axios';

// Use environment variable if available, otherwise default to localhost
// This fixes the hardcoded IP issue (192.168.x.x) which breaks if your IP changes
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getProfile: () => api.get('/user/profile'),
    
    // Tasks
    getTasks: () => api.get('/tasks'),
    createTask: (task) => api.post('/tasks', task),
    updateTask: (id, data) => api.put(`/tasks/${id}`, data),
    deleteTask: (id) => api.delete(`/tasks/${id}`),

    // Japa
    getJapaSummary: () => api.get('/japa/summary'),
    logJapa: (data) => api.post('/japa', data),

    // General Axios Instance (for custom calls)
    get: api.get,
    post: api.post,
    put: api.put,
    delete: api.delete,
};

export default apiService;