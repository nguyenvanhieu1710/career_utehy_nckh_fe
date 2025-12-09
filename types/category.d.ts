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
}

export interface CategoryUpdate {
  name?: string;
  description?: string;
}
