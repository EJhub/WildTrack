import axios from 'axios';

// Use correct base URL without '/api' prefix
const baseURL = 'https://backend-serg.onrender.com/api'; // Include /api in the base URL

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  timeout: 10000
});

// Add request logging for debugging
api.interceptors.request.use(
  config => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    console.log(`API Response: ${response.status}`, response.data);
    return response;
  },
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;