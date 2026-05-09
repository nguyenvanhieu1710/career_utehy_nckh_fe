import {
  getTokenCookie,
  getRefreshTokenCookie,
  setTokenCookie,
  logout,
} from "@/services/auth";
import { config } from "@/lib/config";
import { apiLogger } from "@/lib/logger";
import axios from "axios";

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = getTokenCookie();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Store start time for performance tracking
    (config as any).metadata = { startTime: performance.now() };

    const timestamp = new Date().toLocaleTimeString();
    apiLogger.info(`[${timestamp}] 🛫 ${config.method?.toUpperCase()} ${config.url}`);

    return config;
  },
  (error) => {
    const timestamp = new Date().toLocaleTimeString();
    apiLogger.error(`[${timestamp}] ❌ Request setup failed`, error);
    return Promise.reject(error);
  },
);

// Response interceptor - Handle errors professionally
api.interceptors.response.use(
  (response) => {
    const timestamp = new Date().toLocaleTimeString();
    const startTime = (response.config as any).metadata?.startTime;
    const duration = startTime ? performance.now() - startTime : 0;

    // Success response - log with performance info
    apiLogger.performance(
      `[${timestamp}] 🛬 ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
      duration,
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh for auth endpoints to avoid infinite loops
      if (originalRequest.url?.includes("/auth/")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshTokenCookie();

      if (refreshToken) {
        try {
          // Call refresh endpoint directly to avoid circular dependency
          const refreshResponse = await axios.post(
            `${config.api.baseUrl}/auth/refresh`,
            { refresh_token: refreshToken },
          );

          const newAccessToken = refreshResponse.data.access_token;

          // Update stored token
          setTokenCookie(newAccessToken);

          // Update authorization header for original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Process queued requests
          processQueue(null, newAccessToken);

          apiLogger.info("Token refreshed successfully");

          // Retry original request
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed - logout user
          processQueue(refreshError, null);
          apiLogger.warn("Token refresh failed, logging out user");
          logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh token - logout user only if not on public pages
        const currentPath = window.location.pathname;
        const publicPaths = [
          "/",
          "/auth/signin",
          "/auth/signup",
          "/auth/forgot-password",
        ];

        if (!publicPaths.includes(currentPath)) {
          apiLogger.warn("No refresh token available, logging out user");
          logout();
        }
        return Promise.reject(error);
      }
    }

    // Error handling with proper logging
    const timestamp = new Date().toLocaleTimeString();
    const startTime = (error.config as any)?.metadata?.startTime;
    const duration = startTime ? performance.now() - startTime : 0;

    if (error.response) {
      const { status, config: reqConfig, data } = error.response;

      apiLogger.performance(
        `[${timestamp}] ❌ ${status} ${reqConfig?.method?.toUpperCase()} ${reqConfig?.url}`,
        duration,
      );

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
      apiLogger.critical(`[${timestamp}] 🚨 Network error - no response received after ${duration.toFixed(2)}ms`, error, {
        url: error.config?.url,
        method: error.config?.method,
      });
    } else {
      // Other errors
      apiLogger.error(`[${timestamp}] ❌ Request error`, error);
    }

    return Promise.reject(error);
  },
);

export default api;
