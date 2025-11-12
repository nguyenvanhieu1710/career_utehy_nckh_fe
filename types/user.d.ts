import { BaseModel } from './base';

export interface User extends BaseModel {
  email: string;
  username: string;
  password_hash: string;
  role: string;
  avatar_url: string;
  phone: string;
  university: string;
  major: string;
  graduation_year: string;
  experience: string;
  bio: string;
  status: string;
  roles: UserRole[];
  permissions: UserPermission[];
  job_statuses: JobStatus[];
  cv_profiles: CVProfile[];
  favorite_jobs: JobFavorite[];
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

export interface AddPermissionRequest {
  user_id: string;
  perm: string;
}

export interface AddRoleRequest {
  user_id: string;
  group_id: string;
}