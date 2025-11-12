import { BaseModel } from './base';
import { UserRole } from './user';

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

export interface UpdateGroupRequest extends Partial<CreateGroupRequest> {}

export interface AddPermissionToGroupRequest {
  group_id: string;
  perm: string;
}

export interface RemovePermissionFromGroupRequest {
  group_id: string;
  perm: string;
}
