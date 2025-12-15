import { BaseModel } from "./base";

export interface Category extends BaseModel {
  avatar_url?: string;
  name: string;
  parent_id?: string;
  description?: string;
}

export interface CategoryCreate {
  name: string;
  description?: string;
  avatar_url?: string;
}

export interface CategoryUpdate {
  name?: string;
  description?: string;
  avatar_url?: string;
}

// Upload related types
export interface CategoryAvatarUploadResponse {
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
  category: Category;
}

export interface CategoryAvatarRemoveResponse {
  status: "success";
  message: string;
  category: Category;
}

// File upload types
export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  avatar?: File | null;
  avatar_url?: string;
}

// Avatar display types
export interface CategoryAvatarProps {
  category: Category;
  size?: "sm" | "md" | "lg" | "xl";
  showDefault?: boolean;
  className?: string;
}

// Default avatar configuration
export const DEFAULT_CATEGORY_AVATAR = "/images/default-category.png";

// Avatar size configurations
export const AVATAR_SIZES = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
} as const;

// File upload constraints
export const CATEGORY_AVATAR_CONSTRAINTS = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
} as const;
