import { EntityStatus } from "./status";

type UUID = string;
type DateTime = string;

export interface BaseModel {
  id: UUID;
  action_status: EntityStatus;
  created_at: DateTime;
  updated_at: DateTime;
  created_by_user_id: UUID | null;
  updated_by_user_id: UUID | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface GetSchema {
  id?: string;
  searchKeyword?: string;
  page?: number;
  row?: number;
  role_id?: string;
  status?: string;
}
