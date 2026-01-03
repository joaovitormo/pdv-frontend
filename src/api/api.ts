import axios from 'axios';

const api = axios.create({
  baseURL: 'https://pdv-api-z2d3.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@PDV:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;