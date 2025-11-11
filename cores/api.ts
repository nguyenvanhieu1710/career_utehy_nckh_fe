import { getTokenCookie } from '@/services/auth';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${getTokenCookie()}`
  }
});

export default api;