import api from "@/cores/api";
import { config, getUploadsUrl, debugLog } from "@/lib/config";
import { GetSchema } from "@/types/base";
import {
  User,
  UserUpdate,
  UserCreate,
  UpdateUserRoles,
  AvailableRole,
  UserRolesPermissionsResponse,
  AvailableRolesResponse,
  AvailablePermissionsResponse,
  UpdateRolesResponse,
  UserAvatarUploadResponse,
  UserAvatarRemoveResponse,
} from "@/types/user";

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
    debugLog("Getting avatar URL for user:", {
      userId: user.id,
      userName: user.username,
      avatar_url: user.avatar_url,
    });

    if (user.avatar_url) {
      const finalUrl = getUploadsUrl(user.avatar_url);
      debugLog("Avatar URL generated:", finalUrl);
      return finalUrl;
    }

    // Return default avatar or fallback
    const fallbackUrl = defaultUrl || config.ui.defaultAvatar;
    debugLog("No avatar_url, using fallback:", fallbackUrl);
    return fallbackUrl;
  },

  // Helper method to validate avatar file
  validateAvatarFile: (file: File): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const { maxSize, allowedImageTypes, allowedImageExtensions } =
      config.upload;

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }

    // Check file type
    if (
      !allowedImageTypes.includes(
        file.type as (typeof allowedImageTypes)[number]
      )
    ) {
      errors.push(`File type must be one of: ${allowedImageTypes.join(", ")}`);
    }

    // Check file name extension
    const extension = file.name.toLowerCase().split(".").pop();
    if (
      !extension ||
      !allowedImageExtensions.includes(
        extension as (typeof allowedImageExtensions)[number]
      )
    ) {
      errors.push(
        `File extension must be one of: ${allowedImageExtensions.join(", ")}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Role and Permission management methods
  getUserRolesPermissions: (userId: string) =>
    api.get<UserRolesPermissionsResponse>(
      `/auth/get-user-roles-permissions/${userId}`
    ),

  updateUserRoles: (userId: string, data: UpdateUserRoles) =>
    api.put<UpdateRolesResponse>(`/auth/update-user-roles/${userId}`, data),

  getAvailableRoles: () =>
    api.get<AvailableRolesResponse>("/auth/available-roles"),

  getAvailablePermissions: () =>
    api.get<AvailablePermissionsResponse>("/auth/available-permissions"),

  // Helper method to format role names for display
  formatRoleNames: (roles: AvailableRole[]): string => {
    if (!roles || roles.length === 0) return "Chưa có vai trò";
    if (roles.length === 1) return roles[0].name;
    if (roles.length <= 3) return roles.map((r) => r.name).join(", ");
    return `${roles
      .slice(0, 2)
      .map((r) => r.name)
      .join(", ")} +${roles.length - 2} khác`;
  },

  // Helper method to check if user has specific permission
  hasPermission: (
    userPermissions: string[],
    requiredPermission: string
  ): boolean => {
    return userPermissions.includes(requiredPermission);
  },

  // Helper method to check if user has any of the required permissions
  hasAnyPermission: (
    userPermissions: string[],
    requiredPermissions: string[]
  ): boolean => {
    return requiredPermissions.some((perm) => userPermissions.includes(perm));
  },
};
