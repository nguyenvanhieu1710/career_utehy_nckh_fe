import { BaseModel } from "./base";

export interface User extends BaseModel {
  email: string;
  username: string;
  fullname: string;
  birthday?: string;
  avatar_url?: string;
  phone?: string;
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
