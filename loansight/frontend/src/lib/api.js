import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 12000,
});

export const getHealth = async () => {
  const response = await api.get('/health', {
    headers: { 'Cache-Control': 'no-cache' }
  });
  return response.data;
};

export const getFormSchema = async () => {
  const response = await api.get('/api/schema');
  return response.data;
};

export const getModelInfo = async () => {
  const response = await api.get('/api/model-info');
  return response.data;
};

export const predictLoanDefault = async (payload, signal = null) => {
  const response = await api.post('/api/predict', payload, {
    signal: signal,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
  return response.data;
};

export default api;
