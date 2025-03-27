// src/utils/api.jsx
import axios from 'axios';

// Determine the base URL based on the environment
const baseURL = import.meta.env.PROD 
  ? 'https://backend-5erg.onrender.com/api' // Direct URL to backend in production
  : '/api'; // Use the proxy in development

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to handle errors consistently
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;