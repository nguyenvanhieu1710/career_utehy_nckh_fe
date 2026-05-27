export const config = {
  // API Configuration
  api: {
    baseUrl:
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1",
    timeout: 30000, // 30 seconds
  },

  // Static Files & Uploads Configuration
  static: {
    baseUrl: process.env.NEXT_PUBLIC_STATIC_URL || "http://127.0.0.1:8000",
    uploadsPath: "/uploads",
  },

  // Chatbot Service Configuration
  chatbot: {
    baseUrl:
      process.env.NEXT_PUBLIC_CHATBOT_BASE_URL ||
      "http://127.0.0.1:8001/api/v1",
    timeout: 60000, // 60 seconds for LLM responses
  },

  // Job Recommendation Service Configuration
  recommendation: {
    baseUrl:
      process.env.NEXT_PUBLIC_RECOMMENDATION_API_BASE_URL || "http://127.0.0.1:8000",
    timeout: 30000, // 30 seconds
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
} as const;

// Helper functions
export const getStaticUrl = (path: string = ""): string => {
  const baseUrl = config.static.baseUrl;
  return path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
};

export const getUploadsUrl = (path: string = ""): string => {
  if (!path) return config.ui.defaultAvatar;

  // If path already starts with http, return as is
  if (path.startsWith("http")) return path;

  // If path starts with /uploads/, use it directly
  if (path.startsWith("/uploads/")) {
    return getStaticUrl(path);
  }

  // Otherwise, prepend uploads path
  return getStaticUrl(`${config.static.uploadsPath}/${path}`);
};
