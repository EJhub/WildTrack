// src/utils/api.jsx
import axios from 'axios';

// Use the environment variable in production, fallback to /api in development
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true
});

export default api;