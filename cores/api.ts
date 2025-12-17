import { getTokenCookie } from "@/services/auth";
import { config, apiLog } from "@/lib/config";
import axios from "axios";

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
});

// Interceptor để thêm token động vào mỗi request
api.interceptors.request.use(
  (config) => {
    const token = getTokenCookie();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response errors
api.interceptors.response.use(
  (response) => {
    apiLog("Response received:", {
      url: response.config?.url,
      method: response.config?.method,
      status: response.status,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      // Log lỗi để debug
      console.error("API Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: error.response.data,
      });
    }
    return Promise.reject(error);
  }
);

export default api;
