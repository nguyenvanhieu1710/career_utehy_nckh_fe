import api from "@/cores/api";
import { config, getUploadsUrl } from "@/lib/config";
import axios from "axios";
import { GetSchema } from "@/types/base";
import {
  Category,
  CategoryCreate,
  CategoryUpdate,
  CategoryAvatarUploadResponse,
  CategoryAvatarRemoveResponse,
  PublicCategory,
  PublicCategoriesResponse,
  PublicCategoryResponse,
} from "@/types/category";

// Create a separate axios instance for public API calls (no auth required)
const publicAPI = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
});

export const categoryAPI = {
  // Public API (no authentication required)
  getPublicCategories: (limit: number = 30) =>
    publicAPI.get<PublicCategoriesResponse>(
      `/public/categories?limit=${limit}`
    ),

  getPublicCategoryById: (categoryId: string) =>
    publicAPI.get<PublicCategoryResponse>(`/public/categories/${categoryId}`),

  // Admin API (authentication required)
  getCategories: (filters: GetSchema) =>
    api.post<{
      total: number;
      page: number;
      max_page: number;
      row: number;
      data: Category[];
    }>("/category/get-categories", filters),

  getCategoryById: (categoryId: string) =>
    api.get<{ status: string; data: Category }>(
      `/category/get-category/${categoryId}`
    ),

  createCategory: (data: CategoryCreate) =>
    api.post<{ status: string; message: string; data: Category }>(
      "/category/create-category",
      data
    ),

  updateCategory: (categoryId: string, data: CategoryUpdate) =>
    api.put<{ status: string; data: Category }>(
      `/category/update-category/${categoryId}`,
      data
    ),

  deleteCategory: (categoryId: string) =>
    api.delete<{ status: string; message: string }>(
      `/category/delete-category/${categoryId}`
    ),

  uploadAvatar: (categoryId: string, file: File, optimize: boolean = true) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("optimize", optimize.toString());

    return api.post<CategoryAvatarUploadResponse>(
      `/category/upload-avatar/${categoryId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  removeAvatar: (categoryId: string) =>
    api.delete<CategoryAvatarRemoveResponse>(
      `/category/remove-avatar/${categoryId}`
    ),

  // Helper method for public categories to get avatar URL with fallback
  getPublicAvatarUrl: (category: PublicCategory): string => {
    if (category.avatar_url) {
      return getUploadsUrl(category.avatar_url);
    }

    // Return default avatar for public display
    return config.ui.defaultCategoryAvatar || "/default-category.png";
  },

  // Helper method to get avatar URL with fallback (for admin)
  getAvatarUrl: (category: Category, defaultUrl?: string): string => {
    if (category.avatar_url) {
      return getUploadsUrl(category.avatar_url);
    }

    // Return default avatar or fallback
    const fallbackUrl =
      defaultUrl || config.ui.defaultCategoryAvatar || "/default-category.png";
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
