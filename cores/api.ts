import { getTokenCookie } from "@/services/auth";
import { config } from "@/lib/config";
import { apiLogger } from "@/lib/logger";
import axios from "axios";

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = getTokenCookie();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log outgoing requests (info level - only in dev)
    apiLogger.info(`${config.method?.toUpperCase()} ${config.url}`);

    return config;
  },
  (error) => {
    apiLogger.error("Request setup failed", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors professionally
api.interceptors.response.use(
  (response) => {
    // Success response - log only in development
    apiLogger.debug(
      `${response.status} ${response.config.method?.toUpperCase()} ${
        response.config.url
      }`
    );
    return response;
  },
  (error) => {
    // Error handling with proper logging
    if (error.response) {
      const { status, config: reqConfig, data } = error.response;

      // Log based on error severity
      if (status >= 500) {
        // Server errors - always log (critical)
        apiLogger.critical("Server error", error, {
          url: reqConfig?.url,
          method: reqConfig?.method,
          status,
          message: data?.detail || data?.message,
        });
      } else if (status === 401) {
        // Auth errors - warning level
        apiLogger.warn("Authentication failed", {
          url: reqConfig?.url,
          method: reqConfig?.method,
        });
      } else if (status >= 400) {
        // Client errors - error level
        apiLogger.error("Request failed", error, {
          url: reqConfig?.url,
          method: reqConfig?.method,
          status,
          message: data?.detail || data?.message,
        });
      }
    } else if (error.request) {
      // Network errors - critical
      apiLogger.critical("Network error - no response received", error, {
        url: error.config?.url,
        method: error.config?.method,
      });
    } else {
      // Other errors
      apiLogger.error("Request error", error);
    }

    return Promise.reject(error);
  }
);

export default api;
