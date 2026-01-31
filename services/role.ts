import api from "@/cores/api";
import { GetSchema } from "@/types/base";
import {
  PermissionGroup,
  CreateGroupRequest,
  UpdateGroupRequest,
} from "@/types/permission";
import { Role } from "@/types/user";

export const roleAPI = {
  // Get all roles with pagination
  getRoles: (filters: GetSchema) =>
    api.post<{
      total: number;
      page: number;
      max_page: number;
      row: number;
      data: PermissionGroup[];
    }>("/permission/get-roles", filters),

  // Create new role
  createRole: (data: CreateGroupRequest) =>
    api.post<{ status: string; message: string; data: PermissionGroup }>(
      "/permission/create",
      data,
    ),

  // Update existing role
  updateRole: (roleId: string, data: UpdateGroupRequest) =>
    api.put<{ status: string; message: string; data: PermissionGroup }>(
      `/permission/update/${roleId}`,
      data,
    ),

  // Delete role
  deleteRole: (roleId: string) =>
    api.delete<{ status: string; message: string }>(
      `/permission/delete/${roleId}`,
    ),

  // Get all available permissions
  getAvailablePermissions: () =>
    api.get<{ status: string; data: string[] }>("/permission/get-perms"),

  // Helper methods
  formatPermissions: (permissions: string[]): string => {
    if (!permissions || permissions.length === 0) return "Không có quyền";
    if (permissions.length <= 3) return permissions.join(", ");
    return `${permissions.slice(0, 3).join(", ")} +${
      permissions.length - 3
    } khác`;
  },

  // Convert PermissionGroup to Role format
  toRole: (permGroup: PermissionGroup): Role => ({
    id: permGroup.id,
    name: permGroup.name,
    description: permGroup.description,
  }),

  // Convert array of PermissionGroups to Roles
  toRoles: (permGroups: PermissionGroup[]): Role[] => {
    return permGroups.map((group) => roleAPI.toRole(group));
  },
};
