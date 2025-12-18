export const config = {
  // API Configuration
  api: {
    baseUrl:
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1",
    timeout: 30000, // 30 seconds
  },

  // Backend Configuration
  backend: {
    baseUrl:
      process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://127.0.0.1:8000",
    uploadsPath: "/uploads",
  },

  // File Upload Configuration
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ],
    allowedImageExtensions: ["jpg", "jpeg", "png", "gif", "webp"],
  },

  // UI Configuration
  ui: {
    defaultAvatar: "/default-avatar.jpg",
    defaultCategoryAvatar: "/default-category.png",
    itemsPerPage: 10,
    maxRoleDisplay: 2,
  },

  // Development flags
  dev: {
    enableDebugLogs: process.env.NODE_ENV === "development",
    enableApiLogs: process.env.NODE_ENV === "development",
  },
} as const;

// Helper functions
export const getBackendUrl = (path: string = ""): string => {
  const baseUrl = config.backend.baseUrl;
  return path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
};

export const getUploadsUrl = (path: string = ""): string => {
  if (!path) return config.ui.defaultAvatar;

  // If path already starts with http, return as is
  if (path.startsWith("http")) return path;

  // If path starts with /uploads/, use it directly
  if (path.startsWith("/uploads/")) {
    return getBackendUrl(path);
  }

  // Otherwise, prepend uploads path
  return getBackendUrl(`${config.backend.uploadsPath}/${path}`);
};

export const debugLog = (message: string, ...args: unknown[]): void => {
  if (config.dev.enableDebugLogs) {
    console.log(`🔍 [DEBUG] ${message}`, ...args);
  }
};

export const apiLog = (message: string, ...args: unknown[]): void => {
  if (config.dev.enableApiLogs) {
    console.log(`📡 [API] ${message}`, ...args);
  }
};
