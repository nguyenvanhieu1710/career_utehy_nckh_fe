import { getTokenCookie } from '@/services/auth';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${getTokenCookie()}`
  }
});

export default api;