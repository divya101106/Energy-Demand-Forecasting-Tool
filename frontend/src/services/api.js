import axios from 'axios';

// Centralized Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach demo session token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('energy_forecast_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(errorMsg));
  }
);

// API Service modules
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export const dataAPI = {
  getHistorical: async (startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get('/historical', { params });
    return response.data;
  },
};

export const forecastAPI = {
  generate: async (config) => {
    const response = await api.post('/forecast', config);
    return response.data;
  },
};

export const modelAPI = {
  getMetrics: async () => {
    const response = await api.get('/metrics');
    return response.data;
  },
  getComparison: async () => {
    const response = await api.get('/comparison');
    return response.data;
  },
  getModelInfo: async () => {
    const response = await api.get('/model');
    return response.data;
  },
};

export const anomalyAPI = {
  getAnomalies: async (type = null, severity = null) => {
    const params = {};
    if (type && type !== 'all') params.type = type;
    if (severity && severity !== 'all') params.severity = severity;
    const response = await api.get('/anomalies', { params });
    return response.data;
  },
};

export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
