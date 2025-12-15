import api from "@/cores/api";
import { GetSchema } from "@/types/base";
import { User, UserUpdate, UserCreate } from "@/types/user";

// Backend base URL for static files
const BACKEND_BASE_URL = "http://127.0.0.1:8000";

// User avatar upload response types
interface UserAvatarUploadResponse {
  status: "success";
  message: string;
  avatar_info: {
    file_url: string;
    file_path: string;
    relative_path: string;
    original_name: string;
    file_size: number;
    file_type: string;
    upload_date: string;
  };
  user: User;
}

interface UserAvatarRemoveResponse {
  status: "success";
  message: string;
  user: User;
}

export const userAPI = {
  getUsers: (filters: GetSchema) =>
    api.post<{
      total: number;
      page: number;
      max_page: number;
      row: number;
      data: User[];
    }>("/auth/get-users", filters),

  getUserById: (userId: string) =>
    api.get<{ status: string; data: User }>(`/auth/get-user/${userId}`),

  updateUser: (userId: string, data: UserUpdate) =>
    api.put<{ status: string; data: User }>(
      `/auth/update-user/${userId}`,
      data
    ),

  deleteUser: (userId: string) =>
    api.delete<{ status: string; message: string }>(
      `/auth/delete-user/${userId}`
    ),

  createUser: (data: UserCreate) =>
    api.post<{ status: string; message: string; data: User }>(
      "/auth/create-user",
      data
    ),

  // Avatar management methods
  uploadAvatar: (userId: string, file: File, optimize: boolean = true) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("optimize", optimize.toString());

    return api.post<UserAvatarUploadResponse>(
      `/auth/upload-avatar/${userId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  removeAvatar: (userId: string) =>
    api.delete<UserAvatarRemoveResponse>(`/auth/remove-avatar/${userId}`),

  // Helper method to get avatar URL with fallback
  getAvatarUrl: (user: User, defaultUrl?: string): string => {
    console.log("🔍 getAvatarUrl called with:", {
      userId: user.id,
      userName: user.username,
      avatar_url: user.avatar_url,
    });

    if (user.avatar_url) {
      let finalUrl = "";
      // If avatar_url starts with /uploads/, convert to full backend URL
      if (user.avatar_url.startsWith("/uploads/")) {
        finalUrl = `${BACKEND_BASE_URL}${user.avatar_url}`;
      } else {
        // If it's a relative path, prepend the full backend URL
        finalUrl = `${BACKEND_BASE_URL}/uploads/${user.avatar_url}`;
      }

      console.log("✅ Avatar URL generated:", finalUrl);
      return finalUrl;
    }

    // Return default avatar or fallback
    const fallbackUrl = defaultUrl || "/default-avatar.png";
    console.log("⚠️ No avatar_url, using fallback:", fallbackUrl);
    return fallbackUrl;
  },

  // Helper method to validate avatar file
  validateAvatarFile: (file: File): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type must be one of: ${allowedTypes.join(", ")}`);
    }

    // Check file name extension
    const extension = file.name.toLowerCase().split(".").pop();
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push(
        `File extension must be one of: ${allowedExtensions.join(", ")}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};
