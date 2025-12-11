import { BaseModel } from "./base";
import { UserRole } from "./user";

export interface PermissionGroup extends BaseModel {
  name: string;
  description: string | null;

  // Relationships
  user_roles?: UserRole[];
  permissions?: GroupPermission[];
}

export interface GroupPermission extends BaseModel {
  group_id: string;
  perm: string;

  // Relationships
  group?: PermissionGroup;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  perms?: string[];
}

export type UpdateGroupRequest = Partial<CreateGroupRequest>;

export interface AddPermissionToGroupRequest {
  group_id: string;
  perm: string;
}

export interface RemovePermissionFromGroupRequest {
  group_id: string;
  perm: string;
}

// Alias for consistency with backend
export type Role = PermissionGroup;

// Create and Update types for API calls
export interface RoleCreate {
  name: string;
  description?: string;
  perms?: string[];
}

export type RoleUpdate = Partial<RoleCreate>;
