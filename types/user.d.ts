import { BaseModel } from "./base";

export interface User extends BaseModel {
  email: string;
  username: string;
  fullname: string;
  birthday?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  gender?: string;
  unversity?: string;
  major?: string;
  graduation_year?: string;
  experience?: string;
  bio?: string;
  roles?: UserRole[];
  permissions?: UserPermission[];
}

export interface UserRole extends BaseModel {
  user_id: string;
  group_id: string;
  user?: User;
  group?: PermissionGroup;
}

export interface UserPermission extends BaseModel {
  user_id: string;
  perm: string;
  user?: User;
}

export interface UserSignin {
  email: string;
  username: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  fullname?: string;
  birthday?: string;
  phone?: string;
  address?: string;
  gender?: string;
  password?: string;
}

export interface UserCreate {
  email: string;
  username: string;
  password: string;
  fullname: string;
}

export interface AddPermissionRequest {
  user_id: string;
  perm: string;
}

export interface AddRoleRequest {
  user_id: string;
  group_id: string;
}

// Upload related types
export interface UserAvatarUploadResponse {
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

export interface UserAvatarRemoveResponse {
  status: "success";
  message: string;
  user: User;
}

// File upload types
export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UserFormData {
  email: string;
  username: string;
  fullname: string;
  password?: string;
  birthday?: string;
  phone?: string;
  address?: string;
  gender?: string;
  avatar?: File | null;
  avatar_url?: string;
}

// Avatar display types
export interface UserAvatarProps {
  user: User;
  size?: "sm" | "md" | "lg" | "xl";
  showDefault?: boolean;
  className?: string;
}

// Default avatar configuration
export const DEFAULT_USER_AVATAR = "/default-avatar.png";

// Avatar size configurations
export const AVATAR_SIZES = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
} as const;

// File upload constraints
export const USER_AVATAR_CONSTRAINTS = {
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
